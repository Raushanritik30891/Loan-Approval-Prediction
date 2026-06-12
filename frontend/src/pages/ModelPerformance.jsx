import { useModelInfo } from "../hooks/useModelInfo";
import Spinner from "../components/Spinner";
import MetricCard from "../components/MetricCard";
import { TrendingUp, Brain, Target, BarChart3, Award } from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid #334155",
  borderRadius: "0.75rem",
  color: "#F1F5F9",
  fontSize: "12px",
};

function ConfusionMatrix({ matrix }) {
  if (!matrix || matrix.length < 2) return null;
  const [[tn, fp], [fn, tp]] = matrix;
  const total = tn + fp + fn + tp;

  return (
    <div className="grid grid-cols-2 gap-2 max-w-xs">
      {[
        { label: "True Negative", value: tn, color: "green" },
        { label: "False Positive", value: fp, color: "rose" },
        { label: "False Negative", value: fn, color: "amber" },
        { label: "True Positive", value: tp, color: "blue" },
      ].map(({ label, value, color }) => (
        <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-4 text-center`}>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          <p className="text-xs text-slate-400 mt-1">{label}</p>
          <p className="text-xs text-slate-600">{((value / total) * 100).toFixed(1)}%</p>
        </div>
      ))}
    </div>
  );
}

export default function ModelPerformance() {
  const { modelInfo, loading, error } = useModelInfo();

  if (loading) return <div className="flex justify-center py-24"><Spinner text="Loading model data..." /></div>;
  if (error || !modelInfo) return (
    <div className="glass-card p-8 text-center">
      <p className="text-rose-400">{error || "No model data found."}</p>
      <p className="text-slate-400 text-sm mt-2">Run train.py to generate model data.</p>
    </div>
  );

  const best = modelInfo.best_model || {};
  const allModels = modelInfo.all_models || [];

  // Radar data
  const radarData = [
    { metric: "Accuracy", value: best.accuracy },
    { metric: "Precision", value: best.precision },
    { metric: "Recall", value: best.recall },
    { metric: "F1 Score", value: best.f1 },
    { metric: "ROC AUC", value: best.roc_auc },
  ];

  // Model comparison
  const comparisonData = allModels.map((m) => ({
    name: m.model.replace(" ", "\n"),
    Accuracy: m.accuracy,
    F1: m.f1,
    ROC_AUC: m.roc_auc,
  }));

  const report = best.classification_report || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Performance</h1>
          <p className="text-slate-400 text-sm mt-1">Evaluation metrics for the best-performing model.</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Award size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-blue-300">{best.model}</span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Accuracy" value={best.accuracy} suffix="%" icon={TrendingUp} color="blue" />
        <MetricCard label="Precision" value={best.precision} suffix="%" icon={Target} color="purple" />
        <MetricCard label="Recall" value={best.recall} suffix="%" icon={Brain} color="green" />
        <MetricCard label="F1 Score" value={best.f1} suffix="%" icon={BarChart3} color="amber" />
        <MetricCard label="ROC AUC" value={best.roc_auc} suffix="%" icon={TrendingUp} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} dot={{ fill: "#3B82F6", r: 4 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Confusion Matrix */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Confusion Matrix</h3>
          <ConfusionMatrix matrix={best.confusion_matrix} />
          <p className="text-xs text-slate-500 mt-4">
            CV Mean: <span className="text-white">{best.cv_mean}%</span> ± {best.cv_std}% (5-fold)
          </p>
        </div>

        {/* Model Comparison */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Model Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="Accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="ROC_AUC" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {[["#3B82F6","Accuracy"],["#8B5CF6","F1"],["#10B981","ROC AUC"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{background:c}} />
                <span className="text-xs text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classification Report */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">Classification Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-dark-border">
                  <th className="text-left py-2 pr-4">Class</th>
                  <th className="text-right py-2 px-2">Precision</th>
                  <th className="text-right py-2 px-2">Recall</th>
                  <th className="text-right py-2 px-2">F1</th>
                  <th className="text-right py-2 pl-2">Support</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report).filter(([k]) => !["accuracy","macro avg","weighted avg"].includes(k)).map(([cls, v]) => (
                  <tr key={cls} className="border-b border-dark-border/50 text-slate-300">
                    <td className="py-2 pr-4 text-white">{cls}</td>
                    <td className="text-right py-2 px-2">{(v.precision*100).toFixed(1)}%</td>
                    <td className="text-right py-2 px-2">{(v.recall*100).toFixed(1)}%</td>
                    <td className="text-right py-2 px-2">{(v["f1-score"]*100).toFixed(1)}%</td>
                    <td className="text-right py-2 pl-2 text-slate-500">{v.support}</td>
                  </tr>
                ))}
                {report["weighted avg"] && (
                  <tr className="text-blue-300 font-medium">
                    <td className="py-2 pr-4">Weighted Avg</td>
                    <td className="text-right py-2 px-2">{(report["weighted avg"].precision*100).toFixed(1)}%</td>
                    <td className="text-right py-2 px-2">{(report["weighted avg"].recall*100).toFixed(1)}%</td>
                    <td className="text-right py-2 px-2">{(report["weighted avg"]["f1-score"]*100).toFixed(1)}%</td>
                    <td className="text-right py-2 pl-2 text-slate-500">{report["weighted avg"].support}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
