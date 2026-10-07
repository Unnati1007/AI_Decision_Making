# ============================================================
# IntelliChoice — API Router for Decision System Queries
# ============================================================

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from backend.services.rag_pipeline import execute_turn_1, execute_turn_2

router = APIRouter(prefix="/api/query", tags=["Query"])

# ── Request / Response Models ──────────────────────────────
class Turn1Request(BaseModel):
    query: str = Field(..., description="User's decision question", min_length=1)
    domain: Optional[str] = Field(None, description="Optional domain override: career, finance, legal, wellbeing")

class MCQAnswerItem(BaseModel):
    id: Optional[str] = None
    question: Optional[str] = None
    selected_option: str

class Turn2Request(BaseModel):
    query: str = Field(..., description="Original decision query")
    domain: str = Field(..., description="Target domain: career, finance, legal, wellbeing")
    mcq_answers: List[MCQAnswerItem]
    context_sources: Optional[List[Dict[str, Any]]] = None

# ── Endpoints ──────────────────────────────────────────────
@router.post("/turn1")
def handle_turn_1(payload: Turn1Request):
    """
    Turn 1: Runs 4-layer Guard check, domain classification, RAG retrieval,
    and returns clarifying MCQs + retrieved sources.
    """
    result = execute_turn_1(query=payload.query, domain_override=payload.domain)
    return result

@router.post("/turn2")
def handle_turn_2(payload: Turn2Request):
    """
    Turn 2: Accepts original query, domain, and user's MCQ selections to generate
    final structured decision recommendation, tradeoffs, action plan, and simulation.
    """
    mcq_dicts = [item.model_dump() for item in payload.mcq_answers]
    result = execute_turn_2(
        query=payload.query,
        domain=payload.domain,
        mcq_answers=mcq_dicts,
        context_sources=payload.context_sources
    )
    return result

# Backward compatibility single-turn endpoint
@router.post("")
def handle_legacy_query(payload: Dict[str, Any] = Body(...)):
    user_query = payload.get("query", "")
    domain = payload.get("domain")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query string is required")
    return execute_turn_1(query=user_query, domain_override=domain)