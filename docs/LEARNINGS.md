# LEARNINGS — סשן AI Discovery (2026-06-19)

## מה בנינו
שכבת **AI Discovery** לאתר Shift Up — לגרום ל-LLMs (ChatGPT/Claude/Perplexity) למצוא, להבין ולהמליץ על העסק:
- `public/llms.txt` — מדריך AI ראשי (פורמט llmstxt.org), דו-לשוני עברית+אנגלית.
- 3 **Markdown Mirrors** — גרסאות markdown נקיות של הדפים: `index.md`, `faq.md`, `en.md`.
- `robots.txt` — נוספה שורת `LLM:` שמכוונת קראולרים ל-llms.txt.
- `sitemap.xml` — שוכתב: נוספו `/testimonials` + `/freebies`, עודכן lastmod, הוסר changefreq (Google מתעלם ממנו מ-2023).
- תיעוד מלא ב-CLAUDE.md + לוג שינויים.
- הבהרה ב-CLAUDE.md: דוח GSC "Page with redirect" הוא צפוי, לא תקלה.

## טכניקות Claude Code שהשתמשנו בהן
- **חילוץ תוכן אמיתי מהקוד** — את ה-markdown mirrors בניתי מהטקסט האמיתי בקומפוננטות (Hero/Process/WhyMe/FAQ/About), לא המצאתי. ככה התוכן מדויק.
- **אימות הנחה לפני פעולה** — לפני יצירת קבצי .txt/.md בדקתי ש-`vercel.json` (rewrite עם החרגת נקודה) באמת יגיש אותם סטטית ולא יחטוף ל-index.html.
- **הרשאת deploy מפורשת** — ה-classifier חסם merge ל-main כי הוא מפעיל deploy לפרודקשן; נדרשה הסכמה מפורשת שלך לפני המיזוג.
- **/compact** באמצע הסשן לפינוי הקשר.

## מה עבד טוב
- Fallback-first בכל הקומפוננטות — האתר עמיד גם אם Supabase נופל.
- תיעוד מיידי אחרי כל שינוי משמעותי ב-CLAUDE.md → הידע לא הולך לאיבוד בין סשנים.

## מה פחות עבד / לשים לב בפעם הבאה
- **`gh` לא מותקן** במחשב — נאלצנו לעקוף עם git רגיל במקום GitHub PR flow. שווה להתקין: `winget install GitHub.cli`.
- **הודעות commit עם מירכאות כפולות** שברו את ה-parsing ב-PowerShell. הפתרון: `-m` עם גרש בודד (`'...'`), או `-m` נפרד לכל שורה.

## מה הייתי עושה אחרת
- מתקין `gh` מראש כדי לעבוד עם PRs נקיים (review, היסטוריה).
- מגדיר Domain property ב-GSC מההתחלה — מונע את דוחות ה-redirect המבלבלים.

## Skills ששווה לשמור
- **"AI Discovery setup"** — skill שמייצר llms.txt + markdown mirrors מתוך קומפוננטות אתר. תהליך חוזר שיעבוד על כל אתר עתידי. שווה להכין פעם אחת.
- **"Sitemap optimizer"** — בדיקה+תיקון של sitemap.xml לפי best practices עדכניים (lastmod, hreflang, בלי changefreq).

## צעדים שנותרו לך (צד משתמש)
1. להגיש מחדש את sitemap.xml ב-Google Search Console.
2. בעוד כמה ימים — לבדוק LLMs: לשאול ChatGPT/Claude "מי זה שמואל מוניץ Shift Up?".
3. (אופציונלי) להחליף ל-Domain property ב-GSC.
