from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine, Base
from app.services.inference import inference_service
from app.api import (
    auth,
    predict,
    batch,
    history,
    analytics,
    export,
    health,
    explainability,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    try:
        inference_service.load()
        print(f"✅ Model loaded: {settings.MODEL_PATH}")
    except Exception as e:
        print(f"⚠️  Model not loaded: {e}. Place model files in ml_models/")
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "End-to-end Type 2 diabetes risk prediction API with "
        "XGBoost inference, SHAP explainability, and batch processing."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(explainability.router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
