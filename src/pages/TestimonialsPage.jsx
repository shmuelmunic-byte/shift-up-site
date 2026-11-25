import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PageNav from '../components/PageNav';
import Footer from '../components/Footer';
import { nd } from '../content/heroCopy';
import Tied, { fin } from '../content/Tied';
import { TESTIMONIALS } from '../components/SaarSections';

// שני הכרטיסים כמו בעמוד הראשי (SaarSections.jsx), מילה במילה. השמות אושרו ועלו בבית.
// אם יש עדויות בטבלת testimonials ב-Supabase, הן מחליפות את אלה.
const FALLBACK = TESTIMONIALS.map((t) => ({ id: t.name, quote: t.quote, name: t.name, role: t.role, logo_url: t.logo }));

/* כל הטקסטים של הדף במקום אחד, כדי שיהיה קל להחליף כשהקופי החדש יגיע (סבב 2, 25.11.2026) */
const COPY = {
  back: 'חזרה לאתר',
  label: 'עדויות',
  title: 'מה אומרים',
  titleAccent: 'הלקוחות',
  lead: 'מה שלקוחות אמרו לי, מילה במילה',
  empty: 'אני לוקח מעט לקוחות במקביל, בכוונה, והבאים יהיו הראשונים לספר.',
  cta: 'העסק הבא יכול להיות שלך, וזה מתחיל בשיחת היכרות בטלפון, בלי עלות, ואם בחודש הניהול הראשון אין פניות, חודש ניהול נוסף בחינם',
  ctaBtn: 'לשיחת היכרות חינם',
};

/* כיוון C: הודעה חדה עם זנב, כמו בעמוד הראשי (c-msg / c-bubble / c-who) */
function TestimonialCard({ t }) {
  return (
    <figure className="c-msg">
      <blockquote className="c-bubble">"{t.quote}"</blockquote>
      <figcaption className="c-who">
        <span className="c-who__tile">
          {t.logo_url ? <img src={t.logo_url} alt={t.company || t.name} loading="lazy" /> : <b aria-hidden="true">{t.name[0]}</b>}
        </span>
        <div>
          <div className="c-who__nm">{t.name}</div>
          {(t.role || t.company) && <div className="c-who__rl">{[t.role, t.company].filter(Boolean).join(' · ')}</div>}
        </div>
      </figcaption>
    </figure>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(FALLBACK);

  useEffect(() => {
    document.title = 'עדויות לקוחות | Shift Up';
    supabase.from('testimonials').select('*').order('position')
      .then(({ data }) => { if (data?.length) setTestimonials(data); });
  }, []);

  return (
    <div dir="rtl" className="c-page">
      <PageNav back={COPY.back} />
      <main>
        <section className="c-dark c-phead c-phead--sm" aria-labelledby="t-h">
          <div className="c-wrap">
            <div className="c-lbl">{COPY.label}</div>
            <h1 id="t-h" className="c-phead__h1">{COPY.title} <span className="c-g">{COPY.titleAccent}</span></h1>
            <p className="c-lead">{nd(COPY.lead)}</p>
          </div>
        </section>

        <section className="c-sec c-light" aria-label="עדויות">
          <div className="c-wrap">
            {testimonials.length === 0 ? (
              <p className="c-tpage__empty">{nd(COPY.empty)}</p>
            ) : (
              <div className="c-tg c-tg--page">
                {testimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
              </div>
            )}
          </div>
        </section>

        <section className="c-sec c-dark c-dark--2 c-pcta">
          <div className="c-wrap c-pcta__grid">
            <p><Tied text={fin(nd(COPY.cta)).replace('ואם בחודש', 'ואם~בחודש')} /></p>
            <a className="c-btn" href="https://wa.me/972534673151" target="_blank" rel="noopener noreferrer">{COPY.ctaBtn}</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
