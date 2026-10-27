"""
Offline artifact export script.
Replicates the Google Colab notebook training pipeline and exports the verified bundle to:
backend/models/credit_risk_bundle.joblib
"""

import sys
import os
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

# Locate dataset
POSSIBLE_DATASET_PATHS = [
    Path(r"C:\Users\jitendra kumar\Downloads\archive\german_credit_data.csv"),
    Path(__file__).resolve().parent.parent.parent / "german_credit_data.csv",
    Path("german_credit_data.csv")
]

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "models"
OUTPUT_FILE = OUTPUT_DIR / "credit_risk_bundle.joblib"


def find_dataset() -> Path:
    for path in POSSIBLE_DATASET_PATHS:
        if path.exists():
            return path
    raise FileNotFoundError(
        "Could not find german_credit_data.csv in known locations. "
        "Please provide the path as an argument: python generate_bundle.py <path_to_csv>"
    )


def train_and_export(csv_path: Path, output_file: Path):
    print(f"Loading raw dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")

    # 1. Fill missing values (matching Colab Cell 10)
    df["Saving accounts"] = df["Saving accounts"].fillna("unknown")
    df["Checking account"] = df["Checking account"].fillna("unknown")

    # 2. Drop index column if present
    if "Unnamed: 0" in df.columns:
        df.drop("Unnamed: 0", axis=1, inplace=True)

    # 3. Create target column: Credit amount > median
    median_amount = float(df["Credit amount"].median())
    print(f"Computed dataset median Credit amount: ${median_amount:,.2f}")
    df["Risk"] = (df["Credit amount"] > median_amount).astype(int)

    # 4. Fit LabelEncoder for each categorical column
    categorical_columns = ["Sex", "Housing", "Saving accounts", "Checking account", "Purpose"]
    encoders = {}

    for col in categorical_columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        print(f"Encoded '{col}': classes = {list(le.classes_)}")

    # 5. Feature matrix & target vector
    X = df.drop("Risk", axis=1)
    y = df["Risk"]
    feature_columns = list(X.columns)
    print(f"Feature columns order ({len(feature_columns)}): {feature_columns}")

    # 6. Train-test split (80-20, random_state=42 matching Colab)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 7. StandardScaler fit on X_train only
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 8. Train the four classifiers
    print("\nTraining classifiers...")
    
    # Logistic Regression
    lr = LogisticRegression(random_state=42, max_iter=1000)
    lr.fit(X_train_scaled, y_train)
    acc_lr = accuracy_score(y_test, lr.predict(X_test_scaled))
    print(f"1. Logistic Regression Test Accuracy: {acc_lr * 100:.2f}% (Colab reported: 98%)")

    # Decision Tree
    dt = DecisionTreeClassifier(random_state=42)
    dt.fit(X_train_scaled, y_train)
    acc_dt = accuracy_score(y_test, dt.predict(X_test_scaled))
    print(f"2. Decision Tree Test Accuracy:       {acc_dt * 100:.2f}% (Colab reported: 100% - target leakage)")

    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train_scaled, y_train)
    acc_rf = accuracy_score(y_test, rf.predict(X_test_scaled))
    print(f"3. Random Forest Test Accuracy:       {acc_rf * 100:.2f}% (Colab reported: 100% - target leakage)")

    # Support Vector Machine (with probability=True for score breakdown)
    svm = SVC(kernel="rbf", probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)
    acc_svm = accuracy_score(y_test, svm.predict(X_test_scaled))
    print(f"4. Support Vector Machine Accuracy:   {acc_svm * 100:.2f}% (Colab reported: 94%)")

    # 9. Test Colab notebook sample: [35, 1, 2, 1, 2, 1, 5000, 24, 3]
    sample = np.array([[35, 1, 2, 1, 2, 1, 5000, 24, 3]], dtype=float)
    sample_scaled = scaler.transform(sample)
    sample_pred = rf.predict(sample_scaled)[0]
    print(f"\nColab sample [35,1,2,1,2,1,5000,24,3] -> Prediction: {sample_pred} ({'High' if sample_pred==1 else 'Low'} Risk)")

    # 10. Assemble and save bundle
    bundle = {
        "models": {
            "logistic_regression": lr,
            "decision_tree": dt,
            "random_forest": rf,
            "svm": svm
        },
        "scaler": scaler,
        "encoders": encoders,
        "feature_columns": feature_columns,
        "categorical_columns": categorical_columns,
        "median_amount": median_amount,
        "target_definition": f"Credit amount > dataset median (${median_amount:,.2f})",
        "version": "1.0.0-colab-bundle",
        "accuracies": {
            "logistic_regression": float(acc_lr),
            "decision_tree": float(acc_dt),
            "random_forest": float(acc_rf),
            "svm": float(acc_svm)
        }
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, output_file)
    print(f"\nBundle successfully exported to: {output_file}")
    print(f"Artifact size: {output_file.stat().st_size / 1024:.2f} KB")


if __name__ == "__main__":
    dataset_path = Path(sys.argv[1]) if len(sys.argv) > 1 else find_dataset()
    train_and_export(dataset_path, OUTPUT_FILE)
