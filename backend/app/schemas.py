"""Pydantic schemas for request validation and response models."""

from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict


VALID_SEX = {"female", "male"}
VALID_HOUSING = {"own", "rent", "free"}
VALID_SAVING_ACCOUNTS = {"little", "moderate", "quite rich", "rich", "unknown"}
VALID_CHECKING_ACCOUNT = {"little", "moderate", "rich", "unknown"}
VALID_PURPOSES = {
    "business",
    "car",
    "domestic appliances",
    "education",
    "furniture/equipment",
    "radio/tv",
    "radio/tv",
    "repairs",
    "vacation/others"
}

VALID_MODEL_IDS = {
    "logistic_regression",
    "decision_tree",
    "random_forest",
    "svm"
}


class ApplicantInput(BaseModel):
    """Raw applicant features matching the German Credit Dataset."""
    
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)
    
    age: int = Field(..., ge=18, le=120, description="Applicant age in years (18-120)")
    sex: str = Field(..., description="Sex: female or male")
    job: int = Field(..., ge=0, le=3, description="Job category code (0: unskilled non-res, 1: unskilled res, 2: skilled, 3: highly skilled)")
    housing: str = Field(..., description="Housing tenure: own, rent, or free")
    saving_accounts: str = Field(
        default="unknown",
        alias="savingAccounts",
        description="Savings balance: little, moderate, quite rich, rich, or unknown"
    )
    checking_account: str = Field(
        default="unknown",
        alias="checkingAccount",
        description="Checking balance: little, moderate, rich, or unknown"
    )
    credit_amount: float = Field(
        ...,
        alias="creditAmount",
        gt=0,
        le=100000,
        description="Requested loan amount in currency units (e.g. DM / USD)"
    )
    duration: int = Field(
        ...,
        ge=1,
        le=120,
        description="Credit duration in months"
    )
    purpose: str = Field(
        ...,
        description="Loan purpose: car, radio/TV, furniture/equipment, business, education, repairs, domestic appliances, vacation/others"
    )

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v: str) -> str:
        norm = v.lower()
        if norm not in VALID_SEX:
            raise ValueError(f"Unsupported sex: '{v}'. Supported values are: {sorted(list(VALID_SEX))}")
        return norm

    @field_validator("housing")
    @classmethod
    def validate_housing(cls, v: str) -> str:
        norm = v.lower()
        if norm not in VALID_HOUSING:
            raise ValueError(f"Unsupported housing: '{v}'. Supported values are: {sorted(list(VALID_HOUSING))}")
        return norm

    @field_validator("saving_accounts")
    @classmethod
    def validate_saving(cls, v: Optional[str]) -> str:
        if not v:
            return "unknown"
        norm = v.lower()
        if norm not in VALID_SAVING_ACCOUNTS:
            raise ValueError(f"Unsupported saving accounts category: '{v}'. Supported values are: {sorted(list(VALID_SAVING_ACCOUNTS))}")
        return norm

    @field_validator("checking_account")
    @classmethod
    def validate_checking(cls, v: Optional[str]) -> str:
        if not v:
            return "unknown"
        norm = v.lower()
        if norm not in VALID_CHECKING_ACCOUNT:
            raise ValueError(f"Unsupported checking account category: '{v}'. Supported values are: {sorted(list(VALID_CHECKING_ACCOUNT))}")
        return norm

    @field_validator("purpose")
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        norm = v.lower()
        if norm not in VALID_PURPOSES:
            raise ValueError(f"Unsupported loan purpose: '{v}'. Supported values are: {sorted(list(VALID_PURPOSES))}")
        return norm


class PredictRequest(BaseModel):
    """
    Prediction request supporting either nested 'applicant' or flat fields,
    plus 'model_name' / 'model'.
    """
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    
    applicant: Optional[ApplicantInput] = None
    model_name: Optional[str] = Field(default="random_forest", alias="model")
    
    # Flat field fallbacks if applicant object is omitted
    age: Optional[int] = None
    sex: Optional[str] = None
    job: Optional[int] = None
    housing: Optional[str] = None
    saving_accounts: Optional[str] = Field(default=None, alias="savingAccounts")
    checking_account: Optional[str] = Field(default=None, alias="checkingAccount")
    credit_amount: Optional[float] = Field(default=None, alias="creditAmount")
    duration: Optional[int] = None
    purpose: Optional[str] = None

    @model_validator(mode="after")
    def assemble_applicant(self) -> "PredictRequest":
        if self.applicant is None:
            # Check if flat fields were provided
            if (
                self.age is not None and
                self.sex is not None and
                self.job is not None and
                self.housing is not None and
                self.credit_amount is not None and
                self.duration is not None and
                self.purpose is not None
            ):
                self.applicant = ApplicantInput(
                    age=self.age,
                    sex=self.sex,
                    job=self.job,
                    housing=self.housing,
                    saving_accounts=self.saving_accounts or "unknown",
                    checking_account=self.checking_account or "unknown",
                    credit_amount=self.credit_amount,
                    duration=self.duration,
                    purpose=self.purpose
                )
            else:
                raise ValueError("Must provide either a nested 'applicant' object or all flat applicant features.")
        return self


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str
    artifact_loaded: bool
    available_models: List[str]
    mode: str
    message: Optional[str] = None


class ModelInfo(BaseModel):
    """Model metadata."""
    id: str
    name: str
    notebook_accuracy: str
    description: str


class ModelsResponse(BaseModel):
    """List of available models."""
    models: List[ModelInfo]


class PredictionResponse(BaseModel):
    """Structured inference response from trained scikit-learn model."""
    prediction: int = Field(..., description="0 for Low Risk (below/at median), 1 for High Risk (above median)")
    predicted_label: str = Field(..., description="Human-readable classification outcome")
    model_name: str
    model_id: str
    model_version: str
    prediction_timestamp: str
    target_definition: str
    target_limitations: List[str]
    input_summary: Dict[str, Any]
    mode: str = "live"
    probabilities: Optional[Dict[str, Any]] = None
    explanation: str


class MetadataResponse(BaseModel):
    """Dataset and pipeline metadata."""
    ordered_features: List[str]
    categorical_features: List[str]
    available_models: List[str]
    target_definition: str
    training_limitations: List[str]
    dataset_median_amount: Optional[float] = None


class ErrorResponse(BaseModel):
    """Standardized JSON error envelope."""
    detail: str
    error_type: str
