import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

/* Stage 1: the screens read the hub_* mirror tables (empty until the local
   sync agent runs in stage 2). Every section has loading, empty and error. */

const STALE_MIN = 15;

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function HebrewDates() {
  const now = new Date();
  let heb = '';
  try {
    heb = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long' }).format(now);
  } catch { /* old browsers: show only the civil date */ }
  const civ = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
  return <span className="adm-dates">{civ}{heb ? ` · ${heb}` : ''}</span>;
}

export function SyncBar() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    const load = () =>
      supabase.from('hub_sync_status').select('agent,last_seen_at').order('last_seen_at', { ascending: false }).limit(1)
        .then(({ data, error }) => {
          if (!alive) return;
          const row = data?.[0];
          const min = row?.last_seen_at ? Math.round((Date.now() - new Date(row.last_seen_at).getTime()) / 60000) : null;
          setState({ loading: false, error, row, min });
        });
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (state.loading) return <span className="adm-sync"><span className="adm-dot" />בודק סנכרון</span>;
  if (state.error) return <span className="adm-sync" data-state="stale"><span className="adm-dot" data-state="stale" />אין חיבור לנתונים</span>;
  if (!state.row?.last_seen_at) {
    return <span className="adm-sync" data-state="stale"><span className="adm-dot" data-state="stale" />סוכן הסנכרון עוד לא רץ</span>;
  }
  const { min } = state;
  const stale = min > STALE_MIN;
  const ago = min < 1 ? 'עכשיו' : min < 60 ? `לפני ${min} דק'` : `לפני ${Math.round(min / 60)} שע'`;
  return (
    <span className="adm-sync" data-state={stale ? 'stale' : 'ok'}>
      <span className="adm-dot" data-state={stale ? 'stale' : 'ok'} />
      {stale ? `הסנכרון לא דיווח ${ago.replace('לפני ', '')}` : `עודכן ${ago}`}
    </span>
  );
}

function useQuery(build, deps) {
  const [s, setS] = useState({ loading: true, rows: [] });
  useEffect(() => {
    let alive = true;
    build().then(({ data, error }) => { if (alive) setS({ loading: false, error, rows: data || [] }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return s;
}

function Section({ title, q, empty, render }) {
  return (
    <section className="hub-sec" aria-label={title}>
      <div className="hub-sec-head">
        <h2>{title}</h2>
        {!q.loading && !q.error && q.rows.length > 0 && <span className="n">{q.rows.length}</span>}
      </div>
      {q.loading ? <div className="hub-skel" aria-label="טוען" />
        : q.error ? <p className="hub-err">לא הצלחתי לטעון את זה עכשיו</p>
        : q.rows.length === 0 ? <p className="hub-empty">{empty}</p>
        : <ul className="hub-rows">{q.rows.map(render)}</ul>}
    </section>
  );
}

const fmtTime = (iso) => new Intl.DateTimeFormat('he-IL', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));

export function TodayView() {
  const day = todayISO();
  const start = `${day}T00:00:00`;
  const end = `${day}T23:59:59`;
  const [threeDaysAgo] = useState(() => new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10));

  const calls   = useQuery(() => supabase.from('hub_events').select('id,title,kind,starts_at').gte('starts_at', start).lte('starts_at', end).order('starts_at'), [day]);
  const replies = useQuery(() => supabase.from('hub_inbox').select('id,contact_name,preview,last_message_at').eq('kind', 'reply').order('priority', { ascending: false }).order('last_message_at').limit(20), []);
  const due     = useQuery(() => supabase.from('hub_tasks').select('id,title,due,client_id').eq('status', 'open').lte('due', day).order('due').limit(30), [day]);
  const waiting = useQuery(() => supabase.from('hub_tasks').select('id,title,since,waiting_on,client_id').eq('status', 'open').ilike('waiting_on', '%לקוח%').lte('since', threeDaysAgo).order('since').limit(20), [day]);
  const reach   = useQuery(() => supabase.from('hub_inbox').select('id,contact_name,preview').eq('kind', 'reach_out').order('priority', { ascending: false }).limit(5), []);
  const money   = useQuery(() => supabase.from('hub_collect').select('id,who,amount,since').eq('status', 'open').order('since'), []);

  const first = due.rows[0] || calls.rows[0] || replies.rows[0];
  const anyLoading = due.loading || calls.loading || replies.loading;
  const oneText = first ? (first.title || `לענות ל${first.contact_name}`) : null;

  return (
    <>
      <div className="hub-one">
        <div className="hub-one-label">הדבר האחד</div>
        {anyLoading ? <div className="hub-skel" style={{ height: 20, width: '70%' }} />
          : oneText ? <p className="hub-one-text">{oneText}</p>
          : <p className="hub-one-text" data-empty="true">אין עדיין נתונים במסך. ברגע שסוכן הסנכרון יעלה, כאן יופיע הדבר הכי דחוף להיום.</p>}
      </div>

      <Section title="שיחות היום" q={calls} empty="אין שיחות ביומן היום"
        render={(r) => <li key={r.id} className="hub-row"><span className="meta">{fmtTime(r.starts_at)}</span><span className="main">{r.title}</span></li>} />

      <Section title="לענות" q={replies} empty="אין מה לענות, יפה"
        render={(r) => <li key={r.id} className="hub-row"><span className="main"><b>{r.contact_name}</b> {r.preview}</span></li>} />

      <Section title="באיחור ולהיום" q={due} empty="אין משימות באיחור"
        render={(r) => {
          const late = daysSince(r.due);
          return <li key={r.id} className="hub-row"><span className="main">{r.title}</span><span className={`meta${late > 0 ? ' late' : ''}`}>{late > 0 ? `באיחור ${late} ימים` : 'להיום'}</span></li>;
        }} />

      <Section title="מחכה ללקוח" q={waiting} empty="אף לקוח לא תקוע אצלו יותר מ-3 ימים"
        render={(r) => <li key={r.id} className="hub-row"><span className="main">{r.title}</span><span className="meta">ממתינה {daysSince(r.since)} ימים</span></li>} />

      <Section title="לפנות היום" q={reach} empty="אין פניות מומלצות להיום"
        render={(r) => <li key={r.id} className="hub-row"><span className="main"><b>{r.contact_name}</b> {r.preview}</span></li>} />

      <Section title="כסף לגבות" q={money} empty="אין תשלומים פתוחים"
        render={(r) => <li key={r.id} className="hub-row"><span className="main">{r.who}</span><span className="meta">{r.amount ? `${Number(r.amount).toLocaleString('he-IL')} ₪` : ''}{r.since ? ` · מאז ${daysSince(r.since)} ימים` : ''}</span></li>} />
    </>
  );
}

export function ClientsView() {
  const q = useQuery(() => supabase.from('hub_clients').select('id,name,business,next_action,tasks_done,tasks_total,waiting_on').ilike('stage', '%פעיל%').order('name'), []);
  return (
    <Section title="לקוחות פעילים" q={q} empty="עוד אין לקוחות במסך. הם יגיעו מהתיקים במרכז ברגע שסוכן הסנכרון יעלה."
      render={(c) => (
        <li key={c.id} className="hub-row">
          <span className="main"><b>{c.name}</b>{c.business ? ` · ${c.business}` : ''}{c.next_action ? ` · ${c.next_action}` : ''}</span>
          <span className="meta">{c.tasks_done}/{c.tasks_total}</span>
        </li>
      )} />
  );
}
