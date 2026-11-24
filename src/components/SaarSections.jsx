/* ── סקשנים לפי שיטת סער בל לדף ארוך לקהל קר (24.11.2026) ──
   עדויות אמיתיות (מקור: וואטסאפ/הקלטה, אישור שם התקבל), ריבוע הבטחה באמצע הדף,
   למי מתאים / למי לא, ואני מול רוב השוק (טבלה כנה, שורה אחת שגם לאחרים יש).
   ציטוטים מילה במילה, השמטות מסומנות ב-"...". */

export const TESTIMONIALS = [
  {
    name: 'דניאל עזרן',
    role: 'D&D פרויקטים, שיפוצים וגמר',
    logo: '/clients/dd.png',
    quote: 'יצא יפה מאוד, זה המודעה שהוספנו בסוף, דווקא אליה אני הכי מתחבר, הקרדיט מגיע לך',
    source: 'מתוך וואטסאפ',
  },
  {
    name: 'רועי קפח',
    role: 'מנהל מכינה קדם צבאית אורות',
    logo: '/clients/orot-mark.png',
    quote: 'לעבוד עם שמואל זה ממש באווירה טובה, הכל בשקיפות... הוא זמין ממש... אתה רואה שהוא עושה את זה מכל הלב ומכל הנשמה',
    source: 'מתוך הודעה קולית',
  },
];

