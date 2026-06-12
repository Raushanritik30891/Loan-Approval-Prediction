import os
import sys
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.insert(0, os.path.dirname(__file__))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_INFO_PATH = os.path.join(MODELS_DIR, "model_info.json")

_artifacts = None


def get_artifacts():
    global _artifacts
    if _artifacts is None:
        try:
            from predict import load_artifacts
            _artifacts = load_artifacts()
            logger.info("Artifacts loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load artifacts: {e}")
            raise
    return _artifacts


def load_model_info():
    try:
        with open(MODEL_INFO_PATH) as f:
            return json.load(f)
    except Exception:
        return {}


# ──────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name": "Loan Approval Prediction API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/health", "/predict", "/model-info", "/feature-importance"],
    })


@app.route("/health", methods=["GET"])
def health():
    models_ready = all(
        os.path.exists(os.path.join(MODELS_DIR, f))
        for f in ["model.pkl", "scaler.pkl", "feature_columns.pkl", "label_encoders.pkl"]
    )
    return jsonify({
        "status": "healthy" if models_ready else "models_not_trained",
        "models_ready": models_ready,
    })


@app.route("/predict", methods=["POST"])
def predict_endpoint():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400

        required = [
            "Gender", "Married", "Dependents", "Education", "Self_Employed",
            "ApplicantIncome", "CoapplicantIncome", "LoanAmount",
            "Loan_Amount_Term", "Credit_History", "Property_Area",
        ]
        missing = [f for f in required if f not in data]
        if missing:
            return jsonify({"error": f"Missing fields: {missing}"}), 400

        # Type coerce
        data["ApplicantIncome"] = float(data["ApplicantIncome"])
        data["CoapplicantIncome"] = float(data["CoapplicantIncome"])
        data["LoanAmount"] = float(data["LoanAmount"])
        data["Loan_Amount_Term"] = float(data["Loan_Amount_Term"])
        data["Credit_History"] = float(data["Credit_History"])
        data["Dependents"] = str(data["Dependents"])

        artifacts = get_artifacts()
        from predict import predict
        result = predict(data, artifacts)
        return jsonify(result)

    except FileNotFoundError:
        return jsonify({"error": "Model not trained yet. Run train.py first."}), 503
    except Exception as e:
        logger.exception("Prediction failed")
        return jsonify({"error": str(e)}), 500


@app.route("/model-info", methods=["GET"])
def model_info():
    info = load_model_info()
    if not info:
        return jsonify({"error": "Model not trained yet"}), 404
    return jsonify(info)


@app.route("/feature-importance", methods=["GET"])
def feature_importance():
    info = load_model_info()
    fi = info.get("feature_importance", {})
    if not fi:
        return jsonify({"error": "Feature importance not available"}), 404
    return jsonify({"feature_importance": fi})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
