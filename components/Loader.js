"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Full-screen preloader that counts 1 → 100, then fades out.
// Runs on the initial load and again on every route (pathname) change.
const DURATION = 1200; // ms to count up

export default function Loader() {
  const pathname = usePathname();
  const [active, setActive] = useState(true);
  const [fading, setFading] = useState(false);
  const [count, setCount] = useState(1);
  const rafRef = useRef(0);

  useEffect(() => {
    setActive(true);
    setFading(false);
    setCount(1);

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
  }, [pathname]);

  if (!active) return null;

  return (
    <div className={`loader-overlay ${fading ? "fade" : ""}`} aria-hidden="true">
      <div className="loader-count grad">{count}</div>
      <div className="loader-label">Loading ✦ ChainFolio</div>
      <div className="loader-bar" style={{ width: `${count}%` }} />
    </div>
  );
}
