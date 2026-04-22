import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "../../lib/utils";

function RecommendationCard({ recommendation, reasoning }) {
  if (!recommendation) return null;

  return (
    <article className="animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-1 bg-blue-600 rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Recommendation Report</h3>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 shadow-glow-blue">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {recommendation}
            </h2>
            <div className="mt-4 space-y-3">
              {Array.isArray(reasoning) ? (
                reasoning.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed">{reasoning}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RecommendationCard;
