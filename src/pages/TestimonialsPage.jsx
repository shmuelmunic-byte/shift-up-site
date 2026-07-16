import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const FALLBACK = [];

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--brand-prime)" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function TestimonialCard({ t }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid oklch(0.22 0.02 240)',
      borderRadius: 20,
      padding: 'clamp(24px, 3vw, 36px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.35)';
        e.currentTarget.style.boxShadow = '0 0 30px oklch(0.78 0.20 145 / 0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'oklch(0.22 0.02 240)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(to right, transparent, oklch(0.78 0.20 145 / 0.4), transparent)',
      }} />

      {/* Stars */}
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
      </div>

      {/* Quote */}
      <p style={{
        fontSize: '0.96rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.78,
        flex: 1,
        fontStyle: 'italic',
      }}>
        "{t.quote}"
      </p>

      {/* Logo + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid oklch(0.22 0.02 240)', paddingTop: 16 }}>
        {t.logo_url ? (
          <img
            src={t.logo_url}
            alt={t.company || t.name}
            style={{ height: 36, width: 'auto', maxWidth: 80, objectFit: 'contain', filter: 'brightness(0.9) saturate(0.8)', borderRadius: 6 }}
          />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'oklch(0.78 0.20 145 / 0.15)',
            border: '1px solid oklch(0.78 0.20 145 / 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-prime)', fontWeight: 800, fontSize: '1rem',
            flexShrink: 0,
          }}>
            {t.name[0]}
          </div>
        )}
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
          {(t.role || t.company) && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {[t.role, t.company].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(FALLBACK);

  useEffect(() => {
    document.title = 'עדויות לקוחות | Shift Up';
    supabase.from('testimonials').select('*').order('position')
      .then(({ data }) => { if (data?.length) setTestimonials(data); });
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'var(--bedrock)',
        color: 'var(--text-primary)',
        fontFamily: "'Heebo', sans-serif",
        padding: 'clamp(60px, 10vw, 100px) 28px clamp(80px, 12vw, 120px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <a
            href="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600,
              textDecoration: 'none', marginBottom: 40,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            חזרה לאתר
          </a>

          <div style={{ fontSize: '0.7rem', color: 'var(--brand-prime)', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
            Testimonials
          </div>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            marginBottom: 20,
            fontFamily: "'Heebo', sans-serif",
          }}>
            מה אומרים{' '}
            <span style={{
              background: 'linear-gradient(120deg, var(--brand-glow), var(--brand-prime) 60%, var(--accent-void))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>הלקוחות</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            שיטה מבוססת-מחקר, הבטחת ביצוע, תוצאות שמדברות. הלקוחות שלי יספרו — פה תוכל לקרוא.
          </p>
        </div>

        {/* Grid */}
        {testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 20 }}>⭐</div>
            <p style={{ fontSize: '1.1rem' }}>אני לוקח מעט לקוחות במקביל, בכוונה. הבאים יהיו הראשונים לספר.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {testimonials.map(t => (
              <TestimonialCard key={t.id} t={t} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            רוצה להיות בין הראשונים? מקום קייס מייסדים אחד פנוי — ואם בחודש הניהול הראשון אין פניות, ממשיך לנהל בחינם עד שיש.
          </p>
          <a
            href="https://wa.me/972534673151"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 32px',
              background: 'var(--brand-prime)',
              color: 'oklch(0.08 0.01 240)',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: '1rem',
              fontFamily: "'Heebo', sans-serif",
              textDecoration: 'none',
              boxShadow: '0 0 40px oklch(0.78 0.20 145 / 0.35)',
            }}
          >
            לשיחת היכרות חינם
          </a>
        </div>
      </div>
    </div>
  );
}
