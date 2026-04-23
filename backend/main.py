from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.query_route import router as query_router
from backend.routes.admin_route import router as admin_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {"message": "AI Decision System Backend Running 🚀"}