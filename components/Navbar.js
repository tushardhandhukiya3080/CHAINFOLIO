"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthed, hydrated, logout } = useAuth();

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
            {!hydrated ? null : isAuthed ? (
              <>
                <span className="user-chip" title={user.email}>
                  {user.name?.split(" ")[0] || "Account"}
                </span>
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    logout();
                    close();
                    router.push("/");
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-login" onClick={close}>
                  Log in
                </Link>
                <Link href="/signup" className="btn primary sm" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
