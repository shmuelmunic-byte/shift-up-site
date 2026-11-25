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

const HE_TITLE = 'Shift Up | תוכנית שיווק כתובה, ועליה הקמפיין - שמואל מוניץ';
const HE_DESC  = 'תדע בדיוק איך להביא לקוחות לעסק שלך: תוכנית שיווק כתובה תוך שבוע מפגישת העומק, וקמפיין ב-Meta וב-Google שאני מקים עליה, עם הבטחת ביצוע על חודש הניהול הראשון, ושיחת היכרות בטלפון בלי עלות';

const ROUTES = {
  '/':            { canonical: '/',            title: HE_TITLE, description: HE_DESC, markdown: '/index.md' },
  '/en':          { canonical: '/en',          title: 'Shift Up | A written marketing plan, then the campaign - Shmuel Munitz', description: 'Know exactly how to bring clients to your business: a written plan within a week of our deep-dive session, and a Meta and Google campaign I build on it, with a performance guarantee on the first month of management', markdown: '/en.md' },
  '/testimonials':{ canonical: '/testimonials', title: 'עדויות לקוחות | Shift Up - שמואל מוניץ', description: 'עדויות של לקוחות Shift Up, מילה במילה: מה אמרו על העבודה עם שמואל מוניץ, מהתוכנית ועד הקמפיין' },
  '/freebies':    { canonical: '/freebies',    title: 'ספריית פרומפטים חינמית ל-AI | Shift Up', description: 'ספריית פרומפטים חינמית של Shift Up: כלי AI מוכנים לשיווק, תוכן ומכירות לבעלי עסקים. העתק, הדבק, תרוויח זמן.' },
  '/audit':       { canonical: '/audit',       title: 'אבחון שיווק חינם ב-3 דקות | Shift Up', description: '10 שאלות קצרות, ואתה מקבל אבחון אישי: הציון שלך, האזורים החלשים, ו-3 הדברים לתקן קודם, בחינם ובלי להשאיר פרטים.' },
  '/ig':          { canonical: '/ig',          noindex: true },
  '/accessibility':{ canonical: '/accessibility', title: 'הצהרת נגישות | Shift Up', description: 'הצהרת הנגישות של אתר Shift Up לפי ת"י 5568 וחוק שוויון זכויות לאנשים עם מוגבלות.' },
  '/privacy':     { canonical: '/privacy',     title: 'מדיניות פרטיות | Shift Up', description: 'מדיניות הפרטיות של Shift Up בהתאם לחוק הגנת הפרטיות ותיקון 13.' },
  '/login':       { noindex: true },
  '/admin':       { noindex: true },
  '/thank-you':   { noindex: true, title: 'קיבלתי! | Shift Up' },
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
    // שפה וכיוון לפי העמוד: /en באנגלית משמאל לימין, כל השאר עברית
    const isEn = pathname === '/en' || pathname.startsWith('/en/');
    document.documentElement.lang = isEn ? 'en' : 'he';
    document.documentElement.dir = isEn ? 'ltr' : 'rtl';

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
