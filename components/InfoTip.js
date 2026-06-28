"use client";

import { useEffect, useId, useRef, useState } from "react";

// One reusable inline info popover. Add a term here and use <InfoTip term="..." />.
const DEFS = {
  nonce: {
    title: "Nonce",
    body:
      "Short for 'number used once.' The block's data is fixed, so to find a hash that starts with the required leading zeros, you spin the nonce — trying 0, 1, 2, 3… and re-hashing each time until the hash is valid. That winning nonce is the proof of work: thousands of guesses to find, but instant for anyone to verify.",
  },
  prevHash: {
    title: "Previous Hash",
    body:
      "Each block stores the hash of the block before it — that link is what chains the blocks together, so changing an earlier block breaks every block after it.",
  },
  hash: {
    title: "Hash",
    body:
      "A SHA-256 fingerprint of this block's data + previous hash + nonce: a fixed 64-character hex string that changes completely if anything in the block changes.",
  },
  difficulty: {
    title: "Difficulty",
    body:
      "How many leading zeros the hash must start with to count as valid — each extra zero makes mining about 16× harder.",
  },
};

export default function InfoTip({ term, align = "left" }) {
  const def = DEFS[term];
  const [pinned, setPinned] = useState(false); // toggled by click/tap/keyboard
  const [hovering, setHovering] = useState(false); // mouse hover preview
  const wrapRef = useRef(null);
  const id = useId();

  const shown = pinned || hovering;

  // Dismiss the pinned popover on outside click / Escape.
  useEffect(() => {
    if (!pinned) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setPinned(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setPinned(false);
        setHovering(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pinned]);

  if (!def) return null;

  return (
    <span className="infotip" ref={wrapRef}>
      <button
        type="button"
        className="infotip-trigger"
        aria-label={`What is ${def.title}?`}
        aria-expanded={shown}
        aria-controls={id}
        onClick={() => setPinned((p) => !p)}
        // Hover only for real mouse pointers — tap on touch is handled by click,
        // so a second tap reliably closes it on mobile.
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setHovering(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setHovering(false);
        }}
      >
        ?
      </button>
      {shown && (
        <span className={`infotip-pop ${align === "right" ? "right" : ""}`} id={id} role="tooltip">
          <strong className="infotip-title">{def.title}</strong>
          <span className="infotip-body">{def.body}</span>
        </span>
      )}
    </span>
  );
}
