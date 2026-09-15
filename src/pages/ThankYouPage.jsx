import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../components/icons';

/* ── עמוד תודה ייעודי (URL נפרד) ──────────────────────────────────────────
   מגיעים לכאן אחרי שליחת טופס הליד. כאן יורים את אירוע ההמרה (Meta Lead +
   GA4 generate_lead) - מדידה נקייה על URL ייעודי במקום אינליין, ומומנטום:
   וואטסאפ ישיר, קהילה, וחזרה לעמוד. noindex מוגדר ב-Seo.jsx. */

const PHONE = '972534673151';
const WA_DIRECT = `https://wa.me/${PHONE}?text=${encodeURIComponent('היי שמואל, השארתי פרטים באתר ואשמח להתקדם')}`;
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
      fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
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
        קיבלתי את הפרטים שלך.
      </h1>
      <p style={{ fontSize: 'clamp(1rem, 2.4vw, 1.18rem)', color: 'var(--text-secondary, #9fb0c3)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 8px' }}>
        אחזור אליך בהקדם לשיחת היכרות קצרה, נבדוק יחד אם יש התאמה.
      </p>
      <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary, #9fb0c3)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 30px' }}>
        רוצה לקצר את הדרך? אפשר לכתוב לי ישירות בוואטסאפ עכשיו.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 340 }}>
        <a href={WA_DIRECT} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '15px 24px', borderRadius: 3, background: '#25955a', color: '#fff',
          fontWeight: 800, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 8px 24px rgba(37,149,90,0.32)',
        }}>
          <WhatsAppIcon size={20} />דבר איתי בוואטסאפ
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
