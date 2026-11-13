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
const fmtPhone = (s) => { const d = String(s || '').replace(/\D/g, '').replace(/^972/, '0'); return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : s; };
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
    <HubCtx.Provider value={{ ...state, now, reload: load, act }}>
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
function Row({ main, sub, meta, metaTone, action, details, kb, lead, pending, below }) {
  const [open, setOpen] = useState(false);
  const canOpen = details && details.some(([, v]) => v);
  return (
    <li className="hub-row" data-open={open || undefined} data-kb={kb || undefined} data-pending={pending || undefined} tabIndex={kb ? -1 : undefined}>
      <div className="hub-row-line">
        {lead}
        {canOpen ? (
          <button type="button" className="hub-row-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="main">{main}{sub && <span className="sub"> · {sub}</span>}</span>
          </button>
        ) : (
          <span className="hub-row-btn"><span className="main">{main}{sub && <span className="sub"> · {sub}</span>}</span></span>
        )}
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
function TaskRow({ t, c, meta, metaTone, details, extra, noClient, main }) {
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
    : turn.who === 'client' && t.waiting_on ? <span className="hub-wait">מחכה ל{cut(String(t.waiting_on).replace(/^ל/, ''), 22)}</span> : null;
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
      <Row kb main={title} sub={noClient ? null : c.clientName(t.client_id)} pending={isDone ? 'done' : 'moved'}
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
    <Row kb main={title} sub={noClient ? null : c.clientName(t.client_id)} meta={meta} metaTone={metaTone} details={details}
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
      const rows = [...scope.querySelectorAll('.hub-row[data-kb]')];
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
    const openAll = d.hub_tasks.filter((t) => isOpen(t) && !quiet(t));
    const proposed = openAll.filter(isProposed).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const open = openAll.filter((t) => !isProposed(t));
    /* 10.11: a file an agent prepared that waits for Shmuel's OK (📄 in the status cell) */
    const approvals = open.filter((t) => t.file?.k).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const mine = open.filter(isMine);
    const agents = open.filter(isAgents).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
    const soonMine = mine.filter((t) => t.due && goalOf(t) > today && goalOf(t) <= addDays(today, 7)).sort((a, b) => a.due.localeCompare(b.due));
    const noDateMine = mine.filter((t) => !t.due);

    const calls = d.hub_events.filter((e) => e.starts_at && isoDay(new Date(e.starts_at)) === today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const timed = calls.filter(hasTime); // "about to start" only for an item with a real hour, not the 09:00 placeholder
    const replies = d.hub_inbox.filter((x) => x.kind === 'reply').sort((a, b) => b.priority - a.priority || String(a.last_message_at).localeCompare(String(b.last_message_at)));
    const reach = d.hub_inbox.filter((x) => x.kind === 'reach_out').sort((a, b) => b.priority - a.priority).slice(0, 5);
    const dueAll = mine.filter((t) => t.due && goalOf(t) <= today).sort((a, b) => a.due.localeCompare(b.due)); // by the internal target
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

    /* "the one thing": a call about to start beats everything, then the oldest
       overdue task, then a client/lead waiting for an answer, then today's calls */
    const soonCall = timed.find((e) => { const t = new Date(e.starts_at).getTime(); return t > now - 30 * 60000 && t < now + 90 * 60000; });
    const nextCall = timed.find((e) => new Date(e.starts_at).getTime() > now);
    const hotReply = replies.find((r) => r.priority >= 3);
    let one = null;
    const callOne = (e) => ({ text: clean(e.title), why: `ביומן ב-${fmtTime(e.starts_at)}`, phone: clients.get(e.client_id)?.phone, prep: e.prep_pdf });
    if (soonCall) one = callOne(soonCall);
    else if (due[0]) {
      const dm = deadlineMeta(due[0], today);
      one = { text: clean(due[0].title), why: [clientName(due[0].client_id), dm.meta].filter(Boolean).join(' · '), late: dm.metaTone === 'late', task: due[0] };
    } else if (hotReply) one = { text: `לענות ל${clientName(hotReply.client_id) || fmtPhone(hotReply.contact_name)}`, why: hotReply.preview, phone: hotReply.phone };
    else if (nextCall) one = callOne(nextCall);
    else if (replies[0]) one = { text: `לענות ל${fmtPhone(replies[0].contact_name)}`, why: replies[0].preview, phone: replies[0].phone };

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

    return { now, today, clients, clientName, calls, linked, replies, reach, due, dueAll, proposed, approvals, waiting, collect, stuck, goal, week, replyMin, upcoming, one, agents, soonMine, noDateMine, tasks: d.hub_tasks, events: d.hub_events, pending, added, failed, recentOk, reopening };
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

export function TodayView({ newLeads = 0, onGo }) {
  const hub = useHub();
  const c = useComputed();
  const [params, setParams] = useSearchParams();
  const q = TILE_KEYS.includes(params.get('q')) ? params.get('q') : null;
  useRowKeys();

  const clientsAll = hub.data?.hub_clients || [];
  const activeCount = clientsAll.filter((x) => x.stage === 'שוטף').length;
  const pipeCount = clientsAll.filter((x) => x.stage !== 'שוטף' && !QUIET_STAGES.test(x.stage || '')).length;
  const tiles = buildTiles(c, newLeads, activeCount, pipeCount);

  const openQ = useCallback((key) => {
    if (key === 'leads' || key === 'clients') { onGo?.(key); return; }
    const p = new URLSearchParams(params); p.set('q', key);
    setParams(p); // a real history step, so the phone's Back returns to the cards
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
          <button type="button" className="hub-back" onClick={home}>→ כל הכרטיסים</button>
          <h2>{t.label} <span className="n">{t.big || t.n}</span></h2>
        </div>
        <nav className="hub-q-chips" aria-label="מעבר בין התורים">
          {tiles.filter((x) => x.key !== 'leads' && x.key !== 'clients').map((x) => (
            <button key={x.key} type="button" aria-current={x.key === q ? 'page' : undefined} data-tone={x.n ? x.tone || undefined : 'zero'}
              onClick={() => { if (x.key !== q) openQ(x.key); }}>{x.label} <b>{x.n}</b></button>
          ))}
        </nav>
        <Queue q={q} c={c} />
        <p className="hub-keys">מקשים: <kbd>Esc</kbd> חזרה לכרטיסים · <kbd>J</kbd> <kbd>K</kbd> לזוז · <kbd>X</kbd> בוצע · <kbd>D</kbd> דחה · <kbd>N</kbd> לא רלוונטי · <kbd>Enter</kbd> פרטים</p>
      </>
    );
  }

  return (
    <>
      <OneThing c={c} />
      {c.failed.length ? <FailedNotice failed={c.failed} /> : null}
      <ul className="hub-tiles" aria-label="הכי דחוף">
        {tiles.filter((t) => t.size === 'big').map((t) => <Tile key={t.key} t={t} i={tiles.indexOf(t)} onOpen={openQ} />)}
      </ul>
      <NextActions c={c} />
      <ul className="hub-tiles hub-tiles-small" aria-label="עוד">
        {tiles.filter((t) => t.size !== 'big').map((t) => <Tile key={t.key} t={t} i={tiles.indexOf(t)} onOpen={openQ} />)}
      </ul>
      <div className="hub-stats">
        {c.goal?.target ? <GoalStrip goal={c.goal} /> : null}
        {c.week.length ? <WeekNumbers week={c.week} replyMin={c.replyMin} /> : null}
      </div>
      <p className="hub-keys">מקשים: <kbd>1</kbd>-<kbd>9</kbd> פותחים כרטיס</p>
    </>
  );
}

function OneThing({ c }) {
  const hub = useHub();
  const turn = c.one?.task ? whoseTurn(c.one.task) : null;
  return (
    <div className="hub-one">
      <div className="hub-one-label">הדבר האחד עכשיו</div>
      {c.one ? (
        <>
          <p className="hub-one-text">{c.one.task ? <>{turn?.verb && <span className="hub-verb">{turn.verb}</span>}{shortTitle(c.one.task.title)}</> : c.one.text}</p>
          <div className="hub-one-why">
            <span className={c.one.late ? 'late' : undefined}>{c.one.why}</span>
            {c.one.task && (c.pending.get(c.one.task.id)
              ? <Clock />
              : <button type="button" className="hub-act hub-act-main" onClick={() => hub.act('task_done', c.one.task.id, { client_id: c.one.task.client_id, label: cut(clean(c.one.task.title)) }, 'סומן בוצע')}>בוצע</button>)}
            <WaButton phone={c.one.phone} label="פתח בוואטסאפ" />
            {c.one.prep && <PrepButton path={c.one.prep} />}
          </div>
        </>
      ) : <p className="hub-one-text" data-empty="true">אין שום דבר דחוף. זמן טוב לקדם לקוח רביעי.</p>}
    </div>
  );
}

/* up to 5 next steps right under the big cards (3 on a phone): late first, then who waits for an answer, then today */
function NextActions({ c }) {
  const late = c.dueAll.filter((t) => goalOf(t) < c.today);
  const today = c.dueAll.filter((t) => goalOf(t) === c.today);
  const oneId = c.one?.task?.id;
  const items = [
    ...late.filter((t) => t.id !== oneId).map((t) => ({ k: t.id, t })),
    ...c.replies.slice(0, 3).map((r) => ({ k: r.id, r })),
    ...today.filter((t) => t.id !== oneId).map((t) => ({ k: t.id, t })),
  ].slice(0, 5);
  if (!items.length) return null;
  return (
    <section className="hub-next" aria-labelledby="s-next">
      <h2 id="s-next">הצעדים הבאים</h2>
      <ul className="hub-rows">
        {items.map(({ k, t, r }) => {
          if (r) {
            const preview = String(r.preview || '').replace(/^\[איש קשר\]\s*/, 'שלח איש קשר: ');
            return (
              <Row key={k} main={<><span className="hub-verb">לענות</span><b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b></>} sub={cut(clean(preview), 60)}
                meta={ago(r.last_message_at, c.now)} action={<WaButton phone={r.phone} label="לענות" />}
                details={[['הודעה אחרונה', preview]]} />
            );
          }
          return (
            <TaskRow key={k} t={t} c={c} {...deadlineMeta(t, c.today)}
              details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note]]} />
          );
        })}
      </ul>
    </section>
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
  const hub = useHub();
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
          const preview = String(r.preview || '').replace(/^\[איש קשר\]\s*/, 'שלח איש קשר: ');
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
        {c.collect.map((x) => {
          const n = daysBetween(x.since, c.today);
          const amount = x.amount ? money(x.amount) : x.amount_text;
          const p = c.pending.get(x.id);
          return (
            <Row key={x.id} kb pending={p ? 'done' : undefined} main={x.who}
              meta={p ? <Clock text="נכנס, ממתין לסנכרון" /> : [amount, n != null ? daysWord(n) : null].filter(Boolean).join(' · ')}
              metaTone={!p && n > 14 ? 'late' : undefined}
              action={!p && <>
                <WaButton phone={c.clients.get(x.client_id)?.phone} label="תזכורת" />
                <button type="button" className="hub-act hub-act-main" data-k="x" title="נכנס (X)"
                  onClick={() => hub.act('payment_received', x.id, { client_id: x.client_id, label: cut(x.who), amount_text: amount }, 'סומן שנכנס')}>נכנס ✓</button>
              </>}
              details={[['מאז', fmtShortDate(x.since)], ['הערה', x.note]]} />
          );
        })}
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
  const what = { task_done: 'בוצע', task_postpone: 'דחייה', task_add: 'משימה חדשה', task_irrelevant: 'לא רלוונטי', payment_received: 'תשלום שנכנס' };
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

/* ─── Clients (10.11 redesign) ───
   Active clients as cards you can scan in one look: what's next, what's late, who we wait for,
   the next meeting. The pipeline is one tabbed list (חי / כדור אצלם / מוקפא), not folded groups.
   The drawer has two tabs: tasks and the client's files (opened on demand). */
const PIPE_ORDER = ['חי', 'כדור אצלם', 'מוקפא'];

export function ClientsView() {
  const hub = useHub();
  const c = useComputed();
  const [openId, setOpenId] = useState(null);
  const [pipeTab, setPipeTab] = useState('חי');
  useRowKeys();
  const all = useMemo(() => hub.data?.hub_clients || [], [hub.data]);
  const active = useMemo(() => all.filter((x) => x.stage === 'שוטף').sort((a, b) => a.name.localeCompare(b.name, 'he')), [all]);
  const pipeline = useMemo(() => {
    const rest = all.filter((x) => x.stage !== 'שוטף' && !/נסגר|סגור/.test(x.stage || ''));
    const groups = PIPE_ORDER.map((st) => ({ stage: st, list: rest.filter((x) => (x.stage || '').trim() === st) }));
    const other = rest.filter((x) => !PIPE_ORDER.includes((x.stage || '').trim()));
    if (other.length) groups.push({ stage: 'בלי שלב', list: other });
    for (const g of groups) g.list.sort((a, b) => String(b.file_updated).localeCompare(String(a.file_updated)));
    return groups;
  }, [all]);
  const current = all.find((x) => x.id === openId) || null;

  if (hub.loading) return <div className="hub-skel" style={{ marginTop: 18 }} aria-label="טוען" />;
  if (hub.error || !c) return <p className="hub-err">לא הצלחתי לטעון את הלקוחות. בדוק חיבור ונסה לרענן.</p>;

  const pipeGroup = pipeline.find((g) => g.stage === pipeTab) || pipeline[0];
  return (
    <>
      <div className="hub-block-head"><h2>לקוחות פעילים</h2><span className="n">{active.length}</span></div>
      {active.length ? (
        <ul className="hub-cards">{active.map((cl) => <ClientCard key={cl.id} cl={cl} c={c} onOpen={() => setOpenId(cl.id)} />)}</ul>
      ) : <p className="hub-empty">עוד אין לקוחות פעילים במסך.</p>}

      {pipeline.some((g) => g.list.length) && (
        <section className="hub-pipe-box" aria-labelledby="s-pipe">
          <div className="hub-block-head"><h2 id="s-pipe">צנרת לידים</h2><span className="n">{pipeline.reduce((s, g) => s + g.list.length, 0)}</span></div>
          <div className="hub-seg hub-seg-wide" role="tablist" aria-label="שלב">
            {pipeline.map((g) => (
              <button key={g.stage} type="button" role="tab" aria-selected={pipeGroup.stage === g.stage} onClick={() => setPipeTab(g.stage)}>
                {g.stage} <b>{g.list.length}</b>
              </button>
            ))}
          </div>
          {pipeGroup.list.length ? (
            <ul className="hub-rows">
              {pipeGroup.list.map((cl) => {
                const age = daysBetween(cl.file_updated, c.today);
                const late = c.tasks.filter((t) => t.client_id === cl.id && isOpen(t) && isMine(t) && t.due && t.due < c.today).length;
                return (
                  <li key={cl.id} className="hub-row">
                    <div className="hub-row-line">
                      <button type="button" className="hub-row-btn" onClick={() => setOpenId(cl.id)} aria-haspopup="dialog">
                        <span className="main"><b>{c.clientName(cl.id)}</b>{cl.next_action && <span className="sub"> · {shortTitle(cl.next_action)}</span>}</span>
                      </button>
                      {late > 0 && <span className="meta late">{late} באיחור</span>}
                      {age != null && <span className={`meta${age > 14 ? ' late' : ''}`} title="עדכון אחרון בתיק">{age === 0 ? 'היום' : `לפני ${daysWord(age)}`}</span>}
                      <WaButton phone={cl.phone} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="hub-empty">אין לידים בשלב הזה</p>}
        </section>
      )}
      {current && <ClientDrawer cl={current} c={c} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ClientCard({ cl, c, onOpen }) {
  const pct = cl.tasks_total ? Math.round((cl.tasks_done / cl.tasks_total) * 100) : 0;
  const open = c.tasks.filter((t) => t.client_id === cl.id && isOpen(t));
  const late = open.filter((t) => isMine(t) && t.due && t.due < c.today).length;
  const mineNow = open.filter((t) => isMine(t) && t.due && goalOf(t) <= c.today).length;
  const waitDays = daysBetween(cl.waiting_since, c.today);
  const owed = c.collect.find((x) => x.client_id === cl.id);
  const moneyDays = owed ? daysBetween(owed.since, c.today) : null;
  const tone = late || (moneyDays != null && moneyDays > 14) ? 'late' : mineNow ? 'now' : null;
  return (
    <li>
      <button type="button" className="hub-card" data-tone={tone || undefined} onClick={onOpen} aria-haspopup="dialog">
        <span className="hub-card-head">
          <span className="hub-card-name">{c.clientName(cl.id)}</span>
          {cl.business && <span className="hub-card-biz">{cl.business}</span>}
        </span>
        {cl.next_action && <span className="hub-card-next"><span>הצעד הבא</span>{shortTitle(cl.next_action)}</span>}
        <span className="hub-card-chips">
          {late > 0 && <span className="hub-chip late">{late} באיחור</span>}
          {mineNow > 0 && !late && <span className="hub-chip now">{mineNow} לסיים היום</span>}
          {cl.next_meeting_at && <span className="hub-chip">📅 {fmtDay(cl.next_meeting_at)} {fmtTime(cl.next_meeting_at)}</span>}
          {cl.waiting_on && <span className="hub-chip">⏳ {cut(cl.waiting_on.replace(/^ל/, ''), 24)}{waitDays != null ? ` · ${daysWord(waitDays)}` : ''}</span>}
          {owed && <span className={`hub-chip${moneyDays > 14 ? ' late' : ''}`}>💰 {owed.amount ? `${Number(owed.amount).toLocaleString('he-IL')} ₪` : 'לגבות'}</span>}
        </span>
        <span className="hub-card-progress">
          <span className="hub-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          <span>{cl.tasks_done}/{cl.tasks_total}</span>
          {cl.files?.length ? <span>📎 {cl.files.length}</span> : null}
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
  const name = f.n.replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
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

  return (
    <div className="hub-drawer-wrap" onClick={onClose}>
      <aside className="hub-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="hub-drawer-head">
          <div style={{ minWidth: 0 }}>
            <h2 id="drawer-title">{c.clientName(cl.id)}</h2>
            {cl.business && <p className="hub-client-biz">{cl.business}</p>}
          </div>
          <div className="hub-drawer-links">
            <WaButton phone={cl.phone} label="וואטסאפ" />
            {cl.phone && <a className="hub-act" href={`tel:+${cl.phone}`}>חייג</a>}
          </div>
          <button type="button" className="hub-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>
        {cl.next_action && <p className="hub-drawer-next"><span>הצעד הבא</span>{cl.next_action}</p>}
        <div className="hub-drawer-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'tasks'} onClick={() => setTab('tasks')}>משימות <b>{mine.length + theirs.length + agentTasks.length}</b></button>
          <button type="button" role="tab" aria-selected={tab === 'files'} onClick={() => setTab('files')}>קבצים <b>{files.length}</b></button>
          <button type="button" role="tab" aria-selected={tab === 'info'} onClick={() => setTab('info')}>סיכום</button>
        </div>

        <div className="hub-drawer-body">
          {tab === 'tasks' && <>
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
          </>}

          {tab === 'files' && (
            <div className="hub-drawer-block">
              {files.length ? <>
                <ul className="hub-rows">{files.map((f) => <FileRow key={f.k} f={f} clientId={cl.id} />)}</ul>
                <p className="hub-readonly">הגרסה האחרונה של כל מסמך מהתיקייה (PDF וסרטונים). קובץ עולה לענן רק כשלוחצים "פתח", ונמחק משם אחרי יום.</p>
              </> : <p className="hub-empty">אין עדיין קבצי PDF או סרטונים בתיקייה של הלקוח</p>}
            </div>
          )}

          {tab === 'info' && <>
            {cl.status && <p className="hub-drawer-status"><span>סוכם</span>{cl.status}</p>}
            {cl.payment_status && <p className="hub-drawer-status"><span>תשלום</span>{cl.payment_status}</p>}
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
            <p className="hub-readonly">מה שמסומן כאן נכתב ל-משימות_תיק.md של הלקוח כשהמחשב מסנכרן. שינוי שלב ועריכת זיכרון הלקוח נשארים אצל Claude.</p>
          </>}
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
