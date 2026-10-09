# IntelliChoice Knowledge Base Data Sources

### Active Data Sources

| Source Type | Category / Description | License / Terms | Active File Count | Acquisition Method |
| --- | --- | --- | --- | --- |
| **`wikipedia`** | Full Wikipedia Articles & Open Corpus | CC BY-SA 4.0 / CC BY-SA 3.0 | 43 | MediaWiki API extracts (`prop=extracts&explaintext=1`) & curated summaries |
| **`ai_curated`** | Career & System Decision Frameworks | AI Synthetic Content | 68 | Model-generated decision playbooks (`source_type: ai_curated`) |
| **`official_gov`** | Official Government Portals & Labour Codes | Government of India Public Info | 0 | Archived (0 active files; see Archived section below) |
| **`roadmap_derived`** | Developer Role Roadmaps | Custom Copyright License | 0 | Archived (0 active files; see Archived section below) |

---

### Archived Data Sources

| Archive Category | Directory | Archived File Count | Reason for Archival |
| --- | --- | --- | --- |
| **Wikipedia Stubs** | `data/_archive_wiki/` | 58 | Replaced by full MediaWiki API articles in `data/career/wiki_full/` |
| **Government Pages** | `data/_archive_gov/` | 5 | Archived due to nav/menu text dominance, HTML header clutter, or non-English regional content |
| **Developer Roadmaps** | `data/_archive_roadmaps/` | 6 | Archived due to source repository copyright license forbidding redistribution of project content |

---

### Critical Transparency & Attribution Disclosures

1. **Wikipedia CC BY-SA Attribution**: Content derived from Wikipedia is licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) / CC BY-SA 3.0. Original titles and page URLs are preserved in article frontmatter.
2. **Roadmap-Derived Content**: Original developer roadmap content from `kamranahmedse/developer-roadmap` is protected by copyright. Role roadmaps are archived and not redistributed.
3. **AI-Curated Content Disclosure**: All files marked with `source_type: ai_curated` are **AI-generated synthetic documents** created for decision framework modeling. They are **unverified and uncalibrated**, and do not constitute empirical or legally binding professional career, legal, or financial advice.
