import "./styles.css";

import { useState } from "react";

function validateEmail(value) {
  if (!value.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address.";
  return null;
}

function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function validateFullName(value) {
  if (!value.trim()) return "Full name is required.";
  return null;
}

async function apiPost(apiBaseUrl, path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = (data && (data.message || data.error)) || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function LoginForm({ apiBaseUrl, onAuthenticated, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const nextErrors = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setFieldErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const loginResult = await apiPost(apiBaseUrl, "/auth/login", { email, password });
      const me = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${loginResult.token}` },
      });
      const user = me.ok ? await me.json() : { email };
      onAuthenticated(loginResult.token, user);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({
                  ...current,
                  email: validateEmail(event.target.value) ?? undefined,
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({ ...current, email: validateEmail(email) ?? undefined }))
            }
            aria-invalid={Boolean(fieldErrors.email)}
            className={`form-input ${fieldErrors.email ? "form-input-invalid" : ""}`}
            placeholder="you@example.com"
            required
          />
          {fieldErrors.email ? <p className="form-error-text">{fieldErrors.email}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (fieldErrors.password) {
                setFieldErrors((current) => ({
                  ...current,
                  password: validatePassword(event.target.value) ?? undefined,
                }));
              }
            }}
            onBlur={() =>
              setFieldErrors((current) => ({
                ...current,
                password: validatePassword(password) ?? undefined,
              }))
            }
            aria-invalid={Boolean(fieldErrors.password)}
            className={`form-input ${fieldErrors.password ? "form-input-invalid" : ""}`}
            placeholder="Enter your password"
            required
          />
          {fieldErrors.password ? <p className="form-error-text">{fieldErrors.password}</p> : null}
        </label>
      </div>

      {error ? (
        <div className="rounded-[1.25rem] border border-accent/18 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          onClick={switchToRegister}
          className="text-sm font-semibold text-primary transition hover:text-primary-deep"
        >
          Need an account?
        </button>
      </div>
    </form>
  );
}

function SignupForm({ apiBaseUrl, onAuthenticated, switchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const nextErrors = {
      fullName: validateFullName(fullName) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword:
        password !== confirmPassword ? "Passwords do not match." : undefined,
    };
    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
      setError("Please correct the highlighted fields.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await apiPost(apiBaseUrl, "/auth/register", { email, password, fullName });
      const loginResult = await apiPost(apiBaseUrl, "/auth/login", { email, password });
      const me = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${loginResult.token}` },
      });
      const user = me.ok ? await me.json() : { email, fullName };
      onAuthenticated(loginResult.token, user);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Full name</span>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              if (fieldErrors.fullName) {
                setFieldErrors((current) => ({
                  ...current,
                  fullName: validateFullName(event.target.value) ?? undefined,
                }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.fullName)}
            className={`form-input ${fieldErrors.fullName ? "form-input-invalid" : ""}`}
            placeholder="Ama Mensah"
            required
          />
          {fieldErrors.fullName ? <p className="form-error-text">{fieldErrors.fullName}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((current) => ({
                  ...current,
                  email: validateEmail(event.target.value) ?? undefined,
                }));
              }
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            className={`form-input ${fieldErrors.email ? "form-input-invalid" : ""}`}
            placeholder="you@example.com"
            required
          />
          {fieldErrors.email ? <p className="form-error-text">{fieldErrors.email}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            className={`form-input ${fieldErrors.password ? "form-input-invalid" : ""}`}
            placeholder="Create a password"
            minLength={8}
            required
          />
          {fieldErrors.password ? <p className="form-error-text">{fieldErrors.password}</p> : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink/74">Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className={`form-input ${fieldErrors.confirmPassword ? "form-input-invalid" : ""}`}
            placeholder="Repeat your password"
            minLength={8}
            required
          />
          {fieldErrors.confirmPassword ? (
            <p className="form-error-text">{fieldErrors.confirmPassword}</p>
          ) : null}
        </label>
      </div>

      {error ? (
        <div className="rounded-[1.25rem] border border-accent/18 bg-accent/5 px-4 py-3 text-sm font-medium text-accent">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
        <button
          type="button"
          onClick={switchToLogin}
          className="text-sm font-semibold text-primary transition hover:text-primary-deep"
        >
          Already have an account?
        </button>
      </div>
    </form>
  );
}

export default function AuthApp({ apiBaseUrl, onAuthenticated }) {
  const baseUrl = apiBaseUrl || "http://localhost:8080/api";
  const [mode, setMode] = useState("login");
  const isLogin = mode === "login";

  const handleAuthenticated =
    onAuthenticated ||
    ((token, user) => {
      window.localStorage.setItem("sv_token", token);
      window.localStorage.setItem("sv_user", JSON.stringify(user));
      console.info("[auth-mfe] authenticated", user);
    });

  return (
    <section className="page-shell flex min-h-full items-start justify-center py-6 sm:items-center sm:py-8">
      <div className="w-full max-w-xl glass-panel p-7 sm:p-9">
        <div>
          <span className="eyebrow">{isLogin ? "Welcome back" : "Create an account"}</span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[0.94] tracking-[-0.05em] text-ink sm:text-5xl">
            {isLogin ? "Sign in to SwiftVotes." : "Join SwiftVotes."}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink/64">
            {isLogin
              ? "Sign in to create events, manage contestants, and monitor votes."
              : "Register an account to start creating and managing voting events."}
          </p>
        </div>

        <div className="mt-7">
          {isLogin ? (
            <LoginForm
              apiBaseUrl={baseUrl}
              onAuthenticated={handleAuthenticated}
              switchToRegister={() => setMode("register")}
            />
          ) : (
            <SignupForm
              apiBaseUrl={baseUrl}
              onAuthenticated={handleAuthenticated}
              switchToLogin={() => setMode("login")}
            />
          )}
        </div>

        <div className="mt-8 border-t border-ink/8 pt-6 text-sm text-ink/60">
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button
            type="button"
            onClick={() => setMode(isLogin ? "register" : "login")}
            className="font-semibold text-primary transition hover:text-primary-deep"
          >
            {isLogin ? "Create one" : "Sign in"}
          </button>
        </div>
      </div>
    </section>
  );
}
