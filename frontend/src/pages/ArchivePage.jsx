import { useState } from "react";
import { Search, Calendar, ChevronDown, ChevronUp, ExternalLink, MessageSquare, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";

export default function ArchivePage() {
  const { getUserArchive, currentUser } = useApp();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const archive = getUserArchive(currentUser?.id);
  const filtered = archive.filter(item => 
    item.query.toLowerCase().includes(search.toLowerCase()) ||
    item.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-up h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Decision Archive</h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Browse your history of AI-guided strategic consultations.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" size={18} />
        <input 
          type="text"
          placeholder="Filter by query or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-12 h-12 bg-[var(--surface)]"
        />
      </div>

      {/* List */}
      <div className="flex-1 space-y-4">
        {filtered.length === 0 ? (
          <div className="card p-12 text-center space-y-3">
             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text-soft)]">
                <Search size={24} />
             </div>
             <p className="text-sm font-bold text-[var(--text-muted)]">No historical data found matching your search.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="card overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="min-w-0 pr-4 space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="badge bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none">{item.domain}</span>
                      <div className="flex items-center gap-1 text-[var(--text-soft)]">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{item.date}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold truncate leading-tight mt-1" style={{ color: "var(--text)" }}>{item.query}</h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                       <p className="text-[10px] font-black uppercase text-[var(--text-soft)]">CONSULTATION ID</p>
                       <p className="text-[11px] font-bold text-[var(--text-muted)]">{item.id}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-[var(--text-soft)]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[var(--border)] p-6 bg-[var(--surface-2)]/30 animate-fade-up">
                    <div className="grid gap-6 md:grid-cols-2">
                       <div className="space-y-4">
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Final Recommendation</h4>
                             <div className="card bg-[var(--surface)] p-4 text-sm font-bold leading-relaxed border-blue-100 dark:border-blue-900">
                                {item.response.recommendation}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)] mb-2">Strategic Reasoning</h4>
                             <ul className="space-y-2">
                                {item.response.reasoning.map((r, i) => (
                                  <li key={i} className="text-xs font-semibold text-[var(--text-muted)] flex gap-2">
                                     <span className="text-blue-500">•</span> {r}
                                  </li>
                                ))}
                             </ul>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="card p-4 bg-[var(--surface)] space-y-3">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500">Risk Assessment</h4>
                             <div className="flex flex-wrap gap-1.5">
                                {item.response.risks.map((r, i) => (
                                  <span key={i} className="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 text-[10px] font-bold">{r}</span>
                                ))}
                             </div>
                          </div>
                          <div className="card p-4 bg-[var(--surface)] space-y-2">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Impact Projection</h4>
                             <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{item.response.simulation.best_case}</p>
                             <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-soft)]">
                                <Clock size={12} />
                                <span>Estimated Horizon: {item.response.simulation.timeline}</span>
                             </div>
                          </div>

                          {item.response.resources && item.response.resources.length > 0 && (
                            <div className="card p-4 bg-[var(--surface)] space-y-4">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Recommended Resources</h4>
                               <div className="grid gap-2">
                                  {item.response.resources.map((res, i) => (
                                     <a 
                                       key={i} 
                                       href={res.url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="group flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-2)] border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-[var(--surface-2)] transition-all duration-300"
                                     >
                                        <div className="flex items-center gap-2 min-w-0">
                                           <ExternalLink size={12} className="text-blue-500 shrink-0" />
                                           <span className="text-[11px] font-bold text-[var(--text)] truncate">{res.title}</span>
                                        </div>
                                        <ChevronRight size={12} className="text-[var(--text-soft)] group-hover:text-blue-500 transition-colors" />
                                     </a>
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
