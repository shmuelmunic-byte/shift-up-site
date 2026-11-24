import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';
import { nd } from '../content/heroCopy';
import Tied from '../content/Tied';

/* ── סקשן 3, הכאב ("מבינים אותי?") fallback ──
   ירוק שמור לפעולה בלבד; הכאב אפור ושקט, וההקלה (ירוק) רק בסוף. */
const FALLBACK_PAINS = [
  { text: 'יש יותר מדי אפשרויות לפרסום, ולא ברור מאיפה מתחילים' },
  { text: 'עבדת עם קמפיינר, ומה שיצא לא היה ממוקד' },
  { text: 'ביקשת מ-ChatGPT, ומה שקיבלת לא דיבר אליך' },
  { text: 'רוב הלקוחות מגיעים מפה לאוזן, ומה שיש, יש' },
];

export default function PainSection() {
  const [pains, setPains] = useState(FALLBACK_PAINS);
  const t = useContent({
    'pain.kicker': 'רגע של אמת',
    'pain.title': 'מפרסם, ולא באמת יודע מה מביא לך לקוחות?',
    'pain.bridge': 'לפני המודעה הבאה צריך לדעת',
    'pain.bridge_accent': 'למי היא נכתבת ומה היא אומרת',
  });

  useEffect(() => {
    supabase.from('pain_points').select('*').order('position')
      .then(({ data }) => { if (data?.length) setPains(data); });
  }, []);

  return (
    <section className="c-sec c-dark c-pain" aria-labelledby="pain-h">
      <div className="c-wrap">
        <div className="c-lbl">{nd(t['pain.kicker'])}</div>
        <h2 id="pain-h" className="c-h2 c-pain__h"><Tied text={nd(t['pain.title'])} /></h2>

        <ul className="c-pain__list">
          {pains.map((p, i) => <li key={p.id || i}><Tied text={nd(p.text)} /></li>)}
        </ul>

        <p className="c-pain__bridge">
          {nd(t['pain.bridge'])} <span className="c-g">{nd(t['pain.bridge_accent'])}</span>
        </p>
      </div>
    </section>
  );
}
