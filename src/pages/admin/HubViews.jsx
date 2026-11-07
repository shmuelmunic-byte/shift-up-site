import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

/* Stage 3: "Today" + active client files, read only.
   All hub_* tables are small (tens of rows), so they load once into one shared
   store and every section is computed from it. Fresh data arrives by Realtime
   when the browser can reach supabase.co directly, and by a 2-minute refresh
   plus a refresh on returning to the tab when it can't (kosher filters). */

const STALE_MIN = 15;
const TZ = 'Asia/Jerusalem';
const REFRESH_MS = 120000;
const HUB_TABLES = ['hub_clients', 'hub_tasks', 'hub_events', 'hub_inbox', 'hub_collect', 'hub_goals', 'hub_sync_status'];

/* ─── dates (always Jerusalem time) ─── */
const isoDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const dayNum = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000;
const daysBetween = (fromIso, toIso) => (fromIso && toIso ? Math.round(dayNum(toIso) - dayNum(fromIso)) : null);
const addDays = (iso, n) => new Date((dayNum(iso) + n) * 86400000).toISOString().slice(0, 10);
const fmtTime = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
const fmtDay = (iso) => new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(iso));
const fmtShortDate = (iso) => (iso ? `${+iso.slice(8, 10)}.${+iso.slice(5, 7)}` : '');
const daysWord = (n) => (n === 1 ? 'יום' : `${n} ימים`);
const money = (n) => `${Number(n).toLocaleString('he-IL')} ₪`;
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
    const res = await Promise.all(HUB_TABLES.map((t) => supabase.from(t).select('*')));
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

  return <HubCtx.Provider value={{ ...state, now, reload: load }}>{children}</HubCtx.Provider>;
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
  const has = Array.isArray(children) ? children.length > 0 : !!children;
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

/* one line closed, details on tap */
function Row({ main, sub, meta, metaTone, action, details }) {
  const [open, setOpen] = useState(false);
  const canOpen = details && details.some(([, v]) => v);
  return (
    <li className="hub-row" data-open={open || undefined}>
      <div className="hub-row-line">
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
      {open && canOpen && (
        <dl className="hub-details">
          {details.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>
      )}
    </li>
  );
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

    const calls = d.hub_events.filter((e) => isoDay(new Date(e.starts_at)) === today).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const replies = d.hub_inbox.filter((x) => x.kind === 'reply').sort((a, b) => b.priority - a.priority || String(a.last_message_at).localeCompare(String(b.last_message_at)));
    const reach = d.hub_inbox.filter((x) => x.kind === 'reach_out').sort((a, b) => b.priority - a.priority).slice(0, 5);
    const due = mine.filter((t) => t.due && t.due <= today).sort((a, b) => a.due.localeCompare(b.due));
    const waiting = open.filter((t) => isClientSide(t) && t.since && t.since <= addDays(today, -3)).sort((a, b) => a.since.localeCompare(b.since));
    const collect = d.hub_collect.filter((x) => x.status === 'open').sort((a, b) => String(a.since).localeCompare(String(b.since)));
    const stuck = mine.filter((t) => t.since && !due.includes(t)).sort((a, b) => a.since.localeCompare(b.since))[0] || null;
    const goal = d.hub_goals.find((g) => g.key === 'active_clients') || null;

    /* "the one thing": a call about to start beats everything, then the oldest
       overdue task, then a client/lead waiting for an answer, then today's calls */
    const soonCall = calls.find((e) => { const t = new Date(e.starts_at).getTime(); return t > now - 30 * 60000 && t < now + 90 * 60000; });
    const nextCall = calls.find((e) => new Date(e.starts_at).getTime() > now);
    const hotReply = replies.find((r) => r.priority >= 3);
    let one = null;
    if (soonCall) one = { text: soonCall.title, why: `ביומן ב-${fmtTime(soonCall.starts_at)}`, phone: clients.get(soonCall.client_id)?.phone };
    else if (due[0]) {
      const late = daysBetween(due[0].due, today);
      one = { text: due[0].title, why: [clientName(due[0].client_id), late > 0 ? `באיחור ${daysWord(late)}` : 'להיום'].filter(Boolean).join(' · '), late: late > 0 };
    } else if (hotReply) one = { text: `לענות ל${clientName(hotReply.client_id) || hotReply.contact_name}`, why: hotReply.preview, phone: hotReply.phone };
    else if (nextCall) one = { text: nextCall.title, why: `ביומן ב-${fmtTime(nextCall.starts_at)}`, phone: clients.get(nextCall.client_id)?.phone };
    else if (replies[0]) one = { text: `לענות ל${replies[0].contact_name}`, why: replies[0].preview, phone: replies[0].phone };

    return { now, today, clients, clientName, calls, replies, reach, due, waiting, collect, stuck, goal, one, tasks: d.hub_tasks, events: d.hub_events };
  }, [hub?.data, today, now]);
}

