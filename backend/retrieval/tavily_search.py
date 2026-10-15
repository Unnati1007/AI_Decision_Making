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

import re
from backend.config import TAVILY_API_KEY, TAVILY_ALLOWED_DOMAINS

logger = logging.getLogger("intellichoice.tavily")

TAVILY_API_URL = "https://api.tavily.com/search"

def sanitize_tavily_text(text: str, max_chars: int = 1000) -> str:
    """
    Sanitizes raw web text before LLM insertion:
    1. Strips HTML tags
    2. Filters out instruction injection lines ("ignore previous", "system prompt", "you are now")
    3. Caps length per result
    """
    if not text:
        return ""
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    forbidden_phrases = ["ignore previous", "system prompt", "you are now"]
    clean_lines = []
    for line in text.splitlines():
        line_lower = line.lower()
        if any(phrase in line_lower for phrase in forbidden_phrases):
            continue
        clean_lines.append(line)
    
    clean_text = " ".join(" ".join(clean_lines).split())
    if len(clean_text) > max_chars:
        clean_text = clean_text[:max_chars] + "..."
    return clean_text

def search_tavily(query: str, max_results: int = 4) -> List[Dict[str, Any]]:
    """
    Executes a real-time web search via Tavily AI Search API.
    Returns list of dicts: [{"title": ..., "url": ..., "content": ..., "source": ...}]
    """
    if not TAVILY_API_KEY:
        logger.warning("TAVILY_API_KEY is not configured in .env. Live web search skipped.")
        return []

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": query,
        "search_depth": "basic",
        "include_answer": False,
        "max_results": max_results
    }
    if TAVILY_ALLOWED_DOMAINS:
        payload["include_domains"] = TAVILY_ALLOWED_DOMAINS

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=8)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            logger.info(f"✅ Tavily Live Search retrieved {len(results)} web results for: '{query}'")
            
            # Format results (only real URLs)
            formatted_results = []
            for res in results:
                raw_content = res.get("content", "")
                formatted_results.append({
                    "title": res.get("title", "Web Source"),
                    "url": res.get("url", ""),
                    "content": sanitize_tavily_text(raw_content, max_chars=1000),
                    "source": "Tavily Web Search"
                })
            return formatted_results
        else:
            logger.error(f"Tavily API request failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error calling Tavily Search API: {e}")
        return []

def search_reddit(query: str, domain: str = "", max_results: int = 2) -> List[Dict[str, Any]]:
    """
    Searches Reddit community discussions via Tavily targeting reddit.com.
    Returns real discussion thread links, titles, and snippets.
    """
    if not TAVILY_API_KEY:
        logger.warning("TAVILY_API_KEY not configured. Reddit search skipped.")
        return []

    domain_subreddits = {
        "finance": "site:reddit.com/r/investing OR site:reddit.com/r/stocks OR site:reddit.com/r/personalfinance OR site:reddit.com/r/IndiaInvestments OR site:reddit.com/r/dividends",
        "career": "site:reddit.com/r/careerguidance OR site:reddit.com/r/cscareerquestions OR site:reddit.com/r/jobs",
        "education": "site:reddit.com/r/college OR site:reddit.com/r/GradSchool OR site:reddit.com/r/learnprogramming",
        "technology": "site:reddit.com/r/technology OR site:reddit.com/r/webdev OR site:reddit.com/r/programming"
    }

    sub_filter = domain_subreddits.get(domain.lower(), "site:reddit.com")
    reddit_query = f"{query} {sub_filter}"

    payload = {
        "api_key": TAVILY_API_KEY,
        "query": reddit_query,
        "search_depth": "basic",
        "include_answer": False,
        "include_domains": ["reddit.com"],
        "max_results": max_results
    }

    try:
        response = requests.post(TAVILY_API_URL, json=payload, timeout=8)
        if response.status_code == 200:
            data = response.json()
            results = data.get("results", [])
            logger.info(f"✅ Reddit Search retrieved {len(results)} threads for query: '{query}'")

            formatted_results = []
            for res in results:
                raw_url = res.get("url", "")
                if "reddit.com" not in raw_url:
                    continue
                raw_content = res.get("content", "")
                sub_match = re.search(r'reddit\.com/r/([^/]+)', raw_url)
                sub_name = f"r/{sub_match.group(1)}" if sub_match else "r/Reddit"

                formatted_results.append({
                    "title": res.get("title", "Reddit Discussion"),
                    "url": raw_url,
                    "content": sanitize_tavily_text(raw_content, max_chars=800),
                    "source": f"Reddit ({sub_name})",
                    "source_type": "reddit",
                    "subreddit": sub_name
                })
            return formatted_results
        else:
            logger.error(f"Reddit Search request failed with status code {response.status_code}: {response.text}")
            return []
    except Exception as e:
        logger.error(f"Error calling Reddit Search: {e}")
        return []

def search_community_discussions(query: str, domain: str = "", max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Searches top community Q&A and discussion platforms: Reddit and Quora.
    Returns real discussion links, post titles, and community answers.
    """
    if not TAVILY_API_KEY:
        return []

    community_results: List[Dict[str, Any]] = []

    # 1. Fetch Reddit Discussions (1-2 threads)
    try:
        reddit_threads = search_reddit(query, domain=domain, max_results=2)
        community_results.extend(reddit_threads)
    except Exception as e:
        logger.warning(f"Reddit fetch error in community search: {e}")

    # 2. Fetch Quora Discussions (1 thread)
    try:
        quora_query = f"{query} site:quora.com"
        payload = {
            "api_key": TAVILY_API_KEY,
            "query": quora_query,
            "search_depth": "basic",
            "include_answer": False,
            "include_domains": ["quora.com"],
            "max_results": 1
        }
        resp = requests.post(TAVILY_API_URL, json=payload, timeout=6)
        if resp.status_code == 200:
            for item in resp.json().get("results", []):
                q_url = item.get("url", "")
                if "quora.com" in q_url:
                    community_results.append({
                        "title": item.get("title", "Quora Community Discussion"),
                        "url": q_url,
                        "content": sanitize_tavily_text(item.get("content", ""), max_chars=800),
                        "source": "Quora Q&A",
                        "source_type": "quora",
                        "community_name": "Quora"
                    })
    except Exception as e:
        logger.warning(f"Quora fetch error: {e}")

    return community_results[:max_results]


if __name__ == "__main__":
    # Test execution
    test_res = search_tavily("latest AI developer hiring trends 2026")
    print(f"Retrieved {len(test_res)} results.")
    for r in test_res[:2]:
        print(f"- {r['title']}: {r['url']}")
