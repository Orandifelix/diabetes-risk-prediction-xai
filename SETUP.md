# Diabetes Risk Predictor — Complete Setup & Execution Guide

Everything you need to run the full platform locally and deploy it to production.

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Python | 3.12+ | https://python.org |
| Conda | Latest | https://docs.conda.io |
| Node.js | 18+ | https://nodejs.org |
| Yarn | Latest | `npm install -g yarn` |
| Git | Latest | https://git-scm.com |
| Docker Desktop | Latest | https://docker.com (optional) |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Orandifelix/diabetes-risk-prediction-xai.git
cd diabetes-risk-prediction-xai
```

---

## Step 2 — Set Up the Python Environment

```bash
# Create and activate the conda environment
conda env create -f environment.yml
conda activate diabetes-xai

# Verify
python -c "import sklearn, xgboost, shap, lime; print('✅ Python environment OK')"
```

---

## Step 3 — Train the Model (Your Part)

Open and run the notebook end-to-end:

```bash
jupyter notebook notebooks/diabetes_prediction.ipynb
```

When the notebook finishes, verify these files exist:

```
models/final_model.joblib
models/preprocessor.joblib
models/metadata.json
```

Then copy them into the API:

```bash
cp models/final_model.joblib    apps/api/ml_models/
cp models/preprocessor.joblib  apps/api/ml_models/
cp models/metadata.json         apps/api/ml_models/
```

---

## Step 4 — Set Up External Services (Free Tiers)

### 4a. Supabase (PostgreSQL database)

1. Go to https://supabase.com → Sign up → New Project
2. Choose a name, password, and region
3. Go to **Settings → Database → Connection string**
4. Copy the **URI** (starts with `postgresql://`)
5. Save it — you will need it in Step 5

### 4b. Upstash (Redis)

1. Go to https://upstash.com → Sign up → Create Database
2. Choose **Redis**, pick a region
3. Copy the **REDIS_URL** (starts with `rediss://`)
4. Save it — you will need it in Step 5

### 4c. Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project → **APIs & Services → Credentials**
3. Click **Create Credentials → OAuth Client ID**
4. Application type: **Web application**
5. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-app.vercel.app/api/auth/callback/google
   ```
6. Copy **Client ID** and **Client Secret**

---

## Step 5 — Configure Environment Variables

### Backend (`apps/api/.env`)

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
REDIS_URL=rediss://:[YOUR-PASSWORD]@[YOUR-HOST].upstash.io:6379
JWT_SECRET=run-this-to-generate: openssl rand -base64 32
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### Frontend (`apps/web/.env.local`)

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-this-to-generate: openssl rand -base64 32
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Step 6 — Run the Backend API

```bash
cd apps/api

# Install dependencies
pip install -r requirements.txt

# Run database migrations (creates tables in Supabase)
alembic upgrade head

# Start the API
uvicorn app.main:app --reload --port 8000
```

Verify it is running:

```
http://localhost:8000          → API root
http://localhost:8000/docs     → Swagger UI (all endpoints)
http://localhost:8000/health   → Model status
```

Expected health response when model is loaded:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_name": "XGBoostClassifier",
  "model_version": "1.0.0"
}
```

---

## Step 7 — Run the Frontend

Open a new terminal:

```bash
cd apps/web

# Install dependencies
yarn install

# Start dev server
yarn dev
```

Open your browser at:

```
http://localhost:3000
```

---

## Step 8 — Verify Everything Works

Go through this checklist in order:

```
[ ] http://localhost:8000/health  → model_loaded: true
[ ] http://localhost:3000         → Home page loads
[ ] /risk-assessment              → 4-step form renders
[ ] Submit the form               → Risk gauge appears with SHAP chart
[ ] /about                        → Education pages load
[ ] /research/prior               → 8 paper cards render
[ ] /login                        → Google sign-in button appears
[ ] Sign in with Google           → Redirected to /dashboard
[ ] /dashboard/predict            → Single prediction form works + saves to history
[ ] /dashboard/batch              → CSV upload processes correctly
[ ] /dashboard/analytics          → Batch analytics charts render
[ ] /dashboard/history            → Predictions listed correctly
[ ] /dashboard/reports            → PDF and CSV download links work
```

---

## Step 9 — Run Tests

```bash
# Backend tests
cd apps/api
pytest tests/ -v

# Frontend type check
cd apps/web
yarn type-check

# Frontend lint
yarn lint
```

---

## Step 10 — Deploy to Production

### Deploy Frontend to Vercel

1. Go to https://vercel.com → Import GitHub repository
2. Set **Root Directory** to `apps/web`
3. Add all environment variables from `apps/web/.env.local`
4. Update `NEXTAUTH_URL` to your Vercel URL
5. Update `ALLOWED_ORIGINS` in the API `.env` to include the Vercel URL
6. Click **Deploy**

### Deploy Backend to Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repository
3. Settings:
   ```
   Root Directory:   apps/api
   Build Command:    pip install -r requirements.txt
   Start Command:    uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
4. Add all environment variables from `apps/api/.env`
5. Update `DATABASE_URL` to your Supabase URL
6. Click **Deploy**

### After both are deployed

Update Google OAuth redirect URIs:
```
https://your-app.vercel.app/api/auth/callback/google
```

Update `NEXT_PUBLIC_API_URL` on Vercel to your Render URL:
```
https://your-api.onrender.com
```

---

## Optional — Run with Docker

If you have Docker Desktop installed, you can run everything with one command:

```bash
cd apps
docker-compose up --build
```

This starts PostgreSQL, Redis, FastAPI, and Next.js together.

Note: Docker uses local PostgreSQL — swap `DATABASE_URL` in `docker-compose.yml`
to your Supabase URL for production data.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `Model not loaded` on /health | Copy joblib files to `apps/api/ml_models/` and restart |
| `CORS error` in browser | Add frontend URL to `ALLOWED_ORIGINS` in `apps/api/.env` |
| `401 Unauthorized` on dashboard | Check `JWT_SECRET` matches between .env files |
| Google OAuth fails | Verify redirect URIs in Google Cloud Console match exactly |
| Render spins down (cold start) | Add a GitHub Actions cron to ping `/health/ping` every 10 min |
| Supabase connection refused | Check `DATABASE_URL` format — must be `postgresql://` not `postgres://` |
| `yarn: command not found` | Run `npm install -g yarn` first |
| Alembic migration fails | Check `DATABASE_URL` is set in `apps/api/.env` before running |

---

## Project URLs Summary

| Service | Local | Production |
|---|---|---|
| Frontend | http://localhost:3000 | https://your-app.vercel.app |
| API | http://localhost:8000 | https://your-api.onrender.com |
| API Docs | http://localhost:8000/docs | https://your-api.onrender.com/docs |
| Database | Supabase dashboard | https://supabase.com/dashboard |
| Redis | Upstash dashboard | https://upstash.com |
| CI/CD | GitHub Actions | https://github.com/Orandifelix/diabetes-risk-prediction-xai/actions |

---

## Team Responsibilities for Execution

| Person | Task |
|---|---|
| **Stephen** | Set up Google OAuth credentials, run Alembic migrations, deploy Render |
| **Angela** | Download BRFSS dataset, place in `datasets/raw/`, run EDA notebook sections |
| **Diana** | Run full notebook end-to-end, save model artifacts to `models/` |
| **Kevin** | Verify SHAP/LIME outputs in notebook, copy models to `apps/api/ml_models/` |
| **Orandi** | Set up Supabase + Upstash, configure all `.env` files, deploy Vercel |

