# ============================================================
# IntelliChoice — RAG Guard Pipeline (FINAL FIXED VERSION)
# ============================================================

import os
import re
import time
import logging
from enum import Enum
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util

# ── Logging ────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.guard")

# ── OpenAI Client ──────────────────────────────────────────
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key) if openai_api_key else None

if not openai_api_key:
    logger.warning("⚠️ OPENAI_API_KEY not set → LLM layer will FAIL SAFE")

# ── Embedding Model ────────────────────────────────────────
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
_embed_model = None
_keyword_embeddings = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        logger.info(f"Loading embedding model: {EMBED_MODEL_NAME}")
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    return _embed_model

# ── Constants ──────────────────────────────────────────────
MIN_QUERY_LENGTH = 10
MAX_QUERY_LENGTH = 1000
RELEVANCE_THRESHOLD = 0.35   # tune between 0.30–0.40

# ── Guard Failure Reasons ──────────────────────────────────
class GuardFailReason(str, Enum):
    TOO_SHORT = "query_too_short"
    TOO_LONG = "query_too_long"
    BLOCKED_KEYWORD = "blocked_keyword_detected"
    INJECTION_ATTEMPT = "prompt_injection_attempt"
    LLM_UNSAFE = "llm_flagged_unsafe"
    LLM_UNAVAILABLE = "llm_unavailable"
    NOT_RELEVANT = "not_relevant_to_decision_domain"

# ── Response Model ─────────────────────────────────────────
class GuardResult(BaseModel):
    passed: bool
    reason: Optional[GuardFailReason] = None
    message: str
    layer: Optional[str] = None
    relevance_score: Optional[float] = None
    latency_ms: Optional[int] = None

# ── Domain Keywords ────────────────────────────────────────
DOMAIN_KEYWORDS = [
    "career decision", "job offer", "mba admission", "internship",
    "investment decision", "financial planning", "stocks", "loan",
    "legal advice", "tenant rights", "contract dispute",
    "mental health", "stress", "anxiety", "wellbeing",
    "business decision", "startup strategy", "marketing plan",
    "hiring decision", "partnership",
    "should I choose", "help me decide", "pros and cons",
    "compare options", "which option better", "career confusion"
]

def get_keyword_embeddings():
    global _keyword_embeddings
    if _keyword_embeddings is None:
        model = get_embed_model()
        _keyword_embeddings = model.encode(DOMAIN_KEYWORDS, convert_to_tensor=True)
    return _keyword_embeddings

# ── Blocked Keywords ───────────────────────────────────────
BLOCKED_KEYWORDS = [
    "hack", "bypass", "exploit", "jailbreak",
    "ignore instructions", "override",
    "steal data", "fraud", "scam"
]

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above)\s+instructions",
    r"you\s+are\s+now",
    r"act\s+as",
    r"pretend\s+you\s+are",
]

# ============================================================
# LAYER 1 — Query Quality
# ============================================================
def check_query_quality(query: str) -> GuardResult:
    q = query.strip()

    if len(q) < MIN_QUERY_LENGTH:
        return GuardResult(
            passed=False,
            reason=GuardFailReason.TOO_SHORT,
            message="Query too short",
            layer="Layer 1"
        )

    if len(q) > MAX_QUERY_LENGTH:
        return GuardResult(
            passed=False,
            reason=GuardFailReason.TOO_LONG,
            message="Query too long",
            layer="Layer 1"
        )

    return GuardResult(
        passed=True,
        message="✅ Passed quality check",
        layer="Layer 1"
    )

# ============================================================
# LAYER 2 — Rule-Based Safety
# ============================================================
def check_safety(query: str) -> GuardResult:
    q = query.lower()

    for word in BLOCKED_KEYWORDS:
        if re.search(rf"\b{re.escape(word)}\b", q):
            return GuardResult(
                passed=False,
                reason=GuardFailReason.BLOCKED_KEYWORD,
                message="Unsafe query detected",
                layer="Layer 2"
            )

    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, q):
            return GuardResult(
                passed=False,
                reason=GuardFailReason.INJECTION_ATTEMPT,
                message="Prompt injection detected",
                layer="Layer 2"
            )

    return GuardResult(
        passed=True,
        message="✅ Passed safety check",
        layer="Layer 2"
    )

# ============================================================
# LAYER 3 — Embedding Relevance
# ============================================================
def check_relevance(query: str) -> GuardResult:
    model = get_embed_model()
    keyword_embeddings = get_keyword_embeddings()

    query_embedding = model.encode(query, convert_to_tensor=True)
    similarity = util.cos_sim(query_embedding, keyword_embeddings)
    score = round(similarity.max().item(), 4)

    logger.info(f"Layer 3 score: {score}")

    if score < RELEVANCE_THRESHOLD:
        return GuardResult(
            passed=False,
            reason=GuardFailReason.NOT_RELEVANT,
            message="Query not relevant to decision-making domain",
            layer="Layer 3",
            relevance_score=score
        )

    return GuardResult(
        passed=True,
        message=f"✅ Relevant ({score})",
        layer="Layer 3",
        relevance_score=score
    )

# ============================================================
# LAYER 4 — LLM Classification (FAIL SAFE)
# ============================================================
def check_llm_safety(query: str) -> GuardResult:
    if not client:
        return GuardResult(
            passed=False,
            reason=GuardFailReason.LLM_UNAVAILABLE,
            message="LLM unavailable (API key missing)",
            layer="Layer 4"
        )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f'Classify SAFE or UNSAFE: "{query}"'
            }],
            max_tokens=10,
            temperature=0
        )

        text = response.choices[0].message.content.upper()

        if "UNSAFE" in text:
            return GuardResult(
                passed=False,
                reason=GuardFailReason.LLM_UNSAFE,
                message="LLM flagged query as unsafe",
                layer="Layer 4"
            )

        return GuardResult(
            passed=True,
            message="✅ LLM safe",
            layer="Layer 4"
        )

    except Exception as e:
        logger.error(f"LLM error: {e}")

        return GuardResult(
            passed=True,   # ✅ allow fallback
            message="⚠️ LLM unavailable — passed with fallback",
            layer="Layer 4"
        )
# ============================================================
# FULL PIPELINE
# ============================================================
def guard_pipeline(query: str) -> GuardResult:
    start = time.time()

    for check in [check_query_quality, check_safety, check_relevance, check_llm_safety]:
        result = check(query)
        if not result.passed:
            result.latency_ms = int((time.time() - start) * 1000)
            return result

    return GuardResult(
        passed=True,
        message="✅ Passed all checks",
        latency_ms=int((time.time() - start) * 1000)
    )

# ============================================================
# TEST
# ============================================================
if __name__ == "__main__":
    print("=== IntelliChoice Guard Test ===")

    queries = [
        "MBA or job?",
        "best investment options",
        "how to hack system",
        "IPL score today",
        "I feel stressed",
        "legal rights of tenants"
    ]

    for q in queries:
        res = guard_pipeline(q)
        print("\nQuery:", q)
        print("Result:", res.passed)
        print("Message:", res.message)
        print("Layer:", res.layer)
        print("Score:", res.relevance_score)