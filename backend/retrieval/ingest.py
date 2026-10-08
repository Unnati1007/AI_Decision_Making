# ============================================================
# IntelliChoice — Knowledge Base Ingestion Script
# ============================================================

import os
import re
import glob
import sys
import yaml
import logging
from typing import List, Dict, Any, Tuple

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.retrieval.embedder import embed_texts
from backend.retrieval.vector_store import FAISSVectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.ingest")

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
VECTOR_DB_DIR = os.path.join(PROJECT_ROOT, "vector_db")

DOMAINS = ["career", "finance", "legal", "wellbeing"]

def parse_markdown_file(filepath: str, default_domain: str) -> Tuple[str, Dict[str, Any]]:
    """
    Parses YAML frontmatter (if present) and text body from a Markdown file.
    Returns (body_text, metadata_dict).
    """
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    metadata = {
        "source": os.path.basename(filepath),
        "filepath": filepath,
        "domain": default_domain,
        "title": os.path.splitext(os.path.basename(filepath))[0].replace("_", " ").title(),
        "url": ""
    }

    # Match YAML header: --- \n ... \n ---
    yaml_match = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", content, re.DOTALL)
    if yaml_match:
        yaml_str = yaml_match.group(1)
        body = yaml_match.group(2).strip()
        try:
            parsed_meta = yaml.safe_load(yaml_str)
            if isinstance(parsed_meta, dict):
                for k, v in parsed_meta.items():
                    if v is not None:
                        metadata[k] = str(v)
        except Exception as e:
            logger.warning(f"Error parsing YAML header in {filepath}: {e}")
    else:
        body = content.strip()

    return body, metadata

def run_ingestion():
    """Builds or rebuilds the FAISS vector index from all markdown files in data/."""
    logger.info("🚀 Starting Knowledge Base Ingestion...")

    all_chunks: List[str] = []
    all_metadatas: List[Dict[str, Any]] = []

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,    # ~250 words per chunk to fit strictly within 1800 token budget
        chunk_overlap=150,  # ~30 words overlap
        separators=["\n\n", "\n", " ", ""]
    )

    file_count = 0
    for domain in DOMAINS:
        domain_dir = os.path.join(DATA_DIR, domain)
        if not os.path.exists(domain_dir):
            continue

        md_files = glob.glob(os.path.join(domain_dir, "**", "*.md"), recursive=True)
        for filepath in md_files:
            body, meta = parse_markdown_file(filepath, domain)
            if not body or len(body.strip()) < 10:
                continue

            chunks = text_splitter.split_text(body)
            for i, chunk in enumerate(chunks):
                chunk_meta = meta.copy()
                chunk_meta["chunk_id"] = i
                all_chunks.append(chunk)
                all_metadatas.append(chunk_meta)

            file_count += 1

    logger.info(f"Loaded {file_count} files across {len(DOMAINS)} domains into {len(all_chunks)} text chunks.")

    if not all_chunks:
        logger.error("No valid markdown chunks found in data/ directories!")
        return

    logger.info("Generating embeddings using all-MiniLM-L6-v2...")
    embeddings = embed_texts(all_chunks)

    vector_store = FAISSVectorStore(dimension=384)
    vector_store.add_documents(all_chunks, embeddings, all_metadatas)
    vector_store.save(VECTOR_DB_DIR)

    logger.info(f"✅ Ingestion complete! Index saved to {VECTOR_DB_DIR} with {vector_store.total_documents} vectors.")

if __name__ == "__main__":
    run_ingestion()
