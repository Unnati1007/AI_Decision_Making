import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.query_route import router as query_router
from backend.routes.admin_route import router as admin_router
from backend.services.warmup import prewarm_system

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm models in a background thread so port binds immediately (<1 sec) for cloud providers (Render, Fly, etc.)
    asyncio.create_task(asyncio.to_thread(prewarm_system))
    yield

app = FastAPI(title="IntelliChoice API", lifespan=lifespan)

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
    return {"status": "online", "message": "IntelliChoice AI Decision System Backend Running 🚀"}

@app.get("/health")
def health():
    return {"status": "healthy"}