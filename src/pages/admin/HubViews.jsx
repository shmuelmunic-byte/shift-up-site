import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/* Stage 3: "Today" + active client files. Stage 4: light actions.
   All hub_* tables are small (tens of rows), so they load once into one shared
   store and every section is computed from it. Fresh data arrives by Realtime
   when the browser can reach supabase.co directly, and by a 2-minute refresh
   plus a refresh on returning to the tab when it can't (kosher filters).
   Actions (done / postpone / add / paid) are saved to hub_actions on the tap
   itself. The local sync agent writes them to the center files; until then the
   row shows a small clock. "Undo" marks the queued action cancelled. */

const STALE_MIN = 15;
const TZ = 'Asia/Jerusalem';
const REFRESH_MS = 120000;
const UNDO_MS = 6000;
const HUB_TABLES = ['hub_clients', 'hub_tasks', 'hub_events', 'hub_inbox', 'hub_collect', 'hub_goals', 'hub_sync_status', 'hub_actions'];
const DISMISSED_KEY = 'hub-dismissed-failed';
const WAIT_LIMIT = 5; // "waiting for client" shows the oldest few, the rest behind a tap

/* ─── dates (always Jerusalem time) ─── */
const isoDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const dayNum = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000;
const daysBetween = (fromIso, toIso) => (fromIso && toIso ? Math.round(dayNum(toIso) - dayNum(fromIso)) : null);
const addDays = (iso, n) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const fmtTime = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const fmtDay = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(iso));
const fmtShortDate = (iso) => (iso ? `${+iso.slice(8, 10)}.${+iso.slice(5, 7)}` : '');
const daysWord = (n) => (n === 1 ? 'יום' : `${n} ימים`);
const weekday = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 = Sunday
/* next working day: Shmuel doesn't work Friday or Shabbat */
function nextWorkday(today) {
  let d = addDays(today, 1);
  while (weekday(d) === 5 || weekday(d) === 6) d = addDays(d, 1);
  return d;
}
/* internal target (10.11, Shmuel): finish 2 working days before the deadline. Fri/Sat don't count */
const GOAL_DAYS = 2;
function workdaysBefore(iso, n) {
  let d = iso;
  for (let k = 0; k < n;) { d = addDays(d, -1); if (weekday(d) !== 5 && weekday(d) !== 6) k += 1; }
  return d;
}
/* a task tied to a fixed moment (a call, a meeting, an open day, a Shabbat pause, questions asked in a call)
   happens ON its date: no buffer. Preparing for it still gets the buffer. 📌 marks it explicitly (10.11) */
const FIXED_RE = /📌|📞|🕯️|🎯|שיחת|שיחה(?!\s*הבאה)|פגישה|פגישת|זום|יום פתוח|הצגת|בשיחה|בפגישה|בהצגת|השהיה|להשהות|הפעלה במוצ|עלייה|לחייג|להתקשר/;
const PREP_RE = /הכנה|להכין|הכנת|לפני השיחה|לפני הפגישה|PDF/;
const isFixed = (t) => { const s = `${t.title || ''} ${t.owner || ''}`; return FIXED_RE.test(s) && !PREP_RE.test(t.title || ''); };
const goalOf = (t) => (t.due ? (isFixed(t) ? t.due : workdaysBefore(t.due, GOAL_DAYS)) : null);
/* one meta line: past the deadline (red), past the target (amber), target today, or "finish by" */
function deadlineMeta(t, today) {
  if (!t.due) return { meta: null };
  const g = goalOf(t);
  const over = daysBetween(t.due, today);
  if (isFixed(t)) {
    if (over > 0) return { meta: `המועד עבר לפני ${daysWord(over)}`, metaTone: 'late' };
    if (over === 0) return { meta: '📌 היום', metaTone: 'now' };
    return { meta: `📌 ${fmtShortDate(t.due)}` };
  }
  if (over > 0) return { meta: `באיחור ${daysWord(over)}`, metaTone: 'late' };
  if (g < today) return { meta: `עבר היעד · דדליין ${fmtShortDate(t.due)}`, metaTone: 'warn' };
  if (g === today) return { meta: `לסיים היום · דדליין ${fmtShortDate(t.due)}`, metaTone: 'now' };
  return { meta: `לסיים עד ${fmtShortDate(g)}` };
}
const money = (n) => `${Number(n).toLocaleString('he-IL')} ₪`;
/* phone numbers stay out of titles on screen (the WhatsApp button already has them) */
const PHONE_RE = /(\s*ל-)?\s*\(?\b0\d{1,2}-?\d{3}-?\d{4}\b\)?/g;
/* agency task ids ("S-261109-10 · ", "(S-261108-08)") are for the files, not for the screen */
const TASK_ID_RE = /\s*\(?\bS-\d{6}-\d{2}\b\)?\s*·?\s*/g;
const clean = (s) => (s ? String(s).replace(TASK_ID_RE, ' ').replace(PHONE_RE, '').replace(/\s+,/g, ',').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim() : s);
const fmtPhone = (s) => { const d = String(s || '').replace(/\D/g, '').replace(/^972/, '0'); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : /@lid$/.test(String(s || '')) ? 'מספר לא שמור' : s; };
/* the bridge's marks for a message that is not text, in words */
const previewText = (s) => String(s || '').replace(/^\[איש קשר\]\s*/, 'שלח איש קשר: ').replace(/\[statusMentionMessage\]/g, 'תייג אותך בסטטוס').replace(/\[unknown\]/g, 'הודעה בלי טקסט');
/* WhatsApp makes sense next to a call or meeting, not next to an open day or a reminder */
const isCall = (e) => /📞|שיחה|שיחת|זום|פגישה|פגישת/.test(e.title || '');
const waLink = (phone) => (phone ? `https://wa.me/${String(phone).replace(/\D/g, '')}` : null);

