import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

/* ── סקשן 8 — הוכחה דו-שכבתית ("אתה יודע לחשוב ולעשות?") ──
   שכבה 1: קייסים אסטרטגיים (מוכיחים חשיבה) · שכבה 2: גריד קריאייטיב (מוכיח ביצוע+גיוון).
   אין טענות תוצאות — הכל מתויג "דוגמת תהליך". fallback-first מ-DB. */

const FALLBACK_CASES = [
  {
    tag: 'דוגמת תהליך',
    title: 'עסק קינוחי בוטיק',
    subtitle: 'מיצוב פרימיום בשוק רווי',
    quote: 'We don’t sell cakes, we sell style.',
    steps: [
      { k: 'הכאב', v: 'בשוק רווי, הלקוחה לא שואלת "כמה זה עולה" — אלא "מה יגידו?". המחיר לא הבעיה, הסטטוס הוא.' },
      { k: 'המיצוב', v: 'לא עוד קונדיטוריה — בית עיצוב. מוכרים חוויה ויוקרה, לא קילו שוקולד.' },
      { k: 'המשפך', v: 'פרסונה ברורה ("הפרפקציוניסטית המארחת"), מסר שמדבר לסטטוס, וערוצים ויזואליים שמשדרים יוקרה.' },
    ],
  },
  {
    tag: 'דוגמת תהליך · פרויקט קורס',
    title: 'City Transformer',
    subtitle: 'יצירת קטגוריה חדשה',
    quote: 'קטן עליך.',
    steps: [
      { k: 'הבעיה', v: 'רכב חשמלי מתקפל — קטגוריה שאין לה עדיין מדף בתודעת הצרכן.' },
      { k: 'המיצוב', v: 'במקום להילחם על מקום קיים — יוצרים קטגוריה חדשה. קונספט "קטן עליך".' },
      { k: 'הקריאייטיב', v: 'שפת מותג Urban Luxury, פרסונות, וסטוריבורד וידאו שמספר את הסיפור.' },
    ],
  },
];

const FALLBACK_GRID = [
  { file: 'events-yehuda.jpg',      client: 'יהודה סימן-טוב', field: 'אירועים' },
  { file: 'realestate-villas.jpg',  client: 'Real Estate',     field: 'נדל"ן' },
  { file: 'legal-skler.jpg',        client: 'עו"ד סקלר',       field: 'משפטי' },
  { file: 'retail-kehilot-card.jpg',client: 'קהילות קארד',     field: 'קמעונאות' },
  { file: 'food-shira-events.jpg',  client: 'SHIRA',           field: 'אוכל' },
  { file: 'health-24fit.png',       client: '24fit',           field: 'כושר' },
  { file: 'home-emanuel.jpg',       client: 'עמנואל צבע',      field: 'שירותי בית' },
  { file: 'beauty-hili.jpg',        client: 'Hili Nails',      field: 'יופי' },
  { file: 'education-imahot.jpg',   client: 'סדנת אימהות',     field: 'הורות' },
];

function CaseCard({ item, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: index * 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  }, [index]);

  return (
    <div
      ref={ref}
      className="shimmer-card"
      style={{
        opacity: 0, textAlign: 'right',
        padding: 'clamp(24px, 3vw, 34px)', borderRadius: 20,
        background: 'var(--surface-1)', border: '1px solid oklch(0.22 0.02 240)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 2,
        background: 'linear-gradient(to left, var(--brand-prime), oklch(0.65 0.22 200 / 0.6), transparent)' }} />

      <span style={{
        display: 'inline-block', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        background: 'oklch(0.18 0.025 240)', border: '1px solid oklch(0.28 0.02 240)',
        borderRadius: 999, padding: '4px 12px', marginBottom: 16,
      }}>
        {item.tag}
      </span>

      <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 4 }}>
        {item.title}
      </h3>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 18 }}>
        {item.subtitle}
      </div>

      <blockquote style={{
        margin: '0 0 22px', padding: '12px 16px', borderRadius: 12,
        background: 'oklch(0.785 0.173 156.6 / 0.08)', borderRight: '3px solid var(--brand-prime)',
        fontSize: '1.02rem', fontWeight: 800, color: 'var(--brand-glow)', direction: 'ltr', textAlign: 'right',
      }}>
        {item.quote}
      </blockquote>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {item.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-prime)',
              minWidth: 64, paddingTop: 2,
            }}>{s.k}</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.v}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 20, fontStyle: 'italic' }}>
        דוגמת חשיבה ותהליך — לא טענת תוצאות.
      </p>
    </div>
  );
}

