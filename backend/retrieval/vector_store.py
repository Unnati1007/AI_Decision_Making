# ============================================================
# IntelliChoice — FAISS Vector Store Manager
# ============================================================

import os
import pickle
import logging
import numpy as np
import faiss
from typing import List, Dict, Any, Optional, Tuple

logger = logging.getLogger("intellichoice.vector_store")

INDEX_FILENAME = "faiss_index.bin"
METADATA_FILENAME = "metadata.pkl"

class FAISSVectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        # Flat L2 index over normalized vectors (L2 distance on normalized vectors = 2 * (1 - cosine_similarity))
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []

    @property
    def total_documents(self) -> int:
        return self.index.ntotal

    def add_documents(self, chunks: List[str], embeddings: np.ndarray, metadatas: List[Dict[str, Any]]):
        """Adds text chunks, vector embeddings, and metadata dictionaries to the index."""
        if len(chunks) != len(embeddings) or len(chunks) != len(metadatas):
            raise ValueError("Lengths of chunks, embeddings, and metadatas must match.")
        
        if embeddings.dtype != np.float32:
            embeddings = embeddings.astype(np.float32)

        self.index.add(embeddings)
        self.chunks.extend(chunks)
        self.metadatas.extend(metadatas)
        logger.info(f"Added {len(chunks)} chunks to FAISS index. Total index size: {self.index.ntotal}")

    def save(self, directory: str):
        """Persists the FAISS index binary and metadata pkl to specified directory."""
        os.makedirs(directory, exist_ok=True)
        index_path = os.path.join(directory, INDEX_FILENAME)
        metadata_path = os.path.join(directory, METADATA_FILENAME)

        faiss.write_index(self.index, index_path)
        with open(metadata_path, "wb") as f:
            pickle.dump({"chunks": self.chunks, "metadatas": self.metadatas, "dimension": self.dimension}, f)

        logger.info(f"Saved FAISS index ({self.index.ntotal} items) to {directory}")

    def load(self, directory: str) -> bool:
        """Loads FAISS index binary and metadata pkl from directory."""
        index_path = os.path.join(directory, INDEX_FILENAME)
        metadata_path = os.path.join(directory, METADATA_FILENAME)

        if not (os.path.exists(index_path) and os.path.exists(metadata_path)):
            logger.warning(f"Vector store files not found in {directory}")
            return False

        try:
            self.index = faiss.read_index(index_path)
            with open(metadata_path, "rb") as f:
                data = pickle.load(f)
                self.chunks = data.get("chunks", [])
                self.metadatas = data.get("metadatas", [])
                self.dimension = data.get("dimension", 384)
            logger.info(f"Successfully loaded FAISS index with {self.index.ntotal} vectors from {directory}")
            return True
        except Exception as e:
            logger.error(f"Error loading vector store from {directory}: {e}")
            return False

    def similarity_search_with_score(
        self,
        query_vector: np.ndarray,
        k: int = 5,
        domain_filter: Optional[str] = None
    ) -> List[Tuple[str, Dict[str, Any], float]]:
        """
        Performs nearest-neighbor search. Returns list of (chunk_text, metadata, L2_distance_score).
        If domain_filter is supplied, over-fetches and filters by domain.
        """
        if self.index.ntotal == 0:
            return []

        if query_vector.ndim == 1:
            query_vector = np.expand_dims(query_vector, axis=0)

        if query_vector.dtype != np.float32:
            query_vector = query_vector.astype(np.float32)

        # Over-fetch to allow post-filtering if domain is specified
        fetch_k = min(self.index.ntotal, k * 5 if domain_filter else k)
        distances, indices = self.index.search(query_vector, fetch_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            meta = self.metadatas[idx]
            if domain_filter and meta.get("domain", "").lower() != domain_filter.lower():
                continue
            
            chunk = self.chunks[idx]
            results.append((chunk, meta, float(dist)))
            if len(results) >= k:
                break

        return results
