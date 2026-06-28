// Tiny dependency-free 7-day sparkline drawn as an SVG polyline.
export default function Sparkline({ data = [], width = 120, height = 36 }) {
  if (!data || data.length < 2) return <span className="muted-cell">—</span>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const up = data[data.length - 1] >= data[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="spark"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={up ? "var(--accent-2)" : "var(--danger)"}
        strokeWidth="2"
      />
    </svg>
  );
}
