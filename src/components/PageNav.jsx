import { useLayoutEffect, useRef } from 'react';

/* ── פס ניווט לדפים הפנימיים בכיוון C (סבב 2, 25.11.2026) ──
   דביק, רקע לילה מלא, לוגו שמוביל לעמוד הראשי, וקישור חזרה רק בדפים שכבר היה בהם.
   כפתור הנגישות (A11yWidget, fixed) יושב בתוך המקום השמור בסוף הפס בכל רוחב:
   המיקום נמדד כאן ונכתב ל-‎--a11y-top / --a11y-left, וכך הוא לא מכסה טקסט אף פעם,
   עם באנר העוגיות ובלעדיו, ב-RTL וב-LTR. */
export default function PageNav({ back, backHref = '/', logoHref = '/', onLogo, tag, logoLabel = 'Shift Up, לעמוד הראשי', navLabel = 'ניווט', children }) {
  const navRef = useRef(null);
  const slotRef = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const place = () => {
      const nav = navRef.current;
      const slot = slotRef.current;
      if (!nav || !slot) return;
      const n = nav.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      root.style.setProperty('--a11y-top', `${Math.round(s.top - n.top)}px`);
      root.style.setProperty('--a11y-left', `${Math.round(s.left)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener('resize', place);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', place);
      root.style.removeProperty('--a11y-top');
      root.style.removeProperty('--a11y-left');
    };
  }, []);

  return (
    <nav className="c-pnav" ref={navRef} aria-label={navLabel}>
      <div className="c-wrap c-pnav__row">
        <div className="c-pnav__start">
          <a className="c-pnav__logo" href={logoHref} onClick={onLogo} aria-label={logoLabel}>
            <img src="/logo.png" alt="Shift Up" width="1600" height="600" />
          </a>
          {tag && <span className="c-pnav__tag">{tag}</span>}
        </div>
        <div className="c-pnav__end">
          {children}
          {back && (
            <a className="c-pnav__back" href={backHref}>
              <span aria-hidden="true" className="c-pnav__arrow" />
              {back}
            </a>
          )}
          <span className="c-pnav__slot" ref={slotRef} aria-hidden="true" />
        </div>
      </div>
    </nav>
  );
}
