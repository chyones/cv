/**
 * Ambient, decorative-only background: a faint blueprint grid, soft drifting
 * colour orbs, and construction-inspired line geometry. Pure CSS motion, all
 * paused under prefers-reduced-motion (see globals.css). Never interactive.
 */
export function BackgroundGeometry() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft colour orbs, slowly drifting */}
      <div className="anim-orb-a absolute -left-24 top-[-10%] h-[42vw] w-[42vw] rounded-full bg-navy/[0.07] blur-3xl" />
      <div className="anim-orb-b absolute -right-28 bottom-[-14%] h-[46vw] w-[46vw] rounded-full bg-red/[0.06] blur-3xl" />

      {/* Faint panning blueprint grid */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="#29357E" strokeWidth="1" opacity="0.05" />
          </pattern>
        </defs>
        <g className="anim-grid">
          {/* Oversized so panning never reveals an edge */}
          <rect x="-72" y="-72" width="200%" height="200%" fill="url(#grid)" />
        </g>
      </svg>

      {/* Construction-line geometry, gently drifting */}
      <svg
        className="anim-shapes absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <polygon points="1440,0 1440,270 1030,0" fill="#29357E" opacity="0.045" />
        <polygon points="1440,64 1440,352 1170,64" fill="#CE363A" opacity="0.045" />
        <polygon points="0,900 0,610 396,900" fill="#29357E" opacity="0.04" />
        <line x1="0" y1="900" x2="440" y2="548" stroke="#29357E" strokeWidth="2" opacity="0.06" />
        <line x1="64" y1="900" x2="504" y2="548" stroke="#CE363A" strokeWidth="2" opacity="0.05" />
      </svg>
    </div>
  );
}
