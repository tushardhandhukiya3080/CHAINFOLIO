import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Concepts" };

// Each concept is a head-to-head comparison, explained in plain language.
const COMPARISONS = [
  {
    title: "Web2 vs Web3",
    a: { name: "Web2 (today)", icon: "🏢", points: [
      "Platforms (Google, Meta) own your data and accounts.",
      "You log in with a username and password they control.",
      "The company sets the rules and can ban or change things anytime.",
      "Value flows to the platform, not the users.",
    ]},
    b: { name: "Web3", icon: "🔑", points: [
      "You own your data and assets in your own wallet.",
      "You sign in with a crypto wallet — no central account.",
      "Rules live in open code anyone can inspect.",
      "Users can own a share of the networks they use.",
    ]},
  },
  {
    title: "Ethereum vs Bitcoin",
    a: { name: "Bitcoin", icon: "₿", points: [
      "Built to be digital money / a store of value.",
      "Deliberately simple scripting — focused on payments.",
      "Uses Proof of Work (mining) for security.",
      "Often called 'digital gold'.",
    ]},
    b: { name: "Ethereum", icon: "Ξ", points: [
      "A programmable 'world computer' for apps.",
      "Runs smart contracts in the EVM (Solidity).",
      "Switched to Proof of Stake in 2022 (energy-light).",
      "Powers DeFi, NFTs, DAOs and most dApps.",
    ]},
  },
  {
    title: "Public Key vs Private Key",
    a: { name: "Public Key / Address", icon: "📬", points: [
      "Like your account number or email address.",
      "Safe to share so others can send you funds.",
      "Derived from the private key (one-way).",
      "Identifies you on the network.",
    ]},
    b: { name: "Private Key", icon: "🔐", points: [
      "The secret that authorises spending.",
      "Signs transactions to prove they're really you.",
      "Must NEVER be shared — there's no password reset.",
      "Whoever holds it controls the funds.",
    ]},
  },
  {
    title: "Blockchain vs Traditional Database",
    a: { name: "Traditional Database", icon: "🗄️", points: [
      "Controlled by one owner / admin.",
      "Records can be edited or deleted in place.",
      "Fast and cheap, but you must trust the owner.",
      "Usually private and hidden from users.",
    ]},
    b: { name: "Blockchain", icon: "⛓️", points: [
      "Shared across many independent computers.",
      "Append-only — past records can't be silently changed.",
      "Slower, but trustless and verifiable by anyone.",
      "Typically public and transparent.",
    ]},
  },
];

export default function ConceptsPage() {
  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Reference</span>
          <h1 className="display">
            Core <span className="grad">concepts</span>
          </h1>
          <p className="lead">
            The fastest way to understand a new idea is to compare it with
            something familiar. Four head-to-head comparisons cover the
            foundations of Web3.
          </p>
        </div>
      </header>

      <section className="container">
        {COMPARISONS.map((c, i) => (
          <Reveal key={c.title} delay={i * 60}>
            <div className="compare-block">
              <h2 className="section-title">{c.title}</h2>
              <div className="compare">
                {[c.a, c.b].map((side, idx) => (
                  <div key={side.name} className={`compare-side ${idx === 0 ? "left" : "right"}`}>
                    <div className="compare-head">
                      <span className="ico">{side.icon}</span>
                      <h3>{side.name}</h3>
                    </div>
                    <ul>
                      {side.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="vs-badge">VS</div>
              </div>
            </div>
          </Reveal>
        ))}

        <div className="callout">
          <strong>Why this matters:</strong> writing concepts into a visual
          comparison forces deeper understanding. Anyone can paste a definition —
          building a comparison card means you truly understood both sides.
        </div>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/">← Home</Link>
        <Link className="btn primary" href="/prices">Next: Live Prices →</Link>
      </nav>
    </>
  );
}
