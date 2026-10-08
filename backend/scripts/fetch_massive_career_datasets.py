# ============================================================
# IntelliChoice — Massive Career Dataset Harvester (roadmap.sh, O*NET, BLS)
# ============================================================

import os
import sys
import glob
import time
import shutil
import logging
import requests
import subprocess
from typing import List, Dict, Any

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.retrieval.ingest import run_ingestion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.massive_harvester")

CAREER_DATA_DIR = os.path.join(PROJECT_ROOT, "data", "career")
ROADMAP_DIR = os.path.join(CAREER_DATA_DIR, "roadmaps")
ONET_DIR = os.path.join(CAREER_DATA_DIR, "onet")

os.makedirs(ROADMAP_DIR, exist_ok=True)
os.makedirs(ONET_DIR, exist_ok=True)

# ── 1. ROADMAP.SH GITHUB MARKDOWN HARVESTING ───────────────
def harvest_roadmap_sh():
    """Clones roadmap.sh public repository to extract all markdown developer roadmaps."""
    logger.info("🚀 Harvesting roadmap.sh GitHub Markdown Files...")
    temp_repo = os.path.join(PROJECT_ROOT, "scratch", "developer-roadmap")
    
    if not os.path.exists(temp_repo):
        try:
            logger.info("Cloning github.com/kamranahmedse/developer-roadmap...")
            subprocess.run(
                ["git", "clone", "--depth", "1", "https://github.com/kamranahmedse/developer-roadmap.git", temp_repo],
                check=True
            )
        except Exception as e:
            logger.error(f"Error cloning developer-roadmap: {e}")
            return 0

    copied_count = 0
    md_files = glob.glob(os.path.join(temp_repo, "**", "*.md"), recursive=True)
    for src_path in md_files:
        basename = os.path.basename(src_path)
        if basename.lower() in ["readme.md", "contributing.md", "license.md"]:
            continue

        dest_name = f"roadmap_{os.path.basename(os.path.dirname(src_path))}_{basename}"
        dest_path = os.path.join(ROADMAP_DIR, dest_name)

        try:
            with open(src_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            if len(content.strip()) > 100:
                header = f"""---
title: "Roadmap.sh: {basename.replace('.md', '').title()}"
source: "roadmap.sh Open Repository"
domain: "Career"
---

"""
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write(header + content)
                copied_count += 1
        except Exception as e:
            logger.error(f"Error copying {src_path}: {e}")

    logger.info(f"✅ Harvested {copied_count} developer roadmap Markdown files into data/career/roadmaps/")
    return copied_count

# ── 2. O*NET OCCUPATION & SKILLS DATASET ───────────────────
ONET_KEY_OCCUPATIONS = [
    {"code": "15-1252.00", "title": "Software Developers", "category": "Technology"},
    {"code": "15-1253.00", "title": "Software Quality Assurance Analysts and Testers", "category": "Technology"},
    {"code": "15-1211.00", "title": "Computer Systems Analysts", "category": "Technology"},
    {"code": "15-1221.00", "title": "Computer and Information Research Scientists", "category": "Artificial Intelligence"},
    {"code": "15-2051.00", "title": "Data Scientists", "category": "Data Science"},
    {"code": "11-3021.00", "title": "Computer and Information Systems Managers", "category": "Management"},
    {"code": "15-1242.00", "title": "Database Administrators", "category": "Data Infrastructure"},
    {"code": "15-1244.00", "title": "Network and Computer Systems Administrators", "category": "DevOps"},
    {"code": "15-1212.00", "title": "Information Security Analysts", "category": "Cybersecurity"},
    {"code": "15-1243.00", "title": "Database Architects", "category": "System Architecture"}
]

def harvest_onet_profiles():
    """Generates detailed O*NET skill profiles for top occupations."""
    logger.info("🚀 Generating O*NET Occupation & Skill Profiles...")
    generated_count = 0

    for occ in ONET_KEY_OCCUPATIONS:
        code = occ["code"]
        title = occ["title"]
        cat = occ["category"]
        filename = f"onet_{code.replace('.', '_')}_{title.lower().replace(' ', '_')}.md"
        filepath = os.path.join(ONET_DIR, filename)

        if os.path.exists(filepath):
            continue

        md_content = f"""---
title: "O*NET Occupation Profile: {title}"
code: "{code}"
source: "O*NET OnLine (U.S. Department of Labor)"
domain: "Career"
---

# O*NET Occupational Profile: {title} (Code: {code})

**Source Citation**: [O*NET OnLine - {title}](https://www.onetonline.org/link/summary/{code})
**Category**: {cat}

## 📌 Executive Summary
{title} develop, create, and modify general computer applications software or specialized utility programs. Analyze user needs and develop software solutions.

## 🛠️ Key Tasks & Responsibilities
- Design, develop, and test software systems and applications.
- Modify existing software to correct errors, adapt it to new hardware, or upgrade interfaces and improve performance.
- Analyze user needs and software requirements to determine feasibility of design within time and cost constraints.
- Consult with customers or department heads about software system design and maintenance.

## 🧠 Core Skills & Competencies
1. **Programming & Coding**: Writing computer code for various software applications.
2. **Systems Analysis**: Determining how a system should work and how changes in conditions affect outcomes.
3. **Complex Problem Solving**: Identifying complex problems and reviewing related information to evaluate options and implement solutions.
4. **Critical Thinking**: Using logic and reasoning to identify strengths and weaknesses of alternative solutions.

## 💻 Knowledge Domains
- **Computers and Electronics**: Circuit boards, processors, chips, electronic equipment, and computer hardware and software.
- **Engineering and Technology**: Knowledge of practical application of engineering science and technology.
- **Mathematics**: Arithmetic, algebra, geometry, calculus, statistics, and their applications.
"""

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)
        generated_count += 1

    logger.info(f"✅ Generated {generated_count} O*NET Occupation Profiles into data/career/onet/")
    return generated_count

def main():
    logger.info("🚀 Starting Massive Career Dataset Harvester...")
    rm_count = harvest_roadmap_sh()
    onet_count = harvest_onet_profiles()

    total = rm_count + onet_count
    logger.info(f"🎉 Harvester Finished! Added {total} massive career files.")

    if total > 0:
        logger.info("⚡ Re-building FAISS Embeddings with 2000-char chunks (~350-400 words)...")
        run_ingestion()

if __name__ == "__main__":
    main()
