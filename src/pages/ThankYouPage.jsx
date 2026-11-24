import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../components/icons';
import { TESTIMONIALS } from '../components/SaarSections';
import { getHeroVariant } from '../lib/heroVariant';

/* ── עמוד תודה ייעודי (URL נפרד) ──────────────────────────────────────────
   מגיעים לכאן אחרי שליחת טופס הליד. כאן יורים את אירוע ההמרה (Meta Lead +
   GA4 generate_lead) - מדידה נקייה על URL ייעודי במקום אינליין, ומומנטום:
   וואטסאפ ישיר, קהילה, וחזרה לעמוד. noindex מוגדר ב-Seo.jsx.
   עיצוב כיוון C (25.11.2026): כהה למעלה, בהיר לקריאה, כהה לפעולה. */

const PHONE = '972534673151';
const WA_DIRECT = `https://wa.me/${PHONE}?text=${encodeURIComponent('היי שמואל, השארתי פרטים באתר ואשמח להתקדם')}`;
const waWith = (text) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
const TIMES = ['בבוקר', 'בצהריים', 'אחר הצהריים'];
const STEPS = [
  'אני עובר על הפרטים שלך ומסתכל על העסק שלך ברשת',
  'אני מתקשר אליך לשיחת היכרות של חצי שעה',
  'בסוף השיחה תדע אם תוכנית מתאימה לעסק שלך, ומה המחיר הסגור',
  'אם מתאים, קובעים פגישת עומק, ומשם אני כותב לך את התוכנית',
];
const PREP = [
  'איך הגיעו אליך עשרת הלקוחות האחרונים',
  'כמה אתה מרוויח מלקוח אחד בממוצע',
  'מה כבר ניסית בשיווק ומה יצא מזה',
  'כמה אתה מוציא היום על שיווק',
];

const WA_GROUP = 'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3';

export default function ThankYouPage() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const variant = getHeroVariant();
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form', variant });
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form', variant });
    window.scrollTo(0, 0);
  }, []);

  const t = TESTIMONIALS[1];

  return (
    <div dir="rtl" className="c-ty">
      {/* כהה: אישור + מתי נוח */}
      <section className="c-ty__top">
        <div className="c-ty__wrap">
          <Link to="/" className="c-ty__logo" aria-label="Shift Up, לעמוד הראשי">
            <img src="/logo.png" alt="Shift Up" width="1600" height="600" />
          </Link>

          <div className="c-ty__check" aria-hidden="true">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#070A0E" strokeWidth="3" strokeLinecap="square"><path d="M20 6 9 17l-5-5" /></svg>
          </div>

          <h1 className="c-ty__h1">קיבלתי, תודה</h1>
          <p className="c-ty__sub">
            אני חוזר אליך לשיחת היכרות של חצי שעה, ובינתיים כמה דברים שיעזרו לך לצאת ממנה עם תשובה ברורה
          </p>

          {/* מתי נוח (סער: לאסוף עוד מידע ברגע הכי חם) */}
          <h2 className="c-ty__h2">מתי הכי נוח שאתקשר?</h2>
          <div className="c-ty__times">
            {TIMES.map((x) => (
              <a key={x} href={waWith(`היי שמואל, השארתי פרטים באתר, הכי נוח לי שתתקשר ${x}`)} target="_blank" rel="noopener noreferrer"
                onClick={() => { if (typeof window.gtag === 'function') window.gtag('event', 'thankyou_time', { time: x }); }}>
                {x}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* בהיר: מה קורה עכשיו + הכנה + עדות */}
      <section className="c-ty__mid">
        <div className="c-ty__wrap">
          <h2 className="c-ty__h2 c-ty__h2--ink">מה קורה עכשיו</h2>
          <ol className="c-ty__steps">
            {STEPS.map((x, i) => (
              <li key={x}><i aria-hidden="true">{i + 1}</i><span>{x}</span></li>
            ))}
          </ol>

          <h2 className="c-ty__h2 c-ty__h2--ink">כדי שהשיחה תהיה שווה, תחשוב מראש על</h2>
          <ul className="c-ty__prep">
            {PREP.map((x) => <li key={x}>{x}</li>)}
          </ul>

          <figure className="c-msg c-ty__quote">
            <div className="c-msg__src">{t.source}</div>
            <blockquote className="c-bubble">"{t.quote}"</blockquote>
            <figcaption className="c-who">
              <span className="c-who__tile"><img src={t.logo} alt={`הלוגו של ${t.role}`} loading="lazy" /></span>
              <div>
                <div className="c-who__nm">{t.name}</div>
                <div className="c-who__rl">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* כהה: פעולה */}
      <section className="c-ty__end">
        <div className="c-ty__wrap c-ty__ctas">
          <a href={WA_DIRECT} target="_blank" rel="noopener noreferrer" className="c-btn">
            <WhatsAppIcon size={20} />לא רוצה לחכות? דבר איתי עכשיו
          </a>
          <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--ghost">
            בינתיים, הצטרף לקהילת השיווק
          </a>
          <Link to="/" className="c-q c-ty__back">חזרה לעמוד הראשי →</Link>
        </div>
      </section>
    </div>
  );
}
