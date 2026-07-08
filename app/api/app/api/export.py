from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from io import BytesIO, StringIO
import pandas as pd
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.prediction import Prediction, BatchJob
from app.services.pdf_generator import generate_single_report, generate_batch_summary_report
from app.services.inference import FEATURE_LABELS

router = APIRouter(prefix="/export", tags=["Export"])

RISK_FILTERS = {
    "high": "High Risk",
    "moderate": "Moderate Risk",
    "low": "Low Risk",
    "all": None,
}


@router.get("/batch/{job_id}/{risk_filter}")
async def export_batch_csv(
    job_id: int,
    risk_filter: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Download batch results filtered by risk level.
    risk_filter: high | moderate | low | all
    Sorted by probability descending — highest risk first.
    """
    if risk_filter not in RISK_FILTERS:
        raise HTTPException(status_code=400, detail="Invalid risk filter. Use: high, moderate, low, all")

    # Verify job ownership
    job_result = await db.execute(
        select(BatchJob).where(BatchJob.id == job_id, BatchJob.user_id == current_user.id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")

    # Fetch predictions
    query = select(Prediction).where(Prediction.batch_job_id == job_id)
    risk_label = RISK_FILTERS[risk_filter]
    if risk_label:
        query = query.where(Prediction.risk_level == risk_label)

    result = await db.execute(query)
    predictions = result.scalars().all()

    if not predictions:
        raise HTTPException(status_code=404, detail=f"No {risk_filter} risk patients found.")

    # Build DataFrame
    rows = []
    for p in predictions:
        row = dict(p.input_features)
        # Rename raw feature keys to labels
        labeled = {FEATURE_LABELS.get(k, k): v for k, v in row.items()}
        labeled["Prediction"] = p.prediction
        labeled["Probability"] = round(p.probability, 4)
        labeled["Risk Level"] = p.risk_level
        labeled["Top Risk Factor"] = p.top_risk_factor or ""
        labeled["Recommendation"] = p.recommendation or ""

        # SHAP columns
        if p.shap_values:
            for raw, val in p.shap_values.items():
                label = FEATURE_LABELS.get(raw, raw)
                labeled[f"SHAP — {label}"] = round(val, 6)

        rows.append(labeled)

    df = pd.DataFrame(rows)
    df = df.sort_values("Probability", ascending=False)

    # Stream CSV
    buffer = StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    filename = f"diabetes_risk_{risk_filter}_{job_id}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/report/{prediction_id}/pdf")
async def export_single_pdf(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download PDF report for a single prediction."""
    result = await db.execute(
        select(Prediction).where(
            Prediction.id == prediction_id,
            Prediction.user_id == current_user.id,
        )
    )
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found.")

    pdf_bytes = generate_single_report(
        prediction_data={
            "risk_level": prediction.risk_level,
            "probability": prediction.probability,
            "prediction": prediction.prediction,
        },
        input_features=prediction.input_features,
        shap_values=prediction.shap_values,
        recommendation=prediction.recommendation,
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=diabetes_risk_report_{prediction_id}.pdf"
        },
    )


@router.get("/batch/{job_id}/summary/pdf")
async def export_batch_summary_pdf(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download executive summary PDF for a batch job."""
    job_result = await db.execute(
        select(BatchJob).where(BatchJob.id == job_id, BatchJob.user_id == current_user.id)
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found.")

    analytics = {
        "total_rows": job.total_rows,
        "high_risk_count": job.high_risk_count,
        "moderate_risk_count": job.moderate_risk_count,
        "low_risk_count": job.low_risk_count,
        "high_risk_pct": round(job.high_risk_count / job.total_rows * 100, 1) if job.total_rows else 0,
        "moderate_risk_pct": round(job.moderate_risk_count / job.total_rows * 100, 1) if job.total_rows else 0,
        "low_risk_pct": round(job.low_risk_count / job.total_rows * 100, 1) if job.total_rows else 0,
        "avg_probability": job.avg_probability or 0,
        "median_probability": job.median_probability or 0,
        "std_probability": job.std_probability or 0,
        "global_shap": job.global_shap or {},
        "top_risk_factors": sorted(
            [{"feature": k, "importance": v} for k, v in (job.global_shap or {}).items()],
            key=lambda x: x["importance"], reverse=True
        )[:5],
    }

    pdf_bytes = generate_batch_summary_report(analytics, job.filename)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=batch_summary_{job_id}.pdf"
        },
    )
