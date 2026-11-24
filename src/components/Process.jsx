import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { nd } from '../content/heroCopy';

const FALLBACK_STEPS = [
  { title: 'שיחת היכרות', description: 'חצי שעה בטלפון, בלי עלות: נבין מה העסק שלך צריך, ותצא עם מחיר סגור', bullets: [] },
  { title: 'פגישת עומק', description: 'אני שואל ואתה מספר: איך מגיעים אליך לקוחות, מה הם אומרים, מה ניסית ומה יצא מזה', bullets: [] },
  { title: 'תוכנית כתובה', description: 'אני קורא את השיחות שלך עם לקוחות, חוקר את השוק ואת המתחרים, ומציג לך תוכנית ברורה', bullets: [] },
  { title: 'הקמה', description: 'על התוכנית אני מקים את הקמפיין במטא ובגוגל: המודעות, הטופס והמדידה, ובודק בעצמי שכל פנייה מגיעה אליך', bullets: [] },
  { title: 'ניהול', description: 'אני מנהל ומדווח לך כל שבוע כמה פניות נכנסו ומה שיניתי, עם הבטחת ביצוע על החודש הראשון', bullets: [] },
];

/* ── שלבי העבודה: Sticky Scroll Reveal (Pally P11), פעם אחת בדף ──
   גנרי: מקבל כל מספר שלבים (fallback כאן או process_steps ב-DB), המספור והפס נגזרים מהמערך.
   דסקטופ: עמודה דביקה עם מספר ושם השלב הפעיל, והשלבים נגללים לידה.
   מובייל / prefers-reduced-motion: רשימה רגילה, כל השלבים בעוצמה מלאה. */
export default function Process() {
  const [steps, setSteps] = useState(FALLBACK_STEPS);
  const [active, setActive] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    supabase.from('process_steps').select('*').order('position')
      .then(({ data }) => {
        if (data?.length) setSteps(data.map(r => ({
          title:       r.title,
          description: r.description,
          bullets:     Array.isArray(r.bullets) ? r.bullets : JSON.parse(r.bullets || '[]'),
        })));
      });
  }, []);

  useEffect(() => {
    const els = itemRefs.current.filter(Boolean);
    if (!els.length || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [steps]);

  const cur = steps[active] || steps[0];

  return (
    <section id="strategy" className="c-sec c-dark c-proc" aria-labelledby="proc-h">
      <div className="c-wrap">
        <div className="c-proc__head">
          <div className="c-lbl">התהליך</div>
          <h2 id="proc-h" className="c-h2">
            קודם תוכנית
            <span className="c-g c-block">אחר כך קמפיין</span>
          </h2>
          <p className="c-lead">
            אפשר לעצור אחרי התוכנית ולהחליט, ואת הקמפיין אני בונה רק על תוכנית
          </p>
        </div>

        <div className="c-proc__grid">
          <div className="c-proc__sticky" aria-hidden="true">
            <div className="c-proc__panel">
              <div className="c-proc__big" key={`n${active}`}>{String(active + 1).padStart(2, '0')}</div>
              <div className="c-proc__name" key={`t${active}`}>{nd(cur.title)}</div>
              <div className="c-proc__bar">
                {steps.map((_, i) => <span key={i} className={i <= active ? 'on' : ''} />)}
              </div>
            </div>
          </div>

          <ol className="c-proc__steps">
            {steps.map((s, i) => (
              <li
                key={i}
                ref={(el) => { itemRefs.current[i] = el; }}
                data-i={i}
                className={`c-proc__step${i === active ? ' is-active' : ''}`}
              >
                <span className="c-proc__n">שלב {String(i + 1).padStart(2, '0')}</span>
                <h3>{nd(s.title)}</h3>
                <p>{nd(s.description)}</p>
                {s.bullets?.length > 0 && (
                  <ul>
                    {s.bullets.map((b, j) => <li key={j}>{nd(b)}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
