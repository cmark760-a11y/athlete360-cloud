import { useState, type FormEvent } from "react";
import { login, signup, AuthError, MissingIdentityError, type User } from "@netlify/identity";

interface LoginScreenProps {
  onAuthenticated: (user: User) => void;
}

export default function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        const user = await login(email, password);
        onAuthenticated(user);
      } else {
        const user = await signup(email, password, { full_name: name });
        if (user.confirmedAt) {
          onAuthenticated(user);
        } else {
          setNotice("Account created. Check your inbox to confirm your email before logging in.");
          setMode("login");
        }
      }
    } catch (err) {
      if (err instanceof MissingIdentityError) {
        setError("Identity is not enabled on this deployment yet.");
      } else if (err instanceof AuthError) {
        if (err.status === 401) setError("Invalid email or password.");
        else if (err.status === 403) setError("Signups are currently invite-only.");
        else if (err.status === 422) setError("Check your email and password — password needs at least 6 characters.");
        else setError(err.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div>
          <h1>
            Train
            <em>with data.</em>
          </h1>
          <p className="login-tagline">
            Athlete360 is the training ledger coaches use to log sessions, track load, and spot fatigue
            before it becomes an injury report.
          </p>
        </div>
        <div className="login-stats">
          <div>
            <strong>1</strong>
            <span>Program</span>
          </div>
          <div>
            <strong>&infin;</strong>
            <span>Sessions logged</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Missed check-ins</span>
          </div>
        </div>
      </div>
      <div className="login-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
              Log in
            </button>
            <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">
              Sign up
            </button>
          </div>
          <h2>{mode === "login" ? "Welcome back" : "Set up your account"}</h2>
          <p className="subtitle">
            {mode === "login" ? "Log in to reach the roster." : "Coaches and staff can sign up to manage athletes."}
          </p>
          {error && <div className="form-error">{error}</div>}
          {notice && <div className="form-error" style={{ color: "#9be08d", borderColor: "rgba(155,224,141,0.3)", background: "rgba(155,224,141,0.1)" }}>{notice}</div>}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
          <p className="auth-note">
            {mode === "login" ? "New here?" : "Already registered?"}{" "}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: 0, textDecoration: "underline", textTransform: "none", fontSize: 12 }}
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
