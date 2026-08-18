// Decorative, non-interactive golden daisies that bloom one at a time.
// Pure SVG + CSS (no JS/libs). aria-hidden + pointer-events:none, semi-transparent
// so text stays readable. Bloom motion gated behind prefers-reduced-motion.

const lilyPetals = [0, 60, 120, 180, 240, 300];
const lilyStamens = [30, 90, 150, 210, 270, 330];

function Daisy({ className }: { className: string }) {
  return (
    <svg className={`daisy ${className}`} viewBox="-40 -40 80 80" aria-hidden="true">
      {lilyPetals.map(a => <path key={a} className="lily-petal" d="M0 0C-5.5 -15 -4.5 -28 0 -35C4.5 -28 5.5 -15 0 0Z" transform={`rotate(${a})`} />)}
      {lilyStamens.map(a => (
        <g key={`s${a}`} transform={`rotate(${a})`}>
          <line className="lily-filament" x1="0" y1="0" x2="0" y2="-13" />
          <ellipse className="lily-anther" cx="0" cy="-14" rx="1.5" ry="2.6" />
        </g>
      ))}
      <circle className="lily-center" r="2.4" />
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
