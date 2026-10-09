# ============================================================
# IntelliChoice — System Configuration & Dynamic Loader
# ============================================================

import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv

# ── Base Directory Paths ───────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CONFIG_DIR = DATA_DIR / "config"

env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path, override=True)
load_dotenv(override=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("intellichoice.config")

# ── Environment & Model Configurations ────────────────────
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "").strip()
STACKEXCHANGE_KEY = os.getenv("STACKEXCHANGE_KEY", "").strip()
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", os.getenv("EMBED_MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"))
EMBED_MODEL_NAME = EMBEDDING_MODEL
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "gemini-2.5-flash" if GEMINI_API_KEY else "gpt-4o-mini")

MIN_QUERY_LENGTH = int(os.getenv("MIN_QUERY_LENGTH", "8"))
MAX_QUERY_CHARS = int(os.getenv("MAX_QUERY_CHARS", "1000"))
MAX_ANSWER_CHARS = int(os.getenv("MAX_ANSWER_CHARS", "4000"))
MIN_VALID_WORD_RATIO = float(os.getenv("MIN_VALID_WORD_RATIO", "0.50"))  # PLACEHOLDER, uncalibrated, Phase 6

# Thresholds are uncalibrated placeholders (to be calibrated in Phase 6)
RELEVANCE_THRESHOLD = float(os.getenv("RELEVANCE_THRESHOLD", "0.20"))  # PLACEHOLDER, uncalibrated
TAVILY_TRIGGER_THRESHOLD = float(os.getenv("TAVILY_TRIGGER_THRESHOLD", "0.35"))  # PLACEHOLDER, uncalibrated
DOMAIN_ROUTER_THRESHOLD = float(os.getenv("DOMAIN_ROUTER_THRESHOLD", "0.25"))  # PLACEHOLDER, uncalibrated

MAX_TOKEN_BUDGET = int(os.getenv("MAX_TOKEN_BUDGET", "1800"))
TOP_K_DEFAULT = int(os.getenv("TOP_K_DEFAULT", "4"))
MAX_CHUNKS_PER_FILE = int(os.getenv("MAX_CHUNKS_PER_FILE", "2"))

def log_startup_config():
    logger.info("=== IntelliChoice System Configuration Loaded ===")
    logger.info(f"  EMBEDDING_MODEL          : {EMBEDDING_MODEL}")
    logger.info(f"  EMBEDDING_DIM            : {EMBEDDING_DIM}")
    logger.info(f"  LLM_MODEL_NAME           : {LLM_MODEL_NAME}")
    logger.info(f"  MIN_VALID_WORD_RATIO     : {MIN_VALID_WORD_RATIO} (PLACEHOLDER, uncalibrated, Phase 6)")
    logger.info(f"  RELEVANCE_THRESHOLD      : {RELEVANCE_THRESHOLD} (PLACEHOLDER, uncalibrated, Phase 6)")
    logger.info(f"  TAVILY_TRIGGER_THRESHOLD : {TAVILY_TRIGGER_THRESHOLD} (PLACEHOLDER, uncalibrated, Phase 6)")
    logger.info(f"  DOMAIN_ROUTER_THRESHOLD  : {DOMAIN_ROUTER_THRESHOLD} (PLACEHOLDER, uncalibrated, Phase 6)")
    logger.info(f"  MAX_TOKEN_BUDGET         : {MAX_TOKEN_BUDGET}")
    logger.info(f"  TOP_K_DEFAULT            : {TOP_K_DEFAULT}")

log_startup_config()

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
