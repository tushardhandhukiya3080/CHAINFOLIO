import Link from "next/link";

// ▼▼▼ EDIT THESE to your own details ▼▼▼
const AUTHOR = "Tushar Dhandhukiya";
const GITHUB_URL = "https://github.com/tushardhandhukiya3080/CHAINFOLIO";
const BATCH = "Your Batch Name";
// ▲▲▲ ------------------------------- ▲▲▲

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">
              ChainFolio<span className="brand-reg">®</span>
            </span>
            <p className="footer-tag">Crypto portfolio &amp; analytics, studio-grade.</p>
          </div>
          <nav className="footer-cols">
            <div className="footer-col">
              <span className="footer-h">Product</span>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/history">History</Link>
            </div>
            <div className="footer-col">
              <span className="footer-h">Account</span>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </div>
            <div className="footer-col">
              <span className="footer-h">Connect</span>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            Built by <strong>{AUTHOR}</strong> · {BATCH}
          </span>
          <span>© {2026} ChainFolio — educational project, not financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
