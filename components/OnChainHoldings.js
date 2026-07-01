"use client";

import Card from "./Card";
import Button from "./Button";
import Spinner from "./Spinner";
import ConnectWallet from "./ConnectWallet";
import { useOnChainBalances } from "@/hooks/useOnChainBalances";
import { formatMoney } from "@/lib/coingecko";
import { ERC20_TOKENS } from "@/lib/tokens";

export default function OnChainHoldings() {
  const { isConnected, notMainnet, isLoading, isError, pricesError, rows, total, refetch } =
    useOnChainBalances();

  // --- Not connected ---
  if (!isConnected) {
    return (
      <Card className="onchain-connect">
        <div>
          <h3 style={{ marginTop: 0, textTransform: "uppercase" }}>On-chain holdings</h3>
          <p>Connect a wallet to read your real ERC-20 balances live from Ethereum.</p>
        </div>
        <ConnectWallet />
      </Card>
    );
  }

  return (
    <>
      {notMainnet && (
        <p className="status" style={{ marginTop: 0 }}>
          Your wallet is on another network — showing your <strong>Ethereum mainnet</strong> balances.
        </p>
      )}

      {/* Subtotal banner */}
      <Card className="portfolio-banner" style={{ marginBottom: 16 }}>
        <div>
          <div className="pb-label">On-chain subtotal</div>
          <div className="pb-value">{isLoading || isError ? "…" : formatMoney(total)}</div>
          {pricesError && <div className="pb-sub">Prices unavailable — showing balances only.</div>}
        </div>
        <Button variant="ghost" className="sm" onClick={refetch} disabled={isLoading}>
          ↻ Refresh
        </Button>
      </Card>

      {/* --- Loading --- */}
      {isLoading ? (
        <Card>
          <Spinner label="Reading balances from Ethereum…" />
        </Card>
      ) : isError ? (
        /* --- RPC error --- */
        <Card className="error-state">
          <div className="ico">⚠️</div>
          <h3>Couldn&apos;t read the blockchain</h3>
          <p>The RPC didn&apos;t respond. Please try again.</p>
          <Button onClick={refetch}>↻ Retry</Button>
        </Card>
      ) : rows.length === 0 ? (
        /* --- Connected but empty --- */
        <Card className="empty-state">
          <div className="ico">🪙</div>
          <h3>No tracked tokens</h3>
          <p>This wallet holds none of the tracked assets (ETH + {ERC20_TOKENS.length} ERC-20s).</p>
        </Card>
      ) : (
        /* --- Success --- */
        <Card className="table-card">
          <div className="table-scroll">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Balance</th>
                  <th>Price</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td>
                      <strong>{r.symbol}</strong> <span className="muted-cell">{r.name}</span>
                    </td>
                    <td className="mono">
                      {r.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })}
                    </td>
                    <td className="mono">{r.price != null ? formatMoney(r.price) : "—"}</td>
                    <td className="mono">{r.value != null ? formatMoney(r.value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-foot">
            {rows.length} asset{rows.length !== 1 ? "s" : ""} held · read live from Ethereum via multicall
          </div>
        </Card>
      )}
    </>
  );
}
