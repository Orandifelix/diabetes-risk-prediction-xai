from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
import pandas as pd
import numpy as np
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.prediction import Prediction, BatchJob
from app.services.analytics import compute_batch_analytics

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard overview cards."""
    result = await db.execute(
        select(
            func.count(Prediction.id).label("total"),
            func.avg(Prediction.probability).label("avg_prob"),
            func.max(Prediction.probability).label("max_prob"),
        ).where(Prediction.user_id == current_user.id)
    )
    stats = result.one()

    high_result = await db.execute(
        select(func.count(Prediction.id)).where(
            Prediction.user_id == current_user.id,
            Prediction.risk_level == "High Risk",
        )
    )
    high_count = high_result.scalar() or 0

    recent = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
        .limit(5)
    )

    return {
        "total_predictions": stats.total or 0,
        "avg_probability": round(float(stats.avg_prob or 0), 4),
        "highest_risk": round(float(stats.max_prob or 0), 4),
        "high_risk_count": high_count,
        "recent_predictions": [
            {
                "id": p.id,
                "risk_level": p.risk_level,
                "probability": p.probability,
                "created_at": p.created_at.isoformat(),
            }
            for p in recent.scalars().all()
        ],
    }


@router.get("/batch/{job_id}")
async def get_batch_analytics(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full analytics for a batch job dashboard display."""
    job_result = await db.execute(
        select(BatchJob).where(
            BatchJob.id == job_id, BatchJob.user_id == current_user.id
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")

    # Rebuild per-row breakdowns (risk_by_age / risk_by_bmi) from the saved
    # predictions for this job, reusing the same computation used at upload
    # time so the numbers always stay consistent.
    pred_result = await db.execute(
        select(Prediction).where(Prediction.batch_job_id == job_id)
    )
    predictions = pred_result.scalars().all()

    risk_by_age: list = []
    risk_by_bmi: list = []
    if predictions:
        df = pd.DataFrame([p.input_features for p in predictions])
        probabilities = np.array([p.probability for p in predictions])
        risk_levels = [p.risk_level for p in predictions]
        computed = compute_batch_analytics(
            df=df,
            predictions=probabilities,  # unused inside compute_batch_analytics
            probabilities=probabilities,
            risk_levels=risk_levels,
            global_shap=job.global_shap or {},
        )
        risk_by_age = computed["risk_by_age"]
        risk_by_bmi = computed["risk_by_bmi"]

    return {
        "id": job.id,  # required by the frontend (BatchAnalytics.id) for downloads
        "job_id": job.id,
        "filename": job.filename,
        "total_rows": job.total_rows,
        "high_risk_count": job.high_risk_count,
        "moderate_risk_count": job.moderate_risk_count,
        "low_risk_count": job.low_risk_count,
        "high_risk_pct": round(job.high_risk_count / job.total_rows * 100, 1)
        if job.total_rows
        else 0,
        "moderate_risk_pct": round(job.moderate_risk_count / job.total_rows * 100, 1)
        if job.total_rows
        else 0,
        "low_risk_pct": round(job.low_risk_count / job.total_rows * 100, 1)
        if job.total_rows
        else 0,
        "avg_probability": job.avg_probability,
        "median_probability": job.median_probability,
        "std_probability": job.std_probability,
        "global_shap": job.global_shap,
        "risk_by_age": risk_by_age,
        "risk_by_bmi": risk_by_bmi,
        "top_risk_factors": sorted(
            [
                {"feature": k, "importance": v}
                for k, v in (job.global_shap or {}).items()
            ],
            key=lambda x: x["importance"],
            reverse=True,
        )[:5],
        "created_at": job.created_at.isoformat(),
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
    }
