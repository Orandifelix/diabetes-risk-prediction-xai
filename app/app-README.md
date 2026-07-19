# App — Diabetes Risk Predictor (Web + API)

This directory contains the deployed, full-stack application: a **FastAPI** backend serving a CatBoost model with SHAP/LIME explainability, and a **Next.js 14** dashboard with an embedded conversational assistant ("Dida"). For the data science methodology, notebooks, and research paper, see the [top-level README](../README.md) and [`docs/`](../docs/).

---

## Table of Contents

- [Structure](#structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Local)](#quick-start-local)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Available Scripts](#available-scripts)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
- [Known Issues](#known-issues)

---

## Structure

```
app/
├── api/                     ← FastAPI backend
│   ├── app/
│   │   ├── api/             ← Routers: predict, batch, history, analytics,
│   │   │                       export, chat, explainability, auth, health
│   │   ├── services/        ← inference, analytics, dida, pdf_generator,
│   │   │                       email_service, csv_processor, explainability
│   │   ├── models/          ← SQLAlchemy models (user, prediction)
│   │   ├── schemas/         ← Pydantic request/response schemas
│   │   ├── dependencies.py  ← Auth (get_current_user, get_optional_user)
│   │   ├── config.py        ← Settings (env-driven)
│   │   └── main.py          ← App entrypoint, router registration, lifespan
│   ├── ml_models/           ← final_model.joblib, preprocessor.joblib, metadata.json
│   ├── requirements.txt
│   └── Dockerfile
│
├── web/                     ← Next.js 14 frontend
│   ├── app/
│   │   ├── (public)/        ← Marketing/education pages, anonymous risk check
│   │   ├── (auth)/login/    ← Google sign-in
│   │   └── (dashboard)/     ← Authenticated: predict, batch, history, analytics, reports
│   ├── components/          ← chat/Dida.tsx, prediction/, batch/, shared/
│   ├── lib/                 ← api.ts, dida-fields.ts, auth.ts, utils.ts
│   ├── public/reports/      ← Static assets (e.g. final_report.pdf)
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml       ← Postgres + Redis + api + web, for local/prod-like runs
├── Makefile                 ← Convenience commands (see note under Known Issues)
└── cd.yml                   ← Deployment workflow
```

---

## Prerequisites

- **Node.js** 18+ and **yarn**
- **Python** 3.10+
- **PostgreSQL** 14+ (or use Docker Compose)
- A **Google OAuth 2.0** client ID/secret ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))
- An **NVIDIA API key** for Dida's conversational layer (Llama-3.1-8B-Instruct)
- (Optional) SMTP credentials for emailing PDF reports — a Gmail App Password works

---

## Quick Start (Local)

### 1. Backend

```bash
cd app/api
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt --break-system-packages   # or omit the flag in a venv
cp .env.example .env        # then fill in the values — see Environment Variables below
uvicorn app.main:app --reload --port 8000
```

API now running at `http://localhost:8000` (interactive docs at `/docs`).

### 2. Frontend

```bash
cd app/web
yarn install
cp .env.example .env.local  # then fill in the values
yarn dev
```

App now running at `http://localhost:3000`.

