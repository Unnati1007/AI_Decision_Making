import { Users, MessageSquare, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { adminDomainStats, adminSummaryStats } from "../data/dummyData";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Users", value: adminSummaryStats.totalUsers, icon: Users, color: "blue" },
    { label: "Total Queries", value: adminSummaryStats.totalQueries, icon: MessageSquare, color: "indigo" },
    { label: "Active Sessions", value: adminSummaryStats.activeSessions, icon: Activity, color: "emerald" },
    { label: "Flagged Items", value: adminSummaryStats.flaggedQueries, icon: AlertTriangle, color: "rose" },
  ];

  const COLORS = ["#2563eb", "#6366f1", "#10b981", "#f43f5e"];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Admin Overview</h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>System-wide performance metrics and usage analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 flex flex-col gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 shadow-sm`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-soft)" }}>{stat.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--text)" }}>{stat.value}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                 <TrendingUp size={12} />
                 <span>+12.5% vs last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Graph Card */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <div>
              <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>Domain-wise Query Distribution</h3>
              <p className="text-xs font-medium" style={{ color: "var(--text-soft)" }}>Distribution of user queries across the four strategic domains.</p>
           </div>
           <select className="input h-9 px-3 w-auto text-xs font-bold">
              <option>Past 30 Days</option>
              <option>Past 7 Days</option>
              <option>All Time</option>
           </select>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adminDomainStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="domain" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "var(--text-soft)", fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "var(--text-soft)", fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: "var(--surface-2)", radius: 10 }}
                contentStyle={{ 
                  backgroundColor: "var(--surface)", 
                  borderColor: "var(--border)",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-lg)",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              />
              <Bar dataKey="queries" radius={[10, 10, 0, 0]} barSize={60}>
                {adminDomainStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
