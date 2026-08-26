import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const logoSrc = '/logo.png';

const links = [
  { label: 'התהליך', id: 'strategy' },
  { label: 'למה אני', id: 'why' },
  { label: 'מי אני',  id: 'about' },
  { label: 'שאלות',  id: 'faq' },
];

export default function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const sectionIds = ['hero', ...links.map(l => l.id), 'contact'];
    const observers = sectionIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const goto = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 900,
        transition: 'background 0.5s ease, padding 0.4s ease',
        padding: scrolled ? '10px 0' : '18px 0',
        background: scrolled ? 'oklch(0.09 0.012 240 / 0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.8)' : 'none',
        borderBottom: scrolled ? '1px solid oklch(0.22 0.025 240 / 0.6)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 40px oklch(0 0 0 / 0.25)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => goto('hero')}
          aria-label="Shift Up — חזרה לתחילה"
          style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}
        >
          <img
            src={logoSrc}
            alt="Shift Up"
            style={{ height: 'clamp(64px, 14vw, 120px)', width: 'auto', objectFit: 'contain', animation: 'hue-drift 8s ease-in-out infinite' }}
          />
        </button>

        {/* Desktop links — uses .nav-desktop CSS class (not inline display) to avoid Tailwind conflict */}
        <div className="nav-desktop">
          {links.map(l => {
            const isActive = activeId === l.id;
            return (
              <button
                key={l.id}
                onClick={() => goto(l.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--brand-prime)' : 'var(--text-secondary)',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 600,
                  letterSpacing: '0.02em',
                  fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
                  transition: 'color 0.25s',
                  position: 'relative',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--brand-prime)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {l.label}
                {isActive && (
                  <span style={{
                    position: 'absolute', bottom: -2, right: 0, left: 0,
                    height: 2, borderRadius: 3,
                    background: 'var(--brand-prime)',
                  }} />
                )}
              </button>
            );
          })}

          {/* English page link */}
          <a
            href="/en"
            style={{
              background: 'none',
              border: '1px solid var(--surface-2)',
              borderRadius: 3,
              padding: '8px 16px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textDecoration: 'none',
              transition: 'border-color 0.25s, color 0.25s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--brand-prime)'; e.target.style.color = 'var(--brand-prime)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--surface-2)'; e.target.style.color = 'var(--text-muted)'; }}
          >
            EN
          </a>

          <a
            href="/audit"
            style={{
              background: 'var(--brand-prime)',
              color: 'oklch(0.12 0.02 160)',
              border: 'none',
              borderRadius: 3,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: '0.88rem',
              fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--brand-glow)'; }}
            onMouseLeave={e => { e.target.style.background = 'var(--brand-prime)'; }}
          >
            אבחון שיווק חינם
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setOpen(!open)}
          aria-label="תפריט"
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: 4 }}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="mobile-menu-enter"
          style={{
            position: 'absolute',
            top: '100%',
            width: '100%',
            background: 'oklch(0.11 0.015 240 / 0.97)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--surface-2)',
          }}
        >
          <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {links.map(l => (
              <button
                key={l.id}
                onClick={() => goto(l.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'right',
                  fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
                  padding: '4px 0',
                }}
              >
                {l.label}
              </button>
            ))}
            <a
              href="/audit"
              onClick={() => setOpen(false)}
              style={{
                background: 'var(--brand-prime)',
                color: 'oklch(0.12 0.02 160)',
                border: 'none',
                borderRadius: 3,
                padding: '13px 0',
                fontWeight: 700,
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
                marginTop: 8,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              אבחון שיווק חינם
            </a>

            <a
              href="/en"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                border: '1px solid var(--surface-2)',
                borderRadius: 3,
                padding: '12px 0',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textDecoration: 'none',
              }}
            >
              EN · English Version
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
