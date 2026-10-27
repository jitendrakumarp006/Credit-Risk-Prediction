# CreditRisk.AI — FastAPI Machine Learning Backend

This service serves the trained Scikit-Learn models (**Logistic Regression, Decision Tree, Random Forest, and Support Vector Machine**) exported from the Google Colab project for the **German Credit Dataset**.

---

## 1. Directory Structure

```text
backend/
├── app/
│   ├── __init__.py           # Package init
│   ├── config.py             # Environment config and path resolution
│   ├── main.py               # FastAPI application, lifespan handler, CORS, routes
│   ├── model_service.py      # Artifact loader, scikit-learn inference, probability extractor
│   ├── preprocessing.py      # LabelEncoder categorical encoding & StandardScaler scaling
│   └── schemas.py            # Pydantic request & response validation schemas
├── models/
│   ├── .gitkeep
│   └── credit_risk_bundle.joblib # Trusted trained model artifact (352 KB)
├── scripts/
│   └── generate_bundle.py    # Offline generator replicating Colab pipeline on raw CSV
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Pytest fixtures and isolated synthetic bundle
│   ├── test_health.py        # System health and model listing tests
│   └── test_prediction.py    # Multi-model inference, validation, and error tests
├── .env.example              # Template environment variables
├── .gitignore
├── requirements.txt          # Python dependencies
└── README.md                 # Complete backend documentation
```

---

## 2. Python Virtual Environment Setup & Installation

### Step 1: Create Virtual Environment
From within the `backend/` directory:
```bash
# Windows (PowerShell)
python -m venv .venv

# Linux / macOS
python3 -m venv .venv
```

### Step 2: Activate the Virtual Environment
```bash
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (Command Prompt)
.\.venv\Scripts\activate.bat

# Linux / macOS
source .venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 3. Model Artifact (`credit_risk_bundle.joblib`)

The service expects a trusted local artifact at:
```text
backend/models/credit_risk_bundle.joblib
```

### Expected Dictionary Structure
The `.joblib` bundle must contain:
1. `models`: Dictionary containing the 4 trained Scikit-Learn classifiers:
   - `logistic_regression`
   - `decision_tree`
   - `random_forest`
   - `svm`
2. `scaler`: Fitted `StandardScaler` fitted on the 9 feature columns.
3. `encoders`: Dictionary containing one fitted `LabelEncoder` per categorical column:
   - `Sex`: classes `['female', 'male']`
   - `Housing`: classes `['free', 'own', 'rent']`
   - `Saving accounts`: classes `['little', 'moderate', 'quite rich', 'rich', 'unknown']`
   - `Checking account`: classes `['little', 'moderate', 'rich', 'unknown']`
   - `Purpose`: classes `['business', 'car', 'domestic appliances', 'education', 'furniture/equipment', 'radio/TV', 'repairs', 'vacation/others']`
4. `feature_columns`: Exact ordered list of 9 features:
   `['Age', 'Sex', 'Job', 'Housing', 'Saving accounts', 'Checking account', 'Credit amount', 'Duration', 'Purpose']`
5. `categorical_columns`: The 5 categorical column names.
6. `median_amount`: Dataset median credit amount (e.g. `2319.5`).
7. `target_definition`: Description string of the experimental target.

### Generating or Re-Exporting the Artifact
If you wish to re-train the bundle offline using the student notebook's exact code on the German Credit dataset:
```bash
python scripts/generate_bundle.py
```
This trains all four models on `german_credit_data.csv`, evaluates test accuracy, tests the Colab sample `[35, 1, 2, 1, 2, 1, 5000, 24, 3]`, and writes the bundle to `models/credit_risk_bundle.joblib`.

---

## 4. Starting the FastAPI Server

Launch the Uvicorn server:
```bash
# From within backend/
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server will start at:
- **Base URL**: `http://127.0.0.1:8000`
- **API Prefix**: `http://127.0.0.1:8000/api`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 5. API Endpoints