function ago(iso, now) {
  if (!iso) return '';
  const min = Math.round((now - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'עכשיו';
  if (min < 60) return `לפני ${min} דק'`;
  if (min < 60 * 24) return `לפני ${Math.round(min / 60)} שע'`;
  return `לפני ${daysWord(Math.round(min / 1440))}`;
}

/* ─── whose turn is it now ───
   The owner column is a chain ("🤖 קופירייטר ✅ → 🤖 עורך וידאו ✅ → שמואל → שירה").
   Steps marked ✅ are behind us; the first open step owns the task now.
   10.11: agents' tasks were showing as Shmuel's, and he couldn't tell what to actually do. */
const SELF_RE = /^(אני|שמואל)(?![\p{L}])/u;
function whoseTurn(t) {
  const owner = String(t.owner || '').trim();
  const wait = String(t.waiting_on || '').trim();
  const live = owner.split('→').map((s) => s.trim()).filter((s) => s && !/✅/.test(s));
  const cur = live[0] || '';
  const nxt = (live[1] || '').replace(/\s*\(.*$/, '').trim();
  if (/^שמואל/.test(wait)) {
    const inner = (wait.match(/\(([^)]+)\)/) || [])[1] || '';
    const pass = inner.match(/העברה ל(\S+)/);
    return { who: 'me', verb: pass ? `להעביר ל${pass[1]}` : /אישור/.test(inner + wait) ? 'לאשר' : null };
  }
  if (/^(אוטומטי|⏰)/.test(cur)) return { who: 'agent', agent: 'אוטומטי', then: live.some((s) => SELF_RE.test(s)) };
  if (/^(🤖|המנהל)/.test(cur)) {
    const agent = /^המנהל/.test(cur) ? 'Claude' : cur.replace(/^🤖\s*/, '').replace(/\s*[(+/].*$/, '').trim();
    return { who: 'agent', agent, then: live.slice(1).some((s) => SELF_RE.test(s)) };
  }
  if (t.status === 'waiting' || /^(לקוח|ליד)/.test(cur)) return { who: 'client' };
  if (!cur || SELF_RE.test(cur)) {
    let verb = null;
    if (/מאשר|אישור/.test(cur) || /אישור/.test(live[1] || '')) verb = 'לאשר';
    else if (/בשיחה|בהצגת|בפגישה/.test(cur)) verb = 'בשיחה';
    else if (/עונה/.test(cur)) verb = 'לענות';
    else if (nxt && !/🤖/.test(nxt)) verb = `להעביר ל${nxt}`;
    return { who: 'me', verb };
  }
  return { who: 'client', name: cur.replace(/\s*\(.*$/, '') }; // a client's own name (שירה, ...)
}
/* 10.11: a step the agency proposed for a big task waits for Shmuel's OK (🟦), an agent task he started shows ▶️ */
const isProposed = (t) => /^🟦/.test(t.status_note || '');
/* 13.11: a rejected output (🔲 ↩️) is already back in the agency queue, so no second "תתחיל" */
const isStarted = (t) => /^(▶️|🔲\s*↩️)/.test(t.status_note || '');
const isClientSide = (t) => whoseTurn(t).who === 'client';
const isMine = (t) => whoseTurn(t).who === 'me';
const isAgents = (t) => whoseTurn(t).who === 'agent';
/* one short line: no enumeration ("ד. "), no leading status emoji, details after the first bracket go to the details */
function shortTitle(s) {
  let x = String(clean(s) || '').replace(/\*\*/g, '').replace(/^[^\p{L}\p{N}"']+/u, '').replace(/^[א-ת]\.\s+/, '').trim();
  if (x.length > 56) x = x.replace(/\s*\([^)]*\)/g, '').replace(/\s{2,}/g, ' ').trim(); // brackets go to the details
  if (x.length > 56) { const at = x.search(/:\s|\s→|\s·\s|\s\+\s/); if (at > 8) x = x.slice(0, at); }
  return x;
}
const isOpen = (t) => t.section === 'פתוח' && (t.status === 'open' || t.status === 'waiting');
const QUIET_STAGES = /מוקפא|נסגר|סגור/;

/* ─── 23.11 CRM: a color per kind of work, always with a shape and a label (never color alone) ───
   "waiting for someone" is a status tag (⧗), not a kind: a waiting task keeps the color of its kind.
   Red stays for late dates only. */
const CAT = {
  client: { label: 'לקוח', shape: '●' },
  lead: { label: 'ליד', shape: '▲' },
  internal: { label: 'פנימי', shape: '■' },
  money: { label: 'כסף', shape: '₪' },
};
const CAT_KEYS = ['client', 'lead', 'internal', 'money'];
const MONEY_RE = /תשלום|לגבות|גבייה|גביה|מקדמה|חשבונית|יתרה/;
function CatTag({ cat, bare }) {
  return (
    <span className="hub-cat" data-c={cat} data-bare={bare || undefined}>
      <i aria-hidden="true">{CAT[cat].shape}</i><span>{CAT[cat].label}</span>
    </span>
  );
}
const LEAD_STAGES = ['חי', 'כדור אצלם'];
const STAGE_COLS = [['חי', 'ליד חי'], ['כדור אצלם', 'כדור אצלם'], ['שוטף', 'לקוח פעיל'], ['מוקפא', 'מוקפא']];
const stageLabel = (s) => (STAGE_COLS.find(([k]) => k === s) || [s, s || 'בלי שלב'])[1];
const HE_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
/* a date the way people say it: today, tomorrow, or "ד׳ 25.11" */
const fmtStep = (iso, today) => (iso === today ? 'היום' : iso === addDays(today, 1) ? 'מחר' : `${HE_DAYS[weekday(iso)]} ${fmtShortDate(iso)}`);
/* dates written inside free text ("עד 25.11", "ב-3.12.2026"). Without a year: the closest one.
   Anything further than 4 months from today is not a date of a next step (it is "1.5 אלף") */
function datesIn(text, today) {
  const out = [];
  const re = /(^|[^\d,.:])(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?(?![\d.]*\d)/g;
  let m;
  while ((m = re.exec(String(text || '')))) {
    const d = +m[2], mo = +m[3];
    if (d < 1 || d > 31 || mo < 1 || mo > 12) continue;
    const y0 = +today.slice(0, 4);
    const mk = (y) => `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const years = m[4] ? [m[4].length === 2 ? 2000 + +m[4] : +m[4]] : [y0 - 1, y0, y0 + 1];
    const iso = years.map(mk).sort((a, b) => Math.abs(daysBetween(today, a)) - Math.abs(daysBetween(today, b)))[0];
    if (Math.abs(daysBetween(today, iso)) <= 120) out.push(iso);
  }
  return out;
}
/* a finished line as it is written in the files, without the marks around it */
const doneText = (s) => String(clean(s) || '').replace(/\(סומן מהמסך\)/g, '').replace(/…$/, '').replace(/^[^\p{L}\p{N}"']+/u, '').replace(/\s{2,}/g, ' ').trim();
const bizOf = (cl) => (cl.id.split(' - ')[1] || '').trim() || cl.business || '';
function matchClient(cl, q) {
  if (!q) return true;
  const digits = q.replace(/\D/g, '').replace(/^0/, '');
  if (digits.length >= 3 && cl.phone && String(cl.phone).includes(digits)) return true;
  const hay = `${cl.name || ''} ${cl.id} ${cl.business || ''} ${cl.source || ''}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

/* ─── shared store ─── */
const HubCtx = createContext(null);

function realtimeClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // separate client straight to supabase.co: the /sb proxy on Vercel can't carry websockets
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export function HubProvider({ children }) {
  const [state, setState] = useState({ loading: true, error: null, data: null, live: false, loadedAt: null });
  const [search, setSearch] = useState(''); // the header search box, read by the pipeline and people views
  const [now, setNow] = useState(() => Date.now());
  const timer = useRef(null);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  const load = useCallback(async () => {
    const since = new Date(Date.now() - 3 * 86400000).toISOString(); // actions: only the last 3 days
    const res = await Promise.all(HUB_TABLES.map((t) => (t === 'hub_actions'
      ? supabase.from(t).select('*').gte('created_at', since).order('created_at')
      : supabase.from(t).select('*'))));
    const error = res.find((r) => r.error)?.error || null;
    setState((s) => ({
      ...s,
      loading: false,
      error: error && !s.data ? error : null,
      data: error ? s.data : Object.fromEntries(HUB_TABLES.map((t, i) => [t, res[i].data || []])),
      loadedAt: error ? s.loadedAt : new Date(),
    }));
  }, []);

  const soon = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(load, 700); // the agent writes several tables in a row
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch; state is set after the network call
    load();
    const iv = setInterval(load, REFRESH_MS);
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);

    let rt = null, channel = null, authSub = null, dead = false;
    (async () => {
      try {
        rt = realtimeClient();
        if (!rt) return;
        const { data } = await supabase.auth.getSession();
        if (dead || !data.session) return;
        rt.realtime.setAuth(data.session.access_token);
        authSub = supabase.auth.onAuthStateChange((_e, session) => { if (session) rt.realtime.setAuth(session.access_token); }).data.subscription;
        channel = rt.channel('hub-live');
        for (const t of HUB_TABLES) channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, soon);
        channel.subscribe((status) => { if (!dead) setState((s) => ({ ...s, live: status === 'SUBSCRIBED' })); });
      } catch { /* polling keeps working */ }
    })();

    return () => {
      dead = true;
      clearInterval(iv);
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVis);
      authSub?.unsubscribe();
      if (channel) rt.removeChannel(channel);
    };
  }, [load, soon]);

  /* ─── actions ─── */
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const say = useCallback((t) => {
    clearTimeout(toastTimer.current);
    setToast({ ...t, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), t.undo ? UNDO_MS : 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const putAction = useCallback((row) => setState((s) => (s.data ? {
    ...s, data: { ...s.data, hub_actions: [...s.data.hub_actions.filter((a) => a.id !== row.id), row] },
  } : s)), []);

  const cancel = useCallback(async (id) => {
    const { data, error } = await supabase.from('hub_actions').update({ status: 'cancelled' }).eq('id', id).eq('status', 'pending').select().maybeSingle();
    if (error) say({ msg: 'לא הצלחתי לבטל. נסה שוב', bad: true });
    else if (!data) say({ msg: 'כבר נכתב לקובץ, אי אפשר לבטל מכאן', bad: true });
    else { putAction(data); say({ msg: 'בוטל' }); }
  }, [putAction, say]);

  /* saved on the tap itself, never delayed (a closed tab must not lose it) */
  const act = useCallback(async (kind, targetId, payload, msg) => {
    const { data, error } = await supabase.from('hub_actions').insert({ kind, target_id: targetId, payload }).select().single();
    if (error) { say({ msg: 'לא נשמר. בדוק חיבור ונסה שוב', bad: true }); return false; }
    putAction(data);
    say({ msg, undo: () => cancel(data.id) });
    return true;
  }, [putAction, say, cancel]);

  return (
    <HubCtx.Provider value={{ ...state, now, reload: load, act, search, setSearch }}>
      {children}
      {toast && (
        <div className="admin-scope hub-toast-wrap" dir="rtl">
          <div className="hub-toast" role="status" data-bad={toast.bad || undefined} key={toast.key}>
            <span>{toast.msg}</span>
            {toast.undo && <button type="button" onClick={() => { const u = toast.undo; setToast(null); u(); }}>בטל</button>}
          </div>
        </div>
      )}
    </HubCtx.Provider>
  );
}

const useHub = () => useContext(HubCtx);

/* ─── header pieces ─── */
export function HebrewDates() {
  const now = new Date();
  let heb = '';
  try {
    heb = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { timeZone: TZ, day: 'numeric', month: 'long' }).format(now);
  } catch { /* old browsers: civil date only */ }
  const civ = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  return <span className="adm-dates">{civ}{heb ? ` · ${heb}` : ''}</span>;
}

/* 23.11: one search box in the header (name, phone, field, business). Typing from another screen jumps to the people */
export function HubSearch({ onType }) {
  const hub = useHub();
  if (!hub) return null;
  return (
    <label className="adm-search">
      <span>חיפוש</span>
      <input type="search" value={hub.search} placeholder="שם, טלפון, תחום" aria-label="חיפוש לקוח או ליד" autoComplete="off"
        onChange={(e) => { hub.setSearch(e.target.value); if (e.target.value) onType?.(); }} />
    </label>
  );
}

export function SyncBar() {
  const hub = useHub();

  if (!hub || hub.loading) return <span className="adm-sync"><span className="adm-dot" />בודק סנכרון</span>;
  if (hub.error) return <span className="adm-sync" data-state="stale"><span className="adm-dot" data-state="stale" />אין חיבור לנתונים</span>;
  const row = [...(hub.data?.hub_sync_status || [])].sort((a, b) => String(b.last_seen_at).localeCompare(String(a.last_seen_at)))[0];
  if (!row?.last_seen_at) return <span className="adm-sync" data-state="stale"><span className="adm-dot" data-state="stale" />סוכן הסנכרון עוד לא רץ</span>;
  const min = Math.round((hub.now - new Date(row.last_seen_at).getTime()) / 60000);
  const stale = min > STALE_MIN;
  /* 10.11: the agent can be alive but failing every round. Green = the last round that succeeded, not "alive" */
  const okMin = row.last_ok_at ? Math.round((hub.now - new Date(row.last_ok_at).getTime()) / 60000) : Infinity;
  if (!stale && okMin > 5) {
    return (
      <span className="adm-sync" data-state="stale" title={row.note || ''}>
        <span className="adm-dot" data-state="stale" />
        {`הסנכרון נכשל, הנתונים ${row.last_ok_at ? ago(row.last_ok_at, hub.now) : 'ישנים'}`}
      </span>
    );
  }
  return (
    <span className="adm-sync" data-state={stale ? 'stale' : 'ok'} title={hub.live ? 'מתעדכן חי' : 'מתעדכן כל 2 דקות'}>
      <span className="adm-dot" data-state={stale ? 'stale' : 'ok'} />
      {stale ? `המחשב לא סנכרן ${ago(row.last_seen_at, hub.now).replace('לפני ', '')}` : `עודכן ${ago(row.last_seen_at, hub.now)}`}
    </span>
  );
}

/* ─── building blocks ─── */
function Section({ title, count, extra, empty, loading, error, children, id }) {
  const has = [children].flat(Infinity).some(Boolean);
  return (
    <section className="hub-sec" aria-labelledby={id}>
      <div className="hub-sec-head">
        <h2 id={id}>{title}</h2>
        {!loading && !error && count > 0 && <span className="n">{count}</span>}
        {extra && <span className="hub-sec-extra">{extra}</span>}
      </div>
      {loading ? <div className="hub-skel" aria-label="טוען" />
        : error ? <p className="hub-err">לא הצלחתי לטעון את זה עכשיו</p>
        : !has ? <p className="hub-empty">{empty}</p>
        : <ul className="hub-rows">{children}</ul>}
    </section>
  );
}

/* one line closed, details on tap. kb = reachable with J/K, lead = control before the text */
function Row({ main, sub, meta, metaTone, action, details, kb, lead, pending, below, cat }) {
  const [open, setOpen] = useState(false);
  const canOpen = details && details.some(([, v]) => v);
  return (
    <li className="hub-row" data-open={open || undefined} data-kb={kb || undefined} data-pending={pending || undefined} data-c={cat || undefined} tabIndex={kb ? -1 : undefined}>
      <div className="hub-row-line">
        {lead}
        {canOpen ? (
          <button type="button" className="hub-row-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="main">{main}{sub && <span className="sub"> · {sub}</span>}</span>
          </button>
        ) : (
          <span className="hub-row-btn"><span className="main">{main}{sub && <span className="sub"> · {sub}</span>}</span></span>
        )}
        {cat && <CatTag cat={cat} />}
        {meta && <span className={`meta${metaTone ? ` ${metaTone}` : ''}`}>{meta}</span>}
        {action}
      </div>
      {below}
      {open && canOpen && (
        <dl className="hub-details">
          {details.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
      )}
    </li>
  );
}

const hasTime = (e) => /\d{1,2}:\d{2}/.test(e.when_text || '');

/* call-prep PDF: private storage, opened through a 5-minute signed link.
   The tab opens on the tap itself (popup blockers), then gets the link. */
function PrepButton({ path }) {
  const [busy, setBusy] = useState(false);
  const open = async () => {
    const w = window.open('', '_blank');
    setBusy(true);
    const { data, error } = await supabase.storage.from('hub-prep').createSignedUrl(path, 300);
    setBusy(false);
    if (error || !data?.signedUrl) { w?.close(); alert('לא הצלחתי לפתוח את ההכנה. נסה שוב בעוד רגע'); return; }
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  };
  return <button type="button" className="hub-act" onClick={open} disabled={busy}>{busy ? 'פותח…' : 'הכנה'}</button>;
}

const Clock = ({ text = 'ממתין לסנכרון' }) => <span className="hub-pending" title="נשמר. ייכתב לקבצים במרכז כשהמחשב יסנכרן">⏳ {text}</span>;

/* a task line with "done" (circle before the text), "postpone" and "not relevant" (with a reason) */
function TaskRow({ t, c, meta, metaTone, details, extra, noClient, main, cat }) {
  const hub = useHub();
  const [panel, setPanel] = useState(null); // null | 'postpone' | 'drop' | 'reject'
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const p = c.pending.get(t.id);
  const short = cut(clean(t.title));
  /* whose turn: a verb when it's on Shmuel ("לאשר", "להעביר לשירה"), the agent when it's on the agency */
  const turn = whoseTurn(t);
  const chip = turn.who === 'agent'
    ? <span className="hub-agent" title={turn.then ? 'אחר כך מגיע אליך' : 'הסוכן שעובד על זה'}>{isStarted(t) ? '▶️' : '🤖'} {turn.agent}{turn.then ? ' ← אתה' : ''}</span>
    : turn.who === 'me' && turn.verb ? <span className="hub-verb">{turn.verb}</span>
    : turn.who === 'client' && t.waiting_on ? <span className="hub-wait">⧗ מחכה ל{cut(String(t.waiting_on).replace(/^ל/, ''), 22)}</span>
    : turn.who === 'client' ? <span className="hub-wait">⧗ מחכה</span> : null;
  const title = main || <>{chip}{shortTitle(t.title)}</>;
  details = [['המשימה המלאה', clean(t.title)], ...(details || [])];
  if (main) noClient = true;

  const postpone = async (iso) => {
    setPanel(null);
    await hub.act('task_postpone', t.id, { client_id: t.client_id, due: iso, label: short }, `נדחה ל-${fmtShortDate(iso)}`);
  };

  const drop = async (e) => {
    e.preventDefault();
    const why = reason.replace(/\s+/g, ' ').trim();
    if (!why) return;
    const ok = await hub.act('task_irrelevant', t.id, { client_id: t.client_id, label: short, reason: why.slice(0, 300) }, 'סומן לא רלוונטי');
    if (ok) { setPanel(null); setReason(''); }
  };

  /* 13.11: "לא מאשר" with the reasons, they go into the fix brief of the agent who made it */
  const reject = async (e) => {
    e.preventDefault();
    const why = reason.replace(/\s+/g, ' ').trim();
    if (!why) return;
    const ok = await hub.act('output_reject', t.id, { client_id: t.client_id, label: short, title: cut(clean(t.title), 300), reason: why.slice(0, 600) }, 'חזר לתיקון אצל הסוכן');
    if (ok) { setPanel(null); setReason(''); }
  };

  if (p) {
    const isDone = p.kind === 'task_done' || p.kind === 'task_irrelevant' || p.kind === 'output_approve';
    const text = p.kind === 'agent_start' ? "נשלח לסוכן, יתחיל תוך ~15 דק'"
      : p.kind === 'step_approve' ? 'אושר, ממתין לסנכרון'
      : p.kind === 'output_approve' ? 'אושר, השלב הבא נכנס לתור'
      : p.kind === 'output_reject' ? 'לא אושר, חוזר לתיקון'
      : p.kind === 'task_done' ? 'בוצע, ממתין לסנכרון'
      : p.kind === 'task_irrelevant' ? 'לא רלוונטי, ממתין לסנכרון'
      : `נדחה ל-${fmtShortDate(p.payload?.due)}`;
    return (
      <Row kb cat={cat} main={title} sub={noClient ? null : c.clientName(t.client_id)} pending={isDone ? 'done' : 'moved'}
        lead={<span className="hub-check" data-on={isDone || undefined} aria-hidden="true" />}
        meta={<Clock text={text} />}
        details={p.kind === 'task_irrelevant' ? [...(details || []), ['למה לא רלוונטי', p.payload?.reason]]
          : p.kind === 'output_reject' ? [...(details || []), ['למה לא אושר', p.payload?.reason]] : details} />
    );
  }

  const waitsOk = !!t.file?.k && /^🟡/.test(clean(t.status_note || ''));
  const escClose = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.closest('.hub-row')?.focus(); setPanel(null); } };

  const next = nextWorkday(c.today);
  const week = addDays(c.today, 7);
  return (
    <Row kb cat={cat} main={title} sub={noClient ? null : c.clientName(t.client_id)} meta={meta} metaTone={metaTone} details={details}
      lead={<button type="button" className="hub-check" data-k="x" aria-label={`סמן בוצע: ${short}`} title="בוצע (X)"
        onClick={() => hub.act('task_done', t.id, { client_id: t.client_id, label: short, title: cut(clean(t.title), 300) }, 'סומן בוצע')} />}
      action={<>
        {extra}
        {t.file?.k && <OpenFileBtn f={t.file} clientId={t.client_id} main={!waitsOk} />}
        {waitsOk && (<>
          <button type="button" className="hub-act hub-act-main" title="התוצר מאושר כמו שהוא, השלב הבא נכנס לתור"
            onClick={() => hub.act('output_approve', t.id, { client_id: t.client_id, label: short, title: cut(clean(t.title), 300) }, 'אושר, השלב הבא נכנס לתור')}>✓ מאשר</button>
          <button type="button" className="hub-act hub-act-no" aria-expanded={panel === 'reject'} title="חוזר לסוכן לתיקון עם הסיבות שלך"
            onClick={() => setPanel((o) => (o === 'reject' ? null : 'reject'))}>✗ לא מאשר</button>
        </>)}
        {isProposed(t) && (
          <button type="button" className="hub-act hub-act-main" title="לאשר את השלב והתאריך"
            onClick={() => hub.act('step_approve', t.id, { client_id: t.client_id, label: short }, 'השלב אושר')}>✓ אשר</button>
        )}
        {!isProposed(t) && turn.who === 'agent' && turn.agent !== 'אוטומטי' && !isStarted(t) && !t.file?.k && (
          <button type="button" className="hub-act hub-act-main" title="לשלוח לסוכן להתחיל לעבוד"
            onClick={() => hub.act('agent_start', t.id, { client_id: t.client_id, label: short, agent: turn.agent }, "נשלח לסוכן, יתחיל תוך ~15 דק'")}>▶ תתחיל</button>
        )}
        <span className="hub-more-acts">
        <button type="button" className="hub-act" data-k="d" aria-expanded={panel === 'postpone'} onClick={() => setPanel((o) => (o === 'postpone' ? null : 'postpone'))} title="דחה (D)">דחה</button>
        <button type="button" className="hub-act hub-act-quiet" data-k="n" aria-expanded={panel === 'drop'} onClick={() => setPanel((o) => (o === 'drop' ? null : 'drop'))} title="לא רלוונטי (N)">לא רלוונטי</button>
        </span>
      </>}
      below={panel === 'reject' ? (
        <form className="hub-postpone hub-drop hub-reject" onSubmit={reject} onKeyDown={escClose} aria-label="למה התוצר לא מאושר">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} autoFocus maxLength={600} rows={3}
            placeholder="מה לא טוב ומה לתקן? זה נכנס כמו שהוא לבריף של הסוכן" aria-label="סיבות" />
          <button type="submit" className="hub-act hub-act-main" disabled={!reason.trim()}>שלח לתיקון</button>
        </form>
      ) : panel === 'drop' ? (
        <form className="hub-postpone hub-drop" onSubmit={drop} onKeyDown={escClose} aria-label="למה המשימה לא רלוונטית">
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus maxLength={300}
            placeholder="למה זה כבר לא רלוונטי?" aria-label="סיבה" />
          <button type="submit" className="hub-act hub-act-main" disabled={!reason.trim()}>סמן לא רלוונטי</button>
        </form>
      ) : panel === 'postpone' && (
        <div className="hub-postpone" role="group" aria-label="לדחות ל" onKeyDown={escClose}>
          <button type="button" className="hub-act" autoFocus onClick={() => postpone(next)}>{next === addDays(c.today, 1) ? 'מחר' : 'ראשון'} · {fmtShortDate(next)}</button>
          <button type="button" className="hub-act" onClick={() => postpone(week)}>עוד שבוע · {fmtShortDate(week)}</button>
          <form className="hub-postpone-date" onSubmit={(e) => { e.preventDefault(); if (date) postpone(date); }}>
            <input type="date" value={date} min={addDays(c.today, 1)} onChange={(e) => setDate(e.target.value)} aria-label="תאריך אחר" />
            <button type="submit" className="hub-act" disabled={!date}>דחה</button>
          </form>
        </div>
      )} />
  );
}

const cut = (s, n = 60) => (s && s.length > n ? `${s.slice(0, n - 1)}…` : s);

/* J/K move between rows, X done, D postpone, Enter opens details.
   Inside an open drawer only the drawer's rows count. Physical keys (e.code),
   so it works with the Hebrew keyboard layout too. */
function useRowKeys() {
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      const scope = document.querySelector('.hub-drawer') || document.querySelector('.adm-content');
      if (!scope) return;
      const rows = [...scope.querySelectorAll('.hub-row[data-kb]')].filter((r) => r.offsetParent !== null); // not inside a closed fold or a hidden tab
      if (!rows.length) return;
      const cur = document.activeElement?.closest?.('.hub-row[data-kb]');
      const i = rows.indexOf(cur);
      const go = (n) => { const r = rows[Math.max(0, Math.min(rows.length - 1, n))]; r.focus(); r.scrollIntoView({ block: 'nearest' }); };
      if (e.code === 'KeyJ') { e.preventDefault(); go(i < 0 ? 0 : i + 1); }
      else if (e.code === 'KeyK') { e.preventDefault(); go(i < 0 ? 0 : i - 1); }
      else if ((e.code === 'KeyX' || e.code === 'KeyD' || e.code === 'KeyN') && cur) {
        const b = cur.querySelector(`[data-k="${e.code.slice(3).toLowerCase()}"]`);
        if (b && !b.disabled) { e.preventDefault(); b.click(); if (e.code === 'KeyX') requestAnimationFrame(() => cur.focus()); }
      } else if (e.key === 'Enter' && e.target === cur) {
        const b = cur.querySelector('button.hub-row-btn'); if (b) { e.preventDefault(); b.click(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}

function WaButton({ phone, label = 'וואטסאפ' }) {
  const href = waLink(phone);
  if (!href) return null;
  return <a className="hub-act" href={href} target="_blank" rel="noopener noreferrer">{label}</a>;
}

/* ─── computations ─── */
function useComputed() {
  const hub = useHub();
  const now = hub?.now;
  const today = isoDay(new Date(now));
  return useMemo(() => {
    const d = hub?.data;
    if (!d) return null;
    const clients = new Map(d.hub_clients.map((c) => [c.id, c]));
    const clientName = (id) => {
      if (!id) return null;
      const c = clients.get(id);
      return (c?.name || id.split(' - ')[0]).replace(/\s*\(.*\)\s*$/, '');
    };
    const quiet = (t) => QUIET_STAGES.test(clients.get(t.client_id)?.stage || '');
    /* 23.11 (Shmuel): paying clients' work comes before leads and follow-ups.
       0 = active client, 1 = lead / pipeline, 2 = Shift Up's own work (no client) */
    const rank = (id) => { const st = clients.get(id)?.stage; return st === 'שוטף' ? 0 : id && st ? 1 : 2; };
    const byRank = (key) => (a, b) => rank(a.client_id) - rank(b.client_id) || String(key(a) || '9999').localeCompare(String(key(b) || '9999'));
    const openAll = d.hub_tasks.filter((t) => isOpen(t) && !quiet(t));
    const proposed = openAll.filter(isProposed).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const open = openAll.filter((t) => !isProposed(t));
    /* 10.11: a file an agent prepared that waits for Shmuel's OK (📄 in the status cell) */
    const approvals = open.filter((t) => t.file?.k).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const mine = open.filter(isMine);
    const agents = open.filter(isAgents).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const soonMine = mine.filter((t) => t.due && goalOf(t) > today && goalOf(t) <= addDays(today, 7)).sort(byRank((t) => t.due));
    const noDateMine = mine.filter((t) => !t.due);

    const calls = d.hub_events.filter((e) => e.starts_at && isoDay(new Date(e.starts_at)) === today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const timed = calls.filter(hasTime); // "about to start" only for an item with a real hour, not the 09:00 placeholder
    const replies = d.hub_inbox.filter((x) => x.kind === 'reply').sort((a, b) => rank(a.client_id) - rank(b.client_id) || b.priority - a.priority || String(a.last_message_at).localeCompare(String(b.last_message_at)));
    const reach = d.hub_inbox.filter((x) => x.kind === 'reach_out').sort((a, b) => b.priority - a.priority).slice(0, 5);
    const dueAll = mine.filter((t) => t.due && goalOf(t) <= today).sort(byRank((t) => t.due)); // clients first, then by deadline
    /* a task due today for a client who is on today's calendar belongs to that calendar row,
       so it shows once (with the time) and can still be marked done or postponed there */
    const linked = new Map();
    calls.forEach((e) => {
      if (!e.client_id) return;
      const t = dueAll.find((x) => x.due === today && x.client_id === e.client_id && ![...linked.values()].includes(x));
      if (t) linked.set(e.id, t);
    });
    const linkedIds = new Set([...linked.values()].map((t) => t.id));
    const due = dueAll.filter((t) => !linkedIds.has(t.id));
    const collect = d.hub_collect.filter((x) => x.status === 'open').sort((a, b) => String(a.since).localeCompare(String(b.since)));
    /* a payment already listed under "money to collect" isn't repeated under "waiting for client" */
    const payClients = new Set(collect.map((x) => x.client_id).filter(Boolean));
    const waiting = open.filter((t) => isClientSide(t) && t.since && t.since <= addDays(today, -3))
      .filter((t) => !(payClients.has(t.client_id) && /תשלום|דרישה|מקדמה/.test(t.title || '')))
      .sort((a, b) => a.since.localeCompare(b.since));
    const stuck = mine.filter((t) => t.since && !due.includes(t)).sort((a, b) => a.since.localeCompare(b.since))[0] || null;
    const goal = d.hub_goals.find((g) => g.key === 'active_clients') || null;
    const week = ['week_calls', 'week_proposals', 'week_closes'].map((k) => d.hub_goals.find((g) => g.key === k)).filter(Boolean);
    const replyMin = d.hub_goals.find((g) => g.key === 'week_reply_min') || null;
    /* the next 7 days after today, the old dashboard's "upcoming meetings" */
    const upcoming = d.hub_events.filter((e) => { if (!e.starts_at) return false; const day = isoDay(new Date(e.starts_at)); return day > today && day <= addDays(today, 7); })
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

    /* queued actions: pending ones overlay their row, failed ones are listed on top */
    const acts = d.hub_actions || [];
    /* 10.11: a "done" that was already written to the file keeps hiding its row until the
       mirror catches up, so a slow sync never brings a finished task back (it was clicked 4 times) */
    const closedTaskIds = new Set(d.hub_tasks.filter((t) => !isOpen(t)).map((t) => t.id));
    /* 12.11: a row that came back to "open" in the file after the click (marked by mistake and restored)
       must show again. The mirror is rewritten on every sync, so an open row synced more than a minute
       after the action was applied is the file's real state, not a slow sync */
    const openSyncedAt = new Map(d.hub_tasks.filter(isOpen).map((t) => [t.id, new Date(t.synced_at || 0).getTime()]));
    const reopened = (a) => openSyncedAt.has(a.target_id) && a.applied_at
      && openSyncedAt.get(a.target_id) > new Date(a.applied_at).getTime() + 60000;
    /* 13.11: "החזר לאישור" clicked after the action = the action no longer hides the row */
    const reopenAt = new Map(acts.filter((a) => a.kind === 'task_reopen' && a.status !== 'cancelled' && a.status !== 'failed')
      .map((a) => [a.target_id, new Date(a.created_at).getTime()]));
    const undone = (a) => (reopenAt.get(a.target_id) || 0) > new Date(a.created_at).getTime();
    /* approve/reject keep the row's place until the mirror shows the file after the write */
    const stale = (a) => !a.applied_at || openSyncedAt.get(a.target_id) <= new Date(a.applied_at).getTime();
    const pending = new Map(acts.filter((a) => a.target_id && a.kind !== 'task_reopen' && (a.status === 'pending'
      || (a.status === 'applied' && (a.kind === 'task_done' || a.kind === 'task_irrelevant') && !closedTaskIds.has(a.target_id)
        && !reopened(a) && !undone(a) && now - new Date(a.created_at).getTime() < 86400000)
      || (a.status === 'applied' && (a.kind === 'output_approve' || a.kind === 'output_reject') && openSyncedAt.has(a.target_id) && stale(a)
        && now - new Date(a.created_at).getTime() < 3600000))).map((a) => [a.target_id, a]));
    /* 23.11: a task that was just closed or postponed leaves today's list at once (it moves to "closed today"),
       and the next task becomes "the one thing". "Undo" on the toast brings it back */
    const GONE = ['task_done', 'task_irrelevant', 'output_approve', 'task_postpone'];
    const gone = (t) => GONE.includes(pending.get(t.id)?.kind);
    const dueLive = due.filter((t) => !gone(t));

    /* "the one thing": a call about to start beats everything, then the oldest
       overdue task, then a client/lead waiting for an answer, then today's calls */
    const soonCall = timed.find((e) => { const t = new Date(e.starts_at).getTime(); return t > now - 30 * 60000 && t < now + 90 * 60000; });
    const nextCall = timed.find((e) => new Date(e.starts_at).getTime() > now);
    const hotReply = replies.find((r) => r.priority >= 3);
    const clientReply = replies.find((r) => rank(r.client_id) === 0);
    let one = null;
    const callOne = (e) => ({ text: clean(e.title), why: `ביומן ב-${fmtTime(e.starts_at)}`, phone: clients.get(e.client_id)?.phone, prep: e.prep_pdf, clientId: e.client_id });
    const taskOne = (t) => {
      const dm = deadlineMeta(t, today);
      return { text: clean(t.title), why: [clientName(t.client_id), dm.meta].filter(Boolean).join(' · '), late: dm.metaTone === 'late', task: t, clientId: t.client_id };
    };
    const replyOne = (r, name) => ({ text: `לענות ל${name}`, why: previewText(r.preview), phone: r.phone, clientId: r.client_id, replyId: r.id });
    if (soonCall) one = callOne(soonCall);
    else if (dueLive[0] && rank(dueLive[0].client_id) === 0) one = taskOne(dueLive[0]);
    else if (clientReply) one = replyOne(clientReply, clientName(clientReply.client_id));
    else if (dueLive[0]) one = taskOne(dueLive[0]);
    else if (hotReply) one = replyOne(hotReply, clientName(hotReply.client_id) || fmtPhone(hotReply.contact_name));
    else if (nextCall) one = callOne(nextCall);
    else if (replies[0]) one = replyOne(replies[0], fmtPhone(replies[0].contact_name));

    /* 13.11 (B1): what Shmuel approved or marked done in the last 24h, with "החזר לאישור" (12.11: "אישרתי בטעות") */
    const recentOk = [];
    const seenOk = new Set();
    [...acts].reverse().forEach((a) => {
      if (seenOk.has(a.target_id) || a.status !== 'applied' || !(a.kind === 'task_done' || a.kind === 'output_approve')) return;
      if (now - new Date(a.created_at).getTime() >= 86400000 || undone(a)) return;
      seenOk.add(a.target_id);
      recentOk.push(a);
    });
    const reopening = new Map(acts.filter((a) => a.kind === 'task_reopen' && a.status === 'pending').map((a) => [a.target_id, a]));
    const added = acts.filter((a) => a.status === 'pending' && a.kind === 'task_add');
    const failed = acts.filter((a) => a.status === 'failed' && now - new Date(a.created_at).getTime() < 2 * 86400000);

    /* ─── 23.11: "closed today" ───
       Two sources, merged: what was marked on this screen today (hub_actions, with the hour), and what the
       files say was finished today (the "בוצע" list of משימות_תיק with today's date, no hour). A line that
       appears in both counts once. "נפתח תיק" is a note, not a task. */
    const catFor = (clientId, title) => (title && MONEY_RE.test(title) ? 'money' : ['client', 'lead', 'internal'][rank(clientId)]);
    const doneToday = [];
    const seenDone = new Set();
    [...acts].reverse().forEach((a) => {
      if (!['task_done', 'output_approve', 'payment_received'].includes(a.kind) || !(a.status === 'pending' || a.status === 'applied')) return;
      if (isoDay(new Date(a.created_at)) !== today || undone(a) || seenDone.has(a.target_id)) return;
      seenDone.add(a.target_id);
      const title = a.payload?.title || a.payload?.label || '';
      doneToday.push({ k: a.id, cat: a.kind === 'payment_received' ? 'money' : catFor(a.payload?.client_id, title), text: doneText(a.payload?.label || title) || 'משימה',
        key: doneText(title).slice(0, 28), at: a.created_at, clientId: a.payload?.client_id, action: a, wait: a.status === 'pending' });
    });
    const fromScreen = doneToday.map((x) => [x.clientId, x.key]);
    const notNote = (t) => !/^נפתח תיק/.test(doneText(t.title));
    d.hub_tasks.filter((t) => t.status === 'done' && t.done_at === today && notNote(t)).forEach((t) => {
      const text = doneText(t.title);
      if (fromScreen.some(([cid, k]) => cid === t.client_id && k && text.startsWith(k))) return;
      doneToday.push({ k: t.id, cat: catFor(t.client_id, t.title), text, at: null, clientId: t.client_id });
    });
    d.hub_collect.filter((x) => x.status === 'paid' && x.paid_at === today).forEach((x) => {
      if (doneToday.some((y) => y.action?.kind === 'payment_received' && y.clientId === x.client_id)) return;
      doneToday.push({ k: x.id, cat: 'money', text: `נכנס: ${x.who}`, at: null, clientId: null });
    });
    doneToday.sort((a, b) => (a.at && b.at ? b.at.localeCompare(a.at) : a.at ? -1 : b.at ? 1 : 0)); // newest first, lines without an hour after them
    const weekStart = addDays(today, -weekday(today)); // the week runs from Sunday
    const weekDone = d.hub_tasks.filter((t) => t.status === 'done' && t.done_at && t.done_at >= weekStart && t.done_at < today && notNote(t)).length + doneToday.length;
    const leftToday = dueAll.filter((t) => !gone(t)).length + replies.length; // replies are on today's list too, so "X מתוך Y" never reads full while work is open
    const nextDay = nextWorkday(today);
    const tomorrowN = mine.filter((t) => t.due && goalOf(t) > today && goalOf(t) <= nextDay).length;
    const nextEvent = d.hub_events.filter((e) => e.starts_at && (hasTime(e) ? new Date(e.starts_at).getTime() > now : isoDay(new Date(e.starts_at)) > today))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0] || null;

    /* ─── 23.11: every person's next step date, last contact and silence ───
       The next step has a date when a date is written in "הפעולה הבאה", a meeting is on the calendar,
       or an open task of this person has a due date. A lead (חי / כדור אצלם) is flagged when:
       they wrote and nobody answered for 3 days, or 3 days of silence with no future dated step, or no dated step at all. */
    const dueByClient = new Map();
    d.hub_tasks.forEach((t) => { if (t.client_id && t.due && isOpen(t)) dueByClient.set(t.client_id, [...(dueByClient.get(t.client_id) || []), t.due]); });
    const crm = new Map();
    for (const cl of d.hub_clients) {
      const cands = [...datesIn(cl.next_action, today), ...(dueByClient.get(cl.id) || [])];
      if (cl.next_meeting_at) cands.push(isoDay(new Date(cl.next_meeting_at)));
      cands.sort();
      const nd = cands.find((x) => x >= today) || cands.at(-1) || null;
      const lc = lastContact(cl, now);
      const lastDay = lc ? isoDay(new Date(lc.at)) : cl.file_updated || null;
      const silentDays = lastDay ? Math.max(0, daysBetween(lastDay, today)) : null;
      let alert = null;
      if (LEAD_STAGES.includes(cl.stage)) {
        const dated = nd && nd >= today;
        if (lc?.theirs && silentDays >= 3) alert = `כתב ומחכה ${daysWord(silentDays)}`;
        else if (silentDays >= 3 && !dated) alert = nd ? `עבר המועד, שותק ${daysWord(silentDays)}` : `שותק ${daysWord(silentDays)}, אין צעד עם תאריך`;
        else if (!nd) alert = 'אין צעד עם תאריך';
      }
      crm.set(cl.id, { nd, lc, silentDays, alert });
    }
    /* the fold on the home screen: flagged leads that are not already in "to answer", then the bridge's own "reach out" picks */
    const replyClients = new Set(replies.map((r) => r.client_id).filter(Boolean));
    const silent = d.hub_clients.filter((cl) => crm.get(cl.id).alert && !replyClients.has(cl.id))
      .sort((a, b) => (crm.get(b.id).silentDays ?? -1) - (crm.get(a.id).silentDays ?? -1));
    const silentIds = new Set(silent.map((cl) => cl.id));
    const reachMore = reach.filter((r) => !r.client_id || !silentIds.has(r.client_id));

    return { now, today, clients, clientName, rank, calls, linked, replies, reach, due, dueAll, proposed, approvals, waiting, collect, collectAll: d.hub_collect, stuck, goal, week, replyMin, upcoming, one, agents, soonMine, noDateMine, tasks: d.hub_tasks, events: d.hub_events, pending, added, failed, recentOk, reopening,
      gone, catFor, doneToday, weekDone, leftToday, nextDay, tomorrowN, nextEvent, crm, silent, reachMore };
  }, [hub?.data, today, now]);
}

/* ─── Today: tiles first, a queue only after a tap (10.11) ───
   Shmuel: "תור רק אחרי לחיצה אבל קודם כרטיסים". The home screen fits one screen:
   the one thing, then a card per kind of work with its number. A card opens its queue
   (?q=key, so Back returns to the cards). Keys: 1-9 open a card, Esc goes back. */
const TILE_KEYS = ['late', 'today', 'steps', 'mine', 'reply', 'calls', 'money', 'waiting', 'reach', 'agents', 'leads', 'clients'];

function buildTiles(c, newLeads, activeCount, pipeCount) {
  if (!c) return [];
  const lateMine = c.dueAll.filter((t) => goalOf(t) < c.today).length;
  const reallyLate = c.dueAll.filter((t) => t.due < c.today).length;
  const todayMine = c.dueAll.length - lateMine;
  const nextCall = c.calls.find((e) => hasTime(e) && new Date(e.starts_at).getTime() > c.now);
  const oldReply = c.replies.some((r) => (c.now - new Date(r.last_message_at).getTime()) > 86400000);
  const oldest = c.replies.reduce((a, r) => (!a || String(r.last_message_at) < String(a) ? r.last_message_at : a), null);
  const moneySum = c.collect.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const oldMoney = c.collect.some((x) => daysBetween(x.since, c.today) > 14);
  const agentsForMe = c.agents.filter((t) => whoseTurn(t).then).length;
  return [
    /* 10.11 (Pally, P6): four big cards on top, the rest small */
    { key: 'late', size: 'big', label: 'עבר היעד', n: lateMine, tone: lateMine ? 'late' : null,
      sub: !lateMine ? 'הכל בזמן' : reallyLate ? `${reallyLate} עברו את הדדליין` : 'עברו את היעד, הדדליין עוד לא' },
    { key: 'today', size: 'big', label: 'לסיים היום', n: todayMine, tone: todayMine ? 'now' : null,
      sub: c.calls.length ? `ועוד ${c.calls.length === 1 ? 'שיחה אחת' : `${c.calls.length} שיחות`} ביומן` : c.soonMine.length ? `עוד ${c.soonMine.length} השבוע` : 'יום פנוי' },
    { key: 'reply', size: 'big', label: 'לענות', n: c.replies.length, tone: oldReply ? 'late' : c.replies.length ? 'now' : null,
      sub: oldest ? `הכי ותיקה ${ago(oldest, c.now)}` : 'אף אחד לא מחכה' },
    { key: 'money', size: 'big', label: 'כסף לגבות', n: c.collect.length, big: c.collect.length ? money(moneySum) : '0', tone: oldMoney ? 'late' : c.collect.length ? 'now' : null,
      sub: c.collect.length ? `${c.collect.length} פתוחים` : 'הכל נכנס' },
    { key: 'calls', label: 'שיחות היום', n: c.calls.length, tone: c.calls.length ? 'now' : null,
      sub: nextCall ? `הבאה ב-${fmtTime(nextCall.starts_at)}` : c.upcoming.length ? `עוד ${c.upcoming.length} השבוע` : 'יומן פנוי' },
    { key: 'steps', label: 'לאשר', n: c.approvals.length + c.proposed.length, tone: c.approvals.length + c.proposed.length ? 'now' : null,
      sub: c.approvals.length ? `${c.approvals.length} קבצים מהסוכנים` : c.proposed.length ? 'שלבים של משימה גדולה' : 'אין מה לאשר' },
    { key: 'waiting', label: 'מחכה ללקוח', n: c.waiting.length, tone: c.waiting.length ? 'quiet' : null,
      sub: c.waiting.length ? `הכי ותיקה ${daysWord(daysBetween(c.waiting[0].since, c.today))}` : 'אף אחד לא תקוע' },
    { key: 'reach', label: 'לפנות', n: c.reach.length, tone: c.reach.length ? 'quiet' : null, sub: c.reach.length ? 'שתקו אחרי ההודעה שלך' : 'אין למי' },
    { key: 'agents', label: 'אצל הסוכנים', n: c.agents.length, tone: c.agents.length ? 'quiet' : null,
      sub: agentsForMe ? `${agentsForMe} יחזרו אליך לאישור` : 'לא עליך' },
    { key: 'leads', label: 'לידים מהאתר', n: newLeads, tone: newLeads ? 'now' : null, sub: newLeads ? 'חדשים, לא טופלו' : 'אין חדשים' },
    { key: 'clients', label: 'לקוחות', n: activeCount, tone: 'quiet', sub: `פעילים · ${pipeCount} בצנרת` },
  ];
}

function Tile({ t, i, onOpen }) {
  return (
    <li>
      <button type="button" className="hub-tile" data-tone={t.n ? t.tone || undefined : 'zero'} onClick={() => onOpen(t.key)}
        aria-label={`${t.label}: ${t.big || t.n}. ${t.sub}`} title={`${t.label} (מקש ${i + 1})`}>
        <span className="hub-tile-label">{t.label}</span>
        <span className="hub-tile-n">{t.big || t.n}</span>
        <span className="hub-tile-sub">{t.sub}</span>
      </button>
    </li>
  );
}

/* ─── 23.11: home screen v2 (approved sketch A2) ───
   Top to bottom: what was closed today (a number and a bar), the one thing, up to 4 more for today,
   closed today, and everything else folded with a count. On a wide screen "closed today" is a side column.
   The cards and the queues (?q=key) are still here, inside the last fold. */
function todayItems(c) {
  const oneId = c.one?.task?.id;
  const out = [];
  for (const rk of [0, 1, 2]) { // clients, then leads and follow-ups, then Shift Up's own work
    c.dueAll.filter((t) => t.id !== oneId && c.rank(t.client_id) === rk && !c.gone(t)).forEach((t) => out.push({ k: t.id, t }));
    c.replies.filter((r) => r.id !== c.one?.replyId && c.rank(r.client_id) === rk).forEach((r) => out.push({ k: r.id, r }));
  }
  return out;
}
const fmtWhen = (e, today) => {
  const day = isoDay(new Date(e.starts_at));
  const t = hasTime(e) ? fmtTime(e.starts_at) : '';
  return day === today ? (t || 'היום') : `${fmtStep(day, today)} ${t}`.trim();
};

export function TodayView({ newLeads = 0, onGo }) {
  const hub = useHub();
  const c = useComputed();
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState(null);
  const [more, setMore] = useState(false);
  const q = TILE_KEYS.includes(params.get('q')) ? params.get('q') : null;
  useRowKeys();

  const clientsAll = hub.data?.hub_clients || [];
  const activeCount = clientsAll.filter((x) => x.stage === 'שוטף').length;
  const pipeCount = clientsAll.filter((x) => x.stage !== 'שוטף' && !QUIET_STAGES.test(x.stage || '')).length;
  const tiles = buildTiles(c, newLeads, activeCount, pipeCount);

  const openQ = useCallback((key) => {
    if (key === 'leads' || key === 'clients') { onGo?.(key); return; }
    const p = new URLSearchParams(params); p.set('q', key);
    setParams(p); // a real history step, so the phone's Back returns to the home screen
    window.scrollTo(0, 0);
  }, [params, setParams, onGo]);
  const home = useCallback(() => { const p = new URLSearchParams(params); p.delete('q'); setParams(p); }, [params, setParams]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.querySelector('.hub-drawer')) return;
      if (e.key === 'Escape' && q) { e.preventDefault(); home(); return; }
      const d = /^Digit([1-9])$/.exec(e.code);
      if (d && tiles[+d[1] - 1]) { e.preventDefault(); openQ(tiles[+d[1] - 1].key); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [q, tiles, openQ, home]);

  if (hub.loading) return <div className="hub-skel" style={{ height: 22, width: '70%', marginTop: 18 }} aria-label="טוען" />;
  if (hub.error || !c) return <p className="hub-err">לא הצלחתי לטעון את הנתונים. בדוק חיבור ונסה לרענן.</p>;
  if (!clientsAll.length) {
    return <p className="hub-empty" style={{ paddingTop: 18 }}>אין עדיין נתונים במסך. ברגע שסוכן הסנכרון יעלה מהמחשב, כאן יופיע הדבר הכי דחוף להיום.</p>;
  }

  if (q) {
    const t = tiles.find((x) => x.key === q);
    return (
      <>
        <div className="hub-q-head">
          <button type="button" className="hub-back" onClick={home}>→ מסך הבית</button>
          <h2>{t.label} <span className="n">{t.big || t.n}</span></h2>
        </div>
        <nav className="hub-q-chips" aria-label="מעבר בין התורים">
          {tiles.filter((x) => x.key !== 'leads' && x.key !== 'clients').map((x) => (
            <button key={x.key} type="button" aria-current={x.key === q ? 'page' : undefined} data-tone={x.n ? x.tone || undefined : 'zero'}
              onClick={() => { if (x.key !== q) openQ(x.key); }}>{x.label} <b>{x.n}</b></button>
          ))}
        </nav>
        <Queue q={q} c={c} />
        <p className="hub-keys">מקשים: <kbd>Esc</kbd> חזרה למסך הבית · <kbd>J</kbd> <kbd>K</kbd> לזוז · <kbd>X</kbd> בוצע · <kbd>D</kbd> דחה · <kbd>N</kbd> לא רלוונטי · <kbd>Enter</kbd> פרטים</p>
      </>
    );
  }

  const items = todayItems(c);
  const closed = !c.one && !items.length;
  const shown = more ? items : items.slice(0, 4);
  const current = clientsAll.find((x) => x.id === openId) || null;
  const moneySum = c.collect.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const toApprove = c.approvals.length + c.proposed.length;
  const weekCal = c.calls.length + c.upcoming.length;
  const ne = c.nextEvent;

  return (
    <div className="h2">
      <Progress c={c} />
      {c.failed.length ? <FailedNotice failed={c.failed} /> : null}
      {closed ? <ClosedDay c={c} /> : <OneThing c={c} onCard={setOpenId} />}
      <div className="h2-grid">
        <section className="h2-todo" aria-labelledby="s-today">
          <h2 id="s-today">{items.length ? <>עוד היום <span className="n">{items.length}</span></> : 'עוד היום'}</h2>
          {ne && (
            <p className="h2-nextcal">
              <span className="hub-time">{fmtWhen(ne, c.today)}</span>
              <span className="t">הבא ביומן: {clean(ne.title)}</span>
              {ne.prep_pdf && <PrepButton path={ne.prep_pdf} />}
            </p>
          )}
          {items.length ? (
            <ul className="hub-rows h2-rows">
              {shown.map(({ k, t, r }) => {
                if (r) {
                  const preview = previewText(r.preview);
                  return (
                    <Row key={k} cat={r.client_id ? c.catFor(r.client_id) : 'lead'} main={<><span className="hub-verb">לענות</span><b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b></>} sub={cut(clean(preview), 60)}
                      meta={ago(r.last_message_at, c.now)} metaTone={(c.now - new Date(r.last_message_at).getTime()) > 86400000 ? 'late' : undefined}
                      action={<WaButton phone={r.phone} label="לענות" />}
                      details={[['הודעה אחרונה', preview]]} />
                  );
                }
                return (
                  <TaskRow key={k} t={t} c={c} cat={c.catFor(t.client_id, t.title)} {...deadlineMeta(t, c.today)}
                    details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note]]} />
                );
              })}
            </ul>
          ) : <p className="hub-empty">{closed ? 'אין עוד משימות להיום' : 'זה הדבר היחיד שנשאר להיום'}</p>}
          {items.length > 4 && (
            <button type="button" className="h2-more" aria-expanded={more} onClick={() => setMore((m) => !m)}>
              {more ? 'הצג רק 4' : `+${items.length - 4} עוד להיום`}
            </button>
          )}
        </section>

        <DoneToday c={c} />

        <div className="h2-folds">
          {toApprove > 0 && (
            <Fold title="מחכה לאישור שלך" n={toApprove}>
              <Queue q="steps" c={c} />
            </Fold>
          )}
          <Fold title="השבוע ביומן" n={weekCal} cat="client">
            <Queue q="calls" c={c} />
          </Fold>
          <Fold title="מחכה לאחרים" n={c.waiting.length + c.agents.length} cat="wait">
            <Group title="מחכה ללקוח או לליד" empty="אף אחד לא תקוע יותר מ-3 ימים">
              {c.waiting.map((t) => {
                const n = daysBetween(t.since, c.today);
                return (
                  <TaskRow key={t.id} t={t} c={c} cat={c.catFor(t.client_id, t.title)} meta={daysWord(n)} metaTone={n > 10 ? 'late' : undefined}
                    extra={<WaButton phone={c.clients.get(t.client_id)?.phone} label="תזכורת" />}
                    details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note], ['פתוחה מאז', fmtShortDate(t.since)]]} />
                );
              })}
            </Group>
            {c.agents.length > 0 && <Queue q="agents" c={c} />}
          </Fold>
          <Fold title="שותקים בלי צעד עם תאריך" n={c.silent.length + c.reachMore.length} cat="lead">
            <SilentList c={c} onCard={setOpenId} />
          </Fold>
          <Fold title="כסף פתוח" n={c.collect.length} cat="money" extra={moneySum ? money(moneySum) : null}>
            <Queue q="money" c={c} />
          </Fold>
          {/* everything that was on the old home screen: the cards (each opens its queue), the goal and the week's numbers */}
          <Fold title="כל התורים והמספרים" n={tiles.filter((t) => t.n).length}>
            <ul className="hub-tiles" aria-label="הכי דחוף">
              {tiles.filter((t) => t.size === 'big').map((t) => <Tile key={t.key} t={t} i={tiles.indexOf(t)} onOpen={openQ} />)}
            </ul>
            <ul className="hub-tiles hub-tiles-small" aria-label="עוד">
              {tiles.filter((t) => t.size !== 'big').map((t) => <Tile key={t.key} t={t} i={tiles.indexOf(t)} onOpen={openQ} />)}
            </ul>
            <div className="hub-stats">
              {c.goal?.target ? <GoalStrip goal={c.goal} /> : null}
              {c.week.length ? <WeekNumbers week={c.week} replyMin={c.replyMin} /> : null}
            </div>
            <p className="hub-keys">מקשים: <kbd>1</kbd>-<kbd>9</kbd> פותחים תור · <kbd>J</kbd> <kbd>K</kbd> לזוז · <kbd>X</kbd> בוצע · <kbd>D</kbd> דחה</p>
          </Fold>
        </div>
      </div>
      {current && <ClientDrawer cl={current} c={c} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* quiet progress: a number, a bar where every closed piece has the color of its kind, and the week. No streaks */
function Progress({ c }) {
  const n = c.doneToday.length;
  const total = n + c.leftToday;
  const order = [...c.doneToday].reverse(); // in the order they were closed
  return (
    <div className="h2-prog">
      <div className="h2-prog-n">
        <b>{n}</b><span> מתוך {total} היום</span>
        <span className="wk">השבוע: {c.weekDone} נסגרו</span>
      </div>
      <div className="h2-bar" data-dense={total > 24 || undefined} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={n}
        aria-label={`${n} מתוך ${total} נסגרו היום`}>
        {Array.from({ length: Math.max(total, 1) }, (_, i) => <span key={i} className="seg" data-c={i < n ? order[i].cat : undefined} />)}
      </div>
      <div className="h2-legend" aria-label="מקרא צבעים">
        {CAT_KEYS.map((k) => <CatTag key={k} cat={k} />)}
        <span className="hub-wait">⧗ מחכה</span>
      </div>
    </div>
  );
}

function OneThing({ c, onCard }) {
  const hub = useHub();
  const one = c.one;
  const turn = one?.task ? whoseTurn(one.task) : null;
  const cat = !one ? null : one.replyId && !one.clientId ? 'lead' : c.catFor(one.clientId, one.task?.title); // an unknown number that wrote = a lead
  const hasCard = one?.clientId && c.clients.has(one.clientId);
  return (
    <div className="hub-one" data-c={cat || undefined}>
      <div className="hub-one-label">{cat && <CatTag cat={cat} />}<span>הדבר האחד עכשיו</span></div>
      {one ? (
        <>
          <p className="hub-one-text">{one.task ? <>{turn?.verb && <span className="hub-verb">{turn.verb}</span>}{shortTitle(one.task.title)}</> : one.text}</p>
          <div className="hub-one-why">
            <span className={one.late ? 'late' : undefined}>{one.why}</span>
            {one.task && (c.pending.get(one.task.id)
              ? <Clock />
              : <button type="button" className="hub-act hub-act-main" onClick={() => hub.act('task_done', one.task.id, { client_id: one.task.client_id, label: cut(clean(one.task.title)), title: cut(clean(one.task.title), 300) }, 'סומן בוצע')}>בוצע</button>)}
            <WaButton phone={one.phone} label="פתח בוואטסאפ" />
            {hasCard && <button type="button" className="hub-act" aria-haspopup="dialog" onClick={() => onCard?.(one.clientId)}>פתח כרטיס</button>}
            {one.prep && <PrepButton path={one.prep} />}
          </div>
        </>
      ) : <p className="hub-one-text" data-empty="true">אין שום דבר דחוף. זמן טוב לקדם לקוח רביעי.</p>}
    </div>
  );
}

/* today's list is empty: one calm block, facts only */
function ClosedDay({ c }) {
  const n = c.doneToday.length;
  const facts = CAT_KEYS.map((k) => { const m = c.doneToday.filter((d) => d.cat === k).length; return m ? `${m} ${CAT[k].label}` : null; }).filter(Boolean).join(' · ');
  const dayLabel = c.nextDay === addDays(c.today, 1) ? 'מחר' : `ביום ${HE_DAYS[weekday(c.nextDay)]}`;
  const tasks = c.tomorrowN === 1 ? 'משימה אחת' : `${c.tomorrowN} משימות`;
  return (
    <div className="h2-closed" role="status">
      <p className="h2-closed-t">{n ? `היום סגור. ${n} מתוך ${n}.` : 'היום סגור. אין משימות פתוחות להיום.'}</p>
      {facts && <p className="h2-closed-sub">{facts}</p>}
      <p className="h2-closed-sub">{dayLabel}: {tasks}{c.nextEvent ? ` · ${fmtWhen(c.nextEvent, c.today)} ${clean(c.nextEvent.title)}` : ''}</p>
    </div>
  );
}

/* always on screen: the last things closed today, the tick in the color of the kind */
function DoneToday({ c }) {
  const hub = useHub();
  const [all, setAll] = useState(false);
  const n = c.doneToday.length;
  const list = all ? c.doneToday : c.doneToday.slice(0, 6);
  return (
    <section className="h2-done" aria-labelledby="s-done">
      <h2 id="s-done">נסגר היום <span className="n">{n}</span></h2>
      {n ? (
        <ul className="h2-dn-list">
          {list.map((d) => {
            const a = d.action;
            const back = a && c.reopening.get(a.target_id);
            const canUndo = a && a.status === 'applied' && a.kind !== 'payment_received' && !back;
            const who = c.clientName(d.clientId);
            return (
              <li key={d.k} className="h2-dn" data-c={d.cat}>
                <span className="tick" aria-hidden="true">✓</span>
                <span className="t" title={d.text}>{shortTitle(d.text)}{who && <span className="who"> · {who}</span>}</span>
                <CatTag cat={d.cat} bare />
                <span className="meta">{back ? '↩' : d.wait ? '⏳' : d.at ? fmtTime(d.at) : ''}</span>
                {canUndo && (
                  <button type="button" className="h2-undo" title="סימנת בטעות? המשימה חוזרת לרשימה" aria-label={`החזר לרשימה: ${d.text}`}
                    onClick={() => hub.act('task_reopen', a.target_id, { client_id: a.payload?.client_id, label: a.payload?.label, title: a.payload?.title || a.payload?.label }, 'חוזר לרשימה')}>↩</button>
                )}
              </li>
            );
          })}
        </ul>
      ) : <p className="hub-empty">עוד לא נסגר כלום היום</p>}
      {n > 6 && <button type="button" className="h2-more" aria-expanded={all} onClick={() => setAll((x) => !x)}>{all ? 'הצג רק 6' : `+${n - 6} עוד`}</button>}
    </section>
  );
}

function Fold({ title, n, cat, extra, children }) {
  return (
    <details className="h2-fold" data-c={cat || undefined}>
      <summary>
        <span className="h2-fold-t">{title}</span>
        <span className="n">{n}</span>
        {extra && <span className="h2-fold-x">{extra}</span>}
      </summary>
      <div className="h2-fold-b">{children}</div>
    </details>
  );
}

/* leads that went quiet, or have no next step with a date. A tap opens the card, where a dated step can be set */
function SilentList({ c, onCard }) {
  if (!c.silent.length && !c.reachMore.length) return <p className="hub-empty">לכל ליד יש צעד הבא עם תאריך, ואף אחד לא שותק</p>;
  return (
    <ul className="hub-rows">
      {c.silent.map((cl) => {
        const x = c.crm.get(cl.id);
        return (
          <li key={cl.id} className="hub-row" data-c="lead">
            <div className="hub-row-line">
              <button type="button" className="hub-row-btn" aria-haspopup="dialog" onClick={() => onCard(cl.id)}>
                <span className="main"><b>{c.clientName(cl.id)}</b><span className="sub"> · {x.alert}</span></span>
              </button>
              <span className="meta">{stageLabel(cl.stage)}</span>
              <WaButton phone={cl.phone} />
            </div>
          </li>
        );
      })}
      {c.reachMore.map((r) => (
        <Row key={r.id} cat={r.client_id ? c.catFor(r.client_id) : 'lead'} main={<b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b>} sub={clean(r.preview)}
          action={<WaButton phone={r.phone} label="לפנות" />} />
      ))}
    </ul>
  );
}

/* 13.11 (B1): approved or marked done by mistake → back to "waiting for approval" */
function RecentOkRow({ a, c }) {
  const hub = useHub();
  const back = c.reopening.get(a.target_id);
  const when = fmtTime(a.applied_at || a.created_at);
  const ok = a.kind === 'output_approve';
  return (
    <Row main={<>{ok ? '✓ ' : ''}{a.payload?.label || 'משימה'}</>} sub={c.clientName(a.payload?.client_id)}
      meta={back ? <Clock text="חוזר לאישור" /> : `${ok ? 'אושר' : 'סומן בוצע'} ב-${when}`}
      action={!back && (
        <button type="button" className="hub-act" title="אישרת בטעות? המשימה חוזרת למסך לאשר, והשלב הבא יוצא מהתור אם עוד לא התחיל"
          onClick={() => hub.act('task_reopen', a.target_id, { client_id: a.payload?.client_id, label: a.payload?.label, title: a.payload?.title || a.payload?.label }, 'חוזר לאישור')}>↩ החזר לאישור</button>
      )}
      details={[['המשימה', a.payload?.title || a.payload?.label], ['מתי', `${fmtShortDate(isoDay(new Date(a.created_at)))} ${when}`]]} />
  );
}

function Group({ title, tone, children, empty }) {
  const has = [children].flat(Infinity).some(Boolean);
  if (!has && !empty) return null;
  return (
    <section className="hub-group">
      {title && <h3 className={tone === 'late' ? 'late' : undefined}>{title}</h3>}
      {has ? <ul className="hub-rows">{children}</ul> : <p className="hub-empty">{empty}</p>}
    </section>
  );
}

function Queue({ q, c }) {
  const taskMeta = (t) => deadlineMeta(t, c.today);
  const tDetails = (t) => [['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note], ['פתוחה מאז', fmtShortDate(t.since)]];
  const task = (t, extra) => <TaskRow key={t.id} t={t} c={c} {...taskMeta(t)} details={tDetails(t)} extra={extra} />;

  if (q === 'late') {
    const late = c.dueAll.filter((t) => goalOf(t) < c.today);
    return <Group empty="שום דבר לא באיחור, יפה">{late.map((t) => task(t))}</Group>;
  }
  if (q === 'today' || q === 'mine') {
    const today = c.dueAll.filter((t) => goalOf(t) === c.today);
    return (
      <>
        <Group title="משימות להיום" empty="אין משימות להיום">{today.map((t) => task(t))}</Group>
        <Group title="ביומן היום">{c.calls.map((e) => (
          <Row key={e.id} main={<><span className="hub-time">{hasTime(e) ? fmtTime(e.starts_at) : 'היום'}</span>{clean(e.title)}</>}
            action={<>{e.prep_pdf && <PrepButton path={e.prep_pdf} />}{isCall(e) && <WaButton phone={c.clients.get(e.client_id)?.phone} />}</>}
            details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)]]} />
        ))}</Group>
        <Group title="בהמשך השבוע">{c.soonMine.map((t) => task(t))}</Group>
        {c.noDateMine.length > 0 && (
          <details className="hub-pipe">
            <summary><span>בלי תאריך</span><span className="n">{c.noDateMine.length}</span></summary>
            <ul className="hub-rows">{c.noDateMine.map((t) => task(t))}</ul>
          </details>
        )}
        {c.stuck && (
          <Group title="5 דקות: התקועה הכי הרבה זמן">
            {task(c.stuck)}
            <li className="hub-five-hint">מה הצעד הכי קטן שאפשר לעשות בה עכשיו?</li>
            <li><FiveMinTask t={c.stuck} c={c} /></li>
          </Group>
        )}
      </>
    );
  }
  if (q === 'steps') {
    return (
      <>
        <p className="hub-q-note">קבצים שסוכן הכין: "פתח", ואז "מאשר" (השלב הבא נכנס לתור לבד) או "לא מאשר" עם הסיבות (חוזר לסוכן לתיקון). שלבים שהסוכנות הציעה למשימה גדולה: "אשר" = השלב נכנס לעבודה.</p>
        <Group title="📄 קבצים לאישור">{c.approvals.map((t) => task(t))}</Group>
        <Group title="שלבים של משימה גדולה" empty={c.approvals.length || c.recentOk.length ? null : 'אין מה לאשר'}>{c.proposed.map((t) => task(t))}</Group>
        <Group title="אישרת ב-24 השעות האחרונות">{c.recentOk.map((a) => <RecentOkRow key={a.id} a={a} c={c} />)}</Group>
      </>
    );
  }
  if (q === 'reply') {
    return (
      <Group empty="אין מה לענות, יפה">
        {c.replies.map((r) => {
          const old = (c.now - new Date(r.last_message_at).getTime()) > 86400000;
          const preview = previewText(r.preview);
          return (
            <Row key={r.id} main={<b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b>} sub={cut(clean(preview), 70)}
              meta={ago(r.last_message_at, c.now)} metaTone={old ? 'late' : undefined}
              action={<WaButton phone={r.phone} label="לענות" />}
              details={[['הודעה אחרונה', preview], ['טלפון', fmtPhone(r.phone || r.contact_name)]]} />
          );
        })}
      </Group>
    );
  }
  if (q === 'calls') {
    const ev = (e, withDay) => {
      const past = hasTime(e) && new Date(e.starts_at).getTime() < c.now - 45 * 60000;
      const when = withDay ? `${fmtDay(e.starts_at)} ${hasTime(e) ? fmtTime(e.starts_at) : ''}`.trim() : (hasTime(e) ? fmtTime(e.starts_at) : 'היום');
      return (
        <Row key={e.id} main={<><span className="hub-time" data-past={past || undefined}>{when}</span>{clean(e.title)}</>}
          action={<>{e.prep_pdf && <PrepButton path={e.prep_pdf} />}{isCall(e) && <WaButton phone={c.clients.get(e.client_id)?.phone} />}</>}
          details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)]]} />
      );
    };
    return (
      <>
        <Group title="היום" empty="אין שיחות היום">{c.calls.map((e) => ev(e, false))}</Group>
        <Group title="השבוע">{c.upcoming.map((e) => ev(e, true))}</Group>
      </>
    );
  }
  if (q === 'money') {
    return (
      <Group empty="אין תשלומים פתוחים">
        {c.collect.map((x) => <CollectRow key={x.id} x={x} c={c} />)}
      </Group>
    );
  }
  if (q === 'waiting') {
    return (
      <Group empty="אף לקוח לא תקוע יותר מ-3 ימים">
        {c.waiting.map((t) => {
          const n = daysBetween(t.since, c.today);
          return (
            <TaskRow key={t.id} t={t} c={c} meta={daysWord(n)} metaTone={n > 10 ? 'late' : undefined}
              extra={<WaButton phone={c.clients.get(t.client_id)?.phone} label="תזכורת" />} details={tDetails(t)} />
          );
        })}
      </Group>
    );
  }
  if (q === 'reach') {
    return (
      <Group empty="אין פניות מומלצות להיום">
        {c.reach.map((r) => (
          <Row key={r.id} main={<b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b>} sub={clean(r.preview)}
            action={<WaButton phone={r.phone} label="לפנות" />} />
        ))}
      </Group>
    );
  }
  if (q === 'agents') {
    const forMe = c.agents.filter((t) => whoseTurn(t).then);
    const rest = c.agents.filter((t) => !whoseTurn(t).then);
    return (
      <>
        <p className="hub-q-note">מה שהסוכנים עובדים עליו. זה לא עליך, חוץ ממה שמסומן "← אתה" (יחזור אליך לאישור או לשליחה).</p>
        <Group title="יחזרו אליך">{forMe.map((t) => task(t))}</Group>
        <Group title="בעבודה" empty={forMe.length ? null : 'אין משימות פתוחות לסוכנים'}>{rest.map((t) => task(t))}</Group>
      </>
    );
  }
  return null;
}

