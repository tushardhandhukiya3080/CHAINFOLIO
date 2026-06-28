"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";
import InfoTip from "@/components/InfoTip";
import { sha256Hex, blockString, GENESIS_PREV } from "@/lib/hash";

const INITIAL = [
  "Genesis block",
  "Alice pays Bob 5 coins",
  "Bob pays Carol 2 coins",
  "Carol pays Dave 1 coin",
  "Dave pays Erin 3 coins",
];

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
    setMiningIndex(null);
  }

  // Mine every block in order (each chains off the freshly mined previous one).
  async function mineAll() {
    let prev = GENESIS_PREV;
    const newNonces = [...nonces];
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
      prev = h;
      setStats((s) => ({ ...s, [i]: { attempts: n, elapsed, hps: Math.round(n / (elapsed / 1000)) || n, done: true } }));
    }
    setNonces(newNonces);
    setMiningIndex(null);
  }

  function reset() {
    setDatas(INITIAL);
    setNonces(INITIAL.map(() => 0));
    setStats({});
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
            <Button variant="ghost" onClick={reset} disabled={miningIndex !== null}>
              Reset
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
                    <span className={`pill ${valid ? "ok" : "bad"}`}>
                      {valid ? "✓ Valid" : "✗ Invalid"}
                    </span>
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
                </article>
                {i < datas.length - 1 && <div className="link-arrow chain-down" aria-hidden="true">↓</div>}
              </div>
            );
          })}
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
