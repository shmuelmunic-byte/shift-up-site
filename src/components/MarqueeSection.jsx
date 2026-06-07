const words = [
  'אסטרטגיה שיווקית', '↑', 'Meta Ads', '↑', 'Google Ads', '↑',
  'דפי נחיתה', '↑', 'לידים איכותיים', '↑', 'AI שיווקי', '↑',
  'מסר מדויק', '↑', 'ROI', '↑',
];

const tripled = [...words, ...words, ...words];

export default function MarqueeSection() {
  return (
    <div
      style={{
        background: 'oklch(0.105 0.012 240)',
        borderTop:    '1px solid oklch(0.22 0.02 240 / 0.5)',
        borderBottom: '1px solid oklch(0.22 0.02 240 / 0.5)',
        padding: '20px 0',
        overflow: 'hidden',
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* subtle gradient fade on edges */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 80, background: 'linear-gradient(to right, oklch(0.105 0.012 240), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 80, background: 'linear-gradient(to left, oklch(0.105 0.012 240), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div className="marquee-track">
        {tripled.map((word, i) => (
          <span
            key={i}
            style={{
              margin: '0 24px',
              fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.01em',
              color: word === '↑' ? 'var(--brand-prime)' : 'oklch(0.55 0.01 240)',
              fontFamily: "'Heebo', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
