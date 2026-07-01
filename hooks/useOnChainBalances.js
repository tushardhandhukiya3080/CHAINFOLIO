"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { mainnet } from "wagmi/chains";
import { ERC20_TOKENS, PRICE_IDS, toTokenAmount } from "@/lib/tokens";
import { fetchSimplePricesCached } from "@/lib/coingecko";

/**
 * Reads the connected wallet's real balances from Ethereum mainnet:
 *   - native ETH (useBalance)
 *   - every ERC-20 in lib/tokens via a SINGLE multicall (useReadContracts)
 * then prices them in USD via the cached CoinGecko helper.
 *
 * Reads are pinned to mainnet explicitly, so they work even if the wallet is on
 * another chain (the app only configures the mainnet transport). Balances
 * auto-refetch when the connected address changes (it's part of the query key).
 */
export function useOnChainBalances() {
  const { address, isConnected, chainId } = useAccount();
  const enabled = isConnected && !!address;

  const eth = useBalance({ address, chainId: mainnet.id, query: { enabled } });

  const reads = useReadContracts({
    allowFailure: true,
    query: { enabled },
    contracts: ERC20_TOKENS.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId: mainnet.id,
    })),
  });

  // Prices (cached). Refetch when the wallet connects / address changes.
  const [prices, setPrices] = useState({});
  const [pricesError, setPricesError] = useState(false);
  const loadPrices = useCallback(() => {
    setPricesError(false);
    return fetchSimplePricesCached(PRICE_IDS)
      .then(setPrices)
      .catch(() => setPricesError(true));
  }, []);
  useEffect(() => {
    if (enabled) loadPrices();
  }, [enabled, address, loadPrices]);

  const rows = useMemo(() => {
    const out = [];

    // Native ETH
    const ethAmount = eth.data ? Number(eth.data.formatted) : 0;
    if (ethAmount > 0) {
      const price = prices.ethereum?.usd ?? null;
      out.push({ key: "eth", symbol: "ETH", name: "Ethereum", amount: ethAmount, price, value: price != null ? ethAmount * price : null });
    }

    // ERC-20s (skip failed reads and zero balances)
    ERC20_TOKENS.forEach((t, i) => {
      const res = reads.data?.[i];
      if (!res || res.status !== "success" || res.result == null) return;
      const amount = toTokenAmount(res.result, t.decimals);
      if (amount <= 0) return;
      const price = prices[t.id]?.usd ?? null;
      out.push({ key: t.symbol, symbol: t.symbol, name: t.name, amount, price, value: price != null ? amount * price : null });
    });

    return out.sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [eth.data, reads.data, prices]);

  const total = rows.reduce((s, r) => s + (r.value || 0), 0);

  const refetch = useCallback(() => {
    reads.refetch();
    eth.refetch?.();
    loadPrices();
  }, [reads, eth, loadPrices]);

  return {
    isConnected,
    address,
    notMainnet: isConnected && chainId !== mainnet.id,
    isLoading: enabled && (reads.isLoading || eth.isLoading),
    isError: reads.isError, // RPC / multicall read failed
    pricesError,
    rows,
    total,
    refetch,
  };
}
