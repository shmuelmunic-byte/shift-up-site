import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import PageNav from '../components/PageNav';
import Footer from '../components/Footer';
import { nd } from '../content/heroCopy';
import { CATS, SEG_LABEL, Q } from '../lib/auditQuestions';

/* ═══════════════════════════════════════════════════════════════════════
   /audit — "אבחון שיווק ב-10 דקות"
   מגנט לידים אינטראקטיבי. הערך (ציון + דליפות) ניתן לפני הטופס ולא נעול.
   ליד → טבלת leads הקיימת (source: 'diagnostic'); הציון+מייל נשמרים ב-message.
   ═══════════════════════════════════════════════════════════════════════ */


const SEG_LINE = {
  time:  'אתה משקיע בעיקר זמן - אז כל דליפה כאן היא שעות מהחיים שלך, לא רק כסף',
  both:  'אתה משקיע גם זמן וגם כסף - יש כאן כמה מקומות למקד',
  money: 'אתה משקיע בעיקר כסף - הדליפות כאן שורפות תקציב בשקט',
  none:  'עדיין לא השקעת הרבה בשיווק - וזו בדיוק ההזדמנות: לבנות נכון מההתחלה, בלי הרגלים לתקן אחר כך',
};

// גרסה למקרה שאין דליפות בכלל - בלי אזכור של בעיות שלא קיימות.
const SEG_LINE_CLEAN = {
  time:  'אתה משקיע בעיקר זמן - והוא חוזר אליך טוב',
  both:  'אתה משקיע גם זמן וגם כסף - ורואים שזה מנוהל נכון',
  money: 'אתה משקיע בעיקר כסף - והוא עובד בשבילך',
  none:  'עדיין כמעט לא השקעת בשיווק, ובכל זאת הבסיס שלך מסודר',
};

// חוזקה לכל תחום שקיבל ציון גבוה - כדי לפתוח את התוצאה בחיובי, במה שכבר עובד.
// מוצג רק כשהתחום באמת חזק, אז הניסוח נשאר כן.
const CAT_WIN = {
  offer:    { t: 'ההצעה שלך חדה', b: 'אתה יודע למה בוחרים בך ולמי אתה מתאים, וזה הבסיס שכל השיווק נשען עליו, ואצלך הוא מסודר' },
  funnel:   { t: 'המסע ללקוח ברור', b: 'מי שמתעניין יודע מה הצעד הבא ואתה לא מאבד אותו בדרך, ככה תנועה הופכת למכירות' },
  measure:  { t: 'אתה יודע מה עובד', b: 'אתה מנווט על נתונים ולא על תחושה, ולכן כל שקל וכל שעה הולכים למקום הנכון' },
  presence: { t: 'הנוכחות שלך יציבה', b: 'אתה שם באופן עקבי, והקהל לא שוכח אותך בין מגע למגע, ועקביות בונה אמון שמבשיל למכירות' },
  retain:   { t: 'לקוחות חוזרים אליך', b: 'יש לך מנוע של לקוחות חוזרים והפניות, הערוץ הזול והחם ביותר, וזה משאיר לך יותר רווח על כל לקוח' },
};

function computeResult(answers) {
  const segIdx = Q.findIndex((q) => q.seg);
  const seg = segIdx >= 0 && answers[segIdx] != null && answers[segIdx] !== 'skip' ? Q[segIdx].o[answers[segIdx]][1] : null;

  // שאלות שדולגו ('skip') לא נספרות לא בציון ולא במקסימום — הציון מחושב רק על מה שנענה.
  const catMax = {}, catScore = {};
  Object.keys(CATS).forEach((c) => { catMax[c] = 0; catScore[c] = 0; });
  let skipped = 0;
  Q.forEach((q, i) => {
    if (q.seg) return;
    if (answers[i] === 'skip') { skipped++; return; }
    catMax[q.cat] += 3;
    catScore[q.cat] += q.o[answers[i]][1];
  });

  const total = Object.values(catScore).reduce((a, b) => a + b, 0);
  const totalMax = Object.values(catMax).reduce((a, b) => a + b, 0);
  const pct = totalMax > 0 ? Math.round((total / totalMax) * 100) : 0;

  // תחום שכל שאלותיו דולגו מקבל p: null ("לא נמדד"), ולא מזייף אחוז.
  const catPcts = Object.keys(CATS).map((c) => ({ c, p: catMax[c] > 0 ? Math.round((catScore[c] / catMax[c]) * 100) : null }));

  // דליפה = תשובה ספציפית חלשה (ציון < 3 שיש לה פידבק ייעודי). ממוין לפי חומרה (0 לפני 1). דילוגים מוחרגים.
  const weak = [];
  Q.forEach((q, i) => {
    if (q.seg || answers[i] === 'skip') return;
    const opt = q.o[answers[i]];
    if (opt[1] < 3 && opt[2]) weak.push({ qi: i, cat: q.cat, score: opt[1], fb: opt[2] });
  });
  weak.sort((a, b) => a.score - b.score);
  const leaks = weak.slice(0, 3);
  const moreLeaks = weak.length > leaks.length;

  // חוזקות = תחומים שנמדדו וקיבלו ציון גבוה, ממוינים מהחזק לפחות. מובילים בתוצאה כדי לפתוח בחיובי.
  // תמיד מחזירים לפחות חוזקה אחת - גם למי שקיבל ציון נמוך יש נקודת פתיחה כנה.
  const measuredCats = catPcts.filter((cp) => cp.p !== null).sort((a, b) => b.p - a.p);
  let strengths = measuredCats.filter((cp) => cp.p >= 67).slice(0, 3).map((cp) => ({ cat: cp.c, p: cp.p, ...CAT_WIN[cp.c] }));
  if (strengths.length === 0 && measuredCats.length) {
    const top = measuredCats[0];
    if (top.p >= 45) {
      // אין תחום "ירוק" - מציגים את החזק ביותר כחוזקה יחסית, בלי להגזים.
      strengths = [{ cat: top.c, p: top.p, t: `הכי חזק אצלך: ${CATS[top.c]}`, b: 'זה התחום שבו אתה במצב הכי טוב יחסית, יש על מה לבנות, ומכאן מחזקים גם את השאר' }];
    }
  }
  if (strengths.length === 0) {
    strengths = [{ cat: null, p: null, t: 'עצם זה שעצרת לבדוק', b: 'רוב בעלי העסקים לא עוצרים לבדוק איפה השיווק דולף, ושעשית את זה אומר שאתה מוכן לתקן, וזו נקודת הפתיחה של כל שיפור' }];
  }

  // ללא דליפות (כל התשובות חזקות) — ניסוח נפרד, אחרת מדברים על דליפות שלא קיימות.
  let v, vs, prefix;
  if (leaks.length === 0) {
    v = 'השיווק שלך על בסיס חזק';
    vs = 'יש יסודות חזקים באמת, ומכאן זה כבר ליטוש ודיוק, לא תיקון';
    prefix = seg && SEG_LINE_CLEAN[seg] ? SEG_LINE_CLEAN[seg] : '';
  } else {
    if (pct >= 70) { v = 'השיווק שלך על בסיס בריא'; vs = 'יש יסודות טובים, והדליפות שנשארו הן דיוקים ששווים הרבה'; }
    else if (pct >= 45) { v = 'יש פוטנציאל שנשפך בדרך'; vs = 'הבסיס קיים אבל דולף בכמה נקודות קריטיות, ואלה בדיוק הדברים שאפשר לתקן מהר'; }
    else { v = 'הרבה מההשקעה שלך דולפת בשקט'; vs = 'הבשורה הטובה: כשהבסיס חלש, כל תיקון קטן מזיז הרבה, ויש כאן הזדמנות ענקית'; }
    prefix = seg && SEG_LINE[seg] ? SEG_LINE[seg] : '';
  }

  return { seg, pct, catPcts, leaks, moreLeaks, strengths, skipped, verdict: v, verdictPre: prefix, verdictSub: vs };
}

// נרמול טלפון לפני שמירה, כמו בטופס הבית: ספרות בלבד, +972 → 0, 5XXXXXXXX → 05XXXXXXXX
const normalizePhone = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('972')) d = '0' + d.slice(3);
  if (d.length === 9 && d[0] === '5') d = '0' + d;
  return d || String(v || '').trim();
};

/* ── תמונת תוצאה לשיתוף (1080×1527, A4 פורטרט) ──
   מובילה במה שכבר עובד (חוזקות) ורק אז מה כדאי לחדד — כי אנשים משתפים
   תמונה שמראה במה הם טובים, ובלי לוותר על מה שצריך תיקון.
   נקייה מלינק — הטקסט והלינק נשלחים ככיתוב שמתלווה לתמונה. */
function wrapCanvasText(ctx, text, cx, y, maxW, lh) {
  const words = String(text).split(' ');
  let line = ''; const lines = [];
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((ln, i) => ctx.fillText(ln, cx, y + i * lh));
  return lines.length * lh;
}

/* טעינת הלוגו (דיו כהה על שקוף) פעם אחת, לשילוב בתמונת השיתוף. */
let _shareLogo = null, _shareLogoPromise = null;
function loadShareLogo() {
  if (_shareLogo) return Promise.resolve(_shareLogo);
  if (!_shareLogoPromise) _shareLogoPromise = new Promise((res) => {
    const im = new Image();
    im.onload = () => { _shareLogo = im; res(im); };
    im.onerror = () => res(null);
    im.src = '/logo.png';
  });
  return _shareLogoPromise;
}

/* תמונת השיתוף בעיצוב C (25.11): לילה כהה, Secular One לכותרות, Heebo לגוף,
   מספר ב-Space Grotesk, פס ציון ישר עם סימון ממוצע. בלי פינות מעוגלות ובלי גרדיאנטים */
function drawShareImage(result, logo, stats) {
  const W = 1080, H = 1527;               // A4 פורטרט (יחס 1:√2)
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const pct = result.pct != null ? result.pct : 0;
  const avg = stats && typeof stats.avg === 'number' ? stats.avg : null;
  const aboveAvg = avg != null && pct >= avg;
  const belowAvg = avg != null && pct < avg;
  const NIGHT = '#070A0E', PAPER = '#F5F7F8', MUTED = '#B3BCC5', DIM = '#8A949F', LINE = '#1E262F';
  const GREEN = '#36D98A', AMBER = '#F2B544', PURPLE = '#8468D0';
  const col = pct >= 70 ? GREEN : pct >= 45 ? AMBER : '#FF6B7F';
  const M = 90, R = W - M, TW = W - M * 2;

  x.fillStyle = NIGHT; x.fillRect(0, 0, W, H);
  // פס מותג דק בקצה הימני (סגול → ירוק כמו בלוגו), כדי שהרקע לא יהיה אחיד
  x.fillStyle = PURPLE; x.fillRect(W - 14, 0, 14, H * 0.35);
  x.fillStyle = GREEN; x.fillRect(W - 14, H * 0.35, 14, H * 0.65);

  x.direction = 'rtl'; x.textAlign = 'right'; x.textBaseline = 'middle';

  // לוגו
  if (logo && logo.width) {
    const lw = 300, lh = lw * logo.height / logo.width;
    x.direction = 'ltr'; x.drawImage(logo, M - 10, 62, lw, lh); x.direction = 'rtl';
  } else {
    x.direction = 'ltr'; x.textAlign = 'left';
    x.fillStyle = PAPER; x.font = '700 44px "Space Grotesk"'; x.fillText('Shift Up', M, 112);
    x.direction = 'rtl'; x.textAlign = 'right';
  }
  x.fillStyle = DIM; x.font = '500 30px "Heebo"';
  x.fillText('אבחון שיווק', R, 112);

  x.fillStyle = LINE; x.fillRect(M, 196, TW, 2);

  // כותרת
  x.fillStyle = PAPER; x.font = '400 64px "Secular One"';
  let y = 290;
  y += wrapCanvasText(x, belowAvg ? 'יצאתי לתקן את השיווק של העסק' : 'ככה נראה השיווק של העסק שלי', R, y, TW, 80);

  // ציון: מספר גדול ופס ישר
  y += 70;
  x.fillStyle = col; x.font = '700 230px "Space Grotesk"';
  x.direction = 'ltr'; x.textAlign = 'right';
  x.fillText(String(pct), R, y + 60);
  const numW = x.measureText(String(pct)).width;
  x.fillStyle = DIM; x.font = '700 64px "Space Grotesk"';
  x.textAlign = 'left';
  x.fillText('/100', R - numW - 150 < M ? M : R - numW - 150, y + 120);
  x.direction = 'rtl'; x.textAlign = 'right';
  if (aboveAvg) {
    x.font = '700 32px "Heebo"';
    const tw = x.measureText('מעל הממוצע').width + 44;
    x.strokeStyle = GREEN; x.lineWidth = 3;
    x.strokeRect(M + 1.5, y - 10, tw, 60);
    x.fillStyle = GREEN; x.textAlign = 'center';
    x.fillText('מעל הממוצע', M + 1.5 + tw / 2, y + 21);
    x.textAlign = 'right';
  }
  y += 220;

  // פס: מתמלא מימין לשמאל (RTL)
  const barH = 22;
  x.fillStyle = LINE; x.fillRect(M, y, TW, barH);
  const fw = TW * Math.max(0, Math.min(100, pct)) / 100;
  x.fillStyle = col; x.fillRect(R - fw, y, fw, barH);
  if (avg != null) {
    const ax = R - TW * avg / 100;
    x.fillStyle = PAPER; x.fillRect(ax - 2, y - 14, 4, barH + 28);
    x.fillStyle = MUTED; x.font = '500 28px "Heebo"'; x.textAlign = 'center';
    x.fillText('ממוצע ' + Math.round(avg), Math.max(M + 70, Math.min(R - 70, ax)), y + barH + 44);
    x.textAlign = 'right';
  }
  y += barH + 160;

  // ורדיקט
  x.fillStyle = PAPER; x.font = '400 54px "Secular One"';
  y += wrapCanvasText(x, result.verdict, R, y, TW, 70);

  // מה שכבר עובד
  y += 70;
  x.fillStyle = GREEN; x.font = '700 38px "Heebo"';
  x.fillText('מה שכבר עובד לי', R, y); y += 70;
  x.font = '500 44px "Heebo"';
  (result.strengths || []).slice(0, 2).forEach((s) => {
    x.fillStyle = GREEN; x.fillRect(R - 16, y - 8, 16, 16);
    x.fillStyle = PAPER;
    y += wrapCanvasText(x, s.t, R - 36, y, TW - 36, 60) + 12;
  });

  // מה כדאי לחדד
  y += 50;
  if (result.leaks && result.leaks.length) {
    x.fillStyle = AMBER; x.font = '700 38px "Heebo"';
    x.fillText(belowAvg ? 'מה שאני משפר עכשיו' : 'ומה כדאי לחדד', R, y); y += 70;
    x.fillStyle = AMBER; x.fillRect(R - 16, y - 8, 16, 16);
    x.fillStyle = PAPER; x.font = '500 44px "Heebo"';
    wrapCanvasText(x, result.leaks[0].fb.t, R - 36, y, TW - 36, 60);
  } else {
    x.fillStyle = GREEN; x.font = '500 44px "Heebo"';
    wrapCanvasText(x, 'אין דליפות גדולות, הבסיס שלך חזק', R, y, TW, 52);
  }

  // פוטר
  x.fillStyle = LINE; x.fillRect(M, H - 150, TW, 2);
  x.fillStyle = MUTED; x.font = '500 32px "Heebo"';
  x.fillText('אבחון שיווק חינמי לבעלי עסקים', R, H - 82);
  x.direction = 'ltr'; x.textAlign = 'left';
  x.fillStyle = GREEN; x.font = '700 38px "Space Grotesk"';
  x.fillText('shiftup.marketing', M, H - 82);

  return c;
}

