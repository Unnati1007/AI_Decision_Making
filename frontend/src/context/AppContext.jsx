import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { seedArchive } from "../data/dummyData";

const AppContext = createContext(null);
const API_BASE = "http://localhost:8000/admin";

const DEFAULT_USERS = [
  { id: "admin-1", name: "System Admin", email: "admin@intellichoice.ai", password: "admin123", role: "admin", queryCount: 0, joined: "2026-04-20", status: "Active" },
  { id: "user-1",  name: "Demo User",   email: "user@intellichoice.ai",  password: "user123",  role: "user", domain: "Career", queryCount: 2, joined: "2026-04-22", status: "Active" },
];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [archives, setArchives] = useState({ "user-1": seedArchive });
  const [auditLogs, setAuditLogs] = useState([]);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalQueries: 0,
    activeSessions: 0,
    flaggedItems: 0
  });

  const fetchUsers = useCallback(async () => {
    try {
      const uRes = await fetch(`${API_BASE}/users`);
      const uData = await uRes.json();
      if (uData && uData.length > 0) setUsers(uData);
    } catch (err) {
      console.error("User fetch failed");
    }
  }, []);

  const addAuditLog = useCallback(async (action, severity, user) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      user: user || "system",
      action,
      timestamp: new Date().toLocaleString(),
      severity
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
    
    try {
      await fetch(`${API_BASE}/audit-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error("Log sync failed");
    }
  }, []);

  const updateUserData = useCallback(async (userId, data) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const updatedUser = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      addAuditLog(`User data updated: ${updatedUser.email}`, "Medium", currentUser?.email);
    } catch (err) {
      console.error("Update failed");
    }
  }, [currentUser, addAuditLog]);

  const toggleUserStatus = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === "Blocked" ? "Active" : "Blocked";
    updateUserData(userId, { status: newStatus });
  }, [users, updateUserData]);

  // ── Auth ─────────────────────────────────────────────────
  const login = useCallback(({ email, password }) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!found) {
      setAuthError("Invalid email or password. Please try again.");
      addAuditLog("Failed login attempt", "Medium", email);
      return false;
    }
    
    if (found.status === "Blocked") {
      setAuthError("Your account has been blocked by the administrator.");
      addAuditLog("Blocked user attempted login", "High", email);
      return false;
    }
    
    setAuthError("");
    setCurrentUser({ ...found });
    addAuditLog("Session started", "Low", email);
    return true;
  }, [users, addAuditLog]);

  const register = useCallback(async ({ name, email, password }) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
      domain: null,
      queryCount: 0,
      joined: new Date().toISOString().split("T")[0],
      status: "Active"
    };

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      
      if (!res.ok) {
        const err = await res.json();
        setAuthError(err.detail || "Registration failed");
        return false;
      }

      await fetchUsers();
      setAuthError("");
      setCurrentUser({ ...newUser });
      addAuditLog("New user registered", "Low", email);
      return true;
    } catch (err) {
      setAuthError("Network error during registration");
      return false;
    }
  }, [fetchUsers, addAuditLog]);

  const googleAuth = useCallback(async ({ name, email }) => {
    await fetchUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (found) {
      if (found.status === "Blocked") {
        setAuthError("Your account has been blocked by the administrator.");
        addAuditLog("Blocked user attempted Google login", "High", email);
        return false;
      }
      setAuthError("");
      setCurrentUser({ ...found });
      addAuditLog("Session started via Google", "Low", email);
      return true;
    } else {
      const newUser = {
        id: `google-${Date.now()}`,
        name,
        email,
        password: "", // No password for Google auth users
        role: "user",
        domain: null,
        queryCount: 0,
        joined: new Date().toISOString().split("T")[0],
        status: "Active"
      };

      try {
        await fetch(`${API_BASE}/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser)
        });
        await fetchUsers();
        setAuthError("");
        setCurrentUser({ ...newUser });
        addAuditLog("New user registered via Google", "Low", email);
        return true;
      } catch (err) {
        setAuthError("Google registration failed");
        return false;
      }
    }
  }, [users, fetchUsers, addAuditLog]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      fetchUsers(); // Non-blocking
      
      try {
        fetch(`${API_BASE}/stats`)
          .then(res => res.json())
          .then(data => setAdminStats(data))
          .catch(() => {});

        fetch(`${API_BASE}/audit-logs`)
          .then(res => res.json())
          .then(data => setAuditLogs(data))
          .catch(() => {});
      } catch (err) {
        console.error("Initial fetch failed");
      }
    };
    fetchData();
  }, [fetchUsers]);

  // Polling for real-time updates (for Admin)
  useEffect(() => {
    if (currentUser?.role !== "admin") return;

    const interval = setInterval(() => {
      fetchUsers();
      // Fetch stats
      fetch(`${API_BASE}/stats`)
        .then(res => res.json())
        .then(data => setAdminStats(data))
        .catch(() => {});
        
      // Also fetch logs
      fetch(`${API_BASE}/audit-logs`)
        .then(res => res.json())
        .then(data => setAuditLogs(data))
        .catch(() => {});
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser, fetchUsers]);

  const logout = useCallback(() => {
    if (currentUser) {
      addAuditLog("Session ended", "Low", currentUser.email);
    }
    setCurrentUser(null);
    setAuthError("");
  }, [currentUser, addAuditLog]);

  // ── Domain Selection ─────────────────────────────────────
  const selectDomain = useCallback((domain) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, domain } : prev);
    setUsers(us => us.map(u => u.id === currentUser.id ? { ...u, domain } : u));
    updateUserData(currentUser.id, { domain });
    addAuditLog(`Selected domain: ${domain}`, "Low", currentUser.email);
  }, [currentUser, updateUserData, addAuditLog]);

  // ── Archive ──────────────────────────────────────────────
  const addArchiveEntry = useCallback((entry) => {
    if (!currentUser) return;
    
    const newQueryCount = (currentUser.queryCount || 0) + 1;
    
    // 1. Update State
    setCurrentUser(prev => prev ? { ...prev, queryCount: newQueryCount } : prev);
    setUsers(us => us.map(u => u.id === currentUser.id ? { ...u, queryCount: newQueryCount } : u));
    setArchives(arc => ({
      ...arc,
      [currentUser.id]: [
        { ...entry, id: `arc-${Date.now()}`, date: new Date().toLocaleString() },
        ...(arc[currentUser.id] || []),
      ],
    }));

    // 2. Perform Side Effects
    updateUserData(currentUser.id, { queryCount: newQueryCount });
    addAuditLog(`Generated AI recommendation (${entry.category})`, "Low", currentUser.email);
  }, [currentUser, updateUserData, addAuditLog]);

  const getUserArchive = useCallback((userId) => {
    return archives[userId] || [];
  }, [archives]);

  // ── Profile Update ───────────────────────────────────────
  const updateProfile = useCallback(({ name, email, password }) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(password ? { password } : {}),
      };
      setUsers((us) => us.map((u) => (u.id === prev.id ? { ...u, ...updated } : u)));
      addAuditLog("Profile updated", "Medium", updated.email);
      return updated;
    });
  }, [addAuditLog]);

  return (
    <AppContext.Provider value={{
      currentUser, users, authError, setAuthError,
      login, register, googleAuth, logout,
      selectDomain,
      addArchiveEntry, getUserArchive,
      updateProfile,
      toggleUserStatus, updateUserData,
      auditLogs, addAuditLog, adminStats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
