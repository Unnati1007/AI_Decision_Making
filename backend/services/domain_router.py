# ============================================================
# IntelliChoice — Semantic Multi-Lingual Domain Router
# ============================================================

import logging
import numpy as np
from typing import Dict
from backend.retrieval.embedder import embed_query
from backend.config import DOMAIN_ROUTER_THRESHOLD

logger = logging.getLogger("intellichoice.domain_router")

DOMAIN_PROTOTYPES: Dict[str, list[str]] = {
    "career": [
        "Career decision guidance job switch salary negotiation promotion resume campus placement software engineering data analyst MBA vs job startup vs corporate PIP layoff work experience notice period IT services product company freelancing",
        "Mujhe job switch karni hai salary negotiation notice period campus placement interview preparation performance plan career guidance non tech to tech transition"
    ],
    "finance": [
        "Personal finance investment stocks mutual funds Income Tax Act EPF savings account fixed deposit home loan credit card wealth management SIP interest rates tax filing",
        "Paise investment savings stocks tax bachat loan SIP mutual funds tax filing income tax return financial planning"
    ],
    "legal": [
        "Legal rights court proceedings FIR police complaint tenant landlord dispute criminal law civil litigation consumer court property registration legal notice advocate lawyer",
        "Kanooni salah court case FIR police property law legal notice advocate lawyer consumer court rights dispute"
    ],
    "wellbeing": [
        "Mental health depression anxiety physical health fitness exercise diet nutrition sleep quality stress management medical doctor workout routine knee pain joint pain",
        "Sehat ghutne ka dard mental stress depression workout exercise doctor diet physical health tension fever disease"
    ]
}

_prototype_vectors = None

def _get_prototype_vectors():
    global _prototype_vectors
    if _prototype_vectors is None:
        logger.info("Initializing domain prototype vectors for semantic routing...")
        _prototype_vectors = {}
        for domain, texts in DOMAIN_PROTOTYPES.items():
            vecs = [embed_query(t) for t in texts]
            avg_vec = np.mean(vecs, axis=0)
            norm = np.linalg.norm(avg_vec)
            if norm > 0:
                avg_vec = avg_vec / norm
            _prototype_vectors[domain] = avg_vec
    return _prototype_vectors

def detect_domain(query: str) -> str:
    """
    Semantic multi-lingual domain router.
    Computes cosine similarity between query embedding and domain prototype embeddings.
    Handles English, Hinglish, and Hindi queries cleanly.
    """
    if not query or len(query.strip()) < 3:
        return "unknown"

    q_vec = embed_query(query)
    prototypes = _get_prototype_vectors()

    best_domain = "unknown"
    best_score = -1.0

    for domain, proto_vec in prototypes.items():
        score = float(np.dot(q_vec, proto_vec))
        if score > best_score:
            best_score = score
            best_domain = domain

    # Cutoff if query similarity to all domain prototypes is below threshold
    if best_score < DOMAIN_ROUTER_THRESHOLD:
        return "unknown"

    return best_domain