import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Cursor from '../components/Cursor';
import { CATS, SEG_LABEL, Q } from '../lib/auditQuestions';

/* ═══════════════════════════════════════════════════════════════════════
   /audit — "אבחון שיווק ב-10 דקות"
   מגנט לידים אינטראקטיבי. הערך (ציון + דליפות) ניתן לפני הטופס ולא נעול.
   ליד → טבלת leads הקיימת (source: 'diagnostic'); הציון+מייל נשמרים ב-message.
   ═══════════════════════════════════════════════════════════════════════ */


const SEG_LINE = {
  time:  'אתה משקיע בעיקר זמן - אז כל דליפה כאן היא שעות מהחיים שלך, לא רק כסף. ',
  both:  'אתה משקיע גם זמן וגם כסף - יש כאן כמה מקומות למקד. ',
  money: 'אתה משקיע בעיקר כסף - הדליפות כאן שורפות תקציב בשקט. ',
  none:  'עדיין לא השקעת הרבה בשיווק - וזו בדיוק ההזדמנות: לבנות נכון מההתחלה, בלי הרגלים לתקן אחר כך. ',
};

function computeResult(answers) {
  const segIdx = Q.findIndex((q) => q.seg);
  const seg = segIdx >= 0 && answers[segIdx] != null ? Q[segIdx].o[answers[segIdx]][1] : null;

  const catMax = {}, catScore = {};
  Object.keys(CATS).forEach((c) => { catMax[c] = 0; catScore[c] = 0; });
  Q.forEach((q, i) => {
    if (q.seg) return;
    catMax[q.cat] += 3;
    catScore[q.cat] += q.o[answers[i]][1];
  });

  const total = Object.values(catScore).reduce((a, b) => a + b, 0);
  const totalMax = Object.values(catMax).reduce((a, b) => a + b, 0);
  const pct = Math.round((total / totalMax) * 100);

  const catPcts = Object.keys(CATS).map((c) => ({ c, p: Math.round((catScore[c] / catMax[c]) * 100) }));

  // דליפה = תשובה ספציפית חלשה (ציון < 3 שיש לה פידבק ייעודי). ממוין לפי חומרה (0 לפני 1).
  const weak = [];
  Q.forEach((q, i) => {
    if (q.seg) return;
    const opt = q.o[answers[i]];
    if (opt[1] < 3 && opt[2]) weak.push({ qi: i, cat: q.cat, score: opt[1], fb: opt[2] });
  });
  weak.sort((a, b) => a.score - b.score);
  const leaks = weak.slice(0, 3);
  const moreLeaks = weak.length > leaks.length;

  let v, vs;
  if (pct >= 70) { v = 'השיווק שלך על בסיס בריא 💪'; vs = 'יש יסודות טובים. הדליפות שנשארו הן דיוקים ששווים הרבה.'; }
  else if (pct >= 45) { v = 'יש פוטנציאל שנשפך בדרך ⚠️'; vs = 'הבסיס קיים אבל דולף בכמה נקודות קריטיות. אלה בדיוק הדברים שאפשר לתקן מהר.'; }
  else { v = 'הרבה מההשקעה שלך דולפת בשקט 🩹'; vs = 'הבשורה הטובה: כשהבסיס חלש, כל תיקון קטן מזיז הרבה. יש כאן הזדמנות ענקית.'; }

  return { seg, pct, catPcts, leaks, moreLeaks, verdict: v, verdictSub: (seg && SEG_LINE[seg] ? SEG_LINE[seg] : '') + vs };
}

