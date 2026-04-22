import { createContext, useContext, useState, useCallback } from "react";
import { seedArchive } from "../data/dummyData";

const AppContext = createContext(null);

const SEED_USERS = [
  { id: "admin-1", name: "System Admin", email: "admin@intellichoice.ai", password: "admin123", role: "admin", queryCount: 0 },
  { id: "user-1",  name: "Demo User",   email: "user@intellichoice.ai",  password: "user123",  role: "user", domain: "Career", queryCount: 2 },
];

export function AppProvider({ children }) {
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [archives, setArchives] = useState({ "user-1": seedArchive });

  // ── Auth ─────────────────────────────────────────────────
  const login = useCallback(({ email, password }) => {
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      setAuthError("Invalid email or password. Please try again.");
      return false;
    }
    setAuthError("");
    setCurrentUser({ ...found });
    return true;
  }, [users]);

  const register = useCallback(({ name, email, password }) => {
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setAuthError("An account with this email already exists.");
      return false;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user",
      domain: null,
      queryCount: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    setArchives((prev) => ({ ...prev, [newUser.id]: [] }));
    setAuthError("");
    setCurrentUser({ ...newUser });
    return true;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthError("");
  }, []);

  // ── Domain Selection ─────────────────────────────────────
  const selectDomain = useCallback((domain) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, domain };
      setUsers((us) => us.map((u) => (u.id === prev.id ? { ...u, domain } : u)));
      return updated;
    });
  }, []);

  // ── Archive ──────────────────────────────────────────────
  const addArchiveEntry = useCallback((entry) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, queryCount: (prev.queryCount || 0) + 1 };
      setUsers((us) => us.map((u) => u.id === prev.id ? { ...u, queryCount: updated.queryCount } : u));
      setArchives((arc) => ({
        ...arc,
        [prev.id]: [
          { ...entry, id: `arc-${Date.now()}`, date: new Date().toLocaleString() },
          ...(arc[prev.id] || []),
        ],
      }));
      return updated;
    });
  }, []);

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
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, users, authError, setAuthError,
      login, register, logout,
      selectDomain,
      addArchiveEntry, getUserArchive,
      updateProfile,
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
