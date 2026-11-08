import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
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
const money = (n) => `${Number(n).toLocaleString('he-IL')} ₪`;
/* phone numbers stay out of titles on screen (the WhatsApp button already has them) */
const PHONE_RE = /(\s*ל-)?\s*\(?\b0\d{1,2}-?\d{3}-?\d{4}\b\)?/g;
const clean = (s) => (s ? String(s).replace(PHONE_RE, '').replace(/\s+,/g, ',').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim() : s);
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

/* ─── who owns a task ─── */
const isClientSide = (t) => /^(לקוח|ליד)/.test(t.owner || '') || t.status === 'waiting';
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
  const [panel, setPanel] = useState(null); // null | 'postpone' | 'drop'
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const p = c.pending.get(t.id);
  const short = cut(clean(t.title));
  // agency agent in charge ("🤖 קופירייטר" in the owner column) shows as a tag on the line itself
  const agent = /^🤖/.test(t.owner || '') ? t.owner.replace(/^🤖\s*/, '') : null;
  const title = main || (agent ? <><span className="hub-agent" title="הסוכן שאחראי על המשימה">🤖 {agent}</span>{clean(t.title)}</> : clean(t.title));
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

  if (p) {
    const isDone = p.kind === 'task_done' || p.kind === 'task_irrelevant';
    const text = p.kind === 'task_done' ? 'בוצע, ממתין לסנכרון'
      : p.kind === 'task_irrelevant' ? 'לא רלוונטי, ממתין לסנכרון'
      : `נדחה ל-${fmtShortDate(p.payload?.due)}`;
    return (
      <Row kb main={title} sub={noClient ? null : c.clientName(t.client_id)} pending={isDone ? 'done' : 'moved'}
        lead={<span className="hub-check" data-on={isDone || undefined} aria-hidden="true" />}
        meta={<Clock text={text} />}
        details={p.kind === 'task_irrelevant' ? [...(details || []), ['למה לא רלוונטי', p.payload?.reason]] : details} />
    );
  }

  const escClose = (e) => { if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.closest('.hub-row')?.focus(); setPanel(null); } };

  const next = nextWorkday(c.today);
  const week = addDays(c.today, 7);
  return (
    <Row kb main={title} sub={noClient ? null : c.clientName(t.client_id)} meta={meta} metaTone={metaTone} details={details}
      lead={<button type="button" className="hub-check" data-k="x" aria-label={`סמן בוצע: ${short}`} title="בוצע (X)"
        onClick={() => hub.act('task_done', t.id, { client_id: t.client_id, label: short }, 'סומן בוצע')} />}
      action={<>
        {extra}
        <button type="button" className="hub-act" data-k="d" aria-expanded={panel === 'postpone'} onClick={() => setPanel((o) => (o === 'postpone' ? null : 'postpone'))} title="דחה (D)">דחה</button>
        <button type="button" className="hub-act hub-act-quiet" data-k="n" aria-expanded={panel === 'drop'} onClick={() => setPanel((o) => (o === 'drop' ? null : 'drop'))} title="לא רלוונטי (N)">לא רלוונטי</button>
      </>}
      below={panel === 'drop' ? (
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
    const open = d.hub_tasks.filter((t) => isOpen(t) && !quiet(t));
    const mine = open.filter((t) => !isClientSide(t));

    const calls = d.hub_events.filter((e) => e.starts_at && isoDay(new Date(e.starts_at)) === today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const timed = calls.filter(hasTime); // "about to start" only for an item with a real hour, not the 09:00 placeholder
    const replies = d.hub_inbox.filter((x) => x.kind === 'reply').sort((a, b) => b.priority - a.priority || String(a.last_message_at).localeCompare(String(b.last_message_at)));
    const reach = d.hub_inbox.filter((x) => x.kind === 'reach_out').sort((a, b) => b.priority - a.priority).slice(0, 5);
    const dueAll = mine.filter((t) => t.due && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
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
      const late = daysBetween(due[0].due, today);
      one = { text: clean(due[0].title), why: [clientName(due[0].client_id), late > 0 ? `באיחור ${daysWord(late)}` : 'להיום'].filter(Boolean).join(' · '), late: late > 0, task: due[0] };
    } else if (hotReply) one = { text: `לענות ל${clientName(hotReply.client_id) || fmtPhone(hotReply.contact_name)}`, why: hotReply.preview, phone: hotReply.phone };
    else if (nextCall) one = callOne(nextCall);
    else if (replies[0]) one = { text: `לענות ל${fmtPhone(replies[0].contact_name)}`, why: replies[0].preview, phone: replies[0].phone };

    /* queued actions: pending ones overlay their row, failed ones are listed on top */
    const acts = d.hub_actions || [];
    const pending = new Map(acts.filter((a) => a.status === 'pending' && a.target_id).map((a) => [a.target_id, a]));
    const added = acts.filter((a) => a.status === 'pending' && a.kind === 'task_add');
    const failed = acts.filter((a) => a.status === 'failed' && now - new Date(a.created_at).getTime() < 2 * 86400000);

    return { now, today, clients, clientName, calls, linked, replies, reach, due, waiting, collect, stuck, goal, week, replyMin, upcoming, one, tasks: d.hub_tasks, events: d.hub_events, pending, added, failed };
  }, [hub?.data, today, now]);
}

/* ─── Today ─── */
export function TodayView() {
  const hub = useHub();
  const c = useComputed();
  const loading = hub.loading;
  const error = hub.error;
  const L = { loading, error };
  const [showAllWait, setShowAllWait] = useState(false);
  useRowKeys();

  if (!loading && !error && c && !hub.data.hub_clients.length) {
    return <p className="hub-empty" style={{ paddingTop: 18 }}>אין עדיין נתונים במסך. ברגע שסוכן הסנכרון יעלה מהמחשב, כאן יופיע הדבר הכי דחוף להיום.</p>;
  }

  const waitShown = showAllWait ? c?.waiting : c?.waiting.slice(0, WAIT_LIMIT);
  const waitMore = (c?.waiting.length || 0) - WAIT_LIMIT;

  return (
    <>
      <div className="hub-one">
        <div className="hub-one-label">הדבר האחד</div>
        {loading ? <div className="hub-skel" style={{ height: 22, width: '70%' }} />
          : error ? <p className="hub-err">לא הצלחתי לטעון את הנתונים. בדוק חיבור ונסה לרענן.</p>
          : c.one ? (
            <>
              <p className="hub-one-text">{c.one.text}</p>
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

      {c?.failed.length ? <FailedNotice failed={c.failed} /> : null}

      {c?.goal?.target ? <GoalStrip goal={c.goal} /> : null}
      {c?.week.length ? <WeekNumbers week={c.week} replyMin={c.replyMin} /> : null}

      <Section id="s-calls" title="ביומן היום" count={c?.calls.length} empty="אין שיחות ביומן היום" {...L}>
        {c?.calls.map((e) => {
          const approx = /~/.test(e.when_text || '');
          const withTime = hasTime(e);
          const past = withTime && new Date(e.starts_at).getTime() < c.now - 45 * 60000;
          const main = <><span className="hub-time" data-past={past || undefined}>{withTime ? `${approx ? '~' : ''}${fmtTime(e.starts_at)}` : 'היום'}</span>{clean(e.title)}</>;
          const acts = <>
            {e.prep_pdf && <PrepButton path={e.prep_pdf} />}
            {isCall(e) && <WaButton phone={c.clients.get(e.client_id)?.phone} />}
          </>;
          const t = c.linked.get(e.id);
          if (t) {
            return (
              <TaskRow key={e.id} t={t} c={c} main={main} extra={acts}
                details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)], ['משימה', clean(t.title)], ['סטטוס', t.status_note]]} />
            );
          }
          return (
            <Row key={e.id} main={main} action={acts}
              lead={c.linked.size ? <span className="hub-check-gap" aria-hidden="true" /> : null}
              details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)]]} />
          );
        })}
      </Section>

      <Section id="s-reply" title="לענות" count={c?.replies.length} empty="אין מה לענות, יפה" {...L}>
        {c?.replies.map((r) => {
          const old = (c.now - new Date(r.last_message_at).getTime()) > 2 * 86400000;
          const preview = String(r.preview || '').replace(/^\[איש קשר\]\s*/, 'שלח איש קשר: ');
          return (
            <Row key={r.id}
              main={<b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b>}
              sub={clean(preview)}
              meta={ago(r.last_message_at, c.now)} metaTone={old ? 'late' : undefined}
              action={<WaButton phone={r.phone} />}
              details={[['הודעה אחרונה', preview], ['טלפון', fmtPhone(r.phone || r.contact_name)], ['לקוח', r.client_id]]} />
          );
        })}
      </Section>

      <Section id="s-money" title="כסף לגבות" count={c?.collect.length}
        extra={c?.collect.length > 1 ? `סה"כ ${money(c.collect.reduce((s, x) => s + (Number(x.amount) || 0), 0))}` : null}
        empty="אין תשלומים פתוחים" {...L}>
        {c?.collect.map((x) => {
          const n = daysBetween(x.since, c.today);
          const amount = x.amount ? money(x.amount) : x.amount_text;
          const p = c.pending.get(x.id);
          return (
            <Row key={x.id} kb pending={p ? 'done' : undefined}
              main={x.who}
              meta={p ? <Clock text="נכנס, ממתין לסנכרון" /> : [amount, n != null ? `${daysWord(n)}` : null].filter(Boolean).join(' · ')}
              metaTone={!p && n > 14 ? 'late' : undefined}
              action={!p && <>
                <WaButton phone={c.clients.get(x.client_id)?.phone} />
                <button type="button" className="hub-act" data-k="x" title="נכנס (X)"
                  onClick={() => hub.act('payment_received', x.id, { client_id: x.client_id, label: cut(x.who), amount_text: amount }, 'סומן שנכנס')}>נכנס ✓</button>
              </>}
              details={[['מאז', fmtShortDate(x.since)], ['הערה', x.note]]} />
          );
        })}
      </Section>

      <Section id="s-due" title="באיחור ולהיום" count={c?.due.length} empty="אין משימות באיחור" {...L}>
        {c?.due.map((t) => {
          const late = daysBetween(t.due, c.today);
          return (
            <TaskRow key={t.id} t={t} c={c}
              meta={late > 0 ? `באיחור ${daysWord(late)}` : 'להיום'}
              metaTone={late > 0 ? 'late' : undefined}
              details={[['יעד', t.due_text], ['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note], ['פתוחה מאז', fmtShortDate(t.since)]]} />
          );
        })}
      </Section>

      <Section id="s-wait" title="מחכה ללקוח" count={c?.waiting.length} empty="אף לקוח לא תקוע יותר מ-3 ימים" {...L}>
        {waitShown?.map((t) => (
          <TaskRow key={t.id} t={t} c={c}
            meta={`ממתינה ${daysWord(daysBetween(t.since, c.today))}`}
            extra={<WaButton phone={c.clients.get(t.client_id)?.phone} label="תזכורת" />}
            details={[['ממתין ל', t.waiting_on || t.owner], ['יעד', t.due_text], ['סטטוס', t.status_note]]} />
        ))}
        {waitMore > 0 && (
          <li className="hub-more">
            <button type="button" className="hub-more-btn" aria-expanded={showAllWait} onClick={() => setShowAllWait((v) => !v)}>
              {showAllWait ? 'להציג פחות' : `עוד ${waitMore} שמחכים`}
            </button>
          </li>
        )}
      </Section>

      <Section id="s-reach" title="לפנות היום" count={c?.reach.length} empty="אין פניות מומלצות להיום" {...L}>
        {c?.reach.map((r) => (
          <Row key={r.id}
            main={<b>{c.clientName(r.client_id) || fmtPhone(r.contact_name)}</b>}
            sub={clean(r.preview)}
            action={<WaButton phone={r.phone} />} />
        ))}
      </Section>

      <Section id="s-week" title="השבוע ביומן" count={c?.upcoming.length} empty="אין מועדים בשבוע הקרוב" {...L}>
        {c?.upcoming.map((e) => (
          <Row key={e.id}
            main={<><span className="hub-time hub-time-day"><span>{fmtDay(e.starts_at)}</span><span className="hub-time-h">{hasTime(e) ? fmtTime(e.starts_at) : ''}</span></span>{clean(e.title)}</>}
            action={<>
              {e.prep_pdf && <PrepButton path={e.prep_pdf} />}
              {isCall(e) && <WaButton phone={c.clients.get(e.client_id)?.phone} />}
            </>}
            details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)]]} />
        ))}
      </Section>

      {c?.stuck && (
        <Section id="s-five" title="5 דקות" {...L}>
          <TaskRow t={c.stuck} c={c}
            meta={`פתוחה ${daysWord(daysBetween(c.stuck.since, c.today))}`}
            details={[['יעד', c.stuck.due_text], ['ממתין ל', c.stuck.waiting_on], ['סטטוס', c.stuck.status_note]]} />
          <li className="hub-five-hint">המשימה שתקועה הכי הרבה זמן. מה הצעד הכי קטן שאפשר לעשות בה עכשיו?</li>
          <li><FiveMinTask t={c.stuck} c={c} /></li>
        </Section>
      )}

      <p className="hub-keys">מקשים: <kbd>J</kbd> <kbd>K</kbd> לזוז · <kbd>X</kbd> בוצע · <kbd>D</kbd> דחה · <kbd>N</kbd> לא רלוונטי · <kbd>Enter</kbd> פרטים</p>
    </>
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

