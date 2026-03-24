import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import AdminDecisionsPage from "./pages/AdminDecisionsPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminToolsPage from "./pages/AdminToolsPage";
import ChatbotPage from "./pages/ChatbotPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [users, setUsers] = useState([
    { name: "System Admin", email: "admin@intellichoice.ai", password: "admin123", role: "admin" },
    { name: "Demo User", email: "user@intellichoice.ai", password: "user123", role: "user" },
  ]);
  const [role, setRole] = useState("user");
  const [activeTab, setActiveTab] = useState("Dashboard");

  if (!isAuthenticated)
    return (
      <LoginPage
        authError={authError}
        onLogin={({ email, password }) => {
          const matchedUser = users.find((user) => user.email === email && user.password === password);
          if (!matchedUser) {
            setAuthError("Invalid credentials. Please try again.");
            return;
          }
          setAuthError("");
          setRole(matchedUser.role);
          setActiveTab("Dashboard");
          setIsAuthenticated(true);
        }}
        onRegister={({ email, password }) => {
          const exists = users.some((user) => user.email === email);
          if (exists) {
            setAuthError("Email already exists. Please use login.");
            return;
          }
          const newUser = { name: "Registered User", email, password, role: "user" };
          setUsers((prev) => [...prev, newUser]);
          setAuthError("");
          setRole("user");
          setIsAuthenticated(true);
        }}
        onGoogleLogin={() => {
          setAuthError("");
          setRole("user");
          setIsAuthenticated(true);
        }}
      />
    );

  if (role === "user") {
    return (
      <main className="min-h-screen p-4 md:p-6">
        <ChatbotPage
          onLogout={() => {
            setIsAuthenticated(false);
            setRole("user");
            setAuthError("");
          }}
        />
      </main>
    );
  }

  const renderAdminContent = () => {
    if (activeTab === "Dashboard") return <DashboardPage />;
    if (activeTab === "Decisions") return <AdminDecisionsPage />;
    if (activeTab === "History") return <AdminHistoryPage />;
    if (activeTab === "Tools") return <AdminToolsPage />;
    return <AdminSettingsPage />;
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="w-full p-4 md:p-6">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIsAuthenticated(false);
              setRole("user");
              setAuthError("");
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
        {renderAdminContent()}
      </main>
    </div>
  );
}

export default App;
