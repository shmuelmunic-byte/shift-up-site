import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageNav from '../components/PageNav';
import Footer from '../components/Footer';
import { nd } from '../content/heroCopy';
import Tied, { fin } from '../content/Tied';
import { supabase } from '../lib/supabase';

const WA_LINK =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, ראיתי את הפרומפטים ואשמח לשמוע איך נראית תוכנית לעסק שלי');

const COMMUNITY_LINK =
  'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3';

const SOCIAL = [
  {
    id: 'instagram',
    label: 'אינסטגרם',
    handle: '@shiftup.marketing',
    href: 'https://www.instagram.com/shiftup.marketing',
    hoverColor: 'oklch(0.72 0.22 340)',
    Icon: IconInstagram,
  },
  {
    id: 'facebook',
    label: 'פייסבוק',
    handle: 'Shift Up',
    href: 'https://www.facebook.com/share/1BZ8HrpBeo/',
    hoverColor: 'oklch(0.60 0.18 265)',
    Icon: IconFacebook,
  },
  {
    id: 'linkedin',
    label: 'לינקדאין',
    handle: 'Shmuel Munitz',
    href: 'https://www.linkedin.com/in/shmuel-munitz-marketing',
    hoverColor: 'oklch(0.58 0.18 245)',
    Icon: IconLinkedIn,
  },
  {
    id: 'whatsapp-group',
    label: 'קהילת Shift Up',
    handle: 'WhatsApp Group',
    href: COMMUNITY_LINK,
    hoverColor: 'oklch(0.785 0.173 156.6)',
    Icon: IconWhatsApp,
  },
];

// Fallback prompts shown if Supabase is unavailable
const FALLBACK_PROMPTS = [
  {
    id: 'brand-hijack', num: '02',
    title: 'חטיפת מותג · Trigger Marketing',
    subtitle: 'השתלטות על הרגלי הקהל שלך, בחינם',
    tag: 'שיווק פסיכולוגי',
    text: `אתה פועל כפסיכולוג התנהגותי ואסטרטג שיווקי מוביל.\n\nהעסק שלי: [תאר את העסק שלך - מה אתה עושה ולמי]\nקהל היעד שלי: [תאר בפירוט - גיל, עיסוק, כאב עיקרי, חלום עיקרי]\n\nשלב 1 - מיפוי טריגרים:\nזהה 5 דברים ספציפיים שהקהל שלי נתקל בהם כל יום - הרגלים, חפצים, מקומות, מילים או חוויות שחוזרים ברמה יומיומית.\n\nשלב 2 - השתלטות יצירתית:\nלכל טריגר, הצע שיטה חינמית, מעשית ויצירתית שבה אוכל לקשר אותו למותג שלי.\n\nפורמט הפלט:\nלכל טריגר (1–5):\n🎯 הטריגר: [שם ותיאור קצר]\n💡 ההשתלטות: [הפעולה הספציפית שתעשה]\n🔗 הקשר למותג: [למה זה ייצור אסוציאציה חזקה]\n⚡ קשיי יישום: [מה הכי חשוב לשים לב אליו]`,
  },
  {
    id: 'content-multiplier', num: '01',
    title: 'מכפיל התוכן',
    subtitle: '5 פוסטים מרעיון אחד',
    tag: 'תוכן ורשתות חברתיות',
    text: `אתה קופירייטר ויוצר תוכן מקצועי.\nאני בעל עסק בתחום [התחום שלך] וכתבתי בעבר פוסט על הנושא הבא:\n[העתיקו כאן את הפוסט המקורי שלכם / תארו את הנושא במשפט]\n\nאני רוצה שתציע לי 5 זוויות תוכן שונות לגמרי על אותו נושא בדיוק.\n\nהזוויות האפשריות:\n1. סיפור אישי\n2. טעות נפוצה\n3. שאלה שלקוח שאל\n4. השוואה\n5. מה למדתי בדרך הקשה`,
  },
];

// ─── ICONS ──────────────────────────────────────────────────────────────────

