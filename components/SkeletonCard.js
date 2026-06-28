// A skeleton placeholder shaped like a token card. Shown while data loads so the
// layout doesn't jump when real content arrives — a key habit for async UIs.
export default function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="sk sk-row">
        <span className="sk sk-avatar" />
        <span className="sk sk-line short" />
      </div>
      <span className="sk sk-line big" />
      <span className="sk sk-line medium" />
    </div>
  );
}
