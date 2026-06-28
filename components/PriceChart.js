// Larger line chart (for the coin modal). Pure SVG, theme-aware via tokens.
export default function PriceChart({ data = [], up = true }) {
  if (!data || data.length < 2) {
    return <div className="chart-empty">No chart data.</div>;
  }

  const W = 600;
  const H = 220;
  const pad = 6;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 2 * pad) - pad;
    return [x, y];
  });

  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;
  const stroke = up ? "var(--accent-2)" : "var(--danger)";
  const last = pts[pts.length - 1];

  return (
    <svg
      className="price-chart"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Price chart"
    >
      <polyline points={area} className={`pc-area ${up ? "up" : "down"}`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="2.5" />
      <circle cx={last[0]} cy={last[1]} r="4" fill={stroke} />
    </svg>
  );
}
