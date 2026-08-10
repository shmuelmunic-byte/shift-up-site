import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Cursor from '../components/Cursor';
import { supabase } from '../lib/supabase';
import { useSiteLinks } from '../lib/useSiteLinks';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'expo.out', duration: 0.8 });

const WA_TEXT = encodeURIComponent("Hi Shmuel, I'd like to learn more about your services");
const profileSrc = '/shmuel.png';
const logoSrc    = '/logo.png';

/* ─── Shared helpers ─────────────────────────────────────────────────── */

function FluidBlob({ style }) {
  return <div className="fluid-blob" style={style} />;
}

function MagneticWrap({ children, href, onClick, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width  / 2);
    const dy = e.clientY - (r.top  + r.height / 2);
    if (Math.sqrt(dx*dx + dy*dy) < 90)
      gsap.to(el, { x: dx * 0.38, y: dy * 0.38, duration: 0.4, ease: 'power2.out' });
  };
  const onLeave = () =>
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' });

  const Tag  = href ? 'a' : 'button';
  const xtra = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { onClick };

  return (
    <div ref={ref} className="magnetic-outer" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Tag style={style} {...xtra}>{children}</Tag>
    </div>
  );
}

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* ─── Navbar ─────────────────────────────────────────────────────────── */

const navLinks = [
  { label: 'The Process', id: 'en-strategy' },
  { label: 'Why Me',      id: 'en-why'      },
  { label: 'Work',        id: 'en-work'     },
  { label: 'About',       id: 'en-about'    },
  { label: 'FAQ',         id: 'en-faq'      },
];

function EnNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const ids = ['en-hero', ...navLinks.map(l => l.id), 'en-contact'];
    const obs = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);

  const goto = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const navStyle = {
    position: 'fixed', top: 0, width: '100%', zIndex: 900,
    transition: 'background 0.5s, padding 0.4s',
    padding: scrolled ? '10px 0' : '18px 0',
    background: scrolled ? 'oklch(0.08 0.01 240 / 0.88)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
    borderBottom: scrolled ? '1px solid oklch(0.18 0.025 240)' : '1px solid transparent',
  };

  return (
    <nav style={navStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => goto('en-hero')} aria-label="Shift Up" style={{ background: 'none', border: 'none', padding: 0 }}>
          <img src={logoSrc} alt="Shift Up" style={{ height: 'clamp(64px, 14vw, 120px)', width: 'auto', objectFit: 'contain', animation: 'hue-drift 8s ease-in-out infinite' }} />
        </button>

        <div className="nav-desktop" style={{ alignItems: 'center', gap: 28 }}>
          {navLinks.map(l => {
            const isActive = activeId === l.id;
            return (
              <button key={l.id} onClick={() => goto(l.id)}
                style={{ background: 'none', border: 'none', color: isActive ? 'var(--brand-prime)' : 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: isActive ? 700 : 600, letterSpacing: '0.02em', fontFamily: "'Heebo', sans-serif", transition: 'color 0.25s', position: 'relative', cursor: 'pointer', padding: '4px 0' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--brand-prime)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {l.label}
                {isActive && <span style={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: 2, borderRadius: 999, background: 'var(--brand-prime)' }} />}
              </button>
            );
          })}

          {/* Back to Hebrew */}
          <a href="/" style={{ background: 'none', border: '1px solid var(--surface-2)', borderRadius: 999, padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textDecoration: 'none', transition: 'border-color 0.25s, color 0.25s' }}
            onMouseEnter={e => { e.target.style.borderColor='var(--brand-prime)'; e.target.style.color='var(--brand-prime)'; }}
            onMouseLeave={e => { e.target.style.borderColor='var(--surface-2)'; e.target.style.color='var(--text-muted)'; }}
          >עב</a>

          <button onClick={() => goto('en-contact')} style={{ background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)', border: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 800, fontSize: '0.88rem', fontFamily: "'Heebo', sans-serif", boxShadow: '0 0 28px oklch(0.785 0.173 156.6 / 0.35)', transition: 'background 0.25s, box-shadow 0.25s' }}
            onMouseEnter={e => { e.target.style.background='var(--brand-glow)'; e.target.style.boxShadow='0 0 44px oklch(0.785 0.173 156.6 / 0.6)'; }}
            onMouseLeave={e => { e.target.style.background='var(--brand-prime)'; e.target.style.boxShadow='0 0 28px oklch(0.785 0.173 156.6 / 0.35)'; }}
          >Let's Talk</button>
        </div>

        <button className="nav-mobile-btn" onClick={() => setOpen(!open)} aria-label="Menu"
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: 4 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="mobile-menu-enter" style={{ position: 'absolute', top: '100%', width: '100%', background: 'oklch(0.11 0.015 240 / 0.97)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--surface-2)' }}>
          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {navLinks.map(l => (
              <button key={l.id} onClick={() => goto(l.id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600, textAlign: 'left', fontFamily: "'Heebo', sans-serif", padding: '4px 0' }}>{l.label}</button>
            ))}
            <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 700 }}>עברית →</a>
            <button onClick={() => { goto('en-contact'); setOpen(false); }} style={{ background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)', border: 'none', borderRadius: 999, padding: '13px 0', fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", marginTop: 8 }}>Let's Talk</button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */

const EN_TRUST_CHIPS = [
  'Research-based',
  'Performance guarantee',
  'Creative that sells',
  'Eye-level execution partner',
];

function EnHero({ onProcess, onForm }) {
  const ref = useRef(null);
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-hero-h1',   { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: 'expo.out', delay: 0.1 });
      gsap.fromTo('.en-hero-sub',  { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.4 });
      gsap.fromTo('.en-hero-ctas', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.55 });
      gsap.fromTo('.en-hero-img',  { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out', delay: 0.3 });
      gsap.fromTo('.en-hero-quote',{ y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', delay: 0.7 });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="en-hero" ref={ref} style={{ position: 'relative', paddingTop: 'clamp(100px, 18vw, 140px)', paddingBottom: 'clamp(60px, 10vw, 100px)', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <FluidBlob style={{ width: 700, height: 700, top: '-15%', left: '-8%', background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.20), transparent 65%)', '--dur': '20s' }} />
        <FluidBlob style={{ width: 550, height: 550, top: '25%', right: '-10%', background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.13), transparent 70%)', '--dur': '26s', '--delay': '-6s' }} />
        <FluidBlob style={{ width: 450, height: 450, bottom: '-5%', left: '28%', background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.15), transparent 70%)', '--dur': '30s', '--delay': '-11s' }} />
        <FluidBlob style={{ width: 280, height: 280, top: '12%', left: '22%', background: 'radial-gradient(circle, oklch(0.876 0.148 155.7 / 0.09), transparent 70%)', '--dur': '16s', '--delay': '-4s' }} />
      </div>
      <div className="hero-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2, width: '100%' }}>

        {/* Copy */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <span style={{ height: 1, width: 36, background: 'var(--brand-prime)', opacity: 0.6, display: 'block' }} />
            <span style={{ color: 'var(--brand-prime)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Strategy First. Budget Second.</span>
          </div>

          <h1 className="en-hero-h1" style={{ fontSize: 'clamp(1.9rem, 7vw, 5.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 28, fontFamily: "'Heebo', sans-serif", opacity: 0 }}>
            <span style={{ color: 'var(--text-primary)' }}>Get back to running your business.</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>Leave the </span>
            <span className="text-gradient">marketing to me</span>
            <span style={{ color: 'var(--brand-prime)' }}>.</span>
          </h1>

          <p className="en-hero-sub" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.18rem)', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 520, marginBottom: 8, opacity: 0 }}>
            Research-based campaigns for businesses that already get marketing —{' '}
            <strong style={{ color: 'var(--text-primary)' }}>with a performance guarantee on the first month</strong>.
          </p>

          {/* guarantee anchor */}
          <p className="en-hero-sub" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 14, opacity: 0 }}>
            Performance guarantee: no inquiries in the first month — <span style={{ color: 'var(--brand-prime)' }}>I keep managing for free until there are</span>
          </p>

          <div className="en-hero-ctas hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 32, marginBottom: 32, opacity: 0 }}>
            <MagneticWrap onClick={onForm} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)', borderRadius: 999, fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", textDecoration: 'none', border: 'none', boxShadow: '0 0 40px oklch(0.785 0.173 156.6 / 0.42)', transition: 'background 0.25s, box-shadow 0.25s' }}>
              Get a tailored proposal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </MagneticWrap>
            <MagneticWrap href={WA_LINK} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'oklch(0.14 0.02 240 / 0.7)', color: 'var(--text-primary)', borderRadius: 999, fontWeight: 600, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", border: '1px solid oklch(0.25 0.02 240)', backdropFilter: 'blur(12px)', transition: 'background 0.25s, border-color 0.25s' }}>
              {WA_ICON} Got a question? Message me
            </MagneticWrap>
          </div>

          {/* trust chips */}
          <div className="en-hero-quote" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: 0 }}>
            {EN_TRUST_CHIPS.map((chip, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 13px', borderRadius: 999, background: 'oklch(0.14 0.02 240 / 0.6)', border: '1px solid oklch(0.22 0.02 240)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand-prime)', display: 'block', flexShrink: 0 }} />
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="en-hero-img" style={{ display: 'flex', justifyContent: 'center', opacity: 0 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            <div style={{ position: 'absolute', inset: -16, background: 'radial-gradient(circle at 40% 40%, oklch(0.785 0.173 156.6 / 0.25), oklch(0.508 0.155 292.2 / 0.18) 60%, transparent 80%)', borderRadius: 28, filter: 'blur(30px)' }} />
            <div className="glow-border living-border" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }}>
              <img src={profileSrc} alt="Shmuel Munitz" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.45), transparent 50%)' }} />
            </div>
            {/* badge — bottom right */}
            <div className="float-badge" style={{ position: 'absolute', bottom: -24, right: -16, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-prime)', display: 'block', boxShadow: '0 0 10px var(--brand-prime)', flexShrink: 0, animation: 'pulse-ring 1.8s ease-out infinite' }} />
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>AVAILABILITY</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 800 }}>1 founding case-study spot</div>
              </div>
            </div>

            {/* badge — top left */}
            <div className="float-badge float-badge-alt" style={{ position: 'absolute', top: -20, left: -16, border: '1px solid oklch(0.785 0.173 156.6 / 0.25)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>SPECIALTY</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 800 }}>AI + Marketing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── isOnlineNow helper (used by TrustStrip) ────────────────────────── */

function isOnlineNow() {
  const h = parseInt(new Intl.DateTimeFormat('he-IL', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()), 10);
  return h >= 8 && h < 17;
}

/* ─── TrustStrip (section 2) ─────────────────────────────────────────── */

const EN_PILLAR_ICONS = [
  (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" /></>),
  (<><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>),
  (<><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-4.1A8.4 8.4 0 1 1 21 11.5Z" /></>),
];

const EN_PILLARS = [
  { title: 'Research-based', text: 'Not a single shekel goes into a campaign before research: audience, competitors, message. Decisions on data — not gut feeling.' },
  { title: 'Performance guarantee', text: 'Not a "free first month" — accountability: if the first month of management brings no inquiries, I keep managing for free until it does.' },
  { title: 'Eye-level partner', text: "An execution partner, not a salesman. Free intro call — we'll check the fit with no pressure and no buzzwords." },
];

function EnPillar({ pillar, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 28, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: index * 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }, [index]);

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: '1 1 240px', minWidth: 0, opacity: 0, textAlign: 'left' }}>
      <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.785 0.173 156.6 / 0.1)', border: '1px solid oklch(0.785 0.173 156.6 / 0.22)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {EN_PILLAR_ICONS[index] || EN_PILLAR_ICONS[0]}
        </svg>
      </span>
      <div>
        <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{pillar.title}</div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pillar.text}</p>
      </div>
    </div>
  );
}

