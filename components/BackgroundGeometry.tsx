/** Subtle construction-inspired geometry -- decorative only, never interactive. */
export function BackgroundGeometry() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
    >
      <polygon points="1440,0 1440,260 1040,0" fill="#29357E" opacity="0.05" />
      <polygon points="1440,60 1440,340 1180,60" fill="#CE363A" opacity="0.05" />
      <polygon points="0,900 0,620 380,900" fill="#29357E" opacity="0.045" />
      <line x1="0" y1="900" x2="420" y2="560" stroke="#29357E" strokeWidth="2" opacity="0.06" />
      <line x1="60" y1="900" x2="480" y2="560" stroke="#CE363A" strokeWidth="2" opacity="0.05" />
    </svg>
  );
}