const wrap = { maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 };
const h2 = { fontSize: 'clamp(1.9rem, 4.6vw, 3rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 14 };
const lead = { fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 640 };
const sec = (bg) => ({ padding: 'clamp(52px, 7vw, 88px) 24px', background: bg, position: 'relative' });

function ctaBtn(onContact, label = 'לשיחת היכרות') {
  return (
    <button
      type="button"
      onClick={onContact}
      style={{
        background: 'var(--brand-prime)', color: 'oklch(0.12 0.02 160)', border: 'none',
        borderRadius: 'var(--radius)', padding: '15px 32px', fontWeight: 700, fontSize: '1.02rem',
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

/* ── עדויות ── */
export function Testimonials() {
  return (
    <section id="testimonials" className="su-glow" style={sec('var(--surface-0)')}>
      <div style={wrap}>
        <div className="section-label">עדויות</div>
        <h2 style={h2}>
          לא צריך להאמין לי, <span style={{ color: 'var(--brand-prime)' }}>תשמע מהם</span>
        </h2>
        <p style={{ ...lead, marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          מה שלקוחות כתבו לי בוואטסאפ, מילה במילה
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))', gap: 18 }}>
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="su-depth"
              style={{
                margin: 0, padding: 'clamp(28px, 3.4vw, 40px)', paddingTop: 'clamp(36px, 4vw, 48px)',
                borderInlineStart: '3px solid var(--brand-prime)', display: 'flex', flexDirection: 'column', gap: 22,
              }}
            >
              <span className="su-quote-mark" aria-hidden="true">"</span>
              <span className="su-chip" style={{ alignSelf: 'flex-start' }}><span>{t.source}</span></span>
              <blockquote style={{ margin: 0, position: 'relative', fontSize: 'clamp(1.12rem, 2.2vw, 1.32rem)', lineHeight: 1.55, color: 'var(--text-primary)', fontWeight: 500 }}>
                "{t.quote}"
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
                <span style={{ width: 64, height: 64, flexShrink: 0, display: 'grid', placeItems: 'center', background: 'oklch(0.08 0.01 240)', border: '1px solid oklch(0.28 0.02 240)' }}>
                  <img src={t.logo} alt={t.role} loading="lazy" style={{ maxHeight: 44, maxWidth: 50, objectFit: 'contain' }} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ההבטחה שלי אליך (ריבוע עוצר באמצע הגלילה) ── */
export function Guarantee({ onContact }) {
  return (
    <section id="guarantee" className="su-glow su-glow--violet" style={sec('var(--bedrock)')}>
      <div style={{ ...wrap, maxWidth: 820 }}>
        <div className="su-offset" style={{ border: '2px solid var(--brand-prime)', padding: 'clamp(28px, 5vw, 56px)', background: 'linear-gradient(165deg, oklch(0.2 0.04 160), var(--surface-0) 70%)', textAlign: 'center', boxShadow: '0 40px 80px -40px oklch(0 0 0 / 0.8), 0 0 60px -20px oklch(0.785 0.173 156.6 / 0.25)' }}>
          <div style={{ marginBottom: 18 }}><span className="su-chip" style={{ fontSize: '0.9rem', padding: '6px 14px' }}><span>ההבטחה שלי אליך</span></span></div>
          <h2 style={{ ...h2, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', marginBottom: 18 }}>
            אם בחודש הניהול הראשון אין פניות, אני מנהל עוד חודש בחינם
          </h2>
          <p style={{ ...lead, margin: '0 auto 14px' }}>
            זה לא "חודש ראשון חינם", אתה משלם על ההקמה ועל הניהול כרגיל, אבל אם החודש הראשון לא הביא פניות, החודש השני עליי
          </p>
          <p style={{ ...lead, margin: '0 auto 28px' }}>
            ואם גם אחרי חודשיים אין פניות, אני אומר לך את זה בפנים ועוצרים, בלי לשרוף לך עוד כסף
          </p>
          {ctaBtn(onContact)}
        </div>
      </div>
    </section>
  );
}

/* ── למי זה מתאים / למי לא ── */
const FIT_YES = [
  'יש לך עסק שעובד ולקוחות שמרוצים ממך, וחסרות לך פניות קבועות',
  'כבר ניסית פרסום, לבד או עם מישהו, והכסף יצא בלי שהפניות נכנסו',
  'אתה מוכן להשקיע בפרסום ולמדוד אותו לפי כמה לקוח אחד שווה לך',
  'אתה רוצה מישהו שאחראי על השיווק ומדווח לך, בלי שתרדוף אחריו',
];
const FIT_NO = [
  'אתה רק מתחיל ועוד לא ברור לך מה אתה מוכר ולמי',
  'אתה מחפש את המחיר הכי זול בשוק',
  'אתה רוצה לייקים ועוקבים, לא פניות',
  'אתה מצפה לתוצאות כבר בשבוע הראשון',
];

function FitList({ title, items, yes }) {
  return (
    <div className={yes ? 'su-depth su-offset' : 'su-depth'} style={{ padding: 'clamp(24px, 3vw, 34px)', borderTop: `3px solid ${yes ? 'var(--brand-prime)' : 'var(--text-muted)'}` }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 18 }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((it) => (
          <li key={it} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <span aria-hidden="true" style={{ flexShrink: 0, fontWeight: 700, color: yes ? 'var(--brand-prime)' : 'var(--text-muted)' }}>{yes ? '✓' : '✕'}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Fit() {
  return (
    <section id="fit" className="su-glow" style={sec('var(--surface-0)')}>
      <div style={wrap}>
        <div className="section-label">למי זה מתאים</div>
        <h2 style={{ ...h2, marginBottom: 'clamp(28px, 4vw, 40px)' }}>
          אני לא עובד עם כולם, <span style={{ color: 'var(--brand-prime)' }}>וזה בכוונה</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: 18 }}>
          <FitList title="זה מתאים לך אם" items={FIT_YES} yes />
          <FitList title="זה לא בשבילך אם" items={FIT_NO} />
        </div>
      </div>
    </section>
  );
}

/* ── אצלי מול רוב השוק (במקום כרטיסי "למה אני") ── */
const ROWS = [
  ['איפה מתחילים', 'מחקר קהל, מתחרים ומסר', '"בוא נעלה קמפיין ונראה"'],
  ['אם החודש הראשון לא הביא פניות', 'חודש ניהול נוסף בחינם', 'ממשיכים לשלם'],
  ['מה שלא עובד', 'נאמר לך בקול, כל שבוע', 'מתגלה בדוח בסוף החודש'],
  ['המחיר', 'סגור מראש, בשיחת ההיכרות', 'חבילות ותוספות'],
  ['ניהול קמפיינים במטא ובגוגל', '✓', '✓'],
];

export function Comparison() {
  const cell = { padding: '16px 14px', borderBottom: '1px solid oklch(0.24 0.02 240)', lineHeight: 1.5, verticalAlign: 'top' };
  return (
    <section id="why" className="su-glow su-glow--violet" style={sec('var(--bedrock)')}>
      <div style={{ ...wrap, maxWidth: 900 }}>
        <div className="section-label">למה אני</div>
        <h2 style={h2}>
          מה שונה <span style={{ color: 'var(--brand-prime)' }}>כשעובדים איתי</span>
        </h2>
        <p style={{ ...lead, marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          להעלות קמפיין יודעים גם אחרים, ההבדל הוא מה קורה לפני, ומה קורה כשמשהו לא עובד
        </p>
        <div className="su-depth" style={{ overflowX: 'auto', padding: 'clamp(6px, 1.5vw, 14px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.88rem, 2vw, 1rem)', minWidth: 320 }}>
            <thead>
              <tr>
                <th style={{ ...cell, textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600, width: '34%' }} />
                <th style={{ ...cell, textAlign: 'right', color: 'var(--brand-prime)', fontWeight: 700, background: 'oklch(0.785 0.173 156.6 / 0.06)' }}>אצלי</th>
                <th style={{ ...cell, textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>ברוב המקומות</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([k, me, them]) => (
                <tr key={k}>
                  <td style={{ ...cell, color: 'var(--text-secondary)', fontWeight: 600 }}>{k}</td>
                  <td style={{ ...cell, color: 'var(--text-primary)', fontWeight: 600, background: 'oklch(0.785 0.173 156.6 / 0.06)' }}>{me}</td>
                  <td style={{ ...cell, color: 'var(--text-muted)' }}>{them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
