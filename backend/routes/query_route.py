# ============================================================
# IntelliChoice — API Router for Decision System Queries
# ============================================================

import os
import re
import yaml
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field

from backend.config import DATA_DIR
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
    from backend.services.rag_pipeline import execute_turn_1
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
    from backend.services.rag_pipeline import execute_turn_2
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
    from backend.services.rag_pipeline import execute_turn_1
    user_query = payload.get("query", "")
    domain = payload.get("domain")
    session_id = payload.get("session_id")
    if not user_query:
        raise HTTPException(status_code=400, detail="Query string is required")
    return execute_turn_1(query=user_query, domain_override=domain, session_id=session_id)

@router.get("/source-document")
def get_source_document(path: Optional[str] = None, title: Optional[str] = None):
    """
    Returns markdown content and metadata of a corpus source document
    so users can read the referenced framework, textbook excerpt, or policy.
    """
    target_file = None
    data_dir_path = Path(DATA_DIR).resolve()

    if path:
        clean_path = path.strip().replace("\\", "/").lstrip("/")
        candidate = (data_dir_path / clean_path).resolve()
        if candidate.is_relative_to(data_dir_path) and candidate.is_file():
            target_file = candidate

    if not target_file and title:
        norm_title = title.lower().strip()
        for root, _, files in os.walk(data_dir_path):
            for f in files:
                if f.endswith(".md"):
                    fp = Path(root) / f
                    if f.lower().replace(".md", "").replace("_", " ") in norm_title or norm_title in f.lower().replace("_", " "):
                        target_file = fp
                        break
                    try:
                        with open(fp, "r", encoding="utf-8", errors="ignore") as fh:
                            head = fh.read(1024)
                        m = re.search(r"^title:\s*[\"']?(.*?)[\"']?\s*$", head, re.MULTILINE)
                        if m and m.group(1).strip().lower() == norm_title:
                            target_file = fp
                            break
                    except Exception:
                        pass
            if target_file:
                break

    if not target_file or not target_file.is_file():
        raise HTTPException(status_code=404, detail="Source document not found")

    try:
        with open(target_file, "r", encoding="utf-8", errors="ignore") as fh:
            raw_text = fh.read()

        meta = {}
        body = raw_text
        yaml_match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$", raw_text, re.DOTALL)
        if yaml_match:
            try:
                parsed = yaml.safe_load(yaml_match.group(1))
                if isinstance(parsed, dict):
                    meta = parsed
            except Exception:
                pass
            body = yaml_match.group(2).strip()

        if len(body) > 15000:
            body = body[:15000] + "\n\n*(Full textbook content truncated for display. Refer to the official textbook link for the complete text.)*"

        return {
            "success": True,
            "title": meta.get("title", target_file.stem.replace("_", " ").title()),
            "url": meta.get("url", ""),
            "domain": meta.get("domain", ""),
            "source_type": meta.get("source_type", "ai_curated"),
            "source_file": str(target_file.relative_to(data_dir_path)).replace("\\", "/"),
            "content": body
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read source document: {str(e)}")