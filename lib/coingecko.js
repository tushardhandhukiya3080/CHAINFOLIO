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

export function formatMoney(n, currency = "usd") {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const code = currency.toUpperCase();
  return Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: Number(n) < 1 ? 6 : 2,
  });
}
