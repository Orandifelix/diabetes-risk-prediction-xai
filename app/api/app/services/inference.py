import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.config import settings


FEATURE_COLUMNS = [
    "_BMI5",
    "_AGE80",
    "SEXVAR",
    "_IMPRACE",
    "GENHLTH",
    "PHYSHLTH",
    "SMOKE100",
    "_TOTINDA",
    "EDUCA",
    "INCOME3",
    "_RFHYPE6",
    "_RFCHOL3",
    "CHCKDNY2",
    "_MICHD",
]

FEATURE_LABELS = {
    "_BMI5": "BMI",
    "_AGE80": "Age",
    "SEXVAR": "Sex",
    "_IMPRACE": "Race/Ethnicity",
    "GENHLTH": "General Health",
    "PHYSHLTH": "Physical Health Days",
    "SMOKE100": "Smoking",
    "_TOTINDA": "Physical Activity",
    "EDUCA": "Education Level",
    "INCOME3": "Income Level",
    "_RFHYPE6": "Hypertension",
    "_RFCHOL3": "High Cholesterol",
    "CHCKDNY2": "Kidney Disease",
    "_MICHD": "Heart Disease",
}


class InferenceService:
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metadata = None
        self._loaded = False

    def load(self):
        """Load model and preprocessor from disk."""
        try:
            self.model = joblib.load(settings.MODEL_PATH)
            # Preprocessor may be separate or embedded in pipeline
            try:
                self.preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
            except FileNotFoundError:
                self.preprocessor = None  # Pipeline handles it
            import json

            with open(settings.METADATA_PATH) as f:
                self.metadata = json.load(f)
            self._loaded = True
        except Exception as e:
            raise RuntimeError(f"Failed to load model: {e}")

    def is_loaded(self) -> bool:
        return self._loaded

    def _to_dataframe(self, features: Dict[str, Any]) -> pd.DataFrame:
        """Convert input dict to correctly ordered DataFrame."""
        row = {
            "_BMI5": features.get("BMI") or features.get("_BMI5"),
            "_AGE80": features.get("Age") or features.get("_AGE80"),
            "SEXVAR": features.get("Sex") or features.get("SEXVAR"),
            "_IMPRACE": features.get("Race") or features.get("_IMPRACE"),
            "GENHLTH": features.get("GenHealth") or features.get("GENHLTH"),
            "PHYSHLTH": features.get("PhysHealth") or features.get("PHYSHLTH"),
            "SMOKE100": features.get("Smoker") or features.get("SMOKE100"),
            "_TOTINDA": features.get("PhysActivity") or features.get("_TOTINDA"),
            "EDUCA": features.get("Education") or features.get("EDUCA"),
            "INCOME3": features.get("Income") or features.get("INCOME3"),
            "_RFHYPE6": features.get("Hypertension") or features.get("_RFHYPE6"),
            "_RFCHOL3": features.get("HighChol") or features.get("_RFCHOL3"),
            "CHCKDNY2": features.get("KidneyDisease") or features.get("CHCKDNY2"),
            "_MICHD": features.get("HeartDisease") or features.get("_MICHD"),
        }
        return pd.DataFrame([row])[FEATURE_COLUMNS]

    def predict_single(self, features: Dict[str, Any]) -> Tuple[int, float]:
        """Return (prediction, probability)."""
        df = self._to_dataframe(features)
        prob = float(self.model.predict_proba(df)[0][1])
        pred = int(
            prob >= settings.HIGH_RISK_THRESHOLD
            or (prob >= settings.MODERATE_RISK_THRESHOLD)
        )
        # Use model's own threshold
        pred = int(self.model.predict(df)[0])
        return pred, round(prob, 4)

    def predict_batch(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Return (predictions array, probabilities array)."""
        df = df[FEATURE_COLUMNS]
        probs = self.model.predict_proba(df)[:, 1]
        preds = self.model.predict(df)
        return preds, probs

    def get_risk_level(self, probability: float) -> str:
        if probability >= settings.HIGH_RISK_THRESHOLD:
            return "High Risk"
        elif probability >= settings.MODERATE_RISK_THRESHOLD:
            return "Moderate Risk"
        return "Low Risk"


# Singleton
inference_service = InferenceService()
