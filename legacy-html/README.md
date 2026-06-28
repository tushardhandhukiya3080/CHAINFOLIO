# Web3 Foundations 🪙

A multi-page website built **from scratch** with plain HTML, CSS, and JavaScript
to learn the core concepts of Web3 by building them, not just reading about them.

> Objective: bridge the gap between Web3 theory and hands-on implementation
> before moving deeper into Web3 development.

## Pages

| Page | File | Covers |
|------|------|--------|
| Home | `index.html` | What Web3 is · Web1→Web2→Web3 · the learning path |
| Module 1 | `blockchain.html` | Blocks, hashing, decentralization, consensus + **2 live demos** |
| Module 2 | `cryptocurrency.html` | Coins vs tokens, keys, wallets, transactions, gas |
| Module 3 | `smart-contracts.html` | Ethereum, Solidity, smart contracts, dApps |
| Module 4 | `ecosystem.html` | NFTs, DeFi, DAOs + where to go next |

## Interactive demos (on the Blockchain page)

1. **Live SHA-256 hashing** — type text, watch the real hash change. Uses the
   browser's built-in Web Crypto API (`crypto.subtle.digest`).
2. **Mini blockchain** — edit a block's data and watch every following block
   turn red, demonstrating why a blockchain is *tamper-evident*.

Both run entirely in your browser — no data leaves your machine, no internet
or build tools required.

## Project structure

```
blockchain/
├── index.html
├── blockchain.html
├── cryptocurrency.html
├── smart-contracts.html
├── ecosystem.html
├── css/
│   └── style.css        # shared theme (CSS variables, responsive grid, navbar)
└── js/
    └── main.js          # nav toggle, active-link, hashing + chain demos
```

## How to run

It's pure static HTML — no install step.

- **Easiest:** double-click `index.html` to open it in your browser.
- **Recommended (proper local server):** from this folder run one of:
  ```bash
  # Python 3
  python -m http.server 8000
  # then visit http://localhost:8000
  ```
  ```bash
  # Node (if you have it)
  npx serve
  ```

## What I practiced here

- Semantic, multi-page HTML with a shared, reusable navbar and footer
- A theme system using **CSS custom properties** + responsive grid layout
- A mobile hamburger menu and auto-highlighted active nav link
- Real cryptography in the browser (SHA-256) to make hashing tangible
- DOM manipulation and event handling in vanilla JS

## Next steps toward real Web3 dev

- Connect a wallet (MetaMask) to a page using **ethers.js**
- Write & deploy a smart contract with **Remix IDE** on the Sepolia testnet
- Turn one of these pages into a real **dApp** frontend
