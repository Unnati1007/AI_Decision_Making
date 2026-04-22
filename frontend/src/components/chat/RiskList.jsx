import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "../../lib/utils";

function RiskList({ risks }) {
  if (!risks || risks.length === 0) return null;

  return (
    <div className="mt-8 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-1 bg-rose-500 rounded-full" />
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Critical Risk Profile</h4>
      </div>
      
      <div className="grid gap-3">
        {risks.map((risk, idx) => (
          <div 
            key={idx} 
            className="group flex items-start gap-4 rounded-[1.5rem] border border-rose-100 bg-gradient-to-r from-rose-50/50 to-white px-5 py-4 transition-all hover:border-rose-300 hover:shadow-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm transition-transform group-hover:scale-110">
              <ShieldAlert size={18} />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-rose-400">Risk Factor #{idx + 1}</span>
                <p className="mt-0.5 text-sm font-semibold text-rose-900 leading-relaxed">
                  {risk}
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskList;
