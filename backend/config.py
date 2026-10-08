# ============================================================
# IntelliChoice — System Configuration & Dynamic Loader
# ============================================================

import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("intellichoice.config")

# ── Base Directory Paths ───────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = DATA_DIR / "config"

# ── Environment & Model Configurations ────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
STACKEXCHANGE_KEY = os.getenv("STACKEXCHANGE_KEY", "")
EMBED_MODEL_NAME = os.getenv("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gpt-4o-mini")

MIN_QUERY_LENGTH = int(os.getenv("MIN_QUERY_LENGTH", "8"))
MAX_QUERY_LENGTH = int(os.getenv("MAX_QUERY_LENGTH", "1000"))
RELEVANCE_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.35"))

# ── Dynamic Config Loaders ─────────────────────────────────
def load_json_config(filename: str, default: dict) -> dict:
    filepath = CONFIG_DIR / filename
    if not filepath.exists():
        logger.warning(f"Config file missing: {filepath}. Using default fallback.")
        return default
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading {filepath}: {e}. Using fallback.")
        return default

def get_domain_keywords() -> list:
    data = load_json_config("domain_keywords.json", {"domains": {}})
    keywords = []
    for domain, kw_list in data.get("domains", {}).items():
        keywords.extend(kw_list)
    return keywords

def get_security_rules() -> dict:
    return load_json_config("security_rules.json", {
        "blocked_keywords": ["hack", "exploit", "jailbreak"],
        "injection_patterns": [r"ignore\s+(all\s+)?instructions"]
    })

def get_nlp_config() -> dict:
    return load_json_config("stopwords_contractions.json", {
        "stopwords": ["the", "is", "at", "which", "on"],
        "contractions": {"don't": "do not"}
    })