function EnTrustStrip() {
  const headRef = useRef(null);
  const [online, setOnline] = useState(isOnlineNow);

  useEffect(() => {
    const id = setInterval(() => setOnline(isOnlineNow()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  }, []);

  return (
    <section style={{ padding: 'clamp(40px, 7vw, 72px) 28px', background: 'var(--surface-0)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={headRef} style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 48px)', opacity: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: online ? 'oklch(0.785 0.173 156.6 / 0.1)' : 'oklch(0.14 0.02 240)', border: `1px solid ${online ? 'oklch(0.785 0.173 156.6 / 0.3)' : 'oklch(0.22 0.02 240)'}`, borderRadius: 999, padding: '5px 14px', marginBottom: 20, transition: 'all 0.4s ease' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: online ? 'var(--brand-prime)' : 'oklch(0.4 0.01 240)', display: 'block', flexShrink: 0, boxShadow: online ? '0 0 6px var(--brand-prime)' : 'none', animation: online ? 'pulse-ring 2s ease-out infinite' : 'none' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: online ? 'var(--brand-prime)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
              {online ? 'Available now' : 'Usually replies within an hour'}
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            Why trust me? <span style={{ color: 'var(--brand-prime)' }}>Because the risk is on me.</span>
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 4vw, 40px)', justifyContent: 'center' }}>
          {EN_PILLARS.map((p, i) => <EnPillar key={i} pillar={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Pain (section 3) ───────────────────────────────────────────────── */

const EN_PAINS = [
  { text: 'Burning budget on paid ads — and the leads just never show up.' },
  { text: "You're advertising, but not really sure which message works, or for whom." },
  { text: 'Instead of running your business, you chase campaigns and posts.' },
  { text: 'You got burned by an agency that promised the world — then handed you to an intern.' },
];

function EnPainCard({ text, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: index * 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }, [index]);

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 22px', borderRadius: 16, background: 'oklch(0.11 0.015 240 / 0.6)', border: '1px solid oklch(0.20 0.02 240)', textAlign: 'left', opacity: 0 }}>
      <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.18 0.025 240)', border: '1px solid oklch(0.30 0.02 240)', marginTop: 2 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </span>
      <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}

function EnPain() {
  const headRef = useRef(null);
  const bridgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-pain-head', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true } });
      gsap.fromTo('.en-pain-bridge', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: bridgeRef.current, start: 'top 90%', once: true } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ padding: 'clamp(64px, 10vw, 110px) 28px', background: 'var(--bedrock)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div ref={headRef} className="en-pain-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>A moment of truth</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)', marginTop: 14, maxWidth: 680, marginInline: 'auto' }}>
            Tired of chasing your marketing — and seeing no results?
          </h2>
        </div>
        <div className="grid-2x2">
          {EN_PAINS.map((p, i) => <EnPainCard key={i} text={p.text} index={i} />)}
        </div>
        <div ref={bridgeRef} className="en-pain-bridge" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.15rem, 3vw, 1.6rem)', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            It doesn't have to be this way. <span style={{ color: 'var(--brand-prime)' }}>There's one orderly path.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── WhatYouGet (section 6) ─────────────────────────────────────────── */

const EN_OUTCOME_ICONS = [
  (<><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>),
  (<><path d="M9 12l2 2 4-4" /><path d="M12 3c-1.5 2-4 3-7 3 0 5.5 2.5 9.5 7 12 4.5-2.5 7-6.5 7-12-3 0-5.5-1-7-3Z" /></>),
  (<><path d="M3 11l19-9-9 19-2-8-8-2Z" /></>),
  (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
];

const EN_OUTCOMES = [
  { title: 'Leads coming in — not just impressions', text: 'Campaigns that bring real inquiries from people who actually fit you. Not likes, not vague "brand awareness" — inquiries you can close.' },
  { title: 'Peace of mind — one person owns it', text: 'You stop chasing posts, campaigns and numbers. One person takes all of the marketing, executes it, and reports back to you.' },
  { title: 'A sharp message you\'re proud of', text: 'Finally your marketing sounds like you — distilling what makes you different and setting you apart from competitors, no discounts.' },
  { title: 'Your time comes back to you', text: 'Instead of dealing with marketing, you go back to what you do best — running and growing your business.' },
];

function EnOutcomeCard({ outcome, index }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: index * 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }, [index]);

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '24px 24px', borderRadius: 16, background: 'oklch(0.11 0.015 240 / 0.6)', border: '1px solid oklch(0.20 0.02 240)', textAlign: 'left', opacity: 0 }}>
      <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.785 0.173 156.6 / 0.1)', border: '1px solid oklch(0.785 0.173 156.6 / 0.22)' }}>
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {EN_OUTCOME_ICONS[index] || EN_OUTCOME_ICONS[0]}
        </svg>
      </span>
      <div>
        <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{outcome.title}</h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{outcome.text}</p>
      </div>
    </div>
  );
}

