"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import InfoTip from "@/components/InfoTip";
import { sha256Hex, blockString, GENESIS_PREV } from "@/lib/hash";

// Start with just the Genesis block — the user grows the chain with "+ Add block".
const INITIAL = ["Genesis block"];

// Odds that a random hash starts with N leading zeros (16^N possibilities).
const ODDS = { 1: "16", 2: "256", 3: "4,096", 4: "65,536" };

const tick = () => new Promise((r) => setTimeout(r, 0));

export default function SimulatorPage() {
  const [datas, setDatas] = useState(INITIAL);
  const [nonces, setNonces] = useState(() => INITIAL.map(() => 0));
  const [hashes, setHashes] = useState([]);
  const [difficulty, setDifficulty] = useState(2); // leading zeros required
  const [miningIndex, setMiningIndex] = useState(null);
  const [stats, setStats] = useState({}); // index -> { attempts, elapsed, hps, done }
  const [showHelp, setShowHelp] = useState(false);
  const [showBtc, setShowBtc] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectBlock, setInspectBlock] = useState(0);
  const [report, setReport] = useState(null);
  const [verifying, setVerifying] = useState(false);
  // Hash + timestamp captured at mine time — compared against the live recompute.
  const [storedHashes, setStoredHashes] = useState(() => INITIAL.map(() => null));
  const [storedTimes, setStoredTimes] = useState(() => INITIAL.map(() => null));
  const [learningMode, setLearningMode] = useState(true);

  const prefix = "0".repeat(difficulty);

  // Recompute the whole chain whenever data or nonces change. Each block's hash
  // depends on the previous block's hash — so editing one cascades downward.
  useEffect(() => {
    let active = true;
    (async () => {
      const hs = [];
      let prev = GENESIS_PREV;
      for (let i = 0; i < datas.length; i++) {
        const h = await sha256Hex(blockString(i, prev, nonces[i], datas[i]));
        hs.push(h);
        prev = h;
      }
      if (active) setHashes(hs);
    })();
    return () => {
      active = false;
    };
  }, [datas, nonces]);

  const isValid = (i) => hashes[i]?.startsWith(prefix);

  function editData(i, value) {
    setDatas((prev) => prev.map((d, idx) => (idx === i ? value : d)));
  }

  // Brute-force the nonce for block `i` until its hash starts with `prefix`.
  async function mineBlock(i) {
    setMiningIndex(i);
    const prev = i === 0 ? GENESIS_PREV : hashes[i - 1];
    const data = datas[i];
    const start = performance.now();
    let n = 0;
    let h = await sha256Hex(blockString(i, prev, n, data));
    let lastTick = start;
    while (!h.startsWith(prefix)) {
      n++;
      h = await sha256Hex(blockString(i, prev, n, data));
      if (n % 2000 === 0) {
        const now = performance.now();
        setStats((s) => ({
          ...s,
          [i]: { attempts: n, elapsed: now - start, hps: Math.round((2000 / (now - lastTick)) * 1000), done: false },
        }));
        lastTick = now;
        await tick(); // yield so the UI can repaint the live stats
      }
    }
    const end = performance.now();
    const elapsed = end - start;
    setStats((s) => ({
      ...s,
      [i]: { attempts: n, elapsed, hps: Math.round(n / (elapsed / 1000)) || n, done: true },
    }));
    setNonces((prev2) => prev2.map((v, idx) => (idx === i ? n : v)));
    const stamp = new Date().toLocaleTimeString();
    setStoredHashes((s) => s.map((v, idx) => (idx === i ? h : v)));
    setStoredTimes((s) => s.map((v, idx) => (idx === i ? stamp : v)));
    setMiningIndex(null);
  }

  // Mine every block in order (each chains off the freshly mined previous one).
  async function mineAll() {
    let prev = GENESIS_PREV;
    const newNonces = [...nonces];
    const newStored = [...storedHashes];
    const newTimes = [...storedTimes];
    for (let i = 0; i < datas.length; i++) {
      setMiningIndex(i);
      const start = performance.now();
      let n = 0;
      let h = await sha256Hex(blockString(i, prev, n, datas[i]));
      let lastTick = start;
      while (!h.startsWith(prefix)) {
        n++;
        h = await sha256Hex(blockString(i, prev, n, datas[i]));
        if (n % 2000 === 0) {
          const now = performance.now();
          setStats((s) => ({ ...s, [i]: { attempts: n, elapsed: now - start, hps: Math.round((2000 / (now - lastTick)) * 1000), done: false } }));
          lastTick = now;
          await tick();
        }
      }
      const end = performance.now();
      const elapsed = end - start;
      newNonces[i] = n;
      newStored[i] = h;
      newTimes[i] = new Date().toLocaleTimeString();
      prev = h;
      setStats((s) => ({ ...s, [i]: { attempts: n, elapsed, hps: Math.round(n / (elapsed / 1000)) || n, done: true } }));
    }
    setNonces(newNonces);
    setStoredHashes(newStored);
    setStoredTimes(newTimes);
    setMiningIndex(null);
  }

  function reset() {
    setDatas(INITIAL);
    setNonces(INITIAL.map(() => 0));
    setStoredHashes(INITIAL.map(() => null));
    setStoredTimes(INITIAL.map(() => null));
    setStats({});
    setReport(null);
  }

  // Append a new (unmined) block to the chain. Capped to keep the demo snappy.
  function addBlock() {
    if (datas.length >= 10) return;
    setDatas((d) => [...d, `Block ${d.length} data`]);
    setNonces((n) => [...n, 0]);
    setStoredHashes((s) => [...s, null]);
    setStoredTimes((s) => [...s, null]);
    setReport(null);
  }

  // Remove a block (keeps at least one). Stale stats/report are cleared.
  function removeBlock(i) {
    if (datas.length <= 1) return;
    const drop = (arr) => arr.filter((_, idx) => idx !== i);
    setDatas(drop);
    setNonces(drop);
    setStoredHashes(drop);
    setStoredTimes(drop);
    setStats({});
    setReport(null);
    setInspectBlock((b) => Math.max(0, Math.min(b, datas.length - 2)));
  }

  // Walk the whole chain, recomputing each hash from genesis, and build a report.
  async function verifyChain() {
    setVerifying(true);
    const start = performance.now();
    const results = [];
    let prev = GENESIS_PREV;
    for (let i = 0; i < datas.length; i++) {
      const h = await sha256Hex(blockString(i, prev, nonces[i], datas[i]));
      results.push({ index: i, valid: h.startsWith(prefix) });
      prev = h;
    }
    const end = performance.now();
    const validBlocks = results.filter((r) => r.valid).length;
    const invalidBlocks = results.length - validBlocks;
    const brokenLinks = results.filter((r, idx) => idx > 0 && !r.valid).length;
    setReport({
      results,
      total: results.length,
      validBlocks,
      invalidBlocks,
      brokenLinks,
      time: (end - start).toFixed(1),
      secure: invalidBlocks === 0,
    });
    setVerifying(false);
  }

  // ----- Hash Inspector derived values (for the selected block) -----
  const sel = Math.min(inspectBlock, datas.length - 1);
  const selPrev = sel === 0 ? GENESIS_PREV : hashes[sel - 1] || "";
  const rawInput = blockString(sel, selPrev, nonces[sel], datas[sel]);
  const encodedHex =
    typeof window !== "undefined"
      ? [...new TextEncoder().encode(rawInput)].map((b) => b.toString(16).padStart(2, "0")).join(" ")
      : "";
  const selHash = hashes[sel] || "";
  const selZeros = selHash ? (selHash.match(/^0*/)?.[0].length ?? 0) : 0;
  const binary4 = selHash
    ? selHash.slice(0, 8).match(/.{2}/g).map((h) => parseInt(h, 16).toString(2).padStart(8, "0")).join(" ")
    : "";

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Interactive · pure JavaScript</span>
          <h1 className="display">
            Block <span className="grad">simulator</span>
          </h1>
          <p className="lead">
            &quot;Mining&quot; means tweaking a <strong>nonce</strong> until a block&apos;s
            hash starts with the required number of zeros (proof-of-work). Mine the
            chain, then edit an early block and watch every block after it break.
          </p>
        </div>
      </header>

      <section className="container">
        {/* ===== Controls ===== */}
        <div className="sim-controls">
          <div className="diff-control">
            <label>
              Difficulty: <strong>{difficulty}</strong> leading zero{difficulty > 1 ? "s" : ""}{" "}
              <span className="muted-cell">(target {prefix}…)</span>{" "}
              <InfoTip term="difficulty" />
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              disabled={miningIndex !== null}
            />
          </div>
          <div className="sim-actions">
            <Button onClick={mineAll} disabled={miningIndex !== null}>
              {miningIndex !== null ? "Mining…" : "⛏️ Mine all"}
            </Button>
            <Button variant="ghost" onClick={addBlock} disabled={miningIndex !== null || datas.length >= 10}>
              + Add block
            </Button>
            <Button variant="ghost" onClick={reset} disabled={miningIndex !== null}>
              Reset
            </Button>
            <Button
              variant={learningMode ? "primary" : "ghost"}
              aria-pressed={learningMode}
              onClick={() => setLearningMode((v) => !v)}
            >
              Learning Mode: {learningMode ? "ON" : "OFF"}
            </Button>
          </div>
        </div>

        {/* ===== Collapsible "How mining works" explainer ===== */}
        <div className="mining-help-wrap">
          <Button
            variant="ghost"
            className="full help-toggle"
            aria-expanded={showHelp}
            aria-controls="mining-help"
            onClick={() => setShowHelp((v) => !v)}
          >
            <span>ℹ️ How does mining work?</span>
            <span aria-hidden="true">{showHelp ? "▲" : "▼"}</span>
          </Button>

          {showHelp && (
            <Card id="mining-help" role="region" aria-label="How mining works" className="mining-help">
              {/* Dynamic line — reacts to the difficulty slider */}
              <p className="callout">
                <strong>At difficulty {difficulty}</strong>, only about 1 in {ODDS[difficulty]} random
                hashes is valid — each extra zero makes it ~16× harder.
              </p>

              <h4 className="help-h">1 · What a hash is</h4>
              <p>
                <strong>SHA-256</strong> turns any input into a fixed{" "}
                <strong>64-character hex string</strong> (0–9, a–f). It&apos;s{" "}
                <strong>deterministic</strong> (same input → same hash), fixed-length, and{" "}
                <strong>one-way</strong>. It also has the <strong>avalanche effect</strong>: change a
                single character and the entire hash changes unpredictably. The output looks random and
                can&apos;t be predicted without actually computing it.
              </p>

              <h4 className="help-h">2 · Why the leading zeros are hard</h4>
              <p>
                A hash only counts as <strong>valid</strong> if it starts with the required number of{" "}
                <code>0</code>s — that&apos;s exactly what the difficulty slider sets. The odds of a
                random hash qualifying:
              </p>
              <ul className="odds-list">
                {[1, 2, 3, 4].map((d) => (
                  <li key={d} className={d === difficulty ? "active" : ""}>
                    <span>{d} zero{d > 1 ? "s" : ""}</span>
                    <span>≈ 1 in {ODDS[d]}</span>
                  </li>
                ))}
              </ul>

              <h4 className="help-h">3 · The nonce = proof of work</h4>
              <p>
                You can&apos;t change the block&apos;s real data, so you spin a throwaway counter called
                the <strong>nonce</strong>. The hash is computed from{" "}
                <strong>data + previous hash + nonce</strong>. You try nonce after nonce until the hash
                comes out with enough leading zeros — that winning nonce <em>is</em> the proof of work:
                thousands of guesses to find, but anyone can verify it in a single hash.
              </p>
              <p>
                That&apos;s what the live readouts show: <strong>hashes/second</strong> = guesses per
                second, and <strong>time to mine</strong> = how long that loop ran.
              </p>

              <h4 className="help-h">4 · Why tampering breaks the chain</h4>
              <p>
                Each block&apos;s hash includes the <strong>previous block&apos;s hash</strong>. Edit an
                old block → its hash changes → that no longer matches the next block&apos;s stored
                &quot;previous hash&quot; → which cascades down, turning <strong>every later block
                Invalid</strong>. To cheat, you&apos;d have to re-mine every block after it.
              </p>
              <p className="callout">
                👉 Try it: mine the whole chain with <strong>Mine all</strong>, then edit Block #1&apos;s
                data and watch blocks #2–#4 turn red.
              </p>

              {/* Optional nested sub-section */}
              <Button
                variant="ghost"
                className="sm help-sub-toggle"
                aria-expanded={showBtc}
                aria-controls="btc-detail"
                onClick={() => setShowBtc((v) => !v)}
              >
                {showBtc ? "− Hide" : "+ Show"} how real Bitcoin scales this up
              </Button>
              {showBtc && (
                <div id="btc-detail" role="region" aria-label="How real Bitcoin scales this up" className="btc-detail">
                  <p>
                    Bitcoin requires roughly <strong>19–20+ leading zeros</strong> (astronomically rarer
                    than our demo), and miners worldwide make <strong>trillions of guesses per second</strong>.
                    Difficulty <strong>auto-adjusts every 2,016 blocks</strong> to keep ~10 minutes per
                    block. Ethereum dropped this mining approach in 2022 and switched to{" "}
                    <strong>Proof of Stake</strong>.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* ===== The chain ===== */}
        <div className="chain-col">
          {datas.map((data, i) => {
            const valid = isValid(i);
            const st = stats[i];
            const mining = miningIndex === i;
            return (
              <div key={i}>
                <article className={`sim-block ${valid ? "valid" : "invalid"}`}>
                  <div className="sim-head">
                    <h3>Block #{i}</h3>
                    <div className="sim-head-right">
                      <span className={`pill ${valid ? "ok" : "bad"}`}>
                        {valid ? "✓ Valid" : "✗ Invalid"}
                      </span>
                      <button
                        className="sim-remove"
                        onClick={() => removeBlock(i)}
                        disabled={miningIndex !== null || datas.length <= 1}
                        aria-label={`Remove block ${i}`}
                        title="Remove this block"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <label>Block Data</label>
                  <input value={data} onChange={(e) => editData(i, e.target.value)} disabled={miningIndex !== null} />
                  <div className="sim-meta">
                    <span>Prev <InfoTip term="prevHash" />: <code className="mono">{(i === 0 ? GENESIS_PREV : hashes[i - 1] || "").slice(0, 16)}…</code></span>
                    <span>Nonce <InfoTip term="nonce" align="right" />: <strong>{nonces[i]}</strong></span>
                  </div>
                  <label>Hash <InfoTip term="hash" /></label>
                  <div className={`hash-out ${valid ? "good" : "bad"}`}>{hashes[i] || "…"}</div>

                  {(mining || st) && (
                    <div className="mine-stats">
                      {st && (
                        <>
                          {st.done ? "Mined" : "Mining"} · {st.attempts.toLocaleString()} hashes ·{" "}
                          {(st.elapsed / 1000).toFixed(2)}s · {st.hps.toLocaleString()} H/s
                        </>
                      )}
                    </div>
                  )}

                  <Button className="full" onClick={() => mineBlock(i)} disabled={miningIndex !== null}>
                    {mining ? "Mining…" : `⛏️ Mine Block ${i}`}
                  </Button>
                  {learningMode && (
                    <p className="learn-line">
                      Mining increments the nonce until the SHA-256 hash starts with the required
                      leading zeros — that brute-force search is the &quot;work&quot; in proof-of-work.
                    </p>
                  )}
                </article>
                {i < datas.length - 1 && <div className="link-arrow chain-down" aria-hidden="true">↓</div>}
              </div>
            );
          })}
        </div>

        {/* ===== Module 1 — Hash Inspector ===== */}
        <div className="inspector-wrap">
          <Button
            variant="ghost"
            className="full help-toggle"
            aria-expanded={inspectorOpen}
            aria-controls="hash-inspector"
            onClick={() => setInspectorOpen((v) => !v)}
          >
            <span>🔬 Hash Inspector</span>
            <span aria-hidden="true">{inspectorOpen ? "▲" : "▼"}</span>
          </Button>

          {inspectorOpen && (
            <Card id="hash-inspector" role="region" aria-label="Hash inspector" className="inspector">
              {/* tabs: one per block */}
              <div className="inspector-tabs" role="tablist" aria-label="Select a block to inspect">
                {datas.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={sel === i}
                    className={`insp-tab ${sel === i ? "active" : ""}`}
                    onClick={() => setInspectBlock(i)}
                  >
                    {i === 0 ? "Genesis" : `Block ${i}`}
                  </button>
                ))}
              </div>

              <div className="insp-rows">
                <div className="insp-row">
                  <div className="insp-label">Raw SHA-256 Input</div>
                  <div className="insp-value scroll">{rawInput}</div>
                  <div className="insp-cap">
                    The exact string that gets hashed — block index, data, previous hash, and nonce
                    joined together.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Encoded Input (UTF-8 Bytes)</div>
                  <div className="insp-value scroll">{encodedHex || "…"}</div>
                  <div className="insp-cap">
                    SHA-256 works on bytes, so the input is first encoded as UTF-8, shown here in
                    hexadecimal.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Generated Hash</div>
                  <div className={`insp-value ${selZeros >= difficulty ? "good" : ""}`}>{selHash || "…"}</div>
                  <div className="insp-cap">
                    The 256-bit SHA-256 digest of that input, written as 64 hexadecimal characters.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Leading Zero Count</div>
                  <div className="insp-value">{selZeros} zero{selZeros === 1 ? "" : "s"}</div>
                  <div className="insp-cap">
                    How many zeros the hash currently begins with. A valid block needs at least the
                    difficulty target.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Difficulty Target</div>
                  <div className="insp-value">starts with &quot;{prefix}&quot; ({difficulty} zero{difficulty === 1 ? "" : "s"})</div>
                  <div className="insp-cap">
                    The mining goal — a hash counts as valid only when it starts with this many zeros.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Hash Length</div>
                  <div className="insp-value">64 hex chars · 256 bits</div>
                  <div className="insp-cap">
                    SHA-256 always outputs exactly 256 bits no matter how large the input is — that
                    fixed size is part of why it&apos;s useful.
                  </div>
                </div>

                <div className="insp-row">
                  <div className="insp-label">Binary Representation (First 4 Bytes)</div>
                  <div className="insp-value">{binary4 || "…"}</div>
                  <div className="insp-cap">
                    The same hash shown in binary. The real mining target is &quot;enough leading zero
                    bits&quot;.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ===== Blockchain Verification ===== */}
        <div className="verify-section">
          <h2 className="section-title">Blockchain Verification</h2>
          <p className="section-sub">Validate every block in order and produce an integrity report.</p>
          <Button onClick={verifyChain} disabled={verifying || miningIndex !== null}>
            {verifying ? "Verifying…" : "✅ Verify Entire Blockchain"}
          </Button>

          {report && (
            <Card className="verify-report">
              <ul className="verify-list">
                {report.results.map((r) => (
                  <li key={r.index} className={r.valid ? "vok" : "vbad"}>
                    {r.index === 0 ? "Genesis" : `Block ${r.index}`}: {r.valid ? "✓ Valid" : "✗ Invalid"}
                  </li>
                ))}
              </ul>
              <div className="verify-grid">
                <div><span>Total Blocks</span><strong>{report.total}</strong></div>
                <div><span>Valid Blocks</span><strong>{report.validBlocks}</strong></div>
                <div><span>Invalid Blocks</span><strong>{report.invalidBlocks}</strong></div>
                <div><span>Broken Links</span><strong>{report.brokenLinks}</strong></div>
                <div><span>Verification Time</span><strong>{report.time} ms</strong></div>
                <div>
                  <span>Network Status</span>
                  <strong className={report.secure ? "net-secure" : "net-insecure"}>
                    {report.secure ? "🟢 Secure" : "🔴 Insecure"}
                  </strong>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* ===== Block Integrity Verification ===== */}
        <div className="integrity-section">
          <h2 className="section-title">Block Integrity Verification</h2>
          <p className="section-sub">
            Each block&apos;s stored hash is continuously re-checked against a freshly recomputed hash
            of its current data, nonce, and previous hash.
          </p>
          <div className="integrity-grid">
            {datas.map((_, i) => {
              const stored = storedHashes[i];
              const calc = hashes[i] || "";
              const prevH = i === 0 ? GENESIS_PREV : hashes[i - 1] || "";
              const mismatch = stored && stored !== calc;
              const statusClass = mismatch ? "bad" : stored ? "ok" : "";
              const status = !stored ? "Not mined yet" : mismatch ? "Hash Mismatch Detected" : "Valid";
              return (
                <Card key={i} className={`integrity-card ${statusClass}`}>
                  <div className="ic-head">
                    <h3>{i === 0 ? "Genesis" : `Block ${i}`}</h3>
                    <span className={`pill ${statusClass}`}>{status}</span>
                  </div>
                  <div className="ic-rows">
                    <div><span>Stored Hash</span><code>{stored ? stored.slice(0, 24) + "…" : "—"}</code></div>
                    <div><span>Current Calculated Hash</span><code>{calc ? calc.slice(0, 24) + "…" : "…"}</code></div>
                    <div><span>Previous Hash</span><code>{prevH.slice(0, 24)}…</code></div>
                    <div><span>Current Nonce</span><code>{nonces[i]}</code></div>
                    <div><span>Timestamp</span><code>{storedTimes[i] || "—"}</code></div>
                    <div><span>Difficulty</span><code>{difficulty} zero{difficulty === 1 ? "" : "s"} ({prefix})</code></div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="callout">
          <strong>The core insight — immutability:</strong> mine the whole chain so
          every block is valid, then change the data in an early block. Its hash
          stops matching the difficulty, and because each block embeds the previous
          block&apos;s hash, <em>every</em> block after it turns invalid too. To
          cheat the chain you&apos;d have to re-mine all of them — which is exactly
          what makes a real blockchain tamper-proof. Raise the difficulty and watch
          mining take dramatically longer.
        </div>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/portfolio">← Portfolio</Link>
        <Link className="btn primary" href="/">Back to Home ↑</Link>
      </nav>
    </>
  );
}
