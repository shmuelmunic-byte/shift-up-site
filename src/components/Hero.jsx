import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabase';
import { WhatsAppIcon } from './icons';

const DEFAULT_WA =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, יש לי שאלה על השירות');

const DEFAULT_SUBTITLE =
  'אסטרטגיה, קריאייטיב שמוכר וקמפיינים ממומנים — מפוצחים לפני ששורפים תקציב.';

const profileSrc = '/shmuel.png';

/* ── Fluid animated background ── */
function FluidBg() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const blobs = container.querySelectorAll('.fluid-blob');

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach((blob, i) => {
        const f = (i + 1) * 14;
        gsap.to(blob, { x: nx * f, y: ny * f, duration: 1.8, ease: 'power2.out', overwrite: 'auto' });
      });
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Primary aurora — large green */}
      <div className="aurora-orb" style={{ width: 700, height: 700, top: '-15%', right: '-8%',
        background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.20), transparent 65%)', '--dur': '20s' }} />
      {/* Secondary — green left */}
      <div className="aurora-orb" style={{ width: 550, height: 550, top: '25%', left: '-10%',
        background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.13), transparent 70%)', '--dur': '26s', '--delay': '-6s' }} />
      {/* Accent — violet bottom */}
      <div className="aurora-orb" style={{ width: 450, height: 450, bottom: '-5%', right: '28%',
        background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.15), transparent 70%)', '--dur': '30s', '--delay': '-11s' }} />
      {/* Cyan transition glow — gradient/aurora only, never on CTA */}
      <div className="aurora-orb" style={{ width: 520, height: 520, bottom: '8%', left: '6%',
        background: 'radial-gradient(circle, oklch(0.65 0.22 200 / 0.12), transparent 70%)', '--dur': '24s', '--delay': '-9s' }} />
      {/* Small highlight */}
      <div className="aurora-orb" style={{ width: 280, height: 280, top: '12%', right: '22%',
        background: 'radial-gradient(circle, oklch(0.92 0.18 140 / 0.09), transparent 70%)', '--dur': '16s', '--delay': '-4s' }} />
    </div>
  );
}

/* ── Word-level kinetic reveal ──
   Uses CSS animation (not GSAP) so background-clip:text on inline-block spans
   works reliably — no JS opacity/transform conflict with gradient rendering. */
