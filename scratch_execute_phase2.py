import os
import re
import glob
import sys
import yaml
import logging
import random
import pickle
import faiss
from typing import List, Dict, Any, Tuple

PROJECT_ROOT = os.path.abspath(".")
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.retrieval.embedder import embed_texts
from backend.retrieval.vector_store import FAISSVectorStore

print("=== EXECUTING PHASE 2: STRUCTURE-AWARE CHUNKING ===")

DATA_DIR = os.path.join(PROJECT_ROOT, "data")
VECTOR_DB_DIR = os.path.join(PROJECT_ROOT, "vector_db")
DOMAINS = ["career", "finance", "legal", "wellbeing"]

def parse_markdown_sections(filepath: str, default_domain: str) -> Tuple[List[Tuple[str, str]], Dict[str, Any]]:
    """
    Parses frontmatter and splits markdown into sections with headings.
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
        "source_type": "ai_curated",
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

    title = metadata.get("title", filename)

    # Split body into heading sections using regex for #, ##, ###
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
        
        # Split text inside section
        sub_chunks = splitter.split_text(text)
        for sc in sub_chunks:
            full_c = f"{header_prefix}{sc.strip()}"
            raw_chunks.append(full_c)

    if not raw_chunks:
        # Fallback if whole file is empty/tiny
        raw_chunks = [f"{title}\nEmpty Document"]

    # Post-process: Merge short chunks (< 200 chars) into neighbors unless total file < 200 chars
    total_file_len = sum(len(c) for c in raw_chunks)
    if total_file_len < 200:
        return raw_chunks, metadata

    merged_chunks: List[str] = []
    accum = ""

    for c in raw_chunks:
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

# Update backend/retrieval/ingest.py with Phase 2 chunking logic
ingest_phase2_code = '''# ============================================================
# IntelliChoice — Knowledge Base Ingestion Script (Phase 2)
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

def parse_markdown_sections(filepath: str, default_domain: str) -> Tuple[List[Tuple[str, str]], Dict[str, Any]]:
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    rel_source_file = os.path.relpath(filepath, DATA_DIR).replace("\\\\", "/")
    filename = os.path.basename(filepath)

    metadata = {
        "title": filename,
        "url": "",
        "domain": default_domain,
        "source_type": "ai_curated",
        "source_file": rel_source_file,
        "last_updated": "2026-10-08"
    }

    yaml_match = re.match(r"^---\s*\\r?\\n(.*?)\\r?\\n---\s*\\r?\\n(.*)$", content, re.DOTALL)
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

    title = metadata.get("title", filename)

    lines = body.split("\\n")
    sections: List[Tuple[str, str]] = []
    current_heading = title
    current_lines = []

    for line in lines:
        h_match = re.match(r"^(#{1,3})\s+(.*)$", line)
        if h_match:
            if current_lines:
                sec_text = "\\n".join(current_lines).strip()
                if sec_text:
                    sections.append((current_heading, sec_text))
                current_lines = []
            current_heading = h_match.group(2).strip()
        else:
            current_lines.append(line)

    if current_lines:
        sec_text = "\\n".join(current_lines).strip()
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
        separators=["\\n## ", "\\n### ", "\\n\\n", "\\n", ". ", " "]
    )

    raw_chunks: List[str] = []

    for heading, text in sections:
        header_prefix = f"{title} > {heading}\\n" if heading != title else f"{title}\\n"
        if len(text.strip()) == 0:
            continue
        
        sub_chunks = splitter.split_text(text)
        for sc in sub_chunks:
            full_c = f"{header_prefix}{sc.strip()}"
            raw_chunks.append(full_c)

    if not raw_chunks:
        raw_chunks = [f"{title}\\nEmpty Document"]

    total_file_len = sum(len(c) for c in raw_chunks)
    if total_file_len < 200:
        return raw_chunks, metadata

    merged_chunks: List[str] = []
    accum = ""

    for c in raw_chunks:
        if not accum:
            accum = c
        elif len(accum) < 200:
            accum = accum + "\\n\\n" + c
        else:
            merged_chunks.append(accum)
            accum = c

    if accum:
        if merged_chunks and len(accum) < 200:
            merged_chunks[-1] = merged_chunks[-1] + "\\n\\n" + accum
        else:
            merged_chunks.append(accum)

    return merged_chunks, metadata

def run_ingestion():
    logger.info("🚀 Starting Knowledge Base Ingestion (Phase 2 Structure-Aware)...")

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

        # Assertion: every file yields >= 1 chunk
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

    vector_store = FAISSVectorStore(dimension=384)
    vector_store.add_documents(all_chunks, embeddings, all_metadatas)
    vector_store.save(VECTOR_DB_DIR)

    total_chunks = len(all_chunks)
    sum_chunks = sum(per_file_chunk_counts.values())

    # Assertions
    assert vector_store.total_documents == total_chunks == sum_chunks, \\
        f"Assertion Failed! ntotal ({vector_store.total_documents}) != len(metadata) ({total_chunks}) != sum(per_file_counts) ({sum_chunks})"

    logger.info(f"✅ Ingestion assertions passed! Index saved with {vector_store.total_documents} vectors.")

    return per_file_chunk_counts, total_chunks, all_metadatas, all_md_files, all_chunks

if __name__ == "__main__":
    run_ingestion()
'''

with open("backend/retrieval/ingest.py", "w", encoding="utf-8") as f:
    f.write(ingest_phase2_code)

print("Updated backend/retrieval/ingest.py with Phase 2 structure-aware chunking.")

# Run ingestion
import backend.retrieval.ingest as ing
per_file_counts, total_chunks, all_metadatas, all_md_files, all_chunks = ing.run_ingestion()

# Measure Phase 2 Evidence
char_lens = [len(c) for c in all_chunks]
token_lens = [len(c) // 4 for c in all_chunks]

min_char = min(char_lens)
avg_char = sum(char_lens) / len(char_lens)
max_char = max(char_lens)

min_token = min(token_lens)
avg_token = sum(token_lens) / len(token_lens)
max_token = max(token_lens)

# Programmatic check for mid-sentence cuts:
# A chunk is cut mid-sentence if its last non-whitespace character is NOT in [. ! ? : ) " ' `] AND not a list/table item ending
valid_sentence_endings = ('.', '!', '?', ':', ')', '"', "'", '`', '|', '-')
mid_sentence_cuts = 0
for c in all_chunks:
    c_clean = c.strip()
    if not c_clean.endswith(valid_sentence_endings):
        mid_sentence_cuts += 1

mid_sentence_pct = (mid_sentence_cuts / len(all_chunks)) * 100.0

top_k = 4
top_k_tokens = top_k * avg_token
budget = 1800
fits_budget = top_k_tokens <= budget

print("\n" + "="*70)
print("             PHASE 2 CHUNKING EVIDENCE REPORT")
print("="*70)
print(f"Total Chunks        : {total_chunks}")
print(f"Chunk Length Chars  : Min={min_char}, Avg={avg_char:.1f}, Max={max_char}")
print(f"Chunk Length Tokens : Min={min_token}, Avg={avg_token:.1f}, Max={max_token}")
print(f"Mid-Sentence Cuts   : {mid_sentence_cuts} / {total_chunks} ({mid_sentence_pct:.2f}%)")
print(f"Top-{top_k} x Avg Tokens = {top_k_tokens:.1f} tokens vs {budget} budget -> Fits? {fits_budget}")

print("\n--- 10 RANDOM CHUNKS IN FULL ---")
random.seed(42)
sample_indices = random.sample(range(len(all_chunks)), 10)
for idx_i, idx in enumerate(sample_indices, 1):
    m = all_metadatas[idx]
    c_text = all_chunks[idx]
    print(f"\n--- SAMPLE CHUNK #{idx_i} [File: {m['source_file']} | Index: {m['chunk_index']} | Length: {len(c_text)} chars] ---")
    print(c_text)
    print("-" * 50)
