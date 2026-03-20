from services.guard import guard_pipeline
from services.domain_router import detect_domain

def process_query(query: str):
    # Step 1: Guard
    is_valid, message, _ = guard_pipeline(query)

    if not is_valid:
        return message

    # Step 2: Domain Detection
    domain = detect_domain(query)

    if domain == "unknown":
        return "❌ Could not determine domain. Please rephrase your query."

    return f"✅ Query accepted in domain: {domain}"