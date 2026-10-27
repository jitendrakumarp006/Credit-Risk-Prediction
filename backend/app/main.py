"""FastAPI main application with lifespan management, CORS, and prediction endpoints."""

import logging
from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from .config import settings
from .schemas import (
    PredictRequest,
    PredictionResponse,
    HealthResponse,
    ModelsResponse,
    MetadataResponse,
    ErrorResponse
)
from .model_service import model_service, ModelArtifactError

# Configure structured logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("credit_risk_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler. Loads the trusted model bundle once during startup.
    Does NOT train a new model if the artifact is missing.
    """
    logger.info("Starting CreditRisk.AI ML Backend Service...")
    logger.info("Looking for model bundle at: %s", settings.MODEL_BUNDLE_PATH)
    
    loaded = model_service.load_artifact(settings.MODEL_BUNDLE_PATH)
    if loaded:
        logger.info(
            "Model artifact successfully verified and loaded! Available models: %s",
            list(model_service.models.keys())
        )
    else:
        logger.warning(
            "Model artifact could not be loaded on startup: %s. Service will operate in unavailable/degraded mode.",
            model_service.load_error
        )
    
    yield
    logger.info("Shutting down CreditRisk.AI ML Backend Service.")


app = FastAPI(
    title="CreditRisk.AI Machine Learning API",
    description=(
        "Production-ready FastAPI service serving German Credit Risk Scikit-Learn models "
        "(Logistic Regression, Decision Tree, Random Forest, SVM) trained on the Colab pipeline."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration restricted to configured origins (e.g. Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# Standardized error handlers avoiding stack trace exposure
@app.exception_handler(ModelArtifactError)
async def model_artifact_exception_handler(request: Request, exc: ModelArtifactError):
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": str(exc), "error_type": "ModelArtifactUnavailable"}
    )


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc), "error_type": "ValidationError"}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append(f"{loc}: {err.get('msg', 'Invalid value')}")
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(errors), "error_type": "RequestValidationError"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled internal server exception: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred while processing the prediction request.",
            "error_type": "InternalServerError"
        }
    )


@app.get(f"{settings.API_PREFIX}/health", response_model=HealthResponse, tags=["System"])
def get_health() -> HealthResponse:
    """
    Health check endpoint reporting artifact readiness and live status.
    Only reports live mode if the trusted model artifact is loaded and verified.
    """
    if model_service.artifact_loaded:
        return HealthResponse(
            status="ok",
            artifact_loaded=True,
            available_models=list(model_service.models.keys()),
            mode="live",
            message="Model bundle loaded and verified. Ready for live inference."
        )
    return HealthResponse(
        status="unavailable",
        artifact_loaded=False,
        available_models=[],
        mode="unavailable",
        message=model_service.load_error or "Model artifact not loaded. Check server configuration."
    )


@app.get(f"{settings.API_PREFIX}/models", response_model=ModelsResponse, tags=["Models"])
def get_models() -> ModelsResponse:
    """Returns metadata for all supported classifiers."""
    return ModelsResponse(models=model_service.get_available_models())


@app.get(f"{settings.API_PREFIX}/metadata", response_model=MetadataResponse, tags=["Dataset"])
def get_metadata() -> MetadataResponse:
    """Returns dataset features, categories, and target definitions."""
    return model_service.get_metadata()


@app.post(
    f"{settings.API_PREFIX}/predict",
    response_model=PredictionResponse,
    responses={
        422: {"model": ErrorResponse, "description": "Validation or unsupported category error"},
        503: {"model": ErrorResponse, "description": "Model artifact missing or unavailable"},
    },
    tags=["Prediction"]
)
def predict_credit_risk(request: PredictRequest) -> PredictionResponse:
    """
    Predicts credit risk class for applicant data using the requested scikit-learn model.
    Applies exact Colab preprocessing (LabelEncoder + StandardScaler) before inference.
    """
    if not model_service.artifact_loaded:
        raise ModelArtifactError(
            model_service.load_error or "Model artifact is not loaded. Ensure credit_risk_bundle.joblib is present."
        )

    applicant = request.applicant
    model_name = request.model_name or "random_forest"
    
    return model_service.predict(applicant, requested_model=model_name)
