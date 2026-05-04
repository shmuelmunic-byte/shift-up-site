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
        background: 'var(--surface-0)',
        borderTop:    '1px solid var(--surface-1)',
        borderBottom: '1px solid var(--surface-1)',
        padding: '18px 0',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
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
