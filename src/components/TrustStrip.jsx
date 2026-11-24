import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useContent } from '../lib/useContent';
import { nd } from '../content/heroCopy';

/* ── זמינות חיה לפי שעון ישראל (08:00–17:00) ── */
function isOnlineNow() {
  const hour = parseInt(
    new Intl.DateTimeFormat('he-IL', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()),
    10
  );
  return hour >= 8 && hour < 17;
}

/* ── עמודי אמון (סקשן 2, "אפשר לסמוך?") fallback ── */
const FALLBACK_PILLARS = [
  { title: 'תוכנית לפני תקציב', text: 'לפני שקל לפרסום אתה מקבל תוכנית כתובה: למי מפרסמים, מה אומרים, ואיך נדע שזה עובד' },
  { title: 'הבטחת ביצוע', text: 'אתה משלם על ההקמה ועל הניהול כרגיל, ואם בחודש הניהול הראשון אין פניות, אני מנהל חודש נוסף בחינם, ואם גם אז אין, אני אומר לך את זה ועוצרים' },
  { title: 'בגובה העיניים', text: 'מי שכותב לך את התוכנית הוא מי שמנהל לך את הקמפיין, ועונה לך כשאתה מתקשר' },
];

/* כיוון C: כהה, 3 עמודות עם פס ירוק ומספר, בלי כרטיסים ובלי אייקונים */
export default function TrustStrip() {
  const [online, setOnline] = useState(isOnlineNow);
  const [pillars, setPillars] = useState(FALLBACK_PILLARS);
  const t = useContent({
    'trust.title': 'למה לסמוך עליי?',
    'trust.title_accent': 'כי הסיכון עליי',
  });

  useEffect(() => {
    supabase.from('trust_pillars').select('*').order('position')
      .then(({ data }) => { if (data?.length) setPillars(data); });
  }, []);

  useEffect(() => {
    const id = setInterval(() => setOnline(isOnlineNow()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="c-sec c-dark c-dark--2 c-trust" aria-labelledby="trust-h">
      <div className="c-wrap">
        <div className="c-trust__head">
          <h2 id="trust-h" className="c-h2">
            {nd(t['trust.title'])} <span className="c-g">{nd(t['trust.title_accent'])}</span>
          </h2>
          <p className={`c-live${online ? ' is-on' : ''}`}>
            <span aria-hidden="true" />
            {online ? 'זמין עכשיו' : 'מענה בד״כ תוך שעה'}
          </p>
        </div>

        <ol className="c-pillars">
          {pillars.map((p, i) => (
            <li key={p.id || i}>
              <span className="c-num" aria-hidden="true">0{i + 1}</span>
              <h3>{nd(p.title)}</h3>
              <p>{nd(p.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
