import { createClient } from '@supabase/supabase-js';

/* למה פרוקסי ולא קריאה ישירה ל-supabase.co:
   בסינון החרדי (נטפרי, רימון, אתרוג, נטספארק וכו') דומיין חיצוני כמו
   supabase.co נחסם גם כשהאתר עצמו כבר אושר - הדף נפתח אבל שליחת השאלון
   נכשלת בשקט. לכן בדפדפן אנחנו קוראים ל-Supabase דרך פרוקסי תחת אותו
   דומיין (/sb), שמוגדר ב-vercel.json / netlify.toml / vite.config.js.
   כך נשאר דומיין אחד יחיד לאשר בכל חברת סינון, והשאלון עובד גם באתרים
   שכבר אושרו בלי בקשה נוספת. */
const PROXY_PATH = '/sb';

const supabaseUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}${PROXY_PATH}` // בדפדפן: אותו דומיין (עוקף סינון)
    : import.meta.env.VITE_SUPABASE_URL;        // בבנייה/סביבה ללא window: ישיר

export const supabase = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY);
