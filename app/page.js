import Link from "next/link";
import Card from "@/components/Card";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";

// Page 1 — Home / Landing. Theme: Blockchain / Web3 Introduction.
export default function HomePage() {
  return (
    <>
      {/* ===== Hero / About ===== */}
      <header className="hero hero-xl">
        <div className="container">
          <Reveal as="span" className="badge">
            Blockchain / Web3 Introduction
          </Reveal>
          <Reveal as="h1" className="display" delay={60}>
            Understand the
            <br />
            <span className="grad">blockchain</span>.
          </Reveal>
          <Reveal as="p" className="lead" delay={140}>
            Web3 is a new kind of internet where data and value live on a shared,
            tamper-evident ledger instead of one company&apos;s servers.
            ChainFolio explains the core ideas — then lets you use them: compare
            concepts, watch live prices, and mine your own blocks.
          </Reveal>
          <Reveal className="btn-row" delay={220}>
            <Link className="btn primary lg" href="/concepts">
              Learn the concepts
            </Link>
            <Link className="btn ghost lg" href="/simulator">
              Try the simulator →
            </Link>
          </Reveal>
        </div>
      </header>

      {/* ===== Marquee strip ===== */}
      <Marquee
        items={["Blockchain", "Web3", "Smart Contracts", "Decentralized", "On-chain"]}
      />

      {/* ===== Features / Benefits (at least 3, with icons) ===== */}
      <section className="container">
        <Reveal as="h2" className="section-title big">
          Why blockchain matters
        </Reveal>
        <Reveal as="p" className="section-sub" delay={60}>
          Three properties make blockchains different from the databases that run
          today&apos;s web.
        </Reveal>
        <div className="grid cols-3">
          {[
            { i: "🔗", t: "Tamper-evident", d: "Each block is cryptographically linked to the one before it. Change a past record and every block after it breaks — so fraud is instantly visible." },
            { i: "🌍", t: "Decentralized", d: "Thousands of independent computers hold the same copy of the data. No single company or government can quietly alter or shut it down." },
            { i: "👁️", t: "Transparent", d: "Anyone can verify transactions and code for themselves. You trust math and open rules, not a middleman's promise." },
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

      {/* ===== Explore the 3 other pages ===== */}
      <section className="container">
        <Reveal as="h2" className="section-title big">
          Explore the project
        </Reveal>
        <div className="grid cols-3">
          <Reveal>
            <Link className="card explore-card" href="/concepts">
              <div className="ico">🧠</div>
              <h3>Concepts</h3>
              <p>Side-by-side comparison cards for the fundamentals of Web3.</p>
              <span className="more">Open →</span>
            </Link>
          </Reveal>
          <Reveal delay={90}>
            <Link className="card explore-card" href="/prices">
              <div className="ico">📈</div>
              <h3>Live Prices</h3>
              <p>Real-time ETH &amp; BTC prices and 24h changes from CoinGecko.</p>
              <span className="more">Open →</span>
            </Link>
          </Reveal>
          <Reveal delay={180}>
            <Link className="card explore-card" href="/simulator">
              <div className="ico">⛏️</div>
              <h3>Block Simulator</h3>
              <p>Mine blocks, find a valid hash, and watch tampering break the chain.</p>
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
              <h2 className="cta-title">Ready to dig in?</h2>
              <p className="cta-sub">Start with the concepts, or jump straight to mining a block.</p>
            </div>
            <div className="cta-actions">
              <Link className="btn primary lg" href="/concepts">Get started</Link>
              <Link className="btn ghost lg" href="/prices">Live prices →</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
