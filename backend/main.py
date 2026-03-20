from fastapi import FastAPI
from backend.routes.query_route import router as query_router

app = FastAPI()

app.include_router(query_router)

@app.get("/")
def root():
    return {"message": "AI Decision System Backend Running 🚀"}