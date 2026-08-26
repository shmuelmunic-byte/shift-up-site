import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Bot, Search } from 'lucide-react';
import { useSiteLinks } from '../lib/useSiteLinks';
import { WhatsAppIcon } from './icons';

gsap.registerPlugin(ScrollTrigger);

const perks = [
  {
    Icon: Brain,
    title: 'אסטרטגיה',
    desc: 'למה לקוחות קונים, ואיך לגרום להם לבחור בך.',
  },
  {
    Icon: Bot,
    title: 'כלי AI',
    desc: 'פרומפטים ושיטות לחיסכון בזמן וכסף.',
  },
  {
    Icon: Search,
    title: 'ניתוחי עומק',
    desc: 'פירוק מהלכים שיווקיים והתאמה לעסקים קטנים.',
  },
];

export default function WhatsAppGroup() {
  const sectionRef = useRef(null);
  const { whatsapp_group: WA_GROUP } = useSiteLinks();

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
        padding: 'clamp(52px, 7vw, 84px) 28px',
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
            borderRadius: 4,
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
              width: 56, height: 56, borderRadius: 4, flexShrink: 0,
              background: 'oklch(0.55 0.22 145)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px oklch(0.55 0.22 145 / 0.4)',
            }}>
              <WhatsAppIcon size={28} style={{ color: 'white' }} />
            </div>

            <div style={{ flex: 1 }}>
              <div className="section-label" style={{ marginBottom: 6 }}>קהילת וואטסאפ</div>
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
                }}
              >
                החדר האחורי{' '}
                <span className="text-gradient">של השיווק</span>
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
            לבעלי עסקים שרוצים להבין איך המשחק עובד באמת, בלי סיסמאות ובלי תיאוריות.
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
                  borderRadius: 3,
                  border: '1px solid oklch(0.22 0.02 240)',
                }}
              >
                <span style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: 3,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: 'oklch(0.55 0.22 145 / 0.14)', color: 'var(--brand-prime)',
                }}>
                  <p.Icon size={17} strokeWidth={2.2} aria-hidden="true" />
                </span>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {p.title}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    {': '}{p.desc}
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
              borderRadius: 3, padding: '8px 16px',
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
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
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
              <WhatsAppIcon size={20} />
              הצטרף לקבוצה, בחינם
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
