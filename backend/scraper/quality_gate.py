# ============================================================
# IntelliChoice — Scraper Quality Gate Module (S1 Fixed)
# ============================================================

import os
import re
import glob
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Set, Tuple

# Quality Gate Rule Thresholds
MIN_WORD_COUNT = 400
ALLOWED_LANGUAGES = ["en", "hi"]
MAX_NAV_RATIO = 0.50
EXPECTED_STATUS = 200
MAX_RAW_HTML_TAGS = 3

ERROR_MARKERS = [
    "Error Occured",
    "try again later",
    "404",
    "Access Denied",
    "JavaScript is required",
    "500 Internal Server Error",
    "Page Not Found"
]

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


def extract_page_title(text: str) -> str:
    """Extracts actual page title from text/headings/frontmatter. Never uses filename or caller."""
    # Check frontmatter title: "..."
    fm_m = re.search(r"^title:\s*[\"']?(.*?)[\"']?\s*$", text, re.MULTILINE)
    if fm_m and fm_m.group(1).strip() and not fm_m.group(1).strip().endswith(".md"):
        return fm_m.group(1).strip()

    # Check Markdown H1: # Title
    h1_m = re.search(r"^#\s+(.*)$", text, re.MULTILINE)
    if h1_m and h1_m.group(1).strip():
        return h1_m.group(1).strip()

    # Check HTML <title>
    html_title_m = re.search(r"<title.*?>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
    if html_title_m and html_title_m.group(1).strip():
        return html_title_m.group(1).strip()

    return "Untitled Page"


def detect_language(text: str) -> str:
    """Detects simple language: devanagari characters -> 'hi', ASCII dominant -> 'en'."""
    devanagari_count = len(re.findall(r'[\u0900-\u097F]', text))
    if devanagari_count > 50 and (devanagari_count / max(1, len(text))) > 0.05:
        return "hi"
    return "en"


def is_formula_or_table_line(line: str) -> bool:
    """Returns True if line is a math formula/equation or Markdown table row."""
    if "|" in line:
        return True
    if any(sym in line for sym in ["=", "+", "\\frac", "\\sum", "\\sqrt", "^"]):
        return True
    return False


def compute_nav_ratio(text: str) -> float:
    """
    Calculates fraction of non-empty content lines (excluding headings, formulas, and table rows)
    that are short nav lines (<= 3 words).
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    content_lines = []
    for l in lines:
        if l.startswith("#"):
            continue
        if is_formula_or_table_line(l):
            continue
        content_lines.append(l)

    if not content_lines:
        return 0.0

    nav_lines = sum(1 for l in content_lines if len(l.split()) <= 3)
    return round(nav_lines / len(content_lines), 4)


def count_raw_html_tags(text: str) -> int:
    """Counts raw HTML/SVG/CSS tags in text."""
    patterns = [r'<path\b', r'<div\b', r'<svg\b', r'style=', r'<script\b', r'<style\b']
    total_tags = 0
    for p in patterns:
        total_tags += len(re.findall(p, text, re.IGNORECASE))
    return total_tags


def find_duplicate_active_url(url: str, current_filepath: str = None, data_dir: str = "data") -> Tuple[bool, str]:
    """
    Checks if URL exists in active data/ files (excluding _staging and current_filepath).
    Returns (is_duplicate, matching_filepath).
    """
    if not url:
        return False, ""
    target_url = url.lower().strip().rstrip("/")

    md_files = glob.glob(os.path.join(data_dir, "**", "*.md"), recursive=True)
    for f in md_files:
        if "_staging" in f:
            continue
        if current_filepath and os.path.abspath(f) == os.path.abspath(current_filepath):
            continue
        try:
            with open(f, "r", encoding="utf-8", errors="ignore") as file:
                content = file.read()
                match = re.search(r"^url:\s*[\"']?(.*?)[\"']?\s*$", content, re.MULTILINE)
                if match and match.group(1).strip():
                    f_url = match.group(1).strip().lower().rstrip("/")
                    if f_url == target_url:
                        return True, os.path.normpath(f)
        except Exception:
            pass
    return False, ""


def is_title_matching(page_title: str, expected_topic: str) -> bool:
    """Checks if page title matches expected topic using keyword & synonym matching."""
    expected_words = [w.lower() for w in re.findall(r'\w+', expected_topic)]
    title_tokens = set(re.findall(r'\w+', page_title.lower()))

    matched_tokens = 0
    for word in expected_words:
        if word in title_tokens:
            matched_tokens += 1
        elif word in TOPIC_KEYWORD_SYNONYMS:
            if TOPIC_KEYWORD_SYNONYMS[word].intersection(title_tokens):
                matched_tokens += 1

    return matched_tokens >= 1 or expected_topic.lower() in page_title.lower()


def evaluate_quality_gate(
    text: str,
    expected_topic: str,
    url: str,
    status_code: int = 200,
    license_text: str = "CC BY-SA (per Wikipedia terms)",
    current_filepath: str = None,
    data_dir: str = "data"
) -> Dict[str, Any]:
    """
    Evaluates quality gate criteria on a fetched article text and metadata.
    Returns status dictionary.
    """
    page_title = extract_page_title(text)
    words = len(text.split())
    nav_ratio = compute_nav_ratio(text)
    lang = detect_language(text)
    sha256_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
    raw_html_count = count_raw_html_tags(text)

    # Check error markers
    detected_error_marker = None
    for err in ERROR_MARKERS:
        if err.lower() in text.lower():
            detected_error_marker = err
            break

    title_matched = is_title_matching(page_title, expected_topic)
    is_duplicate_url, active_dup_filepath = find_duplicate_active_url(url, current_filepath, data_dir)

    fail_reasons = []
    if status_code != EXPECTED_STATUS:
        fail_reasons.append(f"HTTP status {status_code} != {EXPECTED_STATUS}")
    if detected_error_marker:
        fail_reasons.append(f"Contains error marker '{detected_error_marker}'")
    if raw_html_count > MAX_RAW_HTML_TAGS:
        fail_reasons.append(f"Raw HTML/SVG tags count {raw_html_count} > {MAX_RAW_HTML_TAGS}")
    if not title_matched:
        fail_reasons.append(f"Page title '{page_title}' does not match expected topic '{expected_topic}'")
    if words < MIN_WORD_COUNT:
        fail_reasons.append(f"Word count {words} < {MIN_WORD_COUNT}")
    if lang not in ALLOWED_LANGUAGES:
        fail_reasons.append(f"Language '{lang}' not in {ALLOWED_LANGUAGES}")
    if nav_ratio > MAX_NAV_RATIO:
        fail_reasons.append(f"Nav ratio {nav_ratio} > {MAX_NAV_RATIO}")
    if is_duplicate_url:
        fail_reasons.append(f"Duplicate URL in active file: {active_dup_filepath}")

    passed = len(fail_reasons) == 0

    return {
        "status": status_code,
        "url": url,
        "page_title": page_title,
        "expected_topic": expected_topic,
        "title_match": "MATCH" if title_matched else "MISMATCH",
        "words": words,
        "nav_ratio": nav_ratio,
        "raw_html_count": raw_html_count,
        "language": lang,
        "license": license_text if license_text else "not found",
        "sha256": sha256_hash,
        "duplicate_url": is_duplicate_url,
        "active_dup_filepath": active_dup_filepath,
        "passed": passed,
        "fail_reason": "; ".join(fail_reasons) if fail_reasons else "NONE"
    }


def print_gate_rules():
    print("=== Quality Gate Rules Used (S1 Fixed) ===")
    print("  TITLE RULE         : Extracted strictly from page <title> / # H1 heading (never filename/caller).")
    print(f"  EXPECTED_STATUS    : {EXPECTED_STATUS}")
    print(f"  ERROR_MARKERS      : {ERROR_MARKERS}")
    print(f"  MAX_RAW_HTML_TAGS  : {MAX_RAW_HTML_TAGS} (fails if > {MAX_RAW_HTML_TAGS})")
    print(f"  MIN_WORD_COUNT     : {MIN_WORD_COUNT}")
    print(f"  ALLOWED_LANGUAGES  : {ALLOWED_LANGUAGES}")
    print(f"  MAX_NAV_RATIO      : {MAX_NAV_RATIO} (excludes headings, math formulas, and table rows)")
    print("  DUPLICATE_URL_RULE : Ignores staging and self; checks active files in data/.")
    print("===========================================")


if __name__ == "__main__":
    print_gate_rules()
