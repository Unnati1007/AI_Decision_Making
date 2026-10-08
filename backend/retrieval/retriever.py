# ============================================================
# IntelliChoice — RAG Retriever & Context Assembler
# ============================================================

import os
import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.retrieval.embedder import embed_query
from backend.retrieval.vector_store import FAISSVectorStore

logger = logging.getLogger("intellichoice.retriever")

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
VECTOR_DB_DIR = os.path.join(PROJECT_ROOT, "vector_db")

_vector_store_instance: Optional[FAISSVectorStore] = None

def get_vector_store() -> FAISSVectorStore:
    """Returns singleton instance of loaded FAISSVectorStore."""
    global _vector_store_instance
    if _vector_store_instance is None:
        store = FAISSVectorStore(dimension=384)
        if store.load(VECTOR_DB_DIR):
            _vector_store_instance = store
        else:
            logger.warning(f"Failed to load FAISS index from {VECTOR_DB_DIR}. Ingestion may be required.")
            _vector_store_instance = store
    return _vector_store_instance

def reload_vector_store() -> FAISSVectorStore:
    """Forces reload of FAISS index from disk."""
    global _vector_store_instance
    _vector_store_instance = None
    return get_vector_store()

def retrieve_context(
    query: str,
    domain: Optional[str] = None,
    top_k: int = 5,
    max_token_budget: int = 1800
) -> Tuple[str, List[Dict[str, Any]], List[Tuple[str, Dict[str, Any], float]]]:
    """
    Retrieves top K vector matches for query, filters by domain if provided,
    deduplicates chunks, formats structured context block within token budget.

    Returns:
      (context_text_block, list_of_unique_sources, raw_results)
    """
    store = get_vector_store()
    if store.total_documents == 0:
        logger.warning("Vector store is empty. Returning empty RAG context.")
        return "", [], []

    query_vec = embed_query(query)
    results = store.similarity_search_with_score(query_vec, k=top_k, domain_filter=domain)

    if not results and domain:
        # Fallback search without strict domain filter if 0 results matched domain
        logger.info(f"No results for domain '{domain}'. Retrying domain-agnostic search.")
        results = store.similarity_search_with_score(query_vec, k=top_k, domain_filter=None)

    context_chunks: List[str] = []
    sources: List[Dict[str, Any]] = []
    seen_sources = set()

    # Rule of thumb: ~4 characters per token -> 1800 tokens ≈ 7200 characters max
    max_char_limit = max_token_budget * 4
    current_char_count = 0

    for idx, (chunk_text, meta, score) in enumerate(results, 1):
        source_name = meta.get("source", "Unknown Document")
        title = meta.get("title", source_name)
        url = meta.get("url", "")
        doc_domain = meta.get("domain", "")

        header = f"[Source {idx}: {title} | Domain: {doc_domain}]"
        formatted_chunk = f"{header}\n{chunk_text}\n"

        if current_char_count + len(formatted_chunk) > max_char_limit:
            # Token budget reached
            logger.info(f"RAG context reached token limit of {max_token_budget} tokens (~{max_char_limit} chars). Truncating.")
            break

        context_chunks.append(formatted_chunk)
        current_char_count += len(formatted_chunk)

        source_key = (title, url)
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append({
                "id": f"Source-{len(sources)+1}",
                "title": title,
                "source": source_name,
                "url": url,
                "domain": doc_domain,
                "similarity_score": round(score, 4)
            })

    # Optional Live Web Search Fallback via Tavily API
    if not results or (results and results[0][2] > 1.25):
        from backend.retrieval.tavily_search import search_tavily
        logger.info(f"Local vector similarity low (or no results). Invoking Tavily Live Web Search for: '{query}'")
        web_results = search_tavily(query, max_results=3)
        for w_idx, w_res in enumerate(web_results, 1):
            w_title = w_res.get("title", "Live Web Result")
            w_content = w_res.get("content", "")
            w_url = w_res.get("url", "")
            
            header = f"[Live Web Source {w_idx}: {w_title}]"
            formatted_chunk = f"{header}\n{w_content}\n"
            
            if current_char_count + len(formatted_chunk) <= max_char_limit:
                context_chunks.append(formatted_chunk)
                current_char_count += len(formatted_chunk)
                sources.append({
                    "id": f"WebSource-{len(sources)+1}",
                    "title": w_title,
                    "source": "Tavily Live Web Search",
                    "url": w_url,
                    "domain": domain or "general",
                    "similarity_score": 0.0
                })

    context_block = "\n---\n".join(context_chunks)
    return context_block, sources, results