function GridTile({ item, index, onOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 30, opacity: 0, scale: 0.96 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', delay: (index % 3) * 0.07,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }, [index]);

  return (
    <button
      ref={ref}
      onClick={() => onOpen(item)}
      style={{
        opacity: 0, position: 'relative', display: 'block', width: '100%',
        aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden',
        border: '1px solid oklch(0.22 0.02 240)', background: 'var(--surface-1)',
        cursor: 'pointer', padding: 0, textAlign: 'right',
      }}
      aria-label={`הגדל מודעה — ${item.client}`}
    >
      <img
        src={`/portfolio/${item.file}`}
        alt={`קריאייטיב ${item.client} — ${item.field}`}
        loading="lazy"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      <div style={{
        position: 'absolute', insetInline: 0, bottom: 0, padding: '28px 14px 12px',
        background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.92), transparent)',
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.client}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--brand-glow)', fontWeight: 600 }}>{item.field}</div>
      </div>
    </button>
  );
}

function Lightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'oklch(0.05 0.01 240 / 0.9)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="סגור"
        style={{
          position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%',
          background: 'oklch(0.14 0.02 240)', border: '1px solid oklch(0.3 0.02 240)', color: 'var(--text-primary)',
          fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
        }}
      >×</button>
      <img
        src={`/portfolio/${item.file}`}
        alt={`קריאייטיב ${item.client} — ${item.field}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 14, objectFit: 'contain', boxShadow: '0 20px 80px oklch(0 0 0 / 0.6)' }}
      />
    </div>
  );
}

export default function Proof() {
  const headRef = useRef(null);
  const grHeadRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [cases, setCases] = useState(FALLBACK_CASES);
  const [grid, setGrid] = useState(FALLBACK_GRID);
  const t = useContent({
    'proof.kicker': 'The Proof',
    'proof.title': 'לא מבטיח.',
    'proof.title_accent': 'מראה.',
    'proof.lead': 'קודם החשיבה — איך מחקר מדויק בונה מיצוב של עסק. אחר כך הביצוע — קריאייטיב אמיתי שיצרתי, בכל תחום ולכל קהל.',
    'proof.grid_title': 'קריאייטיב שמוכר —',
    'proof.grid_title_accent': 'בכל תחום, לכל קהל.',
  });

  useEffect(() => {
    supabase.from('proof_cases').select('*').order('position')
      .then(({ data }) => {
        if (data?.length) setCases(data.map(r => ({
          ...r, steps: Array.isArray(r.steps) ? r.steps : JSON.parse(r.steps || '[]'),
        })));
      });
    supabase.from('proof_grid').select('*').order('position')
      .then(({ data }) => { if (data?.length) setGrid(data); });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.proof-head', { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
      });
      gsap.fromTo('.proof-grid-head', { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: grHeadRef.current, start: 'top 88%', once: true },
      });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="work" style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* כותרת */}
        <div ref={headRef} className="proof-head" style={{ textAlign: 'right', maxWidth: 680, marginBottom: 'clamp(36px, 5vw, 56px)', opacity: 0 }}>
          <div className="section-label">{t['proof.kicker']}</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 16, fontFamily: "'Heebo', sans-serif" }}>
            {t['proof.title']} <span className="text-gradient">{t['proof.title_accent']}</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {t['proof.lead']}
          </p>
        </div>

        {/* שכבה 1 — קייסים */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 'clamp(56px, 8vw, 84px)' }}>
          {cases.map((c, i) => <CaseCard key={c.id || i} item={c} index={i} />)}
        </div>

        {/* שכבה 2 — גריד קריאייטיב */}
        <div ref={grHeadRef} className="proof-grid-head" style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 40px)', opacity: 0 }}>
          <h3 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {t['proof.grid_title']} <span style={{ color: 'var(--brand-prime)' }}>{t['proof.grid_title_accent']}</span>
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {grid.map((g, i) => <GridTile key={g.id || g.file} item={g} index={i} onOpen={setOpen} />)}
        </div>
      </div>

      <Lightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
