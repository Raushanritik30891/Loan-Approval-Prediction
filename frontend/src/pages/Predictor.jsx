import { useState } from "react";
import toast from "react-hot-toast";
import { predictLoan } from "../services/api";
import PredictionResult from "../components/PredictionResult";
import Spinner from "../components/Spinner";
import { Send, RotateCcw } from "lucide-react";

const defaultForm = {
  Gender: "Male",
  Married: "Yes",
  Dependents: "0",
  Education: "Graduate",
  Self_Employed: "No",
  ApplicantIncome: 5000,
  CoapplicantIncome: 0,
  LoanAmount: 150,
  Loan_Amount_Term: 360,
  Credit_History: 1,
  Property_Area: "Urban",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} className="input-field">
      {options.map(({ v, l }) => (
        <option key={v} value={v} style={{ background: "#1E293B" }}>
          {l}
        </option>
      ))}
    </select>
  );
}

export default function Predictor() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...form,
        ApplicantIncome: parseFloat(form.ApplicantIncome),
        CoapplicantIncome: parseFloat(form.CoapplicantIncome),
        LoanAmount: parseFloat(form.LoanAmount),
        Loan_Amount_Term: parseFloat(form.Loan_Amount_Term),
        Credit_History: parseFloat(form.Credit_History),
      };
      const res = await predictLoan(payload);
      setResult(res);
      toast.success("Prediction complete!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm(defaultForm);
    setResult(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Loan Predictor</h1>
        <p className="text-slate-400 text-sm mt-1">Fill in applicant details to get an instant ML-powered decision.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-2 glass-card p-6 space-y-6">
          {/* Personal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-dark-border">
              Personal Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Gender">
                <Select value={form.Gender} onChange={set("Gender")}
                  options={[{ v: "Male", l: "Male" }, { v: "Female", l: "Female" }]} />
              </Field>
              <Field label="Married">
                <Select value={form.Married} onChange={set("Married")}
                  options={[{ v: "Yes", l: "Yes" }, { v: "No", l: "No" }]} />
              </Field>
              <Field label="Dependents">
                <Select value={form.Dependents} onChange={set("Dependents")}
                  options={[{ v: "0", l: "0" }, { v: "1", l: "1" }, { v: "2", l: "2" }, { v: "3+", l: "3+" }]} />
              </Field>
              <Field label="Education">
                <Select value={form.Education} onChange={set("Education")}
                  options={[{ v: "Graduate", l: "Graduate" }, { v: "Not Graduate", l: "Not Graduate" }]} />
              </Field>
              <Field label="Self Employed">
                <Select value={form.Self_Employed} onChange={set("Self_Employed")}
                  options={[{ v: "No", l: "No" }, { v: "Yes", l: "Yes" }]} />
              </Field>
              <Field label="Property Area">
                <Select value={form.Property_Area} onChange={set("Property_Area")}
                  options={[
                    { v: "Urban", l: "Urban" },
                    { v: "Semiurban", l: "Semiurban" },
                    { v: "Rural", l: "Rural" },
                  ]} />
              </Field>
            </div>
          </div>

          {/* Financial */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 pb-2 border-b border-dark-border">
              Financial Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Applicant Income ($)">
                <input type="number" value={form.ApplicantIncome} onChange={set("ApplicantIncome")}
                  className="input-field" min={0} />
              </Field>
              <Field label="Coapplicant Income ($)">
                <input type="number" value={form.CoapplicantIncome} onChange={set("CoapplicantIncome")}
                  className="input-field" min={0} />
              </Field>
              <Field label="Loan Amount ($K)">
                <input type="number" value={form.LoanAmount} onChange={set("LoanAmount")}
                  className="input-field" min={0} />
              </Field>
              <Field label="Loan Term (months)">
                <Select value={form.Loan_Amount_Term} onChange={set("Loan_Amount_Term")}
                  options={[
                    { v: 360, l: "360 (30 yr)" },
                    { v: 180, l: "180 (15 yr)" },
                    { v: 480, l: "480 (40 yr)" },
                    { v: 300, l: "300 (25 yr)" },
                    { v: 240, l: "240 (20 yr)" },
                    { v: 120, l: "120 (10 yr)" },
                    { v: 60, l: "60 (5 yr)" },
                  ]} />
              </Field>
              <Field label="Credit History">
                <Select value={form.Credit_History} onChange={set("Credit_History")}
                  options={[{ v: 1, l: "Good (1)" }, { v: 0, l: "Bad (0)" }]} />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
            >
              {loading ? <Spinner size="sm" /> : <Send size={16} />}
              {loading ? "Predicting..." : "Predict Loan Approval"}
            </button>
            <button
              onClick={reset}
              className="px-4 py-3 rounded-xl border border-dark-border text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Result panel */}
        <div className="space-y-4">
          {result ? (
            <PredictionResult result={result} />
          ) : (
            <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 min-h-48 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                <Send size={22} className="text-blue-400" />
              </div>
              <p className="text-sm text-slate-400">
                Fill in the form and click <span className="text-white font-medium">Predict</span> to see the result.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="glass-card p-5 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Key Factors</h4>
            {[
              { label: "Credit History", impact: "Highest Impact", color: "green" },
              { label: "Total Income", impact: "High Impact", color: "blue" },
              { label: "Loan Amount", impact: "Medium Impact", color: "amber" },
              { label: "Property Area", impact: "Low Impact", color: "slate" },
            ].map(({ label, impact, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{label}</span>
                <span className={`text-xs font-medium text-${color}-400`}>{impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
