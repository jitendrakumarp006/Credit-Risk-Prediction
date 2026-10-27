"""Pytest fixtures for FastAPI client and isolated test artifacts."""

import pytest
import numpy as np
from pathlib import Path
from fastapi.testclient import TestClient
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC

from app.main import app
from app.model_service import model_service
from app.preprocessing import FEATURE_COLUMNS, CATEGORICAL_COLUMNS


@pytest.fixture(scope="session")
def valid_applicant_payload():
    """Valid applicant payload matching the Colab sample."""
    return {
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


@pytest.fixture(scope="session")
def mock_trained_bundle():
    """
    Creates an isolated in-memory model bundle fixture for deterministic testing,
    without requiring external files or network access.
    """
    # 1. Encoders
    encoders = {}
    categories_data = {
        "Sex": ["female", "male"],
        "Housing": ["free", "own", "rent"],
        "Saving accounts": ["little", "moderate", "quite rich", "rich", "unknown"],
        "Checking account": ["little", "moderate", "rich", "unknown"],
        "Purpose": [
            "business", "car", "domestic appliances", "education",
            "furniture/equipment", "radio/TV", "repairs", "vacation/others"
        ]
    }
    for col, classes in categories_data.items():
        le = LabelEncoder()
        le.fit(classes)
        encoders[col] = le

    # 2. Scaler
    scaler = StandardScaler()
    # Fit on synthetic (10, 9) sample
    synthetic_X = np.random.RandomState(42).randn(20, 9)
    # Ensure positive credit amounts on feature column 6
    synthetic_X[:, 6] = np.abs(synthetic_X[:, 6]) * 2000 + 500
    synthetic_y = (synthetic_X[:, 6] > 2320).astype(int)
    scaler.fit(synthetic_X)

    scaled_X = scaler.transform(synthetic_X)

    # 3. Four models
    lr = LogisticRegression(random_state=42)
    lr.fit(scaled_X, synthetic_y)

    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(scaled_X, synthetic_y)

    rf = RandomForestClassifier(n_estimators=10, random_state=42)
    rf.fit(scaled_X, synthetic_y)

    svm = SVC(kernel="rbf", probability=True, random_state=42)
    svm.fit(scaled_X, synthetic_y)

    return {
        "models": {
            "logistic_regression": lr,
            "decision_tree": dt,
            "random_forest": rf,
            "svm": svm
        },
        "scaler": scaler,
        "encoders": encoders,
        "feature_columns": FEATURE_COLUMNS,
        "categorical_columns": CATEGORICAL_COLUMNS,
        "median_amount": 2319.5,
        "target_definition": "Credit amount > dataset median ($2,319.50)",
        "version": "test-fixture-1.0.0"
    }


@pytest.fixture
def test_client():
    """FastAPI TestClient instance."""
    with TestClient(app) as client:
        yield client
