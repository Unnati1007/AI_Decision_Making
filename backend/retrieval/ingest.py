# ============================================================
# IntelliChoice — Knowledge Base Ingestion Script (Phase 2 Fixed)
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
from backend.config import EMBEDDING_DIM
from backend.retrieval.embedder import embed_texts
from backend.retrieval.vector_store import FAISSVectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.ingest")

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
VECTOR_DB_DIR = os.path.join(PROJECT_ROOT, "vector_db")
DOMAINS = ["career", "finance", "legal", "wellbeing"]

def parse_markdown_sections(filepath: str, default_domain: str) -> Tuple[List[Tuple[str, str]], Dict[str, Any]]:
    """
    Parses YAML frontmatter and markdown sections.
    Strips inline metadata lines (**Source Citation**, **Category**, **Domain**) from body text.
    Returns (list_of_(section_heading, section_text), metadata_dict).
    """
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    rel_source_file = os.path.relpath(filepath, DATA_DIR).replace("\\", "/")
    filename = os.path.basename(filepath)

    metadata = {
        "title": filename,
        "url": "",
        "domain": default_domain,
        "source_type": "official_gov" if "gov" in filepath else ("official" if "onet" in filepath else ("wikipedia" if ("wiki_" in filename or "wiki_full" in filepath) else "ai_curated")),
        "source_file": rel_source_file,
        "last_updated": "2026-10-08"
    }

    yaml_match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$", content, re.DOTALL)
    if yaml_match:
        yaml_str = yaml_match.group(1)
        body = yaml_match.group(2).strip()
        try:
            parsed_meta = yaml.safe_load(yaml_str)
            if isinstance(parsed_meta, dict):
                for k, v in parsed_meta.items():
                    if v is not None and str(v).strip() != "":
                        metadata[k] = str(v)
        except Exception as e:
            pass
    else:
        body = content.strip()

    # Strip inline metadata lines from body text to prevent metadata leakage in chunk TEXT
    body = re.sub(r"^\*\*Source Citation\*\*:.*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"^\*\*Category\*\*:.*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"^\*\*Domain\*\*:.*$", "", body, flags=re.MULTILINE)
    body = body.strip()

    title = metadata.get("title", filename)

    lines = body.split("\n")
    sections: List[Tuple[str, str]] = []
    current_heading = title
    current_lines = []

    for line in lines:
        h_match = re.match(r"^(#{1,3})\s+(.*)$", line)
        if h_match:
            if current_lines:
                sec_text = "\n".join(current_lines).strip()
                if sec_text:
                    sections.append((current_heading, sec_text))
                current_lines = []
            current_heading = h_match.group(2).strip()
        else:
            current_lines.append(line)

    if current_lines:
        sec_text = "\n".join(current_lines).strip()
        if sec_text:
            sections.append((current_heading, sec_text))

    if not sections:
        sections = [(title, body)]

    return sections, metadata

def chunk_file_phase2(filepath: str, default_domain: str) -> Tuple[List[str], Dict[str, Any]]:
    sections, metadata = parse_markdown_sections(filepath, default_domain)
    title = metadata.get("title", os.path.basename(filepath))

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "]
    )

    raw_chunks: List[str] = []

    for heading, text in sections:
        header_prefix = f"{title} > {heading}\n" if heading != title else f"{title}\n"
        if len(text.strip()) == 0:
            continue
        
        sub_chunks = splitter.split_text(text)
        for sc in sub_chunks:
            sc_clean = sc.strip()
            if len(sc_clean) == 0:
                continue
            full_c = f"{header_prefix}{sc_clean}"
            raw_chunks.append(full_c)

    # Filter out chunks that contain ONLY headers or metadata lines with no real content
    valid_chunks = []
    for c in raw_chunks:
        lines = [l.strip() for l in c.split("\n") if l.strip()]
        # Check if there is body content beyond the header prefix line
        content_lines = lines[1:] if len(lines) > 1 else lines
        body_text = " ".join(content_lines).strip()
        if len(body_text) > 15: # Must have at least 15 characters of real body content
            valid_chunks.append(c)

    if not valid_chunks:
        valid_chunks = [f"{title}\n{sections[0][1] if sections else 'No content'}"]

    total_file_len = sum(len(c) for c in valid_chunks)
    if total_file_len < 200:
        return valid_chunks, metadata

    merged_chunks: List[str] = []
    accum = ""

    for c in valid_chunks:
        if not accum:
            accum = c
        elif len(accum) < 200:
            accum = accum + "\n\n" + c
        else:
            merged_chunks.append(accum)
            accum = c

    if accum:
        if merged_chunks and len(accum) < 200:
            merged_chunks[-1] = merged_chunks[-1] + "\n\n" + accum
        else:
            merged_chunks.append(accum)

    return merged_chunks, metadata

def run_ingestion():
    logger.info("🚀 Starting Knowledge Base Ingestion (Phase 2 Fixed)...")

    all_chunks: List[str] = []
    all_metadatas: List[Dict[str, Any]] = []
    per_file_chunk_counts: Dict[str, int] = {}

    all_md_files = []
    for domain in DOMAINS:
        domain_dir = os.path.join(DATA_DIR, domain)
        if not os.path.exists(domain_dir):
            continue
        md_files = glob.glob(os.path.join(domain_dir, "**", "*.md"), recursive=True) + glob.glob(os.path.join(domain_dir, "*.md"), recursive=True)
        md_files = sorted(list(set(os.path.normpath(f) for f in md_files if "_archive_wiki" not in f)))
        all_md_files.extend([(domain, f) for f in md_files])

    for domain, filepath in all_md_files:
        chunks, meta = chunk_file_phase2(filepath, domain)
        rel_file = meta["source_file"]

        assert len(chunks) >= 1, f"File {filepath} yielded 0 chunks!"
        per_file_chunk_counts[rel_file] = len(chunks)

        for i, chunk in enumerate(chunks):
            chunk_meta = meta.copy()
            chunk_meta["chunk_index"] = i
            assert chunk_meta["title"].strip() != "", f"Chunk {i} of {rel_file} has empty title!"
            all_chunks.append(chunk)
            all_metadatas.append(chunk_meta)

    logger.info(f"Loaded {len(all_md_files)} files across {len(DOMAINS)} domains into {len(all_chunks)} text chunks.")

    embeddings = embed_texts(all_chunks)

    vector_store = FAISSVectorStore(dimension=EMBEDDING_DIM)
    vector_store.add_documents(all_chunks, embeddings, all_metadatas)
    vector_store.save(VECTOR_DB_DIR)

    total_chunks = len(all_chunks)
    sum_chunks = sum(per_file_chunk_counts.values())

    assert vector_store.total_documents == total_chunks == sum_chunks, \
        f"Assertion Failed! ntotal ({vector_store.total_documents}) != len(metadata) ({total_chunks}) != sum(per_file_counts) ({sum_chunks})"

    logger.info(f"✅ Ingestion assertions passed! Index saved with {vector_store.total_documents} vectors.")

    return per_file_chunk_counts, total_chunks, all_metadatas, all_md_files, all_chunks

if __name__ == "__main__":
    run_ingestion()
