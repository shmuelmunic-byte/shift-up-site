import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useSiteLinks } from '../lib/useSiteLinks';
import { useContent } from '../lib/useContent';

gsap.registerPlugin(ScrollTrigger);

const PHONE = '972534673151';

/* ── סקשן 11 — טופס + וואטסאפ + scarcity ("מה עכשיו?") ──
   רקע בהיר (ניגוד ונקודת מיקוד). טופס = דלת ראשית, וואטסאפ = דלת משנית.
   עמיד-לתקלות: אם השמירה ב-Supabase נכשלת, הליד עדיין נלכד דרך וואטסאפ עם פרטים ממולאים. */

function buildWaLink(form) {
  const lines = [
    'היי שמואל, אשמח לשמוע פרטים על השירות.',
    form.name && `שם: ${form.name}`,
    form.business && `תחום העסק: ${form.business}`,
    form.message && `מה מעניין אותי: ${form.message}`,
  ].filter(Boolean);
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function fireLead() {
  if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form' });
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form' });
}

export default function LeadForm() {
  const sectionRef = useRef(null);
  const { whatsapp_url: waLinkRaw } = useSiteLinks();
  const c = useContent({
    'leadform.scarcity': 'פנוי כרגע ל-2–3 עסקים בלבד ברבעון',
    'leadform.title': 'בוא נעשה לעסק שלך',
    'leadform.title_accent': 'Shift Up.',
    'leadform.subtitle': 'השאר פרטים ואחזור אליך לשיחת פיצוח קצרה — נבדוק יחד אם יש התאמה.',
    'leadform.price_note': 'מתחיל מ-1,500 ₪ · שיחת הפיצוח הראשונה חינם, ללא התחייבות.',
    'leadform.wa_title': 'מעדיף לדבר עכשיו?',
    'leadform.soft_door': 'עוד לא בשל? זה בסדר. תוכל פשוט לעקוב ולקבל ערך — גלול מטה לקהילת ה-WhatsApp השקטה.',
  });
  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [touched, setTouched] = useState(false);

  const waSecondary = waLinkRaw || `https://wa.me/${PHONE}?text=${encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות')}`;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.lf-inner', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const valid = form.name.trim().length > 1 && /\d{7,}/.test(form.phone.replace(/\D/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === 'sending') return;
    setStatus('sending');

    // best-effort save; lead is also captured via WhatsApp regardless of DB result
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        business: form.business.trim() || null,
        message: form.message.trim() || null,
        source: 'landing_form',
      });
      if (error) throw error;
      fireLead();
      setStatus('done');
    } catch (err) {
      // DB save failed (schema/RLS/offline) — don't lose the lead: push to WhatsApp prefilled
      console.warn('[LeadForm] supabase insert failed, falling back to WhatsApp:', err?.message);
      fireLead();
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1px solid #cdd7e3', background: '#fff', color: '#0c1118',
    fontSize: '1rem', fontFamily: "'Heebo', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#3a4757', marginBottom: 6 };
  const focusOn = (e) => { e.target.style.borderColor = '#1f9d57'; e.target.style.boxShadow = '0 0 0 3px rgba(52,217,123,0.15)'; };
  const focusOff = (e) => { e.target.style.borderColor = '#cdd7e3'; e.target.style.boxShadow = 'none'; };

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ padding: 'clamp(70px, 10vw, 120px) 28px', background: 'linear-gradient(180deg, #eef3f8 0%, #e6edf5 100%)', position: 'relative', overflow: 'hidden' }}
    >
      <div className="lf-inner" style={{ maxWidth: 920, margin: '0 auto', opacity: 0 }}>

        {/* scarcity pill */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(52,217,123,0.12)', border: '1px solid rgba(31,157,87,0.35)',
            borderRadius: 999, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#117a41',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1f9d57', display: 'block', boxShadow: '0 0 6px #1f9d57', animation: 'pulse-ring 2s ease-out infinite' }} />
            {c['leadform.scarcity']}
          </span>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, color: '#0c1118', marginBottom: 12 }}>
          {c['leadform.title']} <span style={{ color: '#117a41' }}>{c['leadform.title_accent']}</span>
        </h2>
        <p style={{ textAlign: 'center', fontSize: 'clamp(1rem, 2.4vw, 1.15rem)', color: '#4a5868', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 8px' }}>
          {c['leadform.subtitle']}
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#6b7d92', fontWeight: 600, marginBottom: 36 }}>
          {c['leadform.price_note']}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 'clamp(20px, 3vw, 36px)', alignItems: 'start' }} className="lf-grid">

          {/* ── טופס (דלת ראשית) ── */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(24px, 3vw, 36px)', boxShadow: '0 10px 40px rgba(12,17,24,0.08)', border: '1px solid #e1e8f0' }}>
            {status === 'done' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(52,217,123,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#117a41" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0c1118', marginBottom: 8 }}>קיבלתי! אחזור אליך בקרוב.</h3>
                <p style={{ color: '#4a5868', lineHeight: 1.6, marginBottom: 20 }}>רוצה לקצר? שלח לי הודעה ישירות בוואטסאפ עכשיו.</p>
                <a href={buildWaLink(form)} target="_blank" rel="noopener noreferrer" style={waBtnStyle}>
                  {waIcon}פתח שיחה בוואטסאפ
                </a>
              </div>
            ) : status === 'error' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0c1118', marginBottom: 8 }}>כמעט שם 🙂</h3>
                <p style={{ color: '#4a5868', lineHeight: 1.6, marginBottom: 20 }}>הכי מהיר להמשיך בוואטסאפ — הפרטים שלך כבר מוכנים בהודעה.</p>
                <a href={buildWaLink(form)} target="_blank" rel="noopener noreferrer" style={waBtnStyle}>
                  {waIcon}המשך בוואטסאפ
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-name">שם מלא *</label>
                  <input id="lf-name" type="text" value={form.name} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle} placeholder="איך לפנות אליך?" autoComplete="name" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-phone">טלפון *</label>
                  <input id="lf-phone" type="tel" value={form.phone} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }} placeholder="050-0000000" autoComplete="tel" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-business">תחום העסק</label>
                  <input id="lf-business" type="text" value={form.business} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    style={inputStyle} placeholder="למשל: מסעדה, נדל״ן, קליניקה…" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle} htmlFor="lf-message">מה הכי בוער? (אופציונלי)</label>
                  <textarea id="lf-message" rows={3} value={form.message} onFocus={focusOn} onBlur={focusOff}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="כמה מילים על האתגר השיווקי שלך" />
                </div>

                {touched && !valid && (
                  <p style={{ color: '#c0392b', fontSize: '0.82rem', marginBottom: 12 }}>נא למלא שם וטלפון תקין כדי שאוכל לחזור אליך.</p>
                )}

                <button type="submit" disabled={status === 'sending'} style={{
                  width: '100%', padding: '15px', borderRadius: 12, border: 'none',
                  background: status === 'sending' ? '#7fc89e' : '#1f9d57', color: '#fff',
                  fontSize: '1.08rem', fontWeight: 800, fontFamily: "'Heebo', sans-serif",
                  cursor: status === 'sending' ? 'default' : 'pointer',
                  boxShadow: '0 8px 24px rgba(31,157,87,0.35)', transition: 'background 0.2s, transform 0.15s',
                }}>
                  {status === 'sending' ? 'שולח…' : 'קבל הצעה מותאמת'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.76rem', color: '#8190a3', marginTop: 12 }}>
                  הפרטים נשמרים אצלי בלבד. בלי ספאם, בלי שיתוף.
                </p>
              </form>
            )}
          </div>

          {/* ── דלת משנית (וואטסאפ) + שלישית רכה ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 'clamp(22px, 3vw, 30px)', border: '1px solid #e1e8f0', boxShadow: '0 10px 40px rgba(12,17,24,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0c1118', marginBottom: 8 }}>{c['leadform.wa_title']}</h3>
              <p style={{ fontSize: '0.92rem', color: '#4a5868', lineHeight: 1.6, marginBottom: 18 }}>
                שלח לי הודעה בוואטסאפ ואחזור אליך מהר.
              </p>
              <a href={waSecondary} target="_blank" rel="noopener noreferrer" style={waBtnStyle}>
                {waIcon}דבר איתי בוואטסאפ
              </a>
            </div>

            <div style={{ background: 'rgba(12,17,24,0.04)', borderRadius: 16, padding: '20px 22px', border: '1px dashed #c3cedb' }}>
              <p style={{ fontSize: '0.92rem', color: '#3a4757', lineHeight: 1.6 }}>
                {c['leadform.soft_door']} 👇
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const waBtnStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
  padding: '13px 22px', borderRadius: 12, background: '#25955a', color: '#fff',
  fontWeight: 800, fontSize: '1rem', fontFamily: "'Heebo', sans-serif", textDecoration: 'none',
  boxShadow: '0 6px 20px rgba(37,149,90,0.3)',
};

const waIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
