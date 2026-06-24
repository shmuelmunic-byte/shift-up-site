import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const STEP_ICONS = [
  <svg key="0" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  <svg key="1" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  <svg key="2" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
];

const FALLBACK_STEPS = [
  { title: 'הפיצוח',  description: 'חופרים פנימה: מי הקהל שבאמת משלם, מה ה-DNA של העסק, ולמה שיבחרו בך ולא במתחרה. מזקקים את המסר — ובונים תוכנית עבודה ברורה.', bullets: ['מיפוי קהל היעד', 'ניתוח מתחרים', 'מסר + תוכנית עבודה'] },
  { title: 'השיפט',   description: 'לפני שקל אחד נכנס לממומן — בונים את המגרש. איזה משפך מביא לידים, איזה תוכן מניע לפעולה, ובאילו ערוצים משחקים. מפת דרכים, לא הימור.', bullets: ['בניית משפך שיווקי', 'תוכנית תוכן ומסרים', 'בחירת הערוצים הנכונים'] },
  { title: 'האקשן',   description: 'עכשיו ניגשים לכלים. מקים ומנהל את הקמפיינים ב-Meta וב-Google, מייצר קריאייטיב שמוכר, בונה דפי נחיתה ממירים ומקים אוטומציות AI שחוסכות זמן.', bullets: ['קמפיינים ב-Meta + Google', 'קריאייטיב שמוכר', 'דפי נחיתה + אוטומציות AI'] },
];

export default function Process() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(null);
  const [steps, setSteps] = useState(FALLBACK_STEPS);

  useEffect(() => {
    supabase.from('process_steps').select('*').order('position')
      .then(({ data }) => {
        if (data?.length) setSteps(data.map(r => ({
          title:       r.title,
          description: r.description,
          bullets:     Array.isArray(r.bullets) ? r.bullets : JSON.parse(r.bullets || '[]'),
        })));
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.process-header',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: '.process-header', start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '.process-card',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.85, ease: 'expo.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.process-cards-grid', start: 'top 78%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="strategy"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 130px) 28px',
        background: 'var(--surface-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient blobs */}
      <div
        className="fluid-blob"
        style={{
          width: 500, height: 500,
          top: '10%', left: '-5%',
          background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.07), transparent 70%)',
          '--dur': '22s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 400, height: 400,
          bottom: '0', right: '10%',
          background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.08), transparent 70%)',
          '--dur': '26s', '--delay': '-8s',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="process-header" style={{ textAlign: 'right', maxWidth: 680, marginBottom: 64, opacity: 0 }}>
          <div className="section-label">The Process</div>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: 20,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            זה לא ה-PPC,
            <br />
            <span className="text-gradient">זה המסר.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 520 }}>
            רוב העסקים רצים לעשות קמפיין לפני שהבינו מה הם מוכרים ולמי.
            התהליך שלי מתחיל בחדר הניתוח — לא במערכת המודעות.
          </p>
        </div>

        {/* Cards */}
        <div
          className="process-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {steps.map((step, i) => {
            const isActive = active === i;
            const num = String(i + 1).padStart(2, '0');

            return (
              <div
                key={i}
                className={`process-card shimmer-card${isActive ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                style={{ opacity: 0, padding: 'clamp(24px, 3vw, 36px)' }}
              >
                {/* animated accent bar */}
                <div className="accent-bar" />

                {/* ambient glow */}
                <div style={{
                  position: 'absolute',
                  top: -40, left: -40,
                  width: 220, height: 220,
                  background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.10), transparent 70%)',
                  transition: 'opacity 0.4s',
                  opacity: isActive ? 1 : 0,
                  pointerEvents: 'none',
                }} />

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 14,
                    background: isActive ? 'var(--brand-prime)' : 'oklch(0.78 0.20 145 / 0.12)',
                    border: `1px solid ${isActive ? 'transparent' : 'oklch(0.78 0.20 145 / 0.2)'}`,
                    color: isActive ? 'oklch(0.08 0.01 240)' : 'var(--brand-prime)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.35s ease, color 0.35s ease',
                  }}>
                    {STEP_ICONS[i] || STEP_ICONS[0]}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', fontWeight: 700 }}>Step</div>
                    <div style={{
                      fontSize: '3.4rem', fontWeight: 900, lineHeight: 1,
                      fontFamily: "'Heebo', sans-serif",
                      background: 'linear-gradient(135deg, oklch(0.78 0.20 145 / 0.22), oklch(0.50 0.20 285 / 0.15))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      transition: 'opacity 0.3s',
                      direction: 'ltr',
                    }}>
                      {num}
                    </div>
                  </div>
                </div>

                <h3 style={{
                  fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.01em',
                  marginBottom: 4,
                  fontFamily: "'Heebo', sans-serif",
                  color: isActive ? 'var(--text-primary)' : 'oklch(0.90 0.005 240)',
                  transition: 'color 0.3s',
                }}>
                  {step.title}
                </h3>

                <div dir="ltr" style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: isActive ? 'var(--brand-prime)' : 'var(--text-muted)',
                  fontWeight: 700,
                  marginBottom: 18,
                  transition: 'color 0.3s',
                }}>
                  {['The Crack', 'The Shift', 'The Action'][i] || ''}
                </div>

                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
                  {step.description}
                </p>

                {/* Bullets */}
                <div style={{ borderTop: '1px solid oklch(0.22 0.02 240 / 0.5)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {step.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--brand-prime)', flexShrink: 0,
                        boxShadow: isActive ? '0 0 6px var(--brand-prime)' : 'none',
                        transition: 'box-shadow 0.3s',
                      }} />
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
