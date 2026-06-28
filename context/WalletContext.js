"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/*
  GLOBAL STATE — the Web3 bridge.

  In a real dApp, once a user connects their wallet on the landing page, every
  other page must know their address. We model that here with React Context +
  localStorage so the connection survives both page navigation AND a refresh.

  When you later switch to ethers.js / wagmi, you'll replace the fake `connect()`
  below with a real provider call — but every component that reads `useWallet()`
  stays exactly the same.
*/

const WalletContext = createContext(null);
const STORAGE_KEY = "demo_wallet_address";

// Generate a realistic-looking (but fake) 0x address for the simulation.
function randomAddress() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return "0x" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  // `hydrated` avoids a server/client mismatch: we only know the saved address
  // after the component mounts in the browser.
  const [hydrated, setHydrated] = useState(false);

  // Restore a previously saved connection on first load.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setAddress(saved);
    } catch {
      /* localStorage unavailable — ignore */
    }
    setHydrated(true);
  }, []);

  // Simulated async wallet handshake (mirrors awaiting a real wallet popup).
  const connect = useCallback(async () => {
    setConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const addr = randomAddress();
    setAddress(addr);
    try {
      window.localStorage.setItem(STORAGE_KEY, addr);
    } catch {
      /* ignore */
    }
    setConnecting(false);
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = {
    address,
    isConnected: !!address,
    connecting,
    hydrated,
    connect,
    disconnect,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Custom hook so pages just call `const { address } = useWallet()`.
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

// Small shared helper for displaying truncated addresses.
export function shortAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}
