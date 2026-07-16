import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

/* ── זמינות חיה לפי שעון ישראל (08:00–17:00) ── */
function isOnlineNow() {
  const hour = parseInt(
    new Intl.DateTimeFormat('he-IL', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()),
    10
  );
  return hour >= 8 && hour < 17;
}

/* אייקונים נשארים בקוד — ממופים לפי position/index */
const PILLAR_ICONS = [
  (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" /></>),
  (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>),
  (<><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.1A8.4 8.4 0 1 1 21 11.5Z" /></>),
];

/* ── עמודי אמון (סקשן 2 — "אפשר לסמוך?") — fallback ── */
const FALLBACK_PILLARS = [
  { title: 'מבוסס מחקר', text: 'אף שקל לא נכנס לקמפיין לפני מחקר: קהל, מתחרים, מסר. החלטות על דאטה — לא על תחושת בטן.' },
  { title: 'הבטחת ביצוע', text: 'חודש הניהול הראשון על אחריותי: אם הוא לא מביא פניות — ממשיך לעבוד בלי לגבות, עד שעובד.' },
  { title: 'בגובה העיניים', text: 'שותף ביצוע, לא מוכר. שיחת היכרות חינם — נבדוק התאמה בלי לחץ ובלי באזוורדז.' },
];

function Pillar({ pillar, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 28, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: index * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  }, [index]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        flex: '1 1 240px', minWidth: 0, opacity: 0, textAlign: 'right',
      }}
    >
      <span style={{
        flexShrink: 0, width: 44, height: 44, borderRadius: 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'oklch(0.78 0.20 145 / 0.1)', border: '1px solid oklch(0.78 0.20 145 / 0.22)',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {PILLAR_ICONS[index] || PILLAR_ICONS[0]}
        </svg>
      </span>
      <div>
        <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          {pillar.title}
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {pillar.text}
        </p>
      </div>
    </div>
  );
}

export default function TrustStrip() {
  const headRef = useRef(null);
  const [online, setOnline] = useState(isOnlineNow);
  const [pillars, setPillars] = useState(FALLBACK_PILLARS);
  const t = useContent({
    'trust.title': 'למה לסמוך עליי?',
    'trust.title_accent': 'כי הסיכון עליי.',
  });

  useEffect(() => {
    supabase.from('trust_pillars').select('*').order('position')
      .then(({ data }) => { if (data?.length) setPillars(data); });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setOnline(isOnlineNow()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
    );
  }, []);

  return (
    <section style={{ padding: 'clamp(40px, 7vw, 72px) 28px', background: 'var(--surface-0)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* כותרת סלקטיביות + זמינות חיה */}
        <div ref={headRef} style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)', opacity: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: online ? 'oklch(0.78 0.20 145 / 0.1)' : 'oklch(0.14 0.02 240)',
            border: `1px solid ${online ? 'oklch(0.78 0.20 145 / 0.3)' : 'oklch(0.22 0.02 240)'}`,
            borderRadius: 999, padding: '5px 14px', marginBottom: 20,
            transition: 'all 0.4s ease',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: online ? 'var(--brand-prime)' : 'oklch(0.4 0.01 240)',
              display: 'block', flexShrink: 0,
              boxShadow: online ? '0 0 6px var(--brand-prime)' : 'none',
              animation: online ? 'pulse-ring 2s ease-out infinite' : 'none',
            }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: online ? 'var(--brand-prime)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {online ? 'זמין עכשיו' : 'מענה בד״כ תוך שעה'}
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)',
          }}>
            {t['trust.title']} <span style={{ color: 'var(--brand-prime)' }}>{t['trust.title_accent']}</span>
          </h2>
        </div>

        {/* עמודי אמון */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 4vw, 40px)', justifyContent: 'center' }}>
          {pillars.map((p, i) => <Pillar key={p.id || i} pillar={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
