def detect_domain(query: str):
    query = query.lower()

    domain_keywords = {
        "career": ["job", "career", "mba", "study", "placement", "internship"],
        "finance": ["investment", "money", "stocks", "finance", "saving", "loan"],
        "legal": ["law", "legal", "court", "rights", "case", "agreement"],
        "wellbeing": ["health", "stress", "mental", "fitness", "anxiety", "wellbeing"]
    }

    for domain, keywords in domain_keywords.items():
        for word in keywords:
            if word in query:
                return domain

    return "unknown"