import React from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cn } from "../../lib/utils";

function SimulationCard({ simulation }) {
  if (!simulation) return null;

  const items = [
    {
      label: "Best Case",
      value: simulation.best_case,
      icon: <TrendingUp size={16} />,
      color: "from-emerald-50 to-white",
      border: "border-emerald-100",
      text: "text-emerald-700",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Worst Case",
      value: simulation.worst_case,
      icon: <TrendingDown size={16} />,
      color: "from-rose-50 to-white",
      border: "border-rose-100",
      text: "text-rose-700",
      iconBg: "bg-rose-100 text-rose-600",
    },
    {
      label: "Timeline",
      value: simulation.timeline,
      icon: <Clock size={16} />,
      color: "from-sky-50 to-white",
      border: "border-sky-100",
      text: "text-sky-700",
      iconBg: "bg-sky-100 text-sky-600",
    },
  ];

  return (
    <div className="mt-8">
      <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Future Projections</h4>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={cn(
              "group relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all duration-300 bg-gradient-to-br hover:shadow-md hover:-translate-y-1",
              item.color,
              item.border
            )}
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
              item.iconBg
            )}>
              {item.icon}
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-80", item.text)}>
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimulationCard;
