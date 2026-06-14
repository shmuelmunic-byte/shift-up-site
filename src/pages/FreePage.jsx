import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ─── CONFIGURATION ──────────────────────────────────────────────────────────
//
// 📌 UTM — When sharing from social posts, add to the URL:
//    ?utm_source=instagram&utm_medium=social&utm_campaign=freebies
//    Without UTM, all traffic appears as "direct" in GA4.
//
// ➕ ADD A PROMPT — push a new object to the PROMPTS array below.
//    Fields: id (unique), title, subtitle, tag, text
//
// ────────────────────────────────────────────────────────────────────────────

const WA_LINK =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, רוצה לדבר על השיווק של העסק שלי');

const COMMUNITY_LINK =
  'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3';

const SOCIAL = [
  {
    id: 'instagram',
    label: 'אינסטגרם',
    handle: '@shiftup.il',
    href: 'https://www.instagram.com/shiftup.il',
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
    hoverColor: 'oklch(0.78 0.20 145)',
    Icon: IconWhatsApp,
  },
];

const PROMPTS = [
  {
    id: 'brand-hijack',
    num: '02',
    title: 'חטיפת מותג — Trigger Marketing',
    subtitle: 'השתלטות על הרגלי הקהל שלך — בחינם',
    tag: 'שיווק פסיכולוגי',
    text: `אתה פועל כפסיכולוג התנהגותי ואסטרטג שיווקי מוביל.

העסק שלי: [תאר את העסק שלך — מה אתה עושה ולמי]
קהל היעד שלי: [תאר בפירוט — גיל, עיסוק, כאב עיקרי, חלום עיקרי]

שלב 1 — מיפוי טריגרים:
זהה 5 דברים ספציפיים שהקהל שלי נתקל בהם כל יום — הרגלים, חפצים, מקומות, מילים או חוויות שחוזרים ברמה יומיומית. חשוב: הדברים צריכים להיות קונקרטיים וספציפיים לקהל הזה, לא גנריים.

שלב 2 — השתלטות יצירתית:
לכל טריגר, הצע שיטה חינמית, מעשית ויצירתית שבה אוכל לקשר אותו למותג שלי — כך שבכל פעם שהם נתקלים בו, הם חושבים עליי אוטומטית.

הגבלות: ללא פרסום בתשלום. ללא כלים יקרים. רק יצירתיות, נוכחות וחיבור רגשי.

פורמט הפלט:
לכל טריגר (1–5):
🎯 הטריגר: [שם ותיאור קצר]
💡 ההשתלטות: [הפעולה הספציפית שתעשה]
🔗 הקשר למותג: [למה זה ייצור אסוציאציה חזקה]
⚡ קשיי יישום: [מה הכי חשוב לשים לב אליו]

בסוף — כתוב 1-2 משפטים על למה הטריגר החזק ביותר הוא _________ עבור הקהל הספציפי הזה.`,
  },
  {
    id: 'content-multiplier',
    num: '01',
    title: 'מכפיל התוכן',
    subtitle: '5 פוסטים מרעיון אחד',
    tag: 'תוכן ורשתות חברתיות',
    text: `אתה קופירייטר ויוצר תוכן מקצועי.
אני בעל עסק בתחום [התחום שלך] וכתבתי בעבר פוסט/נתתי תשובה ללקוח על הנושא הבא:
[העתיקו כאן את הפוסט המקורי שלכם / תארו את הנושא במשפט]

אני רוצה שתציע לי 5 זוויות תוכן שונות לגמרי על אותו נושא בדיוק.
כל זווית צריכה להרגיש כמו פוסט חדש לחלוטין, אבל לשבת על אותה תובנה מרכזית.

הזוויות האפשריות:
1. סיפור אישי – מקרה שקרה לי שממחיש את הנקודה
2. טעות נפוצה – מה אנשים עושים לא נכון בנושא הזה
3. שאלה שלקוח שאל – איך לגשת לנושא דרך שאלה אמיתית
4. השוואה – שתי גישות שונות לאותו נושא, מה עובד יותר
5. מה למדתי בדרך הקשה – תובנה שהבנתי רק אחרי שטעיתי

הצג את הזוויות כרשימה ממוספרת, עם משפט הסבר קצר לכל אחת`,
  },
  // ← הוסיפו פרומפטים נוספים כאן
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

function IconArrowLeft({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

function IconExternalLink({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── HIGHLIGHTED TEXT ───────────────────────────────────────────────────────
// Parses [placeholder] tokens and renders them highlighted in brand green

function HighlightedText({ text }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('[') && part.endsWith(']') ? (
          <span
            key={i}
            style={{
              color: 'var(--brand-prime)',
              fontWeight: 700,
              background: 'oklch(0.78 0.20 145 / 0.13)',
              borderRadius: 4,
              padding: '1px 4px',
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ─── PROMPT CARD ────────────────────────────────────────────────────────────

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);

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
    <article
      style={{
        width: '100%',
        borderRadius: 22,
        background: 'oklch(0.11 0.015 240)',
        border: '1.5px solid oklch(0.97 0.005 240 / 0.08)',
        overflow: 'hidden',
        boxShadow: '0 0 60px oklch(0.78 0.20 145 / 0.05), 0 2px 20px oklch(0 0 0 / 0.4)',
        position: 'relative',
      }}
    >
      {/* Green top accent bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, var(--brand-deep) 0%, var(--brand-prime) 55%, var(--brand-glow) 100%)',
      }} />

      <div style={{ padding: '22px 22px 20px' }}>

        {/* Card header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 10,
        }}>
          {/* Number badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'oklch(0.78 0.20 145 / 0.12)',
            border: '1.5px solid oklch(0.78 0.20 145 / 0.3)',
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: 'var(--brand-prime)',
              letterSpacing: '0.02em',
              fontFamily: "'Heebo', sans-serif",
            }}>
              #{prompt.num}
            </span>
          </div>

          {/* Category chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 100,
            background: 'oklch(0.14 0.02 240)',
            border: '1px solid oklch(0.97 0.005 240 / 0.1)',
            fontSize: '0.73rem',
            color: 'var(--text-muted)',
            fontWeight: 700,
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: 'var(--brand-prime)',
              boxShadow: '0 0 5px var(--brand-prime)',
              flexShrink: 0,
              animation: 'breathing 2.5s ease-in-out infinite',
            }} />
            {prompt.tag}
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 'clamp(1.3rem, 5vw, 1.55rem)',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          lineHeight: 1.1,
          marginBottom: 5,
        }}>
          {prompt.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '0.88rem',
          fontWeight: 700,
          color: 'var(--brand-prime)',
          marginBottom: 20,
          letterSpacing: '0.01em',
        }}>
          {prompt.subtitle}
        </p>

        {/* Prompt text box */}
        <div style={{
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid oklch(0.97 0.005 240 / 0.07)',
          marginBottom: 14,
        }}>
          {/* Text box header — label bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            background: 'oklch(0.09 0.012 240)',
            borderBottom: '1px solid oklch(0.97 0.005 240 / 0.06)',
          }}>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              הפרומפט
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {['oklch(0.65 0.18 25)', 'oklch(0.75 0.18 80)', 'oklch(0.65 0.2 145)'].map((c, i) => (
                <div key={i} style={{
                  width: 9, height: 9,
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.7,
                }} />
              ))}
            </div>
          </div>

          {/* Scrollable text */}
          <div style={{
            padding: '16px 16px',
            background: 'oklch(0.07 0.008 240)',
            fontSize: '0.83rem',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            fontFamily: "'Heebo', sans-serif",
            direction: 'rtl',
            textAlign: 'right',
            maxHeight: 210,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: 'oklch(0.3 0.015 240) transparent',
          }}>
            <HighlightedText text={prompt.text} />
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          aria-label={copied ? 'הפרומפט הועתק ללוח' : 'העתק את הפרומפט ללוח'}
          style={{
            width: '100%',
            minHeight: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
            borderRadius: 12,
            border: `1.5px solid ${copied
              ? 'oklch(0.78 0.20 145 / 0.6)'
              : 'oklch(0.78 0.20 145 / 0.22)'}`,
            background: copied
              ? 'oklch(0.78 0.20 145 / 0.14)'
              : 'oklch(0.78 0.20 145 / 0.07)',
            color: copied ? 'var(--brand-prime)' : 'var(--text-primary)',
            fontFamily: "'Heebo', sans-serif",
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.22s ease',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            if (copied) return;
            e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.13)';
            e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.4)';
            e.currentTarget.style.color = 'var(--brand-prime)';
          }}
          onMouseLeave={e => {
            if (copied) return;
            e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.07)';
            e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.22)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          {copied
            ? <><IconCheck size={17} /> הועתק ללוח</>
            : <><IconCopy size={17} /> העתק פרומפט</>
          }
        </button>
      </div>
    </article>
  );
}

// ─── SOCIAL CARD ────────────────────────────────────────────────────────────

function SocialCard({ label, handle, href, hoverColor, Icon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`עקוב ב-${label}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '1 1 calc(50% - 6px)',
        minWidth: 0,
        minHeight: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '13px 16px',
        borderRadius: 16,
        background: hovered ? 'oklch(0.15 0.02 240)' : 'oklch(0.12 0.015 240)',
        border: `1.5px solid ${hovered ? 'oklch(0.78 0.20 145 / 0.28)' : 'oklch(0.97 0.005 240 / 0.08)'}`,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Icon square */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: hovered ? 'oklch(0.78 0.20 145 / 0.1)' : 'oklch(0.14 0.02 240)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: hovered ? hoverColor : 'var(--text-muted)',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}>
        <Icon size={18} />
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'color 0.2s ease',
          lineHeight: 1.2,
          marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '0.72rem',
          color: hovered ? hoverColor : 'var(--text-muted)',
          fontWeight: 600,
          transition: 'color 0.2s ease',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {handle}
        </div>
      </div>

      {/* Arrow */}
      <div style={{
        marginRight: 'auto',
        marginLeft: 0,
        color: hovered ? 'var(--text-muted)' : 'transparent',
        transition: 'color 0.2s ease',
        flexShrink: 0,
      }}>
        <IconExternalLink size={13} />
      </div>
    </a>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function FreePage() {
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

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100dvh',
        background: 'var(--bedrock)',
        fontFamily: "'Heebo', sans-serif",
        position: 'relative',
        overscrollBehavior: 'contain',
      }}
    >
      {/* ── Background aurora ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="aurora-orb" style={{
          width: 560, height: 560,
          top: '-12%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.07), transparent 70%)',
          '--dur': '28s',
        }} />
        <div className="aurora-orb" style={{
          width: 400, height: 400,
          bottom: '0%', right: '-12%',
          background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.10), transparent 70%)',
          '--dur': '35s', '--delay': '-12s',
        }} />
        <div className="aurora-orb" style={{
          width: 300, height: 300,
          top: '45%', left: '-10%',
          background: 'radial-gradient(circle, oklch(0.65 0.22 200 / 0.08), transparent 70%)',
          '--dur': '22s', '--delay': '-7s',
        }} />
      </div>

      {/* ── Main scroll container ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '44px 18px 80px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'ig-fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>

          {/* ── LOGO ── */}
          <img
            src="/logo.png"
            alt="Shift Up"
            style={{
              height: 50,
              width: 'auto',
              marginBottom: 36,
              animation: 'hue-drift 8s ease-in-out infinite',
            }}
          />

          {/* ── HERO ── */}
          <div style={{ textAlign: 'center', marginBottom: 40, width: '100%' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 14px',
              borderRadius: 100,
              background: 'oklch(0.78 0.20 145 / 0.08)',
              border: '1px solid oklch(0.78 0.20 145 / 0.25)',
              marginBottom: 18,
            }}>
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'var(--brand-prime)',
                boxShadow: '0 0 6px var(--brand-prime)',
                display: 'block',
                animation: 'breathing 2s ease-in-out infinite',
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--brand-prime)',
                letterSpacing: '0.04em',
              }}>
                ספרייה חינמית · Shift Up
              </span>
            </div>

            {/* Headline — split for gradient on second word */}
            <h1
              translate="no"
              style={{
                fontSize: 'clamp(1.9rem, 7vw, 2.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                marginBottom: 14,
              }}
            >
              הנה הפרומפטים{' '}
              <span className="kword-gradient" style={{ '--word-delay': '0.1s' }}>
                שהבטחתי
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              maxWidth: 340,
              margin: '0 auto',
            }}>
              כלי AI שאני משתמש בהם כל יום — לך, ממני, בלי עלות.
              <br />
              הספרייה גדלה עם כל פוסט חדש.
            </p>
          </div>

          {/* ── LIBRARY HEADER ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            width: '100%',
            marginBottom: 16,
          }}>
            <div className="glow-divider" style={{ flex: 1 }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: '0.73rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              <span>{PROMPTS.length} כלי{PROMPTS.length !== 1 ? ' זמינים' : ' זמין'}</span>
            </div>
            <div className="glow-divider" style={{ flex: 1 }} />
          </div>

          {/* ── PROMPT CARDS ── */}
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginBottom: 36,
          }}>
            {PROMPTS.map(p => <PromptCard key={p.id} prompt={p} />)}
          </div>

          {/* ── SEPARATOR ── */}
          <div className="glow-divider" style={{ width: '100%', marginBottom: 28 }} />

          {/* ── ABOUT STRIP ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            width: '100%',
            marginBottom: 16,
            padding: '16px 18px',
            borderRadius: 18,
            background: 'oklch(0.12 0.015 240 / 0.7)',
            border: '1px solid oklch(0.97 0.005 240 / 0.07)',
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src="/shmuel.png"
                alt="שמואל מוניץ"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  border: '2px solid oklch(0.78 0.20 145 / 0.3)',
                  display: 'block',
                }}
              />
              {/* Online dot */}
              <div style={{
                position: 'absolute',
                bottom: 2, right: 2,
                width: 11, height: 11,
                borderRadius: '50%',
                background: 'var(--brand-prime)',
                border: '2px solid oklch(0.12 0.015 240)',
                boxShadow: '0 0 6px var(--brand-prime)',
              }} />
            </div>
            <div style={{ textAlign: 'right', minWidth: 0 }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 3,
                letterSpacing: '-0.01em',
              }}>
                שמואל מוניץ
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                אסטרטג שיווק דיגיטלי ומומחה AI.
                עוזר לבעלי עסקים לגדול עם אסטרטגיה חדה.
              </div>
            </div>
          </div>

          {/* ── WHATSAPP CTA ── */}
          <div style={{ width: '100%', marginBottom: 6 }}>
            <p style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: 10,
              fontWeight: 600,
            }}>
              רוצה שיחת אסטרטגיה ממוקדת?
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                minHeight: 60,
                background: 'var(--brand-prime)',
                color: 'oklch(0.07 0.01 240)',
                borderRadius: 18,
                fontWeight: 800,
                fontSize: '1.05rem',
                fontFamily: "'Heebo', sans-serif",
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow:
                  '0 4px 45px oklch(0.78 0.20 145 / 0.4), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 55px oklch(0.78 0.20 145 / 0.55), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 45px oklch(0.78 0.20 145 / 0.4), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset';
              }}
            >
              <IconWhatsApp size={20} />
              לדבר על השיווק של העסק שלי
            </a>
          </div>

          {/* ── SOCIAL SECTION ── */}
          <div style={{ width: '100%', marginTop: 28, marginBottom: 36 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
            }}>
              <div className="glow-divider" style={{ flex: 1 }} />
              <span style={{
                fontSize: '0.73rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                בואו נתחבר
              </span>
              <div className="glow-divider" style={{ flex: 1 }} />
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}>
              {SOCIAL.map(s => (
                <SocialCard key={s.id} {...s} />
              ))}
            </div>
          </div>

          {/* ── BACK TO MAIN SITE ── */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              opacity: 0.5,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; }}
          >
            <IconArrowLeft size={14} />
            לאתר הראשי של Shift Up
          </Link>

        </div>
      </div>
    </div>
  );
}
