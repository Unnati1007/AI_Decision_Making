# ============================================================
# IntelliChoice — System Evaluation Benchmark
# ============================================================

import os
import sys
import logging

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.domain_router import detect_domain
from backend.retrieval.retriever import retrieve_context
from backend.services.guard import guard_pipeline

logging.basicConfig(level=logging.ERROR)

EVALUATION_DATASET = [
    {
        "query": "Mujhe coding me maza nahi aata par IT Industry me high paying non-coding job chahiye, konsa path lu?",
        "expected_doc": "non_tech_to_tech_transition.md",
        "is_out_of_domain": False
    },
    {
        "query": "Mechanical engineering degree ke baad software developer ya data analyst kaise bane?",
        "expected_doc": "non_tech_to_tech_transition.md",
        "is_out_of_domain": False
    },
    {
        "query": "Early stage Series-A startup join karu 18 LPA baseline offer ke saath ya Tier-1 MNC me 14 LPA loon?",
        "expected_doc": "offer_comparison_framework.md",
        "is_out_of_domain": False
    },
    {
        "query": "Manager ne 30 days ka HR recovery plan letter thumb index diya hai, abhi resign karu ya fight karu?",
        "expected_doc": "pip_and_performance_recovery_playbook.md",
        "is_out_of_domain": False
    },
    {
        "query": "India me Gratuity calculation formula kitna hota hai aur 4 saal 240 din work karne par milega ya nahi?",
        "expected_doc": "labor_laws_and_statutory_benefits_india.md",
        "is_out_of_domain": False
    }
]

def evaluate():
    print("=" * 80)
    print("      INTELLICHOICE RAG BENCHMARK REPORT")
    print("=" * 80)

    for item in EVALUATION_DATASET:
        query = item["query"]
        expected = item["expected_doc"]
        routed_domain = detect_domain(query)
        ctx, sources, raw = retrieve_context(query, domain=routed_domain, top_k=4)
        top_title = sources[0]["title"] if sources else "None"
        top_score = sources[0]["similarity_score"] if sources else 0.0
        print(f"Query: {query[:45]}... | Top-1: {top_title} ({top_score:.4f})")

if __name__ == "__main__":
    evaluate()
