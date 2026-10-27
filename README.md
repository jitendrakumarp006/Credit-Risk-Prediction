# CreditRisk.AI — AI-Powered Credit Risk Prediction & Analytics Platform

[![Vite](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready full-stack machine learning web application built for the **German Credit Risk** dataset. Features an interactive fintech dashboard, real-time risk assessment, four trained Scikit-Learn classifiers, dataset exploration, and educational target leakage analysis.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CLIENT TIER (React 19 + Vite + Tailwind)             │
│                                                                        │
│   Dashboard (Recharts) ── Prediction Form ── Applications Registry     │
│   Model Analytics       ── Dataset Explorer ── System Settings         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST / JSON
                                    │ (CORS-restricted)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  SERVICE TIER (FastAPI + Pydantic v2)                  │
│                                                                        │
│   GET  /api/health     GET  /api/models                                │
│   GET  /api/metadata   POST /api/predict                               │
│                                                                        │
│   • Lifespan Artifact Loader (Validates bundle keys & integrity)       │
│   • Exact 9-Feature Pipeline (Reuses saved LabelEncoders & Scaler)     │
│   • Multi-Model Inference Dispatcher                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ In-Memory Inference
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              MODEL ARTIFACT (credit_risk_bundle.joblib - 352 KB)       │
│                                                                        │
│   1. Random Forest (100 Trees)       3. Logistic Regression (L2)       │
│   2. Decision Tree (CART / Gini)     4. Support Vector Machine (RBF)   │
│   + Fitted StandardScaler (9 feats)  + 5 Fitted LabelEncoders          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

1. **Executive Portfolio Dashboard**
   - 4 high-level KPI cards: Total Applications (1,000), Low-Risk count, High-Risk count, and active models.
   - 5 interactive Recharts visualizations: Risk ratio donut, credit amount brackets, loan purpose horizontal bars, duration distribution, and applicant age curve.
   - Sortable recent assessments table with risk filter and slide-out applicant details drawer.
2. **Multi-Model Risk Prediction Engine**
   - Validated applicant demographic & financial intake form.
   - 3 preconfigured quick-fill presets, including the verified Colab sample `[35, 1, 2, 1, 2, 1, 5000, 24, 3]`.
   - Dynamic model switching across **Random Forest**, **Decision Tree**, **Logistic Regression**, and **SVM**.
   - Comprehensive assessment modal showing classification, class probabilities (`predict_proba`), feature breakdown, and academic target limitations.
   - One-click persistence into local ledger, printable assessment summary, and CSV export.
3. **Model Analytics & Academic Target Leakage Analysis**
   - Documents reported Colab accuracies: Logistic Regression (98%), Decision Tree (100%), Random Forest (100%), SVM (94%).
   - Transparent analysis explaining why tree classifiers scored 100% due to target leakage (target generated from credit amount median).
4. **Interactive Dataset Explorer**
   - Full 1,000-row German Credit Dataset with column sorting, live filtering, and pagination.
   - Missing-value audit (`Saving accounts`: 183 missing, `Checking account`: 394 missing).
   - Summary statistics (Min, Mean, Median, Max, Std Dev) and category distribution cards.

---

## 📁 Repository Directory Structure

```text
credit-risk-ai-app/
├── backend/                              # Python FastAPI Machine Learning Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                     # Environment settings & CORS origin parser
│   │   ├── main.py                       # FastAPI application & route controllers
│   │   ├── model_service.py              # Model lifecycle & inference engine
│   │   ├── preprocessing.py              # Exact 9-feature transformation & encoders
│   │   └── schemas.py                    # Pydantic request/response validation schemas
│   ├── models/
│   │   ├── .gitkeep
│   │   └── credit_risk_bundle.joblib     # Trusted trained model artifact (352 KB)
│   ├── scripts/
│   │   ├── generate_bundle.py            # Offline training script replicating Colab pipeline
│   │   ├── test_live_inference.py        # Automated test harness for live prediction
│   │   └── test_failure_scenarios.py     # Automated test harness for validation rules
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                   # Pytest fixtures & isolated synthetic bundle
│   │   ├── test_health.py                # Health & model metadata tests
│   │   └── test_prediction.py            # Multi-model inference & edge-case tests
│   ├── .env.example                      # Backend environment template
│   ├── .gitignore                        # Python & venv exclusion rules
│   ├── Dockerfile                        # Production containerfile for FastAPI
│   ├── Procfile                          # PaaS deployment entrypoint (Render / Railway)
│   ├── README.md                         # Dedicated backend documentation
│   └── requirements.txt                  # Python dependencies
├── src/                                  # React + Vite Frontend
│   ├── components/                       # Modular UI components (Cards, Tables, Modals, Drawers)
│   ├── context/                          # Global application state (AppContext.jsx)
│   ├── data/                             # German Credit 1,000-row dataset & presets
│   ├── pages/                            # 7 core views (Dashboard, Prediction, Applications, etc.)
│   ├── services/                         # api.js & predictionService.js client layer
│   └── utils/                            # Currency, date, and exportToCsv helpers
├── public/
│   └── _redirects                        # Netlify & Cloudflare SPA routing rewrite
├── .env.example                          # Root frontend environment template
├── .gitignore                            # Root git ignore (secrets, venvs, dist)
├── docker-compose.yml                    # Multi-container orchestration (Frontend + Backend)
├── Dockerfile                            # Production multi-stage containerfile (Vite + Nginx)
├── nginx.conf                            # Nginx web server config with SPA fallback & gzip
├── package.json                          # Frontend dependencies & scripts
├── tailwind.config.js                    # Design tokens & color system
├── vercel.json                           # Vercel SPA routing rewrites
└── vite.config.js                        # Vite build configuration
```

---

## ⚙️ Environment Variables Reference

### Frontend Configuration (`.env` or Cloud Build Variables)
Copy `.env.example` to `.env`:
```bash
# Must point to the deployed FastAPI service and include the /api prefix
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend Configuration (`backend/.env` or Cloud Hosting Settings)
Copy `backend/.env.example` to `backend/.env`:
```bash
# Network binding
HOST=0.0.0.0
PORT=8000
API_PREFIX=/api
LOG_LEVEL=INFO

# Security / CORS: Comma-separated list of allowed frontend origins (DO NOT use '*' in production!)
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Path to the verified Scikit-Learn artifact bundle
MODEL_BUNDLE_PATH=models/credit_risk_bundle.joblib
```

---

## 🛠️ Local Development Setup

### 1. Backend Setup (Terminal 1)
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# Linux / macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest -v

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup (Terminal 2)
```bash
# From project root
npm install

# Start Vite dev server
npm run dev -- --port 5173 --host
```
- Web Application: `http://localhost:5173/`

---

## 📦 Model Artifact Preservation

The model artifact is stored at:
```text
backend/models/credit_risk_bundle.joblib
```
- **Size**: 352.62 KB (safely tracked in Git, well below GitHub's 50MB warning threshold).
- **Bundle Contents**:
  - `models`: Dictionary with keys `['logistic_regression', 'decision_tree', 'random_forest', 'svm']`.
  - `scaler`: Fitted `StandardScaler` for the exact 9 features.
  - `encoders`: Dictionary with 5 fitted `LabelEncoder` objects (`Sex`, `Housing`, `Saving accounts`, `Checking account`, `Purpose`).
  - `feature_columns`: Exact 9 feature names in training order.
  - `median_amount`: Dataset median amount (`2319.5`).
  - `target_definition`: Description string.

### Re-generating the Artifact
If you wish to re-train the bundle from scratch using the raw German Credit CSV:
```bash
cd backend
python scripts/generate_bundle.py
```

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Sample Status |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | Returns service status, artifact readiness, and mode (`live`/`unavailable`). | `200 OK` |
| `GET` | `/api/models` | Returns the 4 available models, human names, and notebook accuracies. | `200 OK` |
| `GET` | `/api/metadata` | Returns feature ordering, categorical classes, and training limitations. | `200 OK` |
| `POST` | `/api/predict` | Executes Scikit-Learn inference on validated applicant profile. | `200 OK` / `422` / `503` |

### Sample Prediction Request
`POST /api/predict`
```json
{
  "applicant": {
    "age": 35,
    "sex": "male",
    "job": 2,
    "housing": "own",
    "savingAccounts": "moderate",
    "checkingAccount": "moderate",
    "creditAmount": 5000.0,
    "duration": 24,
    "purpose": "education"
  },
  "model": "random_forest"
}
```

### Sample Prediction Response
```json
{
  "prediction": 1,
  "predicted_label": "High Risk (Above Median)",
  "model_name": "Random Forest Classifier",
  "model_id": "random_forest",
  "model_version": "v1.0-scikit-learn-colab-bundle",
  "prediction_timestamp": "2026-10-27T01:35:14.498329+00:00",
  "target_definition": "Credit amount > dataset median ($2,319.50)",
  "target_limitations": [
    "Experimental Academic Definition: Target was created as (Credit amount > dataset median).",
    "Target Leakage Warning: Because Credit amount is both an input feature and the direct generator of the target label, decision trees achieve an artificial 100% test accuracy."
  ],
  "input_summary": { ... },
  "mode": "live",
  "probabilities": {
    "class_0_score": 0.02,
    "class_1_score": 0.98,
    "semantic_meaning": "Statistical model score for the experimental median-threshold class..."
  },
  "explanation": "Classified as High Risk (Class 1) because requested loan amount ($5,000.00) exceeds $2,319.50 median..."
}
```

---

## ☁️ Cloud Deployment Strategies

### Option 1: Full-Stack Docker Deployment (Google Cloud Run / AWS ECS / Render)

You can containerize both tiers using Docker Compose:

1. **Build and Run Locally with Compose**:
   ```bash
   docker compose up --build
   ```
   - Frontend is served via Nginx at `http://localhost:80`
   - Backend API is accessible at `http://localhost:8000/api`

2. **Deploy Backend Container to Cloud Run / AWS ECS**:
   - Build image: `docker build -t creditrisk-backend ./backend`
   - Push to Google Artifact Registry / AWS ECR.
   - Set environment variables:
     - `PORT=8080`
     - `ALLOWED_ORIGINS=https://your-frontend-domain.com`
     - `MODEL_BUNDLE_PATH=models/credit_risk_bundle.joblib`

3. **Deploy Frontend Container to Cloud Run / AWS ECS**:
   - Build image: `docker build --build-arg VITE_API_BASE_URL=https://your-backend-api.com/api -t creditrisk-frontend .`
   - Deploy to container runner on port 80.

---

### Option 2: Render Deployment (Blueprint or Manual Web Service + Static Site)

Render provides an ideal zero-config deployment using either Render Blueprints (`render.yaml`) or manual service creation:

#### Method A: 1-Click Render Blueprint (`render.yaml`)
1. Push this repository to GitHub or GitLab.
2. Log into [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Connect your repository. Render automatically reads [`render.yaml`](render.yaml) and provisions both:
   - **`credit-risk-backend`** (Python Web Service)
   - **`credit-risk-frontend`** (Static Site with SPA rewrite rules)
5. Under environment variables:
   - Once deployed, set backend `ALLOWED_ORIGINS` to `https://<your-frontend-subdomain>.onrender.com`.
   - Set frontend `VITE_API_BASE_URL` to `https://<your-backend-subdomain>.onrender.com/api`.

#### Method B: Manual Render Setup

**1. Deploy Backend (Render Web Service):**
- **Repository**: Connect your GitHub repo.
- **Name**: `credit-risk-backend`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.12.8` (or 3.11+)
  - `MODEL_BUNDLE_PATH`: `models/credit_risk_bundle.joblib`
  - `ALLOWED_ORIGINS`: `https://credit-risk-frontend.onrender.com` (update once frontend is created)
- Verify: Visit `https://credit-risk-backend.onrender.com/api/health` → `{"status": "ok", "artifact_loaded": true, "mode": "live"}`.

**2. Deploy Frontend (Render Static Site):**
- **Repository**: Connect your GitHub repo.
- **Name**: `credit-risk-frontend`
- **Root Directory**: `./` (leave blank or set to `.`)
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Redirects / Rewrites**:
  - Add Rewrite: Source `/*` → Destination `/index.html` (Status: `Rewrite`).
  - *(Note: `public/_redirects` is also automatically copied to `dist/_redirects` during `npm run build`)*.
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://credit-risk-backend.onrender.com/api`

---

### Option 3: Separate Hosting (Vercel / Netlify for Frontend + Render / Railway for Backend)

You can also host the frontend on Vercel or Netlify and connect it to your Render backend:
1. Deploy frontend to Vercel/Netlify with Root Directory `./`, Build Command `npm run build`, Output Directory `dist`.
2. Set `VITE_API_BASE_URL` to `https://credit-risk-backend.onrender.com/api`.
3. Set Render backend `ALLOWED_ORIGINS` to `https://your-app.vercel.app`.

---

### Option 4: Virtual Machine / VPS (Ubuntu + Nginx + Gunicorn/Uvicorn)


1. **Backend Service (`/etc/systemd/system/creditrisk-api.service`)**:
   ```ini
   [Unit]
   Description=CreditRisk.AI FastAPI Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/credit-risk-ai-app/backend
   ExecStart=/var/www/credit-risk-ai-app/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
2. **Nginx Reverse Proxy & SSL (`/etc/nginx/sites-available/creditrisk`)**:
   ```nginx
   server {
       server_name creditrisk.example.com;

       location /api/ {
           proxy_pass http://127.0.0.1:8000/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location / {
           root /var/www/credit-risk-ai-app/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
3. Issue automated TLS certificate: `certbot --nginx -d creditrisk.example.com`.

---

## 🔒 Security & HTTPS Best Practices

- **Strict CORS**: `ALLOWED_ORIGINS` must match the exact frontend protocol and domain. Wildcards (`*`) are disallowed for production credentials.
- **Non-Root Docker Execution**: The backend container creates and runs under an unprivileged `appuser`.
- **Validation Sanitization**: Incoming request properties are strictly parsed and bounded by Pydantic schemas. Unhandled exceptions emit generic messages without exposing filesystem paths or Python stack traces.
- **Secrets Isolation**: Git ignore rules strictly prevent committing `.env`, `.env.local`, `.venv`, or credentials.

---

## ⚠️ Academic Target Leakage & Model Limitations

> [!WARNING]
> **Academic Target Definition**:
> In the source Google Colab project, the target variable was constructed as:
> $$\text{Risk} = \mathbb{I}(\text{Credit Amount} > \text{Median Credit Amount})$$
> Where $\text{Median} = \$2,319.50$.
> Because **Credit Amount** is also provided as an input feature in $X$, tree-based classifiers (Decision Tree & Random Forest) achieve an artificial **100% test accuracy** simply by isolating the median split.
>
> **Commercial Underwriting Distinction**:
> In production banking systems, credit risk models are trained against historical loan repayment delinquency data (e.g. 90+ days past due or charge-off), **never** against requested loan amounts. Output scores must be interpreted solely within the context of the experimental academic formulation.

---

## 🧪 Verification & Test Results

Run all test suites locally:
```bash
# 1. Backend Pytest Suite (19 tests)
cd backend && .\.venv\Scripts\pytest.exe -v

# 2. Frontend Static Analysis (0 errors)
cd .. && npm run lint

# 3. Frontend Production Build (Zero compilation errors)
npm run build
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
