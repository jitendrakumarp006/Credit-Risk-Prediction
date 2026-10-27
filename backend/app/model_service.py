"""Model management service handling artifact loading and scikit-learn inference."""

import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import joblib
from sklearn.preprocessing import StandardScaler, LabelEncoder
from .schemas import (
    ApplicantInput,
    PredictionResponse,
    ModelInfo,
    ModelsResponse,
    MetadataResponse
)
from .preprocessing import (
    FEATURE_COLUMNS,
    CATEGORICAL_COLUMNS,
    encode_features,
    scale_features
)


REQUIRED_MODEL_KEYS = {
    "logistic_regression",
    "decision_tree",
    "random_forest",
    "svm"
}

REQUIRED_BUNDLE_KEYS = {
    "models",
    "scaler",
    "encoders",
    "feature_columns",
    "categorical_columns"
}

MODEL_METADATA: Dict[str, Dict[str, str]] = {
    "random_forest": {
        "id": "random_forest",
        "name": "Random Forest Classifier",
        "notebook_accuracy": "100%",
        "description": "Ensemble of 100 decision trees (reported 100% test accuracy in notebook due to target leakage)."
    },
    "decision_tree": {
        "id": "decision_tree",
        "name": "Decision Tree Classifier",
        "notebook_accuracy": "100%",
        "description": "Single CART decision tree with Gini impurity splitting (reported 100% test accuracy in notebook)."
    },
    "logistic_regression": {
        "id": "logistic_regression",
        "name": "Logistic Regression",
        "notebook_accuracy": "98%",
        "description": "L2-regularized logistic regression optimizing log-odds decision boundary (reported 98% test accuracy in notebook)."
    },
    "svm": {
        "id": "svm",
        "name": "Support Vector Machine (SVM)",
        "notebook_accuracy": "94%",
        "description": "Support Vector Classifier with RBF kernel on scaled inputs (reported 94% test accuracy in notebook)."
    }
}


class ModelArtifactError(Exception):
    """Raised when the artifact is missing, corrupt, or invalid."""
    pass


