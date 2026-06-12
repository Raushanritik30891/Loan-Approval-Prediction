import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function PredictionResult({ result }) {
  if (!result) return null;

  const isApproved = result.prediction === "Approved";

  const riskColors = {
    Low: "text-green-400 bg-green-400/10 border-green-400/30",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    High: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    "Very High": "text-rose-400 bg-rose-400/10 border-rose-400/30",
  };

  const confidenceColors = {
    High: "text-green-400",
    Medium: "text-amber-400",
    Low: "text-rose-400",
  };

  return (
    <div className="animate-slide-up">
      {/* Main verdict */}
      <div
        className={`rounded-2xl p-6 border mb-4 ${
          isApproved
            ? "bg-gradient-to-br from-green-500/15 to-emerald-500/5 border-green-500/30"
            : "bg-gradient-to-br from-rose-500/15 to-red-500/5 border-rose-500/30"
        }`}
      >
        <div className="flex items-center gap-4">
          {isApproved ? (
            <CheckCircle2 size={48} className="text-green-400 shrink-0" />
          ) : (
            <XCircle size={48} className="text-rose-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Loan Decision
            </p>
            <h2
              className={`text-3xl font-bold mt-0.5 ${
                isApproved ? "text-green-400" : "text-rose-400"
              }`}
            >
              {result.prediction}
            </h2>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Probability */}
        <div className="glass-card p-4 text-center">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="14"
                fill="none" stroke="#1E293B" strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="14"
                fill="none"
                stroke={isApproved ? "#22C55E" : "#F43F5E"}
                strokeWidth="3"
                strokeDasharray={`${(result.probability / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
              {result.probability}%
            </span>
          </div>
          <p className="text-xs text-slate-400">Probability</p>
        </div>

        {/* Risk */}
        <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
          <AlertTriangle size={20} className="text-amber-400" />
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full border ${riskColors[result.risk] || riskColors["Medium"]}`}
          >
            {result.risk}
          </span>
          <p className="text-xs text-slate-400">Risk Level</p>
        </div>

        {/* Confidence */}
        <div className="glass-card p-4 flex flex-col items-center justify-center gap-2">
          <ShieldCheck size={20} className="text-blue-400" />
          <span
            className={`text-sm font-bold ${confidenceColors[result.confidence] || "text-white"}`}
          >
            {result.confidence}
          </span>
          <p className="text-xs text-slate-400">Confidence</p>
        </div>
      </div>
    </div>
  );
}
