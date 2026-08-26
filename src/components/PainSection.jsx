import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

/* ── סקשן 3 — הכאב ("מבינים אותי?") — fallback ──
   ירוק שמור לפעולה בלבד; הכאב ניטרלי/כהה, וההקלה (ירוק) רק בסוף. */
const FALLBACK_PAINS = [
  { text: 'שורף תקציב על ממומן, והלידים פשוט לא מגיעים.' },
  { text: 'מפרסם, אבל לא באמת בטוח מה המסר שעובד, ולמי.' },
  { text: 'במקום לנהל את העסק, אתה רודף אחרי הקמפיינים והפוסטים.' },
  { text: 'עבדת עם מישהו שהבטיח הרבה, ובסוף התוצאות לא הגיעו.' },
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
        padding: '20px 22px', borderRadius: 4,
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
  const [pains, setPains] = useState(FALLBACK_PAINS);
  const t = useContent({
    'pain.kicker': 'רגע של אמת',
    'pain.title': 'נמאס לרדוף אחרי השיווק, בלי לראות תוצאה?',
    'pain.bridge': 'זה לא חייב להיות ככה.',
    'pain.bridge_accent': 'יש דרך אחת מסודרת.',
  });

  useEffect(() => {
    supabase.from('pain_points').select('*').order('position')
      .then(({ data }) => { if (data?.length) setPains(data); });
  }, []);

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
    <section style={{ padding: 'clamp(48px, 7vw, 84px) 28px', background: 'var(--bedrock)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* כותרת — הוק הכאב */}
        <div ref={headRef} className="pain-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {t['pain.kicker']}
          </span>
          <h2 style={{
            fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)',
            marginTop: 14, maxWidth: 680, marginInline: 'auto',
          }}>
            {t['pain.title']}
          </h2>
        </div>

        {/* כרטיסי כאב — 2×2 */}
        <div className="grid-2x2">
          {pains.map((p, i) => <PainCard key={p.id || i} text={p.text} index={i} />)}
        </div>

        {/* מעבר להקלה — כאן נכנס הירוק */}
        <div ref={bridgeRef} className="pain-bridge" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.6rem)', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {t['pain.bridge']}{' '}
            <span style={{ color: 'var(--brand-prime)' }}>{t['pain.bridge_accent']}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
