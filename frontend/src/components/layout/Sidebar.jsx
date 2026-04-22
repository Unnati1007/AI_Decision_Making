import {
  LayoutDashboard, MessageSquareText, Archive,
  Settings, LogOut, ShieldCheck, Users, ClipboardList,
  Brain,
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

  return (
    <aside
      className="hidden w-60 shrink-0 flex-col border-r transition-colors duration-300 lg:flex"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
          <Brain size={20} />
        </div>
        <div>
          <p className="text-sm font-bold leading-none" style={{ color: "var(--text)" }}>IntelliChoice</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--text-soft)" }}>
            {isAdmin ? "Admin Console" : "AI Advisor"}
          </p>
        </div>
      </div>

      {/* Badge */}
      {currentUser?.domain && !isAdmin && (
        <div className="mx-4 mb-3 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
          Domain: <span className="font-bold">{currentUser.domain}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-soft)" }}>
          Navigation
        </p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-4 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
        {/* User info */}
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ background: "var(--surface-2)" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 text-sm font-bold">
            {currentUser?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold" style={{ color: "var(--text)" }}>{currentUser?.name}</p>
            <p className="truncate text-[10px]" style={{ color: "var(--text-soft)" }}>{currentUser?.email}</p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between px-1">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:bg-red-50 hover:text-red-600"
            style={{ color: "var(--text-muted)" }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
