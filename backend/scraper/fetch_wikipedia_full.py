# ============================================================
# IntelliChoice — Full Wikipedia Article Fetcher
# ============================================================

import requests
import logging
from typing import Tuple, Optional

logger = logging.getLogger("intellichoice.fetch_wikipedia_full")

def fetch_wikipedia_full(topic_title: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Fetches the full plain text Wikipedia article for a given topic title.
    Returns (title, page_url, full_text).
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
                    text = page_data.get("extract", "")
                    clean_slug = topic_title.replace(" ", "_")
                    page_url = f"https://en.wikipedia.org/wiki/{clean_slug}"
                    return title, page_url, text
    except Exception as e:
        logger.error(f"Error fetching Wikipedia article for {topic_title}: {e}")

    return None, None, None


if __name__ == "__main__":
    t, u, txt = fetch_wikipedia_full("Systematic_investment_plan")
    print(f"Title: {t}\nURL: {u}\nLength: {len(txt) if txt else 0} chars")
