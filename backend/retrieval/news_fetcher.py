# ============================================================
# IntelliChoice — NewsAPI Live Tech Market & Hiring Fetcher
# ============================================================

import os
import sys
import logging
import requests
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import NEWS_API_KEY

logger = logging.getLogger("intellichoice.news")

def fetch_tech_market_news(query: str = "tech hiring OR software engineer salary OR tech layoffs", limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches real-time tech market and hiring news via NewsAPI.
    """
    if not NEWS_API_KEY:
        logger.warning("NEWS_API_KEY is not set in .env. News API fetch skipped.")
        return []

    url = f"https://newsapi.org/v2/everything?q={query}&sortBy=publishedAt&pageSize={limit}&apiKey={NEWS_API_KEY}"

    try:
        response = requests.get(url, timeout=8)
        if response.status_code == 200:
            articles = response.json().get("articles", [])
            logger.info(f"✅ NewsAPI retrieved {len(articles)} articles for query: '{query}'")

            results = []
            for art in articles:
                results.append({
                    "title": art.get("title", ""),
                    "source": art.get("source", {}).get("name", "News Source"),
                    "author": art.get("author", ""),
                    "description": art.get("description", ""),
                    "url": art.get("url", ""),
                    "publishedAt": art.get("publishedAt", "")
                })
            return results
        else:
            logger.error(f"NewsAPI failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error fetching from NewsAPI: {e}")
        return []

if __name__ == "__main__":
    articles = fetch_tech_market_news("tech hiring OR AI jobs", limit=3)
    print(f"Retrieved {len(articles)} NewsAPI articles.")
    for a in articles:
        print(f"- {a['title']} ({a['source']}): {a['url']}")
