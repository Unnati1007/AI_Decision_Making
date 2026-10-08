# ============================================================
# IntelliChoice — Automated Career Data Harvester & Expansion Script
# ============================================================

import os
import re
import sys
import time
import json
import logging
import requests
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.config import GITHUB_TOKEN
from backend.retrieval.ingest import run_ingestion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.harvester")

CAREER_DATA_DIR = os.path.join(PROJECT_ROOT, "data", "career")
os.makedirs(CAREER_DATA_DIR, exist_ok=True)

# ── 1. WIKIPEDIA TOPICS TO HARVEST ─────────────────────────
WIKI_CAREER_TOPICS = [
    "Career_counseling",
    "Performance_appraisal",
    "Human_resource_management",
    "Job_security",
    "Employee_retention",
    "Occupational_stress",
    "Employee_engagement",
    "Collective_bargaining",
    "Applicant_tracking_system",
    "Employee_benefits",
    "Equal_opportunity_employment",
    "Workforce_management",
    "Continuing_education",
    "Professional_certification",
    "Skills_management",
    "Onboarding",
    "Exit_interview"
]

def harvest_wikipedia_articles():
    """Fetches full summaries and text for target career topics from Wikipedia REST API."""
    headers = {"User-Agent": "IntelliChoiceBot/1.0 (career-ai-assistant)"}
    harvested_count = 0

    for topic in WIKI_CAREER_TOPICS:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic}"
        filename = f"wiki_{topic.lower()}.md"
        filepath = os.path.join(CAREER_DATA_DIR, filename)

        if os.path.exists(filepath):
            logger.info(f"Skipping existing file: {filename}")
            continue

        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                data = res.json()
                title = data.get("title", topic.replace("_", " "))
                extract = data.get("extract", "")
                content_url = data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{topic}")

                if len(extract.strip()) > 50:
                    md_content = f"""---
title: "{title}"
url: "{content_url}"
source: "Wikipedia Open Corpus"
domain: "Career"
---

# {title}

**Source Citation**: [{title}]({content_url})
**Domain**: Career

---

{extract}
"""
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(md_content)
                    harvested_count += 1
                    logger.info(f"✅ Harvested Wiki Topic: {title} -> {filename}")
            time.sleep(0.3)
        except Exception as e:
            logger.error(f"Error fetching wiki topic {topic}: {e}")

    return harvested_count

# ── 2. GITHUB TRENDING TECH & SKILL HARVESTING ────────────
GITHUB_TECH_CLUSTERS = [
    {"domain": "Artificial Intelligence & LLMs", "query": "llm OR generative-ai OR rag"},
    {"domain": "Distributed Systems & Cloud", "query": "kubernetes OR distributed-systems OR microservices"},
    {"domain": "Modern Web Frameworks", "query": "react OR nextjs OR fastapi"},
    {"domain": "Data Engineering & Analytics", "query": "data-engineering OR spark OR kafka"}
]

