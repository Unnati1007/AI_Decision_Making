def check_query_safety(query: str):
    blocked_keywords = ["hack", "bypass", "exploit", "ignore"]

    for word in blocked_keywords:
        if word in query.lower():
            return False, "⚠️ Unsafe query detected"

    return True, "Safe"


def check_domain_relevance(query: str):
    domains = {
        "career": ["job", "career", "mba", "study"],
        "finance": ["investment", "money", "stocks", "finance"],
        "legal": ["law", "legal", "court", "rights"],
        "wellbeing": ["health", "stress", "mental", "fitness"]
    }

    for domain, keywords in domains.items():
        for word in keywords:
            if word in query.lower():
                return True, domain

    return False, "❌ Query not relevant to supported domains"


def guard_pipeline(query: str):
    # Step 1: Safety
    is_safe, message = check_query_safety(query)
    if not is_safe:
        return False, message, None

    # Step 2: Domain relevance
    is_relevant, domain = check_domain_relevance(query)
    if not is_relevant:
        return False, domain, None

    return True, "Valid Query", domain