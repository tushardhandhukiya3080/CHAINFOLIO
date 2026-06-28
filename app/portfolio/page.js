"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { COIN_OPTIONS, COIN_BY_ID } from "@/lib/coins";
import { fetchSimplePrices, formatMoney } from "@/lib/coingecko";

const STORAGE_KEY = "chainfolio_holdings";
const STATE = { LOADING: "loading", SUCCESS: "success", ERROR: "error", IDLE: "idle" };

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [holdings, setHoldings] = useState([]); // [{ id, amount }]
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState(STATE.IDLE);

  // Add-form state
  const [coinId, setCoinId] = useState(COIN_OPTIONS[0].id);
  const [amount, setAmount] = useState("");

  // Load persisted holdings on mount.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setHoldings(saved);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  // Persist whenever holdings change.
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings, mounted]);

  // The set of coin ids we need prices for.
  const ids = useMemo(() => holdings.map((h) => h.id), [holdings]);
  const idsKey = ids.join(",");

  const loadPrices = useCallback(async (idList) => {
    if (!idList.length) {
      setStatus(STATE.IDLE);
      return;
    }
    setStatus(STATE.LOADING);
    try {
      const data = await fetchSimplePrices(idList);
      setPrices(data);
      setStatus(STATE.SUCCESS);
    } catch {
      setStatus(STATE.ERROR);
    }
  }, []);

  // Re-fetch prices when the set of held coins changes.
  useEffect(() => {
    if (mounted) loadPrices(idsKey ? idsKey.split(",") : []);
  }, [idsKey, mounted, loadPrices]);

  // ----- mutations -----
  function addHolding(e) {
    e.preventDefault();
    const amt = Number(amount);
    if (!coinId || !amt || amt <= 0) return;
    setHoldings((prev) => {
      const existing = prev.find((h) => h.id === coinId);
      if (existing) {
        return prev.map((h) => (h.id === coinId ? { ...h, amount: h.amount + amt } : h));
      }
      return [...prev, { id: coinId, amount: amt }];
    });
    setAmount("");
  }

  function editAmount(id, value) {
    const amt = value === "" ? 0 : Number(value);
    setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, amount: amt } : h)));
  }

  function removeHolding(id) {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }

  // ----- derived totals -----
  const rows = holdings.map((h) => {
    const meta = COIN_BY_ID[h.id] || { symbol: h.id, name: h.id };
    const p = prices[h.id];
    const price = p?.usd ?? null;
    const change = p?.usd_24h_change ?? null;
    const value = price != null ? h.amount * price : null;
    return { ...h, meta, price, change, value };
  });

  const totalValue = rows.reduce((s, r) => s + (r.value || 0), 0);
  // Weighted 24h change across the whole portfolio.
  const weighted = rows.reduce(
    (acc, r) => {
      if (r.value != null && r.change != null) {
        acc.num += r.value * r.change;
        acc.den += r.value;
      }
      return acc;
    },
    { num: 0, den: 0 }
  );
  const total24h = weighted.den > 0 ? weighted.num / weighted.den : null;

  if (!mounted) {
    return (
      <section className="container" style={{ paddingTop: 90 }}>
        <Spinner label="Loading portfolio…" />
      </section>
    );
  }

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Your portfolio</span>
          <h1 className="display">
            Your <span className="grad">portfolio</span>
          </h1>
          <p className="lead">
            Add your holdings and value them live against real CoinGecko prices.
            Everything is saved in your browser — no account needed.
          </p>
        </div>
      </header>

      <section className="container">
        {/* ===== Add form ===== */}
        <Card>
          <h3 style={{ marginTop: 0, textTransform: "uppercase" }}>Add a holding</h3>
          <form className="holding-form" onSubmit={addHolding}>
            <div className="field" style={{ margin: 0 }}>
              <label>Coin</label>
              <select value={coinId} onChange={(e) => setCoinId(e.target.value)}>
                {COIN_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Amount</label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button type="submit">+ Add</Button>
          </form>
        </Card>

        {/* ===== Empty state ===== */}
        {holdings.length === 0 ? (
          <Card className="empty-state" style={{ marginTop: 20 }}>
            <div className="ico">📭</div>
            <h3>No assets yet</h3>
            <p>Add your first holding above to start tracking your portfolio value.</p>
          </Card>
        ) : (
          <>
            {/* ===== Summary banner ===== */}
            <Card className="portfolio-banner" style={{ marginTop: 20 }}>
              <div>
                <div className="pb-label">Total portfolio value</div>
                <div className="pb-value">
                  {status === STATE.SUCCESS ? formatMoney(totalValue) : status === STATE.ERROR ? "—" : "…"}
                </div>
              </div>
              {total24h != null && status === STATE.SUCCESS && (
                <span className={`pill ${total24h >= 0 ? "ok" : "bad"}`}>
                  {total24h >= 0 ? "▲" : "▼"} {Math.abs(total24h).toFixed(2)}% 24h
                </span>
              )}
            </Card>

            {status === STATE.ERROR && (
              <p className="status error" style={{ marginTop: 16 }}>
                Couldn&apos;t fetch live prices (CoinGecko rate limit). Values shown
                as “—”.{" "}
                <button className="linklike" onClick={() => loadPrices(ids)}>
                  Retry
                </button>
              </p>
            )}

            {/* ===== Holdings table ===== */}
            <Card className="table-card" style={{ marginTop: 16 }}>
              <div className="table-scroll">
                <table className="tx-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Amount</th>
                      <th>Price</th>
                      <th>Value</th>
                      <th>24h</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.meta.symbol}</strong>{" "}
                          <span className="muted-cell">{r.meta.name}</span>
                        </td>
                        <td>
                          <input
                            className="amount-input"
                            type="number"
                            step="any"
                            min="0"
                            value={r.amount}
                            onChange={(e) => editAmount(r.id, e.target.value)}
                          />
                        </td>
                        <td className="mono">
                          {status === STATE.LOADING && r.price == null ? "…" : formatMoney(r.price)}
                        </td>
                        <td className="mono">{r.value != null ? formatMoney(r.value) : "—"}</td>
                        <td>
                          {r.change == null ? (
                            <span className="muted-cell">—</span>
                          ) : (
                            <span className={r.change >= 0 ? "chg-up" : "chg-down"}>
                              {r.change >= 0 ? "▲" : "▼"} {Math.abs(r.change).toFixed(2)}%
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn ghost sm"
                            onClick={() => removeHolding(r.id)}
                            aria-label={`Remove ${r.meta.symbol}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-foot">
                {holdings.length} asset{holdings.length !== 1 ? "s" : ""} ·{" "}
                {status === STATE.SUCCESS ? `Total ${formatMoney(totalValue)}` : "valuing…"}
              </div>
            </Card>
          </>
        )}
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/prices">← Live Prices</Link>
        <Link className="btn primary" href="/simulator">Block Simulator →</Link>
      </nav>
    </>
  );
}
