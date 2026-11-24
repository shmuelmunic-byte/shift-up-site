import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const logoSrc = '/logo.png';

const links = [
  { label: 'התהליך', id: 'strategy' },
  { label: 'למה אני', id: 'why' },
  { label: 'עדויות',  id: 'testimonials' },
  { label: 'שאלות',  id: 'faq' },
];

/* כיוון C (25.11.2026): שקוף מעל ההירו, רקע לילה מלא אחרי גלילה (בלי blur/glass), לוגו בלי אנימציית צבע */
export default function Navbar({ onCta }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
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

  const cta = (e) => { e.preventDefault(); setOpen(false); if (onCta) onCta(); };

  return (
    <nav className={`c-nav${scrolled || open ? ' is-solid' : ''}`} aria-label="ניווט ראשי">
      <div className="c-wrap c-nav__row">
        <button type="button" className="c-nav__logo" onClick={() => goto('hero')} aria-label="Shift Up, חזרה לתחילת העמוד">
          <img src={logoSrc} alt="Shift Up" width="1600" height="600" />
        </button>

        <ul className="c-nav__links">
          {links.map(l => (
            <li key={l.id}>
              <button type="button" onClick={() => goto(l.id)} aria-current={activeId === l.id ? 'true' : undefined}>
                {l.label}
              </button>
            </li>
          ))}
          <li><a href="/en" lang="en">EN</a></li>
        </ul>

        <div className="c-nav__end">
          <a className="c-nav__cta" href="#contact" onClick={cta}>לשיחת היכרות</a>
          {/* מקום שמור לכפתור הנגישות במובייל ובטאבלט (הוא fixed ויושב כאן, ראו c-design.css) */}
          <span className="c-nav__a11y-slot" aria-hidden="true" />
          <button
            type="button"
            className="c-nav__burger"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'סגירת התפריט' : 'פתיחת התפריט'}
            aria-expanded={open}
            aria-controls="c-nav-menu"
          >
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="c-nav-menu" className="c-nav__menu">
          <div className="c-wrap">
            {links.map(l => (
              <button type="button" key={l.id} onClick={() => goto(l.id)}>{l.label}</button>
            ))}
            <a href="/en" lang="en">EN · English Version</a>
          </div>
        </div>
      )}
    </nav>
  );
}
