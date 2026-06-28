"use client";

import { useEffect, useState } from "react";
import PriceChart from "./PriceChart";
import Spinner from "./Spinner";
import { fetchMarketChart, formatMoney } from "@/lib/coingecko";

const RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
];

export default function CoinChartModal({ coin, currency, onClose }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("loading");

  // Fetch the live series whenever the coin / currency / range changes.
  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchMarketChart(coin.id, currency, days)
      .then((prices) => {
        if (!active) return;
        setData(prices);
        setStatus(prices.length ? "success" : "error");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [coin.id, currency, days]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const change =
    coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h ?? 0;
  const up = change >= 0;
  const high = data.length ? Math.max(...data) : null;
  const low = data.length ? Math.min(...data) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${coin.name} live price chart`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-coin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="coin-logo" src={coin.image} alt="" width={34} height={34} />
            <div>
              <div className="coin-name">
                {coin.name} <span className="coin-symbol">{coin.symbol?.toUpperCase()}</span>
              </div>
              <div className="modal-price">
                {formatMoney(coin.current_price, currency)}{" "}
                <span className={up ? "chg-up" : "chg-down"}>
                  {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close chart">
            ✕
          </button>
        </div>

        <div className="modal-ranges" role="group" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              className={`chip ${days === r.days ? "active" : ""}`}
              aria-pressed={days === r.days}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {status === "loading" && (
          <div className="chart-loading">
            <Spinner label="Loading chart…" />
          </div>
        )}
        {status === "error" && (
          <p className="status error">
            Couldn&apos;t load the chart (CoinGecko rate limit). Try again in a moment.
          </p>
        )}
        {status === "success" && (
          <>
            <PriceChart data={data} up={up} />
            <div className="modal-stats">
              <div>
                <span>{RANGES.find((r) => r.days === days)?.label} High</span>
                <strong>{formatMoney(high, currency)}</strong>
              </div>
              <div>
                <span>{RANGES.find((r) => r.days === days)?.label} Low</span>
                <strong>{formatMoney(low, currency)}</strong>
              </div>
              <div>
                <span>Currency</span>
                <strong>{currency.toUpperCase()}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
