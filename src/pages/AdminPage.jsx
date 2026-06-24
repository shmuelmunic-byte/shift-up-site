import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Cursor from '../components/Cursor';

// ─── ICONS ──────────────────────────────────────────────────────────────────

function IconPlus({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconEdit({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconTrash({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconChevronUp({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
}
function IconChevronDown({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconX({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function IconCheck({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconLogout({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function IconLink({ size = 15 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

// ─── TOAST ──────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const isErr = type === 'error';
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 20px', borderRadius: 12,
      background: isErr ? 'oklch(0.15 0.02 25)' : 'oklch(0.13 0.02 145)',
      border: `1.5px solid ${isErr ? 'oklch(0.65 0.22 25 / 0.5)' : 'oklch(0.78 0.20 145 / 0.4)'}`,
      boxShadow: '0 8px 40px oklch(0 0 0 / 0.5)',
      color: isErr ? 'oklch(0.80 0.18 25)' : 'var(--brand-prime)',
      fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
      animation: 'ig-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      {isErr ? <IconX size={15} /> : <IconCheck size={15} />}
      {msg}
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const S = {
  input: {
    width: '100%', minHeight: 44, borderRadius: 10,
    border: '1.5px solid oklch(0.97 0.005 240 / 0.12)',
    background: 'oklch(0.08 0.01 240 / 0.8)',
    color: 'var(--text-primary)', padding: '0 14px',
    fontFamily: "'Heebo', sans-serif", fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  label: {
    display: 'block', fontSize: '0.75rem', fontWeight: 700,
    color: 'var(--text-muted)', letterSpacing: '0.06em',
    textTransform: 'uppercase', marginBottom: 6,
  },
  btn: (variant = 'ghost') => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 7, padding: '8px 16px', borderRadius: 10, border: 'none',
    fontFamily: "'Heebo', sans-serif", fontWeight: 700, fontSize: '0.85rem',
    cursor: 'pointer', transition: 'all 0.18s ease',
    ...(variant === 'primary' ? {
      background: 'var(--brand-prime)', color: 'oklch(0.08 0.01 240)',
      boxShadow: '0 0 24px oklch(0.78 0.20 145 / 0.3)',
    } : variant === 'danger' ? {
      background: 'oklch(0.65 0.22 25 / 0.12)',
      color: 'oklch(0.75 0.18 25)',
      border: '1px solid oklch(0.65 0.22 25 / 0.25)',
    } : {
      background: 'oklch(0.14 0.02 240)',
      color: 'var(--text-secondary)',
      border: '1px solid oklch(0.97 0.005 240 / 0.1)',
    }),
  }),
  card: {
    background: 'oklch(0.11 0.015 240)',
    border: '1.5px solid oklch(0.97 0.005 240 / 0.08)',
    borderRadius: 18, overflow: 'hidden',
  },
};

// ─── PROMPT FORM ─────────────────────────────────────────────────────────────

const EMPTY_PROMPT = { slug: '', title: '', subtitle: '', tag: '', body: '', resource_url: '', resource_type: '', resource_label: '' };

function PromptForm({ initial = EMPTY_PROMPT, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, padding: '24px', background: 'oklch(0.09 0.012 240)', borderTop: '1px solid oklch(0.97 0.005 240 / 0.08)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={S.label}>Slug (ייחודי, ללא רווחים)</label>
          <input style={S.input} value={form.slug} onChange={set('slug')} placeholder="brand-hijack" required pattern="[a-z0-9\-]+" />
        </div>
        <div>
          <label style={S.label}>תגית / קטגוריה</label>
          <input style={S.input} value={form.tag} onChange={set('tag')} placeholder="שיווק פסיכולוגי" required />
        </div>
      </div>

      <div>
        <label style={S.label}>כותרת</label>
        <input style={S.input} value={form.title} onChange={set('title')} placeholder="חטיפת מותג — Trigger Marketing" required />
      </div>

      <div>
        <label style={S.label}>תת-כותרת</label>
        <input style={S.input} value={form.subtitle} onChange={set('subtitle')} placeholder="השתלטות על הרגלי הקהל שלך — בחינם" required />
      </div>

      <div>
        <label style={S.label}>גוף הפרומפט</label>
        <textarea
          style={{ ...S.input, minHeight: 200, padding: '12px 14px', resize: 'vertical', lineHeight: 1.7 }}
          value={form.body}
          onChange={set('body')}
          placeholder="כתוב כאן את הפרומפט המלא..."
          required
        />
      </div>

      <div style={{ borderTop: '1px solid oklch(0.97 0.005 240 / 0.08)', paddingTop: 16 }}>
        <p style={{ ...S.label, marginBottom: 12 }}>משאב נוסף (אופציונלי — קובץ / סרטון / לינק)</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={S.label}>סוג</label>
            <select style={{ ...S.input, cursor: 'pointer' }} value={form.resource_type} onChange={set('resource_type')}>
              <option value="">— ללא —</option>
              <option value="file">קובץ להורדה</option>
              <option value="video">סרטון</option>
              <option value="link">לינק חיצוני</option>
            </select>
          </div>
          <div>
            <label style={S.label}>URL</label>
            <input style={S.input} value={form.resource_url} onChange={set('resource_url')} placeholder="https://..." />
          </div>
          <div>
            <label style={S.label}>טקסט כפתור</label>
            <input style={S.input} value={form.resource_label} onChange={set('resource_label')} placeholder="הורד PDF" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" style={S.btn('ghost')} onClick={onCancel}>ביטול</button>
        <button type="submit" style={S.btn('primary')} disabled={saving}>
          {saving ? 'שומר...' : <><IconCheck size={15} /> שמור פרומפט</>}
        </button>
      </div>
    </form>
  );
}

// ─── PROMPTS TAB ─────────────────────────────────────────────────────────────

function PromptsTab({ toast }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('prompts').select('*').order('position');
    if (!error) setPrompts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveNew = async (form) => {
    setSaving(true);
    const maxPos = prompts.length ? Math.max(...prompts.map(p => p.position)) + 1 : 0;
    const { error } = await supabase.from('prompts').insert({ ...form, position: maxPos });
    setSaving(false);
    if (error) { toast('שגיאה בשמירה: ' + error.message, 'error'); return; }
    toast('פרומפט נוסף בהצלחה');
    setAddingNew(false);
    load();
  };

  const handleSaveEdit = async (form) => {
    setSaving(true);
    const { error } = await supabase.from('prompts').update(form).eq('id', editingId);
    setSaving(false);
    if (error) { toast('שגיאה בעדכון: ' + error.message, 'error'); return; }
    toast('הפרומפט עודכן');
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('prompts').delete().eq('id', id);
    if (error) { toast('שגיאה במחיקה', 'error'); return; }
    toast('הפרומפט נמחק');
    setConfirmDelete(null);
    load();
  };

  const movePrompt = async (index, dir) => {
    const arr = [...prompts];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    const updates = arr.map((p, i) => supabase.from('prompts').update({ position: i }).eq('id', p.id));
    await Promise.all(updates);
    load();
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...S.card, height: 72, animation: 'breathing 1.5s ease-in-out infinite', opacity: 0.4 }} />
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
          {prompts.length} פרומפטים בספרייה
        </span>
        {!addingNew && (
          <button style={S.btn('primary')} onClick={() => { setAddingNew(true); setEditingId(null); }}>
            <IconPlus size={15} /> פרומפט חדש
          </button>
        )}
      </div>

      {addingNew && (
        <div style={{ ...S.card, marginBottom: 14 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid oklch(0.97 0.005 240 / 0.08)', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.9rem' }}>
            + פרומפט חדש
          </div>
          <PromptForm onSave={handleSaveNew} onCancel={() => setAddingNew(false)} saving={saving} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {prompts.map((p, i) => (
          <div key={p.id} style={S.card}>
            {/* Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              {/* Order buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => movePrompt(i, -1)} disabled={i === 0} title="העלה">
                  <IconChevronUp size={13} />
                </button>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => movePrompt(i, 1)} disabled={i === prompts.length - 1} title="הורד">
                  <IconChevronDown size={13} />
                </button>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.73rem', color: 'var(--brand-prime)', fontWeight: 700, background: 'oklch(0.78 0.20 145 / 0.1)', padding: '2px 8px', borderRadius: 100 }}>
                    {p.tag}
                  </span>
                  {p.resource_type && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconLink size={11} /> {p.resource_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={S.btn('ghost')} onClick={() => { setEditingId(editingId === p.id ? null : p.id); setAddingNew(false); }} title="עריכה">
                  <IconEdit size={14} />
                </button>
                <button style={S.btn('danger')} onClick={() => setConfirmDelete(p.id)} title="מחיקה">
                  <IconTrash size={14} />
                </button>
              </div>
            </div>

            {/* Confirm delete */}
            {confirmDelete === p.id && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid oklch(0.65 0.22 25 / 0.2)', background: 'oklch(0.65 0.22 25 / 0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'oklch(0.75 0.18 25)', fontWeight: 600 }}>
                  למחוק את "{p.title}"? לא ניתן לשחזר.
                </span>
                <button style={S.btn('ghost')} onClick={() => setConfirmDelete(null)}>ביטול</button>
                <button style={S.btn('danger')} onClick={() => handleDelete(p.id)}>
                  <IconTrash size={13} /> מחק
                </button>
              </div>
            )}

            {/* Edit form */}
            {editingId === p.id && (
              <PromptForm
                initial={p}
                onSave={handleSaveEdit}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            )}
          </div>
        ))}
      </div>

      {prompts.length === 0 && !addingNew && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          אין פרומפטים עדיין — לחץ "פרומפט חדש" להתחלה
        </div>
      )}
    </div>
  );
}

// ─── IG LINKS TAB ────────────────────────────────────────────────────────────

const EMPTY_LINK = { label: '', href: '', style: 'primary' };

function IgLinksTab({ toast }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_LINK);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState(EMPTY_LINK);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ig_links').select('*').order('position');
    if (!error) setLinks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaveNew = async (e) => {
    e.preventDefault();
    setSaving(true);
    const maxPos = links.length ? Math.max(...links.map(l => l.position)) + 1 : 0;
    const { error } = await supabase.from('ig_links').insert({ ...newForm, position: maxPos });
    setSaving(false);
    if (error) { toast('שגיאה: ' + error.message, 'error'); return; }
    toast('כפתור נוסף');
    setAddingNew(false);
    setNewForm(EMPTY_LINK);
    load();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('ig_links').update(editForm).eq('id', editingId);
    setSaving(false);
    if (error) { toast('שגיאה: ' + error.message, 'error'); return; }
    toast('כפתור עודכן');
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('ig_links').delete().eq('id', id);
    if (error) { toast('שגיאה במחיקה', 'error'); return; }
    toast('כפתור נמחק');
    setConfirmDelete(null);
    load();
  };

  const moveLink = async (index, dir) => {
    const arr = [...links];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    await Promise.all(arr.map((l, i) => supabase.from('ig_links').update({ position: i }).eq('id', l.id)));
    load();
  };

  const LinkInlineForm = ({ form, setForm, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} style={{ padding: '14px 16px', borderTop: '1px solid oklch(0.97 0.005 240 / 0.08)', background: 'oklch(0.09 0.012 240)', display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10 }}>
        <div>
          <label style={S.label}>טקסט כפתור</label>
          <input style={S.input} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="לעשות Shift Up לעסק" required />
        </div>
        <div>
          <label style={S.label}>קישור (href)</label>
          <input style={S.input} value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))} placeholder="https://wa.me/..." required />
        </div>
        <div>
          <label style={S.label}>סגנון</label>
          <select style={{ ...S.input, cursor: 'pointer' }} value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}>
            <option value="primary">ירוק (ראשי)</option>
            <option value="secondary">לבן (משני)</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" style={S.btn('ghost')} onClick={onCancel}>ביטול</button>
        <button type="submit" style={S.btn('primary')} disabled={saving}>
          {saving ? 'שומר...' : <><IconCheck size={14} /> שמור</>}
        </button>
      </div>
    </form>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2].map(i => <div key={i} style={{ ...S.card, height: 64, animation: 'breathing 1.5s ease-in-out infinite', opacity: 0.4 }} />)}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
          כפתורים בעמוד /ig — {links.length} פעיל{links.length !== 1 ? 'ים' : ''}
        </span>
        {!addingNew && (
          <button style={S.btn('primary')} onClick={() => { setAddingNew(true); setEditingId(null); }}>
            <IconPlus size={15} /> כפתור חדש
          </button>
        )}
      </div>

      {addingNew && (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.88rem', borderBottom: '1px solid oklch(0.97 0.005 240 / 0.08)' }}>
            + כפתור חדש
          </div>
          <LinkInlineForm form={newForm} setForm={setNewForm} onSubmit={handleSaveNew} onCancel={() => { setAddingNew(false); setNewForm(EMPTY_LINK); }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {links.map((l, i) => (
          <div key={l.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => moveLink(i, -1)} disabled={i === 0}><IconChevronUp size={13} /></button>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => moveLink(i, 1)} disabled={i === links.length - 1}><IconChevronDown size={13} /></button>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 2 }}>{l.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ padding: '1px 7px', borderRadius: 100, background: l.style === 'primary' ? 'oklch(0.78 0.20 145 / 0.1)' : 'oklch(0.97 0.005 240 / 0.08)', color: l.style === 'primary' ? 'var(--brand-prime)' : 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>
                    {l.style === 'primary' ? 'ירוק' : 'לבן'}
                  </span>
                  <IconLink size={11} />
                  {l.href}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={S.btn('ghost')} onClick={() => { setEditingId(editingId === l.id ? null : l.id); setEditForm({ label: l.label, href: l.href, style: l.style }); setAddingNew(false); }}>
                  <IconEdit size={14} />
                </button>
                <button style={S.btn('danger')} onClick={() => setConfirmDelete(l.id)}>
                  <IconTrash size={14} />
                </button>
              </div>
            </div>

            {confirmDelete === l.id && (
              <div style={{ padding: '10px 14px', borderTop: '1px solid oklch(0.65 0.22 25 / 0.2)', background: 'oklch(0.65 0.22 25 / 0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'oklch(0.75 0.18 25)', fontWeight: 600 }}>למחוק "{l.label}"?</span>
                <button style={S.btn('ghost')} onClick={() => setConfirmDelete(null)}>ביטול</button>
                <button style={S.btn('danger')} onClick={() => handleDelete(l.id)}><IconTrash size={13} /> מחק</button>
              </div>
            )}

            {editingId === l.id && (
              <LinkInlineForm form={editForm} setForm={setEditForm} onSubmit={handleSaveEdit} onCancel={() => setEditingId(null)} />
            )}
          </div>
        ))}
      </div>

      {links.length === 0 && !addingNew && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          אין כפתורים — לחץ "כפתור חדש" להוסיף
        </div>
      )}
    </div>
  );
}

// ─── CONTACT / SITE_CONTENT TAB ─────────────────────────────────────────────

function ContactTab({ toast }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [edits, setEdits] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('site_content').select('*').order('section').order('key');
    setRows(data || []);
    const initEdits = {};
    (data || []).forEach(r => { initEdits[r.key] = r.value; });
    setEdits(initEdits);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (key) => {
    setSaving(key);
    const { error } = await supabase.from('site_content').update({ value: edits[key] }).eq('key', key);
    setSaving(null);
    if (error) { toast('שגיאה: ' + error.message, 'error'); return; }
    toast('נשמר בהצלחה');
  };

  const sections = [...new Set(rows.map(r => r.section))];

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: 24 }}>טוען...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {sections.map(sec => (
        <div key={sec} style={S.card}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid oklch(0.97 0.005 240 / 0.08)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--brand-prime)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {sec}
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {rows.filter(r => r.section === sec).map(r => (
              <div key={r.key}>
                <label style={S.label}>{r.label} <span style={{ opacity: 0.4, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({r.key})</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {r.type === 'textarea' ? (
                    <textarea
                      style={{ ...S.input, minHeight: 80, padding: '10px 14px', resize: 'vertical', flex: 1 }}
                      value={edits[r.key] ?? r.value}
                      onChange={e => setEdits(prev => ({ ...prev, [r.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      type={r.type === 'email' ? 'email' : r.type === 'url' ? 'url' : 'text'}
                      style={{ ...S.input, flex: 1 }}
                      value={edits[r.key] ?? r.value}
                      onChange={e => setEdits(prev => ({ ...prev, [r.key]: e.target.value }))}
                    />
                  )}
                  <button style={S.btn('primary')} onClick={() => save(r.key)} disabled={saving === r.key}>
                    {saving === r.key ? '...' : <IconCheck size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          הטבלה site_content ריקה — יש להריץ את ה-SQL תחילה
        </div>
      )}
    </div>
  );
}

// ─── GENERIC CRUD TAB FACTORY ────────────────────────────────────────────────

function GenericCrudTab({ toast, table, emptyForm, fields, itemTitle }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select('*').order('position');
    setItems(data || []);
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  const handleSaveNew = async (e) => {
    e.preventDefault();
    setSaving(true);
    const maxPos = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0;
    const { error } = await supabase.from(table).insert({ ...newForm, position: maxPos });
    setSaving(false);
    if (error) { toast('שגיאה: ' + error.message, 'error'); return; }
    toast('נוסף בהצלחה');
    setAddingNew(false);
    setNewForm(emptyForm);
    load();
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from(table).update(editForm).eq('id', editingId);
    setSaving(false);
    if (error) { toast('שגיאה: ' + error.message, 'error'); return; }
    toast('עודכן בהצלחה');
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast('שגיאה במחיקה', 'error'); return; }
    toast('נמחק');
    setConfirmDelete(null);
    load();
  };

  const move = async (index, dir) => {
    const arr = [...items];
    const swapIdx = index + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    await Promise.all(arr.map((x, i) => supabase.from(table).update({ position: i }).eq('id', x.id)));
    load();
  };

  const InlineForm = ({ form, setForm, onSubmit, onCancel }) => (
    <form onSubmit={onSubmit} style={{ padding: '14px 16px', borderTop: '1px solid oklch(0.97 0.005 240 / 0.08)', background: 'oklch(0.09 0.012 240)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {fields.map(f => (
        <div key={f.key}>
          <label style={S.label}>{f.label}</label>
          {f.type === 'textarea' ? (
            <textarea
              style={{ ...S.input, minHeight: f.rows ? f.rows * 24 : 90, padding: '10px 14px', resize: 'vertical' }}
              value={form[f.key] ?? ''}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              required={f.required}
            />
          ) : f.type === 'checkbox' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-prime)' }}
              />
              {f.checkLabel || f.label}
            </label>
          ) : (
            <input
              type={f.type || 'text'}
              style={S.input}
              value={form[f.key] ?? ''}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder || ''}
              required={f.required}
            />
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" style={S.btn('ghost')} onClick={onCancel}>ביטול</button>
        <button type="submit" style={S.btn('primary')} disabled={saving}>
          {saving ? 'שומר...' : <><IconCheck size={14} /> שמור</>}
        </button>
      </div>
    </form>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1,2,3].map(i => <div key={i} style={{ ...S.card, height: 64, animation: 'breathing 1.5s ease-in-out infinite', opacity: 0.4 }} />)}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{items.length} פריטים</span>
        {!addingNew && (
          <button style={S.btn('primary')} onClick={() => { setAddingNew(true); setEditingId(null); }}>
            <IconPlus size={15} /> הוסף
          </button>
        )}
      </div>

      {addingNew && (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.88rem', borderBottom: '1px solid oklch(0.97 0.005 240 / 0.08)' }}>+ חדש</div>
          <InlineForm form={newForm} setForm={setNewForm} onSubmit={handleSaveNew} onCancel={() => { setAddingNew(false); setNewForm(emptyForm); }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <div key={item.id} style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => move(i, -1)} disabled={i === 0}><IconChevronUp size={13} /></button>
                <button style={{ ...S.btn('ghost'), padding: '3px 6px', borderRadius: 6 }} onClick={() => move(i, 1)} disabled={i === items.length - 1}><IconChevronDown size={13} /></button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {itemTitle(item)}
                </div>
                {item.featured !== undefined && (
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 100, background: item.featured ? 'oklch(0.78 0.20 145 / 0.12)' : 'oklch(0.14 0.02 240)', color: item.featured ? 'var(--brand-prime)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {item.featured ? '⭐ featured' : 'לא מוצג בדף הבית'}
                  </span>
                )}
                {item.is_live !== undefined && (
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 100, background: item.is_live ? 'oklch(0.78 0.20 145 / 0.12)' : 'oklch(0.14 0.02 240)', color: item.is_live ? 'var(--brand-prime)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {item.is_live ? '🟢 live badge' : ''}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button style={S.btn('ghost')} onClick={() => {
                  if (editingId === item.id) { setEditingId(null); return; }
                  setEditingId(item.id);
                  setEditForm({ ...item });
                  setAddingNew(false);
                }}>
                  <IconEdit size={14} />
                </button>
                <button style={S.btn('danger')} onClick={() => setConfirmDelete(item.id)}>
                  <IconTrash size={14} />
                </button>
              </div>
            </div>

            {confirmDelete === item.id && (
              <div style={{ padding: '10px 14px', borderTop: '1px solid oklch(0.65 0.22 25 / 0.2)', background: 'oklch(0.65 0.22 25 / 0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'oklch(0.75 0.18 25)', fontWeight: 600 }}>למחוק "{itemTitle(item)}"?</span>
                <button style={S.btn('ghost')} onClick={() => setConfirmDelete(null)}>ביטול</button>
                <button style={S.btn('danger')} onClick={() => handleDelete(item.id)}><IconTrash size={13} /> מחק</button>
              </div>
            )}

            {editingId === item.id && (
              <InlineForm form={editForm} setForm={setEditForm} onSubmit={handleSaveEdit} onCancel={() => setEditingId(null)} />
            )}
          </div>
        ))}
      </div>

      {items.length === 0 && !addingNew && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          אין פריטים — לחץ "הוסף" להתחלה
        </div>
      )}
    </div>
  );
}

// ─── SPECIFIC TABS (thin wrappers over GenericCrudTab) ───────────────────────

function FaqsTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="faqs"
      emptyForm={{ question: '', answer: '', position: 0 }}
      itemTitle={item => item.question}
      fields={[
        { key: 'question', label: 'שאלה', required: true, placeholder: 'כמה זמן לוקח לראות תוצאות?' },
        { key: 'answer',   label: 'תשובה', type: 'textarea', rows: 4, required: true },
      ]}
    />
  );
}

function StatsTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="stats"
      emptyForm={{ display: '', label: '', is_live: false, position: 0 }}
      itemTitle={item => `${item.display} — ${item.label}`}
      fields={[
        { key: 'display', label: 'ערך מוצג (100% / AI / ROI)', required: true, placeholder: '100%' },
        { key: 'label',   label: 'תווית מתחת לערך', required: true, placeholder: 'מותאם אישית לכל עסק' },
        { key: 'is_live', label: 'Live badge (זמינות)', type: 'checkbox', checkLabel: 'הצג badge זמינות (ירוק)' },
      ]}
    />
  );
}

function ProcessTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="process_steps"
      emptyForm={{ title: '', description: '', bullets: '[]', position: 0 }}
      itemTitle={item => item.title}
      fields={[
        { key: 'title',       label: 'כותרת שלב', required: true, placeholder: 'הפיצוח' },
        { key: 'description', label: 'תיאור', type: 'textarea', rows: 3, required: true },
        { key: 'bullets',     label: 'בולטים — JSON array', type: 'textarea', rows: 2, placeholder: '["ניתוח מתחרים","מיפוי קהל יעד"]' },
      ]}
    />
  );
}

function WhyMeTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="why_me_reasons"
      emptyForm={{ title: '', description: '', position: 0 }}
      itemTitle={item => item.title}
      fields={[
        { key: 'title',       label: 'כותרת כרטיס', required: true, placeholder: 'גישה יזמית' },
        { key: 'description', label: 'תיאור', type: 'textarea', rows: 3, required: true },
      ]}
    />
  );
}

function TestimonialsTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="testimonials"
      emptyForm={{ name: '', role: '', company: '', quote: '', logo_url: '', featured: false, position: 0 }}
      itemTitle={item => item.name + (item.company ? ` · ${item.company}` : '')}
      fields={[
        { key: 'name',     label: 'שם', required: true, placeholder: 'ישראל ישראלי' },
        { key: 'role',     label: 'תפקיד', placeholder: 'מנכ"ל' },
        { key: 'company',  label: 'חברה', placeholder: 'ABC Ltd' },
        { key: 'quote',    label: 'ציטוט', type: 'textarea', rows: 3, required: true },
        { key: 'logo_url', label: 'URL לוגו (אופציונלי)', placeholder: 'https://...' },
        { key: 'featured', label: 'הצג בדף הבית', type: 'checkbox', checkLabel: '⭐ הצג בסקשן עדויות בדף הראשי' },
      ]}
    />
  );
}

// ─── LEADS TAB ───────────────────────────────────────────────────────────────

function waFromPhone(phone) {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '972' + d.slice(1);
  else if (!d.startsWith('972') && d.length <= 10) d = '972' + d;
  return `https://wa.me/${d}`;
}

const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch { return iso; }
};

function LeadsTab({ toast }) {
  const [leads, setLeads] = useState(null); // null = loading
  const [setupNeeded, setSetupNeeded] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) {
      // קרוב לוודאי שהטבלה עוד לא נוצרה — מציגים הנחיית התקנה
      setSetupNeeded(true);
      setLeads([]);
      return;
    }
    setSetupNeeded(false);
    setLeads(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleHandled = async (lead) => {
    const { error } = await supabase.from('leads').update({ handled: !lead.handled }).eq('id', lead.id);
    if (error) return toast('שגיאה בעדכון', 'error');
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, handled: !l.handled } : l));
  };

  const remove = async (id) => {
    if (!window.confirm('למחוק את הליד? פעולה בלתי הפיכה.')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return toast('שגיאה במחיקה', 'error');
    setLeads(ls => ls.filter(l => l.id !== id));
    toast('הליד נמחק');
  };

  if (leads === null) {
    return <div style={{ display: 'grid', gap: 12 }}>{[1,2,3].map(i => <div key={i} style={{ ...S.card, height: 90, animation: 'breathing 1.5s ease-in-out infinite', opacity: 0.4 }} />)}</div>;
  }

  if (setupNeeded) {
    return (
      <div style={{ ...S.card, padding: 24, lineHeight: 1.8 }}>
        <h3 style={{ fontWeight: 800, marginBottom: 10, color: 'var(--brand-prime)' }}>טבלת הלידים עוד לא קיימת 🛠️</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          כדי לקלוט לידים מהטופס, הרץ פעם אחת את ה-SQL מהקובץ <code style={{ color: 'var(--text-primary)' }}>docs/leads-table.sql</code> ב-
          Supabase → SQL Editor. אחר כך רענן את העמוד. עד אז, לידים מהטופס נופלים אוטומטית לוואטסאפ ולא אובדים.
        </p>
        <button style={{ ...S.btn('ghost'), marginTop: 14 }} onClick={load}>רענן ובדוק שוב</button>
      </div>
    );
  }

  const unhandled = leads.filter(l => !l.handled).length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{leads.length} לידים</span>
        {unhandled > 0 && (
          <span style={{ background: 'oklch(0.78 0.20 145 / 0.15)', color: 'var(--brand-prime)', border: '1px solid oklch(0.78 0.20 145 / 0.3)', borderRadius: 999, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
            {unhandled} חדשים
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button style={S.btn('ghost')} onClick={load}>רענן</button>
      </div>

      {leads.length === 0 ? (
        <div style={{ ...S.card, padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
          עוד אין לידים. כשמישהו ימלא את הטופס באתר — הוא יופיע כאן.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {leads.map(l => (
            <div key={l.id} className="admin-card" style={{ ...S.card, padding: 18, opacity: l.handled ? 0.6 : 1, borderColor: l.handled ? undefined : 'oklch(0.78 0.20 145 / 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.02rem' }}>{l.name}</span>
                    {l.business && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'oklch(0.16 0.02 240)', borderRadius: 999, padding: '2px 10px' }}>{l.business}</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtDate(l.created_at)} · {l.source || 'form'}</div>
                  {l.message && <p style={{ marginTop: 10, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{l.message}</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={waFromPhone(l.phone)} target="_blank" rel="noopener noreferrer" style={{ ...S.btn('primary'), textDecoration: 'none', fontSize: '0.8rem' }} dir="ltr">{l.phone}</a>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...S.btn(l.handled ? 'ghost' : 'ghost'), flex: 1, fontSize: '0.78rem' }} onClick={() => toggleHandled(l)}>
                      {l.handled ? '↩︎ החזר לחדשים' : <><IconCheck size={13} /> טופל</>}
                    </button>
                    <button style={S.btn('danger')} onClick={() => remove(l.id)} aria-label="מחק"><IconTrash size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'leads',        label: '📥 לידים',        desc: 'טופס' },
  { id: 'prompts',      label: '📚 פרומפטים',    desc: '/freebies' },
  { id: 'ig',           label: '🔗 כפתורי /ig',  desc: 'Link in Bio' },
  { id: 'contact',      label: '📞 פרטי קשר',    desc: 'site_content' },
  { id: 'faqs',         label: '❓ שאלות',        desc: 'FAQ' },
  { id: 'stats',        label: '📊 סטטיסטיקות',  desc: 'Stats' },
  { id: 'process',      label: '🔄 תהליך',        desc: 'Process' },
  { id: 'whyme',        label: '💡 למה אני',      desc: 'WhyMe' },
  { id: 'testimonials', label: '⭐ עדויות',        desc: 'Testimonials' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('leads');
  const [toast, setToast] = useState(null);
  const [newLeads, setNewLeads] = useState(0);
  const navigate = useNavigate();

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  // ספירת לידים שלא טופלו — ל-badge על הטאב
  useEffect(() => {
    let alive = true;
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('handled', false)
      .then(({ count, error }) => { if (alive && !error) setNewLeads(count || 0); });
    return () => { alive = false; };
  }, [activeTab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-scope" dir="rtl" style={{ minHeight: '100dvh', background: 'var(--bedrock)', fontFamily: "'Heebo', sans-serif", color: 'var(--text-primary)', position: 'relative', overflowX: 'hidden' }}>
      <div className="noise-overlay" aria-hidden="true" />
      {/* ambient aurora */}
      <div className="aurora-orb" style={{ width: 480, height: 480, top: '-12%', right: '-6%', background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.10), transparent 70%)', '--dur': '24s' }} />
      <div className="aurora-orb" style={{ width: 420, height: 420, top: '34%', left: '-12%', background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.08), transparent 72%)', '--dur': '28s', '--delay': '-9s' }} />
      <Cursor />

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'oklch(0.09 0.012 240 / 0.82)',
        backdropFilter: 'blur(20px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
        borderBottom: '1px solid oklch(0.97 0.005 240 / 0.08)',
        padding: '0 clamp(16px, 4vw, 28px)',
        display: 'flex', alignItems: 'center', gap: 14, height: 62,
      }}>
        <img src="/logo.png" alt="Shift Up" style={{ height: 36, animation: 'hue-drift 8s ease-in-out infinite' }} />
        <div style={{ width: 1, height: 24, background: 'oklch(0.97 0.005 240 / 0.1)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>ממשק ניהול</span>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Shift Up CMS</span>
        </div>
        <div style={{ flex: 1 }} />
        <a href="/" target="_blank" rel="noopener noreferrer" style={{ ...S.btn('ghost'), textDecoration: 'none', fontSize: '0.78rem' }}>
          צפה באתר ↗
        </a>
        <button style={S.btn('ghost')} onClick={handleSignOut}>
          <IconLogout size={14} /> יציאה
        </button>
      </header>

      {/* ── Layout ── */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 24px)', position: 'relative', zIndex: 1 }}>

        {/* Tab nav */}
        <div className="admin-tabs" style={{ marginBottom: 26, background: 'oklch(0.11 0.015 240)', borderRadius: 14, padding: 6, border: '1px solid oklch(0.97 0.005 240 / 0.06)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className="admin-tab"
              data-active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              title={t.desc}
            >
              {t.label}
              {t.id === 'leads' && newLeads > 0 && <span className="tab-count">{newLeads}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'leads'        && <LeadsTab        toast={showToast} />}
        {activeTab === 'prompts'      && <PromptsTab      toast={showToast} />}
        {activeTab === 'ig'           && <IgLinksTab      toast={showToast} />}
        {activeTab === 'contact'      && <ContactTab      toast={showToast} />}
        {activeTab === 'faqs'         && <FaqsTab         toast={showToast} />}
        {activeTab === 'stats'        && <StatsTab        toast={showToast} />}
        {activeTab === 'process'      && <ProcessTab      toast={showToast} />}
        {activeTab === 'whyme'        && <WhyMeTab        toast={showToast} />}
        {activeTab === 'testimonials' && <TestimonialsTab toast={showToast} />}
      </div>

      {/* Toast */}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
