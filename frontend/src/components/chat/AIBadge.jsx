import React from "react";
import { ShieldCheck, Lock, Zap, BrainCircuit } from "lucide-react";
import { cn } from "../../lib/utils";

function AIBadge({ type, label, score }) {
  const configs = {
    security: {
      icon: <ShieldCheck size={12} />,
      base: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    safety: {
      icon: <Lock size={12} />,
      base: "bg-blue-50 text-blue-700 border-blue-200",
    },
    relevance: {
      icon: <Zap size={12} />,
      base: "bg-amber-50 text-amber-700 border-amber-200",
    },
    confidence: {
      icon: <BrainCircuit size={12} />,
      base: "bg-indigo-50 text-indigo-700 border-indigo-200",
    }
  };

  const config = configs[type] || configs.security;

  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
      config.base
    )}>
      {config.icon}
      <span>{label}</span>
      {score && <span className="ml-0.5 opacity-60">| {score}</span>}
    </div>
  );
}

export default AIBadge;
