# ============================================================
# IntelliChoice — Full Wikipedia Article Fetcher (Markdown Headings)
# ============================================================

import re
import requests
import logging
from typing import Tuple, Optional

logger = logging.getLogger("intellichoice.fetch_wikipedia_full")


def clean_mediawiki_headings(text: str) -> str:
    """Converts MediaWiki '== X ==' headings to Markdown '## X' headings."""
    if not text:
        return ""
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        sline = line.strip()
        # ==== Subsubheading ====
        m4 = re.match(r"^====\s*(.*?)\s*====$", sline)
        if m4:
            cleaned_lines.append(f"#### {m4.group(1)}")
            continue

        # === Subheading ===
        m3 = re.match(r"^===\s*(.*?)\s*===$", sline)
        if m3:
            cleaned_lines.append(f"### {m3.group(1)}")
            continue

        # == Heading ==
        m2 = re.match(r"^==\s*(.*?)\s*==$", sline)
        if m2:
            cleaned_lines.append(f"## {m2.group(1)}")
            continue

        cleaned_lines.append(line)

    return "\n".join(cleaned_lines)


def fetch_wikipedia_full(topic_title: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Fetches the full plain text Wikipedia article for a given topic title,
    converting MediaWiki '== X ==' headings to Markdown '## X' headings.
    Returns (title, page_url, full_markdown_text).
    """
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "IntelliChoiceBot/1.0 (Contact: admin@intellichoice.ai)"
    }
    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": "1",
        "titles": topic_title,
        "format": "json"
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            if pages:
                page_id = next(iter(pages))
                page_data = pages[page_id]
                if page_id != "-1":
                    title = page_data.get("title", topic_title)
                    raw_text = page_data.get("extract", "")
                    clean_text = clean_mediawiki_headings(raw_text)
                    clean_slug = topic_title.replace(" ", "_")
                    page_url = f"https://en.wikipedia.org/wiki/{clean_slug}"
                    return title, page_url, clean_text
    except Exception as e:
        logger.error(f"Error fetching Wikipedia article for {topic_title}: {e}")

    return None, None, None


if __name__ == "__main__":
    t, u, txt = fetch_wikipedia_full("Systematic_investment_plan")
    print(f"Title: {t}\nURL: {u}\nLength: {len(txt) if txt else 0} chars")
