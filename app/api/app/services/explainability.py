import shap
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from app.services.inference import inference_service, FEATURE_COLUMNS, FEATURE_LABELS


class ExplainabilityService:
    def __init__(self):
        self._explainer = None

    def _get_explainer(self):
        if self._explainer is None:
            self._explainer = shap.TreeExplainer(inference_service.model)
        return self._explainer

    def get_shap_single(self, features: Dict[str, Any]) -> Dict[str, float]:
        """
        Returns SHAP values keyed by raw feature name.
        Frontend maps using FEATURE_LABELS — never exposes raw names to users.
        """
        from app.services.inference import inference_service

        df = inference_service._to_dataframe(features)
        explainer = self._get_explainer()
        shap_values = explainer.shap_values(df)

        # For binary classification, shap_values may be list[2] or array
        if isinstance(shap_values, list):
            values = shap_values[1][0]
        else:
            values = shap_values[0]

        return {col: round(float(val), 6) for col, val in zip(FEATURE_COLUMNS, values)}

    def get_shap_labels(self, shap_values: Dict[str, float]) -> Dict[str, float]:
        """Return same values keyed by human-readable labels."""
        return {
            FEATURE_LABELS[k]: v for k, v in shap_values.items() if k in FEATURE_LABELS
        }

    def get_top_feature(self, shap_values: Dict[str, float]) -> tuple:
        """Return (raw_name, label) of highest absolute SHAP value."""
        top_raw = max(shap_values, key=lambda k: abs(shap_values[k]))
        return top_raw, FEATURE_LABELS.get(top_raw, top_raw)

    def get_global_shap(
        self, df: pd.DataFrame, sample_size: int = 200
    ) -> Dict[str, float]:
        """
        Global feature importance from mean absolute SHAP values.
        Samples for performance on large batches.
        """
        sample = df.sample(min(sample_size, len(df)), random_state=42)
        explainer = self._get_explainer()
        shap_values = explainer.shap_values(sample[FEATURE_COLUMNS])

        if isinstance(shap_values, list):
            values = shap_values[1]
        else:
            values = shap_values

        mean_abs = np.abs(values).mean(axis=0)
        return {
            FEATURE_LABELS[col]: round(float(val), 6)
            for col, val in zip(FEATURE_COLUMNS, mean_abs)
        }

    def get_lime_explanation(
        self, features: Dict[str, Any], training_data: Optional[np.ndarray] = None
    ) -> List[Dict]:
        """
        LIME local explanation for a single prediction.
        Returns sorted list of {feature, label, weight, direction}.
        """
        try:
            from lime.lime_tabular import LimeTabularExplainer

            df = inference_service._to_dataframe(features)

            if training_data is None:
                # Use zeros as dummy training data if not provided
                training_data = np.zeros((100, len(FEATURE_COLUMNS)))

            explainer = LimeTabularExplainer(
                training_data=training_data,
                feature_names=FEATURE_COLUMNS,
                class_names=["No Diabetes", "Diabetes"],
                mode="classification",
            )

            exp = explainer.explain_instance(
                df.values[0],
                inference_service.model.predict_proba,
                num_features=14,
            )

            results = []
            for feature, weight in exp.as_list():
                # Extract raw feature name from LIME string
                raw_name = None
                for col in FEATURE_COLUMNS:
                    if col in feature:
                        raw_name = col
                        break
                label = FEATURE_LABELS.get(raw_name, feature) if raw_name else feature
                results.append(
                    {
                        "feature": feature,
                        "label": label,
                        "weight": round(float(weight), 6),
                        "direction": "increases risk"
                        if weight > 0
                        else "decreases risk",
                    }
                )

            return sorted(results, key=lambda x: abs(x["weight"]), reverse=True)
        except Exception:
            return []


explainability_service = ExplainabilityService()
