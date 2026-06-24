import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── סקשן 6 — "מה תקבל" ("מה יוצא לי?") ──
   התשובה הרגשית למשפך: לידים + שקט, בלי שתתעסק.
   ירוק על האייקונים — זו נקודת הפייאוף החיובית של הדף. */
const OUTCOMES = [
  {
    title: 'לידים שנכנסים — לא רק חשיפות',
    text: 'קמפיינים שמביאים פניות אמיתיות מלקוחות שמתאימים לך. לא לייקים, לא "מודעות מותג" מעורפלת — פניות שאפשר לסגור.',
    icon: (
      <>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </>
    ),
  },
  {
    title: 'שקט נפשי — מישהו אחד אחראי',
    text: 'אתה מפסיק לרדוף אחרי פוסטים, קמפיינים ומספרים. איש אחד לוקח את כל השיווק לידיים, מבצע ומדווח לך.',
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <path d="M12 3c-1.5 2-4 3-7 3 0 5.5 2.5 9.5 7 12 4.5-2.5 7-6.5 7-12-3 0-5.5-1-7-3Z" />
      </>
    ),
  },
  {
    title: 'מסר חד שאתה גאה בו',
    text: 'סוף סוף השיווק שלך נשמע כמוך — מזקק את מה שמייחד אותך, ומבדל אותך מהמתחרים בלי הנחות.',
    icon: (
      <>
        <path d="M3 11l19-9-9 19-2-8-8-2Z" />
      </>
    ),
  },
  {
    title: 'הזמן שלך חוזר אליך',
    text: 'במקום להתעסק בשיווק, אתה חוזר לעשות את מה שאתה הכי טוב בו — לנהל ולהצמיח את העסק.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
];

function OutcomeCard({ outcome, index }) {
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
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '24px 24px', borderRadius: 16,
        background: 'oklch(0.11 0.015 240 / 0.6)',
        border: '1px solid oklch(0.20 0.02 240)',
        textAlign: 'right', opacity: 0,
      }}
    >
      <span style={{
        flexShrink: 0, width: 46, height: 46, borderRadius: 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.78 0.20 145 / 0.1)', border: '1px solid oklch(0.78 0.20 145 / 0.22)',
      }}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {outcome.icon}
        </svg>
      </span>
      <div>
        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          {outcome.title}
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {outcome.text}
        </p>
      </div>
    </div>
  );
}

export default function WhatYouGet() {
  const headRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.wyg-head', { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
      });
      gsap.fromTo('.wyg-line', { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: lineRef.current, start: 'top 90%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ padding: 'clamp(64px, 10vw, 110px) 28px', background: 'var(--bedrock)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* כותרת */}
        <div ref={headRef} className="wyg-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: 'var(--brand-prime)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            What You Get
          </span>
          <h2 style={{
            fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)',
            marginTop: 14, maxWidth: 700, marginInline: 'auto',
          }}>
            בשורה התחתונה? <span style={{ color: 'var(--brand-prime)' }}>לידים ושקט.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 14, maxWidth: 560, marginInline: 'auto' }}>
            אתה ממשיך לנהל את העסק. את השיווק אני לוקח על עצמי — וזה מה שמחזירים לך.
          </p>
        </div>

        {/* כרטיסי תוצאה — 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {OUTCOMES.map((o, i) => <OutcomeCard key={i} outcome={o} index={i} />)}
        </div>

        {/* שורת סיכום */}
        <div ref={lineRef} className="wyg-line" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            תפסיק להיות מנהל שיווק במשרה חלקית.{' '}
            <span style={{ color: 'var(--brand-prime)' }}>תהיה שוב הבעלים.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
