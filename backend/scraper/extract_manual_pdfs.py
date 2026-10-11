# ============================================================
# IntelliChoice — Manual PDF Extractor & Quality Gate Evaluator
# ============================================================

import os
import sys
import glob
import datetime
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.scraper.quality_gate import evaluate_quality_gate

MANUAL_BASE_DIR = Path(PROJECT_ROOT) / "data" / "_manual_sources"
STAGING_BASE_DIR = Path(PROJECT_ROOT) / "data" / "_staging"

# Default backwards-compatible constants
MANUAL_DIR = MANUAL_BASE_DIR / "finance"
STAGING_DIR = STAGING_BASE_DIR / "finance"


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts raw text from a PDF file using available libraries (pypdf, pdfplumber, pypdf2, pymupdf)."""
    # 1. Try pypdf (primary)
    try:
        import pypdf
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        if text.strip():
            return text.replace("\x00", "")
    except ImportError:
        pass
    except Exception:
        pass

    # 2. Try pdfplumber (optional)
    try:
        import pdfplumber  # type: ignore
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
        if text.strip():
            return text.replace("\x00", "")
    except ImportError:
        pass
    except Exception:
        pass

    # 3. Try pypdf2 (optional)
    try:
        import pypdf2  # type: ignore
        reader = pypdf2.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        if text.strip():
            return text.replace("\x00", "")
    except ImportError:
        pass
    except Exception:
        pass

    # 4. Try fitz / PyMuPDF (optional)
    try:
        import fitz  # type: ignore
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            t = page.get_text()
            if t:
                text += t + "\n"
        if text.strip():
            return text.replace("\x00", "")
    except ImportError:
        pass
    except Exception:
        pass

    return ""


def parse_sidecar_txt(sidecar_path: str) -> dict:
    """Parses key-value pairs from a sidecar .txt file."""
    meta = {
        "url": "",
        "owner": "Official Source",
        "reuse_sentence": "NOT FOUND",
        "reuse_status": "unclear"
    }
    with open(sidecar_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            if ":" in line:
                key, val = line.split(":", 1)
                meta[key.strip().lower()] = val.strip()
    return meta


def run_manual_pdf_extraction(
    domain: Optional[str] = None,
    manual_base_dir: Optional[Path] = None,
    staging_base_dir: Optional[Path] = None
) -> List[Dict[str, Any]]:
    """
    Extracts manual PDFs and evaluates them through the Quality Gate.
    If domain is specified, processes that domain directory.
    If domain is None, scans all domain subdirectories under manual_base_dir.
    """
    base_manual = manual_base_dir if manual_base_dir is not None else MANUAL_BASE_DIR
    base_staging = staging_base_dir if staging_base_dir is not None else STAGING_BASE_DIR

    base_manual.mkdir(parents=True, exist_ok=True)
    base_staging.mkdir(parents=True, exist_ok=True)

    if domain:
        domains_to_process = [domain]
    else:
        subdirs = [d.name for d in base_manual.iterdir() if d.is_dir() and not d.name.startswith(".")]
        domains_to_process = subdirs if subdirs else ["finance"]

    all_processed_results = []

    for dom in domains_to_process:
        manual_dir = base_manual / dom
        staging_dir = base_staging / dom
        manual_dir.mkdir(parents=True, exist_ok=True)
        staging_dir.mkdir(parents=True, exist_ok=True)

        pdf_files = glob.glob(os.path.join(str(manual_dir), "*.pdf"))
        if not pdf_files:
            print(f"No PDFs found in {manual_dir}. Skipping manual PDF extraction for '{dom}'.")
            continue

        for pdf_path in sorted(pdf_files):
            base_name = os.path.splitext(os.path.basename(pdf_path))[0]
            sidecar_path = os.path.join(str(manual_dir), f"{base_name}.txt")

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
            doc_domain = sidecar_meta.get("domain", dom)
            doc_url = sidecar_meta.get("url", "")
            owner = sidecar_meta.get("owner", "Official Body")

            # Check sidecar REUSE_SENTENCE
            reuse_sentence = sidecar_meta.get("reuse_sentence", "").strip()
            if not reuse_sentence:
                reuse_sentence = sidecar_meta.get("policy_sentence", "").strip()

            is_reuse_missing = (not reuse_sentence) or (reuse_sentence.upper() == "NOT FOUND")

            body_text = f"# {title}\n\n{raw_text}"

            if is_reuse_missing:
                source_type = "reference_only"
                license_text = "Unverified / Reference Only (no reuse sentence)"
                gate_res = {
                    "passed": False,
                    "fail_reason": "no reuse sentence",
                    "words": len(body_text.split()),
                    "nav_ratio": 0.0,
                    "language": "en"
                }
            else:
                source_type = "official_gov"
                license_text = reuse_sentence
                # Quality Gate call passing ONLY body text (not frontmatter)
                gate_res = evaluate_quality_gate(
                    text=body_text,
                    expected_topic=title,
                    url=doc_url,
                    status_code=200,
                    license_text=license_text,
                    current_filepath=str(staging_dir / f"manual_{base_name}.md"),
                    data_dir=str(Path(PROJECT_ROOT) / "data"),
                    source_type="official_gov",
                    expected_title=title
                )

            frontmatter = f"""---
title: "{title}"
url: "{doc_url}"
fetched_at: "{timestamp}"
license: "{license_text}"
license_source: "manual_sidecar"
reuse_sentence: "{reuse_sentence if reuse_sentence else 'NOT FOUND'}"
sha256: "{sha256_val}"
source_type: "{source_type}"
domain: "{doc_domain}"
owner: "{owner}"
---

# {title}

{raw_text}
"""
            out_filename = f"manual_{base_name}.md"
            out_filepath = staging_dir / out_filename
            with open(out_filepath, "w", encoding="utf-8") as out_f:
                out_f.write(frontmatter)

            all_processed_results.append({
                "domain": doc_domain,
                "pdf": base_name,
                "out_file": out_filename,
                "source_type": source_type,
                "gate": gate_res
            })
            print(f"Extracted {base_name}.pdf -> {out_filename} | source_type: {source_type} | Gate: {'PASS' if gate_res['passed'] else 'FAIL'} (Reason: {gate_res.get('fail_reason', 'None')})")

    return all_processed_results


if __name__ == "__main__":
    run_manual_pdf_extraction()
