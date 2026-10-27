"""Tests for system health, model listing, and pipeline metadata endpoints."""

import pytest
from app.model_service import model_service


def test_health_when_artifact_missing(test_client):
    """Health endpoint must report unavailable if artifact is not loaded."""
    # Temporarily force unloaded state
    original_loaded = model_service.artifact_loaded
    model_service.artifact_loaded = False
    model_service.load_error = "Test simulated missing artifact"

    try:
        response = test_client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unavailable"
        assert data["artifact_loaded"] is False
        assert data["mode"] == "unavailable"
        assert "Test simulated missing artifact" in data["message"]
    finally:
        model_service.artifact_loaded = original_loaded


def test_health_when_artifact_loaded(test_client, mock_trained_bundle):
    """Health endpoint reports 'live' and 'ok' when bundle is loaded."""
    original_loaded = model_service.artifact_loaded
    original_models = model_service.models

    # Simulate loaded state with mock bundle
    model_service.artifact_loaded = True
    model_service.models = mock_trained_bundle["models"]

    try:
        response = test_client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["artifact_loaded"] is True
        assert data["mode"] == "live"
        assert set(data["available_models"]) == {"logistic_regression", "decision_tree", "random_forest", "svm"}
    finally:
        model_service.artifact_loaded = original_loaded
        model_service.models = original_models


def test_get_models_endpoint(test_client):
    """GET /api/models returns 4 documented models with accuracy labels."""
    response = test_client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    models = data["models"]
    assert len(models) == 4
    model_ids = {m["id"] for m in models}
    assert model_ids == {"logistic_regression", "decision_tree", "random_forest", "svm"}
    for m in models:
        assert "name" in m
        assert "notebook_accuracy" in m
        assert "description" in m


def test_get_metadata_endpoint(test_client):
    """GET /api/metadata returns ordered feature names and target definition."""
    response = test_client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["ordered_features"] == [
        "Age", "Sex", "Job", "Housing", "Saving accounts",
        "Checking account", "Credit amount", "Duration", "Purpose"
    ]
    assert data["categorical_features"] == [
        "Sex", "Housing", "Saving accounts", "Checking account", "Purpose"
    ]
    assert "target_definition" in data
    assert len(data["training_limitations"]) > 0
