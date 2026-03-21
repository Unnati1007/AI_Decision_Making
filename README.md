# 🧠 IntelliChoice – AI Decision Support System

> An intelligent system that validates user input, retrieves relevant knowledge, generates explainable decisions, and simulates future outcomes.

---

## 📌 Overview

**IntelliChoice** is a secure and explainable AI-powered decision support system built using **Retrieval-Augmented Generation (RAG)**.

It helps users make better decisions by:
- Using real-world knowledge
- Providing structured explanations
- Ensuring input safety
- Simulating future outcomes

---

## 🎯 Objectives

- Provide data-driven decision support  
- Ensure safe and secure AI interactions  
- Generate explainable outputs  
- Simulate future decision scenarios  

---

## 🏗️ Architecture

    User → Frontend → Backend → Guard Layer → Retrieval → LLM → Simulation → Response

---

## ⚙️ Tech Stack

**Frontend:** React / Streamlit  
**Backend:** FastAPI  
**LLM:** GPT-4 / GPT-3.5  
**Embeddings:** OpenAI / HuggingFace  
**Vector DB:** FAISS / ChromaDB  
**Cache:** Supabase  
**Others:** Web Scraping, Prompt Engineering  

---

## 🧩 Core Components

### 🔹 1. User Input
- Accepts query + context (budget, goals, risk)

### 🔹 2. Backend (FastAPI)
- Handles requests
- Triggers processing pipeline

### 🔹 3. 🔐 RAG Guard (Security Layer)
- Rule-based filtering (e.g., "hack", "bypass")
- LLM-based safety classification
- Relevance check using embeddings

### 🔹 4. 📚 Retrieval System
- Document chunking
- Embedding generation
- Vector similarity search (Top-K)

### 🔹 5. 🤖 LLM Reasoning Engine
Generates:
- Recommendation  
- Explanation  
- Risks  
- Trade-offs  

### 🔹 6. 🔮 Simulation Engine
Predicts:
- Best-case scenario  
- Worst-case scenario  
- Expected outcomes  

### 🔹 7. 📤 Response Formatter

    {
      "recommendation": "",
      "reason": "",
      "risks": [],
      "simulation": {},
      "sources": []
    }

---

## 🔁 Workflow

1. User submits query  
2. Guard validates input  
3. Query converted to embeddings  
4. Relevant data retrieved  
5. LLM generates response  
6. Simulation predicts outcomes  
7. Final structured response returned  

---

## ⚡ Features

- 🔐 Secure input validation  
- 🧠 Knowledge-based reasoning  
- 📊 Explainable AI outputs  
- 🎯 Context-aware decisions  
- 🔮 Scenario simulation  
- ⚡ Fast responses via caching  

---

## 🚀 Project Structure

    ai-decision-system/

    ├── backend/
    │   ├── main.py
    │   ├── config.py
    │   ├── routes/
    │   ├── services/
    │   ├── retrieval/
    │   ├── scraper/
    │   ├── utils/
    │   └── models/

    ├── frontend/
    │   └── app.py

    ├── data/
    ├── vector_db/
    ├── cache_db/

    ├── requirements.txt
    ├── README.md
    └── .env

---

## ⚠️ Design Decisions

- Same embedding model used throughout  
- Strong prompt engineering to reduce hallucination  
- Mandatory security (RAG Guard) layer  
- Simulation starts simple (rule-based)  

---

## 🚫 Why No Fine-Tuning?

- Expensive and less flexible  
- RAG allows dynamic knowledge updates  
- Prompting provides controlled outputs  

---

## 📌 Use Cases

- Career decisions (e.g., MBA vs Job)  
- Financial planning  
- Basic legal guidance  
- Well-being decisions  

---

## 🛠️ Setup

    # Clone repo
    git clone https://github.com/yourusername/intellichoice.git

    # Move into folder
    cd intellichoice

    # Install dependencies
    pip install -r requirements.txt

    # Run backend
    uvicorn backend.main:app --reload

    # Run frontend
    streamlit run frontend/app.py

---

## 🔐 Environment Variables

Create a `.env` file:

    OPENAI_API_KEY=your_key
    SUPABASE_URL=your_url
    SUPABASE_KEY=your_key

---

## 🤝 Contributing

Feel free to contribute by:
- Opening issues  
- Suggesting improvements  
- Creating pull requests  

---

## 📜 License

MIT License