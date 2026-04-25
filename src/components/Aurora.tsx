// Subtle ambient warmth — single hue, very low opacity.
// Single radial at the top creates Claude-style warm atmosphere.
export function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-glow absolute inset-0" />
    </div>
  );
}
