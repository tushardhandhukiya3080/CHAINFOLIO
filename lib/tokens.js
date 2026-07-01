// Well-known ERC-20 tokens on Ethereum mainnet. `id` is the CoinGecko id used
// to price each token; `decimals` lets us format the raw on-chain balance.
export const ERC20_TOKENS = [
  { symbol: "USDC", name: "USD Coin",        id: "usd-coin",        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  { symbol: "USDT", name: "Tether",          id: "tether",          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
  { symbol: "DAI",  name: "Dai",             id: "dai",             address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", id: "wrapped-bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  { symbol: "WETH", name: "Wrapped Ether",   id: "weth",            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
  { symbol: "LINK", name: "Chainlink",       id: "chainlink",       address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
  { symbol: "UNI",  name: "Uniswap",         id: "uniswap",         address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
  { symbol: "SHIB", name: "Shiba Inu",       id: "shiba-inu",       address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18 },
  { symbol: "ARB",  name: "Arbitrum",        id: "arbitrum",        address: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", decimals: 18 },
  { symbol: "PEPE", name: "Pepe",            id: "pepe",            address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18 },
];
