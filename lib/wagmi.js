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
    // Stable, CORS-enabled public RPC (no API key) so balance reads work
    // reliably — wagmi's default chain RPC is often rate-limited/unreachable.
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
  },
  // Persist the connection to localStorage so it survives reloads.
  storage: createStorage({
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  }),
});

export const SUPPORTED_CHAIN = mainnet;