/* money that is still open: a reminder, and "came in" (writes לגבות.md, the client's log and closes the payment task) */
function CollectRow({ x, c, noWho }) {
  const hub = useHub();
  const n = daysBetween(x.since, c.today);
  const amount = x.amount ? money(x.amount) : x.amount_text;
  const p = c.pending.get(x.id);
  return (
    <Row kb cat="money" pending={p ? 'done' : undefined} main={noWho ? (x.who.split(' · ').slice(1).join(' · ') || x.who) : x.who}
      meta={p ? <Clock text="נכנס, ממתין לסנכרון" /> : [amount, n != null ? daysWord(n) : null].filter(Boolean).join(' · ')}
      metaTone={!p && n > 14 ? 'late' : undefined}
      action={!p && <>
        <WaButton phone={c.clients.get(x.client_id)?.phone} label="תזכורת" />
        <button type="button" className="hub-act hub-act-main" data-k="x" title="נכנס (X)"
          onClick={() => hub.act('payment_received', x.id, { client_id: x.client_id, label: cut(x.who), amount_text: amount }, 'סומן שנכנס')}>נכנס ✓</button>
      </>}
      details={[['מאז', fmtShortDate(x.since)], ['הערה', x.note]]} />
  );
}

/* "5 minutes": the smallest step on the stuck task becomes a task of its own, for today,
   in the same client's file. Until the agent writes it, the step shows here with a clock. */