function EnWhatYouGet() {
  const headRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-wyg-head', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true } });
      gsap.fromTo('.en-wyg-line', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: lineRef.current, start: 'top 90%', once: true } });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ padding: 'clamp(64px, 10vw, 110px) 28px', background: 'var(--bedrock)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div ref={headRef} className="en-wyg-head" style={{ textAlign: 'center', marginBottom: 'clamp(36px, 6vw, 56px)', opacity: 0 }}>
          <span style={{ color: 'var(--brand-prime)', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>What You Get</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'var(--text-primary)', marginTop: 14, maxWidth: 700, marginInline: 'auto' }}>
            Bottom line? <span style={{ color: 'var(--brand-prime)' }}>Leads and peace of mind.</span>
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 14, maxWidth: 560, marginInline: 'auto' }}>
            You keep running the business. I take the marketing on myself — and this is what you get back.
          </p>
        </div>
        <div className="grid-2x2">
          {EN_OUTCOMES.map((o, i) => <EnOutcomeCard key={i} outcome={o} index={i} />)}
        </div>
        <div ref={lineRef} className="en-wyg-line" style={{ textAlign: 'center', marginTop: 'clamp(40px, 6vw, 60px)', opacity: 0 }}>
          <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            Stop being a part-time marketing manager. <span style={{ color: 'var(--brand-prime)' }}>Be the owner again.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Proof (section 8) ──────────────────────────────────────────────── */

const EN_CASES = [
  {
    tag: 'Process example',
    title: 'Boutique dessert business',
    subtitle: 'Premium positioning in a saturated market',
    quote: "We don't sell cakes, we sell style.",
    steps: [
      { k: 'The pain', v: 'In a saturated market, the customer doesn\'t ask "how much" — she asks "what will people think?". Price isn\'t the problem, status is.' },
      { k: 'Positioning', v: 'Not another bakery — a design house. Selling an experience and prestige, not a kilo of chocolate.' },
      { k: 'The funnel', v: 'A clear persona ("the hosting perfectionist"), a message that speaks to status, and visual channels that signal luxury.' },
    ],
  },
  {
    tag: 'Process example · course project',
    title: 'City Transformer',
    subtitle: 'Creating a new category',
    quote: 'Easy for you.',
    steps: [
      { k: 'The problem', v: 'A folding electric vehicle — a category that has no shelf yet in the consumer\'s mind.' },
      { k: 'Positioning', v: 'Instead of fighting for existing space — create a new category. The "easy for you" concept.' },
      { k: 'The creative', v: 'An Urban Luxury brand language, personas, and a video storyboard that tells the story.' },
    ],
  },
];

const EN_GRID = [
  { file: 'events-yehuda.jpg',      client: 'Yehuda Siman-Tov', field: 'Events' },
  { file: 'realestate-villas.jpg',  client: 'Real Estate',      field: 'Real Estate' },
  { file: 'legal-skler.jpg',        client: 'Skler Law',        field: 'Legal' },
  { file: 'retail-kehilot-card.jpg',client: 'Kehilot Card',     field: 'Retail' },
  { file: 'food-shira-events.jpg',  client: 'SHIRA',            field: 'Food' },
  { file: 'health-24fit.png',       client: '24fit',            field: 'Fitness' },
  { file: 'home-emanuel.jpg',       client: 'Emanuel Paint',    field: 'Home Services' },
  { file: 'beauty-hili.jpg',        client: 'Hili Nails',       field: 'Beauty' },
  { file: 'education-imahot.jpg',   client: 'Mothers Workshop',  field: 'Parenting' },
];

function EnCaseCard({ item, index }) {
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
    <div ref={ref} className="shimmer-card" style={{ opacity: 0, textAlign: 'left', padding: 'clamp(24px, 3vw, 34px)', borderRadius: 20, background: 'var(--surface-1)', border: '1px solid oklch(0.22 0.02 240)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, left: 0, height: 2, background: 'linear-gradient(to right, var(--brand-prime), oklch(0.65 0.22 200 / 0.6), transparent)' }} />
      <span style={{ display: 'inline-block', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'oklch(0.18 0.025 240)', border: '1px solid oklch(0.28 0.02 240)', borderRadius: 999, padding: '4px 12px', marginBottom: 16 }}>
        {item.tag}
      </span>
      <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, letterSpacing: '-0.01em', color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</h3>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 18 }}>{item.subtitle}</div>
      <blockquote style={{ margin: '0 0 22px', padding: '12px 16px', borderRadius: 12, background: 'oklch(0.785 0.173 156.6 / 0.08)', borderLeft: '3px solid var(--brand-prime)', fontSize: '1.02rem', fontWeight: 800, color: 'var(--brand-glow)', textAlign: 'left' }}>
        {item.quote}
      </blockquote>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {item.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-prime)', minWidth: 84, paddingTop: 2 }}>{s.k}</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 20, fontStyle: 'italic' }}>
        A thinking & process example — not a results claim.
      </p>
    </div>
  );
}

