import React from "react";
import DashboardCard from "../components/dashboard/DashboardCard";
import ChartComponent from "../components/dashboard/ChartComponent";
import { 
  dashboardStats, 
  userDecisionTraffic, 
  userCategoryDistribution 
} from "../data/dummyData";
import { BrainCircuit, Target, TrendingUp, ShieldAlert } from "lucide-react";

function DashboardPage() {
  const iconMap = {
    "Total Decisions": BrainCircuit,
    "Success Rate": Target,
    "Active Domain": TrendingUp,
    "Risk Mitigation": ShieldAlert
  };

  return (
    <div className="space-y-8 animate-fade-in p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          System Analytics
        </h1>
        <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">
          Comprehensive overview of localized AI decision simulations and system performance metrics for the current session.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardCard 
            key={stat.label} 
            {...stat} 
            icon={iconMap[stat.label]} 
            trend={stat.label === "Success Rate" ? "+2.4%" : (stat.label === "Total Decisions" ? "+12" : null)}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartComponent type="line" data={userDecisionTraffic} />
        <ChartComponent type="pie" data={userCategoryDistribution} />
      </div>

      {/* Recent Activity Mini-Section */}
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-premium">
        <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual Learning Progress</h3>
        <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
                <p className="text-sm font-bold text-slate-800">Domain Calibration</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-blue-600 rounded-full" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">85% Complete</p>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-bold text-slate-800">Risk Model Synergy</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[62%] bg-indigo-500 rounded-full" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">62% Optimized</p>
            </div>
            <div className="space-y-2">
                <p className="text-sm font-bold text-slate-800">Simulation Depth</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-cyan-500 rounded-full" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">94% Capacity</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
