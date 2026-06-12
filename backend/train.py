import os
import sys
import json
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from xgboost import XGBClassifier

sys.path.insert(0, os.path.dirname(__file__))
from preprocessing import preprocess_pipeline

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def load_dataset():
    try:
        import kagglehub
        path = kagglehub.dataset_download("altruistdelhite04/loan-prediction-problem-dataset")
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith(".csv") and "train" in f.lower():
                    return pd.read_csv(os.path.join(root, f))
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith(".csv"):
                    return pd.read_csv(os.path.join(root, f))
    except Exception as e:
        print(f"KaggleHub failed: {e}. Using synthetic dataset.")

    return _generate_synthetic_dataset()


def _generate_synthetic_dataset(n=614):
    np.random.seed(42)
    genders = np.random.choice(["Male", "Female"], n, p=[0.8, 0.2])
    married = np.random.choice(["Yes", "No"], n, p=[0.65, 0.35])
    dependents = np.random.choice(["0", "1", "2", "3+"], n, p=[0.57, 0.17, 0.16, 0.1])
    education = np.random.choice(["Graduate", "Not Graduate"], n, p=[0.78, 0.22])
    self_employed = np.random.choice(["Yes", "No"], n, p=[0.14, 0.86])
    applicant_income = np.random.lognormal(8.5, 0.6, n).astype(int)
    coapplicant_income = np.random.choice(
        np.append(np.zeros(int(n * 0.4)), np.random.lognormal(7.5, 0.7, int(n * 0.6)).astype(int))
    )
    coapplicant_income = np.random.lognormal(6, 1, n) * np.random.choice([0, 1], n, p=[0.4, 0.6])
    loan_amount = np.random.lognormal(4.8, 0.5, n).astype(int)
    loan_term = np.random.choice([360, 180, 480, 300, 240], n, p=[0.7, 0.1, 0.08, 0.07, 0.05])
    credit_history = np.random.choice([1.0, 0.0], n, p=[0.84, 0.16])
    property_area = np.random.choice(["Urban", "Semiurban", "Rural"], n, p=[0.38, 0.38, 0.24])

    # Approval logic
    score = (
        (credit_history * 3)
        + (applicant_income / 10000)
        + (coapplicant_income / 10000)
        - (loan_amount / 200)
        + (np.where(education == "Graduate", 0.5, 0))
        + (np.where(property_area == "Semiurban", 0.3, 0))
    )
    prob = 1 / (1 + np.exp(-score + 2))
    loan_status = np.where(np.random.random(n) < prob, "Y", "N")

    df = pd.DataFrame({
        "Loan_ID": [f"LP{str(i).zfill(6)}" for i in range(n)],
        "Gender": genders,
        "Married": married,
        "Dependents": dependents,
        "Education": education,
        "Self_Employed": self_employed,
        "ApplicantIncome": applicant_income,
        "CoapplicantIncome": coapplicant_income.astype(int),
        "LoanAmount": loan_amount,
        "Loan_Amount_Term": loan_term,
        "Credit_History": credit_history,
        "Property_Area": property_area,
        "Loan_Status": loan_status
    })
    return df


def evaluate_model(model, X_test, y_test, model_name):
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    metrics = {
        "model": model_name,
        "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred) * 100, 2),
        "recall": round(recall_score(y_test, y_pred) * 100, 2),
        "f1": round(f1_score(y_test, y_pred) * 100, 2),
        "roc_auc": round(roc_auc_score(y_test, y_prob) * 100, 2),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
    }
    return metrics


def get_feature_importance(model, feature_cols, model_name):
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_[0])
    else:
        return {}
    pairs = sorted(zip(feature_cols, importances), key=lambda x: x[1], reverse=True)
    return {k: round(float(v), 6) for k, v in pairs[:15]}


def train():
    print("Loading dataset...")
    df = load_dataset()
    print(f"Dataset shape: {df.shape}")

    print("Preprocessing...")
    X, y, artifacts = preprocess_pipeline(df, is_train=True)
    feature_cols = artifacts["feature_columns"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=200, random_state=42),
        "XGBoost": XGBClassifier(n_estimators=200, random_state=42, eval_metric="logloss", verbosity=0),
    }

    results = []
    trained = {}

    for name, model in models.items():
        print(f"Training {name}...")
        model.fit(X_train, y_train)
        metrics = evaluate_model(model, X_test, y_test, name)
        cv = cross_val_score(model, X, y, cv=5, scoring="accuracy")
        metrics["cv_mean"] = round(cv.mean() * 100, 2)
        metrics["cv_std"] = round(cv.std() * 100, 2)
        results.append(metrics)
        trained[name] = model
        print(f"  Accuracy: {metrics['accuracy']}% | F1: {metrics['f1']}% | ROC AUC: {metrics['roc_auc']}%")

    # Select best model by ROC AUC
    best = max(results, key=lambda r: r["roc_auc"])
    best_model = trained[best["model"]]
    print(f"\nBest model: {best['model']} (ROC AUC: {best['roc_auc']}%)")

    # Feature importance
    best["feature_importance"] = get_feature_importance(best_model, feature_cols, best["model"])

    # Save best model
    joblib.dump(best_model, os.path.join(MODELS_DIR, "model.pkl"))

    # Save all results
    summary = {
        "best_model": best,
        "all_models": results,
        "feature_importance": best["feature_importance"],
        "dataset_info": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features": len(feature_cols),
            "approval_rate": round(float(y.mean()) * 100, 2),
        },
        "dataset_stats": _compute_dataset_stats(df),
    }

    with open(os.path.join(MODELS_DIR, "model_info.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\nAll artifacts saved to backend/models/")
    return summary


def _compute_dataset_stats(df):
    stats = {}
    if "Loan_Status" in df.columns:
        vc = df["Loan_Status"].value_counts()
        stats["loan_status_distribution"] = vc.to_dict()
    if "Credit_History" in df.columns:
        stats["credit_history_distribution"] = df["Credit_History"].value_counts().to_dict()
    if "Property_Area" in df.columns:
        pa = df.groupby("Property_Area")["Loan_Status"].apply(
            lambda x: (x == "Y").sum() / len(x) * 100
        ).round(2)
        stats["property_area_approval"] = pa.to_dict()
    if "Education" in df.columns:
        ed = df.groupby("Education")["Loan_Status"].apply(
            lambda x: (x == "Y").sum() / len(x) * 100
        ).round(2)
        stats["education_approval"] = ed.to_dict()
    if "ApplicantIncome" in df.columns:
        stats["income_stats"] = {
            "mean": round(float(df["ApplicantIncome"].mean()), 2),
            "median": round(float(df["ApplicantIncome"].median()), 2),
            "min": round(float(df["ApplicantIncome"].min()), 2),
            "max": round(float(df["ApplicantIncome"].max()), 2),
        }
    if "LoanAmount" in df.columns:
        stats["loan_amount_stats"] = {
            "mean": round(float(df["LoanAmount"].mean()), 2),
            "median": round(float(df["LoanAmount"].median()), 2),
            "min": round(float(df["LoanAmount"].min()), 2),
            "max": round(float(df["LoanAmount"].max()), 2),
        }
    return stats


if __name__ == "__main__":
    train()
