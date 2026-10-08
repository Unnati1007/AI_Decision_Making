# ============================================================
# IntelliChoice — Clean Role-Based Career Roadmaps Creator
# ============================================================

import os
import sys
import logging

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.retrieval.ingest import run_ingestion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intellichoice.role_roadmaps")

ROLE_ROADMAPS_DIR = os.path.join(PROJECT_ROOT, "data", "career", "role_roadmaps")
os.makedirs(ROLE_ROADMAPS_DIR, exist_ok=True)

CLEAN_ROADMAPS = [
    {
        "filename": "roadmap_backend_developer.md",
        "title": "Backend Developer Roadmap",
        "url": "https://roadmap.sh/backend",
        "content": """# Career Roadmap: Backend Developer

## 📌 Executive Summary
A Backend Developer is responsible for building server-side business logic, database management, API design, and system architecture to ensure application scalability and security.

## 🛠️ Required Technical Skill Progression
1. **Internet & Network Fundamentals**: HTTP/HTTPS protocols, DNS, REST architecture, status codes, WebSockets.
2. **Programming Language**: Mastery in Python (FastAPI/Django), Node.js (TypeScript), Java (Spring Boot), or Go.
3. **Database Systems**:
   - *Relational Databases*: PostgreSQL, MySQL (ACID compliance, indexing, complex JOIN queries).
   - *NoSQL Databases*: MongoDB, DynamoDB (Document stores, schema flexibility).
   - *Caching*: Redis, Memcached (In-memory caching for low-latency read operations).
4. **API Design & Integration**: RESTful APIs, GraphQL, gRPC, authentication (JWT, OAuth 2.0).
5. **System Architecture & Cloud Deployment**: Docker containerization, Kubernetes orchestration, CI/CD pipelines (GitHub Actions), AWS/GCP deployment.

## 💼 Career Path & Compensation
- **Junior Backend Engineer (0-2 YoE)**: Focuses on feature endpoints, bug fixes, and SQL queries.
- **Senior Backend Engineer (5+ YoE)**: Leads microservice architecture, DB sharding, caching strategies, and API security.
- **Target Roles**: Backend Engineer, Systems Engineer, API Architect.
"""
    },
    {
        "filename": "roadmap_frontend_developer.md",
        "title": "Frontend Developer Roadmap",
        "url": "https://roadmap.sh/frontend",
        "content": """# Career Roadmap: Frontend Developer

## 📌 Executive Summary
A Frontend Developer crafts user-facing web applications, focusing on responsive design, UI component architecture, client-side state management, and page performance.

## 🛠️ Required Technical Skill Progression
1. **Core Web Fundamentals**: Semantic HTML5, CSS3 (Flexbox, Grid), JavaScript (ES6+, Async/Await, DOM manipulation).
2. **Modern Frontend Frameworks**: React.js (Hooks, Context API), Next.js (Server Components, SSR, SSG), Vue.js, or Angular.
3. **Styling & Design Systems**: TailwindCSS, CSS Modules, Styled Components, UI Component libraries (Shadcn UI, Material UI).
4. **State Management & Data Fetching**: Zustand, Redux Toolkit, TanStack Query (React Query) for server state caching.
5. **Tooling & Performance**: Vite, Webpack, TypeScript, Web Vitals optimization (LCP, CLS, FID), PWA features.

## 💼 Career Path & Compensation
- **Junior Frontend Engineer (0-2 YoE)**: Translates Figma designs into pixel-perfect React components.
- **Senior Frontend Architect (5+ YoE)**: Drives micro-frontend architecture, Design Systems, and Core Web Vitals optimization.
"""
    },
    {
        "filename": "roadmap_data_analyst.md",
        "title": "Data Analyst Career Roadmap",
        "url": "https://roadmap.sh/data-analyst",
        "content": """# Career Roadmap: Data Analyst

## 📌 Executive Summary
A Data Analyst translates raw data into actionable business insights using SQL, statistical modeling, data visualization tools, and business intelligence reporting.

## 🛠️ Required Technical Skill Progression
1. **Data Querying & Manipulation**: Advanced SQL (Window functions, CTEs, GROUP BY aggregations, joining multi-table schemas).
2. **Spreadsheets & BI Tools**: Advanced Excel (Pivot tables, VLOOKUP/XLOOKUP), Power BI, Tableau for interactive dashboarding.
3. **Programming for Data Analysis**: Python (Pandas for data wrangling, NumPy, Matplotlib/Seaborn for exploratory data analysis) or R.
4. **Applied Statistics & Business Acumen**: Hypothesis testing, A/B testing, cohort analysis, customer lifetime value (CLV) modeling.
5. **Data Storytelling**: Presenting quantitative findings to executive stakeholders to drive strategic decision-making.

## 💼 Career Path & Compensation
- **Data Analyst (0-3 YoE)**: Builds weekly BI dashboards, runs SQL queries for product metrics.
- **Senior Business Intelligence (BI) Lead (5+ YoE)**: Designs enterprise data warehouses (Snowflake, BigQuery) and guides executive product strategy.
"""
    },
    {
        "filename": "roadmap_ai_and_data_scientist.md",
        "title": "AI & Data Scientist Career Roadmap",
        "url": "https://roadmap.sh/ai-data-scientist",
        "content": """# Career Roadmap: AI & Data Scientist

## 📌 Executive Summary
An AI & Data Scientist designs machine learning models, neural networks, and generative AI pipelines to solve complex predictive and decision-making problems.

## 🛠️ Required Technical Skill Progression
1. **Mathematical Foundations**: Linear Algebra, Multivariable Calculus, Probability Distributions, Inferential Statistics.
2. **Core Machine Learning**: Supervised (Regression, Decision Trees, XGBoost) & Unsupervised Learning (K-Means, PCA).
3. **Deep Learning & Frameworks**: PyTorch, TensorFlow, Neural Networks (CNNs, RNNs, Transformers).
4. **Generative AI & LLM Systems**: LangChain, LlamaIndex, Vector Databases (FAISS, Pinecone), Prompt Engineering, Fine-Tuning (LoRA).
5. **MLOps & Deployment**: Model containerization (Docker), FastAPI inference servers, MLflow tracking, vLLM deployment.

## 💼 Career Path & Compensation
- **Machine Learning Engineer (2-5 YoE)**: Trains, tunes, and deploys custom ML models into cloud production.
- **Principal AI Research Scientist (8+ YoE)**: Leads AI architecture, frontier model fine-tuning, and scalable inference infrastructure.
"""
    },
    {
        "filename": "roadmap_devops_and_cloud.md",
        "title": "DevOps & Cloud Engineer Roadmap",
        "url": "https://roadmap.sh/devops",
        "content": """# Career Roadmap: DevOps & Cloud Engineer

## 📌 Executive Summary
A DevOps Engineer bridges software development and IT operations by automating CI/CD pipelines, managing infrastructure as code, and maintaining cloud reliability.

## 🛠️ Required Technical Skill Progression
1. **Linux & OS Administration**: Bash scripting, process management, file systems, SSH key security.
2. **Infrastructure as Code (IaC)**: Terraform, Ansible, CloudFormation for automated cloud provisioning.
3. **Containerization & Orchestration**: Docker, Kubernetes (Helm charts, ingress controllers, pod scheduling).
4. **CI/CD Pipeline Automation**: GitHub Actions, Jenkins, GitLab CI for automated testing and zero-downtime deployment.
5. **Cloud Infrastructure & Monitoring**: AWS / GCP / Azure, Prometheus, Grafana, Log aggregation (ELK Stack).

## 💼 Career Path & Compensation
- **DevOps Engineer (2-5 YoE)**: Manages cloud servers, builds deployment pipelines, resolves staging incidents.
- **Site Reliability Engineer (SRE) / Cloud Architect (6+ YoE)**: Guarantees 99.99% uptime, auto-scaling architecture, and cloud cost governance.
"""
    },
    {
        "filename": "roadmap_fullstack_developer.md",
        "title": "Full Stack Developer Roadmap",
        "url": "https://roadmap.sh/full-stack",
        "content": """# Career Roadmap: Full Stack Developer

## 📌 Executive Summary
A Full Stack Developer builds complete Web Applications end-to-end, taking full ownership of frontend user interfaces, backend APIs, and database architecture.

## 🛠️ Required Technical Skill Progression
1. **Frontend Mastery**: HTML5, CSS3, JavaScript, React.js / Next.js, Responsive UI design.
2. **Backend Engine**: Node.js / Express, Python FastAPI, or Java Spring.
3. **Database Management**: Relational (PostgreSQL) and NoSQL (MongoDB/Redis) modeling.
4. **DevOps & Hosting**: Vercel, AWS S3, Docker, Nginx reverse proxy, environment variable security.
5. **End-to-End Testing**: Jest, Cypress, Playwright for automated frontend and API testing.

## 💼 Career Path & Compensation
- **Full Stack Developer (1-4 YoE)**: Builds MVP products, connects UI components to backend endpoints.
- **Technical Co-Founder / Engineering Lead (6+ YoE)**: Takes complete product lifecycle ownership from prototype to enterprise scale.
"""
    }
]

def create_role_roadmaps():
    logger.info("🚀 Creating clean, high-value Role-Based Roadmaps...")
    created_count = 0

    for rm in CLEAN_ROADMAPS:
        filepath = os.path.join(ROLE_ROADMAPS_DIR, rm["filename"])
        md_text = f"""---
title: "{rm['title']}"
url: "{rm['url']}"
source: "roadmap.sh Official Role Framework"
domain: "Career"
---

{rm['content'].strip()}
"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_text)
        created_count += 1
        logger.info(f"✅ Created Clean Role Roadmap: {rm['title']} -> {rm['filename']}")

    return created_count

def main():
    count = create_role_roadmaps()
    logger.info(f"🎉 Successfully created {count} clean role roadmaps in data/career/role_roadmaps/")
    logger.info("⚡ Triggering FAISS Vector Ingestion...")
    run_ingestion()

if __name__ == "__main__":
    main()
