# ============================================================
# IntelliChoice — API Router for Decision System Queries
# ============================================================

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from backend.services.rag_pipeline import execute_turn_1, execute_turn_2
from backend.services.session_manager import session_manager

router = APIRouter(prefix="/api/query", tags=["Query"])

# ── Request / Response Models ──────────────────────────────
class Turn1Request(BaseModel):
    query: str = Field(..., description="User's decision question", min_length=1)
    domain: Optional[str] = Field(None, description="Optional domain override: career, finance, legal, wellbeing")
    session_id: Optional[str] = Field(None, description="Active session ID for context persistence")

class MCQAnswerItem(BaseModel):
    id: Optional[str] = None
    question: Optional[str] = None
    selected_option: str

class Turn2Request(BaseModel):
    query: str = Field(..., description="Original decision query")
    domain: str = Field(..., description="Target domain: career, finance, legal, wellbeing")
    mcq_answers: List[MCQAnswerItem]
    context_sources: Optional[List[Dict[str, Any]]] = None
    session_id: Optional[str] = Field(None, description="Active session ID for context reuse")

# ── Endpoints ──────────────────────────────────────────────
@router.post("/turn1")
def handle_turn_1(payload: Turn1Request):
    """
    Turn 1: Runs 4-layer Guard check, domain classification, RAG retrieval,
    binds to session memory, and returns clarifying MCQs + retrieved sources.
    """
    result = execute_turn_1(
        query=payload.query,
        domain_override=payload.domain,
        session_id=payload.session_id
    )
    return result

@router.post("/turn2")
def handle_turn_2(payload: Turn2Request):
    """
    Turn 2: Accepts original query, domain, and user's MCQ selections to generate
    final structured decision recommendation, leveraging cached session context.
    """
    mcq_dicts = [item.model_dump() for item in payload.mcq_answers]
    result = execute_turn_2(
        query=payload.query,
        domain=payload.domain,
        mcq_answers=mcq_dicts,
        session_id=payload.session_id
    )
    return result

@router.get("/session/{session_id}")
def get_session_state(session_id: str):
    """Retrieves session state, history, and status."""
    sess = session_manager.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return {
        "success": True,
        "session_id": sess.session_id,
        "domain": sess.domain,
        "initial_query": sess.initial_query,
        "history": sess.conversation_history,
        "has_decision": sess.final_decision is not None
    }

@router.delete("/session/{session_id}")
def reset_session(session_id: str):
    """Deletes/resets active session memory."""
    deleted = session_manager.delete_session(session_id)
    return {"success": True, "deleted": deleted, "session_id": session_id}

# Backward compatibility single-turn endpoint
@router.post("")
def handle_legacy_query(payload: Dict[str, Any] = Body(...)):
    user_query = payload.get("query", "")
    domain = payload.get("domain")
    session_id = payload.get("session_id")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query string is required")
    return execute_turn_1(query=user_query, domain_override=domain, session_id=session_id)