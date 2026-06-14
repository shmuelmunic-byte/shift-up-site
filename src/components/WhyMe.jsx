import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const REASON_ICONS = [
  <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.64"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.64"/></svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
];
const REASON_EN    = ['Entrepreneurial Mindset', 'AI-First', 'Focused Clientele', 'Message Before Budget'];
const REASON_WIDE  = [true, false, false, true];
const REASON_ACCENT = ['var(--brand-prime)', 'var(--accent-void)', 'var(--brand-prime)', 'var(--brand-prime)'];

const FALLBACK_REASONS = [
  { title: 'גישה יזמית',             description: 'אני חושב כמו בעלים של עסק, לא כמו ספק שירות. אני שואל את השאלות הקשות לפני שאני שולח הצעת מחיר.' },
  { title: 'AI ראשון',               description: 'מה שלוקח לאחרים שבוע — אני מבצע בכמה שעות, ובאיכות גבוהה יותר.' },
  { title: 'מספר לקוחות מצומצם',    description: 'כל לקוח מקבל ראש שלם, לא חצי תשומת לב.' },
  { title: 'מסר לפני תקציב',        description: 'לא שורפים כסף בקמפיינים לפני שהבנו מה אנחנו מוכרים ולמי. הכסף שלך עובד רק כשהמסר מדויק.' },
];

function BentoCard({ reason, index }) {
  const cardRef = useRef(null);
  const icon   = REASON_ICONS[index]   || REASON_ICONS[0];
  const en     = REASON_EN[index]      || '';
  const wide   = REASON_WIDE[index]    ?? false;
  const accent = REASON_ACCENT[index]  || 'var(--brand-prime)';

  const onMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  };

  return (
    <div
      ref={cardRef}
      className={`whyme-card bento-card shimmer-card${wide ? ' bento-wide' : ''}`}
      onMouseMove={onMove}
      style={{ opacity: 0, minHeight: wide ? 180 : 200 }}
    >
      {/* Accent corner dot */}
      <div style={{
        position: 'absolute',
        top: 20, left: 20,
        width: 6, height: 6,
        borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 12px ${accent}`,
        opacity: 0.7,
      }} />

      {/* Big number watermark */}
      <div className="accent-number" style={{
        position: 'absolute',
        bottom: -20, left: 12,
        fontSize: '7rem',
        zIndex: 0,
        direction: 'ltr',
      }}>
        0{index + 1}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon + EN label row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: `oklch(0.78 0.20 145 / 0.1)`,
            border: `1px solid oklch(0.78 0.20 145 / 0.2)`,
            color: 'var(--brand-prime)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>
          <span style={{
            fontSize: '0.62rem',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            color: 'var(--text-muted)',
            fontWeight: 700,
            direction: 'ltr',
          }}>
            {en}
          </span>
        </div>

        <h3 style={{
          fontSize: wide ? 'clamp(1.25rem, 2.5vw, 1.6rem)' : 'clamp(1.1rem, 2vw, 1.35rem)',
          fontWeight: 900,
          letterSpacing: '-0.01em',
          marginBottom: 10,
          fontFamily: "'Heebo', sans-serif",
          color: 'var(--text-primary)',
        }}>
          {reason.title}
        </h3>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          maxWidth: wide ? 480 : '100%',
        }}>
          {reason.description}
        </p>
      </div>
    </div>
  );
}

export default function WhyMe() {
  const sectionRef = useRef(null);
  const [reasons, setReasons] = useState(FALLBACK_REASONS);

  useEffect(() => {
    supabase.from('why_me_reasons').select('*').order('position')
      .then(({ data }) => { if (data?.length) setReasons(data); });
  }, []);

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
          duration: 0.75, ease: 'expo.out', stagger: 0.1,
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
      {/* Aurora orbs */}
      <div className="aurora-orb" style={{
        width: 500, height: 500,
        top: '-10%', right: '-5%',
        background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.08), transparent 70%)',
        '--dur': '18s',
      }} />
      <div className="aurora-orb" style={{
        width: 400, height: 400,
        bottom: '-5%', left: '-5%',
        background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.07), transparent 70%)',
        '--dur': '22s', '--delay': '-7s',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div className="whyme-header" style={{ textAlign: 'right', maxWidth: 640, marginBottom: 52, opacity: 0 }}>
          <div className="section-label">Why Me</div>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 18,
            fontFamily: "'Heebo', sans-serif",
          }}>
            למה לעבוד דווקא{' '}
            <span className="text-gradient">איתי?</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            יש המון משווקי דיגיטל. יש לי 4 סיבות אמיתיות למה אני אהיה ההחלטה החכמה שלך.
          </p>
        </div>

        <div className="whyme-cards bento-grid">
          {reasons.map((r, i) => (
            <BentoCard key={i} reason={r} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
