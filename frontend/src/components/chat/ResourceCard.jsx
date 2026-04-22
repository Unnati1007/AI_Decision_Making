import React from "react";
import { ExternalLink } from "lucide-react";

function ResourceCard({ title, description, citation }) {
  return (
    <article className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-2 text-sm font-medium text-slate-600 leading-relaxed">{description}</p>
        </div>
        <a
          href={citation}
          target="_blank"
          rel="noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all group-hover:bg-blue-600 group-hover:text-white"
        >
          <ExternalLink size={14} />
        </a>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-blue-600" />
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest italic">Source Verified</span>
      </div>
    </article>
  );
}

export default ResourceCard;
