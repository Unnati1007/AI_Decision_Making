# ============================================================
# IntelliChoice — Query Preprocessor Module (5.2 Specification)
# ============================================================

import re
import unicodedata
from typing import List
from pydantic import BaseModel

# ── English Stopwords Set ──────────────────────────────────
ENGLISH_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
    "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
    "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
    "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
    "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
    "yourself", "yourselves"
}

# ── Contractions Mapping ───────────────────────────────────
CONTRACTIONS = {
    "don't": "do not", "doesn't": "does not", "didn't": "did not",
    "can't": "cannot", "couldn't": "could not", "won't": "will not",
    "wouldn't": "would not", "shouldn't": "should not", "isn't": "is not",
    "aren't": "are not", "wasn't": "was not", "weren't": "were not",
    "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
    "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
    "it's": "it is", "we're": "we are", "they're": "they are",
    "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
    "i'll": "i will", "you'll": "you will", "he'll": "he will", "she'll": "she will",
    "we'll": "we will", "they'll": "they will", "what's": "what is", "where's": "where is"
}

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
    for contraction, expansion in CONTRACTIONS.items():
        text = re.sub(rf"\b{re.escape(contraction)}\b", expansion, text)
    return text

def tokenize(text: str) -> List[str]:
    """3. Tokenization: Breaking query into smaller meaningful units"""
    # Extract alphanumeric words/tokens
    tokens = re.findall(r"\b[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?\b", text)
    return tokens

def remove_stopwords(tokens: List[str]) -> List[str]:
    """4. Stopword Removal: Eliminating common words (e.g., 'is', 'the', 'and')"""
    filtered_tokens = [token for token in tokens if token.lower() not in ENGLISH_STOPWORDS]
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
