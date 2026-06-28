"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { SUPPORTED_CHAIN } from "@/lib/wagmi";
import Button from "./Button";

export function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function ConnectWallet() {
  // Avoid SSR/client hydration mismatch: only render wallet state after mount.
  const [mounted, setMounted] = useState(false);
  const [err, setErr] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close the wallet dropdown when clicking outside of it.
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (!e.target.closest?.(".wallet-menu")) setMenuOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [menuOpen]);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  if (!mounted) {
    return (
      <Button variant="ghost" className="sm" disabled>
        …
      </Button>
    );
  }

  const hasWallet = typeof window !== "undefined" && !!window.ethereum;

  // --- Not connected ---
  if (!isConnected) {
    if (!hasWallet) {
      return (
        <a
          className="btn primary sm"
          href="https://metamask.io/download/"
          target="_blank"
          rel="noreferrer"
        >
          Get a Wallet
        </a>
      );
    }
    return (
      <div className="wallet-chip">
        <Button
          className="sm"
          disabled={isPending}
          onClick={async () => {
            setErr("");
            try {
              await connect({ connector: connectors[0] });
            } catch (e) {
              setErr(e?.name === "UserRejectedRequestError" ? "Rejected" : "Failed");
            }
          }}
        >
          {isPending ? "Connecting…" : "Connect Wallet"}
        </Button>
        {err && <span className="wallet-err">{err}</span>}
      </div>
    );
  }

  // --- Connected but on the wrong network ---
  if (chainId !== SUPPORTED_CHAIN.id) {
    return (
      <div className="wallet-chip">
        <span className="pill bad">Wrong network</span>
        <Button
          className="sm"
          disabled={switching}
          onClick={() => switchChain({ chainId: SUPPORTED_CHAIN.id })}
        >
          {switching ? "Switching…" : "Switch to Ethereum"}
        </Button>
      </div>
    );
  }

  // --- Connected --- single pill + dropdown (keeps the navbar on one line)
  const bal = balance
    ? `${Number(balance.formatted).toFixed(3)} ${balance.symbol}`
    : "…";

  return (
    <div className="wallet-menu">
      <button
        className="pill ok wallet-pill"
        onClick={() => setMenuOpen((o) => !o)}
        title={address}
      >
        🟢 {shortAddress(address)} · {bal}
      </button>
      {menuOpen && (
        <div className="wallet-dropdown">
          <div className="wd-row">
            <span>Address</span>
            <span className="mono">{shortAddress(address)}</span>
          </div>
          <div className="wd-row">
            <span>Balance</span>
            <span className="mono">{bal}</span>
          </div>
          <Button
            variant="ghost"
            className="sm full"
            onClick={() => {
              disconnect();
              setMenuOpen(false);
            }}
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}
