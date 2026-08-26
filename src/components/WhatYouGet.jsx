import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

/* אייקונים נשארים בקוד — ממופים לפי position/index */
const OUTCOME_ICONS = [
  (<><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>),
  (<><path d="M9 12l2 2 4-4" /><path d="M12 3c-1.5 2-4 3-7 3 0 5.5 2.5 9.5 7 12 4.5-2.5 7-6.5 7-12-3 0-5.5-1-7-3Z" /></>),
  (<><path d="M3 11l19-9-9 19-2-8-8-2Z" /></>),
  (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
];

/* ── סקשן 6 — "מה תקבל" ("מה יוצא לי?") — fallback ──
   התשובה הרגשית למשפך: לידים + שקט, בלי שתתעסק. */
const FALLBACK_OUTCOMES = [
  { title: 'לידים שנכנסים, לא חשיפות', text: 'קמפיינים שמביאים פניות אמיתיות מלקוחות שמתאימים לך, פניות שאפשר לסגור. לא לייקים ולא "מודעות מותג" מעורפלת.' },
  { title: 'שקט נפשי, מישהו אחד אחראי', text: 'אתה מפסיק לרדוף אחרי פוסטים, קמפיינים ומספרים. איש אחד לוקח את כל השיווק לידיים, מבצע ומדווח לך.' },
  { title: 'מסר חד שאתה גאה בו', text: 'סוף סוף השיווק שלך נשמע כמוך. מזקק את מה שמייחד אותך, ומבדל אותך מהמתחרים בלי הנחות.' },
  { title: 'הזמן שלך חוזר אליך', text: 'במקום להתעסק בשיווק, אתה חוזר לעשות את מה שאתה הכי טוב בו: לנהל ולהצמיח את העסק.' },
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
        padding: '24px 24px', borderRadius: 4,
        background: '#fff',
        border: '1px solid #e1e8f0',
        textAlign: 'right', opacity: 0,
      }}
    >
      <span style={{ flexShrink: 0, width: 38, height: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }} aria-hidden="true">
        <span style={{ width: 16, height: 16, background: '#1f9d57', transform: 'skewX(-12deg)' }} />
      </span>
      <div>
        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0c1118', marginBottom: 6 }}>
          {outcome.title}
        </h3>
        <p style={{ fontSize: '0.92rem', color: '#4a5868', lineHeight: 1.65 }}>
          {outcome.text}
        </p>
      </div>
    </div>
  );
}

export default function WhatYouGet() {
  const headRef = useRef(null);
  const lineRef = useRef(null);
  const [outcomes, setOutcomes] = useState(FALLBACK_OUTCOMES);
  const t = useContent({
    'wyg.kicker': 'מה מקבלים',
    'wyg.title': 'בשורה התחתונה?',
    'wyg.title_accent': 'לידים ושקט.',
    'wyg.subtitle': 'אתה ממשיך לנהל את העסק. את השיווק אני לוקח על עצמי, וזה מה שמחזירים לך.',
    'wyg.summary': 'תפסיק להיות מנהל שיווק במשרה חלקית.',
    'wyg.summary_accent': 'תהיה שוב הבעלים.',
  });

  useEffect(() => {
    supabase.from('outcomes').select('*').order('position')
      .then(({ data }) => { if (data?.length) setOutcomes(data); });
  }, []);

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
    <section style={{ padding: 'clamp(48px, 7vw, 84px) 28px', background: 'linear-gradient(180deg, #eef3f8 0%, #e6edf5 100%)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* כותרת */}
        <div ref={headRef} className="wyg-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: '#117a41', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {t['wyg.kicker']}
          </span>
          <h2 style={{
            fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0c1118',
            marginTop: 14, maxWidth: 700, marginInline: 'auto',
          }}>
            {t['wyg.title']} <span style={{ color: '#117a41' }}>{t['wyg.title_accent']}</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: '#4a5868', lineHeight: 1.7, marginTop: 14, maxWidth: 560, marginInline: 'auto' }}>
            {t['wyg.subtitle']}
          </p>
        </div>

        {/* כרטיסי תוצאה — 2×2 */}
        <div className="grid-2x2">
          {outcomes.map((o, i) => <OutcomeCard key={o.id || i} outcome={o} index={i} />)}
        </div>

        {/* שורת סיכום */}
        <div ref={lineRef} className="wyg-line" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, lineHeight: 1.5, color: '#0c1118' }}>
            {t['wyg.summary']}{' '}
            <span style={{ color: '#117a41' }}>{t['wyg.summary_accent']}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
