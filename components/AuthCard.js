"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const MIN_PW = 6;

function EyeIcon({ off }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" strokeLinecap="square" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="square" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function AuthCard({ mode = "signin" }) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const isSignup = mode === "signup";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [touched, setTouched] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [forgotNote, setForgotNote] = useState("");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  // Live validation → drives inline errors AND the disabled submit button.
  const errors = useMemo(() => {
    const e = {};
    if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email address.";
    if (isSignup) {
      if (form.password.length < MIN_PW) e.password = `Password must be at least ${MIN_PW} characters.`;
      if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    } else if (!form.password) {
      e.password = "Password is required.";
    }
    return e;
  }, [form, isSignup]);

  const isValid = Object.keys(errors).length === 0;
  const showErr = (field) => touched[field] && errors[field];

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    // Reveal any outstanding errors if they submit early via keyboard.
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;

    setLoading(true);
    const res = isSignup
      ? await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      : await login({ email: form.email.trim(), password: form.password });
    setLoading(false);

    if (res.ok) router.push("/portfolio");
    else setSubmitError(res.error);
  }

  return (
    <div className="auth-shell">
      <div className="auth-box">
        {/* Banner */}
        <div className="auth-banner">
          <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p>{isSignup ? "Join ChainFolio and track your portfolio" : "Sign in to your portfolio dashboard"}</p>
        </div>

        <div className="auth-body">
          {/* Tabs — keyboard-navigable links, no full reload */}
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <Link href="/login" role="tab" aria-selected={!isSignup} aria-current={!isSignup ? "page" : undefined} className={`auth-tab ${!isSignup ? "active" : ""}`}>
              Sign In
            </Link>
            <Link href="/signup" role="tab" aria-selected={isSignup} aria-current={isSignup ? "page" : undefined} className={`auth-tab ${isSignup ? "active" : ""}`}>
              Sign Up
            </Link>
          </div>

          {submitError && (
            <div className="form-alert" role="alert">{submitError}</div>
          )}

          <form onSubmit={onSubmit} noValidate>
            {isSignup && (
              <div className="field">
                <label htmlFor="name">Name <span className="opt">(optional)</span></label>
                <input id="name" name="name" type="text" placeholder="Satoshi" value={form.name} onChange={update} onBlur={blur} autoComplete="name" />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update}
                onBlur={blur}
                autoComplete="email"
                className={showErr("email") ? "invalid" : ""}
                aria-invalid={!!showErr("email")}
                aria-describedby={showErr("email") ? "email-err" : undefined}
              />
              {showErr("email") && <span id="email-err" className="field-error">{errors.email}</span>}
            </div>

            <div className="field">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                {!isSignup && (
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => setForgotNote("Password reset isn't available in this demo — your data lives only in your browser.")}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder={isSignup ? "At least 6 characters" : "••••••••"}
                  value={form.password}
                  onChange={update}
                  onBlur={blur}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className={showErr("password") ? "invalid" : ""}
                  aria-invalid={!!showErr("password")}
                  aria-describedby={showErr("password") ? "password-err" : undefined}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}>
                  <EyeIcon off={showPw} />
                </button>
              </div>
              {showErr("password") && <span id="password-err" className="field-error">{errors.password}</span>}
              {forgotNote && !isSignup && <span className="field-note">{forgotNote}</span>}
            </div>

            {isSignup && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <div className="input-wrap">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={update}
                    onBlur={blur}
                    autoComplete="new-password"
                    className={showErr("confirm") ? "invalid" : ""}
                    aria-invalid={!!showErr("confirm")}
                    aria-describedby={showErr("confirm") ? "confirm-err" : undefined}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide password" : "Show password"} aria-pressed={showConfirm}>
                    <EyeIcon off={showConfirm} />
                  </button>
                </div>
                {showErr("confirm") && <span id="confirm-err" className="field-error">{errors.confirm}</span>}
              </div>
            )}

            <Button type="submit" className="full" disabled={loading || !isValid}>
              {loading ? (isSignup ? "Creating account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          {/* ✦ divider + trust line — on-brand decentralized motif */}
          <div className="auth-divider" aria-hidden="true">
            <span /> ✦ <span />
          </div>
          <p className="auth-trust">🔒 Stored locally — we never see your keys.</p>
        </div>

        <div className="auth-foot">
          <Link href="/" className="back-home">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
