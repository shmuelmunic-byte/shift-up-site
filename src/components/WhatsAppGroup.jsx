import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WA_GROUP = 'https://chat.whatsapp.com/LyJmliw2l7CL8Kq0ImYVFa';

const perks = [
  {
    emoji: '🧠',
    title: 'אסטרטגיה',
    desc: 'למה לקוחות קונים — ואיך לגרום להם לבחור בך.',
  },
  {
    emoji: '🤖',
    title: 'כלי AI',
    desc: 'פרומפטים ושיטות לחיסכון בזמן וכסף.',
  },
  {
    emoji: '🔍',
    title: 'ניתוחי עומק',
    desc: 'פירוק מהלכים שיווקיים והתאמה לעסקים קטנים.',
  },
];

export default function WhatsAppGroup() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.wag-card',
        { y: 60, opacity: 0, scale: 0.97 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: '.wag-card', start: 'top 82%', once: true },
        }
      );
      gsap.fromTo(
        '.wag-perk',
        { x: -20, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.65, ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.wag-perks', start: 'top 82%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 120px) 28px',
        background: 'var(--surface-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient blob */}
      <div
        className="fluid-blob"
        style={{
          width: 500, height: 500,
          bottom: '-10%', left: '-5%',
          background: 'radial-gradient(circle, oklch(0.55 0.20 145 / 0.10), transparent 70%)',
          '--dur': '22s',
        }}
      />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Card */}
        <div
          className="wag-card"
          style={{
            opacity: 0,
            background: 'var(--surface-1)',
            border: '1px solid oklch(0.55 0.20 145 / 0.25)',
            borderRadius: 28,
            padding: 'clamp(32px, 5vw, 52px)',
            boxShadow: '0 0 60px oklch(0.55 0.20 145 / 0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* green glow top-right */}
          <div style={{
            position: 'absolute', top: -60, left: -60,
            width: 280, height: 280,
            background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.13), transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28, flexWrap: 'wrap' }}>
            {/* WA icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'oklch(0.55 0.22 145)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px oklch(0.55 0.22 145 / 0.4)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div className="section-label" style={{ marginBottom: 6 }}>WhatsApp Community</div>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  fontFamily: "'Heebo', sans-serif",
                }}
              >
                החדר האחורי{' '}
                <span className="text-gradient">של השיווק</span>{' '}
                🚀
              </h2>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.78,
            marginBottom: 32,
            maxWidth: 560,
          }}>
            לבעלי עסקים שרוצים להבין איך המשחק עובד באמת — בלי סיסמאות, בלי תיאוריות.
            רק פרקטיקה עסקית, פסיכולוגיה של מכירות ושימוש חכם ב-AI.
          </p>

          {/* Perks */}
          <div
            className="wag-perks"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginBottom: 36,
            }}
          >
            {perks.map((p, i) => (
              <div
                key={i}
                className="wag-perk"
                style={{
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 18px',
                  background: 'var(--surface-2)',
                  borderRadius: 14,
                  border: '1px solid oklch(0.22 0.02 240)',
                }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {p.title}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    {' '}— {p.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dosage badge + CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'oklch(0.55 0.22 145 / 0.1)',
              border: '1px solid oklch(0.55 0.22 145 / 0.25)',
              borderRadius: 999, padding: '8px 16px',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.65 0.22 145)', display: 'block', boxShadow: '0 0 6px oklch(0.65 0.22 145)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'oklch(0.75 0.18 145)' }}>
                2 הודעות בשבוע · קצר, חד, לעניין
              </span>
            </div>

            <a
              href={WA_GROUP}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 28px',
                background: 'oklch(0.55 0.22 145)',
                color: 'white',
                borderRadius: 999,
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: "'Heebo', sans-serif",
                textDecoration: 'none',
                boxShadow: '0 0 32px oklch(0.55 0.22 145 / 0.35)',
                transition: 'background 0.25s, box-shadow 0.25s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'oklch(0.62 0.22 145)';
                e.currentTarget.style.boxShadow = '0 0 48px oklch(0.55 0.22 145 / 0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'oklch(0.55 0.22 145)';
                e.currentTarget.style.boxShadow = '0 0 32px oklch(0.55 0.22 145 / 0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              הצטרף לקבוצה — בחינם
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
