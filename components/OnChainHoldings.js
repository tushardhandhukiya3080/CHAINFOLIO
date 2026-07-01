"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { mainnet } from "wagmi/chains";
import Card from "./Card";
import Button from "./Button";
import Spinner from "./Spinner";
import ConnectWallet from "./ConnectWallet";
import { ERC20_TOKENS } from "@/lib/tokens";
import { fetchSimplePrices, formatMoney } from "@/lib/coingecko";

const PRICE_IDS = [...new Set(["ethereum", ...ERC20_TOKENS.map((t) => t.id)])];

export default function OnChainHoldings() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const onMainnet = chainId === mainnet.id;
  const ready = isConnected && onMainnet && !!address;

  // Native ETH balance.
  const { data: ethBal } = useBalance({ address, query: { enabled: ready } });

  // ERC-20 balanceOf(address) for every token — aggregated in ONE multicall.
  const { data: results, isLoading, refetch } = useReadContracts({
    query: { enabled: ready },
    contracts: ERC20_TOKENS.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId: mainnet.id,
    })),
  });

  // Live USD prices for ETH + every token.
  const [prices, setPrices] = useState({});
  const loadPrices = () => fetchSimplePrices(PRICE_IDS).then(setPrices).catch(() => {});
  useEffect(() => {
    if (ready) loadPrices();
  }, [ready]);

  if (!isConnected) {
    return (
      <Card className="onchain-connect">
        <div>
          <h3 style={{ marginTop: 0, textTransform: "uppercase" }}>On-chain balances</h3>
          <p>Connect a wallet to pull your real ERC-20 token balances live from Ethereum.</p>
        </div>
        <ConnectWallet />
      </Card>
    );
  }

  if (!onMainnet) {
    return (
      <Card className="onchain-connect">
        <div>
          <h3 style={{ marginTop: 0, textTransform: "uppercase" }}>On-chain balances</h3>
          <p className="status error">Switch your wallet to Ethereum mainnet to read balances.</p>
        </div>
        <ConnectWallet />
      </Card>
    );
  }

  // Build rows (native ETH + any token with a non-zero balance).
  const rows = [];
  const ethAmt = ethBal ? Number(ethBal.formatted) : 0;
  if (ethAmt > 0) {
    const price = prices.ethereum?.usd ?? null;
    rows.push({ symbol: "ETH", name: "Ethereum", amount: ethAmt, price, value: price != null ? ethAmt * price : null });
  }
  ERC20_TOKENS.forEach((t, i) => {
    const raw = results?.[i]?.result;
    if (raw == null) return;
    const amount = Number(formatUnits(raw, t.decimals));
    if (amount <= 0) return;
    const price = prices[t.id]?.usd ?? null;
    rows.push({ symbol: t.symbol, name: t.name, amount, price, value: price != null ? amount * price : null });
  });

  const total = rows.reduce((s, r) => s + (r.value || 0), 0);

  return (
    <>
      <Card className="portfolio-banner" style={{ marginBottom: 16 }}>
        <div>
          <div className="pb-label">On-chain balance value</div>
          <div className="pb-value">{isLoading ? "…" : formatMoney(total)}</div>
        </div>
        <Button variant="ghost" className="sm" onClick={() => { refetch(); loadPrices(); }} disabled={isLoading}>
          ↻ Refresh
        </Button>
      </Card>

      {isLoading ? (
        <Card><Spinner label="Reading balances from Ethereum…" /></Card>
      ) : rows.length === 0 ? (
        <Card className="empty-state">
          <div className="ico">🪙</div>
          <h3>No tracked tokens</h3>
          <p>This wallet holds none of the tracked assets (ETH + {ERC20_TOKENS.length} ERC-20s).</p>
        </Card>
      ) : (
        <Card className="table-card">
          <div className="table-scroll">
            <table className="tx-table">
              <thead>
                <tr><th>Asset</th><th>Balance</th><th>Price</th><th>Value</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.symbol}>
                    <td><strong>{r.symbol}</strong> <span className="muted-cell">{r.name}</span></td>
                    <td className="mono">{r.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })}</td>
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
