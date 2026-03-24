from services.guard import guard_pipeline
from services.domain_router import detect_domain

def process_query(query: str):
    # Step 1: Guard
    result = guard_pipeline(query)
    
    if not result.passed:
        return result.message

    # Step 2: Domain Detection
    domain = detect_domain(query)

    if domain == "unknown":
        return "❌ Could not determine domain. Please rephrase your query."

    return f"✅ Query accepted in domain: {domain}"