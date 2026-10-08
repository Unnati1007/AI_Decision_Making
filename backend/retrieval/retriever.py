# ============================================================
# IntelliChoice — RAG Retriever & Context Assembler
# ============================================================

import os
import logging
from typing import List, Dict, Any, Tuple, Optional
from backend.retrieval.embedder import embed_query
from backend.retrieval.vector_store import FAISSVectorStore

from backend.config import (
    TAVILY_TRIGGER_THRESHOLD,
    RELEVANCE_THRESHOLD,
    MAX_TOKEN_BUDGET,
    TOP_K_DEFAULT,
    MAX_CHUNKS_PER_FILE,
    TAVILY_API_KEY
)

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
    top_k: int = TOP_K_DEFAULT,
    max_token_budget: int = MAX_TOKEN_BUDGET,
    max_chunks_per_file: int = MAX_CHUNKS_PER_FILE
) -> Tuple[str, List[Dict[str, Any]], List[Tuple[str, Dict[str, Any], float]]]:
    """
    Retrieves top vector matches for query, filters by domain if provided,
    enforces MAX_CHUNKS_PER_FILE per source file, backfilling from next top candidates.

    Returns:
      (context_text_block, list_of_unique_sources, filtered_raw_results)
    """
    store = get_vector_store()
    if store.total_documents == 0:
        logger.warning("Vector store is empty. Returning empty RAG context.")
        return "", [], []

    query_vec = embed_query(query)
    # Over-fetch up to top_k * 5 candidates to allow backfilling when files exceed max_chunks_per_file
    overfetch_k = max(top_k * 5, 20)
    raw_results = store.similarity_search_with_score(query_vec, k=overfetch_k, domain_filter=domain)

    if not raw_results and domain:
        logger.info(f"No results for domain '{domain}'. Retrying domain-agnostic search.")
        raw_results = store.similarity_search_with_score(query_vec, k=overfetch_k, domain_filter=None)

    # Apply MAX_CHUNKS_PER_FILE filtering and backfill to reach top_k
    filtered_results: List[Tuple[str, Dict[str, Any], float]] = []
    file_chunk_counts: Dict[str, int] = {}

    for chunk_text, meta, score in raw_results:
        source_file = meta.get("source_file", meta.get("title", "unknown"))
        count = file_chunk_counts.get(source_file, 0)
        if count >= max_chunks_per_file:
            # Skip this chunk because source file reached limit
            continue
        
        file_chunk_counts[source_file] = count + 1
        filtered_results.append((chunk_text, meta, score))
        if len(filtered_results) >= top_k:
            break

    # Check relevance threshold (Placeholder: RELEVANCE_THRESHOLD = 0.20)
    best_score = filtered_results[0][2] if filtered_results else 0.0

    context_chunks: List[str] = []
    sources: List[Dict[str, Any]] = []
    seen_sources = set()

    max_char_limit = max_token_budget * 4
    current_char_count = 0

    if best_score >= RELEVANCE_THRESHOLD:
        for idx, (chunk_text, meta, score) in enumerate(filtered_results, 1):
            source_name = meta.get("source", "Unknown Document")
            title = meta.get("title", source_name)
            url = meta.get("url", "").strip()
            doc_domain = meta.get("domain", "")

            header = f"[Source {idx}: {title} | Domain: {doc_domain}]"
            formatted_chunk = f"{header}\n{chunk_text}\n"

            if current_char_count + len(formatted_chunk) > max_char_limit:
                logger.info(f"RAG context reached token limit. Truncating.")
                break

            context_chunks.append(formatted_chunk)
            current_char_count += len(formatted_chunk)

            source_key = (title, url)
            if source_key not in seen_sources:
                seen_sources.add(source_key)
                src_item = {
                    "id": f"Source-{len(sources)+1}",
                    "title": title,
                    "domain": doc_domain,
                    "similarity_score": round(score, 4)
                }
                # Rule B4: Include url ONLY if non-empty; never generate a URL
                if url:
                    src_item["url"] = url
                    src_item["source"] = source_name
                sources.append(src_item)

    # Optional Live Web Search Fallback via Tavily API if score < TAVILY_TRIGGER_THRESHOLD or score < RELEVANCE_THRESHOLD
    if (best_score < RELEVANCE_THRESHOLD or best_score < TAVILY_TRIGGER_THRESHOLD) and TAVILY_API_KEY:
        try:
            from backend.retrieval.tavily_search import search_tavily
            logger.info(f"Local vector similarity low ({best_score:.4f}). Invoking Tavily Web Search.")
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
                    src_item = {
                        "id": f"WebSource-{len(sources)+1}",
                        "title": w_title,
                        "source": "Tavily Live Web Search",
                        "domain": domain or "general",
                        "similarity_score": 0.0
                    }
                    if w_url:
                        src_item["url"] = w_url
                    sources.append(src_item)
        except Exception as e:
            logger.warning(f"Tavily fallback search failed or unconfigured: {e}")

    context_block = "\n---\n".join(context_chunks)
    return context_block, sources, filtered_results
