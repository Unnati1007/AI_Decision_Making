from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.query_route import router as query_router
from backend.routes.admin_route import router as admin_router
from backend.services.warmup import prewarm_system

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm models on startup to eliminate cold start latency
    prewarm_system()
    yield

app = FastAPI(lifespan=lifespan)

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