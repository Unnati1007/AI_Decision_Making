# ============================================================
# IntelliChoice — In-Memory Session Memory Manager (Section 6.5)
# ============================================================

import time
import uuid
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

logger = logging.getLogger("intellichoice.session")

DEFAULT_SESSION_TTL_SECONDS = 1800  # 30 minutes TTL

class SessionState(BaseModel):
    session_id: str
    domain: Optional[str] = None
    initial_query: Optional[str] = None
    created_at: float = Field(default_factory=time.time)
    last_accessed_at: float = Field(default_factory=time.time)
    
    # Turn 1 Context Cache
    turn1_context: Optional[str] = None
    turn1_sources: List[Dict[str, Any]] = Field(default_factory=list)
    turn1_raw_results: List[Any] = Field(default_factory=list)
    turn1_mcqs: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Turn 2 State & History
    mcq_answers: List[Dict[str, Any]] = Field(default_factory=list)
    final_decision: Optional[Dict[str, Any]] = None
    conversation_history: List[Dict[str, str]] = Field(default_factory=list)

    def is_expired(self, ttl_seconds: int = DEFAULT_SESSION_TTL_SECONDS) -> bool:
        return (time.time() - self.last_accessed_at) > ttl_seconds

    def touch(self):
        self.last_accessed_at = time.time()


class SessionManager:
    """
    Lightweight, thread-safe in-memory session store with automatic TTL expiration.
    Eliminates redundant database/vector retrievals between Turn 1 and Turn 2.
    """
    def __init__(self, ttl_seconds: int = DEFAULT_SESSION_TTL_SECONDS):
        self._sessions: Dict[str, SessionState] = {}
        self.ttl_seconds = ttl_seconds

    def _cleanup_expired(self):
        now = time.time()
        expired_keys = [
            sid for sid, s in self._sessions.items()
            if (now - s.last_accessed_at) > self.ttl_seconds
        ]
        for sid in expired_keys:
            del self._sessions[sid]
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired decision sessions.")

    def get_or_create_session(self, session_id: Optional[str] = None, domain: Optional[str] = None) -> SessionState:
        self._cleanup_expired()
        
        if session_id and session_id in self._sessions:
            session = self._sessions[session_id]
            if not session.is_expired(self.ttl_seconds):
                session.touch()
                if domain:
                    session.domain = domain
                return session

        # Create new session
        new_sid = session_id if (session_id and len(session_id.strip()) > 0) else f"sess_{uuid.uuid4().hex[:12]}"
        session = SessionState(
            session_id=new_sid,
            domain=domain
        )
        self._sessions[new_sid] = session
        logger.info(f"Initialized new decision session: {new_sid} (domain={domain})")
        return session

    def get_session(self, session_id: str) -> Optional[SessionState]:
        self._cleanup_expired()
        session = self._sessions.get(session_id)
        if session:
            if session.is_expired(self.ttl_seconds):
                del self._sessions[session_id]
                return None
            session.touch()
            return session
        return None

    def store_turn_1(
        self,
        session_id: str,
        query: str,
        domain: str,
        mcqs: List[Dict[str, Any]],
        sources: List[Dict[str, Any]],
        raw_results: List[Any],
        rag_context: str
    ) -> SessionState:
        session = self.get_or_create_session(session_id, domain=domain)
        session.initial_query = query
        session.domain = domain
        session.turn1_mcqs = mcqs
        session.turn1_sources = sources
        session.turn1_raw_results = raw_results
        session.turn1_context = rag_context
        session.conversation_history.append({"role": "user", "content": query})
        session.touch()
        return session

    def store_turn_2(
        self,
        session_id: str,
        mcq_answers: List[Dict[str, Any]],
        final_decision: Dict[str, Any]
    ) -> Optional[SessionState]:
        session = self.get_session(session_id)
        if not session:
            return None
        session.mcq_answers = mcq_answers
        session.final_decision = final_decision
        session.conversation_history.append({
            "role": "assistant",
            "content": final_decision.get("executive_summary", "Decision recommendation synthesized.")
        })
        session.touch()
        return session

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info(f"Deleted decision session: {session_id}")
            return True
        return False

    def get_active_session_count(self) -> int:
        self._cleanup_expired()
        return len(self._sessions)


# Global singleton instance
session_manager = SessionManager()
