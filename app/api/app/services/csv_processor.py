import pandas as pd
import numpy as np
from io import BytesIO
from typing import Tuple, List
from fastapi import HTTPException

REQUIRED_COLUMNS = [
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

MAX_ROWS = 10000


def validate_and_parse_csv(contents: bytes) -> Tuple[pd.DataFrame, List[str]]:
    """
    Validates uploaded CSV.
    Returns (dataframe, errors).
    Raises HTTPException with clear message on fatal errors.
    """
    errors = []

    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Could not parse CSV file: {str(e)}"
        )

    # Check row count
    if len(df) == 0:
        raise HTTPException(status_code=400, detail="CSV file is empty.")
    if len(df) > MAX_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"CSV exceeds maximum of {MAX_ROWS} rows. Your file has {len(df)} rows.",
        )

    # Check columns
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    extra = [col for col in df.columns if col not in REQUIRED_COLUMNS]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}. "
            f"Download the sample CSV to see the correct format.",
        )

    if extra:
        errors.append(f"Extra columns ignored: {', '.join(extra)}")

    # Keep only required columns in correct order
    df = df[REQUIRED_COLUMNS].copy()

    # Check for nulls
    null_counts = df.isnull().sum()
    cols_with_nulls = null_counts[null_counts > 0]
    if not cols_with_nulls.empty:
        errors.append(
            "Null values found and will be handled: "
            + ", ".join([f"{col} ({n})" for col, n in cols_with_nulls.items()])
        )
        df = df.fillna(df.median())

    # Check numeric
    for col in REQUIRED_COLUMNS:
        try:
            df[col] = pd.to_numeric(df[col])
        except Exception:
            raise HTTPException(
                status_code=400, detail=f"Column '{col}' contains non-numeric values."
            )

    return df, errors


def build_results_dataframe(
    original_df: pd.DataFrame,
    predictions: np.ndarray,
    probabilities: np.ndarray,
    risk_levels: List[str],
    shap_values_list: List[dict],
    top_risk_factors: List[str],
    recommendations: List[str],
) -> pd.DataFrame:
    """
    Merge original features with prediction results.
    Sorted by probability descending — highest risk first.
    """
    from app.services.inference import FEATURE_LABELS, FEATURE_COLUMNS

    results = original_df.copy()
    results["prediction"] = predictions
    results["probability"] = probabilities.round(4)
    results["risk_level"] = risk_levels
    results["top_risk_factor"] = top_risk_factors
    results["recommendation"] = recommendations

    # Add SHAP columns with human-readable names
    if shap_values_list and shap_values_list[0]:
        for col in FEATURE_COLUMNS:
            label = FEATURE_LABELS[col]
            results[f"shap_{label}"] = [sv.get(col, None) for sv in shap_values_list]

    # Sort by probability descending
    results = results.sort_values("probability", ascending=False).reset_index(drop=True)
    return results


def filter_by_risk(df: pd.DataFrame, risk_level: str) -> pd.DataFrame:
    """Filter results dataframe by risk level."""
    return df[df["risk_level"] == risk_level].copy()
