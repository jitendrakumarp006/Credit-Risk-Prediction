"""Tests for inference endpoint, validation rules, model switching, and error handling."""

import pytest
from app.model_service import model_service


def apply_mock_bundle(mock_bundle):
    """Helper to populate model_service with mock bundle."""
    model_service.bundle = mock_bundle
    model_service.models = mock_bundle["models"]
    model_service.scaler = mock_bundle["scaler"]
    model_service.encoders = mock_bundle["encoders"]
    model_service.feature_columns = mock_bundle["feature_columns"]
    model_service.categorical_columns = mock_bundle["categorical_columns"]
    model_service.median_amount = mock_bundle["median_amount"]
    model_service.target_definition = mock_bundle["target_definition"]
    model_service.artifact_loaded = True
    model_service.load_error = None


def test_predict_rejected_when_artifact_unloaded(test_client, valid_applicant_payload):
    """POST /api/predict must return 503 Service Unavailable if artifact is missing."""
    original_loaded = model_service.artifact_loaded
    model_service.artifact_loaded = False
    model_service.load_error = "Model artifact not found"

    try:
        response = test_client.post("/api/predict", json=valid_applicant_payload)
        assert response.status_code == 503
        data = response.json()
        assert "detail" in data
        assert data["error_type"] == "ModelArtifactUnavailable"
    finally:
        model_service.artifact_loaded = original_loaded


@pytest.mark.parametrize("model_id", ["random_forest", "decision_tree", "logistic_regression", "svm"])
def test_predict_each_model(test_client, mock_trained_bundle, valid_applicant_payload, model_id):
    """POST /api/predict succeeds for all four documented models."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {**valid_applicant_payload, "model": model_id}
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["prediction"] in (0, 1)
    assert data["model_id"] == model_id
    assert data["mode"] == "live"
    assert "target_definition" in data
    assert len(data["target_limitations"]) > 0
    assert "explanation" in data
    assert "prediction_timestamp" in data
    assert data["input_summary"]["applicant"]["age"] == 35


def test_predict_flat_payload_support(test_client, mock_trained_bundle):
    """POST /api/predict supports flat request format."""
    apply_mock_bundle(mock_trained_bundle)

    flat_payload = {
        "age": 42,
        "sex": "female",
        "job": 2,
        "housing": "own",
        "savingAccounts": "rich",
        "checkingAccount": "moderate",
        "creditAmount": 1800.0,
        "duration": 12,
        "purpose": "car",
        "model": "logistic_regression"
    }

    response = test_client.post("/api/predict", json=flat_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in (0, 1)
    assert data["model_id"] == "logistic_regression"


def test_predict_invalid_age(test_client, mock_trained_bundle, valid_applicant_payload):
    """Underage applicant (< 18) must be rejected with 422."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        "applicant": {
            **valid_applicant_payload["applicant"],
            "age": 14
        }
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert "age" in response.text.lower()


def test_predict_invalid_credit_amount(test_client, mock_trained_bundle, valid_applicant_payload):
    """Negative or zero credit amount must be rejected with 422."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        "applicant": {
            **valid_applicant_payload["applicant"],
            "creditAmount": -500
        }
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert "credit" in response.text.lower()


def test_predict_invalid_duration(test_client, mock_trained_bundle, valid_applicant_payload):
    """Non-positive duration must be rejected with 422."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        "applicant": {
            **valid_applicant_payload["applicant"],
            "duration": 0
        }
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert "duration" in response.text.lower()


def test_predict_invalid_housing_category(test_client, mock_trained_bundle, valid_applicant_payload):
    """Unsupported category must return 422 with a helpful error."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        "applicant": {
            **valid_applicant_payload["applicant"],
            "housing": "spaceship"
        }
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert "housing" in response.text.lower()


def test_predict_invalid_purpose_category(test_client, mock_trained_bundle, valid_applicant_payload):
    """Unsupported loan purpose must return 422."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        "applicant": {
            **valid_applicant_payload["applicant"],
            "purpose": "crypto_trading"
        }
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    assert "purpose" in response.text.lower()


def test_artifact_validation_rejects_missing_keys(tmp_path):
    """Bundle missing required keys must fail validation."""
    import joblib
    corrupt_file = tmp_path / "corrupt_bundle.joblib"
    joblib.dump({"incomplete_key": 123}, corrupt_file)

    loaded = model_service.load_artifact(corrupt_file)
    assert loaded is False
    assert "missing required" in model_service.load_error.lower()


def test_real_artifact_inference_when_present(test_client):
    """
    If backend/models/credit_risk_bundle.joblib exists, test real artifact inference.
    Verifies that the Colab sample yields Class 1 (High Risk / Above Median)
    and an amount < 2320 yields Class 0 (Low Risk / Below Median).
    """
    from app.config import settings
    if not settings.MODEL_BUNDLE_PATH.exists():
        pytest.skip("Real artifact not present, skipping real inference test.")

    loaded = model_service.load_artifact(settings.MODEL_BUNDLE_PATH)
    assert loaded is True
    assert model_service.artifact_loaded is True

    # 1. Colab high-risk sample ($5,000 > $2,320)
    colab_payload = {
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
    resp1 = test_client.post("/api/predict", json=colab_payload)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["prediction"] == 1
    assert "High Risk" in data1["predicted_label"]
    assert data1["mode"] == "live"

    # 2. Low-risk sample ($1,500 <= $2,320)
    low_risk_payload = {
        "applicant": {
            "age": 45,
            "sex": "female",
            "job": 2,
            "housing": "own",
            "savingAccounts": "rich",
            "checkingAccount": "moderate",
            "creditAmount": 1500.0,
            "duration": 12,
            "purpose": "radio/TV"
        },
        "model": "random_forest"
    }
    resp2 = test_client.post("/api/predict", json=low_risk_payload)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["prediction"] == 0
    assert "Low Risk" in data2["predicted_label"]
    assert data2["mode"] == "live"


def test_predict_unknown_model_id(test_client, mock_trained_bundle, valid_applicant_payload):
    """Unsupported model identifier returns 422 with a helpful error message."""
    apply_mock_bundle(mock_trained_bundle)

    payload = {
        **valid_applicant_payload,
        "model": "quantum_neural_network"
    }
    response = test_client.post("/api/predict", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "Unknown model identifier" in data["detail"]
    assert data["error_type"] == "ValidationError"


def test_backend_recovery_after_reloading_artifact(test_client, mock_trained_bundle, valid_applicant_payload):
    """Service gracefully recovers when artifact transitions from missing to restored."""
    # 1. Simulate failure when unloaded
    model_service.artifact_loaded = False
    model_service.load_error = "Transient filesystem lock"
    fail_resp = test_client.post("/api/predict", json=valid_applicant_payload)
    assert fail_resp.status_code == 503
    assert fail_resp.json()["error_type"] == "ModelArtifactUnavailable"

    # 2. Simulate successful recovery / reload
    apply_mock_bundle(mock_trained_bundle)
    success_resp = test_client.post("/api/predict", json=valid_applicant_payload)
    assert success_resp.status_code == 200
    assert success_resp.json()["mode"] == "live"


