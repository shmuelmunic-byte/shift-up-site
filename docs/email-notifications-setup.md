# הגדרת הכל בהרצה אחת — `docs/setup.sql`

קובץ אחד שמקים את **טבלת הלידים + כל ה-CMS + התראת המייל**. הכל ב-SQL — בלי CLI, בלי Edge Functions, בלי webhooks בדשבורד.

## שלב 1 — מפתח Resend (למייל)
1. הירשם בחינם ב-[resend.com](https://resend.com) (3,000 מיילים/חודש).
2. **API Keys → Create API Key** → העתק (`re_...`).
3. בלי אימות דומיין שולחים מ-`onboarding@resend.dev` רק לכתובת שאיתה נרשמת — מספיק, כי המייל נשלח אליך.

## שלב 2 — להריץ את ה-SQL
1. פתח את `docs/setup.sql`.
2. מצא ב-**PART 3** את השורה `re_REPLACE_WITH_YOUR_KEY` והחלף במפתח שלך.
   - רוצה כתובת יעד אחרת? שנה את `shmuelmunic@gmail.com` שם.
3. Supabase Dashboard → **SQL Editor → New query** → הדבק את **כל** הקובץ → **Run**.
4. בטוח להריץ שוב (idempotent) — לא מוחק נתונים.

## שלב 3 — בדיקה
- בסוף PART 3 יש שורת בדיקה בהערה. הסר את `--` והרץ אותה בלבד → אמור להגיע מייל "📥 ליד חדש".
- או פשוט מלא את הטופס באתר עם הפרטים שלך.

זהו. מאותו רגע כל ליד מהטופס → נשמר ב-`leads` → מייל אליך + צפייה ב-`/admin`.

---

### איך זה עובד (טכני)
טריגר `after insert` על `leads` קורא ל-`net.http_post` (תוסף `pg_net`) ששולח ל-Resend API. המפתח שמור ב-**Supabase Vault** (לא חשוף בקוד). הליד נשמר ב-DB גם אם המייל נכשל — ההתראה היא תוספת, לא תנאי.

### בעיות נפוצות
| תסמין | פתרון |
|------|-------|
| אין מייל | לוודא שהחלפת את `re_REPLACE_WITH_YOUR_KEY` ושהרצת מחדש את PART 3 |
| `permission denied for schema vault` | להריץ כ-owner (ה-SQL Editor של הדשבורד רץ כ-postgres — תקין) |
| המייל ב-spam | לאמת דומיין ב-Resend (Domains) ולשלוח מ-`leads@shiftup.marketing` |
| לראות שגיאות שליחה | `select * from net._http_response order by created desc limit 5;` |

### חלופה מתקדמת — Edge Function
מי שמעדיף Edge Function (במקום pg_net): הקוד קיים ב-`supabase/functions/notify-lead/index.ts`. דורש Supabase CLI + Database Webhook. רוב המשתמשים לא צריכים — `setup.sql` פשוט יותר.
