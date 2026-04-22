import React from "react";
import { Sparkles } from "lucide-react";

function EmptyState({ onSelectSuggestion }) {
  const suggestions = [
    "Should I do an MBA or join a startup?",
    "Investment: Real Estate vs Index Funds",
    "Switch to Corporate from Freelancing?",
    "Lifestyle: Intermittent Fasting vs traditional meals",
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-scale-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-xl shadow-blue-200 text-white mb-6">
        <Sparkles size={32} />
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
        Intelligent Decision Support
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
        Ask me anything to get a high-fidelity simulation of your decision outcomes, risks, and reasoning.
      </p>

      <div className="mt-10 w-full max-w-md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
          Try a reasoning session
        </p>
        <div className="grid gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion(suggestion)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 transition-all hover:border-blue-600 hover:bg-blue-50/50 hover:text-blue-700 hover:translate-x-1"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
