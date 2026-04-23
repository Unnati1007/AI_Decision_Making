import { Briefcase, TrendingUp, Scale, Heart, LayoutDashboard, MessageSquareText, History } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DOMAINS } from "../data/dummyData";
import { cn } from "../lib/utils";

export default function UserDashboard({ onTabChange }) {
  const { currentUser, selectDomain, getUserArchive } = useApp();

  const handleDomainSelect = (domainKey) => {
    selectDomain(domainKey);
    onTabChange("Chat");
  };

  const domainList = Object.values(DOMAINS);
  const archives = getUserArchive(currentUser?.id);
  
  let lastActivityDate = "No Activity";
  if (archives?.length > 0) {
    const rawDate = archives[0].date;
    // Extract just the date part, handling both comma-separated and space-separated formats
    lastActivityDate = rawDate.includes(",") ? rawDate.split(",")[0] : rawDate.split(" ")[0];
  }

  const stats = [
    { label: "Total Queries", value: currentUser?.queryCount || 0, icon: MessageSquareText, color: "blue" },
    { label: "Selected Domain", value: currentUser?.domain || "None", icon: LayoutDashboard, color: "indigo" },
    { label: "Last Activity", value: lastActivityDate, icon: History, color: "emerald" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          Welcome back, {currentUser?.name ? currentUser.name.split(" ")[0] : "User"}
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Select a domain to start a new AI-guided decision session.
        </p>
      </div>

      {/* Mini Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-soft)" }}>{stat.label}</p>
              <p className="text-base font-bold" style={{ color: "var(--text)" }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Domain Selection */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-soft)" }}>
          Available Decision Domains
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {domainList.map((domain) => {
            const Icon = { Briefcase, TrendingUp, Scale, Heart }[domain.icon];
            const isSelected = currentUser?.domain === domain.key;

            return (
              <button
                key={domain.key}
                onClick={() => handleDomainSelect(domain.key)}
                className={cn(
                  "card group relative flex flex-col items-start p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg",
                  isSelected && "border-blue-500 ring-1 ring-blue-500/50"
                )}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-${domain.color}-50 dark:bg-${domain.color}-500/10 text-${domain.color}-600 dark:text-${domain.color}-400 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{domain.label}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {domain.description}
                </p>
                <div className="mt-6 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Enter Domain <span className="ml-1">→</span>
                </div>
                
                {isSelected && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div className="card bg-blue-600 p-6 text-white overflow-hidden relative">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-md">
            <h3 className="font-bold">Pro Tip: Domain Specificity</h3>
            <p className="mt-1 text-sm text-blue-100 opacity-90">
              The AI agent is optimized for each domain. For the best insights, ensure your queries match the selected category context.
            </p>
          </div>
          <button 
            onClick={() => handleDomainSelect(currentUser?.domain || "Career")}
            className="btn bg-white text-blue-600 hover:bg-blue-50 shrink-0 shadow-lg shadow-blue-900/20"
          >
            Start Chatting
          </button>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute right-12 -bottom-12 h-24 w-24 rounded-full bg-blue-400/20" />
      </div>
    </div>
  );
}
