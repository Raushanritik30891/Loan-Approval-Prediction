export default function MetricCard({ label, value, suffix = "", icon: Icon, color = "blue", sub }) {
  const colors = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400",
    green: "from-green-500/20 to-green-600/10 border-green-500/20 text-green-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={16} className={colors[color].split(" ").pop()} />}
      </div>
      <div>
        <span className="text-3xl font-bold text-white">{value}</span>
        {suffix && <span className="text-lg font-medium text-slate-400 ml-1">{suffix}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
