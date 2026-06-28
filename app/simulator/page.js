"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ----- Mining settings -----
const DIFFICULTY = "00"; // a block is "valid" when its hash starts with this prefix
const GENESIS_PREV = "0".repeat(64); // Block 1 points to an all-zero "previous hash"

// Real SHA-256 using the browser's built-in Web Crypto API.
async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// A block's hash is built from ALL its fields, including the previous hash —
// that linkage is what chains the blocks together.
function blockString(index, prevHash, nonce, data) {
  return `${index}|${prevHash}|${nonce}|${data}`;
}

export default function SimulatorPage() {
  // Block 1
  const [data1, setData1] = useState("Alice pays Bob 5 coins");
  const [nonce1, setNonce1] = useState(0);
  const [hash1, setHash1] = useState("");
  const [mining1, setMining1] = useState(false);

  // Block 2 — its "previous hash" is Block 1's hash (auto-filled).
  const [data2, setData2] = useState("Bob pays Carol 2 coins");
  const [nonce2, setNonce2] = useState(0);
  const [hash2, setHash2] = useState("");
  const [mining2, setMining2] = useState(false);

  // Recompute both hashes whenever any input changes. Because Block 2 depends
  // on Block 1's hash, editing Block 1 instantly ripples into Block 2.
  useEffect(() => {
    let active = true;
    (async () => {
      const h1 = await sha256(blockString(1, GENESIS_PREV, nonce1, data1));
      const h2 = await sha256(blockString(2, h1, nonce2, data2));
      if (active) {
        setHash1(h1);
        setHash2(h2);
      }
    })();
    return () => {
      active = false;
    };
  }, [data1, nonce1, data2, nonce2]);

  const valid1 = hash1.startsWith(DIFFICULTY);
  const valid2 = hash2.startsWith(DIFFICULTY);

  // "Mining" = brute-force the nonce until the hash starts with "00".
  async function mineBlock1() {
    setMining1(true);
    let n = 0;
    let h = await sha256(blockString(1, GENESIS_PREV, n, data1));
    while (!h.startsWith(DIFFICULTY)) {
      n++;
      h = await sha256(blockString(1, GENESIS_PREV, n, data1));
    }
    setNonce1(n);
    setMining1(false);
  }

  async function mineBlock2() {
    setMining2(true);
    let n = 0;
    let h = await sha256(blockString(2, hash1, n, data2));
    while (!h.startsWith(DIFFICULTY)) {
      n++;
      h = await sha256(blockString(2, hash1, n, data2));
    }
    setNonce2(n);
    setMining2(false);
  }

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Interactive · pure JavaScript</span>
          <h1 className="display">
            Block <span className="grad">simulator</span>
          </h1>
          <p className="lead">
            &quot;Mining&quot; means tweaking a number called the <strong>nonce</strong>{" "}
            until a block&apos;s hash starts with <code>00</code> (our simplified
            proof-of-work). Mine both blocks below — then edit Block 1 and watch
            the chain break.
          </p>
        </div>
      </header>

      <section className="container">
        <div className="chain2">
          {/* ---------- BLOCK 1 ---------- */}
          <article className={`sim-block ${valid1 ? "valid" : "invalid"}`}>
            <div className="sim-head">
              <h3>Block #1</h3>
              <span className={`pill ${valid1 ? "ok" : "bad"}`}>
                {valid1 ? "✓ Valid" : "✗ Invalid"}
              </span>
            </div>
            <label>Block Data</label>
            <input value={data1} onChange={(e) => setData1(e.target.value)} />
            <label>Previous Hash</label>
            <input value={GENESIS_PREV} readOnly className="ro" />
            <label>Nonce</label>
            <input
              type="number"
              value={nonce1}
              onChange={(e) => setNonce1(Number(e.target.value) || 0)}
            />
            <label>Hash</label>
            <div className={`hash-out ${valid1 ? "good" : "bad"}`}>{hash1}</div>
            <button className="btn primary full" onClick={mineBlock1} disabled={mining1}>
              {mining1 ? "Mining…" : "⛏️ Mine Block 1"}
            </button>
          </article>

          <div className="link-arrow" aria-hidden="true">→</div>

          {/* ---------- BLOCK 2 ---------- */}
          <article className={`sim-block ${valid2 ? "valid" : "invalid"}`}>
            <div className="sim-head">
              <h3>Block #2</h3>
              <span className={`pill ${valid2 ? "ok" : "bad"}`}>
                {valid2 ? "✓ Valid" : "✗ Invalid"}
              </span>
            </div>
            <label>Block Data</label>
            <input value={data2} onChange={(e) => setData2(e.target.value)} />
            <label>Previous Hash (= Block 1&apos;s hash)</label>
            <input value={hash1} readOnly className="ro" />
            <label>Nonce</label>
            <input
              type="number"
              value={nonce2}
              onChange={(e) => setNonce2(Number(e.target.value) || 0)}
            />
            <label>Hash</label>
            <div className={`hash-out ${valid2 ? "good" : "bad"}`}>{hash2}</div>
            <button className="btn primary full" onClick={mineBlock2} disabled={mining2}>
              {mining2 ? "Mining…" : "⛏️ Mine Block 2"}
            </button>
          </article>
        </div>

        <div className="callout">
          <strong>The core insight — immutability:</strong> mine both blocks so
          they&apos;re valid, then change Block 1&apos;s data. Block 1&apos;s hash
          no longer starts with <code>00</code>, and because that hash is Block
          2&apos;s &quot;previous hash&quot;, Block 2 breaks too. To cheat the
          chain you&apos;d have to re-mine every following block — which is exactly
          what makes a real blockchain tamper-proof.
        </div>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/prices">← Live Prices</Link>
        <Link className="btn primary" href="/">Back to Home ↑</Link>
      </nav>
    </>
  );
}
