"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import SkeletonCard from "@/components/SkeletonCard";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/context/WalletContext";

// Coins to show, plus a pretend "holding" for each so we can compute a portfolio
// total once a wallet is connected. (In real Web3 these balances come from chain.)
const COINS = [
  { id: "bitcoin", holding: 0.05 },
  { id: "ethereum", holding: 1.5 },
  { id: "solana", holding: 12 },
  { id: "arbitrum", holding: 300 },
  { id: "matic-network", holding: 800 },
  { id: "chainlink", holding: 40 },
];

const IDS = COINS.map((c) => c.id).join(",");
const ENDPOINT =
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${IDS}` +
  `&order=market_cap_desc&sparkline=false&price_change_percentage=24h`;

const HOLDINGS = Object.fromEntries(COINS.map((c) => [c.id, c.holding]));

function usd(n, max = 2) {
  // The API can return null/undefined for some fields — guard against it.
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: max,
  });
}

// The three explicit async states the brief asks for.
const STATE = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function DashboardPage() {
  const { isConnected, hydrated } = useWallet();
  const [status, setStatus] = useState(STATE.LOADING);
  const [coins, setCoins] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");

  // One async function, three outcomes. This is the exact shape of a Web3 call.
  const load = useCallback(async () => {
    setStatus(STATE.LOADING);
    try {
      const res = await fetch(ENDPOINT, { cache: "no-store" });
      if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error("Empty response");
      setCoins(data);
      setUpdatedAt(new Date().toLocaleTimeString());
      setStatus(STATE.SUCCESS);
    } catch {
      setStatus(STATE.ERROR);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Portfolio total = sum(holding × live price). Only meaningful once connected.
  const portfolioValue =
    status === STATE.SUCCESS
      ? coins.reduce((sum, c) => sum + (HOLDINGS[c.id] || 0) * (c.current_price || 0), 0)
      : 0;

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Live data · CoinGecko API</span>
          <h1>
            Analytics <span className="grad">Dashboard</span>
          </h1>
          <p className="lead">
            Real-time token prices fetched with <code>async/await</code>. Watch the
            loading, success, and error states behave gracefully.
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

      {/* ===== Portfolio banner — uses GLOBAL wallet state ===== */}
      <section className="container">
        <Card className="portfolio-banner">
          {hydrated && isConnected ? (
            <>
              <div>
                <div className="pb-label">Estimated portfolio value</div>
                <div className="pb-value">
                  {status === STATE.SUCCESS ? usd(portfolioValue) : "—"}
                </div>
              </div>
              <span className="pill ok">Wallet connected</span>
            </>
          ) : (
            <>
              <div>
                <div className="pb-label">Connect a wallet</div>
                <div className="pb-sub">
                  Connect to see your estimated portfolio value across these assets.
                </div>
              </div>
              <ConnectWallet />
            </>
          )}
        </Card>
      </section>

      {/* ===== The three async states ===== */}
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
            {coins.map((coin) => {
              const change = coin.price_change_percentage_24h;
              const hasChange = change != null && !Number.isNaN(change);
              const up = hasChange && change >= 0;
              const holding = HOLDINGS[coin.id] || 0;
              const price = coin.current_price;
              return (
                <Card key={coin.id} className="token-card">
                  <div className="token-head">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={40}
                      height={40}
                      className="token-img"
                      unoptimized
                    />
                    <div>
                      <div className="coin-name">{coin.name}</div>
                      <div className="coin-symbol">{coin.symbol?.toUpperCase()}</div>
                    </div>
                  </div>

                  <div className="coin-price">{usd(price, 4)}</div>

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

                  <div className="token-holding">
                    Holdings: {holding} {coin.symbol?.toUpperCase()} ·{" "}
                    <strong>{price == null ? "—" : usd(holding * price)}</strong>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/">← Home</Link>
        <Link className="btn primary" href="/history">View transaction history →</Link>
      </nav>
    </>
  );
}
