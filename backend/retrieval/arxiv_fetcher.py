# ============================================================
# IntelliChoice — ArXiv Research Paper Fetcher (Zero Key Required)
# ============================================================

import os
import sys
import logging
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

logger = logging.getLogger("intellichoice.arxiv")

def fetch_arxiv_papers(query: str = "cat:cs.AI OR cat:cs.SE", max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Fetches recent CS/AI/Software Engineering research paper summaries from ArXiv Open API.
    Does NOT require any API Key or signup!
    """
    url = f"http://export.arxiv.org/api/query?search_query={query}&sortBy=submittedDate&sortOrder=descending&max_results={max_results}"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            root = ET.fromstring(response.content)
            namespace = {"atom": "http://www.w3.org/2005/Atom"}
            entries = root.findall("atom:entry", namespace)
            
            results = []
            for entry in entries:
                title = entry.find("atom:title", namespace).text.strip().replace("\n", " ")
                summary = entry.find("atom:summary", namespace).text.strip().replace("\n", " ")
                link = entry.find("atom:id", namespace).text.strip()
                published = entry.find("atom:published", namespace).text.strip()

                results.append({
                    "title": title,
                    "summary": summary,
                    "url": link,
                    "published": published
                })
            
            logger.info(f"✅ ArXiv API retrieved {len(results)} paper summaries for query: '{query}'")
            return results
        else:
            logger.error(f"ArXiv API failed with status code {response.status_code}")
            return []
    except Exception as e:
        logger.error(f"Error fetching from ArXiv API: {e}")
        return []

if __name__ == "__main__":
    papers = fetch_arxiv_papers("cat:cs.AI", max_results=3)
    print(f"Retrieved {len(papers)} ArXiv papers.")
    for p in papers:
        print(f"- {p['title']}: {p['url']}")
