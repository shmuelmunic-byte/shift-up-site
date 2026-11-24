import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';
import { nd } from '../content/heroCopy';

/* ── סקשן 6, "מה תקבל" ("מה יוצא לי?") fallback ── */
const FALLBACK_OUTCOMES = [
  { title: 'פניות שנכנסות, לא חשיפות', text: 'קמפיינים שמביאים פניות אמיתיות מלקוחות שמתאימים לך, פניות שאפשר לסגור, לא לייקים ולא "מודעות מותג" מעורפלת.' },
  { title: 'שקט נפשי, מישהו אחד אחראי', text: 'אתה מפסיק לרדוף אחרי פוסטים, קמפיינים ומספרים, כי איש אחד לוקח את השיווק לידיים, מבצע ומדווח לך.' },
  { title: 'מסר חד שאתה גאה בו', text: 'סוף סוף השיווק שלך נשמע כמוך: אני מזקק את מה שמייחד אותך ומבדל אותך מהמתחרים בלי הנחות.' },
  { title: 'הזמן שלך חוזר אליך', text: 'במקום להתעסק בשיווק, אתה חוזר לעשות את מה שאתה הכי טוב בו: לנהל ולהצמיח את העסק.' },
];

/* כיוון C: בהיר (טקסט לקריאה), 2x2 עם קו ירוק ומספר, בלי כרטיסים */
export default function WhatYouGet() {
  const [outcomes, setOutcomes] = useState(FALLBACK_OUTCOMES);
  const t = useContent({
    'wyg.kicker': 'מה מקבלים',
    'wyg.title': 'בשורה התחתונה?',
    'wyg.title_accent': 'פניות ושקט.',
    'wyg.subtitle': 'אתה ממשיך לנהל את העסק, אני לוקח על עצמי את השיווק, וזה מה שאתה מקבל בחזרה.',
    'wyg.summary': 'תפסיק להיות מנהל שיווק במשרה חלקית,',
    'wyg.summary_accent': 'ותחזור להיות הבעלים.',
  });

  useEffect(() => {
    supabase.from('outcomes').select('*').order('position')
      .then(({ data }) => { if (data?.length) setOutcomes(data); });
  }, []);

  return (
    <section className="c-sec c-light c-light--top c-wyg" aria-labelledby="wyg-h">
      <div className="c-wrap">
        <div className="c-split">
          <div>
            <div className="c-lbl">{nd(t['wyg.kicker'])}</div>
            <h2 id="wyg-h" className="c-h2">
              {nd(t['wyg.title'])} <span className="c-g">{nd(t['wyg.title_accent'])}</span>
            </h2>
          </div>
          <p className="c-lead">{nd(t['wyg.subtitle'])}</p>
        </div>

        <ol className="c-outcomes">
          {outcomes.map((o, i) => (
            <li key={o.id || i}>
              <span className="c-num" aria-hidden="true">0{i + 1}</span>
              <h3>{nd(o.title)}</h3>
              <p>{nd(o.text)}</p>
            </li>
          ))}
        </ol>

        <p className="c-wyg__sum">
          {nd(t['wyg.summary'])} <span className="c-g">{nd(t['wyg.summary_accent'])}</span>
        </p>
      </div>
    </section>
  );
}
