import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────────────────
   הודעת עוגיות / מעקב — חוק הגנת הפרטיות (תיקון 13, אוגוסט 2025)
   האתר משתמש ב-Google Analytics 4 וב-Meta Pixel. מוצגת הודעה עם בחירה
   מפורשת. "דחייה" מפעילה את דגל הביטול של GA4 ומסמנת סירוב.

   מגבלה מתועדת ב-docs/COMPLIANCE.md: הסקריפטים נטענים כרגע ישירות מ-<head>
   ב-index.html. חסימה מלאה לפני הסכמה מחייבת העברת האתחול לטעינה מותנית.
   ────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'shiftup_cookie_consent_v1';
const GA_ID = 'G-RCGQNYG1V8';

function readConsent() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function applyRejection() {
  // GA4 opt-out — עוצר שליחת אירועים נוספים
  try { window[`ga-disable-${GA_ID}`] = true; } catch { /* noop */ }
}

const TEXT = {
  he: {
    dir: 'rtl', aria: 'הודעת עוגיות ומעקב',
    body: 'אני משתמש בעוגיות ובכלי מדידה (Google Analytics ו-Meta Pixel) כדי להבין איך משתמשים באתר ולשפר אותו, ופרטים מלאים יש במדיניות הפרטיות.',
    link: 'למדיניות הפרטיות', reject: 'דחייה', accept: 'אישור',
  },
  en: {
    dir: 'ltr', aria: 'Cookie notice',
    body: 'I use cookies and analytics tools (Google Analytics and Meta Pixel) to understand how the site is used and improve it. Full details are in the privacy policy.',
    link: 'Privacy policy', reject: 'Decline', accept: 'Accept',
  },
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();
  const L = TEXT[pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'he'];

  useEffect(() => {
    const c = readConsent();
    if (!c) { setVisible(true); return; }
    if (c === 'rejected') applyRejection();
  }, []);

  const decide = (value) => {
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* private mode */ }
    if (value === 'rejected') applyRejection();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="region" aria-label={L.aria} dir={L.dir}>
      <div className="cookie-inner">
        <p className="cookie-text">
          {L.body}{' '}
          <a href="/privacy" className="cookie-link">{L.link}</a>
        </p>
        <div className="cookie-actions">
          <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => decide('rejected')}>
            {L.reject}
          </button>
          <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => decide('accepted')}>
            {L.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
