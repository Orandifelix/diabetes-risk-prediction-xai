from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class BatchJobResponse(BaseModel):
    id: int
    filename: str
    total_rows: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    avg_probability: Optional[float]
    median_probability: Optional[float]
    std_probability: Optional[float]
    status: str
    global_shap: Optional[Dict[str, float]]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class BatchAnalytics(BaseModel):
    job_id: int
    filename: str
    total_rows: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    high_risk_pct: float
    moderate_risk_pct: float
    low_risk_pct: float
    avg_probability: float
    median_probability: float
    std_probability: float
    global_shap: Dict[str, float]
    risk_by_age: List[Dict[str, Any]]
    risk_by_bmi: List[Dict[str, Any]]
    top_risk_factors: List[Dict[str, Any]]
    created_at: datetime


class BatchResultRow(BaseModel):
    row_index: int
    BMI: float
    Age: int
    Sex: int
    Race: int
    GenHealth: int
    PhysHealth: int
    Smoker: int
    PhysActivity: int
    Education: int
    Income: int
    Hypertension: int
    HighChol: int
    KidneyDisease: int
    HeartDisease: int
    prediction: int
    probability: float
    risk_level: str
    top_risk_factor: str
    recommendation: str
    shap_BMI: Optional[float]
    shap_Age: Optional[float]
    shap_Sex: Optional[float]
    shap_Race: Optional[float]
    shap_GenHealth: Optional[float]
    shap_PhysHealth: Optional[float]
    shap_Smoker: Optional[float]
    shap_PhysActivity: Optional[float]
    shap_Education: Optional[float]
    shap_Income: Optional[float]
    shap_Hypertension: Optional[float]
    shap_HighChol: Optional[float]
    shap_KidneyDisease: Optional[float]
    shap_HeartDisease: Optional[float]
