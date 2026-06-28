// Shared CoinGecko helpers (free public API — no key needed).
const BASE = "https://api.coingecko.com/api/v3";

// simple/price for a set of coin ids, including 24h change. Used by the
// portfolio page (and a good reference for the prices page).
export async function fetchSimplePrices(ids, vs = "usd") {
  if (!ids.length) return {};
  const url = `${BASE}/simple/price?ids=${ids.join(",")}&vs_currencies=${vs}&include_24hr_change=true`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Top coins by market cap, with 7-day sparkline data and 24h change.
export async function fetchMarkets(vs = "usd", perPage = 20) {
  const url =
    `${BASE}/coins/markets?vs_currency=${vs}&order=market_cap_desc` +
    `&per_page=${perPage}&page=1&sparkline=true&price_change_percentage=24h`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Detailed price series for ONE coin over `days` (1 / 7 / 30) — for the live
// chart modal. Returns a flat array of prices.
export async function fetchMarketChart(id, vs = "usd", days = 7) {
  const url = `${BASE}/coins/${id}/market_chart?vs_currency=${vs}&days=${days}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.prices || []).map((p) => p[1]);
}

export function formatMoney(n, currency = "usd") {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const code = currency.toUpperCase();
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: Number(n) < 1 ? 6 : 2,
  });
}