function FiveMinTask({ t, c }) {
  const hub = useHub();
  const [step, setStep] = useState('');
  const [busy, setBusy] = useState(false);
  const queued = c.added.filter((a) => a.payload?.client_id === t.client_id && a.payload?.from_task === t.id);
  const submit = async (e) => {
    e.preventDefault();
    const s = step.replace(/\s+/g, ' ').trim();
    if (!s || busy) return;
    setBusy(true);
    const ok = await hub.act('task_add', null, { client_id: t.client_id, title: s.slice(0, 300), owner: 'אני', due: c.today, label: cut(s), from_task: t.id }, 'נוספה משימה להיום');
    setBusy(false);
    if (ok) setStep('');
  };
  return (
    <>
      {queued.map((a) => <p key={a.id} className="hub-five-queued">{a.payload.title} <Clock /></p>)}
      <form className="hub-five-form" onSubmit={submit}>
        <input type="text" value={step} onChange={(e) => setStep(e.target.value)} maxLength={300}
          placeholder="הצעד הקטן, למשל: לשלוח לו הודעה קצרה" aria-label="הצעד הקטן" />
        <button type="submit" className="hub-act hub-act-main" disabled={!step.trim() || busy}>הפוך למשימה להיום</button>
      </form>
    </>
  );
}

