import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const whatsappLink =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות');

const profileSrc = '/1000900908.jpg';

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
      <div className="fluid-blob" style={{ width: 600, height: 600, top: '-10%', right: '-5%',
        background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.22), transparent 70%)', '--dur': '20s' }} />
      <div className="fluid-blob" style={{ width: 500, height: 500, top: '30%', left: '-8%',
        background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.15), transparent 70%)', '--dur': '24s', '--delay': '-5s' }} />
      <div className="fluid-blob" style={{ width: 400, height: 400, bottom: '0', right: '30%',
        background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.18), transparent 70%)', '--dur': '28s', '--delay': '-10s' }} />
      <div className="fluid-blob" style={{ width: 300, height: 300, top: '15%', right: '25%',
        background: 'radial-gradient(circle, oklch(0.92 0.18 140 / 0.10), transparent 70%)', '--dur': '16s', '--delay': '-3s' }} />
    </div>
  );
}

/* ── Word-level kinetic reveal ──
   Uses CSS animation (not GSAP) so background-clip:text on inline-block spans
   works reliably — no JS opacity/transform conflict with gradient rendering. */
function KineticWords({ text, gradient = false, delay = 0 }) {
  const cls = gradient ? 'kword-gradient' : 'kword-plain';

  return (
    <span style={{ display: 'inline' }} aria-label={text}>
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
export default function Hero({ onProcess }) {
  const sectionRef = useRef(null);

  const trackLead = () => {
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'WhatsApp Click' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-sub',   { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.95 });
      gsap.fromTo('.hero-quote', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.2  });
      gsap.fromTo('.hero-ctas',  { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.05 });
      gsap.fromTo('.hero-image', { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.35 });
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
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

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
              Smart Strategy. Bold Creativity.
            </span>
          </div>

          {/* headline */}
          <h1
            style={{
              fontSize: 'clamp(1.9rem, 7vw, 5.2rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              marginBottom: 28,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>להפוך </span>
            <KineticWords text="רעיונות" gradient delay={0.08} />
            <br />
            <span style={{ color: 'var(--text-primary)' }}>ל</span>
            <KineticWords text="אסטרטגיה שיווקית" gradient delay={0.2} />
            <span style={{ color: 'var(--brand-prime)' }}>.</span>
          </h1>

          {/* subtext */}
          <p
            className="hero-sub"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.18rem)', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 520, marginBottom: 8, opacity: 0 }}
          >
            לפני ששורפים תקציב על ממומן, צריך לדעת{' '}
            <strong style={{ color: 'var(--text-primary)' }}>מה אנחנו מוכרים, ולמי</strong>.
            <br />
            אני בונה את האסטרטגיה — ואז מפעיל אותה בפועל.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 36, marginBottom: 48, opacity: 0 }}>
            <MagneticBtn
              href={whatsappLink}
              onClick={trackLead}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 32px', background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)',
                borderRadius: 999, fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif",
                textDecoration: 'none', border: 'none',
                boxShadow: '0 0 40px oklch(0.78 0.20 145 / 0.42)',
                transition: 'background 0.25s, box-shadow 0.25s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              בוא נדבר תכלס
            </MagneticBtn>

            <MagneticBtn
              onClick={onProcess}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'oklch(0.14 0.02 240 / 0.7)', color: 'var(--text-primary)',
                borderRadius: 999, fontWeight: 600, fontSize: '1rem', fontFamily: "'Heebo', sans-serif",
                border: '1px solid oklch(0.25 0.02 240)', backdropFilter: 'blur(12px)',
                transition: 'background 0.25s, border-color 0.25s',
              }}
            >
              איך התהליך עובד?
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </MagneticBtn>
          </div>

          {/* quote */}
          <div className="hero-quote" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, opacity: 0 }}>
            <div style={{ width: 3, height: 56, background: 'linear-gradient(to bottom, var(--brand-prime), var(--accent-void))', borderRadius: 999, flexShrink: 0 }} />
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.65 }}>
              "רעיונות זה הדלק שלי.
              <br />
              <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>אנשים זה היעד."</strong>
            </p>
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
              <img src={profileSrc} alt="שמואל מוניץ" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.45), transparent 50%)' }} />
            </div>

            {/* badge */}
            <div style={{
              position: 'absolute', bottom: -20, left: -12,
              background: 'var(--surface-1)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--surface-2)', borderRadius: 14, padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 32px oklch(0 0 0 / 0.4)',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-prime)', display: 'block',
                boxShadow: '0 0 8px var(--brand-prime)', flexShrink: 0, animation: 'pulse-ring 1.8s ease-out infinite',
              }} />
              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>פוקוס</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 800 }}>אסטרטגיה מנצחת</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
