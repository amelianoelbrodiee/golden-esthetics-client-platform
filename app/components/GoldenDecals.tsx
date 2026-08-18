// Decorative, non-interactive golden daisies that bloom one at a time.
// Pure SVG + CSS (no JS/libs). aria-hidden + pointer-events:none, semi-transparent
// so text stays readable. Bloom motion gated behind prefers-reduced-motion.

const petals = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

function Daisy({ className }: { className: string }) {
  return (
    <svg className={`daisy ${className}`} viewBox="-30 -30 60 60" aria-hidden="true">
      {petals.map(a => <ellipse key={a} className="daisy-petal" cx="0" cy="-17" rx="4.3" ry="12" transform={`rotate(${a})`} />)}
      <circle className="daisy-center" r="6.8" />
    </svg>
  );
}

// Scattered daisies that bloom in sequence. Positions come from CSS classes.
export function DaisyField({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const items = variant === "hero"
    ? ["dp-1", "dp-2", "dp-3", "dp-4", "dp-5"]
    : ["dp-6", "dp-7", "dp-8"];
  return (
    <div className={`daisy-field df-${variant}`} aria-hidden="true">
      {items.map(c => <Daisy key={c} className={c} />)}
    </div>
  );
}

// A soft golden celestial glow for a hero backdrop.
export function SunGlow({ className = "" }: { className?: string }) {
  return <div className={`sun-glow ${className}`} aria-hidden="true" />;
}
