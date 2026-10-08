import os
import glob
import yaml
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== WIKIPEDIA VERIFICATION (20 KEPT FILES) ===")

kept_wiki_files = glob.glob("data/**/wiki_*.md", recursive=True)
kept_wiki_files = sorted([f for f in kept_wiki_files if "_archive_wiki" not in f])

print(f"Kept Wikipedia files count: {len(kept_wiki_files)}\n")

for wf in kept_wiki_files:
    fname = os.path.basename(wf)
    with open(wf, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    fm = {}
    body = content
    yaml_match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n(.*)$", content, re.DOTALL)
    if yaml_match:
        try:
            fm = yaml.safe_load(yaml_match.group(1)) or {}
            body = yaml_match.group(2)
        except Exception:
            pass

    # Strip metadata lines from body to get clean body
    clean_body = re.sub(r"^\*\*Source Citation\*\*:.*$", "", body, flags=re.MULTILINE)
    clean_body = re.sub(r"^\*\*Category\*\*:.*$", "", clean_body, flags=re.MULTILINE)
    clean_body = re.sub(r"^\*\*Domain\*\*:.*$", "", clean_body, flags=re.MULTILINE)
    clean_body = clean_body.strip()

    words = len(clean_body.split())
    url = fm.get("url", "")
    preview = clean_body[:200].replace("\n", " ")

    print(f"Filename  : {fname}")
    print(f"URL       : {url}")
    print(f"Word Count: {words}")
    print(f"Body Preview (first 200 chars):")
    print(f"  \"{preview}...\"")
    print("-" * 75)
