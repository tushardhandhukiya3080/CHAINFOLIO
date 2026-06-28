"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import Sparkline from "@/components/Sparkline";
import { fetchMarkets, formatMoney } from "@/lib/coingecko";

const STATE = { LOADING: "loading", SUCCESS: "success", ERROR: "error" };
const CURRENCIES = ["usd", "eur", "inr"];
const CACHE_TTL = 60_000; // 1 min — be gentle with the free API
const COOLDOWN = 8_000; // debounce manual refresh

const cacheKey = (vs) => `chainfolio_markets_${vs}`;
function readCache(vs) {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(vs)) || "null");
  } catch {
    return null;
  }
}
function writeCache(vs, data) {
  try {
    localStorage.setItem(cacheKey(vs), JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* ignore */
  }
}

export default function PricesPage() {
  const [currency, setCurrency] = useState("usd");
  const [coins, setCoins] = useState([]);
  const [status, setStatus] = useState(STATE.LOADING);
  const [notice, setNotice] = useState(""); // e.g. "showing cached" on 429
  const [updatedAt, setUpdatedAt] = useState("");
  const [cooling, setCooling] = useState(false);

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("rank"); // rank | price | change | mcap
  const [sortDir, setSortDir] = useState("asc");

  const coolTimer = useRef(null);

  const load = useCallback(async (vs, { force = false } = {}) => {
    setNotice("");
    const cached = readCache(vs);

    // Fresh cache → use it, skip the network entirely.
    if (!force && cached && Date.now() - cached.ts < CACHE_TTL) {
      setCoins(cached.data);
      setStatus(STATE.SUCCESS);
      setUpdatedAt(new Date(cached.ts).toLocaleTimeString());
      return;
    }

    // Show stale cache immediately (if any) while we refetch.
    if (cached) setCoins(cached.data);
    setStatus(cached ? STATE.SUCCESS : STATE.LOADING);

    try {
      const data = await fetchMarkets(vs, 20);
      setCoins(data);
      writeCache(vs, data);
      setUpdatedAt(new Date().toLocaleTimeString());
      setStatus(STATE.SUCCESS);
    } catch (e) {
      const rate = e?.message === "RATE_LIMIT";
      if (cached) {
        // Never get stuck: fall back to cached data with a clear notice.
        setCoins(cached.data);
        setStatus(STATE.SUCCESS);
        setNotice(rate ? "Rate-limited by CoinGecko — showing cached prices." : "Couldn't refresh — showing cached prices.");
        setUpdatedAt(new Date(cached.ts).toLocaleTimeString());
      } else {
        setStatus(STATE.ERROR);
        setNotice(rate ? "CoinGecko rate limit hit (HTTP 429). Try again shortly." : "Couldn't load prices.");
      }
    }
  }, []);

  // Load on mount and whenever the currency changes (cached per currency).
  useEffect(() => {
    load(currency);
  }, [currency, load]);

  // Debounced manual refresh.
  function refresh() {
    if (cooling) return;
    load(currency, { force: true });
    setCooling(true);
    coolTimer.current = setTimeout(() => setCooling(false), COOLDOWN);
  }
  useEffect(() => () => clearTimeout(coolTimer.current), []);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  }
  const sortInd = (key) => (sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : "");

  // Filter + sort (client-side; no extra network calls).
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = coins.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
    const pick = (c) => {
      switch (sortKey) {
        case "price": return c.current_price ?? 0;
        case "change": return c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? 0;
        case "mcap": return c.market_cap ?? 0;
        default: return c.market_cap_rank ?? 9999;
      }
    };
    list = [...list].sort((a, b) => (pick(a) - pick(b)) * (sortDir === "asc" ? 1 : -1));
    return list;
  }, [coins, query, sortKey, sortDir]);

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Live data · CoinGecko API</span>
          <h1 className="display">
            Live <span className="grad">prices</span>
          </h1>
          <p className="lead">
            Top 20 coins by market cap with 7-day trends — fetched from the free
            CoinGecko API. Search, sort, and switch currency.
          </p>
        </div>
      </header>

      <section className="container">
        {/* ===== Controls ===== */}
        <div className="prices-controls">
          <input
            className="search-input"
            type="search"
            placeholder="Search coin…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="fiat-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Currency"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
          <Button onClick={refresh} disabled={cooling || status === STATE.LOADING}>
            {cooling ? "Wait…" : status === STATE.LOADING ? "Refreshing…" : "↻ Refresh"}
          </Button>
          {updatedAt && status === STATE.SUCCESS && (
            <span className="pill">Updated {updatedAt}</span>
          )}
        </div>

        {notice && <p className="status error" style={{ marginTop: 0 }}>{notice}</p>}

        {/* ===== States ===== */}
        {status === STATE.LOADING && <Spinner label="Fetching live prices…" />}

        {status === STATE.ERROR && (
          <Card className="error-state">
            <div className="ico">⚠️</div>
            <h3>Couldn&apos;t load prices</h3>
            <p>{notice || "Please try again in a moment."}</p>
            <Button onClick={() => load(currency, { force: true })}>↻ Retry</Button>
          </Card>
        )}

        {status === STATE.SUCCESS && (
          <Card className="table-card">
            <div className="table-scroll">
              <table className="tx-table markets-table">
                <thead>
                  <tr>
                    <th>Coin</th>
                    <th className="sortable" onClick={() => toggleSort("price")}>Price{sortInd("price")}</th>
                    <th className="sortable" onClick={() => toggleSort("change")}>24h%{sortInd("change")}</th>
                    <th className="sortable" onClick={() => toggleSort("mcap")}>Market Cap{sortInd("mcap")}</th>
                    <th>7d</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No coins match “{query}”.</td></tr>
                  ) : (
                    rows.map((c) => {
                      const change = c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h;
                      const up = (change ?? 0) >= 0;
                      return (
                        <tr key={c.id}>
                          <td>
                            <span className="coin-cell">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img className="coin-logo" src={c.image} alt="" width={26} height={26} loading="lazy" />
                              <span>
                                <strong>{c.symbol?.toUpperCase()}</strong>{" "}
                                <span className="muted-cell">{c.name}</span>
                              </span>
                            </span>
                          </td>
                          <td className="mono">{formatMoney(c.current_price, currency)}</td>
                          <td>
                            {change == null ? <span className="muted-cell">—</span> : (
                              <span className={up ? "chg-up" : "chg-down"}>
                                {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                              </span>
                            )}
                          </td>
                          <td className="mono">{formatMoney(c.market_cap, currency)}</td>
                          <td><Sparkline data={c.sparkline_in_7d?.price || []} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-foot">
              Showing {rows.length} of {coins.length} coins · prices in {currency.toUpperCase()}
            </div>
          </Card>
        )}

        <div className="callout">
          <strong>Why CoinGecko?</strong> No API key, completely free, and directly
          relevant to Web3. Responses are cached for a minute and refreshes are
          throttled so we stay within the free tier&apos;s limits.
        </div>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/concepts">← Concepts</Link>
        <Link className="btn primary" href="/portfolio">Portfolio →</Link>
      </nav>
    </>
  );
}
