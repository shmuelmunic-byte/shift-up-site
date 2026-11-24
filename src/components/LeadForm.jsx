import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSiteLinks } from '../lib/useSiteLinks';
import { useContent } from '../lib/useContent';
import { WhatsAppIcon } from './icons';
import { nd } from '../content/heroCopy';
import { getHeroVariant } from '../lib/heroVariant';


const PHONE = '972534673151';

// נרמול טלפון לפני שמירה: ספרות בלבד, +972/972 → 0, 5XXXXXXXX → 05XXXXXXXX (מילוי אוטומטי בנייד)
const normalizePhone = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('972')) d = '0' + d.slice(3);
  if (d.length === 9 && d[0] === '5') d = '0' + d;
  return d || String(v || '').trim();
};

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
  const variant = getHeroVariant();
  if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form', variant });
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form', variant });
}

export default function LeadForm() {
  const sectionRef = useRef(null);
  const navigate = useNavigate();
  const { whatsapp_url: waLinkRaw } = useSiteLinks();
  const c = useContent({
    'leadform.scarcity': 'אני לוקח מעט לקוחות במקביל',
    'leadform.title': 'תחזור לנהל את העסק',
    'leadform.title_accent': 'את השיווק תשאיר לי',
    'leadform.subtitle': 'השאר פרטים ואחזור אליך לשיחת היכרות של חצי שעה, שבה נבין מה העסק שלך צריך, ותצא ממנה עם מחיר סגור',
    'leadform.price_note': 'מחיר סגור לכל שלב בשיחת ההיכרות · אם בחודש הניהול הראשון אין פניות, חודש ניהול נוסף בחינם',
    'leadform.wa_title': 'מעדיף לדבר עכשיו?',
    'leadform.soft_door': 'עוד לא הזמן? זה בסדר, אפשר להצטרף לקהילת השיווק שלי בוואטסאפ, כאן למטה',
  });
  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [touched, setTouched] = useState(false);

  const waSecondary = waLinkRaw || `https://wa.me/${PHONE}?text=${encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות')}`;


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
        phone: normalizePhone(form.phone),
        business: form.business.trim() || null,
        message: form.message.trim() || null,
        source: 'landing_form_' + getHeroVariant(),
      });
      if (error) throw error;
      // מעבר לעמוד תודה ייעודי (URL נפרד) - שם יורה אירוע ההמרה (Lead + generate_lead).
      // מדידה נקייה + מומנטום, במקום הודעה אינליין.
      navigate('/thank-you');
    } catch (err) {
      // DB save failed (schema/RLS/offline) — don't lose the lead: push to WhatsApp prefilled
      console.warn('[LeadForm] supabase insert failed, falling back to WhatsApp:', err?.message);
      fireLead();
      setStatus('error');
    }
  };

  const nameError = touched && !nameValid;
  const phoneError = touched && !phoneValid;
  const consentError = touched && !consent;

  return (
    <section id="contact" ref={sectionRef} className="c-sec c-dark c-lf" aria-labelledby="lf-h">
      <div className="c-wrap">
        <div className="c-lf__head">
          <span className="c-tag">{nd(c['leadform.scarcity'])}</span>
          {/* הטאגליין (החלטת שמואל 25.11): שתי שורות בשבירה ידנית, בלי פסיק בסוף השורה */}
          <h2 id="lf-h" className="c-h2 c-lf__h">
            {nd(c['leadform.title']).replace(/,$/, '')}
            <span className="c-g c-block">{nd(c['leadform.title_accent'])}</span>
          </h2>
          <p className="c-lead">{nd(c['leadform.subtitle'])}</p>
          <p className="c-lf__note">{nd(c['leadform.price_note'])}</p>
        </div>

        <div className="c-lf__grid">
          {/* ── טופס (דלת ראשית) ── */}
          <div className="c-lf__panel">
            {status === 'done' ? (
              <div className="c-lf__state">
                <h3>קיבלתי! אחזור אליך בקרוב</h3>
                <p>רוצה לקצר? שלח לי הודעה ישירות בוואטסאפ עכשיו</p>
                <a href={buildWaLink(form)} target="_blank" rel="noopener noreferrer" className="c-wa-btn">
                  {waIcon}פתח שיחה בוואטסאפ
                </a>
              </div>
            ) : status === 'error' ? (
              <div className="c-lf__state">
                <h3>כמעט שם</h3>
                <p>הכי מהיר להמשיך בוואטסאפ, הפרטים שלך כבר מוכנים בהודעה</p>
                <a href={buildWaLink(form)} target="_blank" rel="noopener noreferrer" className="c-wa-btn">
                  {waIcon}המשך בוואטסאפ
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="c-form">
                <div className="c-field">
                  <label htmlFor="lf-name">שם מלא *</label>
                  <input id="lf-name" type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={nameError ? 'is-err' : ''} placeholder="איך לפנות אליך?" autoComplete="name"
                    aria-invalid={nameError} aria-describedby={nameError ? 'lf-name-error' : undefined} />
                  {nameError && <p id="lf-name-error" className="c-err">נא למלא שם (לפחות 2 תווים)</p>}
                </div>
                <div className="c-field">
                  <label htmlFor="lf-phone">טלפון *</label>
                  <input id="lf-phone" type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={phoneError ? 'is-err' : ''} style={{ direction: 'ltr', textAlign: 'right' }} placeholder="050-0000000" autoComplete="tel"
                    aria-invalid={phoneError} aria-describedby={phoneError ? 'lf-phone-error' : undefined} />
                  {phoneError && <p id="lf-phone-error" className="c-err">נא למלא מספר טלפון תקין (לפחות 7 ספרות)</p>}
                </div>
                <div className="c-field">
                  <label htmlFor="lf-business">תחום העסק</label>
                  <input id="lf-business" type="text" value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    placeholder="למשל: מסעדה, נדל״ן, קליניקה…" />
                </div>
                <div className="c-field">
                  <label htmlFor="lf-message">מה הכי בוער? (אופציונלי)</label>
                  <textarea id="lf-message" rows={3} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="למשל: לא ברור לי מה מביא לי לקוחות" />
                </div>

                <div className="c-field">
                  <label htmlFor="lf-consent" className="c-consent">
                    <input id="lf-consent" type="checkbox" checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={consentError} aria-describedby={consentError ? 'lf-consent-error' : undefined} />
                    <span>קראתי ואני מסכים/ה ל<a href="/privacy" target="_blank" rel="noopener noreferrer">מדיניות הפרטיות</a>, כולל אחסון הפרטים בשרת בחו"ל, ולכך שתיצרו איתי קשר בעקבות פנייתי *</span>
                  </label>
                  {consentError && <p id="lf-consent-error" className="c-err">יש לאשר את מדיניות הפרטיות כדי להמשיך</p>}
                </div>

                <button type="submit" disabled={status === 'sending'} className="c-btn c-btn--full">
                  {status === 'sending' ? 'שולח…' : 'קבע לי שיחת היכרות'}
                </button>
                <p className="c-form__fine">הפרטים נשארים אצלי, בלי ספאם ובלי שיתוף עם אף אחד</p>
              </form>
            )}
          </div>

          {/* ── דלת משנית (וואטסאפ) + שלישית רכה ── */}
          <div className="c-lf__side">
            <div className="c-lf__wa">
              <h3>{nd(c['leadform.wa_title'])}</h3>
              <p>שלח לי הודעה בוואטסאפ ואחזור אליך מהר</p>
              <a href={waSecondary} target="_blank" rel="noopener noreferrer" className="c-wa-btn">
                {waIcon}דבר איתי בוואטסאפ
              </a>
            </div>
            <p className="c-lf__soft">{nd(c['leadform.soft_door'])}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const waIcon = <WhatsAppIcon size={20} />;