/* תצוגה מקדימה של התוצאה בפתיחה (AD דפים 1, #4): אותו כרטיס ציון ואותם פסים, עם ציון לדוגמה.
   רק דוגמה, מסומנת aria-hidden, ומוצגת מ-1024px ומעלה */
const PREVIEW = { pct: 63, verdict: 'יש פוטנציאל שנשפך בדרך', cats: [78, 45, 30, 67, 52] };
function IntroPreview() {
  const C = 553;
  return (
    <aside className="dg-preview" aria-hidden="true">
      <div className="dg-card dg-score">
        <div className="dg-gauge-wrap">
          <div className="dg-gauge">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--dg-track)" strokeWidth="14" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--dg-warn-ink)" strokeWidth="14" strokeLinecap="butt"
                strokeDasharray={C} strokeDashoffset={C - (C * PREVIEW.pct) / 100}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
            </svg>
            <div className="dg-gauge-num"><b style={{ color: 'var(--dg-warn-ink)' }}>{PREVIEW.pct}</b><small>מתוך 100</small></div>
          </div>
        </div>
        <div className="dg-verdict">{PREVIEW.verdict}</div>
      </div>
      <div className="dg-preview__bars">
        <div className="dg-qcat">פירוט לפי תחום</div>
        {Object.keys(CATS).map((c, i) => {
          const p = PREVIEW.cats[i % PREVIEW.cats.length];
          const fill = p >= 67 ? 'var(--dg-green)' : p >= 34 ? 'var(--dg-warn)' : 'var(--dg-danger)';
          return (
            <div className="dg-bar-row" key={c}>
              <div className="dg-bar-top"><b>{CATS[c]}</b><span>{p}%</span></div>
              <div className="dg-bar-track"><div className="dg-bar-fill" style={{ width: p + '%', background: fill }} /></div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default function DiagnosticPage() {
  const [stage, setStage] = useState('intro'); // intro | quiz | result
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(Q.length).fill(null));
  const [result, setResult] = useState(null);
  const [anim, setAnim] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [stats, setStats] = useState(null); // { avg, better_than } — חי מ-audit_stats, מתעדכן בכל מילוי

  /* סדר תצוגה מעורבב לכל שאלה מדורגת (Fisher-Yates), פעם אחת לכל סשן.
     בלי זה התשובה הטובה תמיד ראשונה - מי שלוחץ "הכי למעלה" בלי לקרוא מקבל 100,
     וזה מזהם גם את הציונים וגם את התפלגות התשובות בסטטיסטיקה.
     שאלת הרקע (seg) נשארת בסדר המקורי - היא לא מדורגת והסדר בה תיאורי. */
  const [order] = useState(() =>
    Q.map((q) => {
      const idx = q.o.map((_, i) => i);
      if (q.seg) return idx;
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      return idx;
    })
  );

  const [form, setForm] = useState({ name: '', business: '', email: '', phone: '' });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [touched, setTouched] = useState(false);
  const savedRef = useRef(false); // מונע שמירה כפולה של תוצאה אנונימית

  useEffect(() => {
    document.title = 'אבחון שיווק ב-3 דקות | Shift Up';
    // תחילת שאלון - נמדד בשני הפיקסלים (מטא ViewContent + GA view_item), כדי ש-GA יראה גם הוא כמה התחילו
    if (typeof window.fbq === 'function') window.fbq('track', 'ViewContent', { content_name: 'Marketing Audit', content_category: 'lead_magnet' });
    if (typeof window.gtag === 'function') window.gtag('event', 'view_item', { item_id: 'marketing_audit', item_name: 'Marketing Audit' });
    // הגעה משיתוף: מי שנחת דרך לינק ששותף (utm_source=audit_share) - אירוע ייעודי בשני הפיקסלים.
    // בנוסף GA4 סופר אותו אוטומטית כמקור תנועה (Traffic acquisition, source=audit_share).
    try {
      if (new URLSearchParams(window.location.search).get('utm_source') === 'audit_share') {
        if (typeof window.gtag === 'function') window.gtag('event', 'audit_from_share');
        if (typeof window.fbq === 'function') window.fbq('trackCustom', 'AuditFromShare');
      }
    } catch { /* אין URLSearchParams */ }
  }, []);

  const q = Q[cur];
  const total = Q.length;
  const progress = Math.round((cur / total) * 100);

  /* מעבר אוטומטי כ-300ms אחרי בחירה (AD דפים 1, #1): במובייל "המשך" יורד מתחת לקפל ולבאנר,
     אז לא צריך אותו כדי להתקדם. "המשך" ו"חזור" נשארים בשביל מי שחוזר אחורה.
     שאלה עם בחירה מרובה (q.multi, אין כרגע) לא עוברת לבד */
  const advanceRef = useRef(null);
  useEffect(() => () => clearTimeout(advanceRef.current), []);
  const pick = (i) => {
    const next = [...answers];
    next[cur] = i;
    setAnswers(next);
    clearTimeout(advanceRef.current);
    if (q.multi) return;
    const at = cur;
    advanceRef.current = setTimeout(() => {
      if (at < total - 1) { setCur(at + 1); window.scrollTo(0, 0); }
      else finish(next);
    }, 300);
  };

  const goNext = () => {
    if (answers[cur] == null) return;
    if (cur < total - 1) { setCur(cur + 1); window.scrollTo(0, 0); }
    else finish();
  };
  const goPrev = () => { clearTimeout(advanceRef.current); if (cur > 0) { setCur(cur - 1); window.scrollTo(0, 0); } };

  // דילוג על שאלה שלא רלוונטית לעסק. לחיצה חוזרת מבטלת. בשאלה האחרונה — מסיים עם התשובות המעודכנות.
  const skip = () => {
    const next = [...answers];
    if (next[cur] === 'skip') { next[cur] = null; setAnswers(next); return; }
    next[cur] = 'skip';
    setAnswers(next);
    if (cur < total - 1) { setCur(cur + 1); window.scrollTo(0, 0); }
    else finish(next);
  };

  const finish = (ans = answers) => {
    const r = computeResult(ans);
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
      if (ans[i] === 'skip') { detail.push({ q: i, cat: q.cat, a: 'skip', score: null }); return; }
      detail.push({ q: i, cat: q.cat, a: ans[i], score: q.o[ans[i]][1] });
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

  // ממוצע ואחוזון חיים — נמשכים בכל הצגת תוצאה, כך שהמידע תמיד עדכני
  // (audit_stats מחשב מחדש בזמן אמת). נכשל בשקט: בלי נתון פשוט לא מציגים בנצ'מארק.
  useEffect(() => {
    if (stage !== 'result' || !result) return;
    let cancelled = false;
    supabase.rpc('audit_stats', { p_score: result.pct }).then(({ data, error }) => {
      if (cancelled || error || !data) return;
      setStats(data);
    });
    return () => { cancelled = true; };
  }, [stage, result]);

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

  /* ── שיתוף התוצאה: תמונה ממותגת + כיתוב טקסט ולינק, ממוקד סטטוס וואטסאפ ── */
  const [shareImg, setShareImg] = useState(null);
  const [copied, setCopied] = useState(false);
  const shareCanvasRef = useRef(null);
  const shareBlobRef = useRef(null);
  const shareCardRef = useRef(null);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // רמז השיתוף הקומפקטי בשיא הרגש: במובייל משתף ישר, בדסקטופ גולל לכרטיס המלא.
  const miniShare = () => {
    if (canNativeShare) shareNative();
    else if (shareCardRef.current) shareCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (stage !== 'result' || !result) return;
    let cancelled = false;
    const make = (logo) => {
      if (cancelled) return;
      const canvas = drawShareImage(result, logo, stats);
      shareCanvasRef.current = canvas;
      setShareImg(canvas.toDataURL('image/png'));
      canvas.toBlob((b) => { shareBlobRef.current = b; }, 'image/png');
    };
    // ממתינים גם לפונטים וגם ללוגו לפני שמציירים, כדי שהתמונה תצא שלמה.
    const fontsReady = document.fonts && document.fonts.load
      ? Promise.all(['400 64px "Secular One"', '500 38px "Heebo"', '700 34px "Heebo"', '700 230px "Space Grotesk"']
          .map((f) => document.fonts.load(f, 'אב 0'))).catch(() => null)
      : Promise.resolve();
    Promise.all([fontsReady, loadShareLogo()]).then(([, logo]) => make(logo));
    return () => { cancelled = true; };
  }, [stage, result, stats]);

  // לינק שיתוף עם ייחוס: מי שמגיע דרכו נספר ב-GA כ-source=audit_share (מודד "כמה הגיעו משיתוף")
  const shareUrl = () => (typeof window !== 'undefined'
    ? `${window.location.origin}/audit?utm_source=audit_share&utm_medium=social&utm_campaign=marketing_audit`
    : '');
  // מדידת פעולת שיתוף (מי שיתף) - בשני הפיקסלים
  const trackShare = (method) => {
    if (typeof window.gtag === 'function') window.gtag('event', 'share', { method, content_type: 'audit_result', item_id: 'marketing_audit' });
    if (typeof window.fbq === 'function') window.fbq('trackCustom', 'ShareAudit', { method });
  };
  const buildShareText = () => {
    const s = result ? result.pct : null;
    const avg = stats && typeof stats.avg === 'number' ? stats.avg : null;
    const aboveAvg = s != null && avg != null && s >= avg;
    if (aboveAvg) {
      return `קיבלתי ${s}/100 באבחון השיווק של Shift Up, מעל הממוצע\n` +
        `10 שאלות, 3 דקות ותוצאה מיידית, שווה לכל בעל עסק, בדוק איפה אתה:`;
    }
    // מתחת לממוצע או בלי נתון: ממסגרים את האירוע, בלי להוביל עם ציון שנראה פחות טוב.
    return `עשיתי אבחון שיווק לעסק שלי, גיליתי מה שכבר עובד לי וגם כמה דברים ששווה לתקן\n` +
      `10 שאלות, 3 דקות ותוצאה מיידית, שווה לכל בעל עסק, בדוק את שלך:`;
  };
  const shareCaption = () => buildShareText() + '\n' + shareUrl();

  const shareNative = async () => {
    const caption = shareCaption();
    const blob = shareBlobRef.current;
    if (blob && navigator.canShare) {
      const file = new File([blob], 'shift-up-אבחון-שיווק.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text: caption }); trackShare('native_image'); } catch { /* המשתמש ביטל */ }
        return;
      }
    }
    if (navigator.share) { try { await navigator.share({ text: caption, url: shareUrl() }); trackShare('native_link'); } catch { /* בוטל */ } }
  };
  const downloadShareImg = () => {
    const c = shareCanvasRef.current; if (!c) return;
    const a = document.createElement('a');
    a.href = c.toDataURL('image/png');
    a.download = 'shift-up-אבחון-שיווק.png';
    document.body.appendChild(a); a.click(); a.remove();
    trackShare('download_image');
  };
  const copyCaption = async () => {
    try { await navigator.clipboard.writeText(shareCaption()); setCopied(true); setTimeout(() => setCopied(false), 2200); trackShare('copy_link'); } catch { /* דפדפן לא תומך */ }
  };

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
        phone: normalizePhone(form.phone),
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

  const gaugeColor = result ? (result.pct >= 70 ? 'var(--dg-green-ink)' : result.pct >= 45 ? 'var(--dg-warn-ink)' : 'var(--dg-danger-ink)') : 'var(--dg-green-ink)';
  const CIRC = 553;

  return (
    <div className="dg-root c-page" dir="rtl" data-stage={stage}>
      <style>{CSS}</style>
      <PageNav back="חזרה לאתר" tag="אבחון שיווק" />

      <div className="dg-wrap">
        {/* ── INTRO ── */}
        {stage === 'intro' && (
          <section className="dg-intro">
            <div className="dg-hero">
              <span className="dg-pill">בדיקה חינמית · 10 שאלות · 3 דקות</span>
              <h1>איפה השיווק שלך <em>דולף</em>?</h1>
              <p className="dg-sub">{nd('לא משנה אם אתה משקיע בשיווק כסף או שעות של עבודה - רוב העסקים מבזבזים חלק גדול מההשקעה בלי לראות, ובכמה שאלות קצרות תקבל אבחון אישי: הציון שלך, האזורים החלשים, ו-3 הדברים לתקן קודם.')}</p>
              <div className="dg-card" style={{ textAlign: 'right', padding: '22px 24px' }}>
                <div className="dg-benefit"><i>✓</i><span>מבוסס על שיטת האבחון של Shift Up</span></div>
                <div className="dg-benefit"><i>✓</i><span>תוצאה מיידית, מותאמת לעסק שלך</span></div>
                <div className="dg-benefit" style={{ marginBottom: 0 }}><i>✓</i><span>בלי הרצאות - רק מה לתקן קודם</span></div>
              </div>
              <button className="dg-btn dg-btn-primary" onClick={start}>בוא נתחיל את האבחון ←</button>
            </div>
            <IntroPreview />
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
                {/* מציגים לפי הסדר המעורבב, אבל שומרים תמיד את האינדקס המקורי -
                    כך כל החישוב, הפידבק והסטטיסטיקה נשארים נכונים. */}
                {order[cur].map((oi) => (
                  <button key={oi} className={'dg-opt' + (answers[cur] === oi ? ' sel' : '')} onClick={() => pick(oi)}>
                    <span className="dg-mark" />
                    <span>{q.o[oi][0]}</span>
                  </button>
                ))}
              </div>
              {!q.seg && (
                <button className={'dg-skip' + (answers[cur] === 'skip' ? ' active' : '')} onClick={skip}>
                  {answers[cur] === 'skip' ? '✓ דילגת על השאלה הזו, לחץ כדי לבטל' : 'השאלה הזו לא רלוונטית לעסק שלי, דלג ←'}
                </button>
              )}
              <div className="dg-nav-row">
                <button className="dg-btn dg-btn-ghost" style={{ visibility: cur === 0 ? 'hidden' : 'visible' }} onClick={goPrev}>→ חזור</button>
                <button className="dg-btn dg-btn-primary" onClick={goNext} disabled={answers[cur] == null}>
                  {cur === total - 1 ? 'קבל תוצאה ←' : 'המשך ←'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── RESULT ── */}
        {stage === 'result' && result && (
          <section>
            <div className="dg-card dg-score">
              <div className="dg-gauge-wrap">
                <div className="dg-gauge">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="88" fill="none" stroke="var(--dg-track)" strokeWidth="14" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke={gaugeColor} strokeWidth="14" strokeLinecap="butt"
                      strokeDasharray={CIRC} strokeDashoffset={anim ? CIRC - (CIRC * result.pct) / 100 : CIRC}
                      style={{ transition: 'stroke-dashoffset 1.2s ease', transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }} />
                  </svg>
                  <div className="dg-gauge-num"><b style={{ color: gaugeColor }}>{displayScore}</b><small>מתוך 100</small></div>
                </div>
              </div>
              <div className="dg-verdict">{result.verdict}</div>
              {result.verdictPre && <div className="dg-verdict-sub">{nd(result.verdictPre)}</div>}
              <div className="dg-verdict-sub">{nd(result.verdictSub)}</div>
              {result.skipped > 0 && (
                <div className="dg-verdict-sub" style={{ fontSize: '.82rem', opacity: .75, marginTop: 6 }}>
                  דילגת על {result.skipped} {result.skipped === 1 ? 'שאלה שלא רלוונטית' : 'שאלות שלא רלוונטיות'} לעסק שלך. {nd('הציון והתחומים מחושבים רק על מה שענית.')}
                </div>
              )}
            </div>

            {/* בנצ'מרק חי — מוצג רק כשהוא חיובי (מעל הממוצע). מתחת לממוצע לא מציגים
                כלום כאן, כדי לא להבליט מה שנראה פחות טוב. המידע מתעדכן בכל מילוי. */}
            {stats && typeof stats.avg === 'number' && result.pct >= stats.avg && (
              <div className="dg-card" style={{ textAlign: 'center', borderColor: 'var(--dg-green)' }}>
                <div style={{ color: 'var(--dg-green-ink)', fontWeight: 800, fontSize: '1.1rem' }}>מעל הממוצע</div>
                <p style={{ color: 'var(--dg-text-dim)', fontSize: '.92rem', marginTop: 6 }}>
                  {typeof stats.better_than === 'number' && stats.better_than > 0
                    ? nd(`התוצאה שלך גבוהה מ-${stats.better_than}% מבעלי העסקים שעשו את האבחון. אתה בחצי החזק.`)
                    : nd('התוצאה שלך מעל הציון הממוצע של בעלי העסקים שעשו את האבחון.')}
                </p>
              </div>
            )}

            {/* רמז שיתוף קומפקטי בשיא הרגש — הכרטיס המלא נשאר למטה, אחרי הטופס */}
            <div className="dg-share-mini">
              <span>מכיר עוד בעל עסק שזה יעזור לו? שלח לו</span>
              <button className="dg-btn dg-share-wa" onClick={miniShare}>{canNativeShare ? 'שתף' : 'תמונה לשיתוף'}</button>
            </div>

            {/* מובילים בחיובי — מה שכבר עובד — לפני מה שצריך תיקון */}
            {result.strengths && result.strengths.length > 0 && (
              <div className="dg-card">
                <div className="dg-qcat" style={{ marginBottom: 6, color: 'var(--dg-green-ink)' }}>
                  {result.strengths.length === 1 ? 'מה שכבר עובד לך' : `מה שכבר עובד לך (${result.strengths.length})`}
                </div>
                <p style={{ color: 'var(--dg-text-dim)', fontSize: '.9rem', marginBottom: 18 }}>
                  לפני מה שכדאי לחדד, זה מה שכבר חזק אצלך:
                </p>
                {result.strengths.map((s, i) => (
                  <div className="dg-win" key={s.cat || i}>
                    <span className="dg-win-i">✓</span>
                    <div><h4>{s.t}</h4><p>{nd(s.b)}</p></div>
                  </div>
                ))}
              </div>
            )}

            <div className="dg-card">
              <div className="dg-qcat" style={{ marginBottom: 16 }}>פירוט לפי תחום</div>
              {result.catPcts.map(({ c, p }) => {
                const measured = p !== null;
                // מילוי הבר בצבע המותגי המלא, אבל תווית האחוז ב"דיו" כהה יותר שקריא על רקע בהיר.
                const fill = !measured ? 'var(--dg-text-dim)' : p >= 67 ? 'var(--dg-green)' : p >= 34 ? 'var(--dg-warn)' : 'var(--dg-danger)';
                const ink = !measured ? 'var(--dg-text-dim)' : p >= 67 ? 'var(--dg-green-ink)' : p >= 34 ? 'var(--dg-warn-ink)' : 'var(--dg-danger-ink)';
                return (
                  <div className="dg-bar-row" key={c}>
                    <div className="dg-bar-top"><b>{CATS[c]}</b><span style={{ color: ink }}>{measured ? p + '%' : 'דילגת'}</span></div>
                    <div className="dg-bar-track"><div className="dg-bar-fill" style={{ width: measured && anim ? p + '%' : 0, background: fill, opacity: measured ? 1 : .4 }} /></div>
                  </div>
                );
              })}
            </div>

            {result.leaks.length > 0 ? (
              <div className="dg-card">
                <div className="dg-qcat" style={{ marginBottom: 6, color: 'var(--dg-danger-ink)' }}>
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
                    <div><h4>{w.fb.t}</h4><p>{nd(w.fb.b)}</p></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dg-card" style={{ textAlign: 'center' }}>
                <div className="dg-qcat" style={{ marginBottom: 8, color: 'var(--dg-green-ink)' }}>אין דליפות גדולות</div>
                <p style={{ color: 'var(--dg-text-dim)' }}>{'כל התחומים שלך במצב טוב, וזה נדיר, סימן שהבסיס חזק, ואם נדבר זה יהיה על דיוק ואופטימיזציה, לא על כיבוי שריפות'}</p>
              </div>
            )}

            {/* lead capture — value already given above; form is soft/optional */}
            {status !== 'done' ? (
              <div className="dg-card dg-lead">
                <h2>קח את התוצאה ורוץ, <em>ואם בא <span className="c-nw">לך -</span></em></h2>
                <p className="dg-lead-p">{'התוצאה שלמעלה שלך, בחינם, בלי תנאי, ואם מתחשק לך שאעבור על זה איתך אישית, אשלח לך את 3 הצעדים המדויקים לתיקון, מותאמים לעסק שלך, ונדבר בשיחת היכרות קצרה בטלפון, בלי עלות, רק תשאיר איך לחזור אליך'}</p>
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
                        קראתי ואני מסכים/ה ל<a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--dg-green-ink)', fontWeight: 600 }}>מדיניות הפרטיות</a>, כולל אחסון הפרטים בשרת בחו"ל, ולכך שתיצרו איתי קשר. *
                      </span>
                    </label>
                  </div>
                  {touched && !nameValid && <p style={{ color: 'var(--dg-danger-ink)', fontSize: '.82rem', marginBottom: 8 }}>{nd('נא למלא שם.')}</p>}
                  {touched && nameValid && !phoneValid && <p style={{ color: 'var(--dg-danger-ink)', fontSize: '.82rem', marginBottom: 8 }}>{nd('נא למלא מספר טלפון תקין.')}</p>}
                  {touched && nameValid && phoneValid && !consent && <p style={{ color: 'var(--dg-danger-ink)', fontSize: '.82rem', marginBottom: 8 }}>{nd('יש לאשר את מדיניות הפרטיות כדי להמשיך.')}</p>}
                  <button type="submit" className="dg-btn dg-btn-primary" disabled={status === 'sending'}>
                    {status === 'sending' ? 'שולח…' : 'בוא נדבר - שלח לי את הצעדים ←'}
                  </button>
                  <p className="dg-consent">{'אין חובה, משאירים פרטים רק אם רוצים שאחזור, בלי ספאם, ואפשר להסיר בכל רגע'}</p>
                  <p className="dg-consent" style={{ marginTop: 6 }}>{'התוצאות נשמרות אנונימית לצורך סטטיסטיקה, כדי שאדע איפה עסקים נתקעים, בלי שם, בלי טלפון ובלי קשר אליך'}</p>
                </form>
                <div className="dg-trust">
                  <b style={{ color: 'var(--dg-text)' }}>מי עומד מאחורי זה?</b><br />
                  {'Shift Up, שמואל מוניץ, אסטרטג שיווק: אחרי פגישת עומק אני כותב לך תוכנית ברורה, ועליה אני מקים לך את הקמפיין · תוכנית לפני תקציב · הבטחת ביצוע · בגובה העיניים'}
                </div>
              </div>
            ) : (
              <div className="dg-card dg-thanks">
                <div className="dg-check">✓</div>
                <h2>קיבלתי! נדבר בקרוב</h2>
                <p>{'אחזור אליך תוך 24 שעות עם 3 הצעדים המדויקים לתיקון ועם הצעה לשיחת היכרות קצרה, ובינתיים שמור את הציון שלך'}</p>
              </div>
            )}

            {/* שיתוף — תמונה ממותגת + כיתוב, לסטטוס וואטסאפ ושליחה לחברים */}
            <div className="dg-card" ref={shareCardRef}>
              <div className="dg-qcat" style={{ marginBottom: 8 }}>שתף את התוצאה</div>
              <p style={{ color: 'var(--dg-text-dim)', fontSize: '.92rem', marginBottom: 16 }}>מכיר עוד בעל עסק שמנחש בשיווק? שלח לו את זה, ייקח לו 3 דקות. או שתף בסטטוס. הטקסט והלינק מתלווים לתמונה:</p>
              {shareImg && <div className="dg-share-img"><img src={shareImg} alt="תמונת התוצאה לשיתוף" /></div>}
              <p style={{ fontSize: '.82rem', color: 'var(--dg-text-dim)', marginBottom: 8, fontWeight: 500 }}>הטקסט שילווה את התמונה:</p>
              <div className="dg-share-cap">{shareCaption()}</div>
              <div className="dg-share-btns">
                {canNativeShare && <button className="dg-btn dg-share-wa" onClick={shareNative}>שתף בוואטסאפ (תמונה + טקסט)</button>}
                <button className="dg-btn dg-btn-ghost" onClick={downloadShareImg}>הורד את התמונה</button>
                <button className="dg-btn dg-btn-ghost" onClick={copyCaption}>{copied ? '✓ הועתק!' : 'העתק טקסט + לינק'}</button>
              </div>
            </div>

            <button className="dg-btn dg-btn-ghost" style={{ marginTop: 8 }} onClick={() => { setStage('intro'); setCur(0); setAnswers(new Array(Q.length).fill(null)); setResult(null); setAnim(false); setDisplayScore(0); setForm({ name: '', business: '', email: '', phone: '' }); setConsent(false); setStatus('idle'); setTouched(false); savedRef.current = false; setShareImg(null); setCopied(false); setStats(null); }}>↻ התחל אבחון מחדש</button>
          </section>
        )}

        <div className="dg-footer">{nd('Shift Up · תחזור לנהל את העסק · את השיווק תשאיר לי')}</div>
      </div>
      <Footer />
    </div>
  );
}

const CSS = `
/* /audit בכיוון C (סבב 2, 25.11.2026): פתיחה כהה, שאלון ותוצאה על נייר בהיר (טקסט לקריאה),
   פס הציון כהה, פאנלים לבנים חדים עם פס ירוק, בלי פינות מעוגלות, בלי צל ובלי הילות */
.dg-root{
  --dg-green:#36D98A; --dg-green-ink:#0E8A4C; --dg-green-dim:rgba(14,138,76,.09);
  --dg-bg:var(--c-paper); --dg-card:#ffffff; --dg-card-2:var(--c-paper);
  --dg-purple:#6A4FB5; --dg-text:var(--c-ink); --dg-text-dim:var(--c-ink3);
  --dg-border:#D6DCE1; --dg-track:#DCE1E5;
  --dg-danger:#E5546A; --dg-danger-ink:#B3261E; --dg-warn:#E8A33A; --dg-warn-ink:#8A520C;
  position:relative; min-height:100vh; background:var(--dg-bg); color:var(--c-ink2);
  font-family:'Heebo',sans-serif; line-height:1.6; -webkit-font-smoothing:antialiased;
}
.dg-wrap{position:relative; max-width:760px; margin:0 auto; padding:56px 20px 88px}

/* ── פתיחה (כהה) ── */
.dg-root[data-stage="intro"] .dg-wrap{max-width:1320px; padding:64px 64px 112px}
.dg-hero{text-align:start; max-width:860px; display:flex; flex-direction:column; align-items:flex-start}
.dg-hero > *{max-width:100%}
/* הכפתור לפני הבולטים: במסך הראשון גם מעל באנר העוגיות */
.dg-hero .dg-btn-primary{order:3; margin-bottom:36px}
.dg-hero .dg-card{order:4}
.dg-pill{display:inline-block; font-family:'Heebo',sans-serif; font-size:15px; font-weight:600; color:var(--c-night); background:var(--c-mint); padding:5px 14px; margin-bottom:24px}
.dg-root h1{font-family:'Secular One',sans-serif; font-weight:400; font-size:clamp(44px,6vw,84px); line-height:1.02; color:var(--c-white); margin-bottom:22px; letter-spacing:-.01em}
.dg-root h1 em{color:var(--c-green); font-style:normal}
.dg-sub{color:var(--c-muted); font-size:20px; line-height:1.7; max-width:640px; margin:0 0 32px}
.dg-hero .dg-card{background:transparent; border:0; border-top:1px solid var(--c-line); padding:0 !important; margin:0; width:100%; max-width:640px}
.dg-benefit{display:flex; align-items:baseline; gap:14px; padding:14px 0; margin:0 !important; border-bottom:1px solid var(--c-line); color:var(--c-white); font-size:18px}
.dg-benefit i{color:var(--c-green); font-style:normal; font-weight:700; flex-shrink:0}

/* ── כפתורים ── */
.dg-btn{display:inline-flex; align-items:center; justify-content:center; gap:10px; font-family:'Heebo',sans-serif; font-size:19px; font-weight:600; line-height:1.2; cursor:pointer; padding:18px 34px; border-radius:0; border:0; transition:background .2s, color .2s, border-color .2s; width:100%}
.dg-btn-primary{background:var(--c-green); color:var(--c-ink)}
.dg-btn-primary:hover{background:var(--c-mint)}
.dg-btn-primary:disabled{opacity:.45; cursor:not-allowed}
.dg-btn-primary:disabled:hover{background:var(--c-green)}
.dg-hero .dg-btn-primary{width:auto}
.dg-btn-ghost{background:transparent; color:var(--c-ink); border:1.5px solid var(--c-ink)}
.dg-btn-ghost:hover{background:var(--c-ink); color:var(--c-white)}

/* ── שאלון ── */
.dg-card{background:transparent; border:0; border-top:2px solid var(--c-ink); padding:28px 0 8px; margin-bottom:32px}
.dg-progress-head{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; font-family:'Heebo',sans-serif; font-size:15px; font-weight:500; color:var(--c-ink3)}
.dg-progress-head span:last-child{font-family:'Space Grotesk','Heebo',sans-serif; font-weight:700; color:var(--c-glight)}
.dg-progress-bar{height:4px; background:var(--dg-track); margin-bottom:32px}
.dg-progress-fill{height:100%; background:var(--c-glight); transition:width .35s ease}
.dg-progress-bar + .dg-card{background:#fff; border:1px solid var(--dg-border); border-inline-start:5px solid var(--c-green); padding:34px 36px 32px}
.dg-qcat{font-family:'Heebo',sans-serif; font-size:15px; color:var(--c-glight); font-weight:600; margin-bottom:10px}
.dg-qtext{font-family:'Secular One',sans-serif; font-size:30px; line-height:1.25; color:var(--c-ink); margin-bottom:26px; text-wrap:balance}
.dg-opts{display:flex; flex-direction:column; gap:10px}
.dg-opt{text-align:start; font-family:'Heebo',sans-serif; font-size:17px; line-height:1.5; color:var(--c-ink2); background:var(--c-paper); border:1.5px solid #C9D0D6; border-radius:0; padding:16px 18px; cursor:pointer; transition:border-color .15s, background .15s; display:flex; align-items:center; gap:14px}
.dg-opt:hover{border-color:var(--c-ink3); background:#fff}
.dg-opt.sel{border-color:var(--c-glight); background:var(--dg-green-dim); color:var(--c-ink)}
.dg-mark{width:20px; height:20px; border:2px solid #8A949F; flex-shrink:0; display:grid; place-items:center; transition:.15s}
.dg-opt.sel .dg-mark{border-color:var(--c-glight); background:var(--c-glight)}
.dg-opt.sel .dg-mark::after{content:''; width:8px; height:8px; background:#fff}
.dg-nav-row{display:flex; gap:12px; margin-top:28px}
.dg-nav-row .dg-btn{width:auto; flex:1}
.dg-skip{background:none; border:none; font-family:'Heebo',sans-serif; color:var(--c-ink3); font-size:15px; cursor:pointer; margin-top:18px; padding:6px 0; text-decoration:underline; text-underline-offset:4px; display:block; text-align:start}
.dg-skip:hover{color:var(--c-glight)}
.dg-skip.active{color:var(--c-glight); font-weight:600; text-decoration:none}

/* ── תוצאה: פס הציון כהה ── */
.dg-score{
  --dg-green-ink:#36D98A; --dg-warn-ink:#F0A12A; --dg-danger-ink:#FF7A8A; --dg-track:#1E262F; --dg-text-dim:var(--c-muted);
  background:var(--c-night); color:var(--c-white); border-top:0; border-inline-start:6px solid var(--c-green); padding:40px 36px 34px; margin-bottom:40px
}
.dg-gauge-wrap{text-align:center; margin-bottom:10px}
.dg-gauge{position:relative; width:200px; height:200px; margin:0 auto 8px}
.dg-gauge-num{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center}
.dg-gauge-num b{font-family:'Space Grotesk','Heebo',sans-serif; font-size:64px; font-weight:700; line-height:1}
.dg-gauge-num small{color:var(--c-muted); font-size:14px; margin-top:4px}
.dg-verdict{text-align:center; font-family:'Secular One',sans-serif; font-size:30px; line-height:1.25; margin:6px 0 10px; color:var(--c-white)}
.dg-verdict-sub{text-align:center; color:var(--c-muted); font-size:17px; line-height:1.65; max-width:560px; margin:0 auto 6px}
.dg-score .dg-verdict-sub[style]{color:var(--c-dim)}

.dg-bar-row{margin-bottom:18px}
.dg-bar-top{display:flex; justify-content:space-between; align-items:baseline; font-size:16px; margin-bottom:7px; color:var(--c-ink)}
.dg-bar-top b{font-weight:500}
.dg-bar-top span{font-family:'Space Grotesk','Heebo',sans-serif; font-weight:700}
.dg-bar-track{height:6px; background:var(--dg-track)}
.dg-bar-fill{height:100%; transition:width .8s ease}

.dg-leak, .dg-win{display:flex; gap:16px; align-items:flex-start; padding:18px 0; border-bottom:1px solid var(--dg-border); margin:0}
.dg-leak:last-child, .dg-win:last-child{border-bottom:0}
.dg-leak-n{font-family:'Space Grotesk','Heebo',sans-serif; font-weight:700; color:var(--dg-danger-ink); font-size:20px; flex-shrink:0; min-width:22px; line-height:1.3}
.dg-win-i{font-weight:700; color:var(--c-glight); font-size:19px; flex-shrink:0; min-width:22px; line-height:1.35}
.dg-leak h4, .dg-win h4{font-size:19px; font-weight:700; color:var(--c-ink); margin-bottom:4px; line-height:1.35}
.dg-leak p, .dg-win p{color:var(--c-ink3); font-size:16px; line-height:1.65}

/* ── הטופס: אותו פאנל לבן חד של הטופס בעמוד הראשי ── */
.dg-lead{text-align:start; background:#fff; border:1px solid var(--dg-border); border-inline-start:5px solid var(--c-green); padding:34px 36px 30px}
.dg-lead h2{font-family:'Secular One',sans-serif; font-weight:400; font-size:32px; line-height:1.2; color:var(--c-ink); margin-bottom:10px}
.dg-lead h2 em{color:var(--c-glight); font-style:normal}
.dg-lead-p{color:var(--c-ink3); font-size:17px; line-height:1.7; margin-bottom:26px}
.dg-field{margin-bottom:16px; text-align:start}
.dg-field label{display:block; font-family:'Heebo',sans-serif; font-size:15px; color:var(--c-ink2); margin-bottom:7px; font-weight:600}
.dg-field input:not([type="checkbox"]){width:100%; font-family:'Heebo',sans-serif; font-size:17px; color:var(--c-ink); background:#fff; border:1.5px solid #B9C2CA; border-radius:0; padding:14px 16px; transition:border-color .2s, box-shadow .2s}
.dg-field input:focus{outline:none; border-color:var(--c-glight); box-shadow:0 0 0 3px rgba(14,138,76,.18)}
.dg-field input::placeholder{color:#737D87}
.dg-field label[for="dg-consent"] span{color:var(--c-ink3); font-size:15px !important}
.dg-consent{font-size:14px; line-height:1.6; color:var(--c-ink3); margin-top:14px}
.dg-trust{margin-top:24px; padding-top:20px; border-top:1px solid var(--dg-border); color:var(--c-ink3); font-size:15px; line-height:1.7}
.dg-thanks{text-align:start; background:var(--c-night); color:var(--c-white); border-top:0; border-inline-start:6px solid var(--c-green); padding:36px}
.dg-thanks .dg-check{width:56px; height:56px; background:var(--c-green); display:grid; place-items:center; margin:0 0 20px; font-size:28px; font-weight:700; color:var(--c-ink)}
.dg-thanks h2{font-family:'Secular One',sans-serif; font-weight:400; font-size:32px; margin-bottom:8px; color:var(--c-white)}
.dg-thanks p{color:var(--c-muted); font-size:17px}

/* ── שיתוף ── */
.dg-share-img{margin-bottom:18px; border:1px solid var(--dg-border); background:#fff}
.dg-share-img img{display:block; width:100%; max-height:520px; object-fit:contain; margin:0 auto}
.dg-share-cap{background:#fff; border:1px solid var(--dg-border); border-inline-start:4px solid var(--c-ink); padding:14px 16px; font-size:15px; color:var(--c-ink3); white-space:pre-wrap; line-height:1.65; margin-bottom:18px; overflow-wrap:anywhere}
.dg-share-mini{display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; border-top:1px solid var(--dg-border); border-bottom:1px solid var(--dg-border); padding:16px 0; margin-bottom:32px}
.dg-share-mini span{font-weight:500; font-size:17px; color:var(--c-ink)}
.dg-share-mini .dg-btn{width:auto; padding:11px 20px; font-size:16px; white-space:nowrap; flex-shrink:0}
.dg-share-btns{display:flex; flex-direction:column; gap:10px}
.dg-share-wa{background:#1E8A50; color:#fff}
.dg-share-wa:hover{background:#18764A}
.dg-footer{text-align:start; color:var(--c-ink3); font-size:15px; margin-top:48px; padding-top:18px; border-top:1px solid var(--dg-border)}
.dg-root[data-stage="intro"] .dg-footer{color:var(--c-dim); border-top-color:var(--c-line); margin-top:72px}
.dg-btn:focus-visible,.dg-opt:focus-visible,.dg-skip:focus-visible{outline:2px solid var(--c-glight); outline-offset:3px}
.dg-root[data-stage="intro"] .dg-btn:focus-visible{outline-color:var(--c-mint)}
.dg-field input:focus-visible{outline:2px solid var(--c-glight); outline-offset:1px}

/* AD דפים 1 #4: בפתיחה, מ-1024px, תצוגה מקדימה של התוצאה בצד השמאלי */
.dg-preview{display:none}
@media (min-width:1024px){
  .dg-intro{display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr); gap:72px; align-items:start}
  .dg-preview{display:block; background:var(--c-paper); border-inline-start:6px solid var(--c-green); margin-top:8px}
  .dg-preview .dg-score{margin:0; border-inline-start:0; padding:28px 28px 22px}
  .dg-preview .dg-gauge{width:150px; height:150px}
  .dg-preview .dg-gauge svg{width:150px; height:150px}
  .dg-preview .dg-gauge-num b{font-size:46px}
  .dg-preview .dg-verdict{font-size:24px; margin-bottom:0}
  .dg-preview__bars{padding:22px 28px 10px}
  .dg-preview .dg-bar-row{margin-bottom:12px}
  .dg-preview .dg-bar-top{font-size:15px}
}

/* AD דפים 1 #1: בחירה אחת = עיגול (לא תיבת סימון) */
.dg-mark{border-radius:50%}
.dg-opt.sel .dg-mark::after{border-radius:50%}

@media (max-width:760px){
  .dg-wrap{padding:36px 20px 64px}
  /* השאלון במובייל: כל 4 התשובות במסך הראשון, גם מעל באנר העוגיות */
  .dg-root[data-stage="quiz"] .dg-wrap{padding:14px 16px 48px}
  .dg-progress-head{font-size:13px; margin-bottom:6px}
  .dg-progress-bar{margin-bottom:12px}
  .dg-progress-bar + .dg-card{padding:16px 14px 18px}
  .dg-qcat{font-size:13px; margin-bottom:4px}
  .dg-root .dg-qtext{font-size:21px; line-height:1.22; margin-bottom:12px}
  .dg-opts{gap:7px}
  .dg-root .dg-opt{font-size:15px; line-height:1.4; padding:10px 12px; gap:10px}
  .dg-mark{width:18px; height:18px}
  .dg-skip{margin-top:10px; font-size:14px}
  .dg-nav-row{margin-top:14px}
  .dg-nav-row .dg-btn{padding:13px 10px; font-size:16px; white-space:nowrap}
  .dg-root[data-stage="intro"] .dg-wrap{padding:32px 20px 64px}
  .dg-pill{margin-bottom:16px}
  .dg-root h1{font-size:40px; margin-bottom:12px}
  .dg-sub{font-size:16px; line-height:1.6; margin-bottom:20px}
  .dg-hero .dg-btn-primary{margin-bottom:28px}
  .dg-benefit{font-size:16px; padding:12px 0}
  .dg-hero .dg-btn-primary{width:100%}
  .dg-btn{font-size:17px; padding:16px 22px}
  .dg-score{padding:30px 18px 26px}
  .dg-verdict{font-size:25px}
  .dg-verdict-sub{font-size:16px}
  .dg-lead{padding:26px 18px 24px}
  .dg-lead h2{font-size:27px}
  .dg-lead-p{font-size:16px}
  .dg-thanks{padding:28px 20px}
  .dg-leak h4, .dg-win h4{font-size:17px}
  .dg-leak p, .dg-win p{font-size:15px}
}
@media (prefers-reduced-motion: reduce){
  .dg-root *{animation-duration:.01ms!important; transition-duration:.01ms!important}
}
`;
