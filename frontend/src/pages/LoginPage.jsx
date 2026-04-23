import { useState } from "react";
import { LogIn, UserPlus, Brain, Eye, EyeOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cn } from "../lib/utils";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, googleAuth, authError, setAuthError } = useApp();

  const [formData, setFormData] = useState({
    name: "",
    email: "user@intellichoice.ai",
    password: "user123",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (authError) setAuthError("");
  };

  const validate = () => {
    if (!formData.email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return false;
    }
    if (activeTab === "register" && !formData.name.trim()) {
      setAuthError("Please enter your full name.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (activeTab === "login") {
      login({ email: formData.email, password: formData.password });
    } else {
      register(formData);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { name, email } = decoded;
      googleAuth({ name, email });
    } catch (err) {
      setAuthError("Failed to authenticate with Google.");
    }
  };

  const handleGoogleError = () => {
    setAuthError("Google Sign-In was unsuccessful. Please try again.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[var(--bg)] transition-colors duration-300">
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="card card-lg p-8 z-10 relative">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <Brain size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">IntelliChoice</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)] font-medium">
              Advanced AI Decision Support System
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex rounded-xl bg-[var(--surface-2)] p-1">
            <button
              onClick={() => { setActiveTab("login"); setAuthError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all",
                activeTab === "login" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-soft)] hover:text-[var(--text-muted)]"
              )}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setAuthError(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all",
                activeTab === "register" ? "bg-[var(--surface)] text-[var(--text)] shadow-sm" : "text-[var(--text-soft)] hover:text-[var(--text-muted)]"
              )}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {authError && (
            <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 animate-fade-up">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div className="space-y-1.5">
                <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="input"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@intellichoice.ai"
                className="input"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="px-1 text-xs font-bold uppercase tracking-widest text-[var(--text-soft)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text-muted)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4 h-11">
              {activeTab === "login" ? "Sign In to Console" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              shape="pill"
              text={activeTab === "login" ? "signin_with" : "signup_with"}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-xs font-semibold text-[var(--text-soft)] uppercase tracking-widest">Demo Access</p>
            <div className="mt-3 flex justify-center gap-4 text-[10px] font-bold text-[var(--text-muted)]">
              <div className="bg-[var(--surface-2)] px-2 py-1 rounded">USER: user / user123</div>
              <div className="bg-[var(--surface-2)] px-2 py-1 rounded">ADMIN: admin / admin123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
