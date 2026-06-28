// Infinite scrolling text strip — a signature creative-studio touch.
// The items are duplicated so the CSS animation can loop seamlessly.
export default function Marquee({ items, separator = "✦" }) {
  const row = (
    <div className="marquee-row" aria-hidden="true">
      {items.map((item, i) => (
        <span className="marquee-item" key={i}>
          {item}
          <span className="marquee-sep">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee">
      {row}
      {row}
    </div>
  );
}
