from fastapi import APIRouter
from app.services.inference import inference_service
import json
from app.config import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """API and model health status."""
    model_loaded = inference_service.is_loaded()
    metadata = {}
    if model_loaded:
        try:
            with open(settings.METADATA_PATH) as f:
                metadata = json.load(f)
        except Exception:
            pass

    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "model_name": metadata.get("model_name", "unknown"),
        "model_version": metadata.get("version", "unknown"),
        "n_features": metadata.get("n_features", 14),
    }


@router.get("/ping")
async def ping():
    """Lightweight ping for uptime monitoring."""
    return {"ping": "pong"}
