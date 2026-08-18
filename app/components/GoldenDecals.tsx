// Decorative, non-interactive golden botanicals + celestial motifs.
// Pure SVG + CSS (no JS/libs). aria-hidden + pointer-events:none, semi-transparent
// so text stays readable. Motion gated behind prefers-reduced-motion.

const lilyPetals = [0, 60, 120, 180, 240, 300];
const lilyStamens = [30, 90, 150, 210, 270, 330];

function Lily({ className }: { className: string }) {
  return (
    <svg className={`daisy ${className}`} viewBox="-44 -46 88 92" aria-hidden="true">
      <g className="lily">
        {lilyPetals.map(a => (
          <g key={a} transform={`rotate(${a})`}>
            <path className="lily-petal" fill="url(#lilyGrad)" d="M0 0C-6.2 -12 -6 -26 -1.7 -37C-.6 -39.2 .6 -39.2 1.7 -37C6 -26 6.2 -12 0 0Z" />
            <path className="lily-vein" d="M0 -3L0 -35" />
          </g>
        ))}
        {lilyStamens.map(a => (
          <g key={`s${a}`} transform={`rotate(${a})`}>
            <path className="lily-filament" d="M0 -1Q3.4 -10 5.6 -16.5" />
            <ellipse className="lily-anther" cx="6.1" cy="-18" rx="1.5" ry="3.7" transform="rotate(26 6.1 -18)" />
          </g>
        ))}
        <circle className="lily-heart" r="2.2" />
      </g>
    </svg>
  );
}

export function DaisyField({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const items = variant === "hero"
    ? ["dp-1", "dp-2", "dp-3", "dp-4", "dp-5"]
    : ["dp-6", "dp-7", "dp-8"];
  return (
    <div className={`daisy-field df-${variant}`} aria-hidden="true">
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="lilyGrad" cx="50%" cy="82%" r="82%">
            <stop offset="0%" stopColor="#f8efce" />
            <stop offset="52%" stopColor="#eaddb0" />
            <stop offset="100%" stopColor="#d3b571" />
          </radialGradient>
        </defs>
      </svg>
      {items.map(c => <Lily key={c} className={c} />)}
    </div>
  );
}

// Soft golden celestial glow for a hero backdrop.
export function SunGlow({ className = "" }: { className?: string }) {
  return <div className={`sun-glow ${className}`} aria-hidden="true" />;
}

// Crescent moon + drifting stars — goddess/celestial iconography.
export function Celestial() {
  return (
    <div className="celestial" aria-hidden="true">
      <svg className="c-moon" viewBox="-14 -14 28 28" aria-hidden="true">
        <path d="M3.4 -10.6A10.6 10.6 0 1 0 3.4 10.6A8.4 8.4 0 1 1 3.4 -10.6Z" />
      </svg>
      {["c-star-1", "c-star-2", "c-star-3", "c-star-4"].map(s => (
        <svg key={s} className={`c-star ${s}`} viewBox="-8 -8 16 16" aria-hidden="true">
          <path d="M0 -7.5C.9 -1.4 1.4 -.9 7.5 0C1.4 .9 .9 1.4 0 7.5C-.9 1.4 -1.4 .9 -7.5 0C-1.4 -.9 -.9 -1.4 0 -7.5Z" />
        </svg>
      ))}
    </div>
  );
}

// Thin gold laurel flourish — Greek/editorial divider.
export function Laurel({ className = "" }: { className?: string }) {
  return (
    <svg className={`laurel ${className}`} viewBox="0 0 260 34" aria-hidden="true">
      <g className="laurel-g">
        <path d="M130 6 L130 28" />
        <circle cx="130" cy="4" r="2.4" className="laurel-dot" />
        <path d="M120 17 C96 15 74 17 54 25" />
        <path d="M140 17 C164 15 186 17 206 25" />
        {[[112, 17], [100, 18.5], [88, 20.5], [76, 22.5]].map(([x, y], i) => (
          <g key={`l${i}`}><ellipse cx={x} cy={y} rx="6" ry="2.4" transform={`rotate(28 ${x} ${y})`} /></g>
        ))}
        {[[148, 17], [160, 18.5], [172, 20.5], [184, 22.5]].map(([x, y], i) => (
          <g key={`r${i}`}><ellipse cx={x} cy={y} rx="6" ry="2.4" transform={`rotate(-28 ${x} ${y})`} /></g>
        ))}
      </g>
    </svg>
  );
}
