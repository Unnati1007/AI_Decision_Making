# ============================================================
# IntelliChoice — RAG Retrieval Verification Test
# ============================================================

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.retrieval.retriever import retrieve_context

TEST_QUERIES = [
    "Data analyst banu ya backend developer?",
    "Salary negotiation me base salary vs ESOPs kaise decide karein?",
    "2-5 years experience me MBA karna sahi hai ya job continuation?",
    "DevOps engineer banne ke liye kya roadmap hai?",
    "AI and Data Scientist banne ke liye kaunse skills seekhne honge?"
]

def run_tests():
    print("=" * 60)
    print("RUNNING RAG RETRIEVAL VERIFICATION TESTS")
    print("=" * 60)

    for i, q in enumerate(TEST_QUERIES, 1):
        print(f"\n[Query {i}]: '{q}'")
        ctx, sources, raw = retrieve_context(q, domain="career", top_k=3)
        print(f"Retrieved {len(sources)} Sources:")
        for s in sources[:3]:
            print(f"  - [{s['id']}] Title: {s['title']} | Source: {s['source']} | Score: {s['similarity_score']}")

if __name__ == "__main__":
    run_tests()
