import os
import joblib
import numpy as np
from preprocessing import preprocess_single

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_artifacts():
    return {
        "model": joblib.load(os.path.join(MODELS_DIR, "model.pkl")),
        "scaler": joblib.load(os.path.join(MODELS_DIR, "scaler.pkl")),
        "label_encoders": joblib.load(os.path.join(MODELS_DIR, "label_encoders.pkl")),
        "feature_columns": joblib.load(os.path.join(MODELS_DIR, "feature_columns.pkl")),
        "le_target": joblib.load(os.path.join(MODELS_DIR, "le_target.pkl")),
    }


def predict(input_data: dict, artifacts: dict) -> dict:
    X = preprocess_single(input_data, artifacts)
    model = artifacts["model"]

    pred_encoded = model.predict(X)[0]
    prob = float(model.predict_proba(X)[0][1]) * 100

    # Decode prediction
    le_target = artifacts["le_target"]
    classes = le_target.classes_
    # Y = approved (index 1 usually)
    approved_idx = list(classes).index("Y") if "Y" in classes else 1
    is_approved = pred_encoded == approved_idx

    prediction = "Approved" if is_approved else "Rejected"
    approval_prob = prob if is_approved else 100 - prob

    risk = _get_risk(approval_prob)
    confidence = _get_confidence(approval_prob)

    return {
        "prediction": prediction,
        "probability": round(approval_prob, 1),
        "risk": risk,
        "confidence": confidence,
    }


def _get_risk(probability: float) -> str:
    if probability >= 80:
        return "Low"
    elif probability >= 60:
        return "Medium"
    elif probability >= 40:
        return "High"
    return "Very High"


def _get_confidence(probability: float) -> str:
    if probability >= 85 or probability <= 15:
        return "High"
    elif probability >= 70 or probability <= 30:
        return "Medium"
    return "Low"
