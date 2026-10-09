# ============================================================
# IntelliChoice — Staging Finance Pilot Fetcher & Quality Auditor
# ============================================================

import os
import sys
import datetime
import hashlib
from pathlib import Path

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.scraper.fetch_wikipedia_full import fetch_wikipedia_full
from backend.scraper.quality_gate import evaluate_quality_gate, print_gate_rules

STAGING_DIR = Path(PROJECT_ROOT) / "data" / "_staging" / "finance"

FINANCE_TOPICS = [
    {
        "id": "1",
        "topic": "SIP and mutual fund basics",
        "wiki_slug": "Mutual_funds_in_India",
        "filename": "wiki_mutual_funds_in_india.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "2",
        "topic": "income tax old vs new regime concept",
        "wiki_slug": "Taxation_in_India",
        "filename": "wiki_taxation_in_india.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "3",
        "topic": "emergency fund and budgeting",
        "wiki_slug": "Personal_budget",
        "filename": "wiki_personal_budget.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "4",
        "topic": "EPF / PPF / NPS basics",
        "wiki_slug": "Employees'_Provident_Fund_Organisation",
        "filename": "wiki_employees_provident_fund_organisation.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "5",
        "topic": "term vs endowment insurance",
        "wiki_slug": "Term_life_insurance",
        "filename": "wiki_term_life_insurance.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "6",
        "topic": "EMI/debt and credit score",
        "wiki_slug": "Debt",
        "filename": "wiki_debt.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    },
    {
        "id": "7",
        "topic": "inflation and compounding",
        "wiki_slug": "Inflation",
        "filename": "wiki_inflation.md",
        "owner": "Wikipedia Foundation",
        "license": "CC BY-SA (per Wikipedia terms)",
        "source_type": "wikipedia"
    }
]


def run_finance_pilot():
    STAGING_DIR.mkdir(parents=True, exist_ok=True)
    fetched_results = []

    print_gate_rules()
    print("\nStarting Fetch of Pilot Finance Topics into data/_staging/finance/ ...\n")

    for item in FINANCE_TOPICS:
        topic_name = item["topic"]
        wiki_slug = item["wiki_slug"]
        filename = item["filename"]
        license_str = item["license"]
        src_type = item["source_type"]

        title, url, text = fetch_wikipedia_full(wiki_slug)

        if not text or len(text.strip()) == 0:
            fetched_results.append({
                "item": item,
                "file": filename,
                "url": url or f"https://en.wikipedia.org/wiki/{wiki_slug}",
                "status": 404,
                "title_match": "MISMATCH",
                "words": 0,
                "nav_ratio": 0.0,
                "language": "none",
                "license": "not found",
                "passed": False,
                "fail_reason": "No clean text found"
            })
            continue

        sha256_val = hashlib.sha256(text.encode("utf-8")).hexdigest()
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        frontmatter = f"""---
title: "{title}"
url: "{url}"
fetched_at: "{timestamp}"
license: "{license_str}"
license_source: "script_constant"
sha256: "{sha256_val}"
source_type: "{src_type}"
domain: "finance"
---

# {title}

{text}
"""
        filepath = STAGING_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(frontmatter)

        # Audit with Quality Gate
        gate_res = evaluate_quality_gate(
            text=text,
            title=title,
            expected_topic=topic_name,
            url=url,
            status_code=200,
            license_text=license_str,
            data_dir=str(Path(PROJECT_ROOT) / "data")
        )

        fetched_results.append({
            "item": item,
            "file": filename,
            "url": url,
            "status": gate_res["status"],
            "title_match": gate_res["title_match"],
            "words": gate_res["words"],
            "nav_ratio": gate_res["nav_ratio"],
            "language": gate_res["language"],
            "license": gate_res["license"],
            "passed": gate_res["passed"],
            "fail_reason": gate_res["fail_reason"]
        })

    # Print Table
    print("=" * 120)
    header = f"{'File':<42} | {'Status':<6} | {'Match':<8} | {'Words':<6} | {'NavRatio':<8} | {'Lang':<4} | {'License':<25} | {'Result':<6} | {'Fail Reason'}"
    print(header)
    print("=" * 120)

    for r in fetched_results:
        res_str = "PASS" if r["passed"] else "FAIL"
        line = f"{r['file']:<42} | {r['status']:<6} | {r['title_match']:<8} | {r['words']:<6} | {r['nav_ratio']:<8.4f} | {r['language']:<4} | {r['license'][:25]:<25} | {res_str:<6} | {r['fail_reason']}"
        print(line)

    print("=" * 120)
    print("\nTopic Summary Status:")
    for r in fetched_results:
        topic_title = r["item"]["topic"]
        found_str = "found" if r["passed"] else "not found"
        print(f"  ({r['item']['id']}) {topic_title}: {found_str} (URL: {r['url']}, Words: {r['words']})")

    return fetched_results


if __name__ == "__main__":
    run_finance_pilot()
