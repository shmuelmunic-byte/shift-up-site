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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
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
        background: scrolled ? 'oklch(0.08 0.01 240 / 0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.5)' : 'none',
        borderBottom: scrolled ? '1px solid oklch(0.18 0.025 240)' : '1px solid transparent',
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
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => goto(l.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                fontFamily: "'Heebo', sans-serif",
                transition: 'color 0.25s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {l.label}
            </button>
          ))}

          {/* English page link */}
          <a
            href="/en"
            style={{
              background: 'none',
              border: '1px solid var(--surface-2)',
              borderRadius: 999,
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

          <button
            onClick={onCta}
            style={{
              background: 'var(--brand-prime)',
              color: 'oklch(0.08 0.01 240)',
              border: 'none',
              borderRadius: 999,
              padding: '10px 22px',
              fontWeight: 800,
              fontSize: '0.88rem',
              fontFamily: "'Heebo', sans-serif",
              boxShadow: '0 0 28px oklch(0.78 0.20 145 / 0.35)',
              transition: 'background 0.25s, box-shadow 0.25s, transform 0.2s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--brand-glow)';
              e.target.style.boxShadow = '0 0 44px oklch(0.78 0.20 145 / 0.6)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--brand-prime)';
              e.target.style.boxShadow = '0 0 28px oklch(0.78 0.20 145 / 0.35)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            בוא נדבר תכלס
          </button>
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
                  fontFamily: "'Heebo', sans-serif",
                  padding: '4px 0',
                }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => { onCta(); setOpen(false); }}
              style={{
                background: 'var(--brand-prime)',
                color: 'oklch(0.08 0.01 240)',
                border: 'none',
                borderRadius: 999,
                padding: '13px 0',
                fontWeight: 800,
                fontSize: '1rem',
                fontFamily: "'Heebo', sans-serif",
                marginTop: 8,
              }}
            >
              בוא נדבר תכלס
            </button>

            <a
              href="/en"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                border: '1px solid var(--surface-2)',
                borderRadius: 999,
                padding: '12px 0',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textDecoration: 'none',
              }}
            >
              EN — English Version
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
