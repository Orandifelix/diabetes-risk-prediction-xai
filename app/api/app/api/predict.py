from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionInput, PredictionResponse
from app.services.inference import inference_service
from app.services.explainability import explainability_service
from app.services.recommendations import get_recommendation

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictionResponse)
async def predict_single(
    input_data: PredictionInput,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """
    Single patient prediction.
    Works for both public (no login) and authenticated users.
    Authenticated users get predictions saved to history.
    """
    if not inference_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded. Try again shortly.")

    # Build feature dict using raw names
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

    # Predict
    prediction, probability = inference_service.predict_single(features)
    risk_level = inference_service.get_risk_level(probability)

    # SHAP
    try:
        shap_values = explainability_service.get_shap_single(features)
        shap_labels = explainability_service.get_shap_labels(shap_values)
        top_raw, top_label = explainability_service.get_top_feature(shap_values)
    except Exception:
        shap_values = None
        shap_labels = None
        top_raw, top_label = "_BMI5", "BMI"

    # Recommendation
    recommendation = get_recommendation(top_raw, probability, features)

    # Save to history if authenticated
    if current_user:
        record = Prediction(
            user_id=current_user.id,
            input_features=features,
            prediction=prediction,
            probability=probability,
            risk_level=risk_level,
            shap_values=shap_values,
            top_risk_factor=top_label,
            recommendation=recommendation,
            method="single",
        )
        db.add(record)
        await db.commit()

    return PredictionResponse(
        prediction=prediction,
        probability=probability,
        risk_level=risk_level,
        risk_percentage=round(probability * 100, 1),
        top_risk_factor=top_raw,
        top_risk_label=top_label,
        recommendation=recommendation,
        shap_values=shap_values,
        shap_labels=shap_labels,
    )
