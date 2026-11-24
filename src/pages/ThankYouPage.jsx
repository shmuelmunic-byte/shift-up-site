import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../components/icons';
import { TESTIMONIALS } from '../components/SaarSections';

/* ── עמוד תודה ייעודי (URL נפרד) ──────────────────────────────────────────
   מגיעים לכאן אחרי שליחת טופס הליד. כאן יורים את אירוע ההמרה (Meta Lead +
   GA4 generate_lead) - מדידה נקייה על URL ייעודי במקום אינליין, ומומנטום:
   וואטסאפ ישיר, קהילה, וחזרה לעמוד. noindex מוגדר ב-Seo.jsx. */

const PHONE = '972534673151';
const WA_DIRECT = `https://wa.me/${PHONE}?text=${encodeURIComponent('היי שמואל, השארתי פרטים באתר ואשמח להתקדם')}`;
const waWith = (text) => `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
const TIMES = ['בבוקר', 'בצהריים', 'אחר הצהריים'];
const STEPS = [
  'אני עובר על הפרטים שלך ומסתכל על העסק שלך ברשת',
  'אני מתקשר אליך לשיחת היכרות של חצי שעה',
  'בסוף השיחה יש לך מחיר סגור ותמונה ברורה אם זה מתאים',
];
const PREP = [
  'כמה אתה מרוויח מלקוח אחד בממוצע',
  'מאיפה מגיעים היום רוב הלקוחות שלך',
  'מה כבר ניסית בשיווק ומה יצא מזה',
];

const WA_GROUP = 'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3';

export default function ThankYouPage() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form' });
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form' });
    window.scrollTo(0, 0);
  }, []);

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', background: 'var(--bedrock)', color: 'var(--text-primary)',
      fontFamily: 'var(--font)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '40px 24px',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,217,123,0.14)',
        border: '2px solid #34d98a', display: 'grid', placeItems: 'center', marginBottom: 26,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d98a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </div>

      <h1 style={{ fontSize: 'clamp(1.9rem, 5.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.12, marginBottom: 14 }}>
        קיבלתי, תודה
      </h1>
      <p style={{ fontSize: 'clamp(1rem, 2.4vw, 1.18rem)', color: 'var(--text-secondary, #9fb0c3)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 30px' }}>
        אני חוזר אליך לשיחת היכרות קצרה, ובינתיים כמה דברים שיעזרו לנו להפיק ממנה את המקסימום
      </p>

      <div style={{ width: '100%', maxWidth: 560, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* מתי נוח (סער: לאסוף עוד מידע ברגע הכי חם) */}
        <section style={{ background: 'var(--surface-1)', padding: '22px 22px 24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>מתי הכי נוח שאתקשר?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {TIMES.map((t) => (
              <a key={t} href={waWith(`היי שמואל, השארתי פרטים באתר, הכי נוח לי שתתקשר ${t}`)} target="_blank" rel="noopener noreferrer"
                onClick={() => { if (typeof window.gtag === 'function') window.gtag('event', 'thankyou_time', { time: t }); }}
                style={{ padding: '11px 18px', border: '1px solid var(--brand-prime)', color: 'var(--brand-prime)', fontWeight: 700, textDecoration: 'none', borderRadius: 3 }}>
                {t}
              </a>
            ))}
          </div>
        </section>

        {/* מה קורה עכשיו (פותחים את הקופסה השחורה) */}
        <section style={{ background: 'var(--surface-1)', padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 14 }}>מה קורה עכשיו</h2>
          <ol style={{ margin: 0, paddingInlineStart: 22, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--text-secondary, #9fb0c3)', lineHeight: 1.6 }}>
            {STEPS.map((x) => <li key={x}>{x}</li>)}
          </ol>
        </section>

        {/* הכנה לשיחה */}
        <section style={{ background: 'var(--surface-1)', padding: '22px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 6 }}>כדי שהשיחה תהיה שווה, תחשוב מראש על</h2>
          <ul style={{ margin: '10px 0 0', paddingInlineStart: 22, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary, #9fb0c3)', lineHeight: 1.6 }}>
            {PREP.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </section>

        {/* עדות */}
        <figure style={{ margin: 0, padding: '18px 20px', borderInlineStart: '3px solid var(--brand-prime)' }}>
          <blockquote style={{ margin: 0, lineHeight: 1.6 }}>"{TESTIMONIALS[1].quote}"</blockquote>
          <figcaption style={{ marginTop: 6, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{TESTIMONIALS[1].name}, {TESTIMONIALS[1].role}</figcaption>
        </figure>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340, marginTop: 26 }}>
        <a href={WA_DIRECT} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '15px 24px', borderRadius: 3, background: '#25955a', color: '#fff',
          fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,149,90,0.32)',
        }}>
          <WhatsAppIcon size={20} />לא רוצה לחכות? דבר איתי עכשיו
        </a>
        <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 24px', borderRadius: 3, background: 'transparent',
          border: '1px solid var(--hairline, #2a3543)', color: 'var(--text-primary)',
          fontWeight: 700, fontSize: '0.98rem', textDecoration: 'none',
        }}>
          בינתיים, הצטרף לקהילת השיווק השקטה
        </a>
      </div>

      <Link to="/" style={{ marginTop: 28, color: 'var(--text-secondary, #9fb0c3)', fontSize: '0.92rem', textDecoration: 'none' }}>
        חזרה לעמוד הראשי ←
      </Link>
    </div>
  );
}
