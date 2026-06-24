import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── סקשן 3 — הכאב ("מבינים אותי?") ──
   ירוק שמור לפעולה בלבד; הכאב ניטרלי/כהה, וההקלה (ירוק) רק בסוף. */
const PAINS = [
  'שורף תקציב על ממומן — והלידים פשוט לא מגיעים.',
  'מפרסם, אבל לא באמת בטוח מה המסר שעובד, ולמי.',
  'במקום לנהל את העסק, אתה רודף אחרי הקמפיינים והפוסטים.',
  'כבר נכווית מסוכנות שהבטיחה הרים — והעבירה אותך למתמחה.',
];

function PainCard({ text, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 30, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: index * 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '20px 22px', borderRadius: 16,
        background: 'oklch(0.11 0.015 240 / 0.6)',
        border: '1px solid oklch(0.20 0.02 240)',
        textAlign: 'right', opacity: 0,
      }}
    >
      <span style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.18 0.025 240)', border: '1px solid oklch(0.30 0.02 240)',
        marginTop: 2,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </span>
      <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.55 }}>
        {text}
      </p>
    </div>
  );
}

export default function PainSection() {
  const headRef = useRef(null);
  const bridgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pain-head', { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
      });
      gsap.fromTo('.pain-bridge', { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: bridgeRef.current, start: 'top 90%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ padding: 'clamp(64px, 10vw, 110px) 28px', background: 'var(--bedrock)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* כותרת — הוק הכאב */}
        <div ref={headRef} className="pain-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            רגע של אמת
          </span>
          <h2 style={{
            fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)',
            marginTop: 14, maxWidth: 680, marginInline: 'auto',
          }}>
            נמאס לרדוף אחרי השיווק — ולא לראות תוצאה?
          </h2>
        </div>

        {/* כרטיסי כאב — 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {PAINS.map((t, i) => <PainCard key={i} text={t} index={i} />)}
        </div>

        {/* מעבר להקלה — כאן נכנס הירוק */}
        <div ref={bridgeRef} className="pain-bridge" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.6rem)', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            זה לא חייב להיות ככה.{' '}
            <span style={{ color: 'var(--brand-prime)' }}>יש דרך אחת מסודרת.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