function EnGridTile({ item, index, onOpen }) {
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
    <button ref={ref} onClick={() => onOpen(item)} style={{ opacity: 0, position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5', borderRadius: 14, overflow: 'hidden', border: '1px solid oklch(0.22 0.02 240)', background: 'var(--surface-1)', cursor: 'pointer', padding: 0, textAlign: 'left' }} aria-label={`Enlarge ad — ${item.client}`}>
      <img src={`/portfolio/${item.file}`} alt={`${item.client} creative — ${item.field}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', insetInline: 0, bottom: 0, padding: '28px 14px 12px', background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.92), transparent)' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{item.client}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--brand-glow)', fontWeight: 600 }}>{item.field}</div>
      </div>
    </button>
  );
}

function EnLightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'oklch(0.05 0.01 240 / 0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'oklch(0.14 0.02 240)', border: '1px solid oklch(0.3 0.02 240)', color: 'var(--text-primary)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
      <img src={`/portfolio/${item.file}`} alt={`${item.client} creative — ${item.field}`} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 14, objectFit: 'contain', boxShadow: '0 20px 80px oklch(0 0 0 / 0.6)' }} />
    </div>
  );
}

function EnProof() {
  const headRef = useRef(null);
  const grHeadRef = useRef(null);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-proof-head', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: headRef.current, start: 'top 85%', once: true } });
      gsap.fromTo('.en-proof-grid-head', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: grHeadRef.current, start: 'top 88%', once: true } });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="en-work" style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={headRef} className="en-proof-head" style={{ textAlign: 'left', maxWidth: 680, marginBottom: 'clamp(36px, 5vw, 56px)', opacity: 0 }}>
          <div className="section-label">The Proof</div>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 16, fontFamily: "'Heebo', sans-serif" }}>
            I don't promise. <span className="text-gradient">I show.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            First the thinking — how sharp research builds a business's positioning. Then the execution — real creative I made, across every field and audience.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 'clamp(56px, 8vw, 84px)' }}>
          {EN_CASES.map((c, i) => <EnCaseCard key={i} item={c} index={i} />)}
        </div>
        <div ref={grHeadRef} className="en-proof-grid-head" style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 40px)', opacity: 0 }}>
          <h3 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Creative that sells — <span style={{ color: 'var(--brand-prime)' }}>every field, every audience.</span>
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {EN_GRID.map((g, i) => <EnGridTile key={g.file} item={g} index={i} onOpen={setOpen} />)}
        </div>
      </div>
      <EnLightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ─── Process ────────────────────────────────────────────────────────── */

const enSteps = [
  {
    n: '01', title: 'The Research', sub: 'Discovery',
    desc: "We dig deep. Who's actually paying, what competitors are doing, and why they'd choose you. We distill a precise message and a clear work plan — on data, not guesswork.",
    bullets: ['Audience + competitor research', 'Sharp value proposition', 'Clear work plan'],
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  },
  {
    n: '02', title: 'The Shift', sub: 'Strategy',
    desc: 'We turn the insights into a clear plan and creative that sells: the funnel that fits you, the message that drives action, and where the money goes — all locked in before a single shekel goes in.',
    bullets: ['Marketing funnel design', 'Creative that sells', 'Channel-specific messaging'],
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  },
  {
    n: '03', title: 'The Action', sub: 'Execution',
    desc: 'A ready-to-run campaign goes live: I set up and manage your paid campaigns on Meta and Google, create the creative that sells — and if the first month brings no inquiries, I keep managing for free until it does.',
    bullets: ['Meta + Google Campaigns', 'Creative that sells', 'First-month performance guarantee'],
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>,
  },
];

function EnProcess() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-process-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.en-process-header', start: 'top 80%', once: true } });
      gsap.fromTo('.en-process-card', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.en-process-grid', start: 'top 78%', once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="en-strategy" ref={ref} style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <FluidBlob style={{ width: 500, height: 500, top: '10%', right: '-5%', background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.07), transparent 70%)', '--dur': '22s' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="en-process-header" style={{ textAlign: 'left', maxWidth: 680, marginBottom: 64, opacity: 0 }}>
          <div className="section-label">The Process</div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20, fontFamily: "'Heebo', sans-serif" }}>
            It's not the PPC,
            <br /><span className="text-gradient">it's the message.</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 520 }}>
            Most businesses rush to run campaigns before understanding what they're selling and to whom.
            My process starts in the operating room — not in the ad platform.
          </p>
        </div>

        <div className="en-process-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {enSteps.map((step, i) => {
            const isActive = active === i;
            return (
              <div key={i} className={`en-process-card process-card shimmer-card${isActive ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
                style={{ opacity: 0, padding: 'clamp(24px,3vw,36px)' }}>
                <div className="accent-bar" style={{ right: 'auto', left: 0, borderRadius: '20px 0 0 20px' }} />
                <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.10), transparent 70%)', transition: 'opacity 0.4s', opacity: isActive ? 1 : 0, pointerEvents: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: isActive ? 'var(--brand-prime)' : 'oklch(0.785 0.173 156.6 / 0.12)', border: `1px solid ${isActive ? 'transparent' : 'oklch(0.785 0.173 156.6 / 0.2)'}`, color: isActive ? 'oklch(0.08 0.01 240)' : 'var(--brand-prime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.35s, color 0.35s' }}>{step.icon}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', fontWeight: 700 }}>Step</div>
                    <div style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1, fontFamily: "'Heebo', sans-serif", background: 'linear-gradient(135deg, oklch(0.785 0.173 156.6 / 0.22), oklch(0.508 0.155 292.2 / 0.15))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{step.n}</div>
                  </div>
                </div>
                <h3 style={{ fontSize: 'clamp(1.5rem,2.5vw,1.9rem)', fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 4, fontFamily: "'Heebo', sans-serif", color: isActive ? 'var(--text-primary)' : 'oklch(0.90 0.005 240)', transition: 'color 0.3s' }}>{step.title}</h3>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: isActive ? 'var(--brand-prime)' : 'var(--text-muted)', fontWeight: 700, marginBottom: 18, transition: 'color 0.3s' }}>{step.sub}</div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>{step.desc}</p>
                <div style={{ borderTop: '1px solid oklch(0.22 0.02 240 / 0.5)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {step.bullets.map((b, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand-prime)', flexShrink: 0, boxShadow: isActive ? '0 0 6px var(--brand-prime)' : 'none', transition: 'box-shadow 0.3s' }} />{b}
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

/* ─── Why Me ─────────────────────────────────────────────────────────── */

