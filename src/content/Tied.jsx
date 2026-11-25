/* ── שבירות שורה בעברית בלי לשנות טקסט (סבב 3, 25.11.2026) ──
   <Tied text="..."/>:
   - *...* = קטע ירוק (c-g)
   - מילה שמסתיימת בפסיק נצמדת למילה שאחריה (span עם white-space: nowrap), כך שפסיק לא נשאר בסוף שורה
   - ~ = רווח שלא נשבר ("בלי~לשרוף")
   בלי תווי nbsp. הרווח שנראה ב"שלך ," בא מ-ך סופית ב-Secular One, ומתוקן ב-c-kc. */
export default function Tied({ text }) {
  const words = [];
  String(text || '').split('*').forEach((seg, i) => {
    seg.split(' ').filter(Boolean).forEach((w) => words.push({ w: w.replace(/~/g, ' '), g: i % 2 === 1, nw: w.includes('~') }));
  });
  // ב-Secular One ל-ך סופית יש ריווח רחב משמאל, ופסיק אחריה נראה מנותק ("שלך ,"). מקרבים רק את הפסיק (c-kc)
  const body = (w) => (/ך,$/.test(w) ? <>{w.slice(0, -1)}<span className="c-kc">,</span></> : w);
  const word = (x, k) => (
    <span key={k} className={[x.g ? 'c-g' : '', x.nw ? 'c-nw' : ''].filter(Boolean).join(' ') || undefined}>{body(x.w)}</span>
  );
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const a = words[i];
    const b = words[i + 1];
    if (i > 0) out.push(' ');
    if (b && /,$/.test(a.w)) {
      out.push(<span key={`t${i}`} className="c-nw">{word(a, 'a')}{' '}{word(b, 'b')}</span>);
      i++;
    } else {
      out.push(word(a, i));
    }
  }
  return <>{out}</>;
}

/* גמר שורה (סבב 2 דפים, AD #8): בלי מילה יתומה ובלי מקף בקצה שורה, בלי לשנות מילה.
   - שתי המילים האחרונות נצמדות (~)
   - המקף נצמד למילה שלפניו ("X~-"), כך שלא יפתח שורה
   משתמשים ב-<Tied text={fin(...)} /> */
export function fin(text) {
  if (typeof text !== 'string') return text;
  let s = text.replace(/ - /g, '~- ');
  const i = s.lastIndexOf(' ');
  if (i > 0 && !s.slice(i + 1).includes('*')) s = s.slice(0, i) + '~' + s.slice(i + 1);
  return s;
}