> Run both at once from `app/` with `make dev` — see [Known Issues](#known-issues) for a path bug to fix first.

---

## Environment Variables

### `app/api/.env`

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Reserved for future caching use — defined but not yet consumed by any endpoint |
| `JWT_SECRET`, `JWT_ALGORITHM` | Signs/verifies the app's bearer tokens |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Verifies Google ID tokens on `/auth/google` |
| `ALLOWED_ORIGINS` | CORS allow-list (JSON array) |
| `MODEL_PATH`, `PREPROCESSOR_PATH`, `METADATA_PATH` | Paths to the serialized CatBoost artifacts |
| `NVIDIA_API_KEY` | Powers Dida's open-ended conversation layer — **not present in `.env.example`, add it manually** |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Emailing single-prediction PDF reports |

### `app/web/.env.local`

| Variable | Purpose |
|---|---|
| `NEXTAUTH_URL` | Base URL of the frontend (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Session encryption — generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Same Google OAuth client as the backend |
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:8000`) |

---

## Running with Docker

```bash
cd app
docker-compose up -d
```

Brings up Postgres, Redis, the API (`:8000`), and the web app (`:3000`) together. Requires `app/api/.env` and `app/web/.env.local` to exist first — `docker-compose.yml` reads them via `env_file`.

```bash
docker-compose down          # stop
docker-compose logs -f api   # tail backend logs
```

---

## Available Scripts

| Command | Location | Purpose |
|---|---|---|
| `yarn dev` | `app/web` | Start Next.js dev server |
| `yarn build` / `yarn start` | `app/web` | Production build / serve |
| `yarn lint` | `app/web` | ESLint |
| `yarn type-check` | `app/web` | `tsc --noEmit` |
| `uvicorn app.main:app --reload` | `app/api` | Start FastAPI dev server |
| `pytest tests/ -v` | `app/api` | Run backend tests |
| `ruff check .` | `app/api` | Lint backend |

---

## Key Features

- **Single prediction** — 4-step guided form or conversational entry via Dida; returns risk tier, probability, and a SHAP-driven explanation.
- **Batch prediction** — CSV upload for cohort-level screening, with per-batch analytics (risk distribution, risk-by-age, risk-by-BMI, global SHAP importance).
- **Dida** — hybrid conversational assistant: an LLM handles open-ended chat, while a deterministic client-side state machine drives the actual 14-question assessment and prediction call.
- **Explainability** — SHAP (global + per-prediction) and LIME (independent local explanation) on every result.
- **Reporting** — PDF export (single prediction and batch summary), CSV export by risk tier, and email delivery — all scoped to the authenticated owner of the data.
- **History & analytics dashboard** — past predictions and aggregate visualisations for logged-in users.

---

## API Documentation

Interactive, auto-generated docs are available whenever the backend is running:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

A written endpoint-by-endpoint reference (request/response shapes, auth requirements, sample batch CSV) is maintained separately in [`docs/dashboard.md`](../docs/dashboard.md).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, Radix UI, Recharts, Framer Motion |
| Backend | FastAPI (async), SQLAlchemy (async), Pydantic |
| Database | PostgreSQL (`asyncpg`) |
| ML | CatBoost, scikit-learn preprocessing |
| Explainability | SHAP (`TreeExplainer`), LIME |
| Conversational AI | Llama-3.1-8B-Instruct via NVIDIA's inference API |
| Auth | NextAuth (Google OAuth 2.0) + JWT (`python-jose`) |
| Reporting | ReportLab (PDF), `smtplib` (email) |
| Containerisation | Docker, docker-compose |

Full architectural rationale and data flow: [`docs/architecture.md`](../docs/architecture.md).

---

## Deployment

The `.env.example` files point at the intended production targets:

- **Database**: [Supabase](https://supabase.com) (managed Postgres)
- **Cache** *(reserved, not yet wired into any endpoint)*: [Upstash](https://upstash.com) (managed Redis)
- **Frontend**: [Vercel](https://vercel.com) (`ALLOWED_ORIGINS` in the API's `.env.example` already includes a `*.vercel.app` placeholder)
- **Backend**: containerised via `app/api/Dockerfile`, deployable to any ASGI-compatible host

`app/cd.yml` defines the CI/CD workflow. See the project's Deployment presentation (`presentations/presentation.pptx`) for the full walkthrough.

---

## Known Issues

- **`Makefile` path bug**: its `dev`, `api`, `web`, `install`, `lint`, and `test` targets `cd` into `apps/api` / `apps/web` (plural), but the real directories are `app/api` / `app/web` (singular). Same mismatch in the `docker-up`/`docker-down` targets, which reference `apps/docker-compose.yml` instead of the actual `app/docker-compose.yml`. Fix before relying on `make dev`.
- **`REDIS_URL`** is defined in settings and `docker-compose.yml` but not yet read by any route or service — currently inert, reserved for future caching.
- **`NVIDIA_API_KEY`** is required by `services/dida.py` but missing from `app/api/.env.example` — add it manually when setting up a new environment.