function IconWhatsApp({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function IconFacebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconLinkedIn({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconCopy({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* כל הטקסטים של הדף במקום אחד, כדי שיהיה קל להחליף כשהקופי החדש יגיע (סבב 2, 25.11.2026) */
const COPY = {
  badge: 'ספרייה חינמית · Shift Up',
  title: 'הנה הפרומפטים',
  titleAccent: 'שהבטחתי',
  sub1: 'כלי AI שאני משתמש בהם כל יום, לך, ממני, בלי עלות.',
  sub2: 'הספרייה גדלה עם כל פוסט חדש.',
  promptBar: 'הפרומפט',
  copy: 'העתק פרומפט',
  copied: 'הועתק ללוח',
  auditTag: 'אבחון חינם · 3 דקות',
  auditTitle: 'רוצה משהו מותאם',
  auditAccent: 'לך',
  auditBody: 'הפרומפטים כלליים, והאבחון האישי אומר לך בדיוק איפה השיווק שלך דולף: הציון שלך ו-3 הדברים לתקן קודם, בלי להשאיר פרטים.',
  auditBtn: 'עשה את האבחון ←',
  meName: 'שמואל מוניץ',
  meBody: 'אסטרטג שיווק + מומחה AI, קודם אני כותב לך תוכנית, ועליה אני מקים ומנהל את הקמפיין',
  waLead: 'רוצה לדעת בדיוק מה יביא לקוחות לעסק שלך?',
  waBtn: 'לשיחת היכרות חינם',
  social: 'בואו נתחבר',
  back: 'לאתר הראשי של Shift Up',
};

// ─── HIGHLIGHTED TEXT ───────────────────────────────────────────────────────
// Parses [placeholder] tokens and renders them highlighted in brand green

function Placeholders({ text }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) =>
    part.startsWith('[') && part.endsWith(']')
      ? <span key={i} className="c-prompt__ph">{part}</span>
      : <span key={i}>{part}</span>
  );
}

/* תצוגה בלבד (AD דפים 1, #8ג): "---" הופך לקו דק ו-"##" לשורת כותרת מודגשת, בלי הסימנים.
   כל שורה בגובה שורה אחד בדיוק, כך שהתיבה נחתכת תמיד בין שורות. מה שמועתק נשאר prompt.text כמו שהוא */
function HighlightedText({ text }) {
  return String(text).split('\n').map((line, i) => {
    const t = line.trim();
    if (/^-{3,}$/.test(t)) return <div key={i} className="c-prompt__rule" aria-hidden="true" />;
    const h = t.match(/^#{1,6}\s+(.*)$/);
    if (h) return <div key={i} className="c-prompt__h"><Placeholders text={h[1]} /></div>;
    return <div key={i}>{line ? <Placeholders text={line} /> : ' '}</div>;
  });
}

// ─── PROMPT CARD ────────────────────────────────────────────────────────────
/* כיוון C: בלי כרטיס מעוגל ובלי "חלון" עם נקודות צבע. פס ירוק עליון, תיבת טקסט לבנה חדה */

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);
  // דהייה בתחתית רק כשיש עוד טקסט מתחת (ונעלמת כשמגיעים לסוף)
  const boxRef = useRef(null);
  const [more, setMore] = useState(false);
  const onBoxScroll = () => {
    const b = boxRef.current;
    if (b) setMore(b.scrollHeight - b.scrollTop - b.clientHeight > 4);
  };
  useEffect(onBoxScroll, [prompt.text]);

  const handleCopy = useCallback(() => {
    const doCopy = () => {
      if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(prompt.text);
      }
      // Fallback for older iOS Safari
      const ta = Object.assign(document.createElement('textarea'), {
        value: prompt.text,
        readOnly: true,
      });
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); } catch (_) { /* silent */ }
      document.body.removeChild(ta);
      return Promise.resolve();
    };

    doCopy().then(() => {
      setCopied(true);
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', {
          content_name: prompt.id,
          content_category: 'freebies_prompt',
        });
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'copy_prompt', { prompt_id: prompt.id });
      }
      setTimeout(() => setCopied(false), 2600);
    });
  }, [prompt]);

  return (
    <article className="c-prompt">
      <div className="c-prompt__top">
        <span className="c-num">#{prompt.num}</span>
        <span className="c-prompt__tag">{prompt.tag}</span>
      </div>
      <h2>{prompt.title}</h2>
      <p className="c-prompt__sub"><Tied text={fin(nd(prompt.subtitle))} /></p>

      <div className="c-prompt__box">
        <div className="c-prompt__bar">{COPY.promptBar}</div>
        <div className={`c-prompt__text${more ? ' is-more' : ''}`} tabIndex={0} ref={boxRef} onScroll={onBoxScroll}>
          <HighlightedText text={prompt.text} />
        </div>
      </div>

      <div className="c-prompt__actions">
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'הפרומפט הועתק ללוח' : 'העתק את הפרומפט ללוח'}
          className={`c-btn c-btn--full${copied ? ' is-done' : ''}`}
        >
          {copied ? <><IconCheck size={17} /> {COPY.copied}</> : <><IconCopy size={17} /> {COPY.copy}</>}
        </button>

        {/* Resource button — file / video / link */}
        {prompt.resource_url && prompt.resource_type && (
          <a href={prompt.resource_url} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--full c-btn--ink">
            {prompt.resource_type === 'file'  && '⬇ '}
            {prompt.resource_type === 'video' && '▶ '}
            {prompt.resource_type === 'link'  && '↗ '}
            {prompt.resource_label || (prompt.resource_type === 'file' ? 'הורד קובץ' : prompt.resource_type === 'video' ? 'צפה בסרטון' : 'פתח לינק')}
          </a>
        )}
      </div>
    </article>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return <div className="c-prompt__skel" aria-hidden="true" />;
}

