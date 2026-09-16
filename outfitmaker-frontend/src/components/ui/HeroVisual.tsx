export function HeroVisual() {
  // Editorial fashion silhouette composition rendered as inline SVG so the
  // hero always looks premium without depending on external images.
  return (
    <svg
      viewBox="0 0 720 760"
      className="h-full w-full"
      role="img"
      aria-label="Editorial fashion illustration"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bgGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5efe6" />
          <stop offset="100%" stopColor="#e9e0d3" />
        </linearGradient>
        <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8f3340" />
          <stop offset="100%" stopColor="#571520" />
        </linearGradient>
      </defs>

      <rect width="720" height="760" fill="url(#bgGlow)" />

      {/* Large soft circle backdrop */}
      <circle cx="520" cy="180" r="280" fill="#b28a4b" opacity="0.12" />
      <circle cx="120" cy="640" r="220" fill="#6f1d2b" opacity="0.08" />

      {/* Figure silhouette */}
      <g transform="translate(280,0)">
        {/* Head */}
        <circle cx="95" cy="120" r="46" fill="url(#dress)" />
        <path d="M20 300 c8 -95 35 -150 75 -150 s67 55 75 150" fill="url(#dress)" />
        {/* Torso / dress */}
        <path
          d="M20 300 L170 300 L210 620 L260 760 L-70 760 L-20 620 Z"
          fill="url(#dress)"
        />
        {/* Gold sash */}
        <path d="M20 380 L170 380 L175 430 L15 430 Z" fill="#b28a4b" opacity="0.9" />
      </g>

      {/* Floating style tag */}
      <g transform="translate(470,520)">
        <rect width="170" height="66" rx="16" fill="#ffffff" opacity="0.92" />
        <circle cx="34" cy="33" r="16" fill="#6f1d2b" />
        <path
          d="M34 20 l4 11 12 2 -9 8 3 12 -10 -6 -10 6 3 -12 -9 -8 12 -2 z"
          fill="#ffffff"
        />
        <text x="60" y="30" fontFamily="Manrope, sans-serif" fontSize="15" fontWeight="700" fill="#1d1a17">
          AI Style Finder
        </text>
        <text x="60" y="49" fontFamily="Manrope, sans-serif" fontSize="11" fill="#6b655c">
          Similar styles in seconds
        </text>
      </g>

      {/* Floating size tag */}
      <g transform="translate(140,150)">
        <rect width="110" height="60" rx="14" fill="#ffffff" opacity="0.92" />
        <text x="55" y="26" textAnchor="middle" fontFamily="Playfair Display, serif" fontSize="20" fontWeight="700" fill="#6f1d2b">
          M
        </text>
        <text x="55" y="46" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="11" fill="#6b655c">
          Your perfect fit
        </text>
      </g>
    </svg>
  );
}