const enReasons = [
  { title: 'Research-Based', en: 'Research-Based', desc: "I don't run campaigns on gut feeling. Audience, competitors, message — everything is researched and distilled before a single shekel goes into paid.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, accent: 'var(--brand-prime)', wide: true },
  { title: 'AI-First', en: 'AI-First', desc: 'What takes others a week, I execute in hours — at higher quality.', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.64"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.64"/></svg>, accent: 'var(--accent-void)', wide: false },
  { title: 'Performance Guarantee', en: 'Guarantee', desc: "If the first month of management brings no inquiries — I keep managing for free until it does. The risk is on me, not you.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, accent: 'var(--brand-prime)', wide: false },
  { title: 'Eye-Level Partner', en: 'No Buzzwords', desc: "An execution partner, not a salesman. No buzzwords, no inflated decks — straight talk: what we do, why, and what it costs.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>, accent: 'var(--brand-prime)', wide: true },
];

function EnBentoCard({ reason, index }) {
  const cardRef = useRef(null);
  const onMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div ref={cardRef} className={`en-whyme-card bento-card shimmer-card${reason.wide ? ' bento-wide' : ''}`} onMouseMove={onMove} style={{ opacity: 0, minHeight: reason.wide ? 180 : 200 }}>
      <div style={{ position: 'absolute', top: 20, right: 20, width: 6, height: 6, borderRadius: '50%', background: reason.accent, boxShadow: `0 0 12px ${reason.accent}`, opacity: 0.7 }} />
      <div className="accent-number" style={{ position: 'absolute', bottom: -20, right: 12, fontSize: '7rem', zIndex: 0 }}>0{index + 1}</div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'oklch(0.785 0.173 156.6 / 0.1)', border: '1px solid oklch(0.785 0.173 156.6 / 0.2)', color: 'var(--brand-prime)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{reason.icon}</div>
          <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)', fontWeight: 700 }}>{reason.en}</span>
        </div>
        <h3 style={{ fontSize: reason.wide ? 'clamp(1.25rem, 2.5vw, 1.6rem)' : 'clamp(1.1rem, 2vw, 1.35rem)', fontWeight: 900, letterSpacing: '-0.01em', marginBottom: 10, fontFamily: "'Heebo', sans-serif", color: 'var(--text-primary)' }}>{reason.title}</h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: reason.wide ? 480 : '100%' }}>{reason.desc}</p>
      </div>
    </div>
  );
}

function EnWhyMe() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-whyme-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.en-whyme-header', start: 'top 80%', once: true } });
      gsap.fromTo('.en-whyme-card', { y: 50, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.en-whyme-cards', start: 'top 78%', once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="en-why" ref={ref} style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--bedrock)', position: 'relative', overflow: 'hidden' }}>
      <div className="aurora-orb" style={{ width: 500, height: 500, top: '-10%', left: '-5%', background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.08), transparent 70%)', '--dur': '18s' }} />
      <div className="aurora-orb" style={{ width: 400, height: 400, bottom: '-5%', right: '-5%', background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.07), transparent 70%)', '--dur': '22s', '--delay': '-7s' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="en-whyme-header" style={{ textAlign: 'left', maxWidth: 640, marginBottom: 52, opacity: 0 }}>
          <div className="section-label">Why Me</div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 18, fontFamily: "'Heebo', sans-serif" }}>
            Why work with <span className="text-gradient">me?</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            There's no shortage of digital marketers. Here are 4 honest reasons why I might be your best one.
          </p>
        </div>
        <div className="en-whyme-cards bento-grid">
          {enReasons.map((r, i) => <EnBentoCard key={i} reason={r} index={i} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Manifesto ──────────────────────────────────────────────────────── */

const enWords = [
  'Ideas', 'are', 'my', 'fuel.', 'People', 'are', 'the', 'goal.', 'Your', 'businesses', 'are', 'the', 'way', 'there.'
];

function EnManifesto() {
  const ref = useRef(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const wordEls = section.querySelectorAll('.en-manifesto-word');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 30%', scrub: 0.8 } });
      wordEls.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0.08, y: 14, filter: 'blur(3px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, i * 0.12);
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const highlights = ['Ideas', 'fuel.', 'People', 'goal.'];

  return (
    <section ref={ref} style={{ padding: 'clamp(80px, 12vw, 140px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <FluidBlob style={{ width: 600, height: 600, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.06), transparent 70%)', '--dur': '30s' }} />
      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: 32 }}>The Manifesto</div>
        <p translate="no" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3em 0.5em', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.02em', fontFamily: "'Heebo', sans-serif" }} aria-label={enWords.join(' ')}>
          {enWords.map((word, i) => (
            <span key={i} className="en-manifesto-word" style={{ display: 'inline-block', opacity: 0.08, color: highlights.includes(word) ? 'var(--brand-prime)' : 'var(--text-primary)', willChange: 'opacity, transform, filter' }}>{word}</span>
          ))}
        </p>
        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0.5 }}>
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', display: 'block' }} />
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Shmuel Munitz</span>
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}

/* ─── About ──────────────────────────────────────────────────────────── */

function EnAbout() {
  const ref    = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-about-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.en-about-header', start: 'top 80%', once: true } });
      gsap.fromTo('.en-about-img',    { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: '.en-about-img', start: 'top 80%', once: true } });
      gsap.utils.toArray('.en-about-para').forEach((el, i) => {
        gsap.fromTo(el, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });
    }, ref);

    const img = imgRef.current;
    const onMove = (e) => {
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width  / 2) / rect.width;
      const dy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
      gsap.to(img, { rotateY: dx * 6, rotateX: -dy * 6, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
    };
    const onLeave = () => gsap.to(img, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1,0.6)' });
    img?.addEventListener('mousemove', onMove);
    img?.addEventListener('mouseleave', onLeave);
    return () => { ctx.revert(); img?.removeEventListener('mousemove', onMove); img?.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <section id="en-about" ref={ref} style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <FluidBlob style={{ width: 500, height: 500, top: '-5%', left: '-5%', background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.09), transparent 70%)', '--dur': '24s' }} />
      <div className="about-layout" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Image */}
        <div className="en-about-img" style={{ opacity: 0, maxWidth: 320, margin: '0 auto', width: '100%' }}>
          <div ref={imgRef} style={{ position: 'relative', transformStyle: 'preserve-3d', perspective: 800 }}>
            <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(circle at 50% 50%, oklch(0.785 0.173 156.6 / 0.2), oklch(0.508 0.155 292.2 / 0.12) 60%, transparent 80%)', borderRadius: 28, filter: 'blur(24px)', zIndex: 0 }} />
            <div className="glow-border living-border" style={{ position: 'relative', zIndex: 1, borderRadius: 20, overflow: 'hidden', aspectRatio: '4/5' }}>
              <img src={profileSrc} alt="Shmuel Munitz" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.4), transparent 55%)' }} />
            </div>
            <div style={{ position: 'absolute', top: -14, right: 16, zIndex: 2, background: 'var(--surface-1)', backdropFilter: 'blur(16px)', border: '1px solid var(--surface-2)', borderRadius: 999, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-prime)', display: 'block', boxShadow: '0 0 6px var(--brand-prime)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shmuel Munitz</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="en-about-header" style={{ textAlign: 'left', opacity: 0 }}>
          <div className="section-label">About Me</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 36, fontFamily: "'Heebo', sans-serif" }}>
            Who's behind <span className="text-gradient">Shift Up?</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              <>Nice to meet you — I'm <strong style={{ color: 'var(--text-primary)' }}>Shmuel Munitz</strong>.</>,
              <>I won't lie — I don't come from a 20-year advertising agency. And that's exactly <strong style={{ color: 'var(--brand-prime)' }}>your advantage</strong>.</>,
              <>While others rest on their laurels, I research the newest <strong style={{ color: 'var(--brand-prime)' }}>AI</strong> tools and find innovative ways to generate leads. Every client is my flagship project.</>,
              <>I'm an entrepreneur at heart. I understand a business needs <strong style={{ color: 'var(--text-primary)' }}>real ROI</strong> — not just likes. I'm here to build a marketing system that works — and actually execute it.</>,
            ].map((para, i) => (
              <div key={i} className="en-about-para" style={{ opacity: 0, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 2, minHeight: 48, background: i === 0 ? 'var(--brand-prime)' : 'oklch(0.22 0.02 240)', borderRadius: 999, flexShrink: 0, marginTop: 4 }} />
                <p style={{ fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)', color: 'var(--text-secondary)', lineHeight: 1.78 }}>{para}</p>
              </div>
            ))}
            <div className="en-about-para" style={{ opacity: 0, marginTop: 10, padding: '20px 24px', background: 'var(--surface-1)', borderRadius: 16, borderLeft: '3px solid var(--brand-prime)' }}>
              <p className="text-gradient" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', fontWeight: 800, fontFamily: "'Heebo', sans-serif", lineHeight: 1.5 }}>People are the goal.</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>Your businesses are the way there.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────── */