export default function DiagnosticPage() {
  const [stage, setStage] = useState('intro'); // intro | quiz | result
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(Q.length).fill(null));
  const [result, setResult] = useState(null);
  const [anim, setAnim] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [touched, setTouched] = useState(false);
  const savedRef = useRef(false); // מונע שמירה כפולה של תוצאה אנונימית

  useEffect(() => {
    document.title = 'אבחון שיווק ב-10 דקות | Shift Up';
    if (typeof window.fbq === 'function') window.fbq('track', 'ViewContent', { content_name: 'Marketing Audit', content_category: 'lead_magnet' });
  }, []);

  const q = Q[cur];
  const total = Q.length;
  const progress = Math.round((cur / total) * 100);

  const pick = (i) => {
    const next = [...answers];
    next[cur] = i;
    setAnswers(next);
  };

  const goNext = () => {
    if (answers[cur] == null) return;
    if (cur < total - 1) { setCur(cur + 1); window.scrollTo(0, 0); }
    else finish();
  };
  const goPrev = () => { if (cur > 0) { setCur(cur - 1); window.scrollTo(0, 0); } };

  const finish = () => {
    const r = computeResult(answers);
    setResult(r);
    setStage('result');
    window.scrollTo(0, 0);

    /* שמירה אנונימית לסטטיסטיקה — ללא שום פרט מזהה.
       נשמר בכל סיום אבחון (גם אם לא ישאירו פרטים), כי שם רוב הדאטה. */
    if (savedRef.current) return;
    savedRef.current = true;
    const detail = [];
    Q.forEach((q, i) => {
      if (q.seg) return;
      detail.push({ q: i, cat: q.cat, a: answers[i], score: q.o[answers[i]][1] });
    });
    const catObj = {};
    r.catPcts.forEach((x) => { catObj[x.c] = x.p; });
    supabase.from('audit_results').insert({
      score: r.pct,
      segment: r.seg,
      cat_scores: catObj,
      answers: detail,
      leaks: r.leaks.map((l) => l.fb.t),
    }).then(({ error }) => {
      if (error) console.warn('[Diagnostic] anonymous save failed:', error.message);
    });
  };

  // animate gauge + bars + count-up once result is shown
  useEffect(() => {
    if (stage !== 'result' || !result) return;
    const t = setTimeout(() => setAnim(true), 90);
    let n = 0;
    const step = Math.max(1, Math.round(result.pct / 40));
    const iv = setInterval(() => {
      n += step;
      if (n >= result.pct) { n = result.pct; clearInterval(iv); }
      setDisplayScore(n);
    }, 25);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [stage, result]);

  const start = () => { setStage('quiz'); window.scrollTo(0, 0); };

  const nameValid = form.name.trim().length > 1;
  const phoneValid = /\d{7,}/.test(form.phone.replace(/\D/g, ''));
  const valid = nameValid && phoneValid && consent;

  const submitLead = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === 'sending' || !result) return;
    setStatus('sending');

    const leaksStr = result.leaks.length
      ? result.leaks.map((w) => w.fb.t).join(' · ')
      : 'אין דליפות גדולות (בסיס חזק)';
    const message =
      `אבחון שיווק: ${result.pct}/100\n` +
      `השקעה: ${SEG_LABEL[result.seg] || '-'}\n` +
      `דליפות עיקריות: ${leaksStr}\n` +
      `מייל: ${form.email.trim() || '-'}`;

    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        business: form.business.trim() || null,
        message,
        source: 'diagnostic',
      });
      if (error) throw error;
    } catch (err) {
      // ליד לא נאבד — עדיין מציגים תודה; השמירה best-effort כמו בטופס הראשי
      console.warn('[Diagnostic] supabase insert failed:', err?.message);
    }
    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Marketing Audit' });
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'audit' });
    setStatus('done');
  };

  const gaugeColor = result ? (result.pct >= 70 ? 'var(--dg-green)' : result.pct >= 45 ? 'var(--dg-warn)' : 'var(--dg-danger)') : 'var(--dg-green)';
  const CIRC = 553;

  return (
    <div className="dg-root" dir="rtl">
      <Cursor />
      <style>{CSS}</style>

      <div className="dg-wrap">
        <div className="dg-brand">
          <span className="dg-dot" />
          <b>Shift Up</b>
          <span>· אבחון שיווק</span>
        </div>

        {/* ── INTRO ── */}
        {stage === 'intro' && (
          <section>
            <div className="dg-hero">
              <span className="dg-pill">בדיקה חינמית · 10 שאלות · 3 דקות</span>
              <h1>איפה השיווק שלך <em>דולף</em>?</h1>
              <p className="dg-sub">לא משנה אם אתה משקיע בשיווק כסף או שעות של עבודה - רוב העסקים מבזבזים חלק גדול מההשקעה בלי לראות. ענה על כמה שאלות קצרות וקבל אבחון אישי: הציון שלך, האזורים החלשים, ו-3 הדברים לתקן קודם.</p>
              <div className="dg-card" style={{ textAlign: 'right', padding: '22px 24px' }}>
                <div className="dg-benefit"><i>✓</i><span>מבוסס על שיטת האבחון של Shift Up</span></div>
                <div className="dg-benefit"><i>✓</i><span>תוצאה מיידית, מותאמת לעסק שלך</span></div>
                <div className="dg-benefit" style={{ marginBottom: 0 }}><i>✓</i><span>בלי הרצאות - רק מה לתקן קודם</span></div>
              </div>
              <button className="dg-btn dg-btn-primary" onClick={start}>בוא נתחיל את האבחון →</button>
            </div>
          </section>
        )}

        {/* ── QUIZ ── */}
        {stage === 'quiz' && (
          <section>
            <div className="dg-progress-head">
              <span>שאלה {cur + 1} מתוך {total}</span>
              <span>{progress}%</span>
            </div>
            <div className="dg-progress-bar"><div className="dg-progress-fill" style={{ width: progress + '%' }} /></div>

            <div className="dg-card">
              <div className="dg-qcat">{q.seg ? q.label : CATS[q.cat]}</div>
              <div className="dg-qtext">{q.t}</div>
              <div className="dg-opts">
                {q.o.map((opt, i) => (
                  <button key={i} className={'dg-opt' + (answers[cur] === i ? ' sel' : '')} onClick={() => pick(i)}>
                    <span className="dg-mark" />
                    <span>{opt[0]}</span>
                  </button>
                ))}
              </div>
              <div className="dg-nav-row">
                <button className="dg-btn dg-btn-ghost" style={{ visibility: cur === 0 ? 'hidden' : 'visible' }} onClick={goPrev}>← חזור</button>
                <button className="dg-btn dg-btn-primary" onClick={goNext} disabled={answers[cur] == null}>
                  {cur === total - 1 ? 'קבל תוצאה →' : 'המשך →'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── RESULT ── */}
        {stage === 'result' && result && (
          <section>
            <div className="dg-card">
              <div className="dg-gauge-wrap">
                <div className="dg-gauge">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="88" fill="none" stroke="#131a22" strokeWidth="14" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke={gaugeColor} strokeWidth="14" strokeLinecap="round"
                      strokeDasharray={CIRC} strokeDashoffset={anim ? CIRC - (CIRC * result.pct) / 100 : CIRC}
                      style={{ transition: 'stroke-dashoffset 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  </svg>
                  <div className="dg-gauge-num"><b style={{ color: gaugeColor }}>{displayScore}</b><small>מתוך 100</small></div>
                </div>
              </div>
              <div className="dg-verdict">{result.verdict}</div>
              <div className="dg-verdict-sub">{result.verdictSub}</div>
            </div>

            <div className="dg-card">
              <div className="dg-qcat" style={{ marginBottom: 16 }}>פירוט לפי תחום</div>
              {result.catPcts.map(({ c, p }) => {
                const col = p >= 67 ? 'var(--dg-green)' : p >= 34 ? 'var(--dg-warn)' : 'var(--dg-danger)';
                return (
                  <div className="dg-bar-row" key={c}>
                    <div className="dg-bar-top"><b>{CATS[c]}</b><span style={{ color: col }}>{p}%</span></div>
                    <div className="dg-bar-track"><div className="dg-bar-fill" style={{ width: anim ? p + '%' : 0, background: col }} /></div>
                  </div>
                );
              })}
            </div>

            {result.leaks.length > 0 ? (
              <div className="dg-card">
                <div className="dg-qcat" style={{ marginBottom: 6, color: 'var(--dg-danger)' }}>
                  {result.leaks.length === 1
                    ? 'הדליפה הגדולה שלך'
                    : `${result.leaks.length} הדליפות ${result.moreLeaks ? 'הכי דחופות' : 'הגדולות'} שלך`}
                </div>
                <p style={{ color: 'var(--dg-text-dim)', fontSize: '.9rem', marginBottom: 18 }}>
                  {result.leaks.length === 1 ? 'זה מה שהכי כדאי לתקן קודם:' : 'מבוסס על התשובות שלך, לפי סדר דחיפות:'}
                </p>
                {result.leaks.map((w, i) => (
                  <div className="dg-leak" key={w.qi}>
                    <span className="dg-leak-n">{i + 1}</span>
                    <div><h4>{w.fb.t}</h4><p>{w.fb.b}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dg-card" style={{ textAlign: 'center' }}>
                <div className="dg-qcat" style={{ marginBottom: 8, color: 'var(--dg-green)' }}>אין דליפות גדולות 🎯</div>
                <p style={{ color: 'var(--dg-text-dim)' }}>כל התחומים שלך במצב טוב, וזה נדיר. סימן שהבסיס חזק. אם נדבר, זה יהיה על דיוק ואופטימיזציה, לא כיבוי שריפות.</p>
              </div>
            )}

            {/* lead capture — value already given above; form is soft/optional */}
            {status !== 'done' ? (
              <div className="dg-card dg-lead">
                <h2>קח את התוצאה ורוץ. <em>ואם בא לך</em> -</h2>
                <p className="dg-lead-p">התוצאה שלמעלה שלך, בחינם, בלי תנאי. ואם מתחשק לך שאעבור על זה איתך אישית - אשלח לך את 3 הצעדים המדויקים לתיקון מותאמים לעסק שלך + שיחת אבחון קצרה, בלי עלות. רק תשאיר איך לחזור אליך.</p>
                <form onSubmit={submitLead} noValidate>
                  <div className="dg-field">
                    <label htmlFor="dg-name">שם מלא</label>
                    <input id="dg-name" type="text" value={form.name} placeholder="איך קוראים לך?"
                      onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name"
                      style={touched && !nameValid ? { borderColor: 'var(--dg-danger)' } : undefined} />
                  </div>
                  <div className="dg-field">
                    <label htmlFor="dg-biz">שם העסק</label>
                    <input id="dg-biz" type="text" value={form.business} placeholder="שם העסק / התחום"
                      onChange={(e) => setForm({ ...form, business: e.target.value })} />
                  </div>
                  <div className="dg-field">
                    <label htmlFor="dg-email">אימייל (אופציונלי)</label>
                    <input id="dg-email" type="email" value={form.email} placeholder="name@email.com"
                      onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                  </div>
                  <div className="dg-field">
                    <label htmlFor="dg-phone">טלפון (וואטסאפ)</label>
                    <input id="dg-phone" type="tel" value={form.phone} placeholder="050-0000000" dir="ltr" style={{ textAlign: 'right', ...(touched && !phoneValid ? { borderColor: 'var(--dg-danger)' } : {}) }}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
                  </div>
                  <div className="dg-field" style={{ marginBottom: 8 }}>
                    <label htmlFor="dg-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontWeight: 400 }}>
                      <input id="dg-consent" type="checkbox" checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: 'var(--dg-green)', cursor: 'pointer' }} />
                      <span style={{ fontSize: '.85rem', lineHeight: 1.5 }}>
                        קראתי ואני מסכים/ה ל<a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dg-green)', fontWeight: 600 }}>מדיניות הפרטיות</a> ולכך שתיצרו איתי קשר. *
                      </span>
                    </label>
                  </div>
                  {touched && !nameValid && <p style={{ color: 'var(--dg-danger)', fontSize: '.82rem', marginBottom: 8 }}>נא למלא שם.</p>}
                  {touched && nameValid && !phoneValid && <p style={{ color: 'var(--dg-danger)', fontSize: '.82rem', marginBottom: 8 }}>נא למלא מספר טלפון תקין.</p>}
                  {touched && nameValid && phoneValid && !consent && <p style={{ color: 'var(--dg-danger)', fontSize: '.82rem', marginBottom: 8 }}>יש לאשר את מדיניות הפרטיות כדי להמשיך.</p>}
                  <button type="submit" className="dg-btn dg-btn-primary" disabled={status === 'sending'}>
                    {status === 'sending' ? 'שולח…' : 'בוא נדבר - שלח לי את הצעדים ←'}
                  </button>
                  <p className="dg-consent">אין חובה. משאירים פרטים רק אם רוצים שאחזור. בלי ספאם, אפשר להסיר בכל רגע.</p>
                </form>
                <div className="dg-trust">
                  <b style={{ color: 'var(--dg-text)' }}>מי עומד מאחורי זה?</b><br />
                  Shift Up - אסטרטגיית שיווק מבוססת-מחקר לעסקים בוגרים. מבוסס מחקר · הבטחת ביצוע · בגובה העיניים.
                </div>
              </div>
            ) : (
              <div className="dg-card dg-thanks">
                <div className="dg-check">✓</div>
                <h2>קיבלנו! נדבר בקרוב 🚀</h2>
                <p>אחזור אליך תוך 24 שעות עם 3 הצעדים המדויקים לתיקון + הצעה לשיחת אבחון קצרה. בינתיים - שמור את הציון שלך.</p>
              </div>
            )}

            <button className="dg-btn dg-btn-ghost" style={{ marginTop: 8 }} onClick={() => { setStage('intro'); setCur(0); setAnswers(new Array(Q.length).fill(null)); setResult(null); setAnim(false); setDisplayScore(0); setForm({ name: '', business: '', email: '', phone: '' }); setConsent(false); setStatus('idle'); setTouched(false); savedRef.current = false; }}>↻ התחל אבחון מחדש</button>
          </section>
        )}

        <div className="dg-footer">Shift Up · תחזור לנהל את העסק. את השיווק תשאיר לי.</div>
      </div>
    </div>
  );
}

const CSS = `
.dg-root{
  --dg-green:#36d98a; --dg-green-dim:rgba(54,217,138,.15);
  --dg-bg:#070a0e; --dg-card:#0e1319; --dg-card-2:#131a22;
  --dg-purple:#6a4fb5; --dg-text:#e8edf2; --dg-text-dim:#8b97a3;
  --dg-border:rgba(255,255,255,.08); --dg-danger:#ff5c72; --dg-warn:#ffb454;
  position:relative; min-height:100vh; background:var(--dg-bg); color:var(--dg-text);
  font-family:'Heebo',sans-serif; line-height:1.6; -webkit-font-smoothing:antialiased; overflow-x:hidden;
}
.dg-root::before{
  content:''; position:fixed; inset:0; z-index:0; pointer-events:none;
  background:
    radial-gradient(600px 400px at 80% -5%, rgba(54,217,138,.10), transparent 60%),
    radial-gradient(500px 400px at 10% 20%, rgba(106,79,181,.10), transparent 60%);
}
.dg-wrap{position:relative; z-index:1; max-width:720px; margin:0 auto; padding:24px 20px 80px}
.dg-brand{display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:40px; opacity:.9}
.dg-brand .dg-dot{width:10px; height:10px; border-radius:50%; background:var(--dg-green); box-shadow:0 0 16px var(--dg-green)}
.dg-brand b{font-weight:800; letter-spacing:.5px}
.dg-brand span{color:var(--dg-text-dim); font-weight:400; font-size:.9rem}
.dg-hero{text-align:center; margin-bottom:36px}
.dg-pill{display:inline-block; font-size:.8rem; font-weight:600; color:var(--dg-green); background:var(--dg-green-dim); border:1px solid rgba(54,217,138,.25); padding:6px 14px; border-radius:100px; margin-bottom:20px}
.dg-root h1{font-size:clamp(1.9rem,6vw,2.8rem); font-weight:900; line-height:1.15; margin-bottom:16px; letter-spacing:-.5px}
.dg-root h1 em{color:var(--dg-green); font-style:normal}
.dg-sub{color:var(--dg-text-dim); font-size:1.05rem; max-width:520px; margin:0 auto 28px}
.dg-benefit{display:flex; align-items:center; gap:10px; justify-content:flex-start; margin-bottom:14px; color:var(--dg-text-dim); font-size:.92rem}
.dg-benefit i{color:var(--dg-green); font-style:normal; font-weight:700}
.dg-btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:inherit; font-size:1.05rem; font-weight:700; cursor:pointer; padding:16px 32px; border-radius:14px; border:none; transition:.2s; width:100%}
.dg-btn-primary{background:var(--dg-green); color:#04120a; box-shadow:0 8px 30px rgba(54,217,138,.3)}
.dg-btn-primary:hover{transform:translateY(-2px); box-shadow:0 12px 40px rgba(54,217,138,.45)}
.dg-btn-primary:disabled{opacity:.35; cursor:not-allowed; transform:none; box-shadow:none}
.dg-btn-ghost{background:transparent; color:var(--dg-text); border:1px solid var(--dg-border)}
.dg-btn-ghost:hover{border-color:var(--dg-green); color:var(--dg-green)}
.dg-card{background:var(--dg-card); border:1px solid var(--dg-border); border-radius:20px; padding:28px 24px; margin-bottom:20px}
.dg-progress-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; font-size:.85rem; color:var(--dg-text-dim)}
.dg-progress-bar{height:6px; background:var(--dg-card-2); border-radius:100px; overflow:hidden; margin-bottom:28px}
.dg-progress-fill{height:100%; background:linear-gradient(90deg,var(--dg-purple),var(--dg-green)); transition:width .35s ease; border-radius:100px}
.dg-qcat{font-size:.8rem; color:var(--dg-green); font-weight:700; letter-spacing:.5px; margin-bottom:8px}
.dg-qtext{font-size:1.35rem; font-weight:700; line-height:1.35; margin-bottom:24px}
.dg-opts{display:flex; flex-direction:column; gap:12px}
.dg-opt{text-align:right; font-family:inherit; font-size:1rem; color:var(--dg-text); background:var(--dg-card-2); border:1.5px solid var(--dg-border); border-radius:14px; padding:16px 18px; cursor:pointer; transition:.15s; display:flex; align-items:center; gap:14px}
.dg-opt:hover{border-color:rgba(54,217,138,.4); background:#161d26}
.dg-opt.sel{border-color:var(--dg-green); background:var(--dg-green-dim)}
.dg-mark{width:22px; height:22px; border-radius:50%; border:2px solid var(--dg-text-dim); flex-shrink:0; display:grid; place-items:center; transition:.15s}
.dg-opt.sel .dg-mark{border-color:var(--dg-green); background:var(--dg-green)}
.dg-opt.sel .dg-mark::after{content:''; width:8px; height:8px; border-radius:50%; background:#04120a}
.dg-nav-row{display:flex; gap:12px; margin-top:28px}
.dg-nav-row .dg-btn{width:auto; flex:1}
.dg-gauge-wrap{text-align:center; margin-bottom:8px}
.dg-gauge{position:relative; width:200px; height:200px; margin:0 auto 8px}
.dg-gauge-num{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center}
.dg-gauge-num b{font-size:3.2rem; font-weight:900; line-height:1}
.dg-gauge-num small{color:var(--dg-text-dim); font-size:.85rem}
.dg-verdict{text-align:center; font-size:1.25rem; font-weight:800; margin:4px 0 6px}
.dg-verdict-sub{text-align:center; color:var(--dg-text-dim); margin-bottom:8px}
.dg-bar-row{margin-bottom:16px}
.dg-bar-top{display:flex; justify-content:space-between; font-size:.92rem; margin-bottom:6px}
.dg-bar-top b{font-weight:600}
.dg-bar-top span{font-weight:700}
.dg-bar-track{height:8px; background:var(--dg-card-2); border-radius:100px; overflow:hidden}
.dg-bar-fill{height:100%; border-radius:100px; transition:width .8s ease}
.dg-leak{display:flex; gap:14px; align-items:flex-start; background:var(--dg-card-2); border:1px solid var(--dg-border); border-right:3px solid var(--dg-danger); border-radius:12px; padding:16px; margin-bottom:12px}
.dg-leak-n{font-weight:900; color:var(--dg-danger); font-size:1.1rem; flex-shrink:0}
.dg-leak h4{font-size:1.02rem; margin-bottom:4px}
.dg-leak p{color:var(--dg-text-dim); font-size:.92rem}
.dg-lead{text-align:center}
.dg-lead h2{font-size:1.5rem; font-weight:900; margin-bottom:8px}
.dg-lead h2 em{color:var(--dg-green); font-style:normal}
.dg-lead-p{color:var(--dg-text-dim); margin-bottom:24px}
.dg-field{margin-bottom:14px; text-align:right}
.dg-field label{display:block; font-size:.85rem; color:var(--dg-text-dim); margin-bottom:6px; font-weight:500}
.dg-field input{width:100%; font-family:inherit; font-size:1rem; color:var(--dg-text); background:var(--dg-card-2); border:1.5px solid var(--dg-border); border-radius:12px; padding:14px 16px; transition:.15s}
.dg-field input:focus{outline:none; border-color:var(--dg-green)}
.dg-field input::placeholder{color:#4a5560}
.dg-consent{font-size:.78rem; color:var(--dg-text-dim); margin-top:14px}
.dg-trust{margin-top:22px; padding-top:20px; border-top:1px solid var(--dg-border); color:var(--dg-text-dim); font-size:.85rem; line-height:1.7}
.dg-thanks{text-align:center; padding:20px 0}
.dg-thanks .dg-check{width:70px; height:70px; border-radius:50%; background:var(--dg-green-dim); border:2px solid var(--dg-green); display:grid; place-items:center; margin:0 auto 20px; font-size:2rem; color:var(--dg-green)}
.dg-thanks h2{font-size:1.4rem; font-weight:900; margin-bottom:8px}
.dg-thanks p{color:var(--dg-text-dim)}
.dg-footer{text-align:center; color:var(--dg-text-dim); font-size:.8rem; margin-top:40px; opacity:.7}
.dg-btn:focus-visible,.dg-opt:focus-visible{outline:2px solid var(--dg-green); outline-offset:3px}
.dg-field input:focus-visible{outline:2px solid var(--dg-green); outline-offset:1px}
@media (prefers-reduced-motion: reduce){
  .dg-root *{animation-duration:.01ms!important; transition-duration:.01ms!important}
}
`;
