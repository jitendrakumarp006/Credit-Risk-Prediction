"""Application configuration loaded from environment variables."""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load .env if present
load_dotenv(BACKEND_DIR / ".env")

class Settings:
    """Application settings with defaults matching local development."""
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS: Allow local Vite dev server
    ALLOWED_ORIGINS_RAW: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    )
    
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        origins = [origin.strip() for origin in self.ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]
        # Security hardening: Disallow wildcard '*' origin in production
        filtered = [o for o in origins if o != "*"]
        return filtered if filtered else ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # Model Artifact Path
    MODEL_BUNDLE_PATH_ENV: str = os.getenv(
        "MODEL_BUNDLE_PATH",
        "models/credit_risk_bundle.joblib"
    )
    
    @property
    def MODEL_BUNDLE_PATH(self) -> Path:
        path = Path(self.MODEL_BUNDLE_PATH_ENV)
        if not path.is_absolute():
            path = BACKEND_DIR / path
        return path

settings = Settings()
