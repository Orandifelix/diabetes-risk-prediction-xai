# System Architecture

This document describes the system design, components, and data flow for the **Diabetes Risk Predictor** — an explainable, full-stack Type 2 diabetes risk-screening platform, covering everything from the trained model through to the deployed web application, conversational assistant, and reporting pipeline.

> **Note:** this document supersedes the earlier notebook-only architecture description. The project has since grown from a standalone modeling notebook into a deployed application; the sections below reflect the system as actually built and shipped.

---

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Components](#components)
- [Data Flow](#data-flow)
- [Prediction Pipeline (Runtime)](#prediction-pipeline-runtime)
- [Conversational Assistant: Dida](#conversational-assistant-dida)
- [Model Artifacts](#model-artifacts)
- [Security & Access Control](#security--access-control)
- [Deployment Topology](#deployment-topology)
- [Directory Structure](#directory-structure)

---

## Overview

The platform is a **production-style, full-stack application**, not a research notebook. It consists of a machine learning core (data pipeline, trained CatBoost classifier, SHAP/LIME explainability), wrapped in a FastAPI backend and a Next.js dashboard, with supporting infrastructure for authentication, persistence, batch processing, multi-channel reporting, and a hybrid LLM-driven conversational assistant ("Dida").

The system trains on the CDC's 2023 Behavioral Risk Factor Surveillance System (BRFSS) survey (429,086 respondents) using fourteen self-reportable features, and serves predictions through three interaction surfaces that all converge on the same backend prediction endpoint:

1. A structured, multi-step web form (`/dashboard/predict`)
2. A batch CSV upload for cohort-level screening (`/dashboard/batch`)
3. Dida, a conversational assistant embedded across the app

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            PRESENTATION LAYER                            │
│                         Next.js 14 (App Router)                          │
│                                                                            │
│  Public pages          Dashboard (auth)         Dida (global widget)     │
│  /research/*           /dashboard/predict        Open chat  → LLM        │
│  /about/*              /dashboard/batch          Risk check → state      │
│  /risk-assessment      /dashboard/history           machine (client)     │
│                        /dashboard/analytics                              │
│                        /dashboard/reports                                │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │  REST (JWT bearer, axios `api` instance)
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION / API LAYER                         │
│                              FastAPI (async)                             │
│                                                                            │
│  /auth       /predict     /batch      /history    /analytics             │
│  /export     /chat        /explainability          /health               │
└───────┬───────────────┬───────────────┬────────────────┬────────────────┘
        │               │               │                │
        ▼               ▼               ▼                ▼
┌───────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐
│  ML / XAI      │ │ Conversational│ │  Data &     │ │   Reporting          │
│  Layer         │ │ AI (Dida)    │ │  Persistence│ │   Layer              │
│               │ │              │ │             │ │                      │
│ CatBoost       │ │ Llama-3.1-8B │ │ PostgreSQL  │ │ ReportLab (PDF)      │
│ classifier     │ │ (NVIDIA API) │ │ via async   │ │ CSV export           │
│ + preprocessor │ │ — open chat  │ │ SQLAlchemy  │ │ SMTP email delivery  │
│               │ │   only        │ │             │ │                      │
│ SHAP           │ │              │ │ users        │ │                      │
│ TreeExplainer  │ │              │ │ predictions  │ │                      │
│ LIME explainer │ │              │ │ batch_jobs   │ │                      │
└───────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          IDENTITY & ACCESS LAYER                         │
│         Google OAuth 2.0 (NextAuth)  →  JWT bearer  →  FastAPI           │
│    Anonymous prediction allowed · Persistence/export/email require auth │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Presentation Layer — Next.js 14 (App Router)

| Route group | Purpose |
|---|---|
| `app/(public)/` | Marketing/informational pages: `about/*` (diabetes education), `research/*` (dataset, model card, prior research, our research paper, XAI methodology), `risk-assessment` (anonymous single prediction) |
| `app/(auth)/login` | Google OAuth sign-in via NextAuth |
| `app/(dashboard)/dashboard/*` | Authenticated area: `predict`, `batch`, `history`, `analytics`, `reports`, `profile`, `settings` |
| `components/chat/Dida.tsx` | Global floating assistant, mounted app-wide via `app/layout.tsx`, session-aware via `useSession()` |

All authenticated API calls go through a single axios instance (`lib/api.ts`) whose request interceptor attaches the NextAuth JWT as a `Bearer` token. File downloads (PDF/CSV) are fetched as authenticated blobs and saved client-side rather than via plain `<a href>` links, since browsers do not attach custom headers to normal link navigation.

### 2. Application / API Layer — FastAPI

| Router | Responsibility |
|---|---|
| `api/auth.py` | Google OAuth token verification, user upsert, JWT issuance |
| `api/predict.py` | Single-prediction endpoint; used by both the structured form and Dida |
| `api/batch.py` | CSV upload, row-by-row batch scoring, batch job persistence |
| `api/history.py` | Paginated prediction history for the authenticated user |
| `api/analytics.py` | Dashboard summary stats and per-batch analytics (risk-by-age, risk-by-BMI, global SHAP) |
| `api/export.py` | Authenticated PDF/CSV export and SMTP email delivery, scoped to resource ownership |
| `api/explainability.py` | Standalone SHAP/LIME explanation endpoints |
| `api/chat.py` | Dida's open-ended conversation endpoint (LLM call only — see below) |
| `api/health.py` | Liveness/readiness check |

### 3. ML / Explainability Layer

- **Model**: CatBoost gradient-boosting classifier, trained on 14 BRFSS-derived features (see [Model Artifacts](#model-artifacts)), loaded once at API startup (`inference_service.load()` in the FastAPI lifespan handler).
- **Preprocessing**: a fitted pipeline applied identically at training and inference time.
- **Explainability**: `shap.TreeExplainer` computes exact per-prediction and global Shapley values directly on the CatBoost model; LIME's `LimeTabularExplainer` independently generates a locally faithful surrogate explanation for the same prediction, giving two independently-derived explanations per result.

### 4. Conversational AI — Dida

Dida is deliberately split into two architecturally separate layers (see [Conversational Assistant: Dida](#conversational-assistant-dida) for the full rationale):

- An **LLM layer** (Llama-3.1-8B-Instruct via NVIDIA's API) that only ever handles open-ended dialogue — answering questions, explaining a result, offering prevention tips.
- A **deterministic client-side layer** that owns the fourteen-question data collection flow and the actual prediction call, with no LLM involvement in tracking assessment state.

### 5. Data & Persistence Layer

Async SQLAlchemy over PostgreSQL. Core tables:

| Table | Purpose |
|---|---|
| `users` | Google-authenticated accounts |
| `predictions` | Individual predictions — input features, prediction, probability, risk level, SHAP values, recommendation, owning user (nullable for anonymous) |
| `batch_jobs` | Batch upload metadata and aggregate statistics; individual rows are stored as `predictions` linked via `batch_job_id` |

### 6. Reporting Layer

- **PDF generation** (`services/pdf_generator.py`, ReportLab): single-patient report and batch executive-summary report.
- **CSV export**: batch results filtered by risk tier (high / moderate / low / all).
- **Email delivery** (`services/email_service.py`, stdlib `smtplib`): sends the single-patient PDF as an attachment via SMTP.

All export and email endpoints verify both authentication and resource ownership before serving data.

### 7. Identity & Access Layer

Google OAuth 2.0 via NextAuth issues a JWT that FastAPI verifies via `HTTPBearer` (`app/dependencies.py`). Two dependency variants are used throughout the API:

- `get_current_user` — required auth; used by export, email, and any endpoint returning personal data.
- `get_optional_user` — auth is attached if present but not required; used by `/predict` so anonymous screening remains possible, and by `/chat` for optional personalization.

---

## Data Flow

```
CDC BRFSS 2023 survey (429,086 respondents)
   │
   ▼
Notebook pipeline (notebooks/) — offline, one-time
   │
   ├── Data understanding & EDA
   ├── Feature selection → 14 features (see Model Artifacts)
   ├── Preprocessing (imputation, native categorical handling)
   ├── Model training & comparison (CatBoost selected)
   ├── Threshold tuning (recall-optimised)
   ├── SHAP / LIME validation
   │
   ▼
Serialized artifacts → models/final_model.joblib, preprocessor.joblib, metadata.json
   │
   ▼
Loaded once at FastAPI startup (inference_service)
   │
   ▼
Runtime prediction request (web form · batch CSV · Dida)
   │
   ├── Apply preprocessing pipeline
   ├── CatBoost inference → prediction, probability, risk tier
   ├── SHAP TreeExplainer → per-prediction + global attributions
   ├── LIME → independent local explanation
   ├── Persist to `predictions` table (if authenticated)
   │
   ▼
Result delivered to client
   │
   ├── Visual risk gauge + top SHAP driver + recommendation (all surfaces)
   ├── PDF download / email (authenticated only)
   └── Batch: aggregated into `batch_jobs` → analytics dashboard
```

---

## Prediction Pipeline (Runtime)

Both the structured form and Dida invoke the **same** `/predict` endpoint — there is a single source of truth for risk computation regardless of interaction modality:

1. Client submits the 14 feature values (JSON body).
2. API applies the stored preprocessing pipeline.
3. CatBoost returns a class prediction and probability.
4. Risk tier (Low / Moderate / High) is derived by thresholding the probability.
5. SHAP `TreeExplainer` computes per-feature attribution for this specific prediction.
6. If the request is authenticated, the prediction (including SHAP values and a generated recommendation) is persisted, and the response includes the new `id` — required for later PDF download or email.
7. If unauthenticated, the prediction is returned but not persisted, and is not downloadable or emailable.

Batch prediction (`/batch`) follows the same per-row logic, additionally computing aggregate statistics (risk-tier counts/percentages, mean/median probability, global SHAP importance, risk-by-age, risk-by-BMI) via `services/analytics.py`, reused identically whether computed at upload time or reconstructed later for the analytics dashboard.

---

## Conversational Assistant: Dida

Dida's architecture is a direct response to a reliability problem found during development: when the fourteen-question assessment was driven entirely by free-form LLM dialogue, the assistant would intermittently lose track of previously collected answers, fail to present selectable options consistently, or never trigger the final prediction call. Small instruction-tuned models are not reliable long-running structured-state trackers.

The fix separates concerns entirely:

| Layer | Owns | Backed by |
|---|---|---|
| **Conversational** | Open-ended Q&A, explaining a result's SHAP drivers, prevention tips, deciding *when* to offer starting an assessment | Llama-3.1-8B-Instruct via `/chat` |
| **Assessment** | The fourteen-question flow itself: question order, rendering the correct input type (buttons vs. numeric), tracking collected answers, calling `/predict` once complete | Client-side React state machine (`lib/dida-fields.ts` + `components/chat/Dida.tsx`) — no LLM involvement |

A lightweight intent layer bridges the two: `looksLikeRiskCheckIntent()` recognises explicit requests ("check my risk"), and `looksLikeRiskCheckOffer()` / `looksLikeAffirmative()` let a bare "yes" be understood correctly when it follows Dida's own offer to start the assessment — without needing the LLM to track that context itself.

---

## Model Artifacts

### `models/metadata.json`

```json
{
  "model_name": "CatBoostClassifier",
  "version": "2.0.0",
  "trained_date": "2026-XX-XX",
  "dataset": "BRFSS 2023",
  "n_samples": 429086,
  "n_features": 14,
  "feature_names": [
    "_BMI5", "_AGE80", "SEXVAR", "_IMPRACE", "GENHLTH", "PHYSHLTH",
    "SMOKE100", "_TOTINDA", "EDUCA", "INCOME3",
    "_RFHYPE6", "_RFCHOL3", "CHCKDNY2", "_MICHD"
  ],
  "target": "diabetes_diagnosis",
  "classes": [0, 1],
  "metrics": {
    "recall": 0.75,
    "roc_auc": 0.82
  },
  "explainability": ["SHAP (TreeExplainer)", "LIME (LimeTabularExplainer)"]
}
```

> Fill in `trained_date` and any additional tuned hyperparameters from the actual training run before publishing.

---

## Security & Access Control

- **Authentication**: Google OAuth 2.0 → NextAuth session → JWT bearer token on every authenticated API call.
- **Ownership checks**: `/export/report/{id}/pdf`, `/export/report/{id}/email`, and batch export routes all verify the requesting user owns the resource before serving it — not just that they are logged in.
- **Anonymous access**: `/predict` is reachable without authentication to support ungated screening, but anonymous predictions are never persisted, downloadable, or emailable.
- **Secrets**: SMTP credentials, the NVIDIA API key, and OAuth client secrets are supplied via environment variables (`.env`), never committed.

---

## Deployment Topology

| Component | Runs as |
|---|---|
| Frontend (Next.js) | Node.js server / static+SSR hosting (e.g. Vercel or equivalent) |
| Backend (FastAPI) | ASGI app via `uvicorn`, containerizable |
| Database | Managed PostgreSQL instance |
| Model artifacts | Loaded from disk (`ml_models/`) at API startup — not re-trained at request time |
| LLM (Dida's chat layer) | External inference API call (NVIDIA-hosted Llama-3.1-8B-Instruct) — not self-hosted |
| Email | Outbound SMTP (e.g. Gmail with an App Password) |

> This section intentionally stays high-level here — full environment variables, hosting provider specifics, and the CI/CD pipeline are covered in the dedicated Deployment presentation/report, not duplicated in this architecture document.

---

## Directory Structure

```
diabetes-risk-prediction-xai/
│
├── app/
│   ├── api/                        ← FastAPI backend
│   │   └── app/
│   │       ├── api/                ← Route modules (predict, batch, chat, export, ...)
│   │       ├── services/           ← inference, analytics, dida, pdf_generator, email_service, ...
│   │       ├── models/             ← SQLAlchemy models (user, prediction)
│   │       ├── schemas/            ← Pydantic request/response schemas
│   │       ├── dependencies.py     ← Auth dependencies (get_current_user, get_optional_user)
│   │       └── config.py           ← Settings (DB, SMTP, OAuth, NVIDIA API key)
│   │
│   └── web/                        ← Next.js frontend
│       ├── app/                    ← App Router: (public), (auth), (dashboard) route groups
│       ├── components/             ← chat/Dida.tsx, prediction/, batch/, shared/
│       ├── lib/                    ← api.ts, dida-fields.ts, auth.ts, utils.ts
│       ├── types/                  ← Shared TypeScript types
│       └── public/reports/         ← Static assets (e.g. final_report.pdf)
│
├── datasets/
│   ├── raw/                        ← Source BRFSS extract (gitignored)
│   └── processed/                  ← Cleaned, feature-selected data (gitignored)
│
├── models/
│   ├── final_model.joblib          ← Trained CatBoost classifier
│   ├── preprocessor.joblib         ← Fitted preprocessing pipeline
│   └── metadata.json               ← Model metadata (see above)
│
├── notebooks/
│   ├── diabetes_prediction.ipynb   ← Full offline modeling pipeline
│   └── T2DM.ipynb
│
├── docs/                           ← architecture.md (this file), dashboard.md, methodology.md
├── reports/                        ← proposal.pdf, final_report.pdf
├── presentations/                  ← presentation.pptx/.pdf, speaker_notes.md
├── submission/                     ← github.pdf, notebook.pdf, presentation.pdf
│
└── images/
    ├── 01_data_understanding/ … 08_presentation/
```

---

*Last updated: 2026-07-17 — rewritten to reflect the deployed FastAPI/Next.js application, CatBoost model on BRFSS 2023, and the Dida conversational assistant, superseding the earlier notebook-only description.*
