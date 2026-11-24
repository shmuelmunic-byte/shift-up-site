import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { nd } from '../content/heroCopy';

const FALLBACK_FAQS = [
  { q: 'למה לשלם על תוכנית, אם אפשר פשוט להעלות קמפיין?', a: 'כי קמפיין בלי תוכנית הוא ניסוי על חשבונך, והתוכנית אומרת מראש למי מפרסמים, מה אומרים ומה נחשב הצלחה, ועליה אני מקים את הקמפיין' },
  { q: 'אפשר לקנות רק את התוכנית?', a: 'כן, אפשר לקנות רק את התוכנית ולהחליט אחר כך, ואת ההקמה והניהול אני בונה רק על תוכנית' },
  { q: 'ואם הקמפיין לא מביא פניות?', a: 'אם בחודש הניהול הראשון אין פניות, אני מנהל חודש נוסף בחינם, ואם גם אז אין, אני אומר לך את זה ועוצרים, וההבטחה חלה על הניהול ולא על התוכנית' },
  { q: 'כמה זה עולה?', a: 'מחיר קבוע וסגור לכל שלב, שנקבע בשיחת ההיכרות לפי היקף העבודה, וההשקעה בפרסום נפרדת, ככה שתדע בדיוק כמה לפני שמתחילים' },
  { q: 'כמה זמן זה לוקח?', a: 'התוכנית מוכנה בערך שבוע אחרי פגישת העומק, והקמפיין עולה בערך שבועיים אחרי שאישרת אותה' },
  { q: 'של מי התוכנית?', a: 'שלך, וגם אם תחליט לא להמשיך איתי היא נשארת אצלך' },
  { q: 'מה אני צריך להכין לפגישת העומק?', a: 'את המספרים של העסק, ואם אפשר צילומי מסך משיחות עם לקוחות, כי משם מגיע המסר' },
  { q: 'כבר נכוויתי מספק קודם, למה שהפעם יהיה שונה?', a: 'כי הפעם מתחילים בתוכנית ולא בקמפיין, אז אתה רואה על מה כל החלטה נשענת לפני שנכנס שקל, ובניהול הסיכון של החודש הראשון עליי' },
  { q: 'מה קורה אחרי שאני משאיר פרטים?', a: 'אני חוזר אליך לשיחת היכרות של חצי שעה, שבה נבין מה העסק שלך צריך, נחשב כמה שווה לך לקוח אחד, ותצא ממנה עם מחיר סגור' },
];

/* ── שאלות: Accordion לפי shadcn (Pally P11), בלי מעטפת כרטיס ──
   נבנה על <details>/<summary>: מקלדת, קורא מסך ו"חיפוש בעמוד" עובדים בלי JS.
   לא בלעדי (אפשר לפתוח כמה), אנימציית גובה רק בלי prefers-reduced-motion. */
export default function FAQ() {
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);

  useEffect(() => {
    supabase.from('faqs').select('*').order('position')
      .then(({ data }) => {
        if (data?.length) setFaqs(data.map(r => ({ q: r.question, a: r.answer })));
      });
  }, []);

  return (
    <section id="faq" className="c-sec c-light" aria-labelledby="faq-h">
      <div className="c-wrap c-faq">
        <div className="c-faq__head">
          <div className="c-lbl">שאלות ותשובות</div>
          <h2 id="faq-h" className="c-h2">שאלות נפוצות</h2>
          <p className="c-faq__note">
            שאלה שלא מופיעה כאן?{' '}
            <a href="https://wa.me/972534673151" target="_blank" rel="noopener noreferrer">שלח הודעה</a>{' '}
            ואחזור אליך מהר
          </p>
        </div>

        <div className="c-acc">
          {faqs.map((item, i) => (
            <details key={i} className="c-acc__item">
              <summary>{item.q}</summary>
              <div className="c-acc__a"><p>{nd(item.a)}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
