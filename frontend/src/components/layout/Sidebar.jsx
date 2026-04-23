import { useState } from "react";
import {
  LayoutDashboard, MessageSquareText, Archive,
  Settings, LogOut, ShieldCheck, Users, ClipboardList,
  Brain, ChevronLeft, ChevronRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import ThemeToggle from "./ThemeToggle";
import { cn } from "../../lib/utils";

const userNav = [
  { id: "Dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { id: "Chat",       label: "Agent Chat",  icon: MessageSquareText },
  { id: "Archive",    label: "Archive",     icon: Archive },
  { id: "Settings",   label: "Settings",    icon: Settings },
];

const adminNav = [
  { id: "Dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { id: "Users",      label: "Users",       icon: Users },
  { id: "Audit",      label: "Audit Log",   icon: ClipboardList },
  { id: "Settings",   label: "Settings",    icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }) {
  const { currentUser, logout } = useApp();
  const isAdmin = currentUser?.role === "admin";
  const navItems = isAdmin ? adminNav : userNav;
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn("hidden shrink-0 flex-col border-r transition-all duration-300 lg:flex relative", isCollapsed ? "w-20" : "w-60")}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] shadow-sm z-10 transition-colors"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={cn("flex items-center pt-6 pb-5", isCollapsed ? "justify-center px-0" : "gap-3 px-5")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <Brain size={20} />
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold leading-none truncate" style={{ color: "var(--text)" }}>IntelliChoice</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5 truncate" style={{ color: "var(--text-soft)" }}>
              {isAdmin ? "Admin Console" : "AI Advisor"}
            </p>
          </div>
        )}
      </div>

      {/* Badge */}
      {currentUser?.domain && !isAdmin && (
        isCollapsed ? (
          <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shadow-sm" style={{ background: "var(--primary-soft)", color: "var(--primary)" }} title={currentUser.domain}>
            {currentUser.domain.substring(0, 2).toUpperCase()}
          </div>
        ) : (
          <div className="mx-4 mb-3 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
            Domain: <span className="font-bold">{currentUser.domain}</span>
          </div>
        )
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {!isCollapsed && (
          <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-soft)" }}>
            Navigation
          </p>
        )}
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              title={isCollapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200",
                isCollapsed ? "justify-center p-2.5 mx-auto w-10" : "w-full gap-3 px-3 py-2.5 text-sm font-semibold",
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={17} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("pb-5 pt-4 space-y-3", isCollapsed ? "px-2" : "px-3")} style={{ borderTop: "1px solid var(--border)" }}>
        {/* User info */}
        <div className={cn("flex items-center rounded-xl", isCollapsed ? "justify-center p-2 mx-auto w-10" : "gap-2.5 px-3 py-2")} style={{ background: "var(--surface-2)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 text-sm font-bold">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : "?"}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold" style={{ color: "var(--text)" }}>{currentUser?.name || "Guest User"}</p>
              <p className="truncate text-[10px]" style={{ color: "var(--text-soft)" }}>{currentUser?.email || "No email"}</p>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3" : "justify-between px-1")}>
          <ThemeToggle className={isCollapsed ? "mx-auto w-10 h-10" : ""} />
          <button
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center rounded-xl transition-all hover:bg-red-50 hover:text-red-600 border border-transparent",
              isCollapsed ? "justify-center p-2 h-10 w-10 mx-auto bg-[var(--surface)] hover:border-red-200" : "gap-1.5 px-3 py-2 text-xs font-semibold"
            )}
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={isCollapsed ? 16 : 14} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
