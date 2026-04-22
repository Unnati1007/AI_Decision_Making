import { useState, useEffect } from "react";
import { useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import UserDashboard from "./pages/UserDashboard";
import ChatPage from "./pages/ChatbotPage"; // Note: file is named ChatbotPage.jsx but plan calls it ChatPage
import ArchivePage from "./pages/ArchivePage";
import UserSettingsPage from "./pages/UserSettingsPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAuditPage from "./pages/AdminAuditPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";

export default function App() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Redirect to Dashboard on login
  useEffect(() => {
    if (currentUser) {
      setActiveTab("Dashboard");
    }
  }, [currentUser?.id]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const isAdmin = currentUser.role === "admin";

  const renderContent = () => {
    if (activeTab === "Dashboard") {
      return isAdmin ? <AdminDashboard /> : <UserDashboard onTabChange={setActiveTab} />;
    }
    if (activeTab === "Chat" || activeTab === "Decisions") {
      return <ChatPage />;
    }
    if (activeTab === "Archive") {
      return <ArchivePage />;
    }
    if (activeTab === "Users" && isAdmin) {
      return <AdminUsersPage />;
    }
    if (activeTab === "Audit" && isAdmin) {
      return <AdminAuditPage />;
    }
    if (activeTab === "Settings") {
      return isAdmin ? <AdminSettingsPage /> : <UserSettingsPage />;
    }
    
    // Default fallback
    return isAdmin ? <AdminDashboard /> : <UserDashboard onTabChange={setActiveTab} />;
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg)] transition-colors duration-300 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="relative flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
        {/* Background Decorative Grid */}
        <div className="fixed right-0 top-0 -z-10 h-full w-full bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

        <div className="mx-auto max-w-7xl pb-12">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
