import React from "react";
import { cn } from "../../lib/utils";

function DashboardCard({ label, value, hint, icon: Icon, trend }) {
  return (
    <article className="group rounded-[2rem] border border-slate-100 bg-white p-6 shadow-premium transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          
          <div className="mt-4 flex items-center gap-2">
            {trend && (
               <span className={cn(
                 "rounded-full px-2 py-0.5 text-[10px] font-bold",
                 trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
               )}>
                 {trend}
               </span>
            )}
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">{hint}</p>
          </div>
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200">
            <Icon size={24} />
          </div>
        )}
      </div>
    </article>
  );
}

export default DashboardCard;
