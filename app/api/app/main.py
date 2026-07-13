from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.services.inference import inference_service

from app.api import (
    analytics,
    auth,
    batch,
    chat,
    explainability,
    export,
    health,
    history,
    predict,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""

    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    try:
        inference_service.load()
        print(f"✅ Model loaded: {settings.MODEL_PATH}")
    except Exception as e:
        print(f"⚠️ Model not loaded: {e}")
        print("Place model files in the ml_models directory.")

    yield

    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "End-to-end Type 2 Diabetes Risk Prediction API with "
        "XGBoost inference, SHAP explainability, batch processing, "
        "and Gemini-powered Dida AI assistant."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# API Routers
# ------------------------------------------------------------------

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(batch.router)
app.include_router(history.router)
app.include_router(analytics.router)
app.include_router(export.router)
app.include_router(explainability.router)
app.include_router(chat.router)

# ------------------------------------------------------------------
# Root Endpoint
# ------------------------------------------------------------------

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "chat": "/chat",
    }