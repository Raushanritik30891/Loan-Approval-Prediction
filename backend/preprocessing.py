import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
import joblib
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

CATEGORICAL_COLS = ["Gender", "Married", "Dependents", "Education", "Self_Employed", "Property_Area"]
TARGET_COL = "Loan_Status"

def load_and_clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.drop_duplicates(inplace=True)

    # Fill missing values
    for col in ["Gender", "Married", "Dependents", "Self_Employed", "Credit_History"]:
        if col in df.columns:
            df[col].fillna(df[col].mode()[0], inplace=True)

    df["LoanAmount"].fillna(df["LoanAmount"].median(), inplace=True)
    df["Loan_Amount_Term"].fillna(df["Loan_Amount_Term"].mode()[0], inplace=True)

    # Fix dependents
    df["Dependents"] = df["Dependents"].replace("3+", "3").astype(str)

    # Remove invalid rows
    df = df[df["ApplicantIncome"] > 0]
    df = df[df["LoanAmount"] > 0]

    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["TotalIncome"] = df["ApplicantIncome"] + df["CoapplicantIncome"]
    df["IncomeToLoanRatio"] = df["TotalIncome"] / (df["LoanAmount"] + 1)
    df["LoanPerIncome"] = df["LoanAmount"] / (df["TotalIncome"] + 1)
    df["EMI_Ratio"] = df["LoanAmount"] / (df["Loan_Amount_Term"] + 1)
    df["LogIncome"] = np.log1p(df["TotalIncome"])
    df["LogLoanAmount"] = np.log1p(df["LoanAmount"])
    return df


def encode_features(df: pd.DataFrame, label_encoders: dict = None, fit: bool = True):
    df = df.copy()
    if label_encoders is None:
        label_encoders = {}

    for col in CATEGORICAL_COLS:
        if col not in df.columns:
            continue
        if fit:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le
        else:
            le = label_encoders[col]
            df[col] = df[col].astype(str).map(
                lambda x: le.transform([x])[0] if x in le.classes_ else -1
            )

    return df, label_encoders


def scale_features(X, scaler=None, fit=True):
    if fit:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)
    return X_scaled, scaler


def get_feature_columns(df: pd.DataFrame) -> list:
    drop_cols = [TARGET_COL, "Loan_ID"]
    return [c for c in df.columns if c not in drop_cols]


def preprocess_pipeline(df: pd.DataFrame, is_train: bool = True, artifacts: dict = None):
    df = load_and_clean(df)
    df = engineer_features(df)

    if is_train:
        y_raw = df[TARGET_COL]
        le_target = LabelEncoder()
        y = le_target.fit_transform(y_raw)

        df, label_encoders = encode_features(df, fit=True)
        feature_cols = get_feature_columns(df)
        X = df[feature_cols].values

        X_scaled, scaler = scale_features(X, fit=True)

        artifacts = {
            "scaler": scaler,
            "label_encoders": label_encoders,
            "feature_columns": feature_cols,
            "le_target": le_target,
        }

        # Save artifacts
        joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.pkl"))
        joblib.dump(label_encoders, os.path.join(MODELS_DIR, "label_encoders.pkl"))
        joblib.dump(feature_cols, os.path.join(MODELS_DIR, "feature_columns.pkl"))
        joblib.dump(le_target, os.path.join(MODELS_DIR, "le_target.pkl"))

        return X_scaled, y, artifacts

    else:
        df, _ = encode_features(df, label_encoders=artifacts["label_encoders"], fit=False)
        feature_cols = artifacts["feature_columns"]

        # Ensure all feature columns exist
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0

        X = df[feature_cols].values
        X_scaled, _ = scale_features(X, scaler=artifacts["scaler"], fit=False)
        return X_scaled


def preprocess_single(input_data: dict, artifacts: dict) -> np.ndarray:
    df = pd.DataFrame([input_data])
    df = engineer_features(df)
    df, _ = encode_features(df, label_encoders=artifacts["label_encoders"], fit=False)

    feature_cols = artifacts["feature_columns"]
    for col in feature_cols:
        if col not in df.columns:
            df[col] = 0

    X = df[feature_cols].values
    X_scaled, _ = scale_features(X, scaler=artifacts["scaler"], fit=False)
    return X_scaled
