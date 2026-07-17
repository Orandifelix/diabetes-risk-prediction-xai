from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.prediction import Prediction, BatchJob
from app.schemas.prediction import PredictionHistoryItem
from app.schemas.batch import BatchJobResponse

router = APIRouter(prefix="/history", tags=["History"])


@router.get("/predictions", response_model=List[PredictionHistoryItem])
async def get_prediction_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    method: Optional[str] = Query(None, description="Filter by: single, batch"),
    risk_level: Optional[str] = Query(
        None, description="Filter by: High Risk, Moderate Risk, Low Risk"
    ),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(Prediction)
        .where(Prediction.user_id == current_user.id)
        .order_by(desc(Prediction.created_at))
    )
    if method:
        query = query.where(Prediction.method == method)
    if risk_level:
        query = query.where(Prediction.risk_level == risk_level)

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/predictions/{prediction_id}", response_model=PredictionHistoryItem)
async def get_prediction(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Prediction).where(
            Prediction.id == prediction_id,
            Prediction.user_id == current_user.id,
        )
    )
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    return prediction


@router.delete("/predictions/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Prediction).where(
            Prediction.id == prediction_id,
            Prediction.user_id == current_user.id,
        )
    )
    prediction = result.scalar_one_or_none()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found.")
    await db.delete(prediction)
    await db.commit()
    return {"message": "Prediction deleted."}


@router.get("/batches", response_model=List[BatchJobResponse])
async def get_batch_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = (
        select(BatchJob)
        .where(BatchJob.user_id == current_user.id)
        .order_by(desc(BatchJob.created_at))
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()
