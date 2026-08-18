// Decorative, non-interactive golden botanicals. Pure SVG + CSS (no JS/libs).
// Inspired by cascading grape/ivy vines hanging from an arch at golden hour.
// Everything is aria-hidden + pointer-events:none, and all motion is gated
// behind prefers-reduced-motion in globals.css.

// A rounded, lobed grape/ivy leaf.
const ivy = "M12 1C14 5 18 4 20 6C18 8 22 10 21 12C19 13 20 17 17 17C16 20 13 19 12 22C11 19 8 20 7 17C4 17 5 13 3 12C2 10 6 8 4 6C6 4 10 5 12 1Z";

// [x, y, rotation, scale] — dense cluster up top, thinning into dangling tendrils.
const leaves: [number, number, number, number][] = [
  [8, 12, -15, 1], [32, 6, 12, 1.05], [56, 15, -24, .95], [80, 8, 20, 1.05], [104, 18, -10, 1], [128, 10, 16, .95], [150, 24, -20, .9],
  [20, 40, 28, .95], [48, 44, -30, 1], [74, 37, 20, 1.05], [100, 47, -14, .95], [126, 41, 24, .9], [148, 52, -18, .85],
  [40, 76, -24, .95], [70, 84, 20, .9], [98, 79, -10, .95], [124, 89, 24, .85],
  [56, 118, -20, .9], [90, 127, 15, .85], [118, 122, -15, .85],
  [72, 166, 10, .8], [128, 158, -16, .8],
  [86, 210, 10, .72], [134, 200, -14, .72],
  [92, 250, -10, .64], [140, 240, 10, .62],
  [90, 288, 6, .56],
];

const berries: [number, number, number][] = [[93, 305, 2], [142, 272, 1.9], [90, 262, 1.6]];

export function HangingVine({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`hanging-vine ${className}${flip ? " gd-flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 240 330" fill="none" aria-hidden="true">
        <g className="hv-drift">
          {/* main branch across the top + dangling tendrils */}
          <path className="hv-stem" d="M-8 10C40 24 92 6 150 26C192 40 214 22 244 32" />
          <path className="hv-stem" d="M74 40C70 110 76 200 72 312" />
          <path className="hv-stem" d="M100 70C104 150 96 240 96 320" />
          <path className="hv-stem" d="M136 46C150 120 136 220 140 300" />
          {berries.map(([x, y, r], i) => <circle key={`b${i}`} className="hv-berry" cx={x} cy={y} r={r} />)}
          {leaves.map(([x, y, rot, s], i) => (
            <g key={i} className={`hv-leaf hv-${i % 3}`} style={{ transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${s})` }}>
              <path d={ivy} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// A soft golden celestial glow (sun + warm cloud light) for a hero backdrop.
export function SunGlow({ className = "" }: { className?: string }) {
  return <div className={`sun-glow ${className}`} aria-hidden="true" />;
}

// A few gold leaves that drift slowly upward, looping.
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`floating-leaves ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <svg key={n} className={`gd-leaf gd-float gd-float-${n}`} viewBox="0 0 24 24" aria-hidden="true"><path d={ivy} /></svg>
      ))}
    </div>
  );
}
