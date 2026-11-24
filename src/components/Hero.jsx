import { useLayoutEffect, useMemo, useRef } from 'react';
import { WhatsAppIcon } from './icons';
import Tied from '../content/Tied';
import { useContent } from '../lib/useContent';
import { getHeroVariant } from '../lib/heroVariant';
import {
  HERO_HEADLINES, HERO_EYEBROW, HERO_SUBTITLE, HERO_BULLETS, HERO_UNDER_CTA, HERO_STEPS,
  nd,
} from '../content/heroCopy';

const DEFAULT_WA =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, יש לי שאלה על השירות');

/* ── Hero, כיוון C "בגובה העיניים": האדם הוא הגיבור ──
   סבב 2 (25.11.2026): קופי "התוכנית קודם", A/B בכותרת (lib/heroVariant), ציר 4 שלבים.
   במובייל הכפתור עולה מעל הבולטים (CSS order) כדי שיישאר במסך הראשון גם מעל באנר העוגיות.
   הקו הצבעוני (edge) מעוגן מתחת לציר השלבים, כדי שלא יחצה טקסט בשום רוחב (AD בנייה 1, #3). */
export default function Hero({ onContact }) {
  const variant = useMemo(() => getHeroVariant(), []);
  const c = useContent({
    'hero.headline_a': HERO_HEADLINES.a,
    'hero.headline_b': HERO_HEADLINES.b,
    'hero.subtitle': HERO_SUBTITLE,
    'contact.whatsapp_url': DEFAULT_WA,
  });
  const headline = c[`hero.headline_${variant}`];
  const sectionRef = useRef(null);
  const tlRef = useRef(null);

  useLayoutEffect(() => {
    const sec = sectionRef.current;
    const tl = tlRef.current;
    if (!sec || !tl) return;
    const place = () => {
      const top = tl.getBoundingClientRect().bottom - sec.getBoundingClientRect().top + 24;
      sec.style.setProperty('--edge-top', `${Math.round(top)}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(sec);
    ro.observe(tl);
    return () => ro.disconnect();
  }, []);

  const trackWhatsApp = () => {
    if (typeof window.fbq === 'function') window.fbq('track', 'Contact', { content_name: 'Hero WhatsApp' });
    if (typeof window.gtag === 'function') window.gtag('event', 'contact', { method: 'whatsapp', location: 'hero', variant });
  };

  const handlePrimary = () => {
    if (typeof window.gtag === 'function') window.gtag('event', 'cta_click', { location: 'hero', target: 'contact', variant });
    if (onContact) onContact();
  };

  return (
    <section id="hero" className="c-hero" ref={sectionRef} data-variant={variant}>
      <div className="c-hero__photo">
        <img src="/shmuel.jpg" alt="שמואל מוניץ, אסטרטג שיווק" fetchPriority="high" />
        <span className="c-hero__edge" aria-hidden="true" />
        <div className="c-hero__cap" aria-hidden="true">שמואל מוניץ<span>Shift Up</span></div>
      </div>

      <div className="c-wrap">
        <div className="c-hero__copy">
          <div className="c-eyebrow c-rise">{HERO_EYEBROW}</div>

          <h1 translate="no" className="c-hero__h1 c-rise">
            <Tied text={nd(headline)} />
          </h1>

          <p className="c-hero__sub c-rise">{nd(c['hero.subtitle'])}</p>

          <ul className="c-hero__bullets c-rise">
            {HERO_BULLETS.map((b) => <li key={b}>{nd(b)}</li>)}
          </ul>

          <div className="c-hero__ctas c-rise">
            <div className="c-hero__ctarow">
              <button type="button" className="c-btn" onClick={handlePrimary}>
                לשיחת היכרות <span className="c-btn__tag">חצי שעה</span>
              </button>
              <a className="c-q" href={c['contact.whatsapp_url']} onClick={trackWhatsApp} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon size={17} />
                יש לי שאלה
              </a>
            </div>
            <p className="c-hero__under">{HERO_UNDER_CTA}</p>
          </div>

          <figure className="c-hero__proof c-rise">
            <blockquote>"הכל בשקיפות... הוא זמין ממש... ואתה רואה שהוא עושה את זה מכל הלב ומכל הנשמה"</blockquote>
            <figcaption>רועי קפח, מנהל מכינה קדם צבאית אורות</figcaption>
          </figure>

          <ol className="c-tl c-rise" aria-label="איך זה עובד" ref={tlRef}>
            {HERO_STEPS.map((s, i) => (
              <li key={s} className="c-tl__s">
                <i aria-hidden="true">{i + 1}</i>{s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
