# Shift Up — Project Memory for Claude

## מה הפרויקט
אתר נחיתה שיווקי מקצועי עבור **שמואל מוניץ** — אסטרטג שיווק דיגיטלי ומומחה AI.

## כתובות
- **דומיין ראשי:** https://www.shiftup.marketing
- **Vercel URL (גיבוי):** https://shift-up-site.vercel.app
- **GitHub:** https://github.com/shmuelmunic-byte/shift-up-site
- **דף אנגלי:** https://www.shiftup.marketing/en

## סטאק טכנולוגי
- React 19 + Vite 7
- GSAP 3 + ScrollTrigger (אנימציות)
- Lenis (smooth scroll)
- react-router-dom v7 (ניתוב)
- Tailwind CSS (כלי עזר)
- Heebo font (Google Fonts) — RTL עברי

## מבנה הפרויקט

```
shift-up-site/
├── index.html              ← Meta tags, Schema JSON-LD, GA, Meta Pixel
├── vercel.json             ← SPA rewrite rule
├── public/
│   ├── logo.png            ← לוגו ראשי (Shift Up)
│   ├── favicon.png         ← פאביקון מותאם אישית
│   ├── favicon.svg         ← פאביקון SVG (גיבוי)
│   ├── 1000900908.jpg      ← תמונת פרופיל שמואל
│   ├── robots.txt          ← Allow all + sitemap
│   └── sitemap.xml         ← / + /en עם hreflang
└── src/
    ├── main.jsx            ← BrowserRouter + Routes
    ├── App.jsx             ← דף עברי ראשי
    ├── index.css           ← Design system + animations
    ├── pages/
    │   └── EnglishPage.jsx ← דף אנגלי מלא (self-contained)
    └── components/
        ├── Navbar.jsx      ← ניווט עברי + כפתור EN
        ├── Hero.jsx        ← Hero section
        ├── MarqueeSection.jsx
        ├── Stats.jsx       ← סטטיסטיקות + badge זמינות
        ├── Process.jsx     ← 3 שלבים: הפיצוח / האסטרטגיה / הביצוע
        ├── WhyMe.jsx       ← 4 כרטיסים
        ├── Manifesto.jsx
        ├── About.jsx       ← תמונת פרופיל + טקסט
        ├── FAQ.jsx         ← 6 שאלות עם typewriter effect
        ├── CTA.jsx
        ├── Footer.jsx      ← 5 אייקוני סושיאל
        └── Cursor.jsx      ← Custom cursor
```

## ניתוב (Routes)
```jsx
/ → App.jsx (עברית, RTL)
/en → EnglishPage.jsx (אנגלית, LTR)
```
הדף האנגלי פותח באותו טאב (לא `target="_blank"`).

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
`08:00–17:00` שעון ישראל (`Asia/Jerusalem`) — מוגדר ב-`Stats.jsx`

## דומיין ו-DNS
- **רשם:** Porkbun ($6/שנה ראשונה, $34 חידוש — לפני חידוש לעבור ל-Cloudflare Registrar)
- **DNS Records ב-Porkbun:**
  - A record: `@` → `76.76.21.21` (Vercel)
  - CNAME: `www` → `cname.vercel-dns.com`
- **Vercel:** redirect מ-`shiftup.marketing` ל-`www.shiftup.marketing`

## SEO — מה קיים
- `robots.txt` + `sitemap.xml` (כולל /en עם hreflang)
- Canonical: `https://www.shiftup.marketing/`
- hreflang: he / en / x-default
- Schema JSON-LD: FAQPage + Person + ProfessionalService
- Google Search Console: מחובר, sitemap הוגש
- OG image: `https://www.shiftup.marketing/1000900908.jpg`

## לוגו וגדלים
- לוגו בנאבר: `clamp(64px, 14vw, 120px)` — רספונסיבי
- לוגו בפוטר: `110px`
- פאביקון: `favicon.png` (512x512)

## אנימציות חשובות
- `hue-drift` — על הלוגו (8s)
- `blob-drift` — fluid blobs ברקע
- `marquee-rtl` — מרקי עברי (33.333%)
- `marquee-ltr` — מרקי אנגלי (-33.333%)
- GSAP ScrollTrigger — כל הסקשנים
- `translate="no"` על h1 ו-Manifesto (מונע שבירת אנימציות)

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

## Deploy
```bash
npm run build   # בדיקה מקומית
git add .
git commit -m "תיאור"
git push        # Vercel מפרס אוטומטית
```
