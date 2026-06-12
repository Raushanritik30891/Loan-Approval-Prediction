# 🏦 LoanIQ — AI-Powered Loan Approval Prediction System

> Production-ready Machine Learning system that predicts loan approval probability using XGBoost, Flask APIs, and an interactive React dashboard.

## 🚀 Live Demo

### Frontend

https://loan-approval-prediction-coral.vercel.app/

### Backend API

https://loan-approval-prediction-1-u1ga.onrender.com/

---

## 📸 Application Screenshots

### Dashboard

![Dashboard](src/screenshots/dashboard.png)

### Loan Prediction

![Prediction](src/screenshots/predictor.png)

### Analytics

![Analytics](src/screenshots/analytics.png)

### Model Performance

![Model Performance](src/screenshots/model-performance.png)

---

## 🎯 Project Overview

Financial institutions process thousands of loan applications every day. Manual evaluation can be slow, inconsistent, and error-prone.

LoanIQ automates the approval process using Machine Learning by analyzing applicant information and predicting:

* Loan Approval Status
* Approval Probability
* Risk Level
* Prediction Confidence

The system provides instant predictions through a modern web dashboard powered by React and Flask.

---

## 🧠 Machine Learning Pipeline

### Data Source

Kaggle Loan Prediction Dataset

* 614 Records
* 11 Features
* Binary Classification Problem
* Target Variable: Loan_Status

### Data Preprocessing

* Missing Value Handling
* Categorical Encoding
* Feature Scaling
* Outlier Treatment
* Feature Engineering

### Engineered Features

| Feature           | Description                    |
| ----------------- | ------------------------------ |
| TotalIncome       | Applicant + Coapplicant Income |
| IncomeToLoanRatio | Income / Loan Amount           |
| LoanPerIncome     | Loan Amount / Income           |
| EMI_Ratio         | Loan Amount / Loan Term        |
| LogIncome         | Log transformed income         |
| LogLoanAmount     | Log transformed loan amount    |

---

## 📊 Model Comparison

| Model               | Accuracy | F1 Score | ROC AUC |
| ------------------- | -------- | -------- | ------- |
| Logistic Regression | 78%      | 82%      | 79%     |
| Random Forest       | 79%      | 83%      | 82%     |
| XGBoost             | 81%      | 85%      | 84%     |

✅ Best model automatically selected using ROC-AUC score.

---

## 🔥 Features

### Machine Learning

* Automated Loan Approval Prediction
* XGBoost Classification
* Feature Engineering
* Model Comparison
* Probability Prediction

### Dashboard

* Interactive Analytics
* Real-Time Predictions
* Feature Importance Visualization
* Model Metrics Dashboard
* Responsive Design

### Backend API

* RESTful Flask API
* Model Health Monitoring
* Prediction Endpoint
* Feature Importance Endpoint
* Model Information Endpoint

---

## 🛠 Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router

### Backend

* Flask
* Flask-CORS
* Gunicorn

### Machine Learning

* Scikit-Learn
* XGBoost
* Pandas
* NumPy
* Joblib

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## 📁 Project Structure

```bash
loan-prediction/
├── backend/
│   ├── app.py
│   ├── train.py
│   ├── predict.py
│   ├── preprocessing.py
│   └── models/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   │
│   └── public/
│
├── requirements.txt
├── runtime.txt
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Health Check

```http
GET /health
```

### Predict Loan Approval

```http
POST /predict
```

Request:

```json
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
```

Response:

```json
{
  "prediction": "Approved",
  "probability": 91.5,
  "risk": "Low",
  "confidence": "High"
}
```

---

## 📈 Business Impact

* Faster Loan Screening
* Reduced Manual Effort
* Consistent Decision Making
* Explainable Predictions
* Improved Customer Experience

---

## 🎓 Skills Demonstrated

* Machine Learning
* Classification Modeling
* Feature Engineering
* Model Evaluation
* Flask API Development
* React Frontend Development
* Deployment & MLOps
* Data Visualization

---

## 👨‍💻 Author

### Ritik Raushan

Aspiring Machine Learning Engineer & Data Analyst

* Python
* Machine Learning
* Data Science
* Full Stack ML Applications

⭐ If you found this project useful, please give it a star.
