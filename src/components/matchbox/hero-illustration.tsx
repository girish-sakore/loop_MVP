const rays = [-75, -60, -45, -30, -15, 0, 15, 30, 45, 60, 75];

export default function HeroIllustration() {
  const ink = { stroke: 'var(--mb-ink)' };
  return (
    <svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="240" height="160" style={{ fill: 'var(--mb-sky)' }} />
      <g style={{ stroke: 'var(--mb-lyel)' }} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
        {rays.map((r) => (<line key={r} x1="120" y1="130" x2="120" y2="4" transform={`rotate(${r} 120 130)`} />))}
      </g>
      <circle cx="120" cy="130" r="40" strokeWidth={3} style={{ fill: 'var(--mb-lyel)', ...ink }} />
      <path d="M14 160Q78 98 120 98Q162 98 226 160Z" fill="#fff" strokeWidth={3} style={ink} />
      <g fill="#e6f0ff" strokeWidth={2.5} strokeLinejoin="round" style={ink}>
        <rect x="58" y="128" width="15" height="15" rx="2" transform="rotate(-14 65 135)" />
        <rect x="160" y="124" width="17" height="17" rx="2" transform="rotate(12 168 132)" />
        <rect x="118" y="136" width="12" height="12" rx="2" transform="rotate(8 124 142)" />
      </g>
      <g transform="rotate(-10 120 62)">
        <rect x="98" y="34" width="44" height="60" rx="10" fill="#fff" strokeWidth={3} style={ink} />
        <rect x="95" y="20" width="50" height="18" rx="7" strokeWidth={3} style={{ fill: 'var(--mb-red)', ...ink }} />
        <g fill="#1a1815"><circle cx="108" cy="29" r="2.2" /><circle cx="120" cy="29" r="2.2" /><circle cx="132" cy="29" r="2.2" /></g>
        <path d="M108 52h24M108 66h24" strokeWidth={4} strokeLinecap="round" style={{ stroke: 'var(--mb-blue)' }} />
      </g>
      <g fill="#fff" strokeWidth={1.5} style={ink}>
        <circle cx="150" cy="80" r="3" /><circle cx="158" cy="92" r="2.5" /><circle cx="146" cy="96" r="2" />
      </g>
      <path d="M34 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff" strokeWidth={1.5} style={ink} />
      <path d="M204 30l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#fff" strokeWidth={1.5} style={ink} />
    </svg>
  );
}
