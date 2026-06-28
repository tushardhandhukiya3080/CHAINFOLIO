"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";

// Small inline eye icon (and crossed-out variant) for the show/hide toggle.
function EyeIcon({ off }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" strokeLinecap="square" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="square" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const COUNTRY_CODES = [
  { c: "IN", d: "+91" },
  { c: "US", d: "+1" },
  { c: "UK", d: "+44" },
  { c: "AE", d: "+971" },
  { c: "AU", d: "+61" },
  { c: "SG", d: "+65" },
];

// The live password-strength rules shown on Sign Up.
const PW_RULES = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "At least one number", test: (p) => /[0-9]/.test(p) },
  { label: "At least one special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function AuthCard({ mode = "signin" }) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    name: "",
    email: "",
    cc: "+91",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "email") setEmailVerified(false); // re-verify if email changes
  };

  function verifyEmail() {
    if (!EMAIL_RE.test(form.email)) {
      setErrors((x) => ({ ...x, email: "Enter a valid email to verify." }));
      return;
    }
    setErrors((x) => ({ ...x, email: undefined }));
    setEmailVerified(true); // mock verification
  }

  function validateSignin() {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateSignup() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email.";
    if (!form.phone.trim()) e.phone = "Phone number is required.";
    else if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number.";
    if (!PW_RULES.every((r) => r.test(form.password)))
      e.password = "Password doesn't meet the requirements below.";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (!isSignup) {
      if (!validateSignin()) return;
      setLoading(true);
      const res = await login({ email: form.email, password: form.password });
      setLoading(false);
      if (res.ok) router.push("/dashboard");
      else setSubmitError(res.error);
      return;
    }

    if (!validateSignup()) return;
    if (!emailVerified) {
      setSubmitError("Please verify your email address first.");
      return;
    }
    setLoading(true);
    const res = await signup({
      name: form.name,
      email: form.email,
      phone: `${form.cc} ${form.phone}`,
      password: form.password,
    });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else setSubmitError(res.error);
  }

  return (
    <div className="auth-shell">
      <div className="auth-box">
        {/* ===== Banner ===== */}
        <div className="auth-banner">
          <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
          <p>
            {isSignup
              ? "Join ChainFolio and track your portfolio"
              : "Access your portfolio dashboard"}
          </p>
        </div>

        <div className="auth-body">
          {/* ===== Tabs ===== */}
          <div className="auth-tabs">
            <Link href="/login" className={`auth-tab ${!isSignup ? "active" : ""}`}>
              Sign In
            </Link>
            <Link href="/signup" className={`auth-tab ${isSignup ? "active" : ""}`}>
              Sign Up
            </Link>
          </div>

          {submitError && <div className="form-alert">{submitError}</div>}

          <form onSubmit={onSubmit} noValidate>
            {isSignup && (
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={update}
                  className={errors.name ? "invalid" : ""}
                  autoComplete="name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            {/* Email (with Verify on signup) */}
            <div className="field">
              <label htmlFor="email">Email Address</label>
              {isSignup ? (
                <div className="email-row">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={update}
                    className={errors.email ? "invalid" : ""}
                    autoComplete="email"
                  />
                  <button
                    type="button"
                    className="btn sm"
                    onClick={verifyEmail}
                    disabled={emailVerified}
                  >
                    {emailVerified ? "Verified" : "Verify"}
                  </button>
                </div>
              ) : (
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update}
                  className={errors.email ? "invalid" : ""}
                  autoComplete="email"
                />
              )}
              {errors.email && <span className="field-error">{errors.email}</span>}
              {isSignup && emailVerified && (
                <span className="verify-ok">✓ Email verified</span>
              )}
            </div>

            {/* Phone (signup only) */}
            {isSignup && (
              <div className="field">
                <label htmlFor="phone">Phone Number</label>
                <div className="phone-row">
                  <select
                    name="cc"
                    className="cc-select"
                    value={form.cc}
                    onChange={update}
                    aria-label="Country code"
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.c} value={cc.d}>
                        {cc.c} {cc.d}
                      </option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={update}
                    className={errors.phone ? "invalid" : ""}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            )}

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder={isSignup ? "Create a strong password" : "••••••••"}
                  value={form.password}
                  onChange={update}
                  className={errors.password ? "invalid" : ""}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPw} />
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Password rules (signup only) */}
            {isSignup && (
              <ul className="pw-rules">
                {PW_RULES.map((r) => {
                  const ok = r.test(form.password);
                  return (
                    <li key={r.label} className={`pw-rule ${ok ? "ok" : ""}`}>
                      <span className="pw-dot" />
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Confirm password (signup only) */}
            {isSignup && (
              <div className="field">
                <label htmlFor="confirm">Confirm Password</label>
                <div className="input-wrap">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={update}
                    className={errors.confirm ? "invalid" : ""}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon off={showConfirm} />
                  </button>
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>
            )}

            <Button type="submit" className="full" disabled={loading}>
              {loading
                ? isSignup
                  ? "Creating account…"
                  : "Signing in…"
                : isSignup
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>
        </div>

        {/* ===== Footer ===== */}
        <div className="auth-foot">
          <Link href="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
