/**
 * Ambient, decorative-only background: soft drifting colour orbs, a faint
 * panning blueprint grid, construction-line geometry, and a slow diagonal
 * light beam for depth. Pure CSS motion, all paused under
 * prefers-reduced-motion (see globals.css). Never interactive.
 */
export function BackgroundGeometry() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Drifting colour orbs — the primary, clearly visible ambient motion */}
      <div className="anim-orb-a absolute -left-24 top-[-12%] h-[44vw] w-[44vw] rounded-full bg-navy/[0.16] blur-3xl" />
      <div className="anim-orb-b absolute -right-28 bottom-[-16%] h-[48vw] w-[48vw] rounded-full bg-red/[0.13] blur-3xl" />
      <div className="anim-orb-c absolute left-[30%] top-[38%] h-[34vw] w-[34vw] rounded-full bg-navy/[0.10] blur-3xl" />

      {/* Faint panning blueprint grid */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="#29357E" strokeWidth="1" opacity="0.07" />
          </pattern>
        </defs>
        <g className="anim-grid">
          {/* Oversized so panning never reveals an edge */}
          <rect x="-96" y="-96" width="200%" height="200%" fill="url(#grid)" />
        </g>
      </svg>

      {/* Construction-line geometry, drifting */}
      <svg
        className="anim-shapes absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <polygon points="1440,0 1440,270 1030,0" fill="#29357E" opacity="0.06" />
        <polygon points="1440,64 1440,352 1170,64" fill="#CE363A" opacity="0.06" />
        <polygon points="0,900 0,610 396,900" fill="#29357E" opacity="0.055" />
        <line x1="0" y1="900" x2="440" y2="548" stroke="#29357E" strokeWidth="2" opacity="0.08" />
        <line x1="64" y1="900" x2="504" y2="548" stroke="#CE363A" strokeWidth="2" opacity="0.07" />
      </svg>

      {/* Slow diagonal light beam sweeping across for premium depth */}
      <div className="absolute inset-0">
        <div className="anim-beam absolute -left-1/4 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl" />
      </div>
    </div>
  );
}
