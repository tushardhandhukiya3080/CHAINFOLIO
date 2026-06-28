"use client";

import Button from "./Button";
import { useWallet, shortAddress } from "@/context/WalletContext";

// Reads GLOBAL wallet state. Because it lives in context, this same component
// shows the right thing in the navbar, the landing page, anywhere.
export default function ConnectWallet({ full = false }) {
  const { address, isConnected, connecting, hydrated, connect, disconnect } =
    useWallet();

  // Before hydration we don't know the saved state — render a stable placeholder.
  if (!hydrated) {
    return (
      <Button variant="ghost" disabled>
        …
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="wallet-chip">
        <span className="pill ok" title={address}>
          🟢 {shortAddress(address)}
        </span>
        <Button variant="ghost" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={connect}
      disabled={connecting}
      className={full ? "full" : ""}
    >
      {connecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}
