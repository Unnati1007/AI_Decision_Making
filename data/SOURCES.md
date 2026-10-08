# IntelliChoice Knowledge Base Data Sources

| Source Type | Category / Description | License / Terms | File Count | Acquisition Method |
| --- | --- | --- | --- | --- |
| **`wikipedia`** | Full Wikipedia Articles (MediaWiki API extracts) | CC BY-SA 4.0 | 36 | Fetched via MediaWiki API (`prop=extracts&explaintext=1`), title redirect check enforced |
| **`wikipedia` (stubs)** | Old Wikipedia Summary Stubs (Archived) | CC BY-SA 3.0 | 10 | Archived to `data/_archive_wiki/` |
| **`official_gov`** | Official Government Portals & Labour Codes | Government of India Public Info | 4 | Direct HTTP fetch from `pib.gov.in`, `ncs.gov.in`, `epfindia.gov.in` (HTTP 200 verified) |
| **`roadmap_derived`** | Developer Role Roadmaps | Custom Copyright License | 6 | Open GitHub Markdown repositories (`data/career/role_roadmaps/`), attributed |
| **`ai_curated`** | Career Decision Frameworks & Guides | AI Synthetic Content | 39 | Model-generated decision playbooks (`source_type: ai_curated`) |

---

### Critical Transparency Note on AI-Curated Content

> **Important Disclosure**: All files marked with `source_type: ai_curated` are **AI-generated synthetic documents** created for scenario exploration and decision framework representation. They are **unverified and uncalibrated**, and do not constitute empirical or legally binding professional career, legal, or financial advice.
