from fastapi import APIRouter

router = APIRouter()

@router.post("/query")
def query_ai(data: dict):
    user_query = data.get("query", "")

    return {
        "query": user_query,
        "response": f"Processing: {user_query}"
    }