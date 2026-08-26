import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import { useSiteLinks } from '../lib/useSiteLinks';
import { useContent } from '../lib/useContent';
import { WhatsAppIcon } from './icons';

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
    'leadform.scarcity': 'מקום קייס מייסדים אחד פנוי · בתנאים מיוחדים',
    'leadform.title': 'בוא נעשה לעסק שלך',
    'leadform.title_accent': 'Shift Up.',
    'leadform.subtitle': 'השאר פרטים ואחזור אליך לשיחת היכרות קצרה. נבדוק יחד אם יש התאמה.',
    'leadform.price_note': 'מחיר סגור וברור בשיחת ההיכרות · אם בחודש הניהול הראשון אין פניות, ממשיך לנהל בחינם עד שיש.',
    'leadform.wa_title': 'מעדיף לדבר עכשיו?',
    'leadform.soft_door': 'עוד לא בשל? זה בסדר. תוכל פשוט לעקוב ולקבל ערך. גלול מטה לקהילת ה-WhatsApp השקטה.',
  });
  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [consent, setConsent] = useState(false);
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

  const nameValid = form.name.trim().length > 1;
  const phoneValid = /\d{7,}/.test(form.phone.replace(/\D/g, ''));
  const valid = nameValid && phoneValid && consent;

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
    width: '100%', padding: '13px 16px', borderRadius: 3,
    border: '1px solid #cdd7e3', background: '#fff', color: '#0c1118',
    fontSize: '1rem', fontFamily: "'Space Grotesk', 'Rubik', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const errorInputStyle = { ...inputStyle, borderColor: '#c0392b' };
  const labelStyle = { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#3a4757', marginBottom: 6 };
  const errorTextStyle = { color: '#c0392b', fontSize: '0.78rem', marginTop: 6 };
  const focusOn = (e) => { e.target.style.borderColor = '#1f9d57'; e.target.style.boxShadow = '0 0 0 3px rgba(52,217,123,0.15)'; };
  const makeFocusOff = (hasError) => (e) => {
    e.target.style.borderColor = hasError ? '#c0392b' : '#cdd7e3';
    e.target.style.boxShadow = 'none';
  };
  const nameError = touched && !nameValid;
  const phoneError = touched && !phoneValid;
  const consentError = touched && !consent;

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ padding: 'clamp(52px, 7vw, 88px) 28px', background: 'linear-gradient(180deg, #eef3f8 0%, #e6edf5 100%)', position: 'relative', overflow: 'hidden' }}
    >
      <div className="lf-inner" style={{ maxWidth: 920, margin: '0 auto', opacity: 0 }}>

        {/* scarcity pill */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(52,217,123,0.12)', border: '1px solid rgba(31,157,87,0.35)',
            borderRadius: 3, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#117a41',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1f9d57', display: 'block', boxShadow: '0 0 6px #1f9d57' }} />
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
          <div style={{ background: '#fff', borderRadius: 4, padding: 'clamp(24px, 3vw, 36px)', boxShadow: '0 10px 40px rgba(12,17,24,0.08)', border: '1px solid #e1e8f0' }}>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0c1118', marginBottom: 8 }}>כמעט שם</h3>
                <p style={{ color: '#4a5868', lineHeight: 1.6, marginBottom: 20 }}>הכי מהיר להמשיך בוואטסאפ, הפרטים שלך כבר מוכנים בהודעה.</p>
                <a href={buildWaLink(form)} target="_blank" rel="noopener noreferrer" style={waBtnStyle}>
                  {waIcon}המשך בוואטסאפ
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-name">שם מלא *</label>
                  <input id="lf-name" type="text" value={form.name} onFocus={focusOn} onBlur={makeFocusOff(nameError)}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={nameError ? errorInputStyle : inputStyle} placeholder="איך לפנות אליך?" autoComplete="name"
                    aria-invalid={nameError} aria-describedby={nameError ? 'lf-name-error' : undefined} />
                  {nameError && <p id="lf-name-error" style={errorTextStyle}>נא למלא שם (לפחות 2 תווים).</p>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-phone">טלפון *</label>
                  <input id="lf-phone" type="tel" value={form.phone} onFocus={focusOn} onBlur={makeFocusOff(phoneError)}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    style={{ ...(phoneError ? errorInputStyle : inputStyle), direction: 'ltr', textAlign: 'right' }} placeholder="050-0000000" autoComplete="tel"
                    aria-invalid={phoneError} aria-describedby={phoneError ? 'lf-phone-error' : undefined} />
                  {phoneError && <p id="lf-phone-error" style={errorTextStyle}>נא למלא מספר טלפון תקין (לפחות 7 ספרות).</p>}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle} htmlFor="lf-business">תחום העסק</label>
                  <input id="lf-business" type="text" value={form.business} onFocus={focusOn} onBlur={makeFocusOff(false)}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    style={inputStyle} placeholder="למשל: מסעדה, נדל״ן, קליניקה…" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle} htmlFor="lf-message">מה הכי בוער? (אופציונלי)</label>
                  <textarea id="lf-message" rows={3} value={form.message} onFocus={focusOn} onBlur={makeFocusOff(false)}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }} placeholder="כמה מילים על האתגר השיווקי שלך" />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="lf-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '0.86rem', color: '#3a4757', lineHeight: 1.5 }}>
                    <input id="lf-consent" type="checkbox" checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={consentError} aria-describedby={consentError ? 'lf-consent-error' : undefined}
                      style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: '#1f9d57', cursor: 'pointer' }} />
                    <span>קראתי ואני מסכים/ה ל<a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#117a41', fontWeight: 700 }}>מדיניות הפרטיות</a> ולכך שתיצרו איתי קשר בעקבות פנייתי. *</span>
                  </label>
                  {consentError && <p id="lf-consent-error" style={errorTextStyle}>יש לאשר את מדיניות הפרטיות כדי להמשיך.</p>}
                </div>

                <button type="submit" disabled={status === 'sending'} style={{
                  width: '100%', padding: '15px', borderRadius: 3, border: 'none',
                  background: status === 'sending' ? '#7fc89e' : '#1f9d57', color: '#fff',
                  fontSize: '1.08rem', fontWeight: 800, fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
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
            <div style={{ background: '#fff', borderRadius: 4, padding: 'clamp(22px, 3vw, 30px)', border: '1px solid #e1e8f0', boxShadow: '0 10px 40px rgba(12,17,24,0.05)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0c1118', marginBottom: 8 }}>{c['leadform.wa_title']}</h3>
              <p style={{ fontSize: '0.92rem', color: '#4a5868', lineHeight: 1.6, marginBottom: 18 }}>
                שלח לי הודעה בוואטסאפ ואחזור אליך מהר.
              </p>
              <a href={waSecondary} target="_blank" rel="noopener noreferrer" style={waBtnStyle}>
                {waIcon}דבר איתי בוואטסאפ
              </a>
            </div>

            <div style={{ background: 'rgba(12,17,24,0.04)', borderRadius: 4, padding: '20px 22px', border: '1px dashed #c3cedb' }}>
              <p style={{ fontSize: '0.92rem', color: '#3a4757', lineHeight: 1.6 }}>
                {c['leadform.soft_door']}
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
  padding: '13px 22px', borderRadius: 3, background: '#25955a', color: '#fff',
  fontWeight: 800, fontSize: '1rem', fontFamily: "'Space Grotesk', 'Rubik', sans-serif", textDecoration: 'none',
  boxShadow: '0 6px 20px rgba(37,149,90,0.3)',
};

const waIcon = <WhatsAppIcon size={20} />;
