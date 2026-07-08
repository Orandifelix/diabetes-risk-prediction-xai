from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_optional_user
from app.models.user import User
from app.schemas.prediction import PredictionInput
from app.services.inference import inference_service
from app.services.explainability import explainability_service

router = APIRouter(prefix="/explain", tags=["Explainability"])


@router.post("/shap")
async def explain_shap(
    input_data: PredictionInput,
    current_user: User | None = Depends(get_optional_user),
):
    """SHAP explanation for a single prediction — public endpoint."""
    if not inference_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded.")

    features = {
        "_BMI5": input_data.BMI,
        "_AGE80": input_data.Age,
        "SEXVAR": input_data.Sex,
        "_IMPRACE": input_data.Race,
        "GENHLTH": input_data.GenHealth,
        "PHYSHLTH": input_data.PhysHealth,
        "SMOKE100": input_data.Smoker,
        "_TOTINDA": input_data.PhysActivity,
        "EDUCA": input_data.Education,
        "INCOME3": input_data.Income,
        "_RFHYPE6": input_data.Hypertension,
        "_RFCHOL3": input_data.HighChol,
        "CHCKDNY2": input_data.KidneyDisease,
        "_MICHD": input_data.HeartDisease,
    }

    shap_values = explainability_service.get_shap_single(features)
    shap_labels = explainability_service.get_shap_labels(shap_values)
    top_raw, top_label = explainability_service.get_top_feature(shap_values)
    lime_explanation = explainability_service.get_lime_explanation(features)

    return {
        "shap_values": shap_values,
        "shap_labels": shap_labels,
        "top_risk_factor": top_raw,
        "top_risk_label": top_label,
        "lime_explanation": lime_explanation,
    }


@router.get("/global")
async def global_feature_importance():
    """Global SHAP feature importance — public endpoint."""
    if not inference_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded.")
    # Returns pre-computed from metadata if available
    try:
        import json
        from app.config import settings
        with open(settings.METADATA_PATH) as f:
            meta = json.load(f)
        return {"global_importance": meta.get("global_shap", {})}
    except Exception:
        return {"global_importance": {}}
