# ============================================================
# IntelliChoice — Official Government Pages Fetcher Script
# ============================================================

import os
import sys
import re
import requests

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.scraper.quality_gate import evaluate_quality_gate

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

candidates = [
    ("SIP and mutual fund basics", "AMFI India", "https://www.amfiindia.com/investor-corner/knowledge-center/what-is-mutual-fund.html"),
    ("income tax old vs new regime concept", "Income Tax Portal", "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable"),
    ("EPF / PPF / NPS basics", "EPFO India", "https://www.epfindia.gov.in/site_en/index.php"),
    ("EPF / PPF / NPS basics", "PFRDA Official", "https://www.pfrda.org.in/index1.pgsql?lsid=165"),
    ("term vs endowment insurance", "IRDAI Portal", "https://irdai.gov.in/life-insurance")
]

def fetch_official_sources():
    for topic, owner, url in candidates:
        print(f"Testing Topic: {topic} | Owner: {owner}")
        print(f"  Target URL: {url}")
        try:
            r = requests.get(url, headers=headers, timeout=10, verify=False)
            status = r.status_code
            print(f"  HTTP Status: {status}")
            if status == 200:
                html = r.text
                text = re.sub(r'<script.*?>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
                text = re.sub(r'<style.*?>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
                text = re.sub(r'<.*?>', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()
                
                copyright_lines = [line.strip() for line in r.text.split("\n") if "copyright" in line.lower() or "reserved" in line.lower()]
                copyright_found = copyright_lines[0] if copyright_lines else "not found"
                print(f"  Copyright line: {copyright_found[:80]}")
                print(f"  Extracted Words: {len(text.split())}")
                
                gate = evaluate_quality_gate(text, topic, url, status_code=status, license_text=copyright_found[:50], data_dir="data")
                print(f"  Quality Gate: {'PASS' if gate['passed'] else 'FAIL'} (Reason: {gate['fail_reason']})")
            else:
                print(f"  Fetch failed with status {status}")
        except Exception as e:
            print(f"  Fetch Exception: {e}")
        print("-" * 60)

if __name__ == "__main__":
    fetch_official_sources()
