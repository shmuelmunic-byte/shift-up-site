import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TodayView, ClientsView, SyncBar, HebrewDates, HubProvider } from './admin/HubViews';
import './admin/admin.css';
import { CATS, SEG_LABEL, Q } from '../lib/auditQuestions';

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
      padding: '12px 20px', borderRadius: 3,
      background: isErr ? 'var(--ad-danger-bg)' : 'var(--ad-ok-bg)',
      border: `1.5px solid ${isErr ? 'var(--ad-danger-line)' : 'var(--ad-brand-line)'}`,
      boxShadow: '0 8px 40px var(--ad-shadow)',
      color: isErr ? 'var(--ad-danger)' : 'var(--brand-prime)',
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
    width: '100%', minHeight: 44, borderRadius: 3,
    border: '1.5px solid var(--ad-line-strong)',
    background: 'var(--ad-input)',
    color: 'var(--text-primary)', padding: '0 14px',
    fontFamily: 'var(--font)', fontSize: '0.9rem',
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
    gap: 7, padding: '8px 16px', borderRadius: 3, border: 'none',
    fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.85rem',
    cursor: 'pointer', transition: 'all 0.18s ease',
    ...(variant === 'primary' ? {
      background: 'var(--brand-prime)', color: 'var(--ad-on-brand)',
      
    } : variant === 'danger' ? {
      background: 'var(--ad-danger-soft)',
      color: 'var(--ad-danger)',
      border: '1px solid var(--ad-danger-line)',
    } : {
      background: 'var(--ad-surface-2)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--ad-line-strong)',
    }),
  }),
  card: {
    background: 'var(--ad-surface)',
    border: '1.5px solid var(--ad-line)',
    borderRadius: 4, overflow: 'hidden',
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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, padding: '24px', background: 'var(--ad-sunken)', borderTop: '1px solid var(--ad-line)' }}>
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

      <div style={{ borderTop: '1px solid var(--ad-line)', paddingTop: 16 }}>
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
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ad-line)', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.9rem' }}>
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
                  <span style={{ fontSize: '0.73rem', color: 'var(--brand-prime)', fontWeight: 700, background: 'var(--ad-brand-soft)', padding: '2px 8px', borderRadius: 100 }}>
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
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--ad-danger-line)', background: 'var(--ad-danger-soft)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--ad-danger)', fontWeight: 600 }}>
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
    <form onSubmit={onSubmit} style={{ padding: '14px 16px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-sunken)', display: 'grid', gap: 10 }}>
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
          <div style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.88rem', borderBottom: '1px solid var(--ad-line)' }}>
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
                  <span style={{ padding: '1px 7px', borderRadius: 100, background: l.style === 'primary' ? 'var(--ad-brand-soft)' : 'var(--ad-line)', color: l.style === 'primary' ? 'var(--brand-prime)' : 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700 }}>
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
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--ad-danger-line)', background: 'var(--ad-danger-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--ad-danger)', fontWeight: 600 }}>למחוק "{l.label}"?</span>
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
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ad-line)', fontWeight: 800, fontSize: '0.88rem', color: 'var(--brand-prime)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
    <form onSubmit={onSubmit} style={{ padding: '14px 16px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-sunken)', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          <div style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--brand-prime)', fontSize: '0.88rem', borderBottom: '1px solid var(--ad-line)' }}>+ חדש</div>
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
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 100, background: item.featured ? 'var(--ad-brand-soft)' : 'var(--ad-surface-2)', color: item.featured ? 'var(--brand-prime)' : 'var(--text-muted)', fontWeight: 700 }}>
                    {item.featured ? '⭐ featured' : 'לא מוצג בדף הבית'}
                  </span>
                )}
                {item.is_live !== undefined && (
                  <span style={{ fontSize: '0.7rem', padding: '1px 7px', borderRadius: 100, background: item.is_live ? 'var(--ad-brand-soft)' : 'var(--ad-surface-2)', color: item.is_live ? 'var(--brand-prime)' : 'var(--text-muted)', fontWeight: 700 }}>
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
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--ad-danger-line)', background: 'var(--ad-danger-soft)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontSize: '0.83rem', color: 'var(--ad-danger)', fontWeight: 600 }}>למחוק "{itemTitle(item)}"?</span>
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
        { key: 'title',       label: 'כותרת שלב', required: true, placeholder: 'המחקר' },
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

function TrustTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="trust_pillars"
      emptyForm={{ title: '', text: '', position: 0 }}
      itemTitle={item => item.title}
      fields={[
        { key: 'title', label: 'כותרת עמוד', required: true, placeholder: 'הבטחת ביצוע' },
        { key: 'text',  label: 'טקסט', type: 'textarea', rows: 2, required: true },
      ]}
    />
  );
}

function PainTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="pain_points"
      emptyForm={{ text: '', position: 0 }}
      itemTitle={item => item.text}
      fields={[
        { key: 'text', label: 'משפט כאב', type: 'textarea', rows: 2, required: true, placeholder: 'שורף תקציב על ממומן — והלידים לא מגיעים.' },
      ]}
    />
  );
}

function OutcomesTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="outcomes"
      emptyForm={{ title: '', text: '', position: 0 }}
      itemTitle={item => item.title}
      fields={[
        { key: 'title', label: 'כותרת תוצאה', required: true, placeholder: 'לידים שנכנסים — לא רק חשיפות' },
        { key: 'text',  label: 'טקסט', type: 'textarea', rows: 3, required: true },
      ]}
    />
  );
}

function ProofCasesTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="proof_cases"
      emptyForm={{ tag: 'דוגמת תהליך', title: '', subtitle: '', quote: '', steps: '[]', position: 0 }}
      itemTitle={item => item.title}
      fields={[
        { key: 'tag',      label: 'תגית', placeholder: 'דוגמת תהליך' },
        { key: 'title',    label: 'כותרת הקייס', required: true, placeholder: 'עסק קינוחי בוטיק' },
        { key: 'subtitle', label: 'תת-כותרת', placeholder: 'מיצוב פרימיום בשוק רווי' },
        { key: 'quote',    label: 'ציטוט מיצוב', placeholder: 'We don’t sell cakes, we sell style.' },
        { key: 'steps',    label: 'שלבים — JSON: [{"k":"הכאב","v":"..."}]', type: 'textarea', rows: 5, placeholder: '[{"k":"הכאב","v":"..."},{"k":"המיצוב","v":"..."}]' },
      ]}
    />
  );
}

