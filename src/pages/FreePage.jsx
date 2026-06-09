import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── CONFIGURATION ─────────────────────────────────────────────────────────
//
// 📌 UTM REMINDER — When sharing this page from social posts, always add:
//    ?utm_source=instagram&utm_medium=social&utm_campaign=freebies
//    Example: https://www.shiftup.marketing/freebies?utm_source=instagram&utm_medium=social&utm_campaign=freebies
//    Without UTM params, ALL traffic from posts shows as "direct" in GA4.
//
// ➕ ADD A PROMPT — push a new object into the PROMPTS array below.
//    Required keys: id (unique string), title, subtitle, tag, text
//
// ──────────────────────────────────────────────────────────────────────────

const WA_LINK =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, רוצה לדבר על השיווק של העסק שלי');

const COMMUNITY_LINK = 'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3';

const PROMPTS = [
  {
    id: 'content-multiplier',
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
  // ← הוסיפו פרומפטים נוספים כאן בעתיד
];

// ─── ICONS ─────────────────────────────────────────────────────────────────

function IconWhatsApp({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function IconInstagram({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function IconFacebook({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconLinkedIn({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function IconArrowLeft({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );
}

// ─── PROMPT CARD ────────────────────────────────────────────────────────────

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    // navigator.clipboard with fallback for older iOS Safari
    const doCopy = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(prompt.text);
      }
      // Fallback: temporary textarea
      const ta = document.createElement('textarea');
      ta.value = prompt.text;
      ta.setAttribute('readonly', '');
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

      // Meta Pixel — CompleteRegistration (strong intent signal)
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', {
          content_name: prompt.id,
          content_category: 'freebies_prompt',
        });
      }
      // GA4
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'copy_prompt', { prompt_id: prompt.id });
      }

      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        borderRadius: 20,
        padding: '20px 20px 16px',
        border: '1.5px solid oklch(0.78 0.20 145 / 0.18)',
        boxShadow: '0 0 40px oklch(0.78 0.20 145 / 0.04)',
      }}
    >
      {/* Category tag */}
      <div
        className="chip"
        style={{ marginBottom: 10, width: 'fit-content', fontSize: '0.75rem' }}
      >
        <span style={{
          width: 5, height: 5,
          borderRadius: '50%',
          background: 'var(--brand-prime)',
          display: 'block',
          flexShrink: 0,
          boxShadow: '0 0 5px var(--brand-prime)',
        }} />
        {prompt.tag}
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 900,
        color: 'var(--text-primary)',
        marginBottom: 2,
        letterSpacing: '-0.02em',
      }}>
        {prompt.title}
      </h2>
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--brand-prime)',
        fontWeight: 700,
        marginBottom: 16,
      }}>
        {prompt.subtitle}
      </p>

      {/* Prompt text box */}
      <div style={{
        background: 'oklch(0.07 0.01 240 / 0.9)',
        border: '1px solid oklch(0.97 0.005 240 / 0.08)',
        borderRadius: 12,
        padding: '14px 16px',
        fontSize: '0.82rem',
        lineHeight: 1.75,
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap',
        fontFamily: "'Heebo', sans-serif",
        direction: 'rtl',
        textAlign: 'right',
        marginBottom: 12,
        maxHeight: 200,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
      }}>
        {prompt.text}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        aria-label={copied ? 'הפרומפט הועתק ללוח' : 'העתק פרומפט ללוח'}
        style={{
          width: '100%',
          padding: '13px 0',
          borderRadius: 12,
          border: `1.5px solid ${copied
            ? 'oklch(0.78 0.20 145 / 0.5)'
            : 'oklch(0.78 0.20 145 / 0.2)'}`,
          background: copied
            ? 'oklch(0.78 0.20 145 / 0.12)'
            : 'oklch(0.78 0.20 145 / 0.06)',
          color: copied ? 'var(--brand-prime)' : 'var(--text-primary)',
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => {
          if (!copied) {
            e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.12)';
            e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.35)';
          }
        }}
        onMouseLeave={e => {
          if (!copied) {
            e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.06)';
            e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.2)';
          }
        }}
      >
        {copied ? (
          <> ✓ הועתק ללוח</>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            העתק פרומפט
          </>
        )}
      </button>
    </div>
  );
}

// ─── SOCIAL BUTTON ──────────────────────────────────────────────────────────

function SocialBtn({ href, icon, label, accentColor }) {
  const icons = {
    instagram: <IconInstagram size={18} />,
    facebook:  <IconFacebook size={18} />,
    linkedin:  <IconLinkedIn size={18} />,
    whatsapp:  <IconWhatsApp size={18} />,
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        flex: '1 1 calc(50% - 6px)',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '12px 8px',
        borderRadius: 14,
        background: 'oklch(0.14 0.02 240 / 0.7)',
        border: '1.5px solid oklch(0.97 0.005 240 / 0.08)',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        fontSize: '0.82rem',
        fontWeight: 700,
        fontFamily: "'Heebo', sans-serif",
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = accentColor || 'var(--brand-prime)';
        e.currentTarget.style.borderColor = (accentColor || 'oklch(0.78 0.20 145)') + ' / 0.3)'.replace(' / 0.3)', '');
        e.currentTarget.style.borderColor = accentColor
          ? accentColor.replace(')', ' / 0.35)')
          : 'oklch(0.78 0.20 145 / 0.35)';
        e.currentTarget.style.background = 'oklch(0.16 0.02 240 / 0.9)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'oklch(0.97 0.005 240 / 0.08)';
        e.currentTarget.style.background = 'oklch(0.14 0.02 240 / 0.7)';
      }}
    >
      {icons[icon]}
      {label}
    </a>
  );
}

