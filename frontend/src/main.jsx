import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import "./index.css";

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Google Client ID

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
