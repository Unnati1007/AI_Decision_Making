# ============================================================
# IntelliChoice — Pipeline Flow Unit Tests (Phase 4 / B6)
# ============================================================

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import MAX_CHUNKS_PER_FILE, RELEVANCE_THRESHOLD
from backend.retrieval.retriever import retrieve_context
from backend.services.rag_pipeline import execute_turn_1, execute_turn_2


class TestPipelineFlow(unittest.TestCase):

    def setUp(self):
        self.sample_query = "how to negotiate salary"
        self.domain = "career"
        self.mcq_answers = [
            {"question": "What is your current career stage?", "selected_option": "Mid-Career (4-8 yrs)"},
            {"question": "What is your primary priority?", "selected_option": "Higher Salary & Benefits"}
        ]

    def test_a_normal_flow_turn1_to_turn2(self):
        """(a) Tests normal execution flow of Turn 1 -> Turn 2."""
        t1_res = execute_turn_1(self.sample_query, domain_override=self.domain)
        self.assertTrue(t1_res["success"])
        self.assertIn("mcqs", t1_res)
        self.assertIn("sources", t1_res)

        t2_res = execute_turn_2(
            query=self.sample_query,
            domain=self.domain,
            mcq_answers=self.mcq_answers,
            turn1_raw_results=t1_res.get("raw_results")
        )
        self.assertTrue(t2_res["success"])
        self.assertIn("decision", t2_res)
        self.assertIn("executive_summary", t2_res["decision"])

    def test_b_low_score_query_llm_not_called(self):
        """(b) Tests low-score query handling (< RELEVANCE_THRESHOLD) where LLM is NOT called."""
        mock_raw_results = [
            ("Low similarity chunk text", {"title": "Irrelevant File", "source_file": "irrelevant.md", "url": "", "domain": "career"}, 0.05)
        ]
        with patch("backend.services.rag_pipeline.retrieve_context") as mock_retrieve:
            mock_retrieve.return_value = ("", [{"title": "Irrelevant File", "domain": "career", "similarity_score": 0.05}], mock_raw_results)
            
            t2_res = execute_turn_2(
                query="random unrecognized obscure query xzy123",
                domain="career",
                mcq_answers=self.mcq_answers,
                turn1_raw_results=mock_raw_results
            )
            self.assertTrue(t2_res["success"])
            self.assertFalse(t2_res.get("llm_called", False))
            self.assertIn("not have enough relevant information", t2_res["decision"]["executive_summary"])

    def test_c_max_chunks_per_file_respected(self):
        """(c) Tests that MAX_CHUNKS_PER_FILE (limit 2) is strictly respected."""
        mock_raw_results = [
            ("Chunk 1 from file A", {"title": "File A", "source_file": "file_a.md", "url": "https://example.com/a", "domain": "career"}, 0.85),
            ("Chunk 2 from file A", {"title": "File A", "source_file": "file_a.md", "url": "https://example.com/a", "domain": "career"}, 0.80),
            ("Chunk 3 from file A", {"title": "File A", "source_file": "file_a.md", "url": "https://example.com/a", "domain": "career"}, 0.75),
            ("Chunk 1 from file B", {"title": "File B", "source_file": "file_b.md", "url": "https://example.com/b", "domain": "career"}, 0.70)
        ]
        with patch("backend.retrieval.vector_store.FAISSVectorStore.similarity_search_with_score", return_value=mock_raw_results):
            ctx, sources, filtered_results = retrieve_context("test query", domain="career", top_k=4)
            file_a_chunks = [r for r in filtered_results if r[1].get("source_file") == "file_a.md"]
            self.assertLessEqual(len(file_a_chunks), MAX_CHUNKS_PER_FILE)
            self.assertEqual(len(file_a_chunks), 2)

    def test_d_empty_url_citation_shows_title_only(self):
        """(d) Tests that citations with empty url show title only without url attribute."""
        mock_raw_results = [
            ("Chunk text with empty url", {"title": "No URL File", "source_file": "no_url.md", "url": "", "domain": "career"}, 0.80)
        ]
        with patch("backend.retrieval.vector_store.FAISSVectorStore.similarity_search_with_score", return_value=mock_raw_results):
            ctx, sources, filtered_results = retrieve_context("salary query", domain="career", top_k=2)
            self.assertTrue(len(sources) > 0)
            first_source = sources[0]
            self.assertEqual(first_source["title"], "No URL File")
            self.assertNotIn("url", first_source)

    def test_e_dedupe_on_merge(self):
        """(e) Tests deduplication when Turn 1 and Turn 2 results are merged."""
        duplicate_chunk = "Duplicate chunk content for testing deduplication."
        t1_results = [
            (duplicate_chunk, {"title": "File A", "source_file": "file_a.md", "url": "", "domain": "career"}, 0.80)
        ]
        t2_results = [
            (duplicate_chunk, {"title": "File A", "source_file": "file_a.md", "url": "", "domain": "career"}, 0.80),
            ("Unique chunk from Turn 2", {"title": "File B", "source_file": "file_b.md", "url": "", "domain": "career"}, 0.75)
        ]

        with patch("backend.services.rag_pipeline.retrieve_context") as mock_retrieve:
            mock_retrieve.return_value = ("context block", [{"title": "File A", "domain": "career"}], t2_results)
            
            t2_res = execute_turn_2(
                query="test query",
                domain="career",
                mcq_answers=self.mcq_answers,
                turn1_raw_results=t1_results
            )
    def test_f_domain_filtered_search_returns_k_results(self):
        """Asserts a domain-filtered search returns k results when >= k chunks of that domain exist (no LLM, no network)."""
        import numpy as np
        from backend.retrieval.vector_store import FAISSVectorStore

        store = FAISSVectorStore(dimension=4)
        chunks = [
            "career chunk 1", "career chunk 2", "career chunk 3", "career chunk 4", "career chunk 5",
            "finance chunk 1", "finance chunk 2", "finance chunk 3",
            "wellbeing chunk 1", "wellbeing chunk 2", "wellbeing chunk 3", "wellbeing chunk 4"
        ]
        embeddings = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.9, 0.1, 0.0, 0.0],
            [0.8, 0.2, 0.0, 0.0],
            [0.7, 0.3, 0.0, 0.0],
            [0.6, 0.4, 0.0, 0.0],
            # finance
            [0.99, 0.01, 0.0, 0.0],
            [0.95, 0.05, 0.0, 0.0],
            [0.92, 0.08, 0.0, 0.0],
            # wellbeing (lower similarity to [1,0,0,0])
            [0.1, 0.1, 0.9, 0.0],
            [0.1, 0.2, 0.8, 0.0],
            [0.2, 0.1, 0.8, 0.0],
            [0.1, 0.3, 0.7, 0.0],
        ], dtype=np.float32)
        metadatas = [
            {"domain": "career", "title": "Career Doc"},
            {"domain": "career", "title": "Career Doc"},
            {"domain": "career", "title": "Career Doc"},
            {"domain": "career", "title": "Career Doc"},
            {"domain": "career", "title": "Career Doc"},
            {"domain": "finance", "title": "Finance Doc"},
            {"domain": "finance", "title": "Finance Doc"},
            {"domain": "finance", "title": "Finance Doc"},
            {"domain": "wellbeing", "title": "Wellbeing Doc"},
            {"domain": "wellbeing", "title": "Wellbeing Doc"},
            {"domain": "wellbeing", "title": "Wellbeing Doc"},
            {"domain": "wellbeing", "title": "Wellbeing Doc"},
        ]
        store.add_documents(chunks, embeddings, metadatas)

        query_vec = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
        results = store.similarity_search_with_score(query_vec, k=4, domain_filter="wellbeing")
        self.assertEqual(len(results), 4)
        for chunk, meta, score in results:
            self.assertEqual(meta["domain"], "wellbeing")


if __name__ == "__main__":
    unittest.main()
