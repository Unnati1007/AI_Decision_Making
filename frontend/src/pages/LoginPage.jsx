import { useState } from "react";

function LoginPage({ onLogin, onRegister, onGoogleLogin, authError }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError("");
    if (!email || !password) {
      setLocalError("Email and password are required.");
      return;
    }

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setLocalError("Password and confirm password must match.");
        return;
      }
      onRegister({ email: email.toLowerCase().trim(), password });
      return;
    }

    onLogin({ email: email.toLowerCase().trim(), password });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-xl shadow-blue-100">
        <h1 className="text-center text-3xl font-semibold text-slate-900">IntelliChoice</h1>
        <p className="mt-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-center text-sm font-semibold text-transparent">
          Your Intelligent Choice
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="you@intellichoice.ai"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter password"
            />
          </div>
          {isRegisterMode ? (
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm text-slate-600">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="Confirm password"
              />
            </div>
          ) : null}

          {localError || authError ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{localError || authError}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            {isRegisterMode ? "Register" : "Login"}
          </button>
          <button
            type="button"
            onClick={onGoogleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.7C17 2.8 14.7 2 12 2 6.9 2 2.8 6.2 2.8 11.4S6.9 20.8 12 20.8c6.9 0 9.1-4.9 9.1-7.4 0-.5 0-.9-.1-1.2H12z"
              />
            </svg>
            Login with Google
          </button>

          <p className="text-center text-sm text-slate-600">
            {isRegisterMode ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode((prev) => !prev);
                setLocalError("");
              }}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              {isRegisterMode ? "Login" : "Register"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