### 1. `GET /api/health`
Reports service status and whether the ML model artifact is verified and loaded.
```json
{
  "status": "ok",
  "artifact_loaded": true,
  "available_models": ["logistic_regression", "decision_tree", "random_forest", "svm"],
  "mode": "live",
  "message": "Model bundle loaded and verified. Ready for live inference."
}
```
*Note: If the artifact is missing, it reports `status: "unavailable"` and `mode: "unavailable"`.*

### 2. `GET /api/models`
Returns available classifiers with their notebook-reported test accuracies.

### 3. `GET /api/metadata`
Returns pipeline specifications, feature order, categorical classes, and target definitions.

### 4. `POST /api/predict`
Accepts an applicant profile and executes real-time inference using the selected Scikit-Learn model.

**Example Request**:
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

**Example Response**:
```json
{
  "prediction": 1,
  "predicted_label": "High Risk (Above Median)",
  "model_name": "Random Forest Classifier",
  "model_id": "random_forest",
  "model_version": "v1.0-scikit-learn-colab-bundle",
  "prediction_timestamp": "2026-10-27T01:15:00.000Z",
  "target_definition": "Credit amount > dataset median ($2,319.50)",
  "target_limitations": [
    "Experimental Academic Definition: Target was created as (Credit amount > dataset median).",
    "Target Leakage Warning: Because Credit amount is both an input feature and the direct generator of the target label, decision trees achieve an artificial 100% test accuracy.",
    "Not A Real Default Probability: This classifier was trained on loan amount partitions, not on 90+ days past due payment default outcomes."
  ],
  "input_summary": { ... },
  "mode": "live",
  "probabilities": {
    "class_0_score": 0.0,
    "class_1_score": 1.0,
    "semantic_meaning": "Statistical model score for the experimental median-threshold class..."
  },
  "explanation": "Classified as High Risk (Class 1) because the requested loan amount ($5,000.00) exceeds the experimental German Credit median threshold of $2,319.50..."
}
```

---

## 6. Running the Automated Test Suite

Execute the comprehensive test suite with `pytest`:
```bash
# From within backend/
pytest -v
```

### Test Coverage Highlights:
- `test_health_when_artifact_missing`: Confirms degraded status when bundle is unloaded.
- `test_health_when_artifact_loaded`: Confirms live mode when bundle is loaded.
- `test_get_models_endpoint`: Verifies all 4 models and metadata.
- `test_get_metadata_endpoint`: Verifies 9 feature columns and 5 categorical features.
- `test_predict_rejected_when_artifact_unloaded`: Returns HTTP 503 if artifact is missing.
- `test_predict_each_model`: Tests each classifier (`random_forest`, `decision_tree`, `logistic_regression`, `svm`).
- `test_predict_invalid_*`: Rejects invalid age (< 18), non-positive credit amounts, non-positive durations, or unsupported categories with HTTP 422.
- `test_real_artifact_inference_when_present`: Performs actual inference on `credit_risk_bundle.joblib` verifying Colab sample classification.

---

## 7. Connecting the Frontend to the Backend

1. In the React web application, navigate to **Settings** (`/settings`).
2. Verify or set the **Backend API URL**:
   ```text
   http://localhost:8000/api
   ```
3. Click **Test Connection**.
   - If the FastAPI server is running with the bundle loaded, a toast will confirm:
     `Backend Connected (Live ML Mode)`.
   - The status indicator in the top navbar and cards transitions to **Live ML Assessment**.
4. Navigate to **Credit Risk Prediction** (`/prediction`) and click **Analyze Credit Profile**. The request is routed to `POST /api/predict`.

---

## 8. Critical Academic & Statistical Limitations

1. **Target Definition via Median Partition**:
   In the original Google Colab notebook, the target was generated as:
   $$\text{Risk} = \mathbb{I}(\text{Credit Amount} > \text{Median Credit Amount})$$
2. **Direct Target Leakage**:
   Because `Credit amount` was retained as an input feature in $X$, tree-based classifiers (Decision Tree and Random Forest) achieved an artificial 100% test accuracy simply by splitting on the median value.
3. **No Real-World Default Guarantee**:
   Class 1 does **not** signify a verified delinquent borrower, and Class 0 does **not** guarantee creditworthiness. In real commercial banking, credit default targets must be derived from 90+ DPD repayment histories or charge-offs.
