import { useState } from "react";
import { Search, MoreVertical, Ban, ClipboardEdit, CheckCircle, ShieldAlert, Mail, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";

export default function AdminUsersPage() {
  const { users, toggleUserStatus, updateUserData } = useApp();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: "", email: "" });

  const filtered = users.filter(u => u.role !== "admin" && (
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  ));

  const startEdit = (user) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateUserData(editingUser.id, editFormData);
    setEditingUser(null);
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>User Management</h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Control access and monitor individual account activity.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-500/20">
           <CheckCircle size={14} />
           {users.filter(u => u.role !== "admin" && u.status === "Active").length} ACTIVE NODES
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" size={18} />
        <input 
          type="text"
          placeholder="Filter users by name, email or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-12 h-12 bg-[var(--surface)]"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">User Identity</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Active Domain</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Usage</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Security Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--surface-2)]/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 font-bold text-sm uppercase">
                        {user.name ? user.name[0].toUpperCase() : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{user.name}</p>
                        <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-soft)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="badge bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-bold uppercase">
                       {user.domain || "NONE"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                       <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{user.queryCount || 0} Queries</p>
                       <p className="text-[10px] font-medium" style={{ color: "var(--text-soft)" }}>Joined {user.joined}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      user.status === "Active" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"
                    )}>
                      <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", user.status === "Active" ? "bg-emerald-500" : "bg-red-500")} />
                      {user.status}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className="btn btn-ghost h-8 px-2.5 text-xs border-none hover:bg-red-50 hover:text-red-600" 
                        title={user.status === "Active" ? "Block Access" : "Unblock Access"}
                      >
                        <Ban size={14} />
                      </button>
                      <button 
                        onClick={() => startEdit(user)}
                        className="btn btn-ghost h-8 px-2.5 text-xs border-none hover:bg-blue-50 hover:text-blue-600" 
                        title="Edit User"
                      >
                        <ClipboardEdit size={14} />
                      </button>
                      <button className="btn btn-ghost h-8 px-2.5 text-xs border-none" title="Contact User">
                        <Mail size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Edit User Profile</h2>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-[var(--surface-2)] rounded-full transition-colors">
                <X size={20} className="text-[var(--text-soft)]" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="input bg-[var(--surface-2)] border-[var(--border)]"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-soft)]">Email Address</label>
                <input 
                  type="email" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="input bg-[var(--surface-2)] border-[var(--border)]"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="btn btn-ghost flex-1 text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1 text-xs font-bold shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
