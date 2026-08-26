/* ── באנר "דלת רכה" → /audit ──
   נכנס אחרי סקשן הכאב: הכאב טרי, מזמינים לאבחן כמה מזה קורה אצלך.
   ערך נטו, בלי להשאיר פרטים — מזין את המשפך בלי להתחרות ב-LeadForm. */

export default function AuditBanner() {
  return (
    <section
      style={{
        padding: 'clamp(48px, 7vw, 80px) 28px',
        background: 'var(--bedrock)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid oklch(0.785 0.173 156.6 / 0.25)',
            borderRadius: 4,
            padding: 'clamp(26px, 4vw, 40px)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(20px, 4vw, 40px)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 260, position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'oklch(0.55 0.22 145 / 0.1)',
              border: '1px solid oklch(0.55 0.22 145 / 0.25)',
              borderRadius: 3, padding: '6px 14px', marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.65 0.22 145)', display: 'block', boxShadow: '0 0 6px oklch(0.65 0.22 145)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'oklch(0.75 0.18 145)' }}>
                אבחון חינם · 3 דקות
              </span>
            </div>

            <h2 style={{
              fontSize: 'clamp(1.5rem, 3.4vw, 2.3rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
              marginBottom: 12,
            }}>
              מזהה את עצמך? גלה איפה השיווק שלך <span className="text-gradient">דולף</span>.
            </h2>

            <p style={{
              fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 480,
            }}>
              10 שאלות קצרות, ואתה מקבל אבחון אישי: הציון שלך, האזורים החלשים, ו-3 הדברים לתקן קודם. בחינם, בלי להשאיר פרטים.
            </p>
          </div>

          <a
            href="/audit"
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 30px',
              background: 'var(--brand-prime)',
              color: 'oklch(0.12 0.02 160)',
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1.02rem',
              fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
              textDecoration: 'none',
              transition: 'background 0.2s',
              position: 'relative',
              zIndex: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-glow)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-prime)'; }}
          >
            עשה את האבחון ←
          </a>
        </div>
      </div>
    </section>
  );
}
