"use client";

import { useEffect, useState } from "react";

// Dark/light toggle. The actual theme is applied by an inline script in the
// layout (before paint, to avoid a flash); this just flips + persists it.
export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      document.documentElement.dataset.theme ||
      localStorage.getItem("chainfolio_theme") ||
      "dark";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("chainfolio_theme", next);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle dark / light theme"
      title="Toggle theme"
    >
      {mounted ? (theme === "dark" ? "☀" : "🌙") : "☀"}
    </button>
  );
}