function KineticWords({ text, gradient = false, delay = 0 }) {
  const cls = gradient ? 'kword-gradient' : 'kword-plain';

  return (
    <span translate="no" style={{ display: 'inline' }} aria-label={text}>
      {text.split(' ').map((word, i, arr) => (
        <span
          key={i}
          className={cls}
          style={{ '--word-delay': `${delay + i * 0.075}s` }}
        >
          {word}{i < arr.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

/* ── Magnetic button wrapper ── */
function MagneticBtn({ children, href, onClick, style }) {
  const wrapRef = useRef(null);

  const onMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width  / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 90) {
      gsap.to(el, { x: dx * 0.38, y: dy * 0.38, duration: 0.4, ease: 'power2.out' });
    }
  };
  const onLeave = () => gsap.to(wrapRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });

  const Tag = href ? 'a' : 'button';
  const extra = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { onClick };

  return (
    <div ref={wrapRef} className="magnetic-outer" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Tag style={style} {...extra}>{children}</Tag>
    </div>
  );
}

/* ── Hero section ── */
export default function Hero({ onContact, onProcess }) {
  const sectionRef = useRef(null);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_WA);
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);

  useEffect(() => {
    supabase.from('site_content')
      .select('key, value')
      .in('key', ['contact.whatsapp_url', 'hero.subtitle'])
      .then(({ data }) => {
        if (!data) return;
        data.forEach(row => {
          if (row.key === 'contact.whatsapp_url') setWhatsappLink(row.value);
          if (row.key === 'hero.subtitle')        setSubtitle(row.value);
        });
      });
  }, []);

  // WhatsApp = פנייה משנית. אירוע ה-Lead "הכבד" נשמר לשליחת הטופס.
  const trackWhatsApp = () => {
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: 'Hero WhatsApp' });
    if (typeof window.gtag === 'function') window.gtag('event', 'contact', { method: 'whatsapp', location: 'hero' });
  };

  // הכפתור הראשי גולל לטופס — מסמן כוונה, לא המרה מלאה.
  const handlePrimary = () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { location: 'hero', target: 'lead_form' });
    onContact?.();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-sub',    { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.95 });
      gsap.fromTo('.hero-anchor', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.25 });
      gsap.fromTo('.hero-trust',  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.4  });
      gsap.fromTo('.hero-ctas',   { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.05 });
      gsap.fromTo('.hero-image',  { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.35 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ position: 'relative', paddingTop: 'clamp(100px, 18vw, 140px)', paddingBottom: 'clamp(60px, 10vw, 100px)', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      <FluidBg />

      <div
        className="hero-layout"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2, width: '100%' }}
      >
        {/* ── Copy column ── */}
        <div style={{ textAlign: 'right' }}>

          {/* eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, direction: 'ltr' }}>
            <span style={{ height: 1, width: 36, background: 'var(--brand-prime)', opacity: 0.6, display: 'block' }} />
            <span style={{ color: 'var(--brand-prime)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Strategy First. Budget Second.
            </span>
          </div>

          {/* headline — נעול */}
          <h1
            translate="no"
            style={{
              fontSize: 'clamp(2rem, 7vw, 5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 26,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>תחזור לנהל את העסק.</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>את השיווק </span>
            <KineticWords text="תשאיר לי" gradient delay={0.2} />
            <span style={{ color: 'var(--brand-prime)' }}>.</span>
          </h1>

          {/* subtext — נעול */}
          <p
            className="hero-sub"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.18rem)', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 540, marginBottom: 8, opacity: 0 }}
          >
            {subtitle}
          </p>

          {/* CTAs — ראשי: טופס · משני: וואטסאפ */}
          <div className="hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36, marginBottom: 18, opacity: 0 }}>
            <MagneticBtn
              onClick={handlePrimary}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 34px', background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)',
                borderRadius: 999, fontWeight: 800, fontSize: '1.05rem', fontFamily: "'Heebo', sans-serif",
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 40px oklch(0.78 0.20 145 / 0.42)',
                transition: 'background 0.25s, box-shadow 0.25s',
              }}
            >
              לקבלת הצעה מותאמת
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
              </svg>
            </MagneticBtn>

            <MagneticBtn
              href={whatsappLink}
              onClick={trackWhatsApp}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 28px', background: 'oklch(0.14 0.02 240 / 0.7)', color: 'var(--text-primary)',
                borderRadius: 999, fontWeight: 600, fontSize: '1rem', fontFamily: "'Heebo', sans-serif",
                border: '1px solid oklch(0.25 0.02 240)', backdropFilter: 'blur(12px)',
                textDecoration: 'none',
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              <WhatsAppIcon size={19} />
              שאלה? דבר איתי בוואטסאפ
            </MagneticBtn>
          </div>

          {/* price anchor + free call */}
          <p className="hero-anchor" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 38, opacity: 0 }}>
            מתחיל מ-<span style={{ color: 'var(--text-secondary)', fontWeight: 800 }}>1,500 ₪</span>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>·</span>
            שיחת פיצוח ראשונה — <span style={{ color: 'var(--brand-prime)', fontWeight: 800 }}>חינם</span>
          </p>

          {/* trust chips — מיצוב */}
          <div className="hero-trust" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, opacity: 0 }}>
            {['מסר לפני תקציב', 'קריאייטיב שמוכר', 'מהירות AI', 'אדם אחד — לא סוכנות'].map((chip) => (
              <span
                key={chip}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 999,
                  background: 'oklch(0.14 0.02 240 / 0.55)', border: '1px solid oklch(0.25 0.02 240)',
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* ── Image column ── */}
        <div className="hero-image" style={{ display: 'flex', justifyContent: 'center', opacity: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            {/* glow halo */}
            <div style={{
              position: 'absolute', inset: -16,
              background: 'radial-gradient(circle at 40% 40%, oklch(0.78 0.20 145 / 0.25), oklch(0.50 0.20 285 / 0.18) 60%, transparent 80%)',
              borderRadius: 28, filter: 'blur(30px)',
            }} />

            {/* image */}
            <div className="glow-border living-border" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }}>
              <img src={profileSrc} alt="שמואל מוניץ - מומחה שיווק דיגיטלי ואסטרטגיה מבוססת AI" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.45), transparent 50%)' }} />
            </div>

            {/* badge — bottom left */}
            <div className="float-badge" style={{
              position: 'absolute', bottom: -24, left: -16,
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-prime)', display: 'block',
                boxShadow: '0 0 10px var(--brand-prime)', flexShrink: 0, animation: 'pulse-ring 1.8s ease-out infinite',
              }} />
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>פנוי לרבעון</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 800 }}>2–3 מקומות</div>
              </div>
            </div>

            {/* badge — top right */}
            <div className="float-badge float-badge-alt" style={{
              position: 'absolute', top: -20, right: -16,
              border: '1px solid oklch(0.78 0.20 145 / 0.25)',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>התמחות</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 800 }}>AI + שיווק</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