/* an action the agent couldn't write to the files (row changed meanwhile, etc.) */
function FailedNotice({ failed }) {
  const [gone, setGone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); } catch { return new Set(); }
  });
  const list = failed.filter((a) => !gone.has(a.id));
  if (!list.length) return null;
  const dismiss = () => {
    const next = new Set([...gone, ...list.map((a) => a.id)]);
    setGone(next);
    try { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next].slice(-50))); } catch { /* private mode */ }
  };
  const what = { task_done: 'בוצע', task_postpone: 'דחייה', task_add: 'משימה חדשה', task_irrelevant: 'לא רלוונטי', payment_received: 'תשלום שנכנס', stage_set: 'שינוי שלב' };
  return (
    <div className="hub-failed" role="status">
      <details>
        <summary><span aria-hidden="true">⚠</span> {list.length === 1 ? 'פעולה אחת לא נכתבה לקבצים' : `${list.length} פעולות לא נכתבו לקבצים`}</summary>
        <ul>{list.map((a) => <li key={a.id}>{what[a.kind] || a.kind}: {a.payload?.label || a.payload?.title || ''}{a.error ? ` · ${a.error}` : ''}</li>)}</ul>
      </details>
      <button type="button" className="hub-failed-x" onClick={dismiss}>הבנתי</button>
    </div>
  );
}

