import { useModelInfo } from "../hooks/useModelInfo";
import Spinner from "../components/Spinner";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#F43F5E"];

const tooltipStyle = {
  backgroundColor: "#1E293B",
  border: "1px solid #334155",
  borderRadius: "0.75rem",
  color: "#F1F5F9",
  fontSize: "12px",
};

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { modelInfo, featureImportance, loading, error } = useModelInfo();

  if (loading) return <div className="flex justify-center py-24"><Spinner text="Loading analytics..." /></div>;
  if (error) return (
    <div className="glass-card p-8 text-center">
      <p className="text-rose-400">{error}</p>
      <p className="text-slate-400 text-sm mt-2">Make sure the backend is running and models are trained.</p>
    </div>
  );

  const stats = modelInfo?.dataset_stats || {};

  // Loan Status Distribution
  const loanStatusData = Object.entries(stats.loan_status_distribution || { Y: 0, N: 0 }).map(([k, v]) => ({
    name: k === "Y" ? "Approved" : "Rejected",
    value: v,
  }));

  // Property area approval
  const propertyData = Object.entries(stats.property_area_approval || {}).map(([k, v]) => ({
    name: k,
    approval: v,
  }));

  // Education approval
  const eduData = Object.entries(stats.education_approval || {}).map(([k, v]) => ({
    name: k === "Graduate" ? "Graduate" : "Non-Graduate",
    approval: v,
  }));

  // Feature importance
  const fiData = Object.entries(featureImportance || {})
    .slice(0, 10)
    .map(([k, v]) => ({ name: k.replace(/_/g, " "), value: parseFloat((v * 100).toFixed(2)) }));

  const incomeStats = stats.income_stats || {};
  const loanStats = stats.loan_amount_stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Dataset insights and feature distributions.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Applicant Income", value: `$${(incomeStats.mean || 0).toLocaleString()}` },
          { label: "Median Income", value: `$${(incomeStats.median || 0).toLocaleString()}` },
          { label: "Avg Loan Amount", value: `$${(loanStats.mean || 0).toLocaleString()}K` },
          { label: "Overall Approval Rate", value: `${modelInfo?.dataset_info?.approval_rate ?? "—"}%` },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Status Pie */}
        <ChartCard title="Loan Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={loanStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {loanStatusData.map((_, i) => <Cell key={i} fill={i === 0 ? "#3B82F6" : "#F43F5E"} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Property Area */}
        <ChartCard title="Approval Rate by Property Area">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propertyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Approval Rate"]} />
              <Bar dataKey="approval" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Education Approval */}
        <ChartCard title="Approval Rate by Education">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eduData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Approval Rate"]} />
              <Bar dataKey="approval" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Feature Importance */}
        <ChartCard title="Top Feature Importance">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fiData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Importance"]} />
              <Bar dataKey="value" fill="url(#fiGrad)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="fiGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
