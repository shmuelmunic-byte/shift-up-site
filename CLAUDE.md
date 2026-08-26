# Shift Up — Project Memory for Claude

## מה הפרויקט
אתר נחיתה שיווקי מקצועי עבור **שמואל מוניץ** — אסטרטג שיווק דיגיטלי ומומחה AI.

## 🔄 מיצוב קנוני (פיבוט 14–15.07.2026 — הוטמע באתר 16.07)
מקור אמת: הוולט → `Projects/Shift Up.md`. **כל תוכן חדש באתר חייב להתיישר לזה:**
- **טאגליין (נשמר):** "תחזור לנהל את העסק. את השיווק תשאיר לי."
- **מיצוב:** אסטרטג שיווק שבונה **קמפיינים מבוססי-מחקר לעסקים בוגרים** — עם **הבטחת ביצוע** על חודש הניהול הראשון.
- **3 עמודי בידול:** מבוסס מחקר · הבטחת ביצוע (הסיכון עליי — אם החודש הראשון לא מביא פניות, ממשיך לעבוד בלי לגבות) · בגובה העיניים (שותף ביצוע, לא מוכר).
- **מחיר: ⛔ לא מציגים מחירים באתר — אף פעם, גם לא טווח** (החלטת שמואל 16.07). הנוסח באתר: "מחיר קבוע וסגור שנקבע בשיחת ההיכרות". המספרים עצמם (הקמה ~2,250 + ניהול 1,300–1,500) — לשיחת המכירה בלבד, מקור בוולט. **Scarcity:** מקום קייס מייסדים אחד "בתנאים מיוחדים" (בלי מספר).
- **ניסוח הבטחת ביצוע — חובה לדייק:** זה **לא** "חודש ראשון חינם". הנוסח הקנוני: "אם בחודש הניהול הראשון אין פניות — אני ממשיך לנהל בחינם עד שיש." בכל מקום שההבטחה מוזכרת, הניסוח חייב להבהיר את זה.
- **קהל:** עסקים בוגרים שיווקית שכבר נכוו (לא מתחילים). תהליך: **המחקר → השיפט → האקשן**.
- **מיינדסט קופי (זווית כתיבה, לא מסר חדש):** כותבים מזווית **נתינה ושינוי-חיים של העסק**, לא מזווית "תשכור אותי כדי שארוויח". הכסף הוא תוצר לוואי של הערך. פירוט: וולט `Knowledge/מיינדסט שפע — עבודה כנתינה.md`.
- **💀 Kill-words (לא להשתמש):** "אדם אחד, לא סוכנות" · "מפצחים לפני ששורפים" · "שיחת פיצוח" (עכשיו: שיחת היכרות) · "אסטרטג שיודע גם לבצע" · "משלם כשאתה רואה" · "2–3 מקומות ברבעון".
- ⚠️ **מחירים/scarcity ישנים במסמכי docs/ (landing-spec וכו') — היסטוריים, לא לצטט מהם.**

## כתובות
- **דומיין ראשי:** https://www.shiftup.marketing
- **Vercel URL (גיבוי):** https://shift-up-site.vercel.app
- **GitHub:** https://github.com/shmuelmunic-byte/shift-up-site
- **דף אנגלי:** https://www.shiftup.marketing/en
- **Link in Bio (אינסטגרם):** https://www.shiftup.marketing/ig

## סטאק טכנולוגי
- React 19 + Vite 7
- GSAP 3 + ScrollTrigger (אנימציות)
- Lenis (smooth scroll)
- react-router-dom v7 (ניתוב)
- Tailwind CSS (כלי עזר)
- Heebo font (Google Fonts) — RTL עברי
- **Supabase** (@supabase/supabase-js v2) — backend ל-CMS (PostgreSQL + RLS + Auth)

## מבנה הפרויקט

```
shift-up-site/
├── index.html              ← Meta tags, Schema JSON-LD, GA, Meta Pixel
├── vercel.json             ← SPA rewrite rule
├── public/
│   ├── logo.png            ← לוגו ראשי (Shift Up)
│   ├── favicon.png         ← פאביקון מותאם אישית
│   ├── favicon.svg         ← פאביקון SVG (גיבוי)
│   ├── shmuel.png          ← תמונת פרופיל שמואל (עודכנה 2026-06-03)
│   ├── robots.txt          ← Allow all + sitemap
│   └── sitemap.xml         ← / + /en עם hreflang
└── src/
    ├── main.jsx            ← BrowserRouter + Routes + Analytics component
    ├── App.jsx             ← דף עברי ראשי
    ├── index.css           ← Design system + animations
    ├── lib/
    │   ├── supabase.js     ← Supabase client (createClient עם VITE env vars)
    │   └── useSiteLinks.js ← Hook משותף לכל הקישורים (עברית+אנגלית — מקור אמת אחד)
    ├── pages/
    │   ├── EnglishPage.jsx      ← דף אנגלי מלא (self-contained) — קישורים מ-useSiteLinks
    │   ├── IgPage.jsx           ← Link in Bio (/ig) — דינמי מטבלת ig_links
    │   ├── FreePage.jsx         ← ספריית פרומפטים (/freebies) — דינמי מטבלת prompts
    │   ├── TestimonialsPage.jsx ← עמוד עדויות (/testimonials) — מטבלת testimonials
    │   ├── LoginPage.jsx        ← התחברות admin (supabase.auth)
    │   └── AdminPage.jsx        ← ממשק ניהול /admin — 8 טאבים (CRUD מלא)
    └── components/
        ├── Analytics.jsx        ← SPA route tracker (Meta PageView + GA4 page_view)
        ├── RequireAuth.jsx      ← הגנת route ל-/admin (session-based)
        ├── Navbar.jsx           ← ניווט עברי + כפתור EN
        ├── Hero.jsx             ← Hero (סקשן 1) — נבנה מחדש לפי spec: 2CTA (טופס ראשי/וואטסאפ משני), עוגן מחיר, scarcity, trust chips
        ├── TrustStrip.jsx       ← רצועת אמון (סקשן 2) — סלקטיביות + זמינות חיה + שיחת היכרות. hardcoded
        ├── PainSection.jsx      ← כאב (סקשן 3) — הוק + 4 כרטיסי כאב + מעבר הקלה ירוק. hardcoded
        ├── MarqueeSection.jsx   ← ⚠️ מנותק מהמשפך (קיים על הדיסק, לא ב-App)
        ├── Stats.jsx            ← ⚠️ מנותק מהמשפך (הומר ל-TrustStrip); לוגיקת 08:00–17:00 הועתקה ל-TrustStrip
        ├── Process.jsx          ← 3 שלבים (סקשן 4) — דינמי מטבלת process_steps (שמות: פיצוח/שיפט/אקשן)
        ├── WhyMe.jsx            ← כרטיסים — דינמי מטבלת why_me_reasons
        ├── Manifesto.jsx
        ├── About.jsx            ← תמונת פרופיל + טקסט (hardcoded — markup מורכב)
        ├── FAQ.jsx              ← שאלות — דינמי מטבלת faqs (typewriter effect)
        ├── TestimonialsPreview.jsx ← הצצה לעדויות בדף הבית (featured=true בלבד)
        ├── WhatsAppGroup.jsx    ← קבוצת WhatsApp — קישור מ-useSiteLinks
        ├── CTA.jsx              ← CTA — subtext + קישורים מ-site_content
        ├── Footer.jsx           ← פרטי קשר + 5 סושיאל מ-site_content
        └── Cursor.jsx           ← Custom cursor
```

## ניתוב (Routes)
```jsx
/             → App.jsx (עברית, RTL)
/en           → EnglishPage.jsx (אנגלית, LTR)
/ig           → IgPage.jsx (Link in Bio — נסתר, מובייל-פירסט)
/freebies     → FreePage.jsx (ספריית פרומפטים — נסתר, סושיאל traffic)
/testimonials → TestimonialsPage.jsx (עדויות לקוחות — לוגו + ציטוט)
/login        → LoginPage.jsx (התחברות admin)
/admin        → AdminPage.jsx (ממשק ניהול — מוגן ב-RequireAuth)
```
כל הדפים נפתחים באותו טאב (לא `target="_blank"`).
כל ה-routes המשניים lazy-loaded (code-split) — `/` נטען הכי מהר.

## Design System (CSS Variables)
```css
--bedrock:      oklch(0.08 0.01 240)   /* רקע כהה ביותר */
--surface-0:    oklch(0.11 0.015 240)
--surface-1:    oklch(0.14 0.02 240)
--surface-2:    oklch(0.18 0.025 240)
--brand-prime:  oklch(0.78 0.20 145)   /* ירוק ראשי */
--brand-glow:   oklch(0.92 0.18 140)
--brand-deep:   oklch(0.55 0.25 145)
--accent-void:  oklch(0.50 0.20 285)   /* סגול */
--text-primary: oklch(0.97 0.005 240)
--text-secondary: oklch(0.70 0.01 240)
--text-muted:   oklch(0.45 0.01 240)
```

## פרטי קשר / אישורים
- **טלפון/WhatsApp:** +972534673151
- **מייל:** shmuelmunic@gmail.com
- **LinkedIn:** https://www.linkedin.com/in/shmuel-munitz-marketing
- **Facebook:** https://www.facebook.com/share/1BZ8HrpBeo/
- **Instagram:** https://www.instagram.com/shiftup.il
- **WhatsApp קבוצה שקטה:** https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3
- **Meta Pixel ID:** 2151537265681503
- **Google Analytics:** G-RCGQNYG1V8

## שעות זמינות (badge)
`08:00–17:00` שעון ישראל (`Asia/Jerusalem`) — מוגדר ב-`TrustStrip.jsx` (`isOnlineNow`). היה ב-`Stats.jsx` (מנותק).

## דומיין ו-DNS
- **רשם:** Porkbun ($6/שנה ראשונה, $34 חידוש — לפני חידוש לעבור ל-Cloudflare Registrar)
- **DNS Records ב-Porkbun:**
  - A record: `@` → `76.76.21.21` (Vercel)
  - CNAME: `www` → `cname.vercel-dns.com`
- **Vercel:** redirect מ-`shiftup.marketing` ל-`www.shiftup.marketing`
- ⚠️ **GSC "הדף מפנה לכתובת אתר אחרת" (Page with redirect) — צפוי, לא תקלה.** הגרסאות הלא-קנוניות (`http://`, בלי `www`) מפנות בכוונה לקנוני `https://www.shiftup.marketing/`. Google לא מאנדקס את מקור ההפניה (מונע duplicate content) — מאנדקס את היעד. **אין מה לתקן, לא ללחוץ "אמת תיקון".** עדיף Domain property ב-GSC על URL-prefix.

## SEO — מה קיים
- `robots.txt` + `sitemap.xml` (כולל /en עם hreflang)
- Canonical: `https://www.shiftup.marketing/`
- hreflang: he / en / x-default
- Schema JSON-LD: FAQPage + Person + ProfessionalService
- Google Search Console: מחובר, sitemap הוגש
- OG image: `https://www.shiftup.marketing/shmuel.png`

## לוגו וגדלים
- לוגו בנאבר: `clamp(64px, 14vw, 120px)` — רספונסיבי
- לוגו בפוטר: `110px`
- פאביקון: `favicon.png` (512x512)

## אנימציות חשובות
- `hue-drift` — על הלוגו (8s)
- `blob-drift` — fluid blobs ברקע
- `float` — תמונת פרופיל ב-About (7s, עצל)
- `ring-spin` — טבעת conic gradient מסתובבת סביב תמונת פרופיל
- `scan-sweep` — קו סריקה עובר על התמונה (5s, delay 3.5s)
- `ig-fade-up` — entrance animation לעמוד /ig
- `marquee-rtl` — מרקי עברי (33.333%)
- `marquee-ltr` — מרקי אנגלי (-33.333%)
- GSAP ScrollTrigger — כל הסקשנים
- `translate="no"` על h1 ו-Manifesto (מונע שבירת אנימציות)

## CMS — ניהול תוכן דרך Supabase

### ארכיטקטורה
- **Backend:** Supabase (PostgreSQL + RLS + Auth). Project URL: `https://fsqstwlapiiqbnyjjzqx.supabase.co`
- **Env vars:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (publishable key `sb_publishable_...`).
  ה-`.env` המקומי מכיל את המפתחות האמיתיים (publishable/anon — קריאה בלבד תחת RLS) — dev מקומי מתחבר ל-DB החי. (עודכן 2026-07-16; בעבר נכתב כאן "placeholders" — לא נכון יותר.)
- **Auth:** email/password. `/admin` מוגן ב-`RequireAuth.jsx` (redirect ל-`/login?next=`).
- **RLS לכל טבלה:** `public read` (select using true) + `auth write` (all using auth.role()='authenticated').

### עיקרון Fallback-first (חשוב!)
כל קומפוננטה דינמית מציגה **fallback hardcoded מיד**, ומחליפה בשקט בנתוני DB כשמגיעים — ללא loading flash, ללא skeleton. אם Supabase נופל, האתר עדיין מציג את התוכן המקורי.
```js
const [data, setData] = useState(FALLBACK_DATA);
useEffect(() => { supabase.from('table').select('*').order('position')
  .then(({ data }) => { if (data?.length) setData(data); }); }, []);
```

### טבלאות (13) + `leads`
| טבלה | תוכן | קומפוננטה |
|------|------|-----------|
| `prompts` | ספריית פרומפטים | FreePage |
| `ig_links` | כפתורי Link in Bio | IgPage |
| `site_content` | key/value — קישורים + **כל הכותרות/טקסטים** של הסקשנים | Hero, CTA, Footer, useSiteLinks, **useContent** |
| `faqs` | שאלות נפוצות | FAQ |
| `stats` | סטטיסטיקות (מנותק) | Stats |
| `process_steps` | שלבי תהליך (bullets = jsonb) | Process |
| `why_me_reasons` | כרטיסי "למה אני" | WhyMe |
| `testimonials` | עדויות (featured=הצג בדף הבית) | TestimonialsPage, TestimonialsPreview |
| `trust_pillars` | 3 עמודי רצועת אמון (סקשן 2) | TrustStrip |
| `pain_points` | 4 משפטי כאב (סקשן 3) | PainSection |
| `outcomes` | 4 כרטיסי "מה תקבל" (סקשן 6) | WhatYouGet |
| `proof_cases` | קייסים (steps = **text** עם JSON) | Proof |
| `proof_grid` | גריד מודעות (file/client/field) | Proof |
| `leads` | לידים מהטופס | LeadForm, LeadsTab |

**SQL ליצירה:** ⭐ **`docs/setup.sql`** = קובץ הרצה אחד (לידים + CMS + התראת מייל) — להריץ פעם אחת ב-Supabase SQL Editor. מורכב מ-`docs/leads-table.sql` + `docs/cms-sections.sql` + בלוק מייל (pg_net→Resend). idempotent. (הקבצים הנפרדים נשמרים כמקור.)
**`useContent(fallbackMap)`** (`src/lib/useContent.js`) — הוק fallback-first שמושך קבוצת מפתחות מ-`site_content`. כל הכותרות/תת-כותרות של הסקשנים החדשים (trust/pain/wyg/proof/leadform) עוברות דרכו. אייקונים של trust/outcomes נשארים בקוד (ממופים לפי index).

### site_content — מפתחות
`contact.whatsapp_url`, `contact.whatsapp_group`, `contact.phone`, `contact.email`, `contact.linkedin`, `contact.facebook`, `contact.instagram`, `hero.subtitle`, `cta.subtext`.
כל שורה: `key, value, section, label, type` (text/url/phone/email/textarea). ה-ContactTab ב-admin מציג אוטומטית כל שורה לפי section.

### useSiteLinks() — סנכרון עברית ↔ אנגלית
Hook משותף (`src/lib/useSiteLinks.js`) ששולף את כל קישורי `contact.*`. משמש את הקומפוננטות העבריות **וגם** את כל תתי-הקומפוננטות בעמוד האנגלי. שינוי קישור אחד ב-admin → מתעדכן בשני העמודים. העמוד האנגלי שומר על טקסט prefill באנגלית (`.split('?')[0]` + טקסט אנגלי), רק המספר/קישור מסונכרן.

### מה נשאר hardcoded (לא ב-CMS) — בכוונה
רק סקשנים מבוססי-אנימציה ש-key/value ישבור: **כותרת Hero הראשית** (gradient spans + GSAP kinetic), **Manifesto** (אנימציה per-מילה), **פסקאות About** (inline HTML). שאר הטקסטים ב-Hero (chips/eyebrow/badges/price) עדיין hardcoded — אפשר להעביר ל-site_content בעתיד. הטקסט השיווקי **באנגלית** לא מנוהל — רק הקישורים מסונכרנים.

### Admin — 9 טאבים (`/admin`)
📥 לידים (ברירת מחדל) · 📚 פרומפטים · 🔗 כפתורי /ig · 📞 פרטי קשר · ❓ שאלות · 📊 סטטיסטיקות · 🔄 תהליך · 💡 למה אני · ⭐ עדויות.
`GenericCrudTab` = factory לכל טאבי ה-CRUD (faqs/stats/process/whyme/testimonials) — CRUD + reorder ▲▼ + toggles.
**`LeadsTab`** = טאב ייעודי (לא CRUD): רשימת לידים מ-`leads` (created_at desc), סימון "טופל", מחיקה, וואטסאפ בלחיצה. badge על הטאב = לידים שלא טופלו. אם הטבלה חסרה → מציג הנחיית התקנה (`docs/leads-table.sql`).
**עיצוב (סשן 3):** ה-shell עודכן לזהות האתר — רקע bedrock + aurora orbs + noise, header עם CMS subtitle, ניווט טאבים אופקי-נגלל (`.admin-tabs`/`.admin-tab` ב-index.css תחת `.admin-scope`), focus glow ירוק על כל ה-inputs, hover על כרטיסים.

### התראת מייל על ליד
**דרך ראשית (מומלצת):** טריגר `after insert` על `leads` שמשתמש ב-`pg_net` לשלוח דרך **Resend** — הכל ב-`docs/setup.sql` PART 3 (המפתח ב-Supabase Vault). מדריך: `docs/email-notifications-setup.md`. צריך רק להחליף `re_REPLACE_WITH_YOUR_KEY` ולהריץ.
**חלופה מתקדמת:** Edge Function `supabase/functions/notify-lead/index.ts` (Deno + Resend, דורש CLI + Database Webhook). הליד נשמר ב-DB גם אם המייל נכשל.

## פיקסלים — ארכיטקטורת Tracking

### היכן מוטמעים
- `index.html` — Meta Pixel + GA4 script tags (חלים על כל ה-SPA)
- `Analytics.jsx` — SPA route tracker: מאזין לכל שינוי route ומעלה PageView + page_view

### Event Taxonomy
| עמוד / פעולה | Meta Pixel | GA4 |
|---|---|---|
| כל טעינה ראשונית | `PageView` (index.html) | `page_view` (gtag config) |
| כל ניווט SPA | `PageView` (Analytics.jsx) | `page_view` (Analytics.jsx) |
| כניסה ל-/ig | `ViewContent` (IgPage mount) | `view_item` |
| כפתור "לעשות Shift Up לעסק" | `Lead` | `generate_lead` |
| כפתור "להצטרף לקהילת Shift Up" | `Contact` | `join_group` |
| כפתור WhatsApp (CTA.jsx) | `Lead` | — |

## עמוד /freebies — ספריית פרומפטים חינמיים
- **מטרה:** עמוד נסתר לטראפיק מפוסטים ברשתות חברתיות — ספרייה של כלי AI חינמיים
- **עיצוב:** מינימליסטי, מובייל-פירסט, ללא navbar, ללא GSAP (מהירות)
- **ספריית פרומפטים:** מערך `PROMPTS` ב-`FreePage.jsx` — להוסיף אובייקט חדש לספרייה
- **כרטיסי פרומפטים:** copy-to-clipboard עם `navigator.clipboard` + fallback ל-iOS
- **Pixel Events:**
  - `ViewContent` + `view_item` — כניסה לדף
  - `Lead` + `generate_lead` — לחיצה על WhatsApp
  - `CompleteRegistration` + `copy_prompt` — לחיצה "העתק פרומפט"
- **UTM חובה:** כל קישור לדף מפוסטים חייב לכלול:
  `?utm_source=instagram&utm_medium=social&utm_campaign=freebies`
  בלי זה GA4 רואה את הכל כ-"direct"

## עמוד /ig — Link in Bio
- **מטרה:** עמוד נסתר לביו של אינסטגרם — צומת-טי קצרה ואפקטיבית
- **עיצוב:** מינימליסטי, 100% מובייל-פירסט, ללא navbar
- **כפתור 1:** "לעשות Shift Up לעסק" → WhatsApp עם הודעת פיצוח
- **כפתור 2:** "להצטרף לקהילת Shift Up" → קבוצת WhatsApp שקטה
- **Tracking:** ViewContent על כניסה, Lead/Contact על לחיצה

## AI Discovery — llms.txt + Markdown Mirrors
מטרה: לגרום ל-LLMs (ChatGPT/Claude/Perplexity) להמליץ על העסק ולקרוא את האתר נכון.
**כל הקבצים האלה ידניים ב-`public/` — לא נשאבים מ-Supabase.** אם משנים תוכן ב-`/admin`, צריך לעדכן אותם ידנית.
- `public/llms.txt` — מדריך AI ראשי (פורמט llmstxt.org): כותרת, blockquote סיכום (עברית+אנגלית), סעיפי שירותים/תהליך/קשר, ולינקים ל-markdown mirrors.
- **Markdown Mirrors** — גרסאות markdown נקיות (ללא JS/אנימציות) של הדפים: `public/index.md`, `public/faq.md`, `public/en.md`.
- `robots.txt` — שורת `LLM: .../llms.txt` (קונבנציה לא רשמית) + `Sitemap:`.
- **הגשה ב-Vercel:** ה-rewrite ב-`vercel.json` (`/((?!assets|.*\..*).*)`) מחריג כל נתיב עם נקודה, אז קבצי `.txt`/`.md` מוגשים סטטית — לא נחטפים ל-`index.html`.
- מקור התוכן: נשאב מהקומפוננטות (Hero/Process/WhyMe/About/FAQ) בזמן יצירה. בעדכון תוכן מהותי — לסנכרן.

## Email — הגיון
- **touch (מובייל):** `mailto:` פותח אפליקציית מייל
- **mouse (דסקטופ):** פותח Gmail compose
- זיהוי: `window.matchMedia('(pointer: coarse)')`

## צעדים הבאים (טרם בוצעו)
1. כתיבת מאמר בלוג ראשון ("איך לבחור משווק דיגיטלי")
2. עמודי שירות ייעודיים לכל שירות
3. עמוד Portfolio / Case Studies
4. Google Business Profile
5. לפני חידוש דומיין — העברה ל-Cloudflare Registrar (~$22/שנה)
6. הוספת UTM params לקישור ביו האינסטגרם (`?utm_source=instagram&utm_medium=social&utm_campaign=bio`)
7. (אופציונלי) ניהול CMS גם לטקסט השיווקי באנגלית — כרגע רק הקישורים מסונכרנים
8. ✅ ~~הוספת /testimonials ל-sitemap.xml~~ (בוצע 2026-06-19 — נוספו /testimonials + /freebies)

## פרויקט שדרוג דף הבית — אפיון (2026-06-24)
מסמכי מקור מלאים: `docs/landing-research.html` (מחקר+מתחרים) · `docs/landing-spec.html` (אפיון). נוצר בשיטת הסקיל `landing-page-research`.

**מטרה:** להפוך את דף הבית (`/`) מאתר-תדמית לדף-נחיתה-שממיר. פעולה אחת = ליד בשתי דלתות: **טופס (ראשי) + וואטסאפ (משני)**.

**קהל:** בעל עסק קטן/בינוני מבוסס ששורף תקציב פרסום בלי תוצאה — ובעיקר כזה שרוצה מקצוען שייקח ממנו את העול ויחזיר לו שקט.

**מסר מרכזי (Hero נעול):** "תחזור לנהל את העסק. את השיווק תשאיר לי." תת-כותרת: אסטרטגיה, קריאייטיב שמוכר וקמפיינים ממומנים — מפוצחים לפני ששורפים תקציב.

**מיצוב:** אדם אחד (לא סוכנות) + מסר לפני תקציב + מהירות AI. **לא** ממצבים על דיוור/הגדלת רשימה (זה רק מה שמתבצע ללקוח אחד כרגע).

**הוכחה (אין עדויות עדיין):** מוכרים שיטה+אדם, מציגים **קריאייטיב אמיתי** שיצר שמואל (פורטפוליו = סקשן 7), מורידים סיכון ("שיחת פיצוח חינם"), סלקטיביות כיתרון. לא ממציאים תוצאות.

**עובדות שנסגרו:**
- תמחור: עוגן "מתחיל מ-1,500 ₪" (1,500–2,000 הקמה · 1,000–1,500 ריטיינר, ללא תקציבי מדיה).
- scarcity: להציג "2–3 מקומות" (קיבולת אמיתית עד 5–7/רבעון, מוגבל בגלל שירות לאומי).
- מנגנון ליד: טבלת `leads` ב-Supabase + התראת מייל, צפייה ב-/admin (אין CRM). אירוע `Lead` (מטא+GA4) בשליחה.
- עיצוב: לשמר זהות כהה+ירוקה, כלל 60-30-10, ירוק רק על פעולה, Heebo. **סקשן הטופס על רקע בהיר.** פלטה: ירוק (CTA), סגול (הדגשה), **ציאן `oklch(0.65 0.22 200)` למעברי גרדיאנט/aurora** — לא ל-CTA.

**מבנה דף (משפך, 11 סקשנים):** Hero+2CTA → רצועת אמון/סלקטיביות → כאב → **מניפסט (האני מאמין)** → 3 שלבים → מה תקבל → למה אני לא סוכנות → הוכחה (קייסים+גריד) → אודות → FAQ → טופס+וואטסאפ+scarcity (+דלת שלישית רכה: **קבוצת וואטסאפ שקטה** ל-nurture). (המניפסט נשמר וממוקם אחרי הכאב; רק "מרקי" יורד.)

### 📊 התקדמות בנייה (עודכן 2026-06-25, סשן 3 — ✅ כל 11 הסקשנים בנויים)
- ✅ **סקשן 1 — Hero** (`Hero.jsx`): כותרת נעולה, 2CTA (טופס ראשי/וואטסאפ משני), עוגן מחיר 1,500₪, scarcity, trust chips, ציאן ב-aurora.
- ✅ **סקשן 2 — רצועת אמון** (`TrustStrip.jsx`): סלקטיביות (2–3 ברבעון) + זמינות חיה + שיחת היכרות חינם.
- ✅ **סקשן 3 — כאב** (`PainSection.jsx`): הוק "נמאס לרדוף..." + 4 כרטיסים + מעבר הקלה ירוק.
- ✅ **סקשן 4 — מניפסט** (`Manifesto.jsx`): הוזז למיקום הנכון — מיד אחרי הכאב ולפני 3 השלבים.
- ✅ **סקשן 5 — 3 שלבים** (`Process.jsx`): תוכן fallback פיצוח/שיפט/אקשן. **טעון סנכרון DB ↓**
- ✅ **סקשן 6 — "מה תקבל"** (`WhatYouGet.jsx`): hardcoded. "לידים ושקט" + 4 כרטיסי תוצאה + "תהיה שוב הבעלים".
- ✅ **סקשן 7 — למה אני לא סוכנות** (`WhyMe.jsx`): קיים, דינמי מ-`why_me_reasons`. fallback תואם spec (גישה יזמית / AI ראשון / לקוחות מצומצם / מסר לפני תקציב).
- ✅ **סקשן 8 — הוכחה** (`Proof.jsx`): חדש, hardcoded. 2 קייסים אסטרטגיים (קינוחי בוטיק אנונימי + City Transformer, מתויגים "דוגמת תהליך, לא טענת תוצאות") + גריד 9 מודעות (`public/portfolio/`) עם lightbox. id=`work`.
- ✅ **סקשן 9 — אודות** (`About.jsx`) · **סקשן 10 — FAQ** (`FAQ.jsx`): קיימים.
- ✅ **סקשן 11 — טופס לידים** (`LeadForm.jsx`): חדש. **רקע בהיר.** טופס ראשי (שם/טלפון/תחום/הודעה)→`supabase.from('leads').insert` + אירוע `Lead`/`generate_lead`. וואטסאפ משני + דלת שלישית רכה (מפנה ל-`WhatsAppGroup`). id=`contact` (יעד ה-CTA של Hero). **עמיד-לתקלות:** אם ה-insert נכשל (סכמה/RLS) → נופל לוואטסאפ עם פרטים ממולאים, הליד לא אובד.
- שינוי מבנה: `MarqueeSection`, `Stats`, **`TestimonialsPreview`, `CTA` נותקו מ-App** (קיימים על הדיסק; /testimonials עדיין חי). הסדר ב-`App.jsx` (תואם spec): Hero → TrustStrip → Pain → Manifesto → Process → WhatYouGet → WhyMe → **Proof** → About → FAQ → **LeadForm** → WhatsAppGroup → Footer.

### ✅ יישור כל הדפים למשפך + מיצוב (סשן 4 — 2026-06-28)
- **`/en` (`EnglishPage.jsx`) — נבנה מחדש 1:1 לדף הבית.** Hero חדש ("Get back to running your business. Leave the marketing to me" / "Strategy First. Budget Second." / עוגן מחיר / scarcity 2–3 spots / trust chips / CTA ראשי=טופס, משני=וואטסאפ). נוספו 5 סקשנים אנגליים (תרגום-ראי): TrustStrip, Pain, WhatYouGet, Proof (lightbox, id=`en-work`), **LeadForm** (רקע בהיר, insert ל-`leads` + נפילה לוואטסאפ, id=`en-contact`). נמחקו Marquee+Stats; מניפסט הוזז אחרי Pain. הסדר זהה ל-`App.jsx`. הטקסט האנגלי hardcoded (כמדיניות); רק קישורי `contact.*` מסונכרנים דרך `useSiteLinks`.
- **`/ig` + `/freebies` + `/testimonials`** — יושרו במסר ל"אדם אחד לא סוכנות · מסר לפני תקציב · מהירות AI · שיחת פיצוח חינם · 2–3 מקומות לרבעון". בלי המצאת תוצאות; `/testimonials` ממוסגר ככנה ("הבאים יהיו הראשונים").
- ⚠️ פתוח קל: כותרת `/testimonials` עדיין "מה אומרים הלקוחות" (הווה) בעוד הגוף עתידני — לסנכרן כשתגיע עדות ראשונה.

### ✅ תשתית DB — פעיל (הורץ 2026-06-25)
`docs/setup.sql` הורץ בהצלחה ב-Supabase: **כל הטבלאות חיות** (leads + 5 טבלאות CMS + שורות site_content), ו**התראת המייל פעילה** (טריגר pg_net→Resend, מפתח ב-Vault, נבדק ועובד). הלולאה סגורה: טופס → ליד ב-DB → מייל לשמואל → עריכה ב-/admin. **אין צורך להריץ SQL שוב** (idempotent ממילא).
- **גריד 2×2:** Pain + WhatYouGet עברו ל-class משותף `.grid-2x2` (1 עמ' מובייל / 2 עמ' דסקטופ) — תיקון ה-3+1 הלא מאוזן של `auto-fit`.
- **גריד פורטפוליו:** `food-shira-events.jpg` — ✅ הוחלף בגרסה המעודכנת (אותו שם קובץ, תוכן חדש). `health-24fit.png` הוא PNG (תקין).

### ⚠️ סנכרון DB פתוח — פיבוט המיצוב (16.07)
ה-fallback בקוד מעודכן למיצוב החדש, אבל **Supabase החי דורס אותו** (אומת מקומית: hero.subtitle, trust_pillars, why_me_reasons, faqs, leadform.* עדיין ישנים ב-DB).
**הפעולה:** להריץ את ⭐ **`docs/pivot-sync.sql`** פעם אחת ב-Supabase SQL Editor — מעדכן site_content + מחליף trust_pillars / why_me_reasons / process_steps / faqs לתוכן החדש. (idempotent; דורס עריכות ידניות ב-/admin בטבלאות האלה.)
- 💡 דפוס קבוע: כל שינוי מסר עתידי = לעדכן גם fallback בקוד וגם DB (קובץ sync או /admin). ה-DB תמיד מנצח.

**נכסי הוכחה לסקשן 7 (דו-שכבתי):**
- **קייסים אסטרטגיים (2)** — מוכיחים **חשיבה**. (א) **"עסק קינוחי בוטיק" — אנונימי** (flagship; פיבוט ישן של עסק אשתו שלא יצא לפועל, **מנותק מהשם שירה**; מיצוב "We don't sell cakes, we sell style"). (ב) **City Transformer** (טווח; פרויקט קורס). שניהם "דוגמת תהליך", בלי טענת תוצאות.
- **גריד ~18 מודעות** בכל תחום: קהילות קארד (×3), SHIRA (×2), La Fruit, יהודה סימן-טוב, Hili Nails, עמנואל צבע, ג'רמי אנגלית, DJ יאיר בהר, Real Estate, Ayelet Verker, סדנת אימהות, חיבו ממתקים, עו"ד סקלר, בס"ד זכויות רפואיות, 24fit. מוכיח **קריאייטיב+גיוון**.
- מצאי מלא + בחירה: `docs/portfolio-manifest.md`. קבצים ב-`public/portfolio/` ✅ (9 נבחרות בשמות נכונים).
- אישורי הצגה: **as-is** (מודעות שרצו בפומבי + עבודה עצמית). חריג: להוריד לקוח ספציפי רק אם יתנגד.
- קייסים: "עסק קינוחי בוטיק" אנונימי (flagship) + City Transformer (טווח) — מצגות ב-Downloads, לחתוך 4–6 מסכים מכל אחד.
- ✅ מודעת SHIRA בגריד: הוחלפה בגרסת קינוחי השבת המעודכנת (`food-shira-events.jpg`, אותו שם).
- ⚠️ לבנייה: לוודא ש-`retail-kehilot-card.jpg` = מודעת 5% (FABIO/BAGIR). הכל מוכן ל"מפגש בנייה".

**טרם נסגר:** איסוף הקריאייטיב לתיקייה, נוסח scarcity מדויק, ייצוא GA4/GSC לכיול.

## Deploy
```bash
npm run build   # בדיקה מקומית
git add .
git commit -m "תיאור"
git push        # Vercel מפרס אוטומטית
```

## לוג שינויים (עיקריים)
| תאריך | שינוי |
|--------|-------|
| 2026-08-26 | **עיצוב v2 — "de-AI" (מבוסס פידבק + מחקר נישה).** האתר נוקה מהלוק הגנרי של AI: פונטים = **Space Grotesk (לטינית, כמו הלוגו) + Rubik (עברית)** במקום Heebo; פינות חדות (`--radius: 3px`); הוסרו aurora/גרדיאנטים/זכוכית/glow/text-gradient/shimmer/photo-ring הסגול-ציאן (בלוק override גלובלי בתחתית `index.css`); אייקוני-קו גנריים → מוטיב הלוגו (מקבילית ירוקה `skewX`); לייבלים לעברית. **מיקוד CTA:** האבחון (`/audit`) הוא הפעולה הראשית (Hero + נאבבר), במקום 3 CTA; רצועת 3 שלבים בהירו (אבחון→ניתוח→תוצאות). **וריאציה:** "מה מקבלים" הפך לסקשן **בהיר** (נקודת נשימה אמצעית). **תוכן:** הקייסים המפוברקים הוסרו (Proof + /en) ונשאר פורטפוליו אמיתי; "נכווית" רוכך. **תנועה נשמרה** (הפחתת ריווח + הסרת נקודות מהבהבות; המניפסט תוקן מ-scrub לחשיפה חד-פעמית שנשארת קריאה). **/audit נהיה אינדקסבילי** (הוסר noindex, נוסף ל-sitemap, כפתור "חזרה לאתר"). ⚠️ שינויי טקסט צריכים `pivot-sync.sql` ב-Supabase (DB דורס); שינויי עיצוב חיים מיד. |
| 2026-08-26 | **תיקון canonical per-route (SPA) + חיזוק AI-discovery.** נוצר `src/components/Seo.jsx` (מנוהל ב-`main.jsx`, רץ על כל route): מעדכן במקום את התג היחיד של canonical / og:url / title / description / robots לפי הנתיב, בלי כפילויות (`/en` → canonical `/en`, `/login`+`/admin`+`/ig`+`/audit` → noindex). **לא נעשה שימוש ב-react-helmet** (peer-conflict עם React 19); הגישה האימפרטיבית עדיפה כי היא שומרת על תגי ה-OG הסטטיים (חשוב לתצוגה בוואטסאפ/פייסבוק שלא מריצים JS). בנוסף: hint `<link rel="alternate" type="text/markdown">` שמצביע ל-mirror הנכון (index.md/en.md) פר-route, ו-/audit נוסף ל-llms.txt. אומת בדפדפן על /, /en, /login, /privacy. |
| 2026-08-26 | **Voice pass על כל הקופי (skills: shmuel-voice + creative-copy-playbook).** כל הטקסט מול-אדם בכל העמודים (/, /en, /ig, /freebies, /testimonials, /audit, נגישות, פרטיות) + index.html (meta/OG/Twitter/JSON-LD/pre-render) + מירורי AI-discovery (llms.txt, index.md, en.md, faq.md) נוקו מ**מקפים ארוכים (—)**, מדפוס "לא רק X אלא Y" וממרכאות מסולסלות, לפי הקול של שמואל. **`docs/pivot-sync.sql` עודכן לניסוח החדש + הורחב** (נוספו pain_points, outcomes, proof_cases, ומפתחות site_content של pain./wyg./proof.) — ⚠️ **להריץ שוב ב-Supabase** כי ה-DB החי עדיין מציג את הניסוח עם המקפים (אומת בדפדפן: hero.subtitle, trust_pillars, pain.title, wyg.subtitle וכו' עדיין ישנים ב-DB). SEO: sitemap lastmod → 2026-08-26. build נקי. |
| 2026-07-16 | **פיבוט המיצוב הוטמע באתר** (מקור: וולט, סשנים 14–15.07): כל הדפים (/, /en, /ig, /freebies, /testimonials) + SEO/Schema + AI-discovery (llms.txt, index.md, en.md, faq.md) עברו ל"קמפיינים מבוססי-מחקר + הבטחת ביצוע". Kill-words הוסרו. תהליך: הפיצוח→**המחקר**. FAQ: +"כמה זה עולה?" +"כבר נכוויתי". נוצר `docs/pivot-sync.sql`. **תיקון המשך (באותו יום):** הוסרו כל המחירים מהאתר (החלטת שמואל — מחיר נסגר בשיחה בלבד) + ניסוח ההבטחה דויק ל"לא חודש חינם — אם אין פניות בחודש הראשון, ממשיך לנהל בחינם עד שיש". ⚠️ pivot-sync.sql עודכן — **להריץ שוב ב-Supabase** (הריצה הראשונה הכניסה גרסה עם מחירים). |
| 2026-07-07 | **בניית המשפך המלא + CMS מלא + לולאת לידים.** נבנו WhatYouGet(6)/Proof(8)/LeadForm(11), מניפסט הוזז ל-4, גריד 2×2. טבלת `leads` + טאב לידים + התראת מייל (pg_net→Resend, Vault) ב-`docs/setup.sql` — **הורץ, המייל עובד**. CMS מלא: 5 טבלאות חדשות + `useContent()` + 5 טאבי admin. שדרוג UI/UX לאדמין. הכל fallback-first, חי בפרודקשן. |
| 2026-06-28 | **AI Discovery + SEO — רענון למיצוב החדש** (סקילים `ai-discovery-setup` + `hebrew-seo-geo-toolkit`): `llms.txt`/`index.md`/`en.md` נכתבו מחדש למסר "תחזור לנהל את העסק" + מחיר/scarcity/קריאייטיב. `index.html`: title/description/OG/Twitter חדשים, `hreflang he→he-IL`, Schema מורחב (slogan, `makesOffer` ILS, שעות א׳–ה׳ 08:00–17:00, `speakable`, `knowsAbout`). `robots.txt`: allow מפורש לבוטי AI (OAI-SearchBot/PerplexityBot/ClaudeBot…). `sitemap.xml`: lastmod 2026-06-28. JSON-LD אומת (3/3). |
| 2026-06-28 | **יישור כל הדפים למשפך — סשן 4** (3 סוכנים מקבילים): `/en` נבנה מחדש 1:1 לדף הבית (Hero חדש + TrustStrip/Pain/WhatYouGet/Proof/LeadForm אנגליים, Marquee+Stats נמחקו). `/ig`+`/freebies`+`/testimonials` יושרו במסר למיצוב הנעול. תמונת SHIRA המעודכנת אומתה. build נקי. |
| 2026-06-24 | **בניית משפך — סשן 2** (commits `4788793`,`775a85d`): Hero מחדש (2CTA טופס/וואטסאפ, עוגן מחיר, scarcity), `TrustStrip.jsx` (סקשן 2), `PainSection.jsx` (סקשן 3), `Process.jsx` שמות שלבים לפי spec. Marquee+Stats נותקו. ⚠️ טעון סנכרון DB ב-/admin (subtitle + שלבים). |
| 2026-06-24 | **אפיון שדרוג דף הבית** — מחקר+מתחרים (`docs/landing-research.html`) + אפיון דף-נחיתה (`docs/landing-spec.html`) בשיטת סקיל `landing-page-research`. Hero נעול, מבנה 10 סקשנים, מנגנון ליד Supabase. |
| 2026-06-19 | **AI Discovery** — `llms.txt` + markdown mirrors (index/faq/en) ב-`public/`, שורת `LLM:` ב-robots.txt, sitemap הורחב (+/testimonials +/freebies) |
| 2026-06-14 | **CMS מלא דרך Supabase** — כל הקומפוננטות דינמיות, עמוד עדויות /testimonials + הצצה בדף הבית, /admin עם 8 טאבים, useSiteLinks לסנכרון עברית↔אנגלית |
| 2026-06-03 | תמונת פרופיל חדשה (shmuel.png), עיצוב About משודרג (טבעת, float, scan), עמוד /ig, Analytics.jsx, אופטימיזציה פיקסלים |
| 2026-05-29 | שיפורי UI/UX — scroll progress, navbar active, footer redesign |
| 2026-05-29 | הסרת אוטומציות AI מ-FAQ ומהמטא |
