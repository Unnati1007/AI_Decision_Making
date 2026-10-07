# ============================================================
# IntelliChoice — Scraped Data Cleaner & Sanitizer
# ============================================================

import re
import unicodedata

def clean_scraped_text(raw_text: str) -> str:
    """Cleans scraped raw text, removing HTML, extra spaces, and weird characters."""
    if not raw_text:
        return ""
    
    # 1. Normalize unicode characters
    text = unicodedata.normalize("NFKD", raw_text)
    
    # 2. Remove HTML tags
    text = re.sub(r"<[^>]+>", " ", text)
    
    # 3. Remove multiple blank lines / excessive whitespaces
    text = re.sub(r"\n\s*\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    
    return text.strip()

def format_markdown_article(title: str, url: str, source: str, domain: str, content: str) -> str:
    """Formats scraped content into structured Markdown with metadata header for RAG citations."""
    cleaned_content = clean_scraped_text(content)
    
    markdown_doc = f"""---
title: "{title}"
url: "{url}"
source: "{source}"
domain: "{domain}"
---

# {title}

**Source Citation**: [{source}]({url})
**Domain**: {domain}

---

{cleaned_content}
"""
    return markdown_doc
