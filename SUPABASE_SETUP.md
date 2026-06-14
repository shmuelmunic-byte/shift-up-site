# הגדרת Supabase — ממשק ניהול Shift Up

## שלב 1 — יצירת פרויקט

1. כנס ל-[supabase.com](https://supabase.com) וצור חשבון חינמי
2. לחץ **"New Project"**
3. שם: `shift-up-cms`
4. Region: **Central EU (Frankfurt)** — הכי קרוב לישראל
5. בחר סיסמה חזקה (שמור אותה)
6. המתן ~2 דקות לסיום ההקמה

---

## שלב 2 — יצירת טבלאות

בלוח Supabase: **SQL Editor → New Query** — הדבק את הכל ולחץ **Run**:

```sql
-- טבלת פרומפטים
create table prompts (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  subtitle      text not null,
  tag           text not null,
  body          text not null,
  resource_url  text,
  resource_type text,
  resource_label text,
  position      int  not null default 0,
  created_at    timestamptz default now()
);

alter table prompts enable row level security;
create policy "public read" on prompts for select using (true);
create policy "auth write"  on prompts for all    using (auth.role() = 'authenticated');

-- טבלת כפתורי /ig
create table ig_links (
  id       uuid primary key default gen_random_uuid(),
  label    text not null,
  href     text not null,
  style    text not null default 'primary',
  position int  not null default 0
);

alter table ig_links enable row level security;
create policy "public read" on ig_links for select using (true);
create policy "auth write"  on ig_links for all    using (auth.role() = 'authenticated');

-- נתוני ברירת מחדל — פרומפטים קיימים
insert into prompts (slug, title, subtitle, tag, body, position) values
(
  'brand-hijack',
  'חטיפת מותג — Trigger Marketing',
  'השתלטות על הרגלי הקהל שלך — בחינם',
  'שיווק פסיכולוגי',
  E'אתה פועל כפסיכולוג התנהגותי ואסטרטג שיווקי מוביל.\n\nהעסק שלי: [תאר את העסק שלך — מה אתה עושה ולמי]\nקהל היעד שלי: [תאר בפירוט — גיל, עיסוק, כאב עיקרי, חלום עיקרי]\n\nשלב 1 — מיפוי טריגרים:\nזהה 5 דברים ספציפיים שהקהל שלי נתקל בהם כל יום — הרגלים, חפצים, מקומות, מילים או חוויות שחוזרים ברמה יומיומית. חשוב: הדברים צריכים להיות קונקרטיים וספציפיים לקהל הזה, לא גנריים.\n\nשלב 2 — השתלטות יצירתית:\nלכל טריגר, הצע שיטה חינמית, מעשית ויצירתית שבה אוכל לקשר אותו למותג שלי — כך שבכל פעם שהם נתקלים בו, הם חושבים עליי אוטומטית.\n\nהגבלות: ללא פרסום בתשלום. ללא כלים יקרים. רק יצירתיות, נוכחות וחיבור רגשי.\n\nפורמט הפלט:\nלכל טריגר (1–5):\n🎯 הטריגר: [שם ותיאור קצר]\n💡 ההשתלטות: [הפעולה הספציפית שתעשה]\n🔗 הקשר למותג: [למה זה ייצור אסוציאציה חזקה]\n⚡ קשיי יישום: [מה הכי חשוב לשים לב אליו]\n\nבסוף — כתוב 1-2 משפטים על למה הטריגר החזק ביותר הוא _________ עבור הקהל הספציפי הזה.',
  0
),
(
  'content-multiplier',
  'מכפיל התוכן',
  '5 פוסטים מרעיון אחד',
  'תוכן ורשתות חברתיות',
  E'אתה קופירייטר ויוצר תוכן מקצועי.\nאני בעל עסק בתחום [התחום שלך] וכתבתי בעבר פוסט/נתתי תשובה ללקוח על הנושא הבא:\n[העתיקו כאן את הפוסט המקורי שלכם / תארו את הנושא במשפט]\n\nאני רוצה שתציע לי 5 זוויות תוכן שונות לגמרי על אותו נושא בדיוק.\nכל זווית צריכה להרגיש כמו פוסט חדש לחלוטין, אבל לשבת על אותה תובנה מרכזית.\n\nהזוויות האפשריות:\n1. סיפור אישי – מקרה שקרה לי שממחיש את הנקודה\n2. טעות נפוצה – מה אנשים עושים לא נכון בנושא הזה\n3. שאלה שלקוח שאל – איך לגשת לנושא דרך שאלה אמיתית\n4. השוואה – שתי גישות שונות לאותו נושא, מה עובד יותר\n5. מה למדתי בדרך הקשה – תובנה שהבנתי רק אחרי שטעיתי\n\nהצג את הזוויות כרשימה ממוספרת, עם משפט הסבר קצר לכל אחת',
  1
);

-- נתוני ברירת מחדל — כפתורי /ig
insert into ig_links (label, href, style, position) values
(
  'לעשות Shift Up לעסק',
  'https://wa.me/972534673151?text=%D7%94%D7%99%D7%99%20%D7%A9%D7%9E%D7%95%D7%90%D7%9C%2C%20%D7%A8%D7%90%D7%99%D7%AA%D7%99%20%D7%90%D7%95%D7%AA%D7%9A%20%D7%91%D7%90%D7%99%D7%A0%D7%A1%D7%98%D7%92%D7%A8%D7%9D%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A7%D7%91%D7%95%D7%A2%20%D7%A9%D7%99%D7%97%D7%AA%20%D7%A4%D7%99%D7%A6%D7%95%D7%97%20%D7%9C%D7%A2%D7%A1%D7%A7%20%D7%A9%D7%9C%D7%99',
  'primary',
  0
),
(
  'להצטרף לקהילת Shift Up',
  'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3',
  'secondary',
  1
);
```

---

## שלב 3 — יצירת משתמש Admin

1. בלוח Supabase: **Authentication → Users**
2. לחץ **"Add User" → "Create New User"**
3. Email: `shmuelmunic@gmail.com`
4. Password: בחר סיסמה חזקה (לפחות 8 תווים)
5. לחץ **"Create User"**

---

## שלב 4 — קבלת מפתחות API

1. בלוח Supabase: **Settings → API**
2. העתק את:
   - **Project URL** (נראה כך: `https://xxxxx.supabase.co`)
   - **anon / public key** (המפתח הארוך)

---

## שלב 5 — הגדרת משתני סביבה

### מקומי (לפיתוח)
ערוך את הקובץ `.env` בתיקיית הפרויקט:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel (לייצור)
1. כנס ל-[vercel.com](https://vercel.com) → הפרויקט שלך
2. **Settings → Environment Variables**
3. הוסף שני משתנים:
   - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJ...`
4. לחץ **"Redeploy"** בלשונית Deployments

---

## שלב 6 — גישה לממשק הניהול

לאחר deploy מוצלח:
- **כתובת ניהול:** https://www.shiftup.marketing/admin
- **לוגין:** https://www.shiftup.marketing/login
- הכנס עם האימייל והסיסמה שיצרת בשלב 3

---

## מה ניתן לנהל

| Tab | מה עושים |
|-----|----------|
| 📚 פרומפטים | הוספה / עריכה / מחיקה / סידור פרומפטים בעמוד /freebies |
| 🔗 כפתורי /ig | שינוי טקסט וקישורים של הכפתורים בעמוד /ig |

### שדות פרומפט
- **Slug** — מזהה ייחודי (אותיות קטנות + מקפים, ללא רווחים)
- **כותרת** — הכותרת הגדולה על הכרטיס
- **תת-כותרת** — הטקסט הירוק מתחת לכותרת
- **תגית** — הקטגוריה (מופיעה כ-chip)
- **גוף הפרומפט** — הטקסט המלא (תומך ב-[פלייסהולדרים] שמסומנים בירוק)
- **משאב** (אופציונלי) — קישור לקובץ PDF / סרטון / לינק + טקסט הכפתור
