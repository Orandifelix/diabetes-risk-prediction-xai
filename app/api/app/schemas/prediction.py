from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime


class PredictionInput(BaseModel):
    """Single patient prediction input — 14 BRFSS features"""
    BMI: float = Field(..., ge=10.0, le=100.0, alias="_BMI5", description="Body Mass Index")
    Age: int = Field(..., ge=1, le=13, alias="_AGE80", description="Age category 1-13")
    Sex: int = Field(..., ge=1, le=2, alias="SEXVAR", description="1=Male, 2=Female")
    Race: int = Field(..., ge=1, le=6, alias="_IMPRACE", description="Race/Ethnicity 1-6")
    GenHealth: int = Field(..., ge=1, le=5, alias="GENHLTH", description="General health 1=Excellent 5=Poor")
    PhysHealth: int = Field(..., ge=0, le=30, alias="PHYSHLTH", description="Poor physical health days in last 30")
    Smoker: int = Field(..., ge=1, le=2, alias="SMOKE100", description="1=Yes smoked 100 cigarettes, 2=No")
    PhysActivity: int = Field(..., ge=1, le=2, alias="_TOTINDA", description="1=Had activity, 2=No activity")
    Education: int = Field(..., ge=1, le=6, alias="EDUCA", description="Education level 1-6")
    Income: int = Field(..., ge=1, le=11, alias="INCOME3", description="Income level 1-11")
    Hypertension: int = Field(..., ge=1, le=2, alias="_RFHYPE6", description="1=No hypertension, 2=Yes hypertension")
    HighChol: int = Field(..., ge=1, le=2, alias="_RFCHOL3", description="1=No high cholesterol, 2=Yes")
    KidneyDisease: int = Field(..., ge=1, le=2, alias="CHCKDNY2", description="1=No, 2=Yes kidney disease")
    HeartDisease: int = Field(..., ge=0, le=1, alias="_MICHD", description="0=No, 1=Yes heart disease")

    class Config:
        populate_by_name = True


class PredictionResponse(BaseModel):
    prediction: int
    probability: float
    risk_level: str
    risk_percentage: float
    top_risk_factor: str
    top_risk_label: str
    recommendation: str
    shap_values: Optional[Dict[str, float]] = None
    shap_labels: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True


class PredictionHistoryItem(BaseModel):
    id: int
    prediction: int
    probability: float
    risk_level: str
    top_risk_factor: Optional[str]
    recommendation: Optional[str]
    method: str
    created_at: datetime
    input_features: Dict[str, Any]

    class Config:
        from_attributes = True
