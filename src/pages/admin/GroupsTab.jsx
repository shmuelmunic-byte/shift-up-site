// לשונית "קבוצות שירה": כמה פרסומים יצאו לכל קבוצה וכמה אנשים לחצו על הקישור שלה (25.11.2026)
// מקור: tracked_links + link_clicks (פונקציית go) + group_posts (המפרסם המקומי). לחיצות של בוטים (תצוגה מקדימה של וואטסאפ) לא נספרות.
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

const TZ = 'Asia/Jerusalem';
const fmt = (iso) => (iso ? new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '-');
const LINE = { shabbos: 'שבת', events: 'אירועים' };

export default function GroupsTab() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    Promise.all([
      supabase.from('tracked_links').select('code,label,campaign').eq('client_id', 'shira'),
      supabase.from('link_clicks').select('code,ts,is_bot').gte('ts', since).limit(10000),
      supabase.from('group_posts').select('code,ad_id,posted_at,status').gte('posted_at', since).limit(5000),
    ]).then(([l, c, p]) => {
      if (!alive) return;
      const e = l.error || c.error || p.error;
      if (e) { setErr(e.message); return; }
      setErr(null); setData({ links: l.data, clicks: c.data, posts: p.data });
    });
    return () => { alive = false; };
  }, [days]);

  const rows = useMemo(() => {
    if (!data) return [];
    const by = {};
    for (const l of data.links) {
      const g = l.code.split('-')[0];
      by[g] ||= { g, label: l.label, posts: 0, clicks: 0, bots: 0, last: null, lines: {} };
      by[g].lines[l.campaign] ||= { posts: 0, clicks: 0 };
    }
    const campOf = Object.fromEntries(data.links.map(l => [l.code, l.campaign]));
    for (const c of data.clicks) {
      const r = by[c.code.split('-')[0]]; if (!r) continue;
      if (c.is_bot) { r.bots++; continue; }
      r.clicks++; r.lines[campOf[c.code]].clicks++;
    }
    for (const p of data.posts) {
      if (p.status !== 'sent' || !p.code) continue;
      const r = by[p.code.split('-')[0]]; if (!r) continue;
      r.posts++; if (campOf[p.code]) r.lines[campOf[p.code]].posts++;
      if (!r.last || p.posted_at > r.last) r.last = p.posted_at;
    }
    return Object.values(by).sort((a, b) => b.clicks - a.clicks || b.posts - a.posts);
  }, [data]);

  const tot = rows.reduce((a, r) => ({ posts: a.posts + r.posts, clicks: a.clicks + r.clicks }), { posts: 0, clicks: 0 });
  const cell = { padding: '8px 10px', borderBottom: '1px solid var(--border, rgba(127,127,127,.2))', textAlign: 'right', whiteSpace: 'nowrap' };

  return (
    <div>
      <p style={{ margin: '0 0 14px', color: 'var(--text-secondary)' }}>
        כל קבוצה מקבלת קישור משלה. לחיצה = מישהו פתח צ'אט עם שירה מהמודעה של הקבוצה הזו. ההודעה שמגיעה לשירה זהה מכל הקבוצות.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[7, 30].map(d => (
          <button key={d} className="admin-tab" data-active={days === d} onClick={() => setDays(d)}>{d} ימים</button>
        ))}
      </div>
      {err && <p style={{ color: 'var(--danger, #c33)' }}>שגיאה בטעינה: {err}</p>}
      {!data && !err && <div className="hub-skel" />}
      {data && (
        <>
          <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{tot.posts} פרסומים · {tot.clicks} לחיצות ב-{days} ימים</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={cell}>קבוצה</th><th style={cell}>פרסומים</th><th style={cell}>לחיצות</th>
                  <th style={cell}>לחיצות לפרסום</th><th style={cell}>שבת / אירועים</th><th style={cell}>פרסום אחרון</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.g}>
                    <td style={cell}>{r.label} <span style={{ opacity: .55 }}>({r.g.toUpperCase()})</span></td>
                    <td style={cell}>{r.posts}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{r.clicks}</td>
                    <td style={cell}>{r.posts ? (r.clicks / r.posts).toFixed(1) : '-'}</td>
                    <td style={cell}>{Object.entries(r.lines).map(([k, v]) => `${LINE[k] || k} ${v.clicks}`).join(' · ')}</td>
                    <td style={cell}>{fmt(r.last)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