function ProofGridTab({ toast }) {
  return (
    <GenericCrudTab
      toast={toast}
      table="proof_grid"
      emptyForm={{ file: '', client: '', field: '', position: 0 }}
      itemTitle={item => `${item.client} · ${item.field || ''}`}
      fields={[
        { key: 'file',   label: 'שם קובץ (בתוך public/portfolio/)', required: true, placeholder: 'events-yehuda.jpg' },
        { key: 'client', label: 'שם לקוח', required: true, placeholder: 'יהודה סימן-טוב' },
        { key: 'field',  label: 'תחום', placeholder: 'אירועים' },
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
          <span style={{ background: 'var(--ad-brand-soft)', color: 'var(--brand-prime)', border: '1px solid var(--ad-brand-line)', borderRadius: 3, padding: '3px 12px', fontSize: '0.78rem', fontWeight: 700 }}>
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
            <div key={l.id} className="admin-card" style={{ ...S.card, padding: 18, opacity: l.handled ? 0.6 : 1, borderColor: l.handled ? undefined : 'var(--ad-brand-line)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '1.02rem' }}>{l.name}</span>
                    {l.business && <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', background: 'var(--ad-surface-2)', borderRadius: 3, padding: '2px 10px' }}>{l.business}</span>}
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

// ─── AUDIT STATS TAB (/audit) ────────────────────────────────────────────────
// סטטיסטיקה מצטברת ואנונימית בלבד — אין בטבלה שם/טלפון/מייל ואין קשר ל-leads.

function StatBox({ value, label, color }) {
  return (
    <div style={{ ...S.card, flex: '1 1 150px', padding: '16px 18px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.9rem', fontWeight: 900, color: color || 'var(--brand-prime)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Bar({ label, pct, count, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: 5 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: color || 'var(--text-muted)', fontWeight: 700 }}>
          {pct}%{count != null ? ` · ${count}` : ''}
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--ad-on-brand)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color || 'var(--brand-prime)', borderRadius: 100, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function AuditStatsTab({ toast }) {
  const [rows, setRows] = useState(null); // null = loading
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    supabase.from('audit_results').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) { setMissing(true); setRows([]); return; }
        setRows(data || []);
      });
  }, []);

  if (rows === null) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>טוען…</div>;

  if (missing) {
    return (
      <div style={{ ...S.card, padding: 28, textAlign: 'center', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>הטבלה עוד לא קיימת</div>
        כדי לאסוף תוצאות אבחון, הרץ פעם אחת את ה-SQL מהקובץ{' '}
        <code style={{ color: 'var(--text-primary)' }}>docs/audit-results-table.sql</code> ב-Supabase → SQL Editor.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={{ ...S.card, padding: 28, textAlign: 'center', color: 'var(--text-secondary)' }}>
        עוד אף אחד לא סיים אבחון. שתף את <code style={{ color: 'var(--brand-prime)' }}>/audit</code> ותחזור לכאן.
      </div>
    );
  }

  const n = rows.length;
  const scores = rows.map(r => r.score).sort((a, b) => a - b);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / n);
  const median = n % 2 ? scores[(n - 1) / 2] : Math.round((scores[n / 2 - 1] + scores[n / 2]) / 2);

  const buckets = { low: 0, mid: 0, high: 0 };
  scores.forEach(s => { if (s >= 70) buckets.high++; else if (s >= 45) buckets.mid++; else buckets.low++; });

  // ממוצע לפי תחום — איפה רוב האנשים דולפים
  const catKeys = Object.keys(CATS);
  const catAvg = catKeys.map(c => {
    const vals = rows.map(r => (r.cat_scores || {})[c]).filter(v => typeof v === 'number');
    return { c, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
  }).sort((a, b) => a.avg - b.avg);

  // דליפות נפוצות
  const leakCount = {};
  rows.forEach(r => (r.leaks || []).forEach(l => { leakCount[l] = (leakCount[l] || 0) + 1; }));
  const topLeaks = Object.entries(leakCount).sort((a, b) => b[1] - a[1]);

  // פילוח לפי סוג השקעה
  const segCount = {};
  rows.forEach(r => { const s = r.segment || 'לא ידוע'; segCount[s] = (segCount[s] || 0) + 1; });

  // התפלגות תשובות לכל שאלה
  const scoredQs = Q.map((q, i) => ({ q, i })).filter(x => !x.q.seg);
  const answerDist = scoredQs.map(({ q, i }) => {
    const counts = q.o.map(() => 0);
    rows.forEach(r => {
      const rec = (r.answers || []).find(a => a.q === i);
      if (rec && typeof rec.a === 'number' && counts[rec.a] != null) counts[rec.a]++;
    });
    const answered = counts.reduce((a, b) => a + b, 0) || 1;
    return { q, i, counts, answered };
  });

  const colorFor = (p) => (p >= 67 ? 'var(--brand-prime)' : p >= 34 ? 'var(--ad-warn)' : 'var(--ad-danger)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        🔒 נתונים <strong style={{ color: 'var(--text-secondary)' }}>אנונימיים לחלוטין</strong> — בלי שם, טלפון או מייל, ובלי קשר לטבלת הלידים.
      </div>

      {/* KPI */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatBox value={n} label="אבחונים שהושלמו" />
        <StatBox value={avg} label="ציון ממוצע" color={colorFor(avg)} />
        <StatBox value={median} label="ציון חציוני" color={colorFor(median)} />
        <StatBox value={`${Math.round((buckets.low / n) * 100)}%`} label="מתחת ל-45 (דולפים חזק)" color="var(--ad-danger)" />
      </div>

      {/* התפלגות ציונים */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 14 }}>התפלגות ציונים</div>
        <Bar label="70-100 · בסיס בריא" pct={Math.round((buckets.high / n) * 100)} count={buckets.high} color="var(--brand-prime)" />
        <Bar label="45-69 · דולף בנקודות" pct={Math.round((buckets.mid / n) * 100)} count={buckets.mid} color="var(--ad-warn)" />
        <Bar label="0-44 · דולף חזק" pct={Math.round((buckets.low / n) * 100)} count={buckets.low} color="var(--ad-danger)" />
      </div>

      {/* איפה רוב האנשים חלשים */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>ממוצע לפי תחום</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>מהחלש לחזק — כאן רוב השוק דולף</div>
        {catAvg.map(({ c, avg: a }) => <Bar key={c} label={CATS[c]} pct={a} color={colorFor(a)} />)}
      </div>

      {/* דליפות נפוצות */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 14 }}>הדליפות הנפוצות ביותר</div>
        {topLeaks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>אין דליפות שנרשמו עדיין.</div>
        ) : topLeaks.map(([title, count]) => (
          <Bar key={title} label={title} pct={Math.round((count / n) * 100)} count={count} color="var(--ad-danger)" />
        ))}
      </div>

      {/* פילוח לפי השקעה */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 14 }}>מה הם משקיעים היום</div>
        {Object.entries(segCount).sort((a, b) => b[1] - a[1]).map(([seg, count]) => (
          <Bar key={seg} label={SEG_LABEL[seg] || seg} pct={Math.round((count / n) * 100)} count={count} color="var(--ad-accent)" />
        ))}
      </div>

      {/* התפלגות תשובות לכל שאלה */}
      <div style={{ ...S.card, padding: 20 }}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>מה אנשים עונים — לפי שאלה</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 18 }}>ירוק = תשובה חזקה · אדום = תשובה חלשה</div>
        {answerDist.map(({ q, i, counts, answered }) => (
          <div key={i} style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--ad-line)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--brand-prime)', fontWeight: 700, marginBottom: 4 }}>{CATS[q.cat]}</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{q.t}</div>
            {q.o.map((opt, oi) => {
              const pct = Math.round((counts[oi] / answered) * 100);
              const col = opt[1] === 3 ? 'var(--brand-prime)' : opt[1] === 1 ? 'var(--ad-warn)' : 'var(--ad-danger)';
              return <Bar key={oi} label={opt[0]} pct={pct} count={counts[oi]} color={col} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SHELL: one work area (היום · לקוחות · לידים מהאתר · האתר) ──────────────

const SECTIONS = [
  { id: 'today',   label: 'היום' },
  { id: 'clients', label: 'לקוחות' },
  { id: 'leads',   label: 'לידים מהאתר' },
  { id: 'site',    label: 'האתר' },
];

const LEADS_TABS = [
  { id: 'leads',      label: 'לידים' },
  { id: 'auditstats', label: 'שאלון אבחון' },
];

// existing content tabs, grouped under "האתר"
const SITE_GROUPS = [
  { id: 'home', label: 'דף הבית', tabs: [
    { id: 'contact',  label: 'תוכן וקשר' },
    { id: 'trust',    label: 'רצועת אמון' },
    { id: 'pain',     label: 'כאב' },
    { id: 'process',  label: 'תהליך' },
    { id: 'outcomes', label: 'מה תקבל' },
    { id: 'whyme',    label: 'למה אני' },
    { id: 'faqs',     label: 'שאלות' },
    { id: 'stats',    label: 'סטטיסטיקות' },
  ] },
  { id: 'proof', label: 'עדויות וקייסים', tabs: [
    { id: 'testimonials', label: 'עדויות' },
    { id: 'proofcases',   label: 'קייסים' },
    { id: 'proofgrid',    label: 'גריד מודעות' },
  ] },
  { id: 'ig',      label: 'אינסטגרם', tabs: [{ id: 'ig', label: 'כפתורי /ig' }] },
  { id: 'prompts', label: 'פרומפטים', tabs: [{ id: 'prompts', label: 'פרומפטים' }] },
];

const TAB_COMPONENTS = {
  leads: LeadsTab, auditstats: AuditStatsTab, contact: ContactTab, trust: TrustTab, pain: PainTab,
  process: ProcessTab, outcomes: OutcomesTab, whyme: WhyMeTab, proofcases: ProofCasesTab,
  proofgrid: ProofGridTab, faqs: FaqsTab, testimonials: TestimonialsTab, stats: StatsTab,
  prompts: PromptsTab, ig: IgLinksTab,
};

function SubTabs({ items, active, onPick, className = '', badge }) {
  return (
    <div className={`admin-tabs ${className}`} role="tablist" style={{ marginBottom: 22 }}>
      {items.map(t => (
        <button key={t.id} role="tab" aria-selected={active === t.id} className="admin-tab" data-active={active === t.id} onClick={() => onPick(t.id)}>
          {t.label}
          {badge?.[t.id] > 0 && <span className="tab-count">{badge[t.id]}</span>}
        </button>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const [newLeads, setNewLeads] = useState(0);
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  const section = SECTIONS.some(s => s.id === params.get('s')) ? params.get('s') : 'today';
  const tab = params.get('t');
  const go = (s, t) => setParams(t ? { s, t } : { s }, { replace: true });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, key: Date.now() });
  }, []);

  useEffect(() => {
    supabase.rpc('is_hub_admin').then(({ data, error }) => setIsAdmin(!error && data === true));
  }, []);

  // ספירת לידים שלא טופלו, ל-badge בתפריט
  useEffect(() => {
    let alive = true;
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('handled', false)
      .then(({ count, error }) => { if (alive && !error) setNewLeads(count || 0); });
    return () => { alive = false; };
  }, [section, tab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (isAdmin === false) {
    return (
      <div className="admin-scope" dir="rtl" style={{ minHeight: '100dvh' }}>
        <div className="adm-denied">
          <h1>אין גישה</h1>
          <p>המשתמש הזה לא מורשה לאזור העבודה.</p>
          <button style={S.btn('ghost')} onClick={handleSignOut}>יציאה</button>
        </div>
      </div>
    );
  }

  let body = null;
  if (section === 'today') body = <TodayView newLeads={newLeads} onGo={(s) => go(s)} />;
  if (section === 'clients') body = <ClientsView />;
  if (section === 'leads') {
    const t = LEADS_TABS.some(x => x.id === tab) ? tab : 'leads';
    const C = TAB_COMPONENTS[t];
    body = <>
      <SubTabs items={LEADS_TABS} active={t} onPick={(id) => go('leads', id)} badge={{ leads: newLeads }} />
      <C toast={showToast} />
    </>;
  }
  if (section === 'site') {
    const group = SITE_GROUPS.find(g => g.tabs.some(x => x.id === tab)) || SITE_GROUPS[0];
    const t = group.tabs.some(x => x.id === tab) ? tab : group.tabs[0].id;
    const C = TAB_COMPONENTS[t];
    body = <>
      <SubTabs items={SITE_GROUPS} active={group.id} onPick={(gid) => go('site', SITE_GROUPS.find(g => g.id === gid).tabs[0].id)} />
      {group.tabs.length > 1 && <SubTabs className="adm-subtabs-2" items={group.tabs} active={t} onPick={(id) => go('site', id)} />}
      <C toast={showToast} />
    </>;
  }

  const title = SECTIONS.find(s => s.id === section).label;

  return (
    <HubProvider>
    <div className="admin-scope adm-app" dir="rtl">
      <aside className="adm-side" aria-label="תפריט">
        <div className="adm-brand"><picture><source srcSet="/logo.png" media="(prefers-color-scheme: dark)" /><img src="/logo-onlight.png" alt="Shift Up" /></picture><span>המרכז</span></div>
        <nav style={{ display: 'grid', gap: 2 }}>
          {SECTIONS.map(s => (
            <button key={s.id} className="adm-nav-item" aria-current={section === s.id ? 'page' : undefined} onClick={() => go(s.id)}>
              {s.label}
              {s.id === 'leads' && newLeads > 0 && <span className="adm-count">{newLeads}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a className="adm-link-quiet" href="/" target="_blank" rel="noopener noreferrer">צפה באתר ↗</a>
          <button className="adm-link-quiet" onClick={handleSignOut}>יציאה</button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <div className="adm-top-row">
            <picture><source srcSet="/logo.png" media="(prefers-color-scheme: dark)" /><img className="adm-top-mobile-logo" src="/logo-onlight.png" alt="Shift Up" /></picture>
            <h1>{title}</h1>
            <div className="adm-top-actions adm-top-mobile-only">
              <button className="adm-link-quiet" onClick={handleSignOut}>יציאה</button>
            </div>
          </div>
          <div className="adm-top-row" style={{ flexWrap: 'wrap', gap: '6px 16px' }}>
            <HebrewDates />
            <SyncBar />
          </div>
        </header>

        <main className="adm-content">{isAdmin === null ? <div className="hub-skel" /> : body}</main>
      </div>

      <nav className="adm-bottom" aria-label="תפריט">
        {SECTIONS.map(s => (
          <button key={s.id} aria-current={section === s.id ? 'page' : undefined} onClick={() => go(s.id)}>
            {s.label}
            {s.id === 'leads' && newLeads > 0 && <span className="adm-count">{newLeads}</span>}
          </button>
        ))}
      </nav>

      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
    </HubProvider>
  );
}
