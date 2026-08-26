import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

/* ── סקשן 8 — עבודות (פורטפוליו אמיתי) ──
   בלי קייסים מפוברקים ובלי טענות תוצאות. רק מודעות אמיתיות שיצרתי. */

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

function GridTile({ item, index, onOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: (index % 3) * 0.07,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  }, [index]);

  return (
    <button
      ref={ref}
      onClick={() => onOpen(item)}
      style={{
        opacity: 0, position: 'relative', display: 'block', width: '100%',
        aspectRatio: '4 / 5', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid oklch(0.22 0.015 160)', background: 'var(--surface-1)',
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
        background: 'linear-gradient(to top, oklch(0.08 0.01 160 / 0.92), transparent)',
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.client}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--brand-glow)', fontWeight: 500 }}>{item.field}</div>
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
        background: 'oklch(0.05 0.01 160 / 0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="סגור"
        style={{
          position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 'var(--radius)',
          background: 'var(--surface-1)', border: '1px solid oklch(0.3 0.02 160)', color: 'var(--text-primary)',
          fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
        }}
      >×</button>
      <img
        src={`/portfolio/${item.file}`}
        alt={`קריאייטיב ${item.client} — ${item.field}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 'var(--radius-lg)', objectFit: 'contain' }}
      />
    </div>
  );
}

export default function Proof() {
  const headRef = useRef(null);
  const [open, setOpen] = useState(null);
  const [grid, setGrid] = useState(FALLBACK_GRID);
  const t = useContent({
    'proof.kicker': 'עבודות',
    'proof.title': 'קריאייטיב שיצרתי,',
    'proof.title_accent': 'בכל תחום.',
    'proof.lead': 'מודעות אמיתיות שהעליתי לאוויר לעסקים בתחומים שונים. לחץ על מודעה כדי להגדיל.',
  });

  useEffect(() => {
    supabase.from('proof_grid').select('*').order('position')
      .then(({ data }) => { if (data?.length) setGrid(data); });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.proof-head', { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true },
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
    <section id="work" style={{ padding: 'clamp(52px, 7vw, 88px) 28px', background: 'var(--surface-0)', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* כותרת */}
        <div ref={headRef} className="proof-head" style={{ textAlign: 'right', maxWidth: 680, marginBottom: 'clamp(32px, 5vw, 48px)', opacity: 0 }}>
          <div className="section-label">{t['proof.kicker']}</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 16 }}>
            {t['proof.title']} <span style={{ color: 'var(--brand-prime)' }}>{t['proof.title_accent']}</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t['proof.lead']}
          </p>
        </div>

        {/* גריד קריאייטיב */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {grid.map((g, i) => <GridTile key={g.id || g.file} item={g} index={i} onOpen={setOpen} />)}
        </div>
      </div>

      <Lightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}
