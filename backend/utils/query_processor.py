# ============================================================
# IntelliChoice — Query Preprocessor Module (5.2 Specification)
# ============================================================

import re
import unicodedata
from typing import List
from pydantic import BaseModel

from backend.config import get_nlp_config

# ── Dynamic NLP Configuration Loader ──────────────────────
def get_stopwords() -> set:
    config = get_nlp_config()
    return set(config.get("stopwords", []))

def get_contractions() -> dict:
    config = get_nlp_config()
    return config.get("contractions", {})


# ── Processed Query Dataclass ──────────────────────────────
class ProcessedQuery(BaseModel):
    raw_query: str
    cleaned_query: str
    normalized_query: str
    tokens: List[str]
    keywords: List[str]

# ============================================================
# QUERY PREPROCESSING PIPELINE (Section 5.2)
# ============================================================
def clean_text(text: str) -> str:
    """1. Text Cleaning: Removal of unnecessary characters, symbols, and extra spaces"""
    # Normalize unicode characters
    text = unicodedata.normalize("NFKD", text)
    # Remove HTML tags if any
    text = re.sub(r"<[^>]+>", " ", text)
    # Remove URLs if any
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    # Remove special characters except alphanumeric, basic punctuation and spaces
    text = re.sub(r"[^\w\s\?\!\,\.\-\']", " ", text)
    # Collapse multiple whitespaces into a single space
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_text(text: str) -> str:
    """2. Normalization: Lowercasing + Expansion of contractions"""
    text = text.lower()
    contractions = get_contractions()
    for contraction, expansion in contractions.items():
        text = re.sub(rf"\b{re.escape(contraction)}\b", expansion, text)
    return text

def tokenize(text: str) -> List[str]:
    """3. Tokenization: Breaking query into smaller meaningful units"""
    # Extract alphanumeric words/tokens
    tokens = re.findall(r"\b[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?\b", text)
    return tokens

def remove_stopwords(tokens: List[str]) -> List[str]:
    """4. Stopword Removal: Eliminating common words (e.g., 'is', 'the', 'and')"""
    stopwords = get_stopwords()
    filtered_tokens = [token for token in tokens if token.lower() not in stopwords]
    return filtered_tokens

def preprocess_query(query: str) -> ProcessedQuery:
    """Full 5.2 Query Preprocessing Pipeline"""
    cleaned = clean_text(query)
    normalized = normalize_text(cleaned)
    raw_tokens = tokenize(normalized)
    keywords = remove_stopwords(raw_tokens)

    return ProcessedQuery(
        raw_query=query,
        cleaned_query=cleaned,
        normalized_query=normalized,
        tokens=raw_tokens,
        keywords=keywords
    )

# ============================================================
# TEST RUNNER
# ============================================================
if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    print("=== IntelliChoice Query Preprocessor Test ===")
    
    test_queries = [
        "   Should I pursue an MBA now, or wait for 2 years???  ",
        "What are the best tax-saving investment options for salaried employees in 2026?",
        "Don't know if I shouldn't switch jobs! <script>alert(1)</script> https://example.com",
        "how to hack bank database"
    ]

    for q in test_queries:
        result = preprocess_query(q)
        print(f"\nRaw Input: '{result.raw_query}'")
        print(f"Cleaned:   '{result.cleaned_query}'")
        print(f"Normalized:'{result.normalized_query}'")
        print(f"Tokens:    {result.tokens}")
        print(f"Keywords:  {result.keywords}")
