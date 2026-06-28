# ChainFolio — A 4-Page Web3 Website

A single, cohesive **Next.js** website built from scratch to bridge Web3 theory
and hands-on implementation. It has four connected pages, a dark **neo-brutalist**
theme, the **GANEY** display font, and a shared navigation bar.

> **Theme:** Blockchain / Web3 Introduction.

## The four pages

| # | Page | Route | What it does |
|---|------|-------|--------------|
| 1 | **Home / Landing** | `/` | Hero/about, three feature cards (tamper-evident, decentralized, transparent), links to every page, and a footer with author + GitHub + batch. |
| 2 | **Concepts** | `/concepts` | Visual side-by-side comparison cards: **Web2 vs Web3**, **Ethereum vs Bitcoin**, **Public Key vs Private Key**, **Blockchain vs Traditional Database** — explained in plain language. |
| 3 | **Live Prices** | `/prices` | Live crypto dashboard fetching real-time prices + 24h change from the **CoinGecko API** (BTC, ETH, SOL, MATIC, ARB) with green ▲ / red ▼ arrows, a **Refresh** button, and loading/success/error states. |
| 4 | **Block Simulator** | `/simulator` | Interactive block-mining simulator (pure JS + Web Crypto **SHA-256**): edit data, **mine** the nonce until the hash starts with `00`, chain two blocks, and watch tampering with Block 1 break Block 2. |

A bonus **Login / Sign Up** flow (`/login`, `/signup`) with mock auth is also included.

## Navigation & structure
- Sticky **navigation bar on every page**, linking all four pages, with the
  **active page highlighted**.
- Consistent styling everywhere: one theme (`app/globals.css`), one font, shared
  components (`Navbar`, `Footer`, `Card`, `Button`, `Reveal`, `Marquee`, …).

## Tech stack
- **Next.js 16** (App Router) + **React 19**, JavaScript (no TypeScript).
- Self-hosted **GANEY** font via `next/font/local`.
- No Web3 libraries — Live Prices uses `fetch`, the simulator uses the native
  Web Crypto API, so the underlying logic stays fully visible.

```
blockchain/
├── app/
│   ├── layout.js              # font + navbar + footer wrap every page
│   ├── globals.css            # neo-brutalist theme + all component styles
│   ├── page.js                # Page 1 — Home / Landing
│   ├── concepts/page.js       # Page 2 — Concepts
│   ├── prices/page.js         # Page 3 — Live Prices ("use client")
│   ├── simulator/page.js      # Page 4 — Block Simulator ("use client")
│   ├── login/page.js          # bonus auth (Sign In)
│   └── signup/page.js         # bonus auth (Sign Up)
├── components/                # Navbar, Footer, Card, Button, Reveal, Marquee, …
├── context/                   # WalletContext, AuthContext (global state)
├── fonts/Ganey.woff2          # self-hosted display font
└── render.yaml                # Render deployment blueprint
```

## How to install and run

Requires Node.js 18+.

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build    # builds with webpack
npm run start
```

## Deployment
Deployed on **Render** as a Node web service (see `render.yaml`). Any push to
`main` triggers an automatic redeploy.

## Known issues / things to improve
- **CoinGecko rate limits:** the free API can return `429` under rapid
  refreshing; the Live Prices page shows an error state with a Retry button.
- **Simulator difficulty is low (`00`)** so mining feels instant for learning;
  real proof-of-work uses far more leading zeros.
- **Auth is mock** (stored in `localStorage`) — for demonstration only.
- No automated tests yet; verified manually and via `next build`.
