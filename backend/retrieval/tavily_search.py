# ============================================================
# IntelliChoice — Tavily Live AI Web Search Service
# ============================================================

import os
import sys
import logging
import requests
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import TAVILY_API_KEY

logger = logging.getLogger("intellichoice.tavily")

TAVILY_API_URL = "https://api.tavily.com/search"

def search_tavily(query: str, max_results: int = 4) -> List[Dict[str, Any]]:
    """
    Executes a real-time web search via Tavily AI Search API.
    Returns list of dicts: [{"title": ..., "url": ..., "content": ..., "score": ...}]
    """
    if not TAVILY_API_KEY:
        logger.warning("TAVILY_API_KEY is not configured in .env. Live web search skipped.")
        return []

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_answer": True,
        "max_results": max_results
    }

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=8)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            answer = data.get("answer", "")
            logger.info(f"✅ Tavily Live Search retrieved {len(results)} web results for: '{query}'")
            
            # Format results
            formatted_results = []
            if answer:
                formatted_results.append({
                    "title": "Tavily AI Direct Summary",
                    "url": "https://tavily.com",
                    "content": answer,
                    "source": "Tavily AI Live Web Search"
                })
                
            for res in results:
                formatted_results.append({
                    "title": res.get("title", "Web Source"),
                    "url": res.get("url", ""),
                    "content": res.get("content", ""),
                    "source": "Tavily Web Search"
                })
            return formatted_results
        else:
            logger.error(f"Tavily API request failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error calling Tavily Search API: {e}")
        return []

if __name__ == "__main__":
    # Test execution
    test_res = search_tavily("latest AI developer hiring trends 2026")
    print(f"Retrieved {len(test_res)} results.")
    for r in test_res[:2]:
        print(f"- {r['title']}: {r['url']}")
