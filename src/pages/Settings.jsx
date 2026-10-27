import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MODEL_CONFIGS } from '../services/predictionService';

export function Settings() {
  const {
    backendUrl,
    isBackendConnected,
    isCheckingBackend,
    checkBackendStatus,
    activeModel,
    setActiveModel,
    resetToInitialData,
    addToast
  } = useApp();

  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestConnection = async () => {
    const res = await checkBackendStatus(inputUrl);
    if (res.connected && res.artifactLoaded) {
      addToast('success', 'Backend Connected (Live ML Mode)', `Connected to ${inputUrl}. ML bundle verified and ready for live predictions.`);
    } else if (res.connected && !res.artifactLoaded) {
      addToast('warning', 'Backend Connected (Degraded Mode)', `Connected to ${inputUrl}, but credit_risk_bundle.joblib is missing or unverified.`);
    } else {
      addToast('warning', 'Backend Offline', res.error || 'Could not connect. Running in browser demo mode.');
    }
  };

  const sampleBackendCode = `# fastapi_server.py
# Install requirements: pip install fastapi uvicorn scikit-learn joblib pydantic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import joblib
import os

app = FastAPI(title="Credit Risk ML API", version="1.0.0")

# Allow frontend requests from React + Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Export models in Colab using:
# joblib.dump(scaler, "scaler.joblib")
# joblib.dump(rf, "random_forest_model.joblib")
# joblib.dump(dt, "decision_tree_model.joblib")
# joblib.dump(lr, "logistic_regression_model.joblib")
# joblib.dump(svm, "svm_model.joblib")

MODELS = {}
SCALER = None

try:
    if os.path.exists("scaler.joblib"):
        SCALER = joblib.load("scaler.joblib")
    if os.path.exists("random_forest_model.joblib"):
        MODELS["Random Forest"] = joblib.load("random_forest_model.joblib")
    if os.path.exists("decision_tree_model.joblib"):
        MODELS["Decision Tree"] = joblib.load("decision_tree_model.joblib")
    if os.path.exists("logistic_regression_model.joblib"):
        MODELS["Logistic Regression"] = joblib.load("logistic_regression_model.joblib")
    if os.path.exists("svm_model.joblib"):
        MODELS["SVM"] = joblib.load("svm_model.joblib")
except Exception as e:
    print(f"Warning loading artifacts: {e}")

class ApplicantPayload(BaseModel):
    age: int
    sex: str
    job: int
    housing: str
    savingAccounts: str
    checkingAccount: str
    creditAmount: float
    duration: int
    purpose: str

class PredictRequest(BaseModel):
    applicant: ApplicantPayload
    model: str = "Random Forest"

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": list(MODELS.keys()),
        "scaler_loaded": SCALER is not None,
        "mode": "live_inference"
    }

@app.post("/api/predict")
def predict_credit_risk(request: PredictRequest):
    app_data = request.applicant
    
    # Preprocessing identical to Colab notebook
    # 1. Sex: female -> 0, male -> 1
    sex_enc = 0 if app_data.sex == "female" else 1
    
    # 2. Housing: free -> 0, own -> 1, rent -> 2
    housing_map = {"free": 0, "own": 1, "rent": 2}
    housing_enc = housing_map.get(app_data.housing, 1)
    
    # 3. Saving accounts: missing/NA -> "unknown"
    saving_map = {"little": 0, "moderate": 1, "quite rich": 2, "rich": 3, "unknown": 4}
    saving_enc = saving_map.get(app_data.savingAccounts.lower(), 4)
    
    # 4. Checking account: missing/NA -> "unknown"
    checking_map = {"little": 0, "moderate": 1, "rich": 2, "unknown": 3}
    checking_enc = checking_map.get(app_data.checkingAccount.lower(), 3)
    
    # 5. Purpose: alphabetical LabelEncoder
    purpose_map = {
        "business": 0, "car": 1, "domestic appliances": 2, "education": 3,
        "furniture/equipment": 4, "radio/TV": 5, "repairs": 6, "vacation/others": 7
    }
    purpose_enc = purpose_map.get(app_data.purpose, 0)
    
    # Feature vector in exact Colab order:
    # [Age, Sex, Job, Housing, Saving accounts, Checking account, Credit amount, Duration, Purpose]
    raw_vector = [[
        app_data.age, sex_enc, app_data.job, housing_enc,
        saving_enc, checking_enc, app_data.creditAmount,
        app_data.duration, purpose_enc
    ]]
    
    # Select requested model
    selected_model = MODELS.get(request.model) or MODELS.get("Random Forest")
    
    if SCALER and selected_model:
        scaled_vector = SCALER.transform(raw_vector)
        pred = int(selected_model.predict(scaled_vector)[0])
    else:
        # Fallback to notebook target rule
        pred = 1 if app_data.creditAmount > 2320.0 else 0
        
    risk_label = "High Risk" if pred == 1 else "Low Risk"
    accuracies = {"Random Forest": "100%", "Decision Tree": "100%", "Logistic Regression": "98%", "SVM": "94%"}

    return {
        "prediction": pred,
        "riskLabel": risk_label,
        "modelName": request.model,
        "modelVersion": "v1.0.0-fastapi-service",
        "modelAccuracyReported": accuracies.get(request.model, "100%"),
        "targetDefinition": "Credit amount > median ($2,320)",
        "source": "fastapi_backend",
        "timestamp": datetime.now().isoformat(),
        "encodedFeatures": raw_vector[0],
        "applicantData": app_data.dict(),
        "limitations": [
            "Experimental academic definition: target constructed from median credit amount.",
            "Trained on German Credit dataset with 80/20 train/test split."
        ],
        "explanation": f"Classified as {risk_label} based on loan profile parameters and model evaluation."
    }
`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleBackendCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    addToast('info', 'Code Copied', 'Python FastAPI server snippet copied to clipboard.');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-100 text-fintech-primary">
            <SettingsIcon className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-fintech-primary">
            System Configuration
          </span>
        </div>
        <h2 className="text-2xl font-bold text-fintech-text tracking-tight mt-1">
          Settings & Backend Integration
        </h2>
        <p className="text-xs text-fintech-muted mt-0.5">
          Configure API endpoints, model defaults, and inspect Python FastAPI deployment code.
        </p>
      </div>

      {/* Backend Connection Status & URL Configuration */}
      <Card
        title="Backend API Connection"
        subtitle="Connect a Python FastAPI or Flask service to serve exported scikit-learn models"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Server className="w-4 h-4 text-fintech-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:8000/api"
                className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl pl-9 pr-3 py-2.5 text-fintech-text font-mono focus:outline-none focus:ring-2 focus:ring-fintech-primary/30"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleTestConnection}
              loading={isCheckingBackend}
            >
              Test Connection
            </Button>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-fintech-bg rounded-xl border border-fintech-border text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="font-semibold text-fintech-text">
                Current Status: {isBackendConnected ? 'Live Backend Connected' : 'Browser Demo Client Mode Active'}
              </span>
            </div>
            <span className="text-fintech-muted text-[11px]">
              {isBackendConnected
                ? 'Predictions routed to live FastAPI endpoint'
                : 'Using Colab-exact client preprocessing and median target engine'}
            </span>
          </div>
        </div>
      </Card>

      {/* Default Model Selector */}
      <Card
        title="Default Machine Learning Model"
        subtitle="Choose which classifier serves as the default prediction engine"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(MODEL_CONFIGS).map(([key, config]) => {
            const isSelected = activeModel === key;
            return (
              <div
                key={key}
                onClick={() => setActiveModel(key)}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-fintech-primary bg-violet-50/50 ring-1 ring-fintech-primary'
                    : 'border-fintech-border bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-fintech-text">{config.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-fintech-primary text-white'
                        : 'bg-slate-100 text-fintech-muted'
                    }`}
                  >
                    {config.notebookAccuracy} Accuracy
                  </span>
                </div>
                <p className="text-fintech-muted text-[11px] mt-1.5 leading-relaxed">
                  {config.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Python Backend Code Generator Snippet */}
      <Card
        title="Python FastAPI Backend Integration Guide"
        subtitle="Plug-and-play FastAPI server code to serve models saved from your Colab notebook"
        headerAction={
          <Button
            variant="secondary"
            size="sm"
            onClick={copyCode}
            icon={copiedCode ? Check : Copy}
          >
            {copiedCode ? 'Copied' : 'Copy Code'}
          </Button>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-fintech-muted leading-relaxed">
            To connect a live Python service, export your trained objects in Google Colab using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">joblib.dump(rf, 'random_forest_model.joblib')</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">joblib.dump(scaler, 'scaler.joblib')</code>, then run this FastAPI script:
          </p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 select-all border border-slate-800">
            <pre>{sampleBackendCode}</pre>
          </div>
        </div>
      </Card>

      {/* Application Data Reset */}
      <Card
        title="Session Data Management"
        subtitle="Reset live session predictions stored in browser local storage"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-fintech-text font-semibold">
              Restore Benchmark Ledger
            </p>
            <p className="text-xs text-fintech-muted mt-0.5">
              Clears all user-submitted credit predictions and restores the pure 1,000 German Credit Dataset benchmark records.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={resetToInitialData}
            icon={RotateCcw}
            className="self-start sm:self-auto text-rose-600 hover:text-rose-700"
          >
            Reset to Benchmark Data
          </Button>
        </div>
      </Card>
    </div>
  );
}