const enFaqs = [
  { q: 'How long does it take to see results?', a: 'The discovery and strategy phase takes about two weeks. To see quality leads flowing — between 30 and 60 days, depending on the industry. I build for the long term, not empty promises of "results in a week."' },
  { q: 'How much does it cost?', a: "A fixed, clear price set in the intro call based on scope: a one-time setup + monthly management (media budget separate). No vague packages, no surprises — you'll know exactly how much before we start." },
  { q: 'How are you different from other digital marketers?', a: 'Most start with "let\'s run a campaign." I start with research — audience, competitors, message — and only then build the campaign. I also integrate AI tools that save time and money, and take a limited number of clients.' },
  { q: "I've been burned by a previous provider. Why would this time be different?", a: 'That\'s exactly why there\'s a performance guarantee. To be clear — it\'s not a "free first month": if the first month of management brings no inquiries, I keep managing for free until it does. The risk is on me, not on you.' },
  { q: 'What does the discovery process include?', a: 'A complete strategy document: competitor analysis, target audience mapping, a precise value proposition, core messaging, recommended marketing channels, and a 90-day actionable roadmap.' },
  { q: 'Do you also execute or just advise?', a: 'Both. Once the strategy is locked in, I build and manage your paid campaigns on Meta and Google, and handle the messaging and creative. An execution partner — from the research until the campaign is live.' },
];

