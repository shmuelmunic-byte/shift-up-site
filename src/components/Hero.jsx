import { useEffect, useRef, useState, Fragment } from 'react';
import { gsap } from 'gsap';
import { supabase } from '../lib/supabase';
import { WhatsAppIcon } from './icons';

const DEFAULT_WA =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, יש לי שאלה על השירות');

const DEFAULT_SUBTITLE =
  'קמפיינים מבוססי-מחקר שמחזירים לעסק פניות ושקט. לעסקים שכבר מבינים שיווק, עם הבטחת ביצוע על חודש הניהול הראשון.';

const profileSrc = '/shmuel.png';

/* ── Word-level kinetic reveal (motion kept — CSS-driven so it's cheap) ── */
function KineticWords({ text, delay = 0 }) {
  return (
    <span translate="no" style={{ display: 'inline' }} aria-label={text}>
      {text.split(' ').map((word, i, arr) => (
        <Fragment key={i}>
          <span className="kword-plain" style={{ '--word-delay': `${delay + i * 0.075}s` }}>{word}</span>
          {i < arr.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  );
}

/* ── Magnetic button (motion kept) ── */
function MagneticBtn({ children, href, onClick, style, newTab = true }) {
  const wrapRef = useRef(null);

  const onMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width  / 2);
    const dy = e.clientY - (rect.top  + rect.height / 2);
    if (Math.sqrt(dx * dx + dy * dy) < 90) {
      gsap.to(el, { x: dx * 0.3, y: dy * 0.3, duration: 0.4, ease: 'power2.out' });
    }
  };
  const onLeave = () => gsap.to(wrapRef.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)' });

  const Tag = href ? 'a' : 'button';
  const extra = href
    ? { href, onClick, ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}) }
    : { onClick };

  return (
    <div ref={wrapRef} className="magnetic-outer" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Tag style={style} {...extra}>{children}</Tag>
    </div>
  );
}

/* ── Hero (v2: sharp corners, green-only, no glass/aurora, motion kept) ── */
export default function Hero({ onContact }) {
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

  const trackWhatsApp = () => {
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: 'Hero WhatsApp' });
    if (typeof window.gtag === 'function') window.gtag('event', 'contact', { method: 'whatsapp', location: 'hero' });
  };

  const handlePrimary = () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { location: 'hero', target: 'audit' });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-eyebrow', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.15 });
      gsap.fromTo('.hero-sub',     { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.9 });
      gsap.fromTo('.hero-ctas',    { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.05 });
      gsap.fromTo('.hero-anchor',  { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.2 });
      gsap.fromTo('.hero-trust',   { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 1.35 });
      gsap.fromTo('.hero-image',   { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'expo.out', delay: 0.35 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ position: 'relative', paddingTop: 'clamp(110px, 18vw, 150px)', paddingBottom: 'clamp(60px, 10vw, 100px)', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}
    >
      {/* one static, restrained green wash (no multi-color aurora) */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-20%', insetInlineEnd: '-10%', width: 620, height: 620,
        background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.10), transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="hero-layout" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2, width: '100%' }}>

        {/* ── Copy column ── */}
        <div style={{ textAlign: 'right' }}>

          {/* eyebrow — Hebrew, sharp, green square echoing the logo mark */}
          <div className="hero-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 26, opacity: 0 }}>
            <span style={{ display: 'inline-flex' }} aria-hidden="true">
              <span style={{ width: 9, height: 9, background: 'var(--brand-prime)', display: 'block', transform: 'skewX(-14deg)' }} />
              <span style={{ width: 9, height: 9, background: 'var(--accent)', display: 'block', transform: 'skewX(-14deg)', marginInlineStart: 3 }} />
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.02em' }}>
              אסטרטג שיווק דיגיטלי · מומחה AI
            </span>
          </div>

          {/* headline — locked copy, solid green accent (no gradient text) */}
          <h1
            translate="no"
            style={{
              fontSize: 'clamp(2.1rem, 7vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }}
          >
            <span style={{ color: 'var(--text-primary)' }}>תחזור לנהל את העסק.</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>את השיווק </span>
            <span style={{ color: 'var(--brand-prime)' }}><KineticWords text="תשאיר לי" delay={0.2} />.</span>
          </h1>

          {/* subtext */}
          <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.16rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 520, opacity: 0 }}>
            {subtitle}
          </p>

          {/* CTA — one dominant action: the free audit (low-commitment entry) */}
          <div className="hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, marginTop: 32, marginBottom: 20, opacity: 0 }}>
            <MagneticBtn
              href="/audit"
              newTab={false}
              onClick={handlePrimary}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 30px', background: 'var(--brand-prime)', color: 'oklch(0.12 0.02 160)',
                borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '1.02rem',
                border: 'none', cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s',
              }}
            >
              אבחון שיווק חינם
              <span style={{ fontSize: '0.72rem', fontWeight: 600, background: 'oklch(0.12 0.02 160 / 0.18)', borderRadius: 2, padding: '2px 7px' }}>3 דקות</span>
            </MagneticBtn>

            <a
              href={whatsappLink}
              onClick={trackWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none' }}
            >
              <WhatsAppIcon size={17} />
              יש לי שאלה
            </a>
          </div>

          {/* fast 3-step — the whole offer at a glance */}
          <div className="hero-trust" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, opacity: 0 }}>
            {[['1', 'אבחון'], ['2', 'ניתוח העסק'], ['3', 'תוצאות, בהבטחה']].map(([n, label], i, arr) => (
              <Fragment key={n}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.785 0.173 156.6 / 0.14)', color: 'var(--brand-prime)', fontSize: '0.72rem', fontWeight: 700, transform: 'skewX(-10deg)' }}>{n}</span>
                  <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                </span>
                {i < arr.length - 1 && <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>←</span>}
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── Image column — clean, sharp, one flat green accent block ── */}
        <div className="hero-image" style={{ display: 'flex', justifyContent: 'center', opacity: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            {/* flat purple offset block (echoes the logo's purple parallelogram) */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0, transform: 'translate(14px, 14px)',
              background: 'oklch(0.62 0.19 292 / 0.16)', border: '1px solid oklch(0.62 0.19 292 / 0.4)',
              borderRadius: 'var(--radius-lg)', zIndex: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid oklch(0.25 0.02 160)', aspectRatio: '4/5', animation: 'float 7s ease-in-out infinite' }}>
              <img src={profileSrc} alt="שמואל מוניץ, אסטרטג שיווק דיגיטלי ומומחה AI" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.08 0.01 160 / 0.5), transparent 55%)' }} />
              {/* one small flat caption chip, sharp */}
              <div style={{ position: 'absolute', bottom: 0, insetInlineStart: 0, padding: '10px 14px' }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>שמואל מוניץ</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--brand-glow)', fontWeight: 500 }}>Shift Up</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
