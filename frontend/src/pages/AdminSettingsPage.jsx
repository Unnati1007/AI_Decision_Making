import { useState } from "react";
import { User, Mail, Lock, ShieldCheck, CheckCircle2, Save, Terminal, Globe } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AdminSettingsPage() {
  const { currentUser, updateProfile } = useApp();
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: currentUser?.name || "System Admin",
    email: currentUser?.email || "admin@intellichoice.ai",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (success) setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSuccess("Administrative credentials updated successfully.");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Admin Settings</h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Configure global system parameters and admin account security.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-scale-in">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Admin Identity */}
      <div className="card p-8 space-y-8">
        <div className="flex items-center gap-4 py-2 border-b border-[var(--border)]">
             <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Core Administrative Identity</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Admin Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input pl-10 h-12" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Email Point of Contact</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input pl-10 h-12" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Secure Root Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Unchanged"
                className="input pl-10 h-12" 
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-[var(--border)]">
             <div className="flex items-center gap-2 text-[var(--text-soft)]">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Security Level: Maximum</span>
             </div>
             <button type="submit" className="btn btn-primary h-12 px-10">
               <Save size={18} />
               Verify & Save
             </button>
          </div>
        </form>
      </div>

      {/* System Config Snippet */}
      <div className="card p-8 bg-[var(--surface-2)]">
         <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-soft)] mb-4">Environment Status</h3>
         <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
               <div className="flex items-center gap-2">
                  <Globe size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Production Global</span>
               </div>
               <span className="text-[10px] font-black text-emerald-600">STABLE</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
               <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-blue-500" />
                  <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Reasoning Engine</span>
               </div>
               <span className="text-[10px] font-black text-blue-600">v2.4.128</span>
            </div>
         </div>
      </div>
    </div>
  );
}
