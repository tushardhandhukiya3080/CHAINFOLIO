"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/*
  Mock authentication (no backend).

  Sign-up stores a user in localStorage; login validates against it. The current
  session is also persisted, so you stay logged in across pages and refreshes —
  the same "global state" pattern used for the wallet. Swap these functions for
  real API/auth calls later and the UI stays the same.

  NOTE: passwords are stored in plain text in localStorage purely for this demo.
  Never do this in a real app — hash + verify on a server.
*/

const AuthContext = createContext(null);
const USERS_KEY = "chainfolio_users";
const SESSION_KEY = "chainfolio_session";

function readUsers() {
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const session = window.localStorage.getItem(SESSION_KEY);
      if (session) setUser(JSON.parse(session));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Returns { ok: true } or { ok: false, error: "..." }
  const signup = useCallback(async ({ name, email, password }) => {
    await new Promise((r) => setTimeout(r, 800)); // simulate network latency
    const users = readUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) return { ok: false, error: "An account with that email already exists." };

    const newUser = { name: name || "", email, password };
    users.push(newUser);
    try {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const session = { name, email };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
    } catch {
      return { ok: false, error: "Couldn't save your account (storage blocked)." };
    }
    return { ok: true };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 800));
    const users = readUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) return { ok: false, error: "Invalid email or password." };

    const session = { name: match.name, email: match.email };
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* ignore */
    }
    setUser(session);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = { user, isAuthed: !!user, hydrated, signup, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
