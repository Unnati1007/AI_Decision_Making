# ============================================================
# IntelliChoice — Manual PDF Extractor & Quality Gate Evaluator
# ============================================================

import os
import sys
import glob
import re
import datetime
import hashlib
from pathlib import Path

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.scraper.quality_gate import evaluate_quality_gate

MANUAL_DIR = Path(PROJECT_ROOT) / "data" / "_manual_sources" / "finance"
STAGING_DIR = Path(PROJECT_ROOT) / "data" / "_staging" / "finance"


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a PDF file using available libraries (pypdf, pdfplumber, pypdf2)."""
    text = ""
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except ImportError:
        pass

    try:
        import pypdf2
        reader = pypdf2.PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception:
        pass

    return ""


def parse_sidecar_txt(sidecar_path: str) -> dict:
    """Parses key-value pairs from a sidecar .txt file."""
    meta = {
        "url": "",
        "owner": "Official Source",
        "policy_sentence": "not found",
        "reuse_status": "unclear"
    }
    with open(sidecar_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if ":" in line:
                key, val = line.split(":", 1)
                meta[key.strip().lower()] = val.strip()
    return meta


def run_manual_pdf_extraction():
    MANUAL_DIR.mkdir(parents=True, exist_ok=True)
    STAGING_DIR.mkdir(parents=True, exist_ok=True)

    pdf_files = glob.glob(os.path.join(str(MANUAL_DIR), "*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {MANUAL_DIR}. Skipping manual PDF extraction.")
        return []

    processed_results = []
    for pdf_path in pdf_files:
        base_name = os.path.splitext(os.path.basename(pdf_path))[0]
        sidecar_path = os.path.join(str(MANUAL_DIR), f"{base_name}.txt")

        if not os.path.exists(sidecar_path):
            print(f"Skipping {base_name}.pdf: Missing required sidecar file {base_name}.txt")
            continue

        sidecar_meta = parse_sidecar_txt(sidecar_path)
        raw_text = extract_text_from_pdf(pdf_path)

        if not raw_text or len(raw_text.strip()) == 0:
            print(f"Failed to extract text from {base_name}.pdf")
            continue

        sha256_val = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        title = base_name.replace("_", " ").title()

        frontmatter = f"""---
title: "{title}"
url: "{sidecar_meta.get('url', '')}"
fetched_at: "{timestamp}"
license: "Official Manual PDF (Sidecar)"
license_source: "manual_sidecar"
reuse_status: "{sidecar_meta.get('reuse_status', 'unclear')}"
policy_sentence: "{sidecar_meta.get('policy_sentence', 'not found')}"
sha256: "{sha256_val}"
source_type: "official_gov"
domain: "finance"
owner: "{sidecar_meta.get('owner', 'Official Body')}"
---

# {title}

{raw_text}
"""
        out_filename = f"manual_{base_name}.md"
        out_filepath = STAGING_DIR / out_filename
        with open(out_filepath, "w", encoding="utf-8") as out_f:
            out_f.write(frontmatter)

        gate_res = evaluate_quality_gate(
            text=raw_text,
            expected_topic=title,
            url=sidecar_meta.get("url", ""),
            status_code=200,
            license_text="Official Manual PDF (Sidecar)",
            current_filepath=str(out_filepath),
            data_dir=str(Path(PROJECT_ROOT) / "data")
        )

        processed_results.append({
            "pdf": base_name,
            "out_file": out_filename,
            "gate": gate_res
        })
        print(f"Extracted {base_name}.pdf -> {out_filename} (Quality Gate: {'PASS' if gate_res['passed'] else 'FAIL'})")

    return processed_results


if __name__ == "__main__":
    run_manual_pdf_extraction()