def harvest_github_tech_trends():
    """Uses GitHub API (with GITHUB_TOKEN) to generate tech stack trend decision files."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    harvested_count = 0
    for cluster in GITHUB_TECH_CLUSTERS:
        domain_name = cluster["domain"]
        query = cluster["query"]
        safe_name = domain_name.lower().replace(" & ", "_").replace(" ", "_")
        filename = f"github_trends_{safe_name}.md"
        filepath = os.path.join(CAREER_DATA_DIR, filename)

        if os.path.exists(filepath):
            logger.info(f"Skipping existing file: {filename}")
            continue

        url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc&per_page=5"
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                items = res.json().get("items", [])
                if items:
                    lines = [
                        f"# Technical Trend Report: {domain_name}",
                        "\n## 📌 Executive Summary",
                        f"Analysis of top star-rated open-source repositories and ecosystem projects driving industry adoption in {domain_name}.",
                        "\n## 📊 Top Starred Ecosystem Repositories\n",
                        "| Repository | Language | Stars | Description | Primary Use Case |",
                        "| :--- | :--- | :--- | :--- | :--- |"
                    ]

                    for item in items:
                        repo_name = item.get("full_name", "")
                        lang = item.get("language") or "Multi-language"
                        stars = item.get("stargazers_count", 0)
                        desc = (item.get("description") or "No description").replace("|", "-").strip()
                        repo_url = item.get("html_url", "")
                        lines.append(f"| [{repo_name}]({repo_url}) | {lang} | {stars:,} | {desc} | Core Industry Component |")

                    lines.append("\n## 💡 Strategic Upskilling Action Plan")
                    lines.append(f"1. **Master Core Tooling**: Build practical projects using top repositories listed above in {domain_name}.")
                    lines.append("2. **Production Readiness**: Focus on latency optimization, error handling, and cloud deployment.")

                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write("\n".join(lines))
                    harvested_count += 1
                    logger.info(f"✅ Harvested GitHub Cluster: {domain_name} -> {filename}")
            time.sleep(0.5)
        except Exception as e:
            logger.error(f"Error harvesting GitHub cluster {domain_name}: {e}")

    return harvested_count

def harvest_news_market_updates():
    """Fetches real-time tech market news via NewsAPI and saves as markdown."""
    from backend.retrieval.news_fetcher import fetch_tech_market_news
    articles = fetch_tech_market_news("tech hiring OR software engineer salary OR tech layoffs", limit=5)
    if not articles:
        return 0

    filename = "news_tech_hiring_market_updates.md"
    filepath = os.path.join(CAREER_DATA_DIR, filename)

    lines = [
        "# Industry Intelligence: Tech Hiring & Market News Updates",
        "\n## 📌 Executive Summary",
        "Recent tech industry announcements, hiring market shifts, and salary dynamics aggregated via NewsAPI.",
        "\n## 📰 Key News Headlines & Analysis\n"
    ]

    for a in articles:
        lines.append(f"### 🔹 [{a['title']}]({a['url']})")
        lines.append(f"- **Source**: {a['source']} | **Published**: {a['publishedAt']}")
        lines.append(f"- **Summary**: {a['description']}\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    logger.info(f"✅ Harvested NewsAPI Updates -> {filename}")
    return 1

def harvest_arxiv_research():
    """Fetches recent AI/CS research paper summaries via ArXiv Open API and saves as markdown."""
    from backend.retrieval.arxiv_fetcher import fetch_arxiv_papers
    papers = fetch_arxiv_papers("cat:cs.AI OR cat:cs.SE", max_results=5)
    if not papers:
        return 0

    filename = "arxiv_ai_software_engineering_research.md"
    filepath = os.path.join(CAREER_DATA_DIR, filename)

    lines = [
        "# Technical Research Digest: AI & Software Engineering (ArXiv)",
        "\n## 📌 Executive Summary",
        "Cutting-edge research papers in Artificial Intelligence, System Architecture, and Software Engineering sourced from ArXiv Open Corpus.",
        "\n## 📄 Recent Technical Papers\n"
    ]

    for p in papers:
        lines.append(f"### 📑 [{p['title']}]({p['url']})")
        lines.append(f"- **Published**: {p['published']}")
        lines.append(f"- **Abstract Summary**: {p['summary']}\n")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    logger.info(f"✅ Harvested ArXiv Research Papers -> {filename}")
    return 1

def main():
    logger.info("🚀 Starting Master Career Data Harvester...")
    wiki_added = harvest_wikipedia_articles()
    gh_added = harvest_github_tech_trends()
    news_added = harvest_news_market_updates()
    arxiv_added = harvest_arxiv_research()

    total_added = wiki_added + gh_added + news_added + arxiv_added
    logger.info(f"🎉 Harvesting Complete! Added {total_added} new data sources.")

    if total_added > 0 or not os.path.exists(os.path.join(PROJECT_ROOT, "vector_db", "faiss_index.bin")):
        logger.info("⚡ Re-building FAISS Vector Embeddings...")
        run_ingestion()

if __name__ == "__main__":
    main()
