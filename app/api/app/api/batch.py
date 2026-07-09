from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.prediction import Prediction, BatchJob
from app.schemas.batch import BatchJobResponse
from app.services.inference import inference_service
from app.services.explainability import explainability_service
from app.services.recommendations import get_recommendation
from app.services.csv_processor import validate_and_parse_csv
from app.services.analytics import compute_batch_analytics

router = APIRouter(prefix="/predict", tags=["Batch Prediction"])


@router.post("/batch", response_model=BatchJobResponse)
async def predict_batch(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Batch prediction from CSV upload.
    Validates columns, runs inference on all rows,
    computes analytics, saves results to database.
    """
    if not inference_service.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded.")

    # Validate file type
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    df, warnings = validate_and_parse_csv(contents)

    # Run inference
    predictions, probabilities = inference_service.predict_batch(df)
    risk_levels = [inference_service.get_risk_level(p) for p in probabilities]

    # SHAP per row
    shap_list = []
    top_risk_factors = []
    recommendations = []

    for i, row in df.iterrows():
        features = row.to_dict()
        try:
            shap_vals = explainability_service.get_shap_single(features)
            top_raw, top_label = explainability_service.get_top_feature(shap_vals)
        except Exception:
            shap_vals = {}
            top_raw, top_label = "_BMI5", "BMI"

        shap_list.append(shap_vals)
        top_risk_factors.append(top_label)
        recommendations.append(
            get_recommendation(top_raw, float(probabilities[i]), features)
        )

    # Global SHAP
    try:
        global_shap = explainability_service.get_global_shap(df)
    except Exception:
        global_shap = {}

    # Analytics
    analytics = compute_batch_analytics(
        df, predictions, probabilities, risk_levels, global_shap
    )

    # Save batch job
    job = BatchJob(
        user_id=current_user.id,
        filename=file.filename,
        total_rows=analytics["total_rows"],
        high_risk_count=analytics["high_risk_count"],
        moderate_risk_count=analytics["moderate_risk_count"],
        low_risk_count=analytics["low_risk_count"],
        avg_probability=analytics["avg_probability"],
        median_probability=analytics["median_probability"],
        std_probability=analytics["std_probability"],
        status="completed",
        global_shap=global_shap,
        completed_at=datetime.utcnow(),
    )
    db.add(job)
    await db.flush()  # get job.id

    # Save individual predictions
    for i in range(len(df)):
        row_features = df.iloc[i].to_dict()
        pred_record = Prediction(
            user_id=current_user.id,
            input_features=row_features,
            prediction=int(predictions[i]),
            probability=float(probabilities[i]),
            risk_level=risk_levels[i],
            shap_values=shap_list[i],
            top_risk_factor=top_risk_factors[i],
            recommendation=recommendations[i],
            method="batch",
            batch_job_id=job.id,
        )
        db.add(pred_record)

    await db.commit()
    await db.refresh(job)
    return job


@router.get("/batch/{job_id}", response_model=BatchJobResponse)
async def get_batch_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(BatchJob).where(
            BatchJob.id == job_id,
            BatchJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")
    return job