/* ─── Today ─── */
export function TodayView() {
  const hub = useHub();
  const c = useComputed();
  const loading = hub.loading;
  const error = hub.error;
  const L = { loading, error };

  if (!loading && !error && c && !hub.data.hub_clients.length) {
    return <p className="hub-empty" style={{ paddingTop: 18 }}>אין עדיין נתונים במסך. ברגע שסוכן הסנכרון יעלה מהמחשב, כאן יופיע הדבר הכי דחוף להיום.</p>;
  }

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
                <WaButton phone={c.one.phone} label="פתח בוואטסאפ" />
              </div>
            </>
          ) : <p className="hub-one-text" data-empty="true">אין שום דבר דחוף. זמן טוב לקדם לקוח רביעי.</p>}
      </div>

      {c?.goal?.target ? <GoalStrip goal={c.goal} /> : null}

      <Section id="s-calls" title="ביומן היום" count={c?.calls.length} empty="אין שיחות ביומן היום" {...L}>
        {c?.calls.map((e) => {
          const approx = /~/.test(e.when_text || '');
          const hasTime = /\d{1,2}:\d{2}/.test(e.when_text || '');
          const past = new Date(e.starts_at).getTime() < c.now - 45 * 60000;
          return (
            <Row key={e.id}
              main={<><span className="hub-time" data-past={past || undefined}>{hasTime ? `${approx ? '~' : ''}${fmtTime(e.starts_at)}` : 'היום'}</span>{e.title}</>}
              action={<>
                {e.prep_pdf && <a className="hub-act" href={e.prep_pdf} target="_blank" rel="noopener noreferrer">הכנה</a>}
                <WaButton phone={c.clients.get(e.client_id)?.phone} />
              </>}
              details={[['מתי', e.when_text], ['לקוח', c.clientName(e.client_id)]]} />
          );
        })}
      </Section>

      <Section id="s-reply" title="לענות" count={c?.replies.length} empty="אין מה לענות, יפה" {...L}>
        {c?.replies.map((r) => (
          <Row key={r.id}
            main={<b>{c.clientName(r.client_id) || r.contact_name}</b>}
            sub={r.preview}
            meta={ago(r.last_message_at, c.now)}
            action={<WaButton phone={r.phone} />}
            details={[['הודעה אחרונה', r.preview], ['לקוח', r.client_id]]} />
        ))}
      </Section>

      <Section id="s-due" title="באיחור ולהיום" count={c?.due.length} empty="אין משימות באיחור" {...L}>
        {c?.due.map((t) => {
          const late = daysBetween(t.due, c.today);
          return (
            <Row key={t.id}
              main={t.title}
              sub={c.clientName(t.client_id)}
              meta={late > 0 ? `באיחור ${daysWord(late)}` : 'להיום'}
              metaTone={late > 0 ? 'late' : undefined}
              details={[['יעד', t.due_text], ['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['סטטוס', t.status_note], ['פתוחה מאז', fmtShortDate(t.since)]]} />
          );
        })}
      </Section>

      <Section id="s-wait" title="מחכה ללקוח" count={c?.waiting.length} empty="אף לקוח לא תקוע יותר מ-3 ימים" {...L}>
        {c?.waiting.map((t) => (
          <Row key={t.id}
            main={t.title}
            sub={c.clientName(t.client_id)}
            meta={`ממתינה ${daysWord(daysBetween(t.since, c.today))}`}
            action={<WaButton phone={c.clients.get(t.client_id)?.phone} label="תזכורת" />}
            details={[['ממתין ל', t.waiting_on || t.owner], ['יעד', t.due_text], ['סטטוס', t.status_note]]} />
        ))}
      </Section>

      <Section id="s-reach" title="לפנות היום" count={c?.reach.length} empty="אין פניות מומלצות להיום" {...L}>
        {c?.reach.map((r) => (
          <Row key={r.id}
            main={<b>{c.clientName(r.client_id) || r.contact_name}</b>}
            sub={r.preview}
            action={<WaButton phone={r.phone} />} />
        ))}
      </Section>

      <Section id="s-money" title="כסף לגבות" count={c?.collect.length}
        extra={c?.collect.length > 1 ? `סה"כ ${money(c.collect.reduce((s, x) => s + (Number(x.amount) || 0), 0))}` : null}
        empty="אין תשלומים פתוחים" {...L}>
        {c?.collect.map((x) => {
          const n = daysBetween(x.since, c.today);
          return (
            <Row key={x.id}
              main={x.who}
              meta={[x.amount ? money(x.amount) : x.amount_text, n != null ? `${daysWord(n)}` : null].filter(Boolean).join(' · ')}
              metaTone={n > 14 ? 'late' : undefined}
              action={<WaButton phone={c.clients.get(x.client_id)?.phone} />}
              details={[['מאז', fmtShortDate(x.since)], ['הערה', x.note]]} />
          );
        })}
      </Section>

      {c?.stuck && (
        <Section id="s-five" title="5 דקות" {...L}>
          <Row
            main={c.stuck.title}
            sub={c.clientName(c.stuck.client_id)}
            meta={`פתוחה ${daysWord(daysBetween(c.stuck.since, c.today))}`}
            details={[['יעד', c.stuck.due_text], ['ממתין ל', c.stuck.waiting_on], ['סטטוס', c.stuck.status_note]]} />
          <li className="hub-five-hint">המשימה שתקועה הכי הרבה זמן. מה הצעד הכי קטן שאפשר לעשות בה עכשיו?</li>
        </Section>
      )}
    </>
  );
}

function GoalStrip({ goal }) {
  const cur = Number(goal.current) || 0;
  const tgt = Number(goal.target) || 0;
  const pct = Math.min(100, Math.round((cur / tgt) * 100));
  return (
    <div className="hub-goal" role="group" aria-label="יעד">
      <span className="hub-goal-label">{goal.label}</span>
      <span className="hub-bar" aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className="hub-goal-n">{cur} מתוך {tgt}</span>
    </div>
  );
}

/* ─── Active client files ─── */
export function ClientsView() {
  const hub = useHub();
  const c = useComputed();
  const [openId, setOpenId] = useState(null);
  const active = useMemo(() => (hub.data?.hub_clients || []).filter((x) => x.stage === 'שוטף').sort((a, b) => a.name.localeCompare(b.name, 'he')), [hub.data]);
  const current = active.find((x) => x.id === openId) || null;

  return (
    <>
      <Section id="s-clients" title="לקוחות פעילים" count={active.length} loading={hub.loading} error={hub.error}
        empty="עוד אין לקוחות במסך. הם יגיעו מהתיקים במרכז ברגע שסוכן הסנכרון יעלה.">
        {active.map((cl) => <ClientCard key={cl.id} cl={cl} c={c} onOpen={() => setOpenId(cl.id)} />)}
      </Section>
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
  const meetings = c.events.filter((e) => e.client_id === cl.id && new Date(e.starts_at).getTime() >= c.now).sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const taskRow = (t) => {
    const late = t.due ? daysBetween(t.due, c.today) : null;
    return (
      <Row key={t.id} main={t.title}
        meta={t.due_text ? (late > 0 ? `באיחור ${daysWord(late)}` : t.due_text) : null}
        metaTone={late > 0 ? 'late' : undefined}
        details={[['אחראי', t.owner], ['ממתין ל', t.waiting_on], ['פתוחה מאז', fmtShortDate(t.since)], ['סטטוס', t.status_note]]} />
    );
  };

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
              <ul className="hub-rows">{meetings.map((e) => <Row key={e.id} main={e.title} meta={`${fmtDay(e.starts_at)} ${/\d:\d\d/.test(e.when_text || '') ? fmtTime(e.starts_at) : ''}`.trim()} />)}</ul>
            </div>
          )}

          <div className="hub-drawer-block">
            <h3>עליי <span className="n">{mine.length}</span></h3>
            {mine.length ? <ul className="hub-rows">{mine.map(taskRow)}</ul> : <p className="hub-empty">אין משימות פתוחות עליי</p>}
          </div>

          {theirs.length > 0 && (
            <div className="hub-drawer-block">
              <h3>מחכה להם <span className="n">{theirs.length}</span></h3>
              <ul className="hub-rows">{theirs.map(taskRow)}</ul>
            </div>
          )}

          {done.length > 0 && (
            <div className="hub-drawer-block">
              <h3>בוצע לאחרונה</h3>
              <ul className="hub-rows hub-done">{done.map((t) => <Row key={t.id} main={t.title} meta={fmtShortDate(t.done_at)} />)}</ul>
            </div>
          )}

          {cl.payment_status && <p className="hub-drawer-status"><span>תשלום</span>{cl.payment_status}</p>}
          {cl.folder_path && <p className="hub-folder" title="התיקייה במרכז">📁 {cl.folder_path}</p>}
          <p className="hub-readonly">סימון בוצע, הוספה ודחייה יגיעו בשלב הבא. בינתיים העדכונים נעשים בקבצים, דרך Claude.</p>
        </div>
      </aside>
    </div>
  );
}