class ModelService:
    """Manages ML model lifecycle, bundle verification, and inference."""
    
    def __init__(self):
        self.bundle: Optional[Dict[str, Any]] = None
        self.models: Dict[str, Any] = {}
        self.scaler: Optional[StandardScaler] = None
        self.encoders: Dict[str, LabelEncoder] = {}
        self.feature_columns: List[str] = []
        self.categorical_columns: List[str] = []
        self.median_amount: Optional[float] = None
        self.target_definition: str = "Credit amount > dataset median ($2,320)"
        self.artifact_path: Optional[Path] = None
        self.artifact_loaded: bool = False
        self.load_error: Optional[str] = None

    def normalize_model_key(self, model_identifier: str) -> str:
        """Map user input string to canonical model key."""
        clean = model_identifier.lower().replace(" ", "_").replace("-", "_").strip()
        if clean in REQUIRED_MODEL_KEYS:
            return clean
        if "random" in clean or "forest" in clean:
            return "random_forest"
        if "tree" in clean or "decision" in clean:
            return "decision_tree"
        if "logistic" in clean or "regression" in clean:
            return "logistic_regression"
        if "svm" in clean or "support" in clean:
            return "svm"
        raise ValueError(
            f"Unknown model identifier '{model_identifier}'. Supported IDs: {sorted(list(REQUIRED_MODEL_KEYS))}"
        )

    def load_artifact(self, file_path: Path) -> bool:
        """
        Loads and strictly validates the credit_risk_bundle.joblib file.
        Does NOT automatically train on missing artifact.
        """
        self.artifact_path = file_path
        self.artifact_loaded = False
        self.load_error = None
        
        if not file_path.exists():
            self.load_error = f"Model artifact not found at {file_path}. Place credit_risk_bundle.joblib in models/."
            return False

        try:
            bundle = joblib.load(file_path)
            if not isinstance(bundle, dict):
                raise ModelArtifactError("Loaded artifact is not a valid Python dictionary bundle.")

            # Validate required bundle keys
            missing_keys = REQUIRED_BUNDLE_KEYS - set(bundle.keys())
            if missing_keys:
                raise ModelArtifactError(f"Bundle is missing required top-level keys: {sorted(list(missing_keys))}")

            # Validate models dictionary
            models_dict = bundle.get("models", {})
            if not isinstance(models_dict, dict):
                raise ModelArtifactError("'models' entry in bundle must be a dictionary.")
            
            missing_models = REQUIRED_MODEL_KEYS - set(models_dict.keys())
            if missing_models:
                raise ModelArtifactError(f"Bundle 'models' is missing classifiers: {sorted(list(missing_models))}")

            # Validate scaler
            scaler = bundle.get("scaler")
            if not hasattr(scaler, "transform") or not hasattr(scaler, "n_features_in_"):
                raise ModelArtifactError("Bundle 'scaler' is missing valid fitted scaler with transform() method.")
            if scaler.n_features_in_ != len(FEATURE_COLUMNS):
                raise ModelArtifactError(
                    f"Scaler expects {scaler.n_features_in_} features, but pipeline requires {len(FEATURE_COLUMNS)}."
                )

            # Validate encoders
            encoders = bundle.get("encoders", {})
            for cat_col in CATEGORICAL_COLUMNS:
                if cat_col not in encoders:
                    raise ModelArtifactError(f"Bundle 'encoders' is missing encoder for column '{cat_col}'.")
                if not hasattr(encoders[cat_col], "transform") or not hasattr(encoders[cat_col], "classes_"):
                    raise ModelArtifactError(f"Encoder for column '{cat_col}' is not a valid fitted LabelEncoder.")

            # Validate feature column order
            feat_cols = bundle.get("feature_columns", [])
            if feat_cols != FEATURE_COLUMNS:
                raise ModelArtifactError(
                    f"Bundle feature_columns mismatch. Expected {FEATURE_COLUMNS}, got {feat_cols}."
                )

            # Store validated components
            self.bundle = bundle
            self.models = models_dict
            self.scaler = scaler
            self.encoders = encoders
            self.feature_columns = feat_cols
            self.categorical_columns = bundle.get("categorical_columns", CATEGORICAL_COLUMNS)
            self.median_amount = bundle.get("median_amount", 2319.5)
            self.target_definition = bundle.get(
                "target_definition",
                f"Credit amount > dataset median (${self.median_amount:,.2f})"
            )
            self.artifact_loaded = True
            return True

        except Exception as e:
            self.load_error = f"Error validating artifact: {str(e)}"
            self.artifact_loaded = False
            return False

    def get_available_models(self) -> List[ModelInfo]:
        """Returns list of ModelInfo objects for available models."""
        return [
            ModelInfo(
                id=m_id,
                name=meta["name"],
                notebook_accuracy=meta["notebook_accuracy"],
                description=meta["description"]
            )
            for m_id, meta in MODEL_METADATA.items()
        ]

    def predict(self, applicant: ApplicantInput, requested_model: str = "random_forest") -> PredictionResponse:
        """
        Executes scikit-learn model inference using the loaded artifact.
        Rejects inference if artifact is not loaded.
        """
        if not self.artifact_loaded:
            raise ModelArtifactError(
                self.load_error or "Model artifact is not loaded. Ensure credit_risk_bundle.joblib is present."
            )

        model_key = self.normalize_model_key(requested_model)
        model = self.models.get(model_key)
        if model is None:
            raise ValueError(f"Selected model '{model_key}' is not available in loaded artifact.")

        # 1. Encode categorical features using saved LabelEncoders
        raw_vector, encoded_map = encode_features(applicant, self.encoders, self.feature_columns)

        # 2. Scale features using fitted StandardScaler
        scaled_vector = scale_features(raw_vector, self.scaler)

        # 3. Model inference (discrete class prediction)
        prediction_val = int(model.predict(scaled_vector)[0])
        predicted_label = "High Risk (Above Median)" if prediction_val == 1 else "Low Risk (At or Below Median)"

        # 4. Check for model probabilities (if predict_proba is supported)
        probabilities = None
        if hasattr(model, "predict_proba"):
            try:
                proba = model.predict_proba(scaled_vector)[0]
                probabilities = {
                    "class_0_score": round(float(proba[0]), 4),
                    "class_1_score": round(float(proba[1]), 4),
                    "semantic_meaning": (
                        "Statistical model score for the experimental median-threshold class "
                        "(0 = below/at median, 1 = above median). Not a calibrated real-world default probability."
                    )
                }
            except Exception:
                probabilities = None

        meta = MODEL_METADATA.get(model_key, {
            "name": model_key.replace("_", " ").title(),
            "notebook_accuracy": "N/A"
        })

        timestamp = datetime.now(timezone.utc).isoformat()
        credit_amt = float(applicant.credit_amount)
        median_ref = self.median_amount if self.median_amount else 2319.5

        explanation = (
            f"Classified as High Risk (Class 1) because the requested loan amount (${credit_amt:,.2f}) "
            f"exceeds the experimental German Credit median threshold of ${median_ref:,.2f}. "
            f"In the student Colab notebook, all credits > median were labeled as Risk=1."
            if prediction_val == 1
            else
            f"Classified as Low Risk (Class 0) because the requested loan amount (${credit_amt:,.2f}) "
            f"is below or equal to the experimental German Credit median threshold of ${median_ref:,.2f}. "
            f"In the student Colab notebook, all credits <= median were labeled as Risk=0."
        )

        return PredictionResponse(
            prediction=prediction_val,
            predicted_label=predicted_label,
            model_name=meta["name"],
            model_id=model_key,
            model_version="v1.0-scikit-learn-colab-bundle",
            prediction_timestamp=timestamp,
            target_definition=self.target_definition,
            target_limitations=[
                "Experimental Academic Definition: Target was created as (Credit amount > dataset median).",
                "Target Leakage Warning: Because Credit amount is both an input feature and the direct generator of the target label, decision trees achieve an artificial 100% test accuracy.",
                "Not A Real Default Probability: This classifier was trained on loan amount partitions, not on 90+ days past due payment default outcomes.",
                "No Fabricated Risk Scores: Uncalibrated class probabilities are not presented as banking underwriting default odds."
            ],
            input_summary={
                "applicant": applicant.model_dump(by_alias=False),
                "encoded_features": encoded_map,
                "feature_order": self.feature_columns
            },
            mode="live",
            probabilities=probabilities,
            explanation=explanation
        )

    def get_metadata(self) -> MetadataResponse:
        """Returns metadata for the dataset and pipeline."""
        return MetadataResponse(
            ordered_features=FEATURE_COLUMNS,
            categorical_features=CATEGORICAL_COLUMNS,
            available_models=list(MODEL_METADATA.keys()),
            target_definition=self.target_definition,
            training_limitations=[
                "Colab notebook created target: Risk = (Credit amount > median).astype(int)",
                "Credit amount remains an input feature in X_train and X_test, inducing direct target leakage.",
                "Reported test accuracies: Logistic Regression 98%, Decision Tree 100%, Random Forest 100%, SVM 94%."
            ],
            dataset_median_amount=self.median_amount
        )


model_service = ModelService()
