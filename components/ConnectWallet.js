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
  useEffect(() => setMounted(true), []);

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

  // --- Connected ---
  const bal = balance
    ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
    : "… ETH";

  return (
    <div className="wallet-chip">
      <span className="pill ok" title={address}>
        🟢 {shortAddress(address)}
      </span>
      <span className="pill" title="Live ETH balance">
        {bal}
      </span>
      <Button variant="ghost" className="sm" onClick={() => disconnect()}>
        Disconnect
      </Button>
    </div>
  );
}
