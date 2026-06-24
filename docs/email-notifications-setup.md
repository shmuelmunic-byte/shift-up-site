# התראת מייל על ליד חדש — הגדרה (פעם אחת)

כשמישהו ממלא את הטופס באתר → נכנס ל-`leads` ב-Supabase → **Database Webhook** מפעיל את ה-Edge Function `notify-lead` → נשלח לך מייל דרך **Resend**.

> דרישה מוקדמת: כבר הרצת את `docs/leads-table.sql` (טבלת `leads` קיימת).

---

## שלב 1 — חשבון Resend + API key
1. הירשם בחינם ב-[resend.com](https://resend.com) (3,000 מיילים/חודש בחינם).
2. **API Keys** → **Create API Key** → העתק (`re_...`).
3. בלי לאמת דומיין אפשר לשלוח **רק לכתובת שאיתה נרשמת** מהכתובת `onboarding@resend.dev`. זה מספיק כי המייל נשלח אליך (`shmuelmunic@gmail.com`).
   - בהמשך, לשליחה מ-`leads@shiftup.marketing` — לאמת דומיין ב-Resend (Domains → Add).

## שלב 2 — לפרוס את ה-Function
דורש [Supabase CLI](https://supabase.com/docs/guides/cli) (פעם אחת):
```bash
npm i -g supabase
supabase login
supabase link --project-ref fsqstwlapiiqbnyjjzqx
supabase functions deploy notify-lead --no-verify-jwt
```
`--no-verify-jwt` חשוב — מאפשר ל-webhook לקרוא לפונקציה בלי JWT של משתמש.

## שלב 3 — להגדיר סודות (secrets)
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set NOTIFY_TO=shmuelmunic@gmail.com
supabase secrets set WEBHOOK_SECRET=בחר-מחרוזת-אקראית-חזקה
```
- `WEBHOOK_SECRET` אופציונלי אך מומלץ (מונע קריאות זרות). אם הגדרת — תצטרך אותו בשלב 4.
- `NOTIFY_FROM` (אופציונלי) — ברירת מחדל `Shift Up Leads <onboarding@resend.dev>`.

> אפשר גם דרך הדשבורד: **Edge Functions → notify-lead → Secrets**.

## שלב 4 — Database Webhook
Supabase Dashboard → **Database → Webhooks → Create a new hook**:
- **Name:** `notify-lead`
- **Table:** `leads` · **Events:** ✅ Insert בלבד
- **Type:** Supabase Edge Functions → **Edge Function:** `notify-lead`
  (או HTTP Request → POST לכתובת `https://fsqstwlapiiqbnyjjzqx.supabase.co/functions/v1/notify-lead`)
- **HTTP Headers:** אם הגדרת `WEBHOOK_SECRET` — הוסף header:
  `x-webhook-secret` = אותה מחרוזת שבחרת.
- שמור.

## שלב 5 — בדיקה
1. מלא את הטופס באתר עם הפרטים שלך.
2. אמור להגיע מייל "📥 ליד חדש" תוך שניות.
3. אם לא — Supabase → **Edge Functions → notify-lead → Logs** לראות שגיאה (לרוב `RESEND_API_KEY` חסר או `from` לא מאומת).

---

### בעיות נפוצות
| תסמין | סיבה | פתרון |
|------|------|-------|
| אין מייל, אין לוג | ה-webhook לא נורה | לבדוק ש-Events=Insert וש-Table=`leads` |
| לוג: `missing RESEND_API_KEY` | secret לא הוגדר | `supabase secrets set RESEND_API_KEY=...` ולפרוס שוב |
| לוג: `resend failed` 403/422 | `from` לא מאומת או `to` ≠ כתובת החשבון | להשתמש ב-`onboarding@resend.dev` ולשלוח לכתובת שלך, או לאמת דומיין |
| 403 forbidden | `WEBHOOK_SECRET` לא תואם | לוודא שה-header ב-webhook זהה ל-secret |

> הקוד: `supabase/functions/notify-lead/index.ts`. הליד נשמר ב-DB גם אם המייל נכשל — ההתראה היא תוספת, לא תנאי.
