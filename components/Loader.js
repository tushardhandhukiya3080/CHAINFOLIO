"use client";

import { useEffect, useRef, useState } from "react";

// Full-screen preloader that counts 1 → 100, then fades out.
// Runs ONCE on the initial site load only — NOT on route changes.
const DURATION = 1200; // ms to count up

export default function Loader() {
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const [count, setCount] = useState(1);
  const rafRef = useRef(0);

  useEffect(() => {
    let startTs;
    let hideTimer;
    const step = (ts) => {
      if (startTs === undefined) startTs = ts;
      const p = Math.min((ts - startTs) / DURATION, 1);
      setCount(Math.max(1, Math.round(p * 100)));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setFading(true); // start fade
        hideTimer = setTimeout(() => setActive(false), 500);
      }
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hideTimer);
    };
  }, []); // empty deps → only on initial mount

  if (!active) return null;

  return (
    <div className={`loader-overlay ${fading ? "fade" : ""}`} aria-hidden="true">
      <div className="loader-count grad">{count}</div>
      <div className="loader-label">Loading ✦ ChainFolio</div>
      <div className="loader-bar" style={{ width: `${count}%` }} />
    </div>
  );
}
