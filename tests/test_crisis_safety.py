# ============================================================
# IntelliChoice — Crisis Safety Unit Tests (K0)
# ============================================================

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.guard import detect_crisis_intent
from backend.services.rag_pipeline import execute_turn_1, execute_turn_2


class TestCrisisSafety(unittest.TestCase):

    def setUp(self):
        self.crisis_queries = [
            "I want to hurt myself",
            "mujhe jeene ka mann nahi kar raha",
            "I don't want to live anymore, want to end it all",
            "mujhe jine ka man nhi hai",
            "I want to kill myself",
            "main mar jana chahta hu"
        ]
        self.normal_queries = [
            "how to negotiate salary for software engineer",
            "what is a fixed deposit and how does it work"
        ]

    def test_detect_crisis_intent_patterns(self):
        """Verifies that all 6 crisis queries trigger detection and normal queries do not."""
        for q in self.crisis_queries:
            self.assertTrue(detect_crisis_intent(q), f"Failed to detect crisis intent in: '{q}'")

        for nq in self.normal_queries:
            self.assertFalse(detect_crisis_intent(nq), f"False positive crisis intent detected in: '{nq}'")

    @patch("backend.retrieval.tavily_search.search_tavily")
    @patch("backend.services.rag_pipeline.retrieve_context")
    @patch("backend.services.rag_pipeline.get_llm_client")
    def test_turn_1_crisis_interception_no_llm_no_rag_no_tavily(self, mock_llm, mock_retrieve, mock_tavily):
        """Verifies that Turn 1 returns is_crisis True and never calls LLM, retrieval, or Tavily."""
        for q in self.crisis_queries:
            mock_llm.reset_mock()
            mock_retrieve.reset_mock()
            mock_tavily.reset_mock()

            res = execute_turn_1(q, domain_override="wellbeing")

            self.assertTrue(res.get("is_crisis"), f"Expected is_crisis=True for '{q}'")
            self.assertTrue(res.get("success"), f"Expected success=True for '{q}'")
            self.assertEqual(res.get("mcqs"), [], f"Expected empty MCQs for '{q}'")
            self.assertEqual(res.get("sources"), [], f"Expected empty sources for '{q}'")
            self.assertIn("pareshan", res.get("message", "") + res.get("message", ""))

            # Mocks assert not called
            mock_llm.assert_not_called()
            mock_retrieve.assert_not_called()
            mock_tavily.assert_not_called()

    @patch("backend.retrieval.tavily_search.search_tavily")
    @patch("backend.services.rag_pipeline.retrieve_context")
    @patch("backend.services.rag_pipeline.get_llm_client")
    def test_turn_2_crisis_interception_on_query_and_freetext(self, mock_llm, mock_retrieve, mock_tavily):
        """Verifies that Turn 2 intercepts crisis in query or free-text answers without calling LLM or RAG."""
        # 1. Crisis in original query
        res1 = execute_turn_2(
            query="mujhe jeene ka mann nahi kar raha",
            domain="wellbeing",
            mcq_answers=[{"question": "Q1", "selected_option": "Option A"}]
        )
        self.assertTrue(res1.get("is_crisis"))
        self.assertIsNone(res1.get("decision"))
        mock_llm.assert_not_called()
        mock_retrieve.assert_not_called()
        mock_tavily.assert_not_called()

        # 2. Crisis in free-text MCQ answer
        mock_llm.reset_mock()
        mock_retrieve.reset_mock()
        mock_tavily.reset_mock()
        res2 = execute_turn_2(
            query="career growth tips",
            domain="career",
            mcq_answers=[{"question": "How are you feeling?", "selected_option": "I don't want to live, end it all"}]
        )
        self.assertTrue(res2.get("is_crisis"))
        self.assertIsNone(res2.get("decision"))
        mock_llm.assert_not_called()
        mock_retrieve.assert_not_called()
        mock_tavily.assert_not_called()

    def test_normal_queries_do_not_trigger_crisis(self):
        """Verifies that normal queries do NOT return is_crisis=True."""
        for nq in self.normal_queries:
            self.assertFalse(detect_crisis_intent(nq))

    def test_wellbeing_query_low_score_returns_no_finance_sources(self):
        """Verifies that a wellbeing query does NOT fall back to finance sources."""
        from backend.retrieval.retriever import retrieve_context
        # Query that previously matched finance schemes (like Atal Pension Yojana) when domain-agnostic fallback occurred
        ctx, sources, raw = retrieve_context("feeling completely overwhelmed and lost", domain="wellbeing", top_k=4)
        for s in sources:
            self.assertNotEqual(s.get("domain"), "finance", f"Returned finance source in wellbeing: {s.get('title')}")

