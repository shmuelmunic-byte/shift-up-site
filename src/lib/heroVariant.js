/* ── A/B בכותרת ההירו (25.11.2026) ──
   חלוקה אקראית 50/50 בכניסה הראשונה, נשמרת ב-localStorage (נכשל → 'a').
   ?v=a / ?v=b כופים וריאנט (בלי לשמור). מסמנים ב-Clarity אם קיים.
   הערך משמש גם בטופס (source) ובאירועי Lead / generate_lead (variant). */
const KEY = 'su_hero_variant_v1';
let cached = null;

export function getHeroVariant() {
  if (cached) return cached;
  let v = 'a';
  try {
    const forced = new URLSearchParams(window.location.search).get('v');
    if (forced === 'a' || forced === 'b') {
      v = forced;
    } else {
      const saved = localStorage.getItem(KEY);
      if (saved === 'a' || saved === 'b') {
        v = saved;
      } else {
        v = Math.random() < 0.5 ? 'a' : 'b';
        localStorage.setItem(KEY, v);
      }
    }
  } catch {
    v = 'a';
  }
  cached = v;
  try {
    if (typeof window.clarity === 'function') window.clarity('set', 'hero_variant', v);
  } catch { /* noop */ }
  return v;
}
