/* ── "התוכנית" (25.11.2026, סבב 2): המוצר המרכזי, במקום "מה מקבלים" ──
   קופי: מיצוב_תוכנית_קודם.md, סעיף 3.4, מילה במילה.
   ההמחשה: התוכנית כחפץ, עמודי PDF מוערמים (Pally P11), ב-CSS. כשיהיו עמודים אמיתיים,
   מחליפים את .c-plan__page בתמונות. על העמוד העליון: לוגו ותוכן עניינים כללי (שמות הפרקים), בלי שם של עסק.

   גנרי: items = כל מספר פרקים. props גוברים על ה-fallback כאן. */
import { nd } from '../content/heroCopy';

const PLAN = {
  label: 'התוכנית',
  title: 'מה יש בתוכנית שלך',
  titleAccent: 'פרק אחרי פרק',
  lead: 'תוכנית כתובה ומעוצבת שנבנית על העסק שלך, ואני מציג לך אותה בפגישה',
  items: [
    { title: 'העסק היום', text: 'איפה אתה עומד ולאן אתה רוצה להגיע, במספרים' },
    { title: 'מה הלקוחות שלך אומרים', text: 'ציטוטים אמיתיים מהשיחות ומהוואטסאפ שלך עם לקוחות, ומה חוזר בהם' },
    { title: 'מי הלקוח שלך', text: 'מה מרגש אותו, מה מפחיד אותו ומה הוא כבר ניסה' },
    { title: 'השוק', text: 'מי עוד מפרסם, מה כולם אומרים, ואיפה יש מקום פנוי' },
    { title: 'האסטרטגיה', text: 'למי מפרסמים, המשפט שלך והמסר' },
    { title: 'המודעות', text: 'שלושה כיוונים, ודוגמת מודעה לכל אחד' },
    { title: 'הדרך של הלקוח', text: 'מהמודעה ועד העסקה, ואיפה אנשים נופלים בדרך' },
    { title: 'החשבון', text: 'כמה שווה לך לקוח, כמה נכון להשקיע ואיך נדע שזה עובד' },
    { title: 'תכלס', text: '90 הימים הראשונים, ומה עושים מחר בבוקר' },
  ],
  summary: 'התוכנית של D&D פרויקטים, למשל, הגיעה לכ-90 עמודים, ועליה עלה הקמפיין שלהם',
};

export default function PlanSection(props) {
  const p = { ...PLAN, ...props };
  return (
    <section id="plan" className="c-sec c-light c-plan" aria-labelledby="plan-h">
      <div className="c-wrap">
        <div className="c-plan__grid">
          <div className="c-plan__head">
            <div className="c-lbl">{p.label}</div>
            {/* שבירה ידנית: הפסיק שבסוף השורה הראשונה יורד (החלטת המנהל 25.11) */}
            <h2 id="plan-h" className="c-h2">
              {nd(p.title)}
              <span className="c-g c-block">{nd(p.titleAccent)}</span>
            </h2>
            <p className="c-lead">{nd(p.lead)}</p>

            <div className="c-plan__stack" aria-hidden="true">
              <div className="c-plan__page c-plan__page--3" />
              <div className="c-plan__page c-plan__page--2" />
              <div className="c-plan__page c-plan__page--1">
                <img src="/logo-onlight.png" alt="" width="1600" height="600" />
                {/* תוכן עניינים כללי: 9 הפרקים מהרשימה שלידו, בלי שם של עסק */}
                <ol className="c-plan__toc">
                  {p.items.map((it, i) => (
                    <li key={i}><span>{String(i + 1).padStart(2, '0')}</span>{nd(it.title)}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <ol className="c-plan__items">
            {p.items.map((it, i) => (
              <li key={i}>
                <span className="c-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{nd(it.title)}</h3>
                  <p>{nd(it.text)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {p.summary && <p className="c-plan__sum">{nd(p.summary)}</p>}
      </div>
    </section>
  );
}
