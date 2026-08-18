// Decorative, non-interactive golden botanicals. Pure SVG + CSS (no JS/libs).
// Everything is aria-hidden and pointer-events:none so it never affects UX,
// and all motion is gated behind prefers-reduced-motion in globals.css.

const leaf = "M0 0C7 -8 20 -7 26 4C17 11 4 9 0 0Z";

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg className={`gd-leaf ${className}`} viewBox="0 0 26 12" aria-hidden="true">
      <path d={leaf} />
      <path className="gd-leaf-vein" d="M2 2C10 3 18 4 24 5" />
    </svg>
  );
}

// A slender vine that curves down a corner, its leaves fluttering gently.
export function GoldenVine({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={`golden-vine ${className}${flip ? " gd-flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 130 300" fill="none" aria-hidden="true">
        <path
          className="gd-stem"
          d="M24 -6C46 44 8 92 40 150C64 194 30 236 66 300"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <g className="gd-sprig gd-sprig-1"><path d={leaf} /></g>
        <g className="gd-sprig gd-sprig-2"><path d={leaf} /></g>
        <g className="gd-sprig gd-sprig-3"><path d={leaf} /></g>
        <g className="gd-sprig gd-sprig-4"><path d={leaf} /></g>
        <g className="gd-sprig gd-sprig-5"><path d={leaf} /></g>
      </svg>
    </div>
  );
}

// A handful of gold leaves that drift slowly upward, looping.
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`floating-leaves ${className}`} aria-hidden="true">
      <Leaf className="gd-float gd-float-1" />
      <Leaf className="gd-float gd-float-2" />
      <Leaf className="gd-float gd-float-3" />
      <Leaf className="gd-float gd-float-4" />
      <Leaf className="gd-float gd-float-5" />
      <Leaf className="gd-float gd-float-6" />
    </div>
  );
}
