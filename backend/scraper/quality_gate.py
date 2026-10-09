# ============================================================
# IntelliChoice — Scraper Quality Gate Module
# ============================================================

import os
import re
import glob
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Set

# Quality Gate Rule Thresholds
MIN_WORD_COUNT = 400
ALLOWED_LANGUAGES = ["en", "hi"]
MAX_NAV_RATIO = 0.50
EXPECTED_STATUS = 200

# Topic Synonym Mapping for Flexible Title Validation
TOPIC_KEYWORD_SYNONYMS = {
    "sip": {"systematic", "investment", "plan", "sip", "mutual", "fund", "funds"},
    "mutual": {"mutual", "fund", "funds", "investment"},
    "fund": {"fund", "funds", "investment", "provident"},
    "income": {"income", "tax", "taxation", "direct"},
    "tax": {"tax", "taxation", "income", "direct"},
    "regime": {"regime", "taxation", "code", "act"},
    "basics": set(),
    "budgeting": {"budget", "budgeting", "personal", "finance"},
    "emergency": {"emergency", "personal", "budget", "fund"},
    "epf": {"employees", "provident", "fund", "organisation", "epf"},
    "ppf": {"public", "provident", "fund", "ppf"},
    "nps": {"national", "pension", "system", "nps"},
    "emi": {"equated", "monthly", "installment", "emi", "credit", "debt"},
    "debt": {"debt", "credit", "installment", "loan"},
    "compounding": {"compound", "compounding", "interest", "inflation"},
    "inflation": {"inflation", "compound", "compounding", "interest"}
}


def detect_language(text: str) -> str:
    """Detects simple language: devanagari characters -> 'hi', ASCII dominant -> 'en'."""
    devanagari_count = len(re.findall(r'[\u0900-\u097F]', text))
    if devanagari_count > 50 and (devanagari_count / max(1, len(text))) > 0.05:
        return "hi"
    return "en"


def compute_nav_ratio(text: str) -> float:
    """Calculates fraction of non-empty content lines (excluding headings) that are short nav lines (<= 3 words)."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    content_lines = [l for l in lines if not l.startswith("#")]
    if not content_lines:
        return 0.0
    nav_lines = sum(1 for l in content_lines if len(l.split()) <= 3)
    return round(nav_lines / len(content_lines), 4)


def get_existing_data_urls(data_dir: str) -> set:
    """Scans all existing .md files in data/ (excluding _staging) for frontmatter URLs."""
    existing_urls = set()
    md_files = glob.glob(os.path.join(data_dir, "**", "*.md"), recursive=True)
    for f in md_files:
        if "_staging" in f:
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                match = re.search(r"^url:\s*[\"']?(.*?)[\"']?\s*$", content, re.MULTILINE)
                if match and match.group(1).strip():
                    existing_urls.add(match.group(1).strip().lower().rstrip("/"))
        except Exception:
            pass
    return existing_urls


def is_title_matching(title: str, expected_topic: str) -> bool:
    """Checks if article title matches expected topic using keyword & synonym matching."""
    expected_words = [w.lower() for w in re.findall(r'\w+', expected_topic)]
    title_tokens = set(re.findall(r'\w+', title.lower()))

    matched_tokens = 0
    for word in expected_words:
        if word in title_tokens:
            matched_tokens += 1
        elif word in TOPIC_KEYWORD_SYNONYMS:
            if TOPIC_KEYWORD_SYNONYMS[word].intersection(title_tokens):
                matched_tokens += 1

    return matched_tokens >= 1 or expected_topic.lower() in title.lower()


def evaluate_quality_gate(
    text: str,
    title: str,
    expected_topic: str,
    url: str,
    status_code: int = 200,
    license_text: str = "CC BY-SA (per Wikipedia terms)",
    data_dir: str = "data"
) -> Dict[str, Any]:
    """
    Evaluates quality gate criteria on a fetched article text and metadata.
    Returns status dictionary.
    """
    words = len(text.split())
    nav_ratio = compute_nav_ratio(text)
    lang = detect_language(text)
    sha256_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()

    title_matched = is_title_matching(title, expected_topic)

    # Duplicate URL check vs existing data/ frontmatters
    existing_urls = get_existing_data_urls(data_dir)
    clean_url = url.lower().strip().rstrip("/")
    is_duplicate_url = clean_url in existing_urls

    fail_reasons = []
    if status_code != EXPECTED_STATUS:
        fail_reasons.append(f"HTTP status {status_code} != {EXPECTED_STATUS}")
    if not title_matched:
        fail_reasons.append(f"Title '{title}' does not match expected topic '{expected_topic}'")
    if words < MIN_WORD_COUNT:
        fail_reasons.append(f"Word count {words} < {MIN_WORD_COUNT}")
    if lang not in ALLOWED_LANGUAGES:
        fail_reasons.append(f"Language '{lang}' not in {ALLOWED_LANGUAGES}")
    if nav_ratio > MAX_NAV_RATIO:
        fail_reasons.append(f"Nav ratio {nav_ratio} > {MAX_NAV_RATIO}")
    if is_duplicate_url:
        fail_reasons.append(f"Duplicate URL already exists in data/: {url}")

    passed = len(fail_reasons) == 0

    return {
        "status": status_code,
        "url": url,
        "title": title,
        "expected_topic": expected_topic,
        "title_match": "MATCH" if title_matched else "MISMATCH",
        "words": words,
        "nav_ratio": nav_ratio,
        "language": lang,
        "license": license_text if license_text else "not found",
        "sha256": sha256_hash,
        "duplicate_url": is_duplicate_url,
        "passed": passed,
        "fail_reason": "; ".join(fail_reasons) if fail_reasons else "NONE"
    }


def print_gate_rules():
    print("=== Quality Gate Rules Used ===")
    print(f"  EXPECTED_STATUS    : {EXPECTED_STATUS}")
    print(f"  MIN_WORD_COUNT     : {MIN_WORD_COUNT}")
    print(f"  ALLOWED_LANGUAGES  : {ALLOWED_LANGUAGES}")
    print(f"  MAX_NAV_RATIO      : {MAX_NAV_RATIO}")
    print(f"  DUPLICATE_URL_CHECK: Enabled (against data/**/*.md frontmatter)")
    print("================================")


if __name__ == "__main__":
    print_gate_rules()
