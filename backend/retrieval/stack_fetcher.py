# ============================================================
# IntelliChoice — Stack Overflow Tech Trends & Tag Fetcher
# ============================================================

import os
import sys
import logging
import requests
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import STACKEXCHANGE_KEY

logger = logging.getLogger("intellichoice.stackoverflow")

def fetch_popular_tech_tags(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Fetches most popular developer technology tags from Stack Overflow API.
    """
    url = f"https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize={limit}"
    if STACKEXCHANGE_KEY:
        url += f"&key={STACKEXCHANGE_KEY}"

    try:
        response = requests.get(url, timeout=8)
        if response.status_code == 200:
            items = response.json().get("items", [])
            logger.info(f"✅ Stack Overflow API retrieved {len(items)} popular tech tags.")
            
            results = []
            for item in items:
                results.append({
                    "name": item.get("name", ""),
                    "count": item.get("count", 0),
                    "is_required": item.get("is_required", False)
                })
            return results
        else:
            logger.error(f"Stack Overflow API failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error fetching from Stack Overflow API: {e}")
        return []

def fetch_top_voted_questions(tag: str = "python", limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches top voted developer questions for a specific technology tag.
    """
    url = f"https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged={tag}&site=stackoverflow&pagesize={limit}"
    if STACKEXCHANGE_KEY:
        url += f"&key={STACKEXCHANGE_KEY}"

    try:
        response = requests.get(url, timeout=8)
        if response.status_code == 200:
            items = response.json().get("items", [])
            logger.info(f"✅ Stack Overflow API retrieved {len(items)} top questions for tag '{tag}'.")
            
            results = []
            for item in items:
                results.append({
                    "title": item.get("title", ""),
                    "score": item.get("score", 0),
                    "view_count": item.get("view_count", 0),
                    "link": item.get("link", ""),
                    "tags": item.get("tags", [])
                })
            return results
        else:
            logger.error(f"Stack Overflow API failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error fetching questions from Stack Overflow API: {e}")
        return []

if __name__ == "__main__":
    tags = fetch_popular_tech_tags(limit=5)
    print(f"Retrieved {len(tags)} popular tech tags from Stack Overflow:")
    for t in tags:
        print(f"- Tag: {t['name']} (Questions: {t['count']:,})")
