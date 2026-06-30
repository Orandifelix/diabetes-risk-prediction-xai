# System Architecture

This document describes the system design, components, and data flow for the Diabetes Risk Predictor.

---

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Model Artifacts](#model-artifacts)
- [Directory Structure](#directory-structure)

---

## Overview

The Diabetes Risk Predictor is structured as a data science pipeline that takes raw clinical data through preprocessing, model training, evaluation, and explainability. The system produces two saved artifacts — a trained XGBoost classifier and a fitted preprocessing pipeline — which will serve as the foundation for a future API deployment.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                           │
│                                                             │
│   datasets/raw/              datasets/processed/            │
│   └── diabetes.csv           └── diabetes_clean.csv         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Notebook Pipeline                       │
│                                                             │
│   1. Data Understanding   →   Summary stats, dtypes         │
│   2. EDA                  →   Distributions, correlations   │
│   3. Feature Engineering  →   Encoding, scaling, selection  │
│   4. Model Training       →   Six classifiers compared      │
│   5. Hyperparameter Tuning →  Optuna optimization           │
│   6. Model Evaluation     →   Metrics, confusion matrix     │
│   7. Explainability       →   SHAP global, LIME local       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Model Artifacts                         │
│                                                             │
│   models/                                                   │
│   ├── final_model.joblib       XGBoost classifier           │
│   ├── preprocessor.joblib      Fitted sklearn pipeline      │
│   └── metadata.json            Version, metrics, features   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Explainability Layer                       │
│                                                             │
│   SHAP  →  Global feature importance                        │
│            Feature contribution per prediction              │
│            Summary plots, waterfall plots                   │
│                                                             │
│   LIME  →  Local prediction explanations                    │
│            Patient-level decision interpretation            │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Data Layer

| Path | Description |
|---|---|
| `datasets/raw/` | Original unmodified source data — never edited directly |
| `datasets/processed/` | Cleaned, encoded, and scaled data ready for training |

Raw data is never modified in place. All transformations produce new files in `datasets/processed/`.

### 2. Notebook Pipeline

The single notebook `notebooks/diabetes_prediction.ipynb` implements the full pipeline end-to-end. Each section is self-contained and annotated with markdown explaining the decisions made.

| Section | Output |
|---|---|
| Data Understanding | Summary statistics, missing value report |
| EDA | Figures saved to `images/02_eda/` |
| Feature Engineering | Figures saved to `images/03_feature_engineering/` |
| Model Training | Trained model objects, training curves |
| Hyperparameter Tuning | Best parameters via Optuna |
| Model Evaluation | Metrics table, confusion matrix, ROC curve |
| Explainability | SHAP summary, waterfall plots, LIME explanations |

### 3. Preprocessing Pipeline

Built using `sklearn.pipeline.Pipeline`, the preprocessor handles:

- **Missing value imputation** — median strategy for numerical features
- **Outlier treatment** — IQR-based capping
- **Feature scaling** — `StandardScaler` for numerical features
- **Encoding** — `OrdinalEncoder` for any categorical features

The fitted pipeline is saved to `models/preprocessor.joblib` so the same transformations applied during training are reproduced exactly at inference time.

### 4. Model Layer

Six classifiers are trained and compared:

| Model | Role |
|---|---|
| Logistic Regression | Interpretable baseline |
| Decision Tree | Non-linear baseline |
| Random Forest | Ensemble — bagging |
| XGBoost | Ensemble — gradient boosting (final model) |
| LightGBM | Ensemble — fast gradient boosting |
| CatBoost | Ensemble — categorical boosting |

The best-performing model is saved to `models/final_model.joblib`.

### 5. Explainability Layer

| Tool | Scope | Output |
|---|---|---|
| SHAP | Global + local | Feature importance, waterfall plots |
| LIME | Local | Patient-level text explanations |

SHAP operates directly on the XGBoost model using `shap.TreeExplainer` for efficiency. LIME uses `lime.lime_tabular.LimeTabularExplainer` on the full pipeline output.

---

## Data Flow

```
Raw CSV
   │
   ▼
Load with Pandas
   │
   ▼
Exploratory Data Analysis
   │
   ├── Save figures → images/02_eda/
   │
   ▼
Feature Engineering
   │
   ├── Fit preprocessor
   ├── Transform dataset
   ├── Save figures → images/03_feature_engineering/
   │
   ▼
Model Training
   │
   ├── Train / evaluate six models
   ├── Hyperparameter tuning (Optuna)
   ├── Select best model
   │
   ▼
Model Evaluation
   │
   ├── Confusion matrix → images/05_evaluation/
   ├── ROC curve        → images/05_evaluation/
   ├── Model comparison → images/05_evaluation/
   │
   ▼
Save Artifacts
   │
   ├── models/final_model.joblib
   ├── models/preprocessor.joblib
   └── models/metadata.json
   │
   ▼
Explainability
   │
   ├── SHAP summary    → images/06_interpretability/
   ├── SHAP waterfall  → images/06_interpretability/
   └── LIME local      → images/06_interpretability/
```

---

## Model Artifacts

### `models/metadata.json`

Stores model metadata written automatically at the end of the training notebook.

```json
{
  "model_name": "XGBoostClassifier",
  "version": "1.0.0",
  "trained_date": "2026-06-30",
  "dataset": "diabetes.csv",
  "n_samples": 0,
  "n_features": 8,
  "feature_names": [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age"
  ],
  "target": "Outcome",
  "classes": [0, 1],
  "metrics": {
    "accuracy": null,
    "precision": null,
    "recall": null,
    "f1_score": null,
    "roc_auc": null
  },
  "hyperparameters": {}
}
```

---

## Directory Structure

```
diabetes-risk-prediction-xai/
│
├── datasets/
│   ├── raw/                    ← Source data (gitignored)
│   └── processed/              ← Transformed data (gitignored)
│
├── models/
│   ├── final_model.joblib      ← Trained classifier
│   ├── preprocessor.joblib     ← Fitted preprocessing pipeline
│   └── metadata.json           ← Model metadata
│
├── notebooks/
│   └── diabetes_prediction.ipynb
│
└── images/
    ├── 01_data_understanding/
    ├── 02_eda/
    ├── 03_feature_engineering/
    ├── 04_modeling/
    ├── 05_evaluation/
    ├── 06_interpretability/
    ├── 07_dashboard/
    └── 08_presentation/
```

---

*Last updated: 2026-06-30*
