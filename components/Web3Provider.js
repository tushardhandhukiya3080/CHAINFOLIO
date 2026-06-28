"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi";

// Wraps the whole app so any page/component can read wallet state via wagmi
// hooks (useAccount, useBalance, …). WagmiProvider auto-reconnects on mount
// using the persisted localStorage state.
export default function Web3Provider({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
