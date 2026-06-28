"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectWallet from "./ConnectWallet";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/concepts", label: "Concepts" },
  { href: "/prices", label: "Prices" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/simulator", label: "Simulator" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <nav className="nav">
      <div className="container">
        <Link href="/" className="brand" onClick={close}>
          <span className="dot" /> ChainFolio<span className="brand-reg">®</span>
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>

        <div className={`nav-right ${open ? "open" : ""}`}>
          <ul className="nav-links">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={pathname === link.href ? "active" : ""}
                  onClick={close}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-auth">
            <ThemeToggle />
            <ConnectWallet />
          </div>
        </div>
      </div>
    </nav>
  );
}