/* ─── Active client files ─── */
export function ClientsView() {
  const hub = useHub();
  const c = useComputed();
  const [openId, setOpenId] = useState(null);
  useRowKeys();
  const active = useMemo(() => (hub.data?.hub_clients || []).filter((x) => x.stage === 'שוטף').sort((a, b) => a.name.localeCompare(b.name, 'he')), [hub.data]);
  /* the lead pipeline: everything that isn't an active client, grouped by stage, closed by default */
  const pipeline = useMemo(() => {
    const rest = (hub.data?.hub_clients || []).filter((x) => x.stage !== 'שוטף' && !/נסגר|סגור/.test(x.stage || ''));
    const order = ['חי', 'כדור אצלם', 'מוקפא'];
    const groups = order.map((st) => ({ stage: st, list: rest.filter((x) => (x.stage || '').trim() === st) }));
    const other = rest.filter((x) => !order.includes((x.stage || '').trim()));
    if (other.length) groups.push({ stage: 'בלי שלב', list: other });
    for (const g of groups) g.list.sort((a, b) => String(b.file_updated).localeCompare(String(a.file_updated)));
    return groups.filter((g) => g.list.length);
  }, [hub.data]);
  const current = (hub.data?.hub_clients || []).find((x) => x.id === openId) || null;

  return (
    <>
      <Section id="s-clients" title="לקוחות פעילים" count={active.length} loading={hub.loading} error={hub.error}
        empty="עוד אין לקוחות במסך. הם יגיעו מהתיקים במרכז ברגע שסוכן הסנכרון יעלה.">
        {active.map((cl) => <ClientCard key={cl.id} cl={cl} c={c} onOpen={() => setOpenId(cl.id)} />)}
      </Section>
      {!hub.loading && !hub.error && pipeline.length > 0 && (
        <section className="hub-sec" aria-labelledby="s-pipe">
          <div className="hub-sec-head">
            <h2 id="s-pipe">צנרת לידים</h2>
            <span className="n">{pipeline.reduce((s, g) => s + g.list.length, 0)}</span>
          </div>
          {pipeline.map((g) => (
            <details key={g.stage} className="hub-pipe">
              <summary><span>{g.stage}</span><span className="n">{g.list.length}</span></summary>
              <ul className="hub-rows">
                {g.list.map((cl) => {
                  const age = daysBetween(cl.file_updated, c.today);
                  return (
                    <li key={cl.id} className="hub-row">
                      <div className="hub-row-line">
                        <button type="button" className="hub-row-btn" onClick={() => setOpenId(cl.id)} aria-haspopup="dialog">
                          <span className="main"><b>{c.clientName(cl.id)}</b>{cl.next_action && <span className="sub"> · {cl.next_action}</span>}</span>
                        </button>
                        {age != null && <span className={`meta${age > 14 ? ' late' : ''}`}>{age === 0 ? 'היום' : `לפני ${daysWord(age)}`}</span>}
                        <WaButton phone={cl.phone} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </section>
      )}
      {current && <ClientDrawer cl={current} c={c} onClose={() => setOpenId(null)} />}
    </>
  );
}

function ClientCard({ cl, c, onOpen }) {
  const pct = cl.tasks_total ? Math.round((cl.tasks_done / cl.tasks_total) * 100) : 0;
  const waitDays = daysBetween(cl.waiting_since, c.today);
  const late = c.tasks.filter((t) => t.client_id === cl.id && isOpen(t) && !isClientSide(t) && t.due && t.due < c.today).length;
  return (
    <li className="hub-client">
      <button type="button" className="hub-client-btn" onClick={onOpen} aria-haspopup="dialog">
        <div className="hub-client-head">
          <span className="hub-client-name">{c.clientName(cl.id)}</span>
          {cl.business && <span className="hub-client-biz">{cl.business}</span>}
        </div>
        <div className="hub-client-progress">
          <span className="hub-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
          <span className="hub-client-n">{cl.tasks_done}/{cl.tasks_total} משימות</span>
          {late > 0 && <span className="late">{late} באיחור</span>}
        </div>
        {cl.next_action && <p className="hub-client-next"><span>הצעד הבא</span>{cl.next_action}</p>}
        <div className="hub-client-facts">
          {cl.waiting_on && <span>ממתין ל{cl.waiting_on.replace(/^ל/, '')}{waitDays != null ? ` · ${daysWord(waitDays)}` : ''}</span>}
          {cl.next_meeting_at && <span>פגישה {fmtDay(cl.next_meeting_at)} {fmtTime(cl.next_meeting_at)}</span>}
          {cl.payment_status && <span className="late">💰 {cl.payment_status}</span>}
        </div>
      </button>
    </li>
  );
}

function ClientDrawer({ cl, c, onClose }) {
  const ref = useRef(null);
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
  const mine = open.filter((t) => !isClientSide(t));
  const theirs = open.filter(isClientSide);
  const done = all.filter((t) => t.status === 'done').sort((a, b) => String(b.done_at).localeCompare(String(a.done_at))).slice(0, 6);
  const meetings = c.events.filter((e) => e.client_id === cl.id && e.starts_at
    && (hasTime(e) ? new Date(e.starts_at).getTime() >= c.now - 60 * 60000 : isoDay(new Date(e.starts_at)) >= c.today))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const undated = c.events.filter((e) => e.client_id === cl.id && !e.starts_at);

  const taskRow = (t) => {
    const late = t.due ? daysBetween(t.due, c.today) : null;
    return (
      <TaskRow key={t.id} t={t} c={c} noClient
        meta={t.due_text ? (late > 0 ? `באיחור ${daysWord(late)}` : t.due_text) : null}
        metaTone={late > 0 ? 'late' : undefined}
        details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['פתוחה מאז', fmtShortDate(t.since)], ['סטטוס', t.status_note]]} />
    );
  };
  /* tasks added here that the agent hasn't written yet */
  const newRows = (side) => c.added
    .filter((a) => a.payload?.client_id === cl.id && (a.payload?.owner === 'לקוח') === (side === 'theirs'))
    .map((a) => <Row key={a.id} main={a.payload.title} pending="new" meta={<Clock />} />);
  const mineNew = newRows('mine');
  const theirsNew = newRows('theirs');

  return (
    <div className="hub-drawer-wrap" onClick={onClose}>
      <aside className="hub-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="hub-drawer-head">
          <div>
            <h2 id="drawer-title">{c.clientName(cl.id)}</h2>
            {cl.business && <p className="hub-client-biz">{cl.business}</p>}
          </div>
          <button type="button" className="hub-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>

        <div className="hub-drawer-body">
          {cl.next_action && <p className="hub-client-next"><span>הצעד הבא</span>{cl.next_action}</p>}
          {cl.status && <p className="hub-drawer-status"><span>סוכם</span>{cl.status}</p>}

          <div className="hub-drawer-links">
            <WaButton phone={cl.phone} label="פתח בוואטסאפ" />
            {cl.phone && <a className="hub-act" href={`tel:+${cl.phone}`}>חייג</a>}
          </div>

          {meetings.length > 0 && (
            <div className="hub-drawer-block">
              <h3>מועדים</h3>
              <ul className="hub-rows">{meetings.map((e) => <Row key={e.id} main={e.title} meta={`${fmtDay(e.starts_at)} ${hasTime(e) ? fmtTime(e.starts_at) : ''}`.trim()}
                action={e.prep_pdf && <PrepButton path={e.prep_pdf} />} details={[['מתי', e.when_text]]} />)}</ul>
            </div>
          )}

          {undated.length > 0 && (
            <div className="hub-drawer-block">
              <h3>מועדים בלי תאריך <span className="n">{undated.length}</span></h3>
              <ul className="hub-rows">{undated.map((e) => <Row key={e.id} main={e.title} sub={e.when_text} details={[['מתי', e.when_text]]} />)}</ul>
            </div>
          )}

          <div className="hub-drawer-block">
            <h3>עליי <span className="n">{mine.length + mineNew.length}</span></h3>
            {mine.length + mineNew.length ? <ul className="hub-rows">{mine.map(taskRow)}{mineNew}</ul> : <p className="hub-empty">אין משימות פתוחות עליי</p>}
          </div>

          {theirs.length + theirsNew.length > 0 && (
            <div className="hub-drawer-block">
              <h3>מחכה להם <span className="n">{theirs.length + theirsNew.length}</span></h3>
              <ul className="hub-rows">{theirs.map(taskRow)}{theirsNew}</ul>
            </div>
          )}

          <AddTask clientId={cl.id} today={c.today} />

          {done.length > 0 && (
            <div className="hub-drawer-block">
              <h3>בוצע לאחרונה</h3>
              <ul className="hub-rows hub-done">{done.map((t) => <Row key={t.id} main={t.title} meta={fmtShortDate(t.done_at)} />)}</ul>
            </div>
          )}

          {cl.payment_status && <p className="hub-drawer-status"><span>תשלום</span>{cl.payment_status}</p>}
          {cl.folder_path && <p className="hub-folder" title="התיקייה במרכז">📁 {cl.folder_path}</p>}
          <p className="hub-readonly">מה שמסומן כאן נכתב ל-משימות_תיק.md של הלקוח כשהמחשב מסנכרן (תוך פחות מדקה כשהוא דולק). שינוי שלב ועריכת זיכרון הלקוח נשארים אצל Claude.</p>
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
