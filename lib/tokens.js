import { formatUnits } from "viem";

// Curated major Ethereum-mainnet ERC-20 tokens. `id` is the CoinGecko id used to
// price each token; `decimals` lets us convert the raw on-chain balance.
export const ERC20_TOKENS = [
  { symbol: "USDC", name: "USD Coin",        id: "usd-coin",        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "USDT", name: "Tether",          id: "tether",          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "DAI",  name: "Dai",             id: "dai",             address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
  { symbol: "WETH", name: "Wrapped Ether",   id: "weth",            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", id: "wrapped-bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  { symbol: "LINK", name: "Chainlink",       id: "chainlink",       address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
  { symbol: "UNI",  name: "Uniswap",         id: "uniswap",         address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
  { symbol: "AAVE", name: "Aave",            id: "aave",            address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18 },
  { symbol: "MKR",  name: "Maker",           id: "maker",           address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", decimals: 18 },
  { symbol: "CRV",  name: "Curve DAO",       id: "curve-dao-token", address: "0xD533a949740bb3306d119CC777fa900bA034cd52", decimals: 18 },
  { symbol: "LDO",  name: "Lido DAO",        id: "lido-dao",        address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18 },
  { symbol: "SHIB", name: "Shiba Inu",       id: "shiba-inu",       address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18 },
  { symbol: "PEPE", name: "Pepe",            id: "pepe",            address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18 },
];

// Every CoinGecko id we need to price (native ETH + all tokens), de-duped.
export const PRICE_IDS = [...new Set(["ethereum", ...ERC20_TOKENS.map((t) => t.id)])];

/**
 * Convert a raw on-chain balance (bigint / string) into a human-readable number.
 * Pure — the piece we unit-test.
 */
export function toTokenAmount(raw, decimals) {
  if (raw == null) return 0;
  const big = typeof raw === "bigint" ? raw : BigInt(raw);
  return Number(formatUnits(big, decimals));
}

/** Human-readable, grouped balance string (e.g. 1,234.56). */
export function formatTokenBalance(raw, decimals, maxFractionDigits = 6) {
  return toTokenAmount(raw, decimals).toLocaleString("en-US", {
    maximumFractionDigits: maxFractionDigits,
  });
}
