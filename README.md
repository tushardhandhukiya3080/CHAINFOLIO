# ChainFolio — Crypto Portfolio & Analytics Dashboard

A 3-page **Next.js** application built from scratch as a **bridge into Web3
frontend development**. The focus isn't visuals — it's mastering the
*architectural* patterns a real dApp depends on: reusable components, **global
state** that persists across pages, clean routing, and **asynchronous data
handling with proper loading / success / error states**.

> When you later swap the CoinGecko REST API for a blockchain provider
> (ethers.js / viem / wagmi), the frontend logic here stays the same — you just
> point your existing async skills at the chain.

## The 3-page blueprint

| # | Page | Route | What it does & why it matters for Web3 |
|---|------|-------|-----------------------------------------|
| 1 | **Landing** | `/` | Static intro + CTAs + **Connect Wallet**. Mirrors a dApp's pre-connect landing page. |
| 2 | **Analytics Dashboard** | `/dashboard` | Fetches live token prices from the **CoinGecko API** with `async/await`, rendering explicit **loading (spinner + skeletons)**, **success (cards)**, and **error (retry)** states. Shows a portfolio total that reads global wallet state. |
| 3 | **Transaction History** | `/history` | Renders a **filterable, responsive table** by mapping over an array of objects, with **Success / Pending / Failed** filters — the daily skill of manipulating on-chain data. |

## The four foundational pillars (and where they live)

1. **Component-based architecture** — reusable building blocks in
   [`components/`](components/): `Navbar`, `Footer`, `Button`, `Card`,
   `Spinner`, `SkeletonCard`, `ConnectWallet`.
2. **Global state management** — [`context/WalletContext.js`](context/WalletContext.js)
   uses React Context + `localStorage`. **Connect once on the landing page and
   every page knows your address** — it even survives a refresh. This is the
   exact pattern a wallet connection needs.
3. **Async JavaScript** — the dashboard ([`app/dashboard/page.js`](app/dashboard/page.js))
   is one `async/await` fetch with three explicit UI states. The same shape as
   fetching a token balance from a chain.
4. **Semantic HTML & responsive layout** — `<header>`, `<section>`, `<nav>`,
   `<table>`, CSS Grid + Flexbox, and a mobile menu, so the UI never breaks when
   data states change.

## Project structure

```
blockchain/
├── app/
│   ├── layout.js            # WalletProvider + Navbar + Footer wrap every page
│   ├── globals.css          # theme tokens + all component styles
│   ├── page.js              # Page 1 — Landing
│   ├── dashboard/page.js    # Page 2 — Analytics Dashboard ("use client")
│   └── history/page.js      # Page 3 — Transaction History ("use client")
├── components/              # reusable UI building blocks
│   ├── Navbar.js  Footer.js  Button.js  Card.js
│   ├── Spinner.js  SkeletonCard.js  ConnectWallet.js
├── context/
│   └── WalletContext.js     # global wallet state (the Web3 bridge)
├── lib/
│   └── transactions.js      # mock on-chain transaction data
├── next.config.mjs          # allows CoinGecko image domains
└── legacy-html/             # earlier plain-HTML experiments (reference only)
```

## How to install and run

Requires Node.js 18+.

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Known issues / things to improve

- **CoinGecko rate limits:** the free public API returns `429` under heavy
  refreshing. The dashboard shows the error state with a retry button; a
  production app would cache responses or proxy through a small backend.
- **Wallet connection is simulated** (a random `0x…` address) to focus on
  frontend architecture. Replacing `connect()` in `WalletContext` with an
  `ethers.js`/`wagmi` call is the next step — no other component needs to change.
- **Transaction data is mock** and lives in `lib/transactions.js`.
- **No auto-refresh / polling** on the dashboard yet (manual Refresh only).
- **No automated tests** — verified manually and via `next build`.
