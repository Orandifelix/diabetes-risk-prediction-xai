from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class RiskLevel(str, enum.Enum):
    LOW = "Low Risk"
    MODERATE = "Moderate Risk"
    HIGH = "High Risk"


class PredictionMethod(str, enum.Enum):
    SINGLE = "single"
    BATCH = "batch"


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    input_features = Column(JSON, nullable=False)
    prediction = Column(Integer, nullable=False)
    probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    shap_values = Column(JSON, nullable=True)
    top_risk_factor = Column(String, nullable=True)
    recommendation = Column(String, nullable=True)
    method = Column(String, default="single")
    batch_job_id = Column(Integer, ForeignKey("batch_jobs.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="predictions")
    batch_job = relationship("BatchJob", back_populates="predictions")


class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    total_rows = Column(Integer, default=0)
    high_risk_count = Column(Integer, default=0)
    moderate_risk_count = Column(Integer, default=0)
    low_risk_count = Column(Integer, default=0)
    avg_probability = Column(Float, nullable=True)
    median_probability = Column(Float, nullable=True)
    std_probability = Column(Float, nullable=True)
    status = Column(String, default="pending")
    global_shap = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="batch_jobs")
    predictions = relationship("Prediction", back_populates="batch_job", cascade="all, delete-orphan")
