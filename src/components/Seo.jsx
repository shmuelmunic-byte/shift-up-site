import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* ── Per-route SEO head manager ──────────────────────────────────────────
   SPA fix: index.html ships one static <title>/description/canonical/og:url
   (correct for "/" and enough for no-JS social scrapers). This component runs
   on every route change and MUTATES those single tags in place — so each page
   gets its own canonical/title/description without ever creating duplicates.
   hreflang alternates stay static in index.html: the set is identical on every
   page, so it needs no per-route change. Google renders JS, so it sees the
   corrected values; WhatsApp/Facebook keep the static OG for link previews. */

const BASE = 'https://www.shiftup.marketing';

const HE_TITLE = 'Shift Up | אסטרטגיה ושיווק דיגיטלי מבוסס AI - שמואל מוניץ';
const HE_DESC  = 'תחזור לנהל את העסק. את השיווק תשאיר לי. קמפיינים מבוססי-מחקר ב-Meta וב-Google עם הבטחת ביצוע על חודש הניהול הראשון. שיחת היכרות חינם.';

const ROUTES = {
  '/':            { canonical: '/',            title: HE_TITLE, description: HE_DESC, markdown: '/index.md' },
  '/en':          { canonical: '/en',          title: 'Shift Up | Research-based marketing with a performance guarantee - Shmuel Munitz', description: 'Get back to running your business. Leave the marketing to me. Research-based Meta & Google campaigns with a performance guarantee on the first month. Free intro call.', markdown: '/en.md' },
  '/testimonials':{ canonical: '/testimonials', title: 'עדויות לקוחות | Shift Up - שמואל מוניץ', description: 'עדויות ולקוחות של שמואל מוניץ (Shift Up). שיטה מבוססת-מחקר, הבטחת ביצוע, ותוצאות שמדברות בעצמן.' },
  '/freebies':    { canonical: '/freebies',    title: 'ספריית פרומפטים חינמית ל-AI | Shift Up', description: 'ספריית פרומפטים חינמית של Shift Up: כלי AI מוכנים לשיווק, תוכן ומכירות לעסקים קטנים. העתק, הדבק, תרוויח זמן.' },
  '/audit':       { canonical: '/audit',       title: 'אבחון שיווק חינם ב-3 דקות | Shift Up', description: '10 שאלות קצרות, ואתה מקבל אבחון אישי: הציון שלך, האזורים החלשים, ו-3 הדברים לתקן קודם. בחינם, בלי להשאיר פרטים.' },
  '/ig':          { canonical: '/ig',          noindex: true },
  '/accessibility':{ canonical: '/accessibility', title: 'הצהרת נגישות | Shift Up', description: 'הצהרת הנגישות של אתר Shift Up לפי ת"י 5568 וחוק שוויון זכויות לאנשים עם מוגבלות.' },
  '/privacy':     { canonical: '/privacy',     title: 'מדיניות פרטיות | Shift Up', description: 'מדיניות הפרטיות של Shift Up בהתאם לחוק הגנת הפרטיות ותיקון 13.' },
  '/login':       { noindex: true },
  '/admin':       { noindex: true },
};

function upsert(selector, make, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) { el = make(); document.head.appendChild(el); }
  el.setAttribute(attr, value);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const cfg = ROUTES[pathname] || { canonical: pathname };
    const canonical = BASE + (cfg.canonical || pathname);

    if (cfg.title) document.title = cfg.title;

    if (cfg.description) {
      upsert('meta[name="description"]',
        () => { const m = document.createElement('meta'); m.setAttribute('name', 'description'); return m; },
        'content', cfg.description);
    }

    upsert('link[rel="canonical"]',
      () => { const l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l; },
      'href', canonical);

    upsert('meta[property="og:url"]',
      () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m; },
      'content', canonical);

    upsert('meta[name="robots"]',
      () => { const m = document.createElement('meta'); m.setAttribute('name', 'robots'); return m; },
      'content', cfg.noindex ? 'noindex, follow' : 'index, follow');

    // Markdown mirror hint for AI crawlers: point to this page's .md, or drop it
    // entirely on pages that have no mirror (so nothing points to the wrong file).
    const mdLink = document.head.querySelector('link[rel="alternate"][type="text/markdown"]');
    if (cfg.markdown) {
      upsert('link[rel="alternate"][type="text/markdown"]',
        () => { const l = document.createElement('link'); l.setAttribute('rel', 'alternate'); l.setAttribute('type', 'text/markdown'); return l; },
        'href', BASE + cfg.markdown);
    } else if (mdLink) {
      mdLink.remove();
    }
  }, [pathname]);

  return null;
}
