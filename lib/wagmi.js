import { createConfig, createStorage, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Single supported chain for this educational app: Ethereum mainnet.
// `injected()` covers MetaMask and other browser wallets — no WalletConnect
// project id / secrets needed, which keeps the client key-free.
export const config = createConfig({
  chains: [mainnet],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    // Optional dedicated RPC via NEXT_PUBLIC_RPC_URL (use an UNKEYED/public URL —
    // NEXT_PUBLIC_* is exposed to the browser). Falls back to a stable, CORS-enabled
    // public RPC (no API key) so balance/multicall reads work reliably.
    [mainnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-rpc.publicnode.com"),
  },
  // Persist the connection to localStorage so it survives reloads.
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
});

export const SUPPORTED_CHAIN = mainnet;
