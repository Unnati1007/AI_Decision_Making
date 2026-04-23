import { useState } from "react";
import { User, Mail, Lock, ShieldCheck, CheckCircle2, Save, Trash2, Camera } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function UserSettingsPage() {
  const { currentUser, updateProfile } = useApp();
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (success) setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setSuccess("Profile settings updated successfully.");
    setTimeout(() => setSuccess(""), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Profile Settings</h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Manage your account identity and security preferences.</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-scale-in">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-8 space-y-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-white text-3xl font-black shadow-lg shadow-blue-500/20">
              {currentUser?.name?.[0]?.toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-blue-600 shadow-sm transition-colors opacity-0 group-hover:opacity-100">
               <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{currentUser?.name}</h3>
            <p className="text-sm font-medium" style={{ color: "var(--text-soft)" }}>Role: <span className="text-blue-600 uppercase tracking-widest text-[10px] font-black ml-1">{currentUser?.role}</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input !pl-10" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input !pl-10" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">New Password (optional)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                className="input !pl-10" 
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-4 border-t border-[var(--border)]">
             <div className="flex items-center gap-2 text-[var(--text-soft)]">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Settings</span>
             </div>
             <button type="submit" className="btn btn-primary h-11 px-8">
               <Save size={18} />
               Save Changes
             </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-100 dark:border-red-900/30 p-8 space-y-4">
         <div className="space-y-1">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Danger Zone</h3>
            <p className="text-xs font-medium text-[var(--text-muted)]">Once you delete your account, there is no going back. Please be certain.</p>
         </div>
         <button className="btn btn-danger h-10 text-xs font-bold px-6">
            <Trash2 size={14} className="mr-2" />
            Delete Account
         </button>
      </div>
    </div>
  );
}
