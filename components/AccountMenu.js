"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";

// Reflects the logged-in state in the navbar. Renders nothing when logged out
// (keeps the bar clean — sign-in is reachable via Portfolio and the footer).
export default function AccountMenu() {
  const { user, isAuthed, hydrated, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!e.target.closest?.(".account-chip")) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  if (!hydrated || !isAuthed) return null;

  const label =
    user.name && user.name.trim() ? user.name.trim().split(" ")[0] : user.email.split("@")[0];

  return (
    <div className="account-chip">
      <button
        className="account-pill"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        👤 {label}
      </button>
      {open && (
        <div className="account-dropdown" role="menu">
          <span className="account-email">{user.email}</span>
          <Link href="/portfolio" className="btn ghost sm full" role="menuitem" onClick={() => setOpen(false)}>
            Portfolio
          </Link>
          <Button
            variant="ghost"
            className="sm full"
            role="menuitem"
            onClick={() => {
              logout();
              setOpen(false);
              router.push("/");
            }}
          >
            Log out
          </Button>
        </div>
      )}
    </div>
  );
}
