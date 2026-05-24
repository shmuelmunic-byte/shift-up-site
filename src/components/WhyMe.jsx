import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reasons = [
  {
    title: 'גישה יזמית',
    en: 'Entrepreneurial',
    desc: 'אני חושב כמו בעלים של עסק, לא כמו ספק שירות. אני שואל את השאלות הקשות לפני שאני שולח הצעת מחיר.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    title: 'AI ראשון',
    en: 'AI-First Mindset',
    desc: 'אני חוקר את כלי ה-AI החדשים יום-יום. מה שלוקח לאחרים שבוע, אני מבצע בכמה שעות, ובאיכות גבוהה יותר.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.64"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.64"/>
      </svg>
    ),
  },
  {
    title: 'מספר לקוחות מצומצם',
    en: 'Focused Clientele',
    desc: 'אני לא משרד פרסום שמטפל ב-50 לקוחות במקביל. כל לקוח מקבל ראש שלם, לא חצי תשומת לב.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'מסר לפני תקציב',
    en: 'Message Before Budget',
    desc: 'לא שורפים כסף בקמפיינים לפני שהבנו מה אנחנו מוכרים ולמי. הכסף שלך עובד רק כשהמסר מדויק.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
];

export default function WhyMe() {
  const sectionRef  = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.whyme-header',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: '.whyme-header', start: 'top 80%', once: true },
        }
      );
      gsap.fromTo(
        '.whyme-card',
        { y: 50, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.8, ease: 'expo.out', stagger: 0.1,
          scrollTrigger: { trigger: '.whyme-cards', start: 'top 78%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="why"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 130px) 28px',
        background: 'var(--bedrock)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div className="whyme-header" style={{ textAlign: 'right', maxWidth: 640, marginBottom: 60, opacity: 0 }}>
          <div className="section-label">Why Me</div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: 18,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            למה לעבוד דווקא{' '}
            <span className="text-gradient">איתי?</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            יש המון משווקי דיגיטל. יש לי 4 סיבות אמיתיות למה אני אהיה ההחלטה החכמה שלך.
          </p>
        </div>

        <div
          className="whyme-cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          {reasons.map((r, i) => {
            const isActive = activeCard === i;

            return (
              <div
                key={i}
                className="whyme-card"
                onMouseEnter={() => setActiveCard(i)}
                style={{
                  opacity: 0,
                  borderRadius: 20,
                  background: isActive ? 'var(--surface-2)' : 'var(--surface-1)',
                  padding: 'clamp(22px, 3vw, 32px)',
                  border: `1px solid ${isActive ? 'oklch(0.78 0.20 145 / 0.35)' : 'transparent'}`,
                  transition: 'background 0.35s ease, border-color 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'translateY(-5px)' : 'translateY(0)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                }}
              >
                {/* Background number decorator */}
                <div style={{
                  position: 'absolute',
                  top: -10, left: 12,
                  fontSize: '6rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  color: isActive ? 'oklch(0.78 0.20 145 / 0.07)' : 'oklch(0.97 0.005 240 / 0.03)',
                  fontFamily: "'Heebo', sans-serif",
                  letterSpacing: '-0.04em',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  transition: 'color 0.35s ease',
                  direction: 'ltr',
                }}>
                  0{i + 1}
                </div>

                {/* Active indicator line */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0, right: 0,
                    height: 2,
                    width: isActive ? '100%' : '0%',
                    background: 'var(--brand-prime)',
                    borderRadius: '0 0 20px 20px',
                    transition: 'width 0.5s var(--ease-spring)',
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <div
                    style={{
                      width: 48, height: 48,
                      borderRadius: 14,
                      background: isActive ? 'oklch(0.78 0.20 145 / 0.2)' : 'oklch(0.78 0.20 145 / 0.08)',
                      color: 'var(--brand-prime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.35s ease',
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4, direction: 'ltr' }}>
                      {r.en}
                    </div>
                    <h3
                      style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        marginBottom: 10,
                        fontFamily: "'Heebo', sans-serif",
                        color: isActive ? 'var(--text-primary)' : 'oklch(0.88 0.005 240)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {r.title}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                      {r.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
