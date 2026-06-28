/*
  Mock on-chain transaction history.

  This mirrors the shape of data a blockchain explorer / RPC node returns: an
  array of objects you map, filter, and render. Swapping this for a real
  `provider.getHistory(address)` call later won't change your rendering code.
*/
export const TRANSACTIONS = [
  { hash: "0x9af2c1e7b4d83a012f6c5e9d7a1b8c4e2f0d6a93", method: "Swap",     token: "ETH → USDC", amount: "1.25 ETH",  status: "Success", time: "2026-06-28 09:14" },
  { hash: "0x3b71d8a09c5e2f146a8b0d3c7e9f1a2b4c6d8e0f", method: "Transfer", token: "USDC",        amount: "500 USDC",  status: "Success", time: "2026-06-27 18:42" },
  { hash: "0xc0ffee254729296a45a3885639AC7E10F9d54979", method: "Approve",  token: "DAI",         amount: "—",         status: "Failed",  time: "2026-06-27 12:03" },
  { hash: "0x77a1f5b3e8c2d409a6b1c0e4d7f2a9b8c3e1d6f0", method: "Stake",    token: "ETH",         amount: "4.00 ETH",  status: "Success", time: "2026-06-26 21:30" },
  { hash: "0x1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4", method: "Mint",     token: "NFT #1024",   amount: "0.08 ETH",  status: "Pending", time: "2026-06-26 15:11" },
  { hash: "0xdeadbeef00112233445566778899aabbccddeeff", method: "Swap",     token: "ARB → ETH",   amount: "320 ARB",   status: "Failed",  time: "2026-06-25 08:57" },
  { hash: "0x5e4d3c2b1a09f8e7d6c5b4a3928170695f4e3d2c", method: "Transfer", token: "ETH",         amount: "0.50 ETH",  status: "Success", time: "2026-06-24 23:48" },
  { hash: "0xabc1230098fedcba7654321001234567890abcde", method: "Bridge",   token: "USDC → Base", amount: "1,000 USDC",status: "Pending", time: "2026-06-24 10:22" },
  { hash: "0x0f1e2d3c4b5a69788796a5b4c3d2e1f0a9b8c7d6", method: "Claim",    token: "ARB",         amount: "150 ARB",   status: "Success", time: "2026-06-23 14:05" },
  { hash: "0x246813579bdf02468ace13579bdf02468ace1357", method: "Swap",     token: "SOL → USDC",  amount: "12 SOL",    status: "Failed",  time: "2026-06-22 19:39" },
];

// The filters available on the history page.
export const STATUS_FILTERS = ["All", "Success", "Pending", "Failed"];
