import numpy as np
import pandas as pd
from typing import Dict, Any, List


def compute_batch_analytics(
    df: pd.DataFrame,
    predictions: np.ndarray,
    probabilities: np.ndarray,
    risk_levels: List[str],
    global_shap: Dict[str, float],
) -> Dict[str, Any]:
    """
    Computes full analytics for dashboard display.
    All aggregate — no individual patient data.
    """
    total = len(df)
    high = sum(1 for r in risk_levels if r == "High Risk")
    moderate = sum(1 for r in risk_levels if r == "Moderate Risk")
    low = sum(1 for r in risk_levels if r == "Low Risk")

    # Risk by age group
    age_bins = {
        "18-29": (1, 2),
        "30-39": (3, 4),
        "40-49": (5, 6),
        "50-59": (7, 8),
        "60-69": (9, 10),
        "70+": (11, 13),
    }
    risk_by_age = []
    for label, (low_age, high_age) in age_bins.items():
        mask = df["_AGE80"].between(low_age, high_age)
        group_probs = probabilities[mask]
        if len(group_probs) > 0:
            group_high = sum(
                1 for i, m in enumerate(mask) if m and risk_levels[i] == "High Risk"
            )
            risk_by_age.append({
                "age_group": label,
                "count": int(mask.sum()),
                "high_risk_count": group_high,
                "avg_probability": round(float(group_probs.mean()), 4),
            })

    # Risk by BMI range
    bmi_bins = {
        "Underweight (<18.5)": (0, 18.5),
        "Normal (18.5-24.9)": (18.5, 24.9),
        "Overweight (25-29.9)": (25, 29.9),
        "Obese (30+)": (30, 200),
    }
    risk_by_bmi = []
    for label, (bmi_low, bmi_high) in bmi_bins.items():
        mask = df["_BMI5"].between(bmi_low, bmi_high)
        group_probs = probabilities[mask]
        if len(group_probs) > 0:
            risk_by_bmi.append({
                "bmi_range": label,
                "count": int(mask.sum()),
                "avg_probability": round(float(group_probs.mean()), 4),
            })

    # Top risk factors from global SHAP
    top_factors = sorted(
        [{"feature": k, "importance": v} for k, v in global_shap.items()],
        key=lambda x: x["importance"],
        reverse=True,
    )[:5]

    return {
        "total_rows": total,
        "high_risk_count": high,
        "moderate_risk_count": moderate,
        "low_risk_count": low,
        "high_risk_pct": round(high / total * 100, 1) if total > 0 else 0,
        "moderate_risk_pct": round(moderate / total * 100, 1) if total > 0 else 0,
        "low_risk_pct": round(low / total * 100, 1) if total > 0 else 0,
        "avg_probability": round(float(probabilities.mean()), 4),
        "median_probability": round(float(np.median(probabilities)), 4),
        "std_probability": round(float(probabilities.std()), 4),
        "global_shap": global_shap,
        "risk_by_age": risk_by_age,
        "risk_by_bmi": risk_by_bmi,
        "top_risk_factors": top_factors,
    }
