import Link from "next/link";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import ConnectWallet from "@/components/ConnectWallet";

export default function HomePage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <header className="hero hero-xl">
        <div className="bg-blobs" aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
        </div>
        <div className="container">
          <Reveal as="span" className="badge">
            Crypto Portfolio &amp; Analytics Studio
          </Reveal>
          <Reveal as="h1" className="display" delay={60}>
            Track crypto
            <br />
            like a <span className="grad">studio</span>.
          </Reveal>
          <Reveal as="p" className="lead" delay={140}>
            ChainFolio turns raw market data into a beautiful, real-time
            dashboard. Live prices, portfolio analytics and on-chain history —
            crafted with the precision of a design studio.
          </Reveal>
          <Reveal className="btn-row" delay={220}>
            <Link className="btn primary lg" href="/signup">
              Get started — it&apos;s free
            </Link>
            <Link className="btn ghost lg" href="/dashboard">
              Live demo →
            </Link>
          </Reveal>
        </div>
      </header>

      {/* ===== Marquee strip ===== */}
      <Marquee
        items={[
          "Real-time prices",
          "Portfolio analytics",
          "On-chain history",
          "Wallet ready",
          "Web3 native",
        ]}
      />

      {/* ===== Features ===== */}
      <section className="container">
        <Reveal as="h2" className="section-title big">
          Built for the Web3 workflow
        </Reveal>
        <Reveal as="p" className="section-sub" delay={60}>
          The patterns a real dApp relies on — global state, real-time data and
          clean data tables — crafted from scratch.
        </Reveal>
        <div className="grid cols-3">
          {[
            { i: "🔌", t: "Connect once, everywhere", d: "Global wallet state means you connect once and every page instantly knows your address — even after a refresh." },
            { i: "⚡", t: "Real-time data", d: "Live prices fetched with async/await, with graceful loading, success and error states. No frozen screens." },
            { i: "📊", t: "Clean data tables", d: "Transaction history rendered from arrays of objects with instant filtering — exactly how on-chain data is handled." },
          ].map((f, idx) => (
            <Reveal key={f.t} delay={idx * 90}>
              <Card className="feature-card">
                <div className="ico">{f.i}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Explore ===== */}
      <section className="container">
        <Reveal as="h2" className="section-title big">
          Explore the studio
        </Reveal>
        <div className="grid cols-2">
          <Reveal>
            <Link className="card explore-card" href="/dashboard">
              <div className="ico">📈</div>
              <h3>Live Dashboard</h3>
              <p>Real-time token prices and 24h changes from the CoinGecko API.</p>
              <span className="more">Open →</span>
            </Link>
          </Reveal>
          <Reveal delay={90}>
            <Link className="card explore-card" href="/history">
              <div className="ico">🧾</div>
              <h3>Transaction History</h3>
              <p>A filterable, responsive table of mock on-chain transactions.</p>
              <span className="more">Open →</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="container">
        <Reveal>
          <div className="cta-band">
            <div>
              <h2 className="cta-title">Ready to track your portfolio?</h2>
              <p className="cta-sub">Create a free account or connect a wallet to begin.</p>
            </div>
            <div className="cta-actions">
              <Link className="btn primary lg" href="/signup">Sign up</Link>
              <ConnectWallet />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
