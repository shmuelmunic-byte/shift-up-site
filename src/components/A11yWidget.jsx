import { useEffect, useState, useCallback } from 'react';

/* ──────────────────────────────────────────────────────────────────────────
   רכיב נגישות — פאנל העדפות משתמש (תקנה 35 / ת"י 5568)
   כלי נוחות בלבד: מחליף מחלקות CSS על <html>. אינו "מנגיש אוטומטית" את
   האתר ואינו נוגע ב-DOM של התוכן. הנגשת הקוד עצמה נעשית באתר עצמו.
   שמירה ל-localStorage. נגיש למקלדת. קיצור: Alt+A.
   ────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'shiftup_a11y_prefs_v1';

const DEFAULTS = {
  textSize: 100,   // 100 | 115 | 130 | 150
  contrast: false,
  links: false,
  readableFont: false,
  stopMotion: false,
  bigCursor: false,
};

// מיפוי יחיד — משמש גם בזמן ריצה וגם בסקריפט ה-FOUC ב-index.html
export function applyA11yPrefs(p) {
  const c = document.documentElement.classList;
  c.toggle('a11y-text-115', p.textSize === 115);
  c.toggle('a11y-text-130', p.textSize === 130);
  c.toggle('a11y-text-150', p.textSize === 150);
  c.toggle('a11y-contrast', !!p.contrast);
  c.toggle('a11y-links', !!p.links);
  c.toggle('a11y-readable-font', !!p.readableFont);
  c.toggle('a11y-stop-motion', !!p.stopMotion);
  c.toggle('a11y-big-cursor', !!p.bigCursor);
}

function readPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

const TEXT_STEPS = [100, 115, 130, 150];

export default function A11yWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [announce, setAnnounce] = useState('');

  // hydrate on mount (safety net מעל סקריפט ה-FOUC)
  useEffect(() => {
    const p = readPrefs();
    setPrefs(p);
    applyA11yPrefs(p);
  }, []);

  const commit = useCallback((next) => {
    setPrefs(next);
    applyA11yPrefs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  }, []);

  const toggle = (key, label) => {
    const next = { ...prefs, [key]: !prefs[key] };
    commit(next);
    setAnnounce(`${label}: ${next[key] ? 'פעיל' : 'כבוי'}`);
  };

  const cycleText = () => {
    const idx = TEXT_STEPS.indexOf(prefs.textSize);
    const nextSize = TEXT_STEPS[(idx + 1) % TEXT_STEPS.length];
    const next = { ...prefs, textSize: nextSize };
    commit(next);
    setAnnounce(`גודל טקסט: ${nextSize}%`);
  };

  const reset = () => {
    commit({ ...DEFAULTS });
    setAnnounce('הגדרות הנגישות אופסו');
  };

  // Alt+A — פתיחה/סגירה (e.code כדי לעבוד בכל פריסת מקלדת)
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* אזור חי — מחוץ לפאנל כדי שלא יתפרק בסגירה */}
      <div className="a11y-sr-only" role="status" aria-live="polite">{announce}</div>

      {/* כפתור הפעלה */}
      <button
        type="button"
        id="a11y-trigger"
        className="a11y-trigger"
        aria-label="פתיחת תפריט נגישות"
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-keyshortcuts="Alt+A"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="3.5" r="2" />
          <path d="M21 8.5c0 .6-.4 1-1 1.1l-4.6.7v3.1l1.7 6.1a1 1 0 0 1-1.9.6L12 15.5l-2.2 4.7a1 1 0 0 1-1.9-.6l1.7-6.1v-3.1L5 9.6A1 1 0 0 1 5.3 7.6L11 8.6c.6.1 1.4.1 2 0l5.7-1a1 1 0 0 1 2.3 1z" />
        </svg>
      </button>

      {/* פאנל */}
      {open && (
        <>
          <div className="a11y-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            id="a11y-panel"
            className="a11y-panel"
            role="dialog"
            aria-modal="false"
            aria-label="תפריט נגישות"
            dir="rtl"
          >
            <div className="a11y-panel-head">
              <h2>הגדרות נגישות</h2>
              <button type="button" className="a11y-close" aria-label="סגירת תפריט נגישות" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="a11y-grid">
              <button type="button" className="a11y-card" onClick={cycleText} aria-label={`גודל טקסט: ${prefs.textSize} אחוז`}>
                <span className="a11y-ico" aria-hidden="true">A+</span>
                <span className="a11y-lbl">הגדל טקסט</span>
                <span className="a11y-val">{prefs.textSize}%</span>
              </button>

              <button type="button" className={'a11y-card' + (prefs.contrast ? ' on' : '')} aria-pressed={prefs.contrast} onClick={() => toggle('contrast', 'ניגודיות גבוהה')}>
                <span className="a11y-ico" aria-hidden="true">◐</span>
                <span className="a11y-lbl">ניגודיות גבוהה</span>
              </button>

              <button type="button" className={'a11y-card' + (prefs.links ? ' on' : '')} aria-pressed={prefs.links} onClick={() => toggle('links', 'הדגשת קישורים')}>
                <span className="a11y-ico" aria-hidden="true">🔗</span>
                <span className="a11y-lbl">הדגשת קישורים</span>
              </button>

              <button type="button" className={'a11y-card' + (prefs.readableFont ? ' on' : '')} aria-pressed={prefs.readableFont} onClick={() => toggle('readableFont', 'גופן קריא')}>
                <span className="a11y-ico" aria-hidden="true">Aa</span>
                <span className="a11y-lbl">גופן קריא</span>
              </button>

              <button type="button" className={'a11y-card' + (prefs.stopMotion ? ' on' : '')} aria-pressed={prefs.stopMotion} onClick={() => toggle('stopMotion', 'עצירת אנימציות')}>
                <span className="a11y-ico" aria-hidden="true">⏸</span>
                <span className="a11y-lbl">עצירת אנימציות</span>
              </button>

              <button type="button" className={'a11y-card' + (prefs.bigCursor ? ' on' : '')} aria-pressed={prefs.bigCursor} onClick={() => toggle('bigCursor', 'סמן עכבר גדול')}>
                <span className="a11y-ico" aria-hidden="true">⬆</span>
                <span className="a11y-lbl">סמן גדול</span>
              </button>
            </div>

            <button type="button" className="a11y-reset" onClick={reset}>איפוס הגדרות נגישות</button>

            <a href="/accessibility" className="a11y-statement-link">להצהרת הנגישות המלאה</a>
          </div>
        </>
      )}
    </>
  );
}
