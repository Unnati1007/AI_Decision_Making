# ============================================================
# IntelliChoice — Open Data Fetcher (Wikipedia API + Open Roadmaps)
# ============================================================

import os
import time
import logging
import requests
from pathlib import Path
from backend.scraper.cleaner import format_markdown_article

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.scraper")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

# ── Wikipedia Open API Target Topics ──────────────────────
TARGET_TOPICS = {
    "career": [
        "Master_of_Business_Administration",
        "Software_engineering",
        "Product_management",
        "Salary_negotiation",
        "Freelancer",
        "Layoff",
        "Remote_work",
        "Executive_education",
        "Career_management",
        "Job_interview"
    ],
    "finance": [
        "Mutual_fund",
        "Systematic_investment_plan",
        "National_Pension_System",
        "Public_Provident_Fund_(India)",
        "Income_tax_in_India",
        "Real_estate_investment_trust",
        "Index_fund",
        "Asset_allocation",
        "Sovereign_Gold_Bond",
        "Credit_score"
    ],
    "legal": [
        "Contract",
        "Non-disclosure_agreement",
        "Intellectual_property",
        "Trademark_India",
        "Arbitration_in_India",
        "Consumer_Protection_Act,_2019",
        "Right_to_Information_Act,_2005",
        "Tenant_rights",
        "Cybercrime",
        "Labour_law_in_India"
    ],
    "wellbeing": [
        "Occupational_burnout",
        "Intermittent_fasting",
        "Sleep_hygiene",
        "Circadian_rhythm",
        "Cognitive_behavioral_therapy",
        "Aerobic_exercise",
        "Mindfulness",
        "Ergonomics",
        "Macronutrient",
        "Psychological_resilience"
    ]
}

def fetch_wikipedia_article(topic_title: str) -> tuple:
    """Fetches Wikipedia article text and URL via Wikipedia REST Summary API."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic_title}"
    headers = {
        "User-Agent": "IntelliChoiceBot/1.0 (Contact: admin@intellichoice.ai)"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            title = data.get("title", topic_title)
            extract = data.get("extract", "")
            page_url = data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{topic_title}")
            return title, page_url, extract
    except Exception as e:
        logger.error(f"Error fetching Wikipedia REST topic {topic_title}: {e}")
    
    return None, None, None

def fetch_roadmap_sh_guides() -> list:
    """Fetches open-source developer roadmaps from GitHub raw endpoints."""
    roadmaps = [
        ("Frontend Developer Roadmap", "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/frontend/frontend.md", "career"),
        ("Backend Developer Roadmap", "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/backend/backend.md", "career"),
        ("DevOps Roadmap", "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/devops/devops.md", "career"),
        ("AI Engineer Roadmap", "https://raw.githubusercontent.com/kamranahmedse/developer-roadmap/master/src/data/roadmaps/ai-engineer/ai-engineer.md", "career")
    ]
    results = []
    headers = {"User-Agent": "IntelliChoiceBot/1.0"}
    
    for title, url, domain in roadmaps:
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                results.append((title, url, domain, res.text))
                logger.info(f"Fetched roadmap: {title}")
        except Exception as e:
            logger.error(f"Error fetching roadmap {title}: {e}")
        time.sleep(0.5) # respect rate limit
        
    return results

def run_open_data_ingestion():
    """Fetches articles across Wikipedia and Open Roadmaps and saves formatted .md files."""
    logger.info("Starting Open Data Ingestion from Legal & Safe Open APIs...")
    total_fetched = 0
    
    # 1. Fetch Wikipedia Domain Articles
    for domain, topics in TARGET_TOPICS.items():
        domain_dir = DATA_DIR / domain
        domain_dir.mkdir(parents=True, exist_ok=True)
        
        for topic in topics:
            title, url, text = fetch_wikipedia_article(topic)
            if title and text and len(text) > 200:
                filename = f"wiki_{topic.lower().replace('/', '_')}.md"
                filepath = domain_dir / filename
                
                formatted_doc = format_markdown_article(
                    title=title,
                    url=url,
                    source="Wikipedia Open Corpus (CC BY-SA 3.0)",
                    domain=domain.capitalize(),
                    content=text
                )
                
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(formatted_doc)
                
                total_fetched += 1
                logger.info(f"Saved Wikipedia article: {title} -> {filepath.name}")
            
            time.sleep(0.5) # Polite request delay

    # 2. Fetch Open Developer Roadmaps
    roadmap_docs = fetch_roadmap_sh_guides()
    for title, url, domain, content in roadmap_docs:
        domain_dir = DATA_DIR / domain
        filename = f"roadmap_{title.lower().replace(' ', '_')}.md"
        filepath = domain_dir / filename
        
        formatted_doc = format_markdown_article(
            title=title,
            url=url,
            source="roadmap.sh Open Source (GitHub)",
            domain=domain.capitalize(),
            content=content
        )
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(formatted_doc)
        
        total_fetched += 1
        logger.info(f"Saved Roadmap guide: {title} -> {filepath.name}")

    logger.info(f"🎉 Completed Open Data Ingestion! Total articles saved: {total_fetched}")

if __name__ == "__main__":
    run_open_data_ingestion()