function EnChatItem({ item, isActive, onOpen }) {
  const [displayed, setDisplayed] = useState('');
  const [thinking, setThinking]   = useState(false);
  const timerRef = useRef(null);
  const thinkRef = useRef(null);

  useEffect(() => {
    if (!isActive) { setDisplayed(''); setThinking(false); clearInterval(timerRef.current); clearTimeout(thinkRef.current); return; }
    setDisplayed(''); setThinking(true);
    thinkRef.current = setTimeout(() => {
      setThinking(false); let i = 0;
      timerRef.current = setInterval(() => {
        i++; setDisplayed(item.a.slice(0, i));
        if (i >= item.a.length) clearInterval(timerRef.current);
      }, 16);
    }, 450);
    return () => { clearInterval(timerRef.current); clearTimeout(thinkRef.current); };
  }, [isActive, item.a]);

  return (
    <div style={{ marginBottom: 14, opacity: 0 }} className="en-faq-item">
      <button onClick={onOpen} style={{ width: '100%', textAlign: 'left', background: isActive ? 'var(--surface-2)' : 'var(--surface-1)', border: `1px solid ${isActive ? 'oklch(0.785 0.173 156.6 / 0.3)' : 'oklch(0.22 0.02 240)'}`, borderRadius: isActive ? '16px 16px 16px 0' : 16, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background 0.3s, border-color 0.3s, border-radius 0.3s', fontFamily: "'Heebo', sans-serif" }} aria-expanded={isActive}>
        <span style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{item.q}</span>
        <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: isActive ? 'oklch(0.785 0.173 156.6 / 0.2)' : 'oklch(0.18 0.025 240)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.35s var(--ease-spring), background 0.3s', transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
      </button>
      {isActive && (
        <div style={{ background: 'oklch(0.11 0.015 240)', border: '1px solid oklch(0.22 0.02 240)', borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '16px 20px 18px' }}>
          {thinking ? (
            <div className="chat-thinking" style={{ display: 'flex', gap: 5, alignItems: 'center', height: 24 }} aria-label="Thinking..."><span /><span /><span /></div>
          ) : (
            <p style={{ fontSize: 'clamp(0.88rem, 1.5vw, 0.96rem)', color: 'var(--text-secondary)', lineHeight: 1.78, minHeight: 24 }}>
              {displayed}
              {displayed.length < item.a.length && displayed.length > 0 && (
                <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--brand-prime)', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'breathing 0.8s ease-in-out infinite' }} />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EnFAQ() {
  const ref = useRef(null);
  const [activeIdx, setActiveIdx] = useState(null);
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-faq-header', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: '.en-faq-header', start: 'top 80%', once: true } });
      gsap.fromTo('.en-faq-item', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.en-faq-list', start: 'top 78%', once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section id="en-faq" ref={ref} style={{ padding: 'clamp(80px, 10vw, 130px) 28px', background: 'var(--bedrock)', position: 'relative' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="en-faq-header" style={{ textAlign: 'left', marginBottom: 52, opacity: 0 }}>
          <div className="section-label">FAQ</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14, fontFamily: "'Heebo', sans-serif" }}>Frequently Asked Questions</h2>
        </div>
        <div className="en-faq-list">
          {enFaqs.map((item, i) => (
            <EnChatItem key={i} item={item} isActive={activeIdx === i} onOpen={() => setActiveIdx(prev => prev === i ? null : i)} />
          ))}
        </div>
        <div style={{ marginTop: 32, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ height: 1, width: 20, background: 'var(--surface-2)', display: 'block' }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Have another question?{' '}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-prime)', fontWeight: 700, textDecoration: 'none' }}>Send a message</a>{' '}
            and I'll get back to you quickly.
          </p>
          <span style={{ height: 1, width: 20, background: 'var(--surface-2)', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}

/* ─── WhatsApp Community ─────────────────────────────────────────────── */

const enPerks = [
  { emoji: '🧠', title: 'Strategy', desc: 'Why customers buy — and how to make them choose you.' },
  { emoji: '🤖', title: 'AI Tools', desc: 'Prompts and methods to save time and money.' },
  { emoji: '🔍', title: 'Deep Dives', desc: 'Breaking down marketing moves, adapted for small businesses.' },
];

function EnWhatsAppGroup() {
  const ref = useRef(null);
  const { whatsapp_group: WA_GROUP } = useSiteLinks();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-wag-card', { y: 60, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out', scrollTrigger: { trigger: '.en-wag-card', start: 'top 82%', once: true } });
      gsap.fromTo('.en-wag-perk', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.65, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.en-wag-perks', start: 'top 82%', once: true } });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ padding: 'clamp(80px, 10vw, 120px) 28px', background: 'var(--surface-0)', position: 'relative', overflow: 'hidden' }}>
      <div className="aurora-orb" style={{ width: 500, height: 500, bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, oklch(0.55 0.20 145 / 0.10), transparent 70%)', '--dur': '22s' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div className="en-wag-card animated-border glass-panel" style={{ opacity: 0, border: '1px solid oklch(0.55 0.20 145 / 0.25)', borderRadius: 28, padding: 'clamp(32px, 5vw, 52px)', boxShadow: '0 0 60px oklch(0.55 0.20 145 / 0.07)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.13), transparent 70%)', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, background: 'oklch(0.55 0.22 145)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px oklch(0.55 0.22 145 / 0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div className="section-label" style={{ marginBottom: 6 }}>WhatsApp Community</div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: "'Heebo', sans-serif" }}>
                The marketing{' '}<span className="text-gradient">back room</span>{' '}🚀
              </h2>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)', color: 'var(--text-secondary)', lineHeight: 1.78, marginBottom: 32, maxWidth: 560 }}>
            For business owners who want to understand how the game really works — no slogans, no theory.
            Just practical business, sales psychology, and smart use of AI.
          </p>

          {/* Perks */}
          <div className="en-wag-perks" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {enPerks.map((p, i) => (
              <div key={i} className="en-wag-perk" style={{ opacity: 0, display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', background: 'var(--surface-2)', borderRadius: 14, border: '1px solid oklch(0.22 0.02 240)' }}>
                <span style={{ fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.title}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{' '}— {p.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dosage badge + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'oklch(0.55 0.22 145 / 0.1)', border: '1px solid oklch(0.55 0.22 145 / 0.25)', borderRadius: 999, padding: '8px 16px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.65 0.22 145)', display: 'block', boxShadow: '0 0 6px oklch(0.65 0.22 145)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'oklch(0.75 0.18 145)' }}>2 messages a week · short, sharp, to the point</span>
            </div>

            <a href={WA_GROUP} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'oklch(0.55 0.22 145)', color: 'white', borderRadius: 999, fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", textDecoration: 'none', boxShadow: '0 0 32px oklch(0.55 0.22 145 / 0.35)', transition: 'background 0.25s, box-shadow 0.25s, transform 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.62 0.22 145)'; e.currentTarget.style.boxShadow = '0 0 48px oklch(0.55 0.22 145 / 0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'oklch(0.55 0.22 145)'; e.currentTarget.style.boxShadow = '0 0 32px oklch(0.55 0.22 145 / 0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Join the group — free
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Lead Form (section 11) ─────────────────────────────────────────── */

const EN_PHONE = '972534673151';

function enBuildWaLink(form) {
  const lines = [
    "Hi Shmuel, I'd love to hear about your services.",
    form.name && `Name: ${form.name}`,
    form.business && `Business field: ${form.business}`,
    form.message && `What I'm after: ${form.message}`,
  ].filter(Boolean);
  return `https://wa.me/${EN_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function enFireLead() {
  if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form (EN)' });
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form_en' });
}

const enWaBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
  padding: '13px 22px', borderRadius: 12, background: '#25955a', color: '#fff',
  fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", textDecoration: 'none',
  boxShadow: '0 6px 20px rgba(37,149,90,0.3)',
};

function EnLeadForm() {
  const sectionRef = useRef(null);
  const links = useSiteLinks();
  const waSecondary = (links.whatsapp_url && links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT)
    || `https://wa.me/${EN_PHONE}?text=${WA_TEXT}`;

  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.en-lf-inner', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const valid = form.name.trim().length > 1 && /\d{7,}/.test(form.phone.replace(/\D/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === 'sending') return;
    setStatus('sending');

    // best-effort save; lead is also captured via WhatsApp regardless of DB result
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        business: form.business.trim() || null,
        message: form.message.trim() || null,
        source: 'landing_form_en',
      });
      if (error) throw error;
      enFireLead();
      setStatus('done');
    } catch (err) {
      // DB save failed (schema/RLS/offline) — don't lose the lead: push to WhatsApp prefilled
      console.warn('[EnLeadForm] supabase insert failed, falling back to WhatsApp:', err?.message);
      enFireLead();
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1px solid #cdd7e3', background: '#fff', color: '#0c1118',
    fontSize: '1rem', fontFamily: "'Heebo', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#3a4757', marginBottom: 6 };
  const focusOn = (e) => { e.target.style.borderColor = '#1f9d57'; e.target.style.boxShadow = '0 0 0 3px rgba(52,217,123,0.15)'; };
  const focusOff = (e) => { e.target.style.borderColor = '#cdd7e3'; e.target.style.boxShadow = 'none'; };

  return (
    <section id="en-contact" ref={sectionRef} style={{ padding: 'clamp(70px, 10vw, 120px) 28px', background: 'linear-gradient(180deg, #eef3f8 0%, #e6edf5 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="en-lf-inner" style={{ maxWidth: 920, margin: '0 auto', opacity: 0 }}>

        {/* scarcity pill */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,217,123,0.12)', border: '1px solid rgba(31,157,87,0.35)', borderRadius: 999, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#117a41' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1f9d57', display: 'block', boxShadow: '0 0 6px #1f9d57', animation: 'pulse-ring 2s ease-out infinite' }} />
            1 founding case-study spot open — special founding terms
          </span>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, color: '#0c1118', marginBottom: 12 }}>
          Let's make a <span style={{ color: '#117a41' }}>Shift Up</span> for your business.
        </h2>
        <p style={{ textAlign: 'center', fontSize: 'clamp(1rem, 2.4vw, 1.15rem)', color: '#4a5868', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 8px' }}>
          Leave your details and I'll get back to you for a short intro call — we'll check together if it's a fit.
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7d92', fontWeight: 600, marginBottom: 36 }}>
          A clear, fixed price in the intro call · if the first month of management brings no inquiries — I keep managing for free until it does.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 'clamp(20px, 3vw, 36px)', alignItems: 'start' }} className="lf-grid">

          {/* ── Form (primary door) ── */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 3vw, 36px)', boxShadow: '0 10px 40px rgba(12,17,24,0.08)', border: '1px solid #e1e8f0' }}>
            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(52,217,123,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#117a41" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0c1118', marginBottom: 8 }}>Got it! I'll be in touch soon.</h3>
                <p style={{ color: '#4a5868', lineHeight: 1.6, marginBottom: 20 }}>Want to skip ahead? Message me directly on WhatsApp now.</p>
                <a href={enBuildWaLink(form)} target="_blank" rel="noopener noreferrer" style={enWaBtnStyle}>
                  {WA_ICON}Open a WhatsApp chat
                </a>
              </div>
            ) : status === 'error' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0c1118', marginBottom: 8 }}>Almost there 🙂</h3>
                <p style={{ color: '#4a5868', lineHeight: 1.6, marginBottom: 20 }}>The fastest way to continue is WhatsApp — your details are already filled in.</p>
                <a href={enBuildWaLink(form)} target="_blank" rel="noopener noreferrer" style={enWaBtnStyle}>
                  {WA_ICON}Continue on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="en-lf-name">Full name *</label>
                  <input id="en-lf-name" type="text" value={form.name} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle} placeholder="What should I call you?" autoComplete="name" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="en-lf-phone">Phone *</label>
                  <input id="en-lf-phone" type="tel" value={form.phone} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={inputStyle} placeholder="050-0000000" autoComplete="tel" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="en-lf-business">Business field</label>
                  <input id="en-lf-business" type="text" value={form.business} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    style={inputStyle} placeholder="e.g. restaurant, real estate, clinic…" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle} htmlFor="en-lf-message">What's most urgent? (optional)</label>
                  <textarea id="en-lf-message" rows={3} value={form.message} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="A few words about your marketing challenge" />
                </div>

                {touched && !valid && (
                  <p style={{ color: '#c0392b', fontSize: '0.82rem', marginBottom: 12 }}>Please add a name and a valid phone so I can get back to you.</p>
                )}

                <button type="submit" disabled={status === 'sending'} style={{
                  width: '100%', padding: '15px', borderRadius: 12, border: 'none',
                  background: status === 'sending' ? '#7fc89e' : '#1f9d57', color: '#fff',
                  fontSize: '1.08rem', fontWeight: 800, fontFamily: "'Heebo', sans-serif",
                  cursor: status === 'sending' ? 'default' : 'pointer',
                  boxShadow: '0 8px 24px rgba(31,157,87,0.35)', transition: 'background 0.2s, transform 0.15s',
                }}>
                  {status === 'sending' ? 'Sending…' : 'Get a tailored proposal'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.76rem', color: '#8190a3', marginTop: 12 }}>
                  Your details stay with me only. No spam, no sharing.
                </p>
              </form>
            )}
          </div>

          {/* ── Secondary door (WhatsApp) + soft third door ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(22px, 3vw, 30px)', border: '1px solid #e1e8f0', boxShadow: '0 10px 40px rgba(12,17,24,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0c1118', marginBottom: 8 }}>Prefer to talk now?</h3>
              <p style={{ fontSize: '0.92rem', color: '#4a5868', lineHeight: 1.6, marginBottom: 18 }}>
                Message me on WhatsApp and I'll get back to you fast.
              </p>
              <a href={waSecondary} target="_blank" rel="noopener noreferrer" style={enWaBtnStyle}>
                {WA_ICON}Talk to me on WhatsApp
              </a>
            </div>

            <div style={{ background: 'rgba(12,17,24,0.04)', borderRadius: 16, padding: '20px 22px', border: '1px dashed #c3cedb' }}>
              <p style={{ fontSize: '0.92rem', color: '#3a4757', lineHeight: 1.6 }}>
                Not ready yet? That's fine. You can just follow along and get value — scroll down to the quiet WhatsApp community. 👇
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function onEmailClick(e) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    e.preventDefault();
    window.open('https://mail.google.com/mail/?view=cm&to=shmuelmunic@gmail.com', '_blank');
  }
}

const EN_SOCIAL_ICONS = {
  WhatsApp:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  Email:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  LinkedIn:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
  Facebook:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
};

const enNavLinks = [
  { label: 'The Process', id: 'en-strategy' },
  { label: 'Why Me',      id: 'en-why'      },
  { label: 'Work',        id: 'en-work'     },
  { label: 'About',       id: 'en-about'    },
  { label: 'FAQ',         id: 'en-faq'      },
  { label: 'Contact',     id: 'en-contact'  },
];

function EnFooter() {
  const goto = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;
  const enSocials = [
    { label: 'WhatsApp',  href: WA_LINK,                       target: '_blank' },
    { label: 'Email',     href: `mailto:${links.email}`,       emailBtn: true },
    { label: 'LinkedIn',  href: links.linkedin,                target: '_blank' },
    { label: 'Facebook',  href: links.facebook,                target: '_blank' },
    { label: 'Instagram', href: links.instagram,               target: '_blank' },
  ];

  return (
    <footer style={{ background: 'oklch(0.09 0.012 240)', borderTop: 'none', paddingTop: '56px', paddingBottom: '32px', paddingLeft: '28px', paddingRight: '28px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(to right, transparent, var(--brand-deep) 25%, oklch(0.785 0.173 156.6 / 0.35) 50%, var(--brand-deep) 75%, transparent)' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, marginBottom: 48 }}>
          {/* Logo + tagline */}
          <div>
            <img src={logoSrc} alt="Shift Up" style={{ height: 80, width: 'auto', objectFit: 'contain', animation: 'hue-drift 8s ease-in-out infinite', display: 'block', marginBottom: 14 }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 240 }}>
              Research-based campaigns.<br />A performance guarantee that puts the risk on me.
            </p>
          </div>

          {/* Quick nav */}
          <nav aria-label="Quick navigation">
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 16 }}>Navigation</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {enNavLinks.map(l => (
                <button key={l.id} onClick={() => goto(l.id)}
                  style={{ background: 'none', border: 'none', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500, fontFamily: "'Heebo', sans-serif", cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{l.label}</button>
              ))}
            </div>
          </nav>

          {/* Contact + socials */}
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, marginBottom: 16 }}>Get in Touch</div>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >{links.phone}</a>
            <a href={`mailto:${links.email}`}
              onClick={onEmailClick}
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: 20, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >{links.email}</a>
            <div style={{ display: 'flex', gap: 8 }}>
              {enSocials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  target={s.target || undefined} rel={s.target ? 'noopener noreferrer' : undefined}
                  onClick={s.emailBtn ? onEmailClick : undefined}
                  style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', transition: 'background 0.3s, color 0.3s, border-color 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='oklch(0.785 0.173 156.6 / 0.15)'; e.currentTarget.style.color='var(--brand-prime)'; e.currentTarget.style.borderColor='oklch(0.785 0.173 156.6 / 0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='var(--surface-1)'; e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.borderColor='var(--surface-2)'; }}
                >{EN_SOCIAL_ICONS[s.label]}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--surface-1)', marginBottom: 24 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Shift Up · Shmuel Munitz. All rights reserved.
          </p>
          <a href="/" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >← גרסה עברית</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Scroll Progress ────────────────────────────────────────────────── */

function ScrollProgress() {
  const barRef = useRef(null);
  useEffect(() => {
    const update = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      if (barRef.current) barRef.current.style.setProperty('--scroll-pct', `${pct}%`);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}

/* ─── Root ───────────────────────────────────────────────────────────── */

export default function EnglishPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false, touchMultiplier: 1.8 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); gsap.ticker.remove((time) => lenis.raf(time * 1000)); };
  }, []);

  const scrollToProcess = () => document.getElementById('en-strategy')?.scrollIntoView({ behavior: 'smooth' });
  const scrollToForm = () => document.getElementById('en-contact')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div ref={rootRef} dir="ltr" style={{ minHeight: '100vh', background: 'var(--bedrock)', color: 'var(--text-primary)', fontFamily: "'Heebo', sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <ScrollProgress />
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />
      <EnNavbar />
      <main>
        <EnHero onProcess={scrollToProcess} onForm={scrollToForm} />
        <EnTrustStrip />
        <EnPain />
        <EnManifesto />
        <div className="section-divider" />
        <EnProcess />
        <EnWhatYouGet />
        <div className="section-divider" />
        <EnWhyMe />
        <div className="section-divider" />
        <EnProof />
        <div className="section-divider" />
        <EnAbout />
        <div className="section-divider" />
        <EnFAQ />
        <EnLeadForm />
        <EnWhatsAppGroup />
      </main>
      <EnFooter />
    </div>
  );
}
