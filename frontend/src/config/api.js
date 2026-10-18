// ============================================================
// IntelliChoice — Centralized Frontend API Configuration
// ============================================================

export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://ai-decision-making.onrender.com";
  }
  return "";
};

export const API_BASE_URL = getBackendBaseUrl();
export const API_QUERY_ENDPOINT = `${API_BASE_URL}/api/query`;
export const API_ADMIN_ENDPOINT = `${API_BASE_URL}/admin`;
