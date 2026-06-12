# LoanIQ — Loan Approval Prediction System

> A production-ready ML-powered loan approval dashboard built with React, Flask, and XGBoost.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask) ![XGBoost](https://img.shields.io/badge/XGBoost-2.0-FF6600) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss)

---

## Problem Statement

Banks process thousands of loan applications manually, creating bottlenecks and inconsistent decisions. LoanIQ automates the approval process using an ensemble ML model trained on historical applicant data — providing instant, explainable decisions with probability scores and risk levels.

---

## Dataset

**Source:** [Kaggle Loan Prediction Dataset](https://www.kaggle.com/datasets/altruistdelhite04/loan-prediction-problem-dataset)

| Feature | Description |
|---|---|
| Gender | Male / Female |
| Married | Marital status |
| Dependents | Number of dependents |
| Education | Graduate / Not Graduate |
| Self_Employed | Employment type |
| ApplicantIncome | Monthly income |
| CoapplicantIncome | Co-applicant income |
| LoanAmount | Loan amount (thousands) |
| Loan_Amount_Term | Term in months |
| Credit_History | 1 = good, 0 = bad |
| Property_Area | Urban / Semiurban / Rural |
| Loan_Status | **Target** — Y/N |

- **614 samples** | **11 features** | **~69% approval rate**

---

## Exploratory Data Analysis

Key findings from EDA:
- Credit history is the **strongest predictor** (~5x approval rate for good history)
- Graduates have higher approval rates (~71% vs ~61%)
- Semiurban properties have the highest approval rate
- Income and loan amount follow log-normal distributions
- ~8% missing values in Credit_History, filled with mode

---

## Feature Engineering

| Engineered Feature | Formula |
|---|---|
| `TotalIncome` | ApplicantIncome + CoapplicantIncome |
| `IncomeToLoanRatio` | TotalIncome / (LoanAmount + 1) |
| `LoanPerIncome` | LoanAmount / (TotalIncome + 1) |
| `EMI_Ratio` | LoanAmount / (Loan_Amount_Term + 1) |
| `LogIncome` | log1p(TotalIncome) |
| `LogLoanAmount` | log1p(LoanAmount) |

---

## Model Comparison

| Model | Accuracy | F1 | ROC AUC |
|---|---|---|---|
| Logistic Regression | ~78% | ~82% | ~79% |
| Random Forest | ~79% | ~83% | ~82% |
| **XGBoost** | **~81%** | **~85%** | **~84%** |

Best model selected automatically by ROC AUC score.

---

## Project Structure

```
loan-prediction/
├── backend/
│   ├── app.py              # Flask API
│   ├── train.py            # ML training pipeline
│   ├── predict.py          # Inference logic
│   ├── preprocessing.py    # Data cleaning & feature engineering
│   ├── models/             # Saved model artifacts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Predictor, Analytics, Model Performance
│   │   ├── components/     # Sidebar, MetricCard, PredictionResult, Spinner
│   │   ├── services/       # Axios API client
│   │   └── hooks/          # useModelInfo hook
│   └── Dockerfile
├── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Kaggle account (optional — synthetic data used as fallback)

### Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train models (downloads dataset automatically)
cd backend
python train.py

# Start API server
python app.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL
cp .env.example .env
# Edit VITE_API_URL=http://localhost:5000

# Start dev server
npm run dev
```

Open `http://localhost:5173`

---

## Docker Deployment

```bash
# Build and run everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## API Documentation

### `GET /health`
Returns model readiness status.

### `POST /predict`
```json
// Request
{
  "Gender": "Male",
  "Married": "Yes",
  "Dependents": "0",
  "Education": "Graduate",
  "Self_Employed": "No",
  "ApplicantIncome": 5000,
  "CoapplicantIncome": 1500,
  "LoanAmount": 120,
  "Loan_Amount_Term": 360,
  "Credit_History": 1,
  "Property_Area": "Urban"
}

// Response
{
  "prediction": "Approved",
  "probability": 91.5,
  "risk": "Low",
  "confidence": "High"
}
```

### `GET /model-info`
Returns best model metrics, all model comparison, dataset stats, and feature importance.

### `GET /feature-importance`
Returns top feature importance scores.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 5000 | Backend port |
| `FLASK_DEBUG` | false | Debug mode |
| `VITE_API_URL` | http://localhost:5000 | Frontend API URL |

---

## Interview Questions

**Q: Why XGBoost over Logistic Regression?**
> XGBoost handles non-linear interactions and feature importance natively. On this dataset it improves ROC AUC by ~5% while maintaining interpretability via SHAP values.

**Q: How do you handle missing values?**
> Categorical columns use mode imputation. LoanAmount uses median (robust to outliers). Credit_History uses mode since it's binary.

**Q: What does ROC AUC measure?**
> The probability that the model ranks a random positive example higher than a random negative. 0.84 means 84% of the time the model correctly ranks approved over rejected loans.

**Q: How would you improve this in production?**
> (1) Retrain on rolling 6-month window, (2) Add SHAP explainability per prediction, (3) A/B test model versions, (4) Monitor for distribution drift, (5) Add applicant demographic fairness auditing.

**Q: Why StandardScaler?**
> Logistic Regression is sensitive to feature scale. Scaling ensures gradient descent converges faster and coefficients are comparable. Tree-based models (RF, XGBoost) don't require scaling but it doesn't hurt.
"# Loan-Approval-Prediction" 
