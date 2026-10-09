# Manual Finance PDF Ingestion Directory

Place official government or regulator PDF documents in this directory for manual ingestion into the IntelliChoice knowledge base.

## Instructions:
1. Place the `.pdf` file in this directory (e.g. `income_tax_act.pdf`).
2. Create a required sidecar plain-text file with the exact same filename prefix and `.txt` extension (e.g. `income_tax_act.txt`).
3. The sidecar `.txt` file MUST contain the following three lines:
   - `url: <source_url>`
   - `owner: <official_publisher_or_agency>`
   - `policy_sentence: <exact_copyright_or_reuse_permission_sentence>`
   - `reuse_status: <allowed|unclear>`

The ingestion script `backend/scraper/extract_manual_pdfs.py` will process PDFs only when a valid sidecar `.txt` file exists.