export default function FreePage() {
  const [prompts, setPrompts] = useState([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  useEffect(() => {
    supabase.from('prompts').select('*').order('position')
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setPrompts(FALLBACK_PROMPTS);
        } else {
          setPrompts(data.map((p, i) => ({
            id: p.slug,
            num: String(i + 1).padStart(2, '0'),
            title: p.title,
            subtitle: p.subtitle,
            tag: p.tag,
            text: p.body,
            resource_url: p.resource_url,
            resource_type: p.resource_type,
            resource_label: p.resource_label,
          })));
        }
        setLoadingPrompts(false);
      });
  }, []);

  // Page-level pixel events
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: 'Freebies Page',
        content_category: 'freebies',
      });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        item_id: 'freebies',
        item_name: 'Freebies Page',
      });
    }
  }, []);

  const handleWhatsApp = useCallback(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'freebies_wa_cta',
        content_category: 'freebies',
      });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        source: 'freebies',
        button: 'whatsapp_cta',
      });
    }
  }, []);

  /* כיוון C, קצב: כהה (פתיחה) · בהיר (הספרייה, טקסט לקריאה) · כהה (מי אני, שיחה, רשתות) */
  return (
    <div dir="rtl" className="c-page">
      <PageNav />
      <main>
        <section className="c-dark c-free__head" aria-labelledby="free-h">
          <div className="c-wrap">
            <span className="c-tag">{COPY.badge}</span>
            <h1 id="free-h" translate="no" className="c-phead__h1">
              {COPY.title} <span className="c-g">{COPY.titleAccent}</span>
            </h1>
            <p className="c-lead">
              <Tied text={fin(nd(COPY.sub1))} />
              <br />
              {nd(COPY.sub2)}
            </p>
          </div>
        </section>

        <section className="c-sec c-light" aria-label="הספרייה">
          <div className="c-wrap">
            <div className="c-free__count">
              <span>{loadingPrompts ? '...' : `${prompts.length} כלי${prompts.length !== 1 ? ' זמינים' : ' זמין'}`}</span>
            </div>
            <div className="c-free__grid">
              {loadingPrompts
                ? [1, 2].map(i => <SkeletonCard key={i} />)
                : prompts.map(p => <PromptCard key={p.id} prompt={p} />)}
            </div>

            {/* ── AUDIT CTA — המדרגה הבאה אחרי הפרומפטים הכלליים ── */}
            <Link
              to="/audit"
              className="c-free__audit"
              onClick={() => { if (typeof window.fbq === 'function') window.fbq('track', 'ViewContent', { content_name: 'Audit CTA', content_category: 'freebies' }); }}
            >
              <div>
                <span className="c-tag">{COPY.auditTag}</span>
                <h2>{COPY.auditTitle} <span className="c-g">{COPY.auditAccent}</span>?</h2>
                <p>{nd(COPY.auditBody)}</p>
              </div>
              <span className="c-btn">{COPY.auditBtn}</span>
            </Link>
          </div>
        </section>

        <section className="c-sec c-dark c-dark--2" aria-label="מי אני">
          <div className="c-wrap c-free__end">
            <div>
              <div className="c-free__me">
                <img src="/shmuel.jpg" alt={COPY.meName} loading="lazy" />
                <div>
                  <b>{COPY.meName}</b>
                  <p>{nd(COPY.meBody)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="c-free__wa">
                <p>{COPY.waLead}</p>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="c-btn">
                  <IconWhatsApp size={20} />
                  {COPY.waBtn}
                </a>
              </div>

              <div className="c-free__social-h">{COPY.social}</div>
              <div className="c-free__social">
                {SOCIAL.map(({ id, label, handle, href, Icon }) => (
                  <a key={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`עקוב ב-${label}`}>
                    <Icon size={20} />
                    <span style={{ minWidth: 0 }}>
                      <b>{label}</b>
                      <small dir="auto">{handle}</small>
                    </span>
                  </a>
                ))}
              </div>

              <div className="c-free__back">
                <Link to="/" className="c-q">{COPY.back}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
