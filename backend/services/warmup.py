# ============================================================
# IntelliChoice — System Warmup & Pre-Initialization Service
# ============================================================

import time
import logging

logger = logging.getLogger("intellichoice.warmup")

def prewarm_system():
    """
    Pre-warms and caches all heavy models, vector indices, and embeddings into memory.
    Pre-loads embedding models, domain prototypes, and vector stores, recording initialization time.
    """
    logger.info("🔥 Starting IntelliChoice System Pre-Warm...")
    t0 = time.time()

    try:
        # 1. Preload SentenceTransformer & Guard embeddings
        from backend.services.guard import get_embed_model, get_keyword_embeddings
        embed_model = get_embed_model()
        _ = get_keyword_embeddings()
        logger.info(f"  [1/4] Embedding model & Guard keywords cached in {time.time() - t0:.2f}s")
    except Exception as e:
        logger.warning(f"  [1/4] Guard pre-warm warning: {e}")

    t1 = time.time()
    try:
        # 2. Preload Domain Router Prototypes
        from backend.services.domain_router import _get_prototype_vectors
        _ = _get_prototype_vectors()
        logger.info(f"  [2/4] Domain router prototypes cached in {time.time() - t1:.2f}s")
    except Exception as e:
        logger.warning(f"  [2/4] Domain router pre-warm warning: {e}")

    t2 = time.time()
    try:
        # 3. Preload FAISS Vector Store Index
        from backend.retrieval.retriever import get_vector_store
        store = get_vector_store()
        logger.info(f"  [3/4] FAISS Vector Store ({store.total_documents} chunks) cached in {time.time() - t2:.2f}s")
    except Exception as e:
        logger.warning(f"  [3/4] FAISS pre-warm warning: {e}")

    t3 = time.time()
    try:
        # 4. Optional dry-run dummy query to ensure full pipeline is hot
        from backend.retrieval.retriever import retrieve_context
        _ = retrieve_context("health check query", domain="career", top_k=1)
        logger.info(f"  [4/4] Pipeline dry-run completed in {time.time() - t3:.2f}s")
    except Exception as e:
        logger.warning(f"  [4/4] Pipeline dry-run warning: {e}")

    total_warm_time = time.time() - t0
    logger.info(f"✅ IntelliChoice Pre-Warm Complete in {total_warm_time:.2f}s.")
    return True

if __name__ == "__main__":
    prewarm_system()
