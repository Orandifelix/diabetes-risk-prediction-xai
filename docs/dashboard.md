# Dashboard & API Reference

This document covers the dashboard interface and REST API for the Diabetes Risk Predictor as actually implemented and deployed.

> **Note:** this document supersedes the earlier draft, which described a different (Pima-dataset) schema written before the dashboard and API were built. It now reflects the real, shipped BRFSS-based system.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Single Prediction](#single-prediction)
- [Batch Prediction](#batch-prediction)
- [Prediction History](#prediction-history)
- [Analytics Dashboard](#analytics-dashboard)
- [Reports & Export](#reports--export)
- [Dida (Conversational Assistant)](#dida-conversational-assistant)
- [API Endpoint Reference](#api-endpoint-reference)
- [Input Features](#input-features)
- [Sample CSV Format](#sample-csv-format)

---

## Overview

The system exposes two interfaces, both live (not "under development"):

| Interface | Technology | Purpose |
|---|---|---|
| Web Dashboard | Next.js 14 (App Router) | Authenticated prediction, batch upload, history, analytics, reports |
| REST API | FastAPI (async) | Inference, persistence, explainability, export, chat |

| Service | Local URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Authentication

Authentication is via **Google OAuth 2.0**, handled client-side by NextAuth and verified server-side by the API.

- `POST /auth/google` — exchanges a Google ID token for an application JWT and upserts the user record.
- All authenticated requests attach `Authorization: Bearer <jwt>`.
- Two auth dependency modes are used across the API:
  - **Required** (`get_current_user`) — history, analytics, export, email. Returns `401`/`403` if missing or invalid.
  - **Optional** (`get_optional_user`) — `/predict` and `/chat`, so anonymous use and personalization both work from the same endpoint.

---

## Single Prediction

`POST /predict` accepts one respondent's fourteen BRFSS-derived feature values and returns a prediction, risk tier, and explanation. Used identically by the structured dashboard form and by Dida's guided assessment flow.

### Request body

```json
{
  "_BMI5": 28.4,
  "_AGE80": 9,
  "SEXVAR": 2,
  "_IMPRACE": 1,
  "GENHLTH": 3,
  "PHYSHLTH": 4,
  "SMOKE100": 2,
  "_TOTINDA": 1,
  "EDUCA": 5,
  "INCOME3": 7,
  "_RFHYPE6": 2,
  "_RFCHOL3": 1,
  "CHCKDNY2": 2,
  "_MICHD": 0
}
```

### Response

```json
{
  "id": 142,
  "prediction": 1,
  "probability": 0.63,
  "risk_level": "Moderate",
  "risk_percentage": 63.0,
  "top_risk_factor": "GENHLTH",
  "top_risk_label": "General Health",
  "recommendation": "Your general health rating and BMI are the biggest factors in this result. Consider discussing these with a healthcare professional.",
  "shap_values": { "GENHLTH": 0.18, "_BMI5": 0.11, "_AGE80": 0.07 },
  "shap_labels": { "General Health": 0.18, "BMI": 0.11, "Age Group": 0.07 }
}
```

- `id` is only present when the request was authenticated — anonymous predictions are scored and returned but not persisted, and therefore cannot later be downloaded or emailed.
- `shap_values` uses raw BRFSS feature codes as keys; `shap_labels` uses the same values keyed by human-readable names, for direct UI display.

---

## Batch Prediction

`POST /batch` accepts a CSV upload for cohort-level screening and scores every row through the same pipeline as a single prediction.

### Request

`multipart/form-data` with a CSV file using the fourteen BRFSS feature columns (see [Sample CSV Format](#sample-csv-format)).

### Response — `BatchJobResponse`

```json
{
  "id": 17,
  "filename": "clinic_roster_july.csv",
  "total_rows": 250,
  "high_risk_count": 41,
  "moderate_risk_count": 96,
  "low_risk_count": 113,
  "avg_probability": 0.38,
  "median_probability": 0.34,
  "std_probability": 0.19,
  "status": "completed",
  "global_shap": { "GENHLTH": 0.21, "_BMI5": 0.16 },
  "created_at": "2026-07-10T09:15:00Z",
  "completed_at": "2026-07-10T09:15:04Z"
}
```

Each row is also persisted individually as a `predictions` record linked via `batch_job_id`, so it can be re-aggregated later (see [Analytics Dashboard](#analytics-dashboard)) and exported per risk tier.

---

## Prediction History

`GET /history/predictions?page=1` — paginated list of the authenticated user's past single predictions (`PredictionHistoryItem`: `id`, `prediction`, `probability`, `risk_level`, `top_risk_factor`, `recommendation`, `created_at`).

---

## Analytics Dashboard

Two distinct analytics endpoints back the dashboard:

| Endpoint | Scope |
|---|---|
| `GET /analytics/summary` | Cross-batch/cross-history summary for the logged-in user (used on the main dashboard landing view) |
| `GET /analytics/batch/{job_id}` | Full analytics for one specific batch job |

### `GET /analytics/batch/{job_id}` — `BatchAnalytics`

```json
{
  "id": 17,
  "job_id": 17,
  "filename": "clinic_roster_july.csv",
  "total_rows": 250,
  "high_risk_count": 41,
  "moderate_risk_count": 96,
  "low_risk_count": 113,
  "high_risk_pct": 16.4,
  "moderate_risk_pct": 38.4,
  "low_risk_pct": 45.2,
  "avg_probability": 0.38,
  "median_probability": 0.34,
  "std_probability": 0.19,
  "global_shap": { "GENHLTH": 0.21, "_BMI5": 0.16 },
  "risk_by_age": [{ "age_group": "45-54", "count": 40, "avg_probability": 0.41 }],
  "risk_by_bmi": [{ "bmi_range": "25-30", "count": 55, "avg_probability": 0.33 }],
  "top_risk_factors": [{ "feature": "GENHLTH", "importance": 0.21 }],
  "created_at": "2026-07-10T09:15:00Z"
}
```

`risk_by_age` and `risk_by_bmi` power the two dashboard chart cards, and are computed from the batch's saved per-row `predictions` (not from job-level summary stats alone), so they stay consistent with the underlying data even if recomputed later.

---

## Reports & Export

All export routes require authentication **and** ownership of the requested resource.

| Endpoint | Method | Returns |
|---|---|---|
| `/export/report/{prediction_id}/pdf` | GET | Single-prediction PDF (streamed as a blob download, not a plain link — see note below) |
| `/export/report/{prediction_id}/email` | POST | Emails the same PDF to `{ "email": "..." }` via SMTP |
| `/export/batch/{job_id}/{risk_filter}` | GET | Batch CSV filtered by `high` / `moderate` / `low` / `all` |
| `/export/batch/{job_id}/summary/pdf` | GET | Batch executive-summary PDF |

> **Implementation note:** because these routes require a JWT bearer token, the frontend fetches them through the authenticated `api` axios instance and triggers a client-side blob download — a plain `<a href>` cannot carry the required `Authorization` header.

---

## Dida (Conversational Assistant)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/chat/intro` | GET | none | Returns Dida's opening greeting message |
| `/chat` | POST | optional | Open-ended conversation only — `{ "message": "...", "history": [...] }` → `{ "response": "...", "history": [...] }` |

Dida's guided, fourteen-question risk-assessment flow does **not** go through `/chat` — it is driven entirely client-side (see `docs/architecture.md#conversational-assistant-dida`) and calls `/predict` directly once all answers are collected, identically to the structured form.

---

## API Endpoint Reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Liveness/model-loaded check |
| POST | `/auth/google` | none | Exchange Google ID token for app JWT |
| POST | `/predict` | optional | Single prediction |
| POST | `/batch` | required | Batch CSV upload and scoring |
| GET | `/history/predictions` | required | Paginated prediction history |
| GET | `/analytics/summary` | required | User-level summary analytics |
| GET | `/analytics/batch/{job_id}` | required | Full batch analytics |
| GET | `/export/report/{id}/pdf` | required + ownership | Single-prediction PDF |
| POST | `/export/report/{id}/email` | required + ownership | Email single-prediction PDF |
| GET | `/export/batch/{job_id}/{filter}` | required + ownership | Batch CSV export |
| GET | `/export/batch/{job_id}/summary/pdf` | required + ownership | Batch summary PDF |
| GET | `/chat/intro` | none | Dida greeting |
| POST | `/chat` | optional | Dida open-ended chat |
| POST/GET | `/explainability/*` | varies | Standalone SHAP/LIME explanation utilities |

---

## Input Features

| BRFSS Code | Human Label | Type | Valid Range |
|---|---|---|---|
| `_BMI5` | BMI | float | 10 – 100 |
| `_AGE80` | Age group | int (1–13) | 1 – 13 |
| `SEXVAR` | Sex | int | 1=Male, 2=Female |
| `_IMPRACE` | Race/Ethnicity | int | 1 – 6 |
| `GENHLTH` | General health | int | 1=Excellent – 5=Poor |
| `PHYSHLTH` | Poor physical health days (30d) | int | 0 – 30 |
| `SMOKE100` | Smoked ≥100 cigarettes | int | 1=Yes, 2=No |
| `_TOTINDA` | Physical activity (30d) | int | 1=Yes, 2=No |
| `EDUCA` | Education level | int | 1 – 6 |
| `INCOME3` | Income bracket | int | 1 – 11 |
| `_RFHYPE6` | Hypertension | int | 1=No, 2=Yes |
| `_RFCHOL3` | High cholesterol | int | 1=No, 2=Yes |
| `CHCKDNY2` | Kidney disease | int | 1=No, 2=Yes |
| `_MICHD` | Coronary heart disease / heart attack | int | 0=No, 1=Yes |

Full clinical description and rationale for each feature is in `docs/methodology.md` and the research paper's Table 1.

---

## Sample CSV Format

The batch endpoint expects a CSV with these exact column headers (matching the BRFSS codes above):

```
_BMI5,_AGE80,SEXVAR,_IMPRACE,GENHLTH,PHYSHLTH,SMOKE100,_TOTINDA,EDUCA,INCOME3,_RFHYPE6,_RFCHOL3,CHCKDNY2,_MICHD
28.4,9,2,1,3,4,2,1,5,7,2,1,2,0
31.2,11,1,1,4,12,1,2,3,4,2,2,1,1
22.9,4,2,2,1,0,2,1,6,9,1,1,2,0
```

A sample file is available at [`datasets/sample_batch.csv`](../datasets/sample_batch.csv).

---

*Last updated: 2026-07-17 — rewritten to match the deployed BRFSS-2023-based API and dashboard, superseding the earlier Pima-dataset draft.*