function GoalStrip({ goal }) {
  const cur = Number(goal.current) || 0;
  const tgt = Number(goal.target) || 0;
  const pct = Math.min(100, Math.round((cur / tgt) * 100));
  const reached = cur >= tgt;
  return (
    <div className="hub-goal" role="group" aria-label="יעד" data-reached={reached || undefined}>
      <span className="hub-goal-label">{goal.label}</span>
      <span className="hub-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className="hub-goal-n">{cur} מתוך {tgt}</span>
      {reached && <span className="hub-goal-done">✓ היעד הושג, הגיע הזמן להגדיר את הבא</span>}
    </div>
  );
}

/* the numbers of the week, moved over from WhatsApp live (stage 5).
   This week runs Sunday to today, so last week is shown as a plain number, not an arrow */
function WeekNumbers({ week, replyMin }) {
  /* a fresh week (nothing yet) shows one quiet line with last week, not three big zeros */
  if (week.every((g) => !Number(g.current))) {
    const prev = week.filter((g) => g.previous != null).map((g) => `${g.label} ${Number(g.previous)}`).join(' · ');
    return (
      <section className="hub-week hub-week-fresh" aria-label="המספרים של השבוע">
        <p>שבוע חדש התחיל, עוד אין מספרים{prev ? `. שבוע שעבר: ${prev}` : ''}</p>
      </section>
    );
  }
  return (
    <section className="hub-week" aria-labelledby="s-weeknum">
      <h2 id="s-weeknum" className="hub-week-title">המספרים של השבוע</h2>
      <dl className="hub-week-grid">
        {week.map((g) => (
          <div key={g.key} title={g.detail || undefined}>
            <dt>{g.label}</dt>
            <dd><b>{Number(g.current) || 0}</b>{g.previous != null && <span>שבוע שעבר {Number(g.previous)}</span>}</dd>
          </div>
        ))}
      </dl>
      {week.some((g) => g.detail) && (
        <details className="hub-week-who">
          <summary>מי בפנים</summary>
          {week.filter((g) => g.detail).map((g) => <p key={g.key}><b>{g.label}:</b> {g.detail}</p>)}
        </details>
      )}
      {replyMin && <p className="hub-week-note">זמן תגובה חציוני לפניות: {replyMin.current < 60 ? `${replyMin.current} דק'` : `${Math.round(replyMin.current / 6) / 10} שעות`}{replyMin.detail ? ` (${replyMin.detail})` : ''}</p>}
    </section>
  );
}

/* ─── 23.11 CRM: pipeline board + people table ───
   The board has a column per stage (lead, ball in their court, active client, frozen). On a phone the
   columns slide sideways. The table is the same people as rows. Both read the header search box and the
   stage / source chips. A tap on a card or a row opens the person's card (the drawer). */
