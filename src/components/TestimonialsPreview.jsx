import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--brand-prime)" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function Card({ t }) {
  return (
    <div
      className="testimonial-card"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid oklch(0.22 0.02 240)',
        borderRadius: 18,
        padding: 'clamp(20px, 2.5vw, 30px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
        opacity: 0,
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.35)';
        e.currentTarget.style.boxShadow = '0 0 30px oklch(0.78 0.20 145 / 0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'oklch(0.22 0.02 240)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to right, transparent, oklch(0.78 0.20 145 / 0.3), transparent)',
      }} />

      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>
        "{t.quote}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid oklch(0.22 0.02 240)', paddingTop: 14 }}>
        {t.logo_url ? (
          <img
            src={t.logo_url}
            alt={t.company || t.name}
            style={{ height: 30, width: 'auto', maxWidth: 70, objectFit: 'contain', filter: 'brightness(0.9)', borderRadius: 4 }}
          />
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'oklch(0.78 0.20 145 / 0.12)',
            border: '1px solid oklch(0.78 0.20 145 / 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-prime)', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
          }}>
            {t.name[0]}
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
          {(t.role || t.company) && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {[t.role, t.company].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPreview() {
  const sectionRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    supabase.from('testimonials')
      .select('*')
      .eq('featured', true)
      .order('position')
      .limit(3)
      .then(({ data }) => { if (data?.length) setItems(data); });
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.testimonials-header', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: '.testimonials-header', start: 'top 80%', once: true },
      });
      gsap.fromTo('.testimonial-card', { y: 50, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.75, ease: 'expo.out', stagger: 0.12,
        scrollTrigger: { trigger: '.testimonials-grid', start: 'top 78%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [items]);

  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 120px) 28px',
        background: 'var(--surface-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="aurora-orb" style={{
        width: 500, height: 500, top: '-10%', left: '5%',
        background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.07), transparent 70%)',
        '--dur': '24s',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="testimonials-header" style={{ textAlign: 'right', marginBottom: 52, opacity: 0 }}>
          <div className="section-label">Testimonials</div>
          <h2 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: 16,
            fontFamily: "'Heebo', sans-serif",
          }}>
            מה אומרים{' '}
            <span className="text-gradient">הלקוחות?</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            תוצאות אמיתיות. אנשים אמיתיים.
          </p>
        </div>

        <div
          className="testimonials-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18,
            marginBottom: 40,
          }}
        >
          {items.map(t => <Card key={t.id} t={t} />)}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="/testimonials"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 28px',
              background: 'transparent',
              border: '1px solid oklch(0.78 0.20 145 / 0.3)',
              borderRadius: 999,
              color: 'var(--brand-prime)',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: "'Heebo', sans-serif",
              textDecoration: 'none',
              transition: 'background 0.25s, border-color 0.25s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.08)';
              e.currentTarget.style.borderColor = 'var(--brand-prime)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.3)';
            }}
          >
            כל העדויות
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
