# Dashboard & API Reference

This document covers the dashboard interface and API endpoints for the Diabetes Risk Predictor.

> **Note:** The dashboard and API are currently under development. This document will be updated as implementation progresses.

---

## Table of Contents

- [Overview](#overview)
- [Single Prediction](#single-prediction)
- [Batch Prediction](#batch-prediction)
- [Analytics Dashboard](#analytics-dashboard)
- [API Endpoints](#api-endpoints)
- [Input Features](#input-features)
- [Sample CSV Format](#sample-csv-format)

---

## Overview

The system will expose two interfaces:

| Interface | Technology | Purpose |
|---|---|---|
| Web Dashboard | Next.js | User-facing prediction and analytics UI |
| REST API | FastAPI | Backend inference and data processing |

Both will be served locally during development and deployed to the cloud for the final demonstration.

| Service | Local URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Single Prediction

The single prediction interface accepts one patient's clinical values and returns:

- **Risk score** — probability of diabetes (0.0 – 1.0)
- **Risk class** — High Risk / Low Risk
- **SHAP explanation** — top features driving the prediction
- **LIME explanation** — local decision interpretation

### Input

| Field | Type | Unit | Valid Range |
|---|---|---|---|
| Pregnancies | Integer | count | 0 – 20 |
| Glucose | Integer | mg/dL | 0 – 300 |
| Blood Pressure | Integer | mm Hg | 0 – 150 |
| Skin Thickness | Integer | mm | 0 – 100 |
| Insulin | Integer | µU/ml | 0 – 900 |
| BMI | Float | kg/m² | 0 – 70 |
| Diabetes Pedigree Function | Float | score | 0.0 – 2.5 |
| Age | Integer | years | 21 – 100 |

### Output

```json
{
  "prediction": 1,
  "probability": 0.83,
  "risk_level": "High Risk",
  "explanation": {
    "shap_values": {
      "Glucose": 0.42,
      "BMI": 0.21,
      "Age": 0.13,
      "Insulin": -0.08
    },
    "lime_explanation": []
  }
}
```

---

## Batch Prediction

The batch prediction interface accepts a CSV file containing multiple patients and returns predictions for all rows.

### Input

A CSV file with the same eight feature columns as the single prediction form. See [Sample CSV Format](#sample-csv-format) below.

### Output

A downloadable CSV file with the original columns plus:

| Added Column | Description |
|---|---|
| `prediction` | 1 = High Risk, 0 = Low Risk |
| `probability` | Diabetes risk score (0.0 – 1.0) |
| `risk_level` | Human-readable risk label |

---

## Analytics Dashboard

After a batch prediction run, the analytics dashboard displays:

| Panel | Description |
|---|---|
| Risk Summary | Count and percentage of high-risk vs low-risk patients |
| Average Probability | Mean risk score across the batch |
| Risk Distribution | Histogram of probability scores |
| Feature Importance | Global SHAP summary for the batch |
| Results Table | Sortable and filterable prediction results |
| Download Button | Export results as CSV or JSON |

---

## API Endpoints

### `GET /health`

Returns API and model status.

```json
{
  "status": "ok",
  "model_loaded": true,
  "model_version": "1.0.0"
}
```

---

### `POST /predict`

Single patient prediction.

**Request body:**
```json
{
  "pregnancies": 2,
  "glucose": 148,
  "blood_pressure": 72,
  "skin_thickness": 35,
  "insulin": 0,
  "bmi": 33.6,
  "diabetes_pedigree_function": 0.627,
  "age": 50
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": 0.83,
  "risk_level": "High Risk"
}
```

---

### `POST /predict-batch`

Batch prediction from CSV upload.

**Request:** `multipart/form-data` with a CSV file attached.

**Response:** JSON array of predictions, one object per row.

---

### `GET /analytics`

Returns summary statistics from the most recent batch prediction run.

```json
{
  "total_patients": 100,
  "high_risk_count": 34,
  "low_risk_count": 66,
  "high_risk_percentage": 34.0,
  "average_probability": 0.41,
  "median_probability": 0.38,
  "std_probability": 0.22
}
```

---

### `POST /explain`

Returns SHAP and LIME explanations for a single prediction.

**Request body:** Same as `POST /predict`

**Response:**
```json
{
  "shap_values": {
    "Glucose": 0.42,
    "BMI": 0.21,
    "Age": 0.13
  },
  "lime_explanation": [
    {"feature": "Glucose > 140", "weight": 0.38},
    {"feature": "BMI > 30", "weight": 0.19}
  ]
}
```

---

## Input Features

### Feature Reference Table

| Feature | Description | Clinical Significance |
|---|---|---|
| Pregnancies | Number of pregnancies | Gestational diabetes risk factor |
| Glucose | Plasma glucose concentration | Primary diagnostic marker |
| Blood Pressure | Diastolic blood pressure | Cardiovascular risk indicator |
| Skin Thickness | Triceps skinfold | Proxy for body fat percentage |
| Insulin | Serum insulin level | Insulin resistance indicator |
| BMI | Body mass index | Obesity risk factor |
| Diabetes Pedigree | Family history score | Genetic predisposition |
| Age | Patient age | Risk increases with age |

---

## Sample CSV Format

The batch prediction endpoint expects a CSV with these exact column names:

```
Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age
6,148,72,35,0,33.6,0.627,50
1,85,66,29,0,26.6,0.351,31
8,183,64,0,0,23.3,0.672,32
```

A sample file is available at [`datasets/sample_batch.csv`](../datasets/sample_batch.csv).

---

*Last updated: 2026-06-30*