export function ClientsView() {
  const hub = useHub();
  const c = useComputed();
  const [params, setParams] = useSearchParams();
  const view = params.get('v') === 'people' ? 'people' : 'pipe';
  const [openId, setOpenId] = useState(null);
  const [stage, setStage] = useState('');
  const [source, setSource] = useState('');
  useRowKeys();
  const all = useMemo(() => (hub.data?.hub_clients || []).filter((x) => !/נסגר|סגור/.test(x.stage || '')), [hub.data]);
  const q = (hub.search || '').trim();
  const sources = useMemo(() => {
    const n = new Map();
    all.forEach((x) => { if (x.source) n.set(x.source, (n.get(x.source) || 0) + 1); });
    return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  }, [all]);
  const list = useMemo(() => all.filter((x) => (!stage || (x.stage || '') === stage) && (!source || x.source === source) && matchClient(x, q)),
    [all, stage, source, q]);
  const current = (hub.data?.hub_clients || []).find((x) => x.id === openId) || null;

  if (hub.loading) return <div className="hub-skel" style={{ marginTop: 18 }} aria-label="טוען" />;
  if (hub.error || !c) return <p className="hub-err">לא הצלחתי לטעון את הלקוחות. בדוק חיבור ונסה לרענן.</p>;

  const setView = (v) => { const p = new URLSearchParams(params); p.set('v', v); setParams(p, { replace: true }); };
  const silentOf = (cl) => c.crm.get(cl.id)?.silentDays ?? -1;
  const stageKeys = STAGE_COLS.map(([k]) => k);
  const cols = STAGE_COLS.map(([key, label]) => ({ key, label, list: list.filter((x) => (x.stage || '').trim() === key).sort((a, b) => silentOf(b) - silentOf(a)) }));
  const other = list.filter((x) => !stageKeys.includes((x.stage || '').trim()));
  if (other.length) cols.push({ key: '', label: 'בלי שלב', list: other });
  const people = [...list].sort((a, b) => {
    const order = ['שוטף', 'חי', 'כדור אצלם', 'מוקפא'];
    const ia = order.indexOf(a.stage), ib = order.indexOf(b.stage);
    return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib) || silentOf(b) - silentOf(a);
  });
  const filtered = stage || source || q;

  return (
    <div className="crm">
      <div className="crm-top">
        <div className="hub-seg" role="tablist" aria-label="תצוגה">
          <button type="button" role="tab" aria-selected={view === 'pipe'} onClick={() => setView('pipe')}>צנרת</button>
          <button type="button" role="tab" aria-selected={view === 'people'} onClick={() => setView('people')}>אנשים</button>
        </div>
        <span className="crm-count">{filtered ? `${list.length} מתוך ${all.length}` : `${all.length} אנשים`}</span>
        {q && <button type="button" className="crm-clear" onClick={() => hub.setSearch('')}>חיפוש: "{q}" ✕</button>}
      </div>
      <div className="crm-filterbar">
        <div className="crm-filters" role="group" aria-label="סינון לפי שלב">
          <span className="k">שלב</span>
          <button type="button" className="crm-chip" aria-pressed={!stage} onClick={() => setStage('')}>הכל</button>
          {STAGE_COLS.map(([k, l]) => <button key={k} type="button" className="crm-chip" aria-pressed={stage === k} onClick={() => setStage(stage === k ? '' : k)}>{l}</button>)}
        </div>
        {sources.length > 0 && (
          <div className="crm-filters" role="group" aria-label="סינון לפי מקור">
            <span className="k">מקור</span>
            <button type="button" className="crm-chip" aria-pressed={!source} onClick={() => setSource('')}>הכל</button>
            {sources.map((s) => <button key={s} type="button" className="crm-chip" aria-pressed={source === s} onClick={() => setSource(source === s ? '' : s)}>{s}</button>)}
          </div>
        )}
      </div>

      {!list.length ? <p className="hub-empty" style={{ paddingTop: 14 }}>אף אחד לא מתאים לחיפוש ולסינון האלה</p> : view === 'pipe' ? (
        <div className="crm-board">
          {cols.map((col) => {
            const sum = col.list.reduce((s, cl) => s + (Number(cl.deal_value) || 0), 0);
            return (
              <section key={col.key || 'none'} className="crm-col" aria-label={col.label}>
                <div className="crm-col-h">
                  <h2>{col.label}</h2><span className="n">{col.list.length}</span>
                  {sum > 0 && <span className="crm-col-sum" title="סכום השווי של מי שהוגדר לו שווי">{money(sum)}</span>}
                </div>
                {col.list.length
                  ? <ul className="crm-col-b">{col.list.map((cl) => <PipeCard key={cl.id} cl={cl} c={c} onOpen={() => setOpenId(cl.id)} />)}</ul>
                  : <p className="hub-empty">אין כאן אף אחד</p>}
              </section>
            );
          })}
        </div>
      ) : (
        <table className="crm-tbl">
          <thead><tr><th>שם</th><th>תחום</th><th>שלב</th><th>הצעד הבא</th><th>מתי</th><th>קשר אחרון</th><th>שווי</th><th>מקור</th></tr></thead>
          <tbody>
            {people.map((cl) => {
              const x = c.crm.get(cl.id) || {};
              const biz = bizOf(cl);
              return (
                <tr key={cl.id} data-tone={x.alert ? 'late' : undefined} onClick={() => setOpenId(cl.id)}>
                  <td>
                    <button type="button" className="crm-name" aria-haspopup="dialog" onClick={(e) => { e.stopPropagation(); setOpenId(cl.id); }}>{c.clientName(cl.id)}</button>
                    {biz && <span className="sub">{biz}</span>}
                    {x.alert && <span className="crm-flag">⚑ {x.alert}</span>}
                  </td>
                  <td>{cl.business && cl.business !== biz ? cl.business : ''}</td>
                  <td><span className="crm-stage" data-s={cl.stage || ''}>{stageLabel(cl.stage)}</span></td>
                  <td>{cl.next_action ? shortTitle(cl.next_action) : <span className="sub">לא הוגדר</span>}</td>
                  <td className={!x.nd ? (cl.stage === 'מוקפא' ? 'quiet' : 'missing') : x.nd < c.today ? 'late' : undefined}>{x.nd ? fmtStep(x.nd, c.today) : 'אין תאריך'}</td>
                  <td>{x.lc ? `${x.lc.theirs ? 'כתב' : 'כתבתי'} ${ago(x.lc.at, c.now)}` : ''}</td>
                  <td className="num">{cl.deal_value ? money(cl.deal_value) : ''}</td>
                  <td>{cl.source || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {view === 'pipe' && list.length > 0 && <p className="crm-hint">בכל עמודה: מי ששותק הכי הרבה זמן למעלה. שינוי שלב נעשה בתוך הכרטיס.</p>}
      {current && <ClientDrawer cl={current} c={c} onClose={() => setOpenId(null)} />}
    </div>
  );
}

/* 16.11: last real WhatsApp contact, straight from wa.db (no AI in between).
   They wrote last → my turn (orange after 24h). I wrote last → waiting on them. */
function lastContact(cl, now) {
  const tin = cl.last_in_at ? new Date(cl.last_in_at).getTime() : 0;
  const tout = cl.last_out_at ? new Date(cl.last_out_at).getTime() : 0;
  if (!tin && !tout) return null;
  const theirs = tin > tout;
  const at = theirs ? cl.last_in_at : cl.last_out_at;
  const hours = (now - new Date(at).getTime()) / 3600000;
  return { theirs, at, text: theirs ? `💬 כתב ${ago(at, now)}` : `📤 כתבתי ${ago(at, now)}`, late: theirs && hours > 24 };
}

const STAGES = ['שוטף', 'חי', 'כדור אצלם', 'מוקפא', 'סגור'];
function StagePicker({ cl }) {
  const { act, data } = useHub();
  const pending = (data?.hub_actions || []).find((a) => a.kind === 'stage_set' && a.target_id === cl.id && a.status === 'pending');
  const cur = pending?.payload?.stage || cl.stage || '';
  const set = (st) => {
    if (st === cur) return;
    if (st === 'סגור' && !window.confirm('להעביר לנסגרו? הלקוח ייעלם מהמסך (התיקייה נשמרת במחשב)')) return;
    act('stage_set', cl.id, { client_id: cl.id, stage: st, label: cl.name }, `שלב: ${st}`);
  };
  return (
    <div className="hub-drawer-tabs" role="group" aria-label="שלב">
      {STAGES.map((st) => (
        <button key={st} type="button" aria-selected={cur === st} onClick={() => set(st)}>{st}{pending && cur === st ? ' ⏳' : ''}</button>
      ))}
    </div>
  );
}

/* one person on the board: who, the next step and its date (red when there is none), last contact, value, source.
   A flagged lead (silent, or no dated step) gets a red stripe and one line that says why */
function PipeCard({ cl, c, onOpen }) {
  const x = c.crm.get(cl.id) || {};
  const biz = bizOf(cl);
  const late = c.tasks.filter((t) => t.client_id === cl.id && isOpen(t) && isMine(t) && t.due && t.due < c.today).length;
  const owed = c.collect.find((o) => o.client_id === cl.id);
  const tone = x.alert || late ? 'late' : x.lc?.theirs ? 'now' : null;
  return (
    <li>
      <button type="button" className="crm-pc" data-tone={tone || undefined} onClick={onOpen} aria-haspopup="dialog">
        <span className="crm-pc-h"><b>{c.clientName(cl.id)}</b>{biz && <span className="crm-pc-biz">{biz}</span>}</span>
        <span className="crm-pc-next">
          {x.nd ? <span className={`crm-pc-date${x.nd < c.today ? ' late' : ''}`}>{fmtStep(x.nd, c.today)}</span>
            : <span className={`crm-pc-date ${cl.stage === 'מוקפא' ? 'quiet' : 'missing'}`}>אין תאריך</span>}
          {cl.next_action ? shortTitle(cl.next_action) : 'לא הוגדר צעד הבא'}
        </span>
        {x.alert && <span className="crm-flag">⚑ {x.alert}</span>}
        <span className="crm-pc-foot">
          {x.lc
            ? <span className="crm-pc-last" data-who={x.lc.theirs ? 'them' : 'me'} title={cl.last_preview || ''}>{x.lc.theirs ? 'כתב' : 'כתבתי'} {ago(x.lc.at, c.now)}</span>
            : <span className="crm-pc-last">אין וואטסאפ</span>}
          {late > 0 && <span className="late">{late} באיחור</span>}
          {owed && <span className="crm-pc-owed">₪ לגבות{owed.amount ? ` ${Number(owed.amount).toLocaleString('he-IL')}` : ''}</span>}
          {cl.deal_value ? <span className="num">{money(cl.deal_value)}</span> : null}
          {cl.source && <span className="crm-pc-src">{cl.source}</span>}
        </span>
      </button>
    </li>
  );
}

/* a client file: uploaded only when tapped. The tab opens on the tap (popup blockers),
   the agent uploads within seconds, then the tab gets a 10-minute signed link */
function useOpenFile(f, clientId) {
  const [state, setState] = useState(null); // null | 'wait' | 'err'
  const ext = (f.n.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  const obj = `${f.k}${ext}`;
  const open = async () => {
    const w = window.open('', '_blank');
    if (w) w.document.write('<p dir="rtl" style="font-family:sans-serif;padding:24px">פותח את הקובץ מהמחשב, עוד כמה שניות…</p>');
    setState('wait');
    const sign = () => supabase.storage.from('hub-files').createSignedUrl(obj, 600);
    let { data } = await sign();
    if (!data?.signedUrl) {
      const ins = await supabase.from('hub_actions').insert({ kind: 'file_open', target_id: f.k, payload: { client_id: clientId, label: cut(f.n, 80) } }).select('id').single();
      if (ins.error) { w?.close(); setState('err'); return; }
      for (let i = 0; i < 40 && !data?.signedUrl; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const a = await supabase.from('hub_actions').select('status,error').eq('id', ins.data.id).single();
        if (a.data?.status === 'failed') { w?.close(); setState('err'); alert(a.data.error || 'הקובץ לא נפתח'); return; }
        if (a.data?.status === 'applied') ({ data } = await sign());
      }
    }
    if (!data?.signedUrl) { w?.close(); setState('err'); alert('המחשב לא ענה. בדוק שסוכן הסנכרון דולק ונסה שוב'); return; }
    setState(null);
    if (w) w.location.href = data.signedUrl; else window.location.href = data.signedUrl;
  };
  return { state, open, ext };
}

/* "📄 פתח" on a task whose agent output waits for approval */
function OpenFileBtn({ f, clientId, main }) {
  const { state, open } = useOpenFile(f, clientId);
  return (
    <button type="button" className={`hub-act${main ? ' hub-act-main' : ''}`} onClick={open} disabled={state === 'wait'} title={f.n}>
      {state === 'wait' ? 'פותח…' : state === 'err' ? 'שוב' : '📄 פתח'}
    </button>
  );
}

function FileRow({ f, clientId }) {
  const { state, open, ext } = useOpenFile(f, clientId);
  const name = f.n.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
  return (
    <li className="hub-row">
      <div className="hub-row-line">
        <span className="hub-file-ico" aria-hidden="true">{ext === '.mp4' ? '🎬' : '📄'}</span>
        <span className="hub-row-btn"><span className="main">{name}</span></span>
        <span className="meta">{[f.f, fmtShortDate(f.t), f.s >= 1 ? `${f.s}MB` : null].filter(Boolean).join(' · ')}</span>
        <button type="button" className="hub-act" onClick={open} disabled={state === 'wait'}>{state === 'wait' ? 'פותח…' : state === 'err' ? 'שוב' : 'פתח'}</button>
      </div>
    </li>
  );
}

/* ─── 23.11: the person's card ───
   One timeline from everything the screen knows: the last lines of the log in זיכרון_לקוח (WhatsApp
   messages are logged there with the hour), the last WhatsApp contact from the bridge, calendar events,
   finished tasks and payments that came in. */
const TL_KIND = { wa: 'וואטסאפ', call: 'שיחה', log: 'לוג', cal: 'יומן', task: 'משימה', money: 'כסף' };
const TL_FILTERS = [['', 'הכל'], ['wa', 'וואטסאפ'], ['log', 'לוג'], ['cal', 'יומן'], ['task', 'משימות']];
const TL_GROUP = { wa: 'wa', call: 'log', log: 'log', money: 'log', cal: 'cal', task: 'task' };
function buildTimeline(cl, c) {
  const ev = [];
  (cl.log || []).forEach((e, i) => ev.push({ k: `l${i}`, kind: TL_KIND[e.k] ? e.k : 'log', dir: e.dir || null, day: e.d, time: e.t || null, text: e.x }));
  /* the bridge knows the real last message in each direction. Skip it when the log already has that day */
  const logged = (day, dir) => ev.some((x) => x.kind === 'wa' && x.day === day && (!x.dir || x.dir === dir));
  const lastIn = cl.last_in_at ? new Date(cl.last_in_at).getTime() : 0;
  const lastOut = cl.last_out_at ? new Date(cl.last_out_at).getTime() : 0;
  if (lastIn && !logged(isoDay(new Date(cl.last_in_at)), 'in')) {
    ev.push({ k: 'wa-in', kind: 'wa', dir: 'in', day: isoDay(new Date(cl.last_in_at)), time: fmtTime(cl.last_in_at), text: lastIn > lastOut && cl.last_preview ? cl.last_preview : 'ההודעה האחרונה שלו' });
  }
  if (lastOut && !logged(isoDay(new Date(cl.last_out_at)), 'out')) {
    ev.push({ k: 'wa-out', kind: 'wa', dir: 'out', day: isoDay(new Date(cl.last_out_at)), time: fmtTime(cl.last_out_at), text: lastOut > lastIn && cl.last_preview ? cl.last_preview : 'ההודעה האחרונה שלי' });
  }
  c.events.forEach((e) => {
    if (e.client_id !== cl.id || !e.starts_at) return;
    ev.push({ k: e.id, kind: 'cal', day: isoDay(new Date(e.starts_at)), time: hasTime(e) ? fmtTime(e.starts_at) : null, text: clean(e.title),
      future: new Date(e.starts_at).getTime() > c.now, prep: new Date(e.starts_at).getTime() > c.now - 3600000 ? e.prep_pdf : null });
  });
  c.tasks.forEach((t) => {
    if (t.client_id !== cl.id || t.status !== 'done' || !t.done_at) return;
    ev.push({ k: t.id, kind: 'task', day: t.done_at, time: null, text: `בוצע: ${doneText(t.title)}` });
  });
  c.collectAll.forEach((x) => {
    if (x.client_id !== cl.id || x.status !== 'paid' || !x.paid_at) return;
    ev.push({ k: x.id, kind: 'money', day: x.paid_at, time: null, text: `נכנס תשלום: ${x.who}` });
  });
  return ev.sort((a, b) => b.day.localeCompare(a.day) || String(b.time || '').localeCompare(String(a.time || '')));
}

function Timeline({ cl, c }) {
  const [f, setF] = useState('');
  const [all, setAll] = useState(false);
  const events = useMemo(() => buildTimeline(cl, c), [cl, c]);
  const list = events.filter((e) => !f || TL_GROUP[e.kind] === f);
  const shown = all ? list : list.slice(0, 25);
  const first = c.clientName(cl.id).split(' ')[0];
  return (
    <>
      <div className="crm-chips" role="group" aria-label="סינון ציר הזמן">
        {TL_FILTERS.map(([k, l]) => {
          const n = k ? events.filter((e) => TL_GROUP[e.kind] === k).length : events.length;
          return <button key={k} type="button" className="crm-chip" aria-pressed={f === k} disabled={!n && !!k} onClick={() => { setF(k); setAll(false); }}>{l} <b>{n}</b></button>;
        })}
      </div>
      {list.length ? (
        <ol className="crm-tl">
          {shown.map((e) => (
            <li key={e.k} className="crm-ev" data-kind={e.kind} data-dir={e.dir || undefined} data-future={e.future || undefined}>
              <span className="crm-ev-d">{fmtStep(e.day, c.today)}{e.time && <i> {e.time}</i>}</span>
              <span className="crm-ev-k">{TL_KIND[e.kind]}{e.dir === 'in' ? ` · ${first} כתב` : e.dir === 'out' ? ' · אני כתבתי' : ''}{e.future ? ' · בקרוב' : ''}</span>
              <p className="crm-ev-t">{e.text}{e.prep && <> <PrepButton path={e.prep} /></>}</p>
            </li>
          ))}
        </ol>
      ) : <p className="hub-empty">אין עדיין מה להציג בציר הזמן</p>}
      {list.length > 25 && <button type="button" className="h2-more" aria-expanded={all} onClick={() => setAll((x) => !x)}>{all ? 'הצג רק 25' : `+${list.length - 25} עוד`}</button>}
    </>
  );
}

/* the next step must have a date. Without one the box is marked, and a dated step can be added on the spot
   (it becomes a task in the person's file, the same way "משימה חדשה" does) */
function NextStep({ cl, c }) {
  const hub = useHub();
  const x = c.crm.get(cl.id) || {};
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const queued = c.added.filter((a) => a.payload?.client_id === cl.id && a.payload?.due);
  const missing = !x.nd && !queued.length;
  const submit = async (e) => {
    e.preventDefault();
    const t = title.replace(/\s+/g, ' ').trim();
    if (!t || !due || busy) return;
    setBusy(true);
    const ok = await hub.act('task_add', null, { client_id: cl.id, title: t.slice(0, 300), owner: 'אני', due, label: cut(t) }, `הצעד נוסף ל-${fmtShortDate(due)}`);
    setBusy(false);
    if (ok) { setTitle(''); setDue(''); setOpen(false); }
  };
  return (
    <div className="crm-next" data-missing={missing || undefined}>
      <div className="crm-next-line">
        <span className="k">הצעד הבא</span>
        <span className="d" data-late={(x.nd && x.nd < c.today) || undefined}>
          {x.nd ? fmtStep(x.nd, c.today) : queued.length ? <Clock text={`נוסף ל-${fmtShortDate(queued[0].payload.due)}`} /> : 'חסר תאריך'}
        </span>
        <button type="button" className="hub-act" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{missing ? 'קבע צעד עם תאריך' : 'צעד חדש'}</button>
      </div>
      <p className="crm-next-t">{cl.next_action || 'עוד לא הוגדר צעד הבא'}</p>
      {missing && !open && <p className="crm-next-why">בלי תאריך הליד נשכח. קבע מה הצעד הבא ומתי.</p>}
      {open && (
        <form className="crm-next-form" onSubmit={submit}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus maxLength={300} placeholder="מה הצעד הבא, למשל: להתקשר אליו" aria-label="הצעד הבא" />
          <input type="date" value={due} min={c.today} onChange={(e) => setDue(e.target.value)} aria-label="מתי" required />
          <button type="submit" className="hub-act hub-act-main" disabled={!title.trim() || !due || busy}>שמור</button>
        </form>
      )}
    </div>
  );
}

const P_TABS = [['tasks', 'משימות'], ['tl', 'ציר זמן'], ['money', 'כסף'], ['files', 'קבצים'], ['info', 'סיכום']];

function ClientDrawer({ cl, c, onClose }) {
  const ref = useRef(null);
  const [tab, setTab] = useState('tasks');
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const all = c.tasks.filter((t) => t.client_id === cl.id);
  const open = all.filter(isOpen).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const mine = open.filter(isMine);
  const theirs = open.filter(isClientSide);
  const agentTasks = open.filter(isAgents);
  const done = all.filter((t) => t.status === 'done').sort((a, b) => String(b.done_at).localeCompare(String(a.done_at))).slice(0, 6);
  const meetings = c.events.filter((e) => e.client_id === cl.id && e.starts_at
    && (hasTime(e) ? new Date(e.starts_at).getTime() >= c.now - 60 * 60000 : isoDay(new Date(e.starts_at)) >= c.today))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const undated = c.events.filter((e) => e.client_id === cl.id && !e.starts_at);
  const files = cl.files || [];
  const x = c.crm.get(cl.id) || {};
  const owedOpen = c.collect.filter((o) => o.client_id === cl.id);
  const paid = c.collectAll.filter((o) => o.client_id === cl.id && o.status === 'paid').sort((a, b) => String(b.paid_at).localeCompare(String(a.paid_at)));
  const biz = bizOf(cl);

  const taskRow = (t) => {
    return (
      <TaskRow key={t.id} t={t} c={c} noClient {...deadlineMeta(t, c.today)}
        details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['פתוחה מאז', fmtShortDate(t.since)], ['סטטוס', t.status_note]]} />
    );
  };
  const newRows = (side) => c.added
    .filter((a) => a.payload?.client_id === cl.id && (a.payload?.owner === 'לקוח') === (side === 'theirs'))
    .map((a) => <Row key={a.id} main={a.payload.title} pending="new" meta={<Clock />} />);
  const mineNew = newRows('mine');
  const theirsNew = newRows('theirs');
  const counts = { tasks: mine.length + theirs.length + agentTasks.length, files: files.length, money: owedOpen.length || null };

  return (
    <div className="hub-drawer-wrap" onClick={onClose}>
      <aside className="hub-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="hub-drawer-head">
          <div style={{ minWidth: 0 }}>
            <h2 id="drawer-title">{c.clientName(cl.id)}</h2>
            {(biz || cl.business) && <p className="hub-client-biz">{[biz, cl.business !== biz ? cl.business : null].filter(Boolean).join(' · ')}</p>}
          </div>
          <div className="hub-drawer-links">
            <WaButton phone={cl.phone} label="וואטסאפ" />
            {cl.phone && <a className="hub-act" href={`tel:+${cl.phone}`}>חייג</a>}
          </div>
          <button type="button" className="hub-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>
        <StagePicker cl={cl} />
        <NextStep cl={cl} c={c} />
        {x.alert && <p className="crm-alert"><span aria-hidden="true">⚑</span> {x.alert}</p>}
        <dl className="crm-facts">
          <div><dt>שווי עסקה</dt><dd className="num">{cl.deal_value ? money(cl.deal_value) : <span className="sub">לא הוגדר</span>}</dd></div>
          <div><dt>מקור</dt><dd>{cl.source || <span className="sub">לא ידוע</span>}</dd></div>
          <div><dt>קשר אחרון</dt><dd className={x.lc?.late ? 'late' : undefined}>{x.lc ? `${x.lc.theirs ? 'כתב' : 'כתבתי'} ${ago(x.lc.at, c.now)}` : <span className="sub">אין וואטסאפ</span>}</dd></div>
          <div><dt>פגישה הבאה</dt><dd>{cl.next_meeting_at ? `${fmtStep(isoDay(new Date(cl.next_meeting_at)), c.today)} ${fmtTime(cl.next_meeting_at)}` : <span className="sub">אין ביומן</span>}</dd></div>
        </dl>
        {x.lc && cl.last_preview && <p className="crm-preview"><span>{x.lc.theirs ? 'כתב' : 'כתבתי'}</span>{cl.last_preview}</p>}

        <div className="hub-drawer-tabs crm-p-tabs" role="tablist">
          {P_TABS.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}{counts[k] != null && <> <b>{counts[k]}</b></>}</button>
          ))}
        </div>

        <div className="hub-drawer-body crm-p-grid" data-tab={tab}>
          <section data-p="tl" aria-labelledby="p-tl">
            <h3 id="p-tl" className="crm-p-h">ציר זמן</h3>
            <Timeline cl={cl} c={c} />
          </section>

          <section data-p="tasks" aria-labelledby="p-tasks">
            <h3 id="p-tasks" className="crm-p-h">משימות <span className="n">{counts.tasks}</span></h3>
            {meetings.length > 0 && (
              <div className="hub-drawer-block">
                <h3>מועדים</h3>
                <ul className="hub-rows">{meetings.map((e) => <Row key={e.id} main={clean(e.title)} meta={`${fmtDay(e.starts_at)} ${hasTime(e) ? fmtTime(e.starts_at) : ''}`.trim()}
                  action={e.prep_pdf && <PrepButton path={e.prep_pdf} />} details={[['מתי', e.when_text]]} />)}</ul>
              </div>
            )}
            <div className="hub-drawer-block">
              <h3>עליך <span className="n">{mine.length + mineNew.length}</span></h3>
              {mine.length + mineNew.length ? <ul className="hub-rows">{mine.map(taskRow)}{mineNew}</ul> : <p className="hub-empty">אין משימות פתוחות עליך</p>}
            </div>
            {theirs.length + theirsNew.length > 0 && (
              <div className="hub-drawer-block">
                <h3>מחכה להם <span className="n">{theirs.length + theirsNew.length}</span></h3>
                <ul className="hub-rows">{theirs.map(taskRow)}{theirsNew}</ul>
              </div>
            )}
            {agentTasks.length > 0 && (
              <div className="hub-drawer-block">
                <h3>אצל הסוכנים <span className="n">{agentTasks.length}</span></h3>
                <ul className="hub-rows">{agentTasks.map(taskRow)}</ul>
              </div>
            )}
            <AddTask clientId={cl.id} today={c.today} />
          </section>

          <section data-p="money" aria-labelledby="p-money">
            <h3 id="p-money" className="crm-p-h">כסף</h3>
            {owedOpen.length > 0 && <ul className="hub-rows">{owedOpen.map((o) => <CollectRow key={o.id} x={o} c={c} noWho />)}</ul>}
            {paid.length > 0 && (
              <ul className="hub-rows hub-done">
                {paid.map((o) => <Row key={o.id} main={o.who.replace(`${cl.id} · `, '')} meta={[o.amount ? money(o.amount) : o.amount_text, o.paid_at ? `נכנס ${fmtShortDate(o.paid_at)}` : 'נכנס'].filter(Boolean).join(' · ')} />)}
              </ul>
            )}
            {!owedOpen.length && !paid.length && <p className="hub-empty">אין תשלומים רשומים</p>}
            {cl.payment_status && <p className="hub-drawer-status"><span>תשלום</span>{cl.payment_status}</p>}
          </section>

          <section data-p="files" aria-labelledby="p-files">
            <h3 id="p-files" className="crm-p-h">קבצים <span className="n">{files.length}</span></h3>
            {files.length ? <>
              <ul className="hub-rows">{files.map((f) => <FileRow key={f.k} f={f} clientId={cl.id} />)}</ul>
              <p className="hub-readonly">הגרסה האחרונה של כל מסמך מהתיקייה (PDF וסרטונים). קובץ עולה לענן רק כשלוחצים "פתח", ונמחק משם אחרי יום.</p>
            </> : <p className="hub-empty">אין עדיין קבצי PDF או סרטונים בתיקייה של הלקוח</p>}
          </section>

          <section data-p="info" aria-labelledby="p-info">
            <h3 id="p-info" className="crm-p-h">סיכום</h3>
            {cl.status && <p className="hub-drawer-status"><span>סוכם</span>{cl.status}</p>}
            {cl.phone && <p className="hub-drawer-status"><span>טלפון</span><bdi dir="ltr">{fmtPhone(cl.phone)}</bdi></p>}
            {undated.length > 0 && (
              <div className="hub-drawer-block">
                <h3>מועדים בלי תאריך <span className="n">{undated.length}</span></h3>
                <ul className="hub-rows">{undated.map((e) => <Row key={e.id} main={clean(e.title)} sub={e.when_text} details={[['מתי', e.when_text]]} />)}</ul>
              </div>
            )}
            {done.length > 0 && (
              <div className="hub-drawer-block">
                <h3>בוצע לאחרונה</h3>
                <ul className="hub-rows hub-done">{done.map((t) => <Row key={t.id} main={shortTitle(t.title)} meta={fmtShortDate(t.done_at)} details={[['המשימה המלאה', clean(t.title)]]} />)}</ul>
              </div>
            )}
            <div className="hub-client-progress">
              <span className="hub-bar" aria-hidden="true"><span style={{ width: `${cl.tasks_total ? Math.round((cl.tasks_done / cl.tasks_total) * 100) : 0}%` }} /></span>
              <span>{cl.tasks_done}/{cl.tasks_total} משימות נסגרו</span>
            </div>
            {cl.folder_path && <p className="hub-folder" title="התיקייה במרכז">📁 {cl.folder_path}</p>}
            <p className="hub-readonly">מה שמסומן כאן נכתב לקבצים של הלקוח במרכז כשהמחשב מסנכרן. שווי עסקה נקרא מהשדה "שווי" בזיכרון הלקוח, ועריכת הזיכרון עצמו נשארת אצל Claude.</p>
          </section>
        </div>
      </aside>
    </div>
  );
}

function AddTask({ clientId, today }) {
  const hub = useHub();
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('אני');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const t = title.replace(/\s+/g, ' ').trim();
    if (!t || busy) return;
    setBusy(true);
    const ok = await hub.act('task_add', null, { client_id: clientId, title: t.slice(0, 300), owner, due: due || null, label: cut(t) }, 'המשימה נוספה');
    setBusy(false);
    if (ok) { setTitle(''); setDue(''); }
  };
  return (
    <form className="hub-add" onSubmit={submit}>
      <h3>משימה חדשה</h3>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="מה צריך לעשות" aria-label="משימה חדשה" maxLength={300} />
      <div className="hub-add-row">
        <div className="hub-seg" role="radiogroup" aria-label="על מי">
          {[['אני', 'עליי'], ['לקוח', 'עליהם']].map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={owner === v} onClick={() => setOwner(v)}>{l}</button>
          ))}
        </div>
        <input type="date" value={due} min={today} onChange={(e) => setDue(e.target.value)} aria-label="יעד (לא חובה)" />
        <button type="submit" className="hub-act hub-act-main" disabled={!title.trim() || busy}>הוסף</button>
      </div>
    </form>
  );
}
