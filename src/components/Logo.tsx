// Simple warm coral mark — a soft bloom / asterisk-like shape.
// Uses currentColor so it adapts to context (accent color).
export function Logo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      style={{ color: "var(--color-accent)" }}
    >
      <g fill="currentColor">
        <path d="M16 3c.5 0 .9.4.9.9v9.2l6.5-6.5a.9.9 0 1 1 1.3 1.3l-6.5 6.5h9.2a.9.9 0 0 1 0 1.8h-9.2l6.5 6.5a.9.9 0 1 1-1.3 1.3l-6.5-6.5v9.2a.9.9 0 0 1-1.8 0v-9.2l-6.5 6.5a.9.9 0 1 1-1.3-1.3l6.5-6.5H4.1a.9.9 0 0 1 0-1.8h9.2L6.8 7.9a.9.9 0 1 1 1.3-1.3l6.5 6.5V3.9c0-.5.4-.9.9-.9Z" />
      </g>
    </svg>
  );
}
