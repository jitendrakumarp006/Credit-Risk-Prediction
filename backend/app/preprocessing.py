"""Feature preprocessing and categorical encoding matching Google Colab pipeline."""

from typing import Dict, List, Tuple, Any
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from .schemas import ApplicantInput

# Ordered feature list matching X = df.drop("Risk", axis=1) in Colab
FEATURE_COLUMNS = [
    "Age",
    "Sex",
    "Job",
    "Housing",
    "Saving accounts",
    "Checking account",
    "Credit amount",
    "Duration",
    "Purpose"
]

CATEGORICAL_COLUMNS = [
    "Sex",
    "Housing",
    "Saving accounts",
    "Checking account",
    "Purpose"
]


def match_encoder_class(val: str, encoder: LabelEncoder) -> str:
    """
    Find matching class string in encoder.classes_ case-insensitively.
    E.g. 'radio/tv' -> 'radio/TV'.
    """
    val_lower = val.lower().strip()
    for cls_name in encoder.classes_:
        if str(cls_name).lower().strip() == val_lower:
            return cls_name
    return val


def prepare_raw_feature_dict(applicant: ApplicantInput) -> Dict[str, Any]:
    """Extract raw dictionary with exact feature column names."""
    return {
        "Age": int(applicant.age),
        "Sex": applicant.sex.lower().strip(),
        "Job": int(applicant.job),
        "Housing": applicant.housing.lower().strip(),
        "Saving accounts": applicant.saving_accounts.lower().strip(),
        "Checking account": applicant.checking_account.lower().strip(),
        "Credit amount": float(applicant.credit_amount),
        "Duration": int(applicant.duration),
        "Purpose": applicant.purpose.lower().strip()
    }


def encode_features(
    applicant: ApplicantInput,
    encoders: Dict[str, LabelEncoder],
    feature_columns: List[str]
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Transforms applicant fields into an encoded 1D numpy array and summary map.
    Rejects unsupported categories with clear ValueError.
    """
    raw_dict = prepare_raw_feature_dict(applicant)
    encoded_values = []
    encoded_map = {}

    for col in feature_columns:
        raw_val = raw_dict[col]
        
        if col in encoders:
            encoder = encoders[col]
            matched_cls = match_encoder_class(str(raw_val), encoder)
            
            try:
                # Transform single class string
                code = int(encoder.transform([matched_cls])[0])
            except (ValueError, KeyError):
                valid_classes = [str(c) for c in encoder.classes_]
                raise ValueError(
                    f"Unsupported category '{raw_val}' for column '{col}'. "
                    f"Supported classes are: {valid_classes}"
                )
            
            encoded_values.append(code)
            encoded_map[col] = f"{raw_val} (encoded: {code})"
        else:
            # Numeric feature (Age, Job, Credit amount, Duration)
            encoded_values.append(raw_val)
            encoded_map[col] = raw_val

    # Reshape to (1, 9) for scikit-learn
    vector = np.array(encoded_values, dtype=float).reshape(1, -1)
    return vector, encoded_map


def scale_features(raw_vector: np.ndarray, scaler: StandardScaler) -> np.ndarray:
    """
    Applies the fitted StandardScaler transform.
    Never fits or scales twice.
    """
    if raw_vector.shape[1] != scaler.n_features_in_:
        raise ValueError(
            f"Input shape {raw_vector.shape[1]} does not match scaler expected feature count {scaler.n_features_in_}."
        )
    if hasattr(scaler, "feature_names_in_"):
        import pandas as pd
        df_vector = pd.DataFrame(raw_vector, columns=scaler.feature_names_in_)
        return scaler.transform(df_vector)
    return scaler.transform(raw_vector)
