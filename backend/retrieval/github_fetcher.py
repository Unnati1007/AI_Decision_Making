# ============================================================
# IntelliChoice — GitHub Live Tech Trends & Skills Fetcher
# ============================================================

import os
import sys
import logging
import requests
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import GITHUB_TOKEN

logger = logging.getLogger("intellichoice.github")

def fetch_trending_tech_topics(query: str = "machine-learning OR llm OR react", limit: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches trending open source repositories and skills from GitHub REST API.
    Uses GITHUB_TOKEN if available for high rate limit (5,000 req/hr).
    """
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page={limit}"
    
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        response = requests.get(url, headers=headers, timeout=8)
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            logger.info(f"✅ GitHub API retrieved {len(items)} trending repositories for query: '{query}'")
            
            results = []
            for item in items:
                results.append({
                    "name": item.get("full_name", ""),
                    "stars": item.get("stargazers_count", 0),
                    "description": item.get("description", ""),
                    "language": item.get("language", ""),
                    "topics": item.get("topics", []),
                    "url": item.get("html_url", ""),
                    "updated_at": item.get("updated_at", "")
                })
            return results
        else:
            logger.error(f"GitHub API failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error fetching from GitHub API: {e}")
        return []

if __name__ == "__main__":
    test_repos = fetch_trending_tech_topics("fastapi OR langchain", limit=3)
    print(f"Retrieved {len(test_repos)} GitHub repos.")
    for repo in test_repos:
        print(f"- {repo['name']} [Stars: {repo['stars']}] ({repo['language']}): {repo['description']}")
