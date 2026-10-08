# ============================================================
# IntelliChoice — Embedding Generator Singleton
# ============================================================

import logging
import numpy as np
from sentence_transformers import SentenceTransformer
from backend.config import EMBEDDING_MODEL

logger = logging.getLogger("intellichoice.embedder")

_embedder_model = None

def get_embedder() -> SentenceTransformer:
    """Returns the single shared instance of SentenceTransformer model."""
    global _embedder_model
    if _embedder_model is None:
        logger.info(f"Loading SentenceTransformer model: {EMBEDDING_MODEL}")
        _embedder_model = SentenceTransformer(EMBEDDING_MODEL)
    return _embedder_model

def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Generates 384-dimensional normalized float32 embeddings for a list of strings.
    L2 normalized vectors allow Euclidean (L2) distance in FAISS to behave monotonically
    equivalent to cosine similarity.
    """
    model = get_embedder()
    embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
    return embeddings.astype(np.float32)

def embed_query(query: str) -> np.ndarray:
    """Generates 384-dimensional normalized embedding vector for a single query."""
    embeddings = embed_texts([query])
    return embeddings[0]