// ─── PAGE ───────────────────────────────────────────────────────────────────

export default function FreePage() {
  useEffect(() => {
    // Meta Pixel — ViewContent
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: 'Freebies Page',
        content_category: 'freebies',
      });
    }
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        item_id: 'freebies',
        item_name: 'Freebies Page',
      });
    }
  }, []);

  function handleWhatsApp() {
    // Meta Pixel — Lead
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'freebies_wa_cta',
        content_category: 'freebies',
      });
    }
    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        source: 'freebies',
        button: 'whatsapp_cta',
      });
    }
  }

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100dvh',
        background: 'var(--bedrock)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Heebo', sans-serif",
      }}
    >
      {/* Aurora blobs */}
      <div className="aurora-orb" style={{
        width: 500, height: 500,
        top: '-10%', left: '50%',
        transform: 'translateX(-50%)',
        background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.09), transparent 70%)',
        '--dur': '26s',
      }} />
      <div className="aurora-orb" style={{
        width: 360, height: 360,
        bottom: '5%', right: '-10%',
        background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.12), transparent 70%)',
        '--dur': '32s', '--delay': '-11s',
      }} />
      <div className="aurora-orb" style={{
        width: 280, height: 280,
        top: '40%', left: '-10%',
        background: 'radial-gradient(circle, oklch(0.65 0.22 200 / 0.10), transparent 70%)',
        '--dur': '22s', '--delay': '-6s',
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'ig-fade-up 0.55s ease-out both',
      }}>

        {/* ── LOGO ── */}
        <img
          src="/logo.png"
          alt="Shift Up"
          style={{
            height: 52,
            width: 'auto',
            marginBottom: 32,
            animation: 'hue-drift 8s ease-in-out infinite',
          }}
        />

        {/* ── HERO ── */}
        <h1
          translate="no"
          style={{
            fontSize: 'clamp(1.6rem, 6vw, 2.1rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            textAlign: 'center',
            marginBottom: 10,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          הנה הפרומפטים שהבטחתי
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: 36,
          maxWidth: 340,
        }}>
          כלי AI חינמיים לבעלי עסקים — ישירות ממה שאני משתמש בו כל יום.
          <br />
          מעדכן את הספרייה הזו כל הזמן.
        </p>

        {/* ── PROMPTS ── */}
        <div style={{ width: '100%', marginBottom: 8 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
          }}>
            <div className="glow-divider" style={{ flex: 1 }} />
            <span style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              letterSpacing: '0.05em',
            }}>
              הספרייה
            </span>
            <div className="glow-divider" style={{ flex: 1 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PROMPTS.map(p => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="glow-divider" style={{ width: '100%', margin: '32px 0 28px' }} />

        {/* ── ABOUT STRIP ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          width: '100%',
          marginBottom: 24,
          padding: '16px 18px',
          borderRadius: 16,
          background: 'oklch(0.12 0.015 240 / 0.6)',
          border: '1px solid oklch(0.97 0.005 240 / 0.07)',
        }}>
          <img
            src="/shmuel.png"
            alt="שמואל מוניץ"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              objectFit: 'cover',
              objectPosition: 'center top',
              flexShrink: 0,
              border: '2px solid oklch(0.78 0.20 145 / 0.35)',
            }}
          />
          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 3,
            }}>
              שמואל מוניץ · Shift Up
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              אסטרטג שיווק דיגיטלי ומומחה AI.
              עוזר לבעלי עסקים לגדול עם אסטרטגיה חדה וכלי AI שחוסכים זמן.
            </div>
          </div>
        </div>

        {/* ── WHATSAPP CTA ── */}
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
            padding: '0 24px',
            minHeight: 62,
            background: 'var(--brand-prime)',
            color: 'oklch(0.08 0.01 240)',
            borderRadius: 18,
            fontWeight: 800,
            fontSize: '1.05rem',
            fontFamily: "'Heebo', sans-serif",
            textDecoration: 'none',
            boxShadow:
              '0 4px 40px oklch(0.78 0.20 145 / 0.4), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset',
            marginBottom: 14,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 50px oklch(0.78 0.20 145 / 0.55), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 40px oklch(0.78 0.20 145 / 0.4), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset';
          }}
        >
          <IconWhatsApp size={20} />
          לדבר על השיווק של העסק שלי
        </a>

        {/* ── SOCIAL GRID ── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          width: '100%',
          marginBottom: 36,
        }}>
          <SocialBtn
            href="https://www.instagram.com/shiftup.il"
            icon="instagram"
            label="Instagram"
            accentColor="oklch(0.75 0.22 340"
          />
          <SocialBtn
            href="https://www.facebook.com/share/1BZ8HrpBeo/"
            icon="facebook"
            label="Facebook"
            accentColor="oklch(0.65 0.18 265"
          />
          <SocialBtn
            href="https://www.linkedin.com/in/shmuel-munitz-marketing"
            icon="linkedin"
            label="LinkedIn"
            accentColor="oklch(0.62 0.18 245"
          />
          <SocialBtn
            href={COMMUNITY_LINK}
            icon="whatsapp"
            label="קהילת Shift Up"
            accentColor="oklch(0.78 0.20 145"
          />
        </div>

        {/* ── LINK TO MAIN SITE ── */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; }}
        >
          <IconArrowLeft size={14} />
          לאתר הראשי של Shift Up
        </Link>

      </div>
    </div>
  );
}
