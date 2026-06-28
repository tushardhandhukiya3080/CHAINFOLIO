"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { useWallet, shortAddress } from "@/context/WalletContext";
import { TRANSACTIONS, STATUS_FILTERS } from "@/lib/transactions";

// Page 3 — Mock transaction history. The whole point is rendering and filtering
// an array of objects, exactly like real on-chain data.
export default function HistoryPage() {
  const { isConnected, address, hydrated } = useWallet();
  const [filter, setFilter] = useState("All");

  // useMemo so we only re-filter when the filter actually changes.
  const rows = useMemo(() => {
    if (filter === "All") return TRANSACTIONS;
    return TRANSACTIONS.filter((tx) => tx.status === filter);
  }, [filter]);

  // Small count summary per status for the filter chips.
  const counts = useMemo(() => {
    const c = { All: TRANSACTIONS.length };
    for (const s of ["Success", "Pending", "Failed"]) {
      c[s] = TRANSACTIONS.filter((t) => t.status === s).length;
    }
    return c;
  }, []);

  return (
    <>
      <header className="hero">
        <div className="container">
          <span className="badge">Mock on-chain data</span>
          <h1>
            Transaction <span className="grad">History</span>
          </h1>
          <p className="lead">
            A filterable table built by mapping over an array of objects — the
            core skill for rendering blockchain data. Filter by status to see the
            list update instantly.
          </p>
        </div>
      </header>

      <section className="container">
        {/* Uses global wallet state to contextualise the data */}
        {hydrated && isConnected ? (
          <p className="status ok">
            Showing activity for <strong>{shortAddress(address)}</strong>
          </p>
        ) : (
          <p className="status">
            Not connected — showing sample data. Connect a wallet on the{" "}
            <Link href="/" style={{ color: "var(--accent-2)" }}>home page</Link>.
          </p>
        )}

        {/* ===== Filter chips (event listeners on click) ===== */}
        <div className="filters">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`chip ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s} <span className="chip-count">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* ===== Responsive table ===== */}
        <Card className="table-card">
          <div className="table-scroll">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Tx Hash</th>
                  <th>Method</th>
                  <th>Token</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No transactions match this filter.
                    </td>
                  </tr>
                ) : (
                  rows.map((tx) => (
                    <tr key={tx.hash}>
                      <td className="mono hash-cell">
                        {tx.hash.slice(0, 10)}…{tx.hash.slice(-6)}
                      </td>
                      <td>{tx.method}</td>
                      <td>{tx.token}</td>
                      <td className="mono">{tx.amount}</td>
                      <td>
                        <span className={`tx-status ${tx.status.toLowerCase()}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="muted-cell">{tx.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-foot">
            Showing <strong>{rows.length}</strong> of {TRANSACTIONS.length} transactions
          </div>
        </Card>
      </section>

      <nav className="container pagenav">
        <Link className="btn ghost" href="/dashboard">← Dashboard</Link>
        <Link className="btn primary" href="/">Back to Home ↑</Link>
      </nav>
    </>
  );
}
