// Reusable button. `variant` controls the look; everything else (onClick,
// disabled, type…) is forwarded via ...props. This is the same reusable pattern
// you'll later use for a real "Connect Wallet" button.
export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button className={`btn ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
