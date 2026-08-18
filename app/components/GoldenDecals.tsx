// Decorative, non-interactive golden botanicals. Pure SVG + CSS (no JS/libs).
// Cascading golden flowers trailing from a corner. aria-hidden + pointer-events
// none; all motion gated behind prefers-reduced-motion in globals.css.

const petalAngles = [0, 72, 144, 216, 288];

function Bloom({ x, y, s, tone }: { x: number; y: number; s: number; tone: number }) {
  return (
    <g className={`hv-bloom hv-${tone}`} style={{ transform: `translate(${x}px, ${y}px) scale(${s})` }}>
      {petalAngles.map(a => <ellipse key={a} cx="0" cy="-6.4" rx="3.6" ry="6.4" transform={`rotate(${a})`} />)}
      <circle className="hv-bloom-center" r="2.7" />
    </g>
  );
}

// [x, y, scale] — cluster up top thinning into dangling sprays.
const blooms: [number, number, number][] = [
  [16, 16, 1], [46, 9, 1.05], [78, 18, .95], [110, 11, 1], [142, 22, .9],
  [30, 46, .9], [64, 50, 1], [98, 43, .95], [132, 52, .85],
  [56, 86, .9], [92, 93, .85], [124, 84, .8],
  [76, 130, .8], [122, 124, .78],
  [92, 172, .7], [134, 166, .68],
  [98, 214, .62], [102, 256, .55],
];

const buds: [number, number, number][] = [[101, 300, 2.4], [135, 292, 2], [74, 306, 1.8]];

export function HangingVine({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`hanging-vine ${className}${flip ? " gd-flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 240 330" fill="none" aria-hidden="true">
        <g className="hv-drift">
          <path className="hv-stem" d="M-8 12C40 24 92 8 150 26C192 40 214 22 244 32" />
          <path className="hv-stem" d="M74 40C70 110 76 200 74 312" />
          <path className="hv-stem" d="M100 70C104 150 98 240 100 320" />
          <path className="hv-stem" d="M136 46C150 120 134 220 138 300" />
          {buds.map(([x, y, r], i) => <circle key={`b${i}`} className="hv-bud" cx={x} cy={y} r={r} />)}
          {blooms.map(([x, y, s], i) => <Bloom key={i} x={x} y={y} s={s} tone={i % 3} />)}
        </g>
      </svg>
    </div>
  );
}

// A soft golden celestial glow for a hero backdrop.
export function SunGlow({ className = "" }: { className?: string }) {
  return <div className={`sun-glow ${className}`} aria-hidden="true" />;
}

// A few small gold flowers that drift slowly upward, looping.
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`floating-leaves ${className}`} aria-hidden="true">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <svg key={n} className={`gd-bloom-float gd-float gd-float-${n}`} viewBox="-12 -12 24 24" aria-hidden="true">
          <g className={`hv-bloom hv-${n % 3}`}>
            {petalAngles.map(a => <ellipse key={a} cx="0" cy="-6.4" rx="3.6" ry="6.4" transform={`rotate(${a})`} />)}
            <circle className="hv-bloom-center" r="2.7" />
          </g>
        </svg>
      ))}
    </div>
  );
}
