import { auditLogs } from "../data/dummyData";
import { Shield, Clock, User, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function AdminAuditPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Audit Log</h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Immutable record of system activities and security events.</p>
      </div>

      {/* Log Feed */}
      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">System Compliance Feed</span>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)]">
                {auditLogs.length} EVENTS RECORDED
            </span>
        </div>

        <div className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {auditLogs.map((log) => {
            const SeverityIcon = {
              High: AlertCircle,
              Medium: AlertTriangle,
              Low: Info
            }[log.severity];

            return (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 hover:bg-[var(--surface-2)]/30 transition-colors">
                <div className="flex items-center gap-4 min-w-[200px] shrink-0">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    log.severity === "High" ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" :
                    log.severity === "Medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" :
                    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  )}>
                    <SeverityIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                       <User size={12} className="text-[var(--text-soft)]" />
                       <p className="text-xs font-bold leading-none" style={{ color: "var(--text)" }}>{log.user}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                       <Clock size={12} className="text-[var(--text-soft)]" />
                       <p className="text-[10px] font-bold text-[var(--text-soft)] uppercase tracking-wider">{log.timestamp}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {log.action}
                  </p>
                </div>

                <div className="shrink-0">
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    log.severity === "High" ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/30" :
                    log.severity === "Medium" ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/30" :
                    "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/30"
                  )}>
                    {log.severity} RISK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center pt-4">
          <button className="btn btn-ghost text-xs font-bold px-8 h-10">Load Performance History</button>
      </div>
    </div>
  );
}
