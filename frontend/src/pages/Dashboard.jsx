import { useNavigate } from "react-router-dom";
import { CreditCard, TrendingUp, Brain, BarChart3, ArrowRight, Cpu, Database, Shield } from "lucide-react";
import MetricCard from "../components/MetricCard";
import { useModelInfo } from "../hooks/useModelInfo";
import Spinner from "../components/Spinner";

const features = [
  { icon: Brain, title: "ML-Powered", desc: "XGBoost & Random Forest models trained on real loan data" },
  { icon: Shield, title: "Risk Analysis", desc: "Multi-level risk scoring: Low, Medium, High, Very High" },
  { icon: Cpu, title: "Real-time Predictions", desc: "Sub-second inference via optimized Flask backend" },
  { icon: Database, title: "Feature Engineering", desc: "12+ engineered features including EMI ratio & income analysis" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { modelInfo, loading } = useModelInfo();

  const best = modelInfo?.best_model;
  const dsInfo = modelInfo?.dataset_info;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent border border-white/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest bg-blue-400/10 border border-blue-400/20 px-3 py-1 rounded-full">
            ML Prediction System
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white leading-tight">
            Loan Approval<br />
            <span className="gradient-text">Intelligence</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-lg text-base leading-relaxed">
            Instant loan decisions powered by ensemble machine learning. Compare
            applicant profiles against thousands of historical decisions in milliseconds.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={() => navigate("/predictor")} className="btn-primary flex items-center gap-2">
              Try Predictor <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="px-6 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all duration-200"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner text="Loading model data..." /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Best Model Accuracy"
            value={best?.accuracy ?? "—"}
            suffix="%"
            icon={TrendingUp}
            color="blue"
            sub={best?.model}
          />
          <MetricCard
            label="ROC AUC Score"
            value={best?.roc_auc ?? "—"}
            suffix="%"
            icon={Brain}
            color="purple"
            sub="Area under curve"
          />
          <MetricCard
            label="F1 Score"
            value={best?.f1 ?? "—"}
            suffix="%"
            icon={BarChart3}
            color="green"
            sub="Harmonic mean"
          />
          <MetricCard
            label="Training Samples"
            value={dsInfo?.train_samples ?? "—"}
            icon={Database}
            color="amber"
            sub={`${dsInfo?.features ?? "—"} features`}
          />
        </div>
      )}

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">System Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card-hover p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Run a Prediction", desc: "Enter applicant details and get instant results", to: "/predictor", icon: CreditCard },
          { label: "Explore Analytics", desc: "Distribution charts, approval rates by segment", to: "/analytics", icon: BarChart3 },
          { label: "Model Performance", desc: "Confusion matrix, ROC AUC, classification report", to: "/model-performance", icon: Brain },
        ].map(({ label, desc, to, icon: Icon }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="glass-card-hover p-5 text-left flex flex-col gap-3 group"
          >
            <Icon size={20} className="text-blue-400" />
            <div>
              <p className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
