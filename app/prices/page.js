"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import SkeletonCard from "@/components/SkeletonCard";

// ethereum + bitcoin are required by the brief; the rest are the optional extras.
const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: "Ξ" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: "◎" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", icon: "⬡" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum", icon: "◆" },
];

const IDS = COINS.map((c) => c.id).join(",");
const ENDPOINT = `https://api.coingecko.com/api/v3/simple/price?ids=${IDS}&vs_currencies=usd&include_24hr_change=true`;

const STATE = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };

function usd(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 4 : 2,
  });
}

export default function PricesPage() {
  const [status, setStatus] = useState(STATE.LOADING);
  const [data, setData] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");

  // One async fetch, three explicit UI states (loading / success / error).
  const load = useCallback(async () => {
    setStatus(STATE.LOADING);
    try {
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json || !json.bitcoin) throw new Error("Empty response");
      setData(json);
      setUpdatedAt(new Date().toLocaleTimeString());
      setStatus(STATE.SUCCESS);
    } catch {
      setStatus(STATE.ERROR);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Live data · CoinGecko API</span>
          <h1 className="display">
            Live <span className="grad">prices</span>
          </h1>
          <p className="lead">
            Real-time prices and 24-hour changes, fetched directly from the free
            CoinGecko public API — no API key required.
          </p>
          <div className="btn-row">
            <Button onClick={load} disabled={status === STATE.LOADING}>
              {status === STATE.LOADING ? "Refreshing…" : "↻ Refresh"}
            </Button>
            {status === STATE.SUCCESS && (
              <span className="pill" style={{ alignSelf: "center" }}>
                Updated {updatedAt}
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="container">
        {status === STATE.LOADING && (
          <>
            <Spinner label="Fetching live prices…" />
            <div className="grid cols-3" style={{ marginTop: 18 }}>
              {COINS.map((c) => (
                <SkeletonCard key={c.id} />
              ))}
            </div>
          </>
        )}

        {status === STATE.ERROR && (
          <Card className="error-state">
            <div className="ico">⚠️</div>
            <h3>Couldn&apos;t load prices</h3>
            <p>
              The CoinGecko API didn&apos;t respond (it rate-limits heavy use on
              the free tier). Please try again in a moment.
            </p>
            <Button onClick={load}>↻ Retry</Button>
          </Card>
        )}

        {status === STATE.SUCCESS && (
          <div className="grid cols-3">
            {COINS.map((coin) => {
              const entry = data[coin.id];
              const price = entry?.usd;
              const change = entry?.usd_24h_change;
              const hasChange = change != null && !Number.isNaN(change);
              const up = hasChange && change >= 0;
              return (
                <Card key={coin.id} className="token-card">
                  <div className="token-head">
                    <span className="coin-badge">{coin.icon}</span>
                    <div>
                      <div className="coin-name">{coin.name}</div>
                      <div className="coin-symbol">{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="coin-price">{usd(price)}</div>
                  <div className={`coin-change ${hasChange ? (up ? "up" : "down") : ""}`}>
                    {hasChange ? (
                      <>
                        <span className="arrow">{up ? "▲" : "▼"}</span>
                        {Math.abs(change).toFixed(2)}% <span className="muted">24h</span>
                      </>
                    ) : (
                      <span className="muted">No 24h data</span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="callout">
          <strong>Why CoinGecko?</strong> No API key, completely free, and
          directly relevant to Web3. Fetching live ETH/BTC prices is a rite of
          passage for every Web3 developer.
        </div>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/concepts">← Concepts</Link>
        <Link className="btn primary" href="/simulator">Next: Block Simulator →</Link>
      </nav>
    </>
  );
}
