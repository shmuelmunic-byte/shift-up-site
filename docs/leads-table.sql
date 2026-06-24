-- ════════════════════════════════════════════════════════════════════════
-- Shift Up · טבלת leads — לידים מטופס דף הבית (LeadForm.jsx)
-- ════════════════════════════════════════════════════════════════════════
-- איך מריצים: Supabase Dashboard → SQL Editor → New query → הדבק → Run.
-- בטוח להריץ שוב (idempotent) — לא מוחק נתונים קיימים.
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  phone       text not null,
  business    text,
  message     text,
  source      text default 'landing_form',
  handled     boolean not null default false
);

-- אם הטבלה כבר קיימת בלי העמודות החדשות — מוסיף אותן בלי לשבור כלום
alter table public.leads add column if not exists business text;
alter table public.leads add column if not exists message  text;
alter table public.leads add column if not exists source   text default 'landing_form';
alter table public.leads add column if not exists handled  boolean not null default false;

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.leads enable row level security;

-- מבקר אנונימי (anon key באתר) — מותר רק להוסיף ליד. אסור לקרוא/למחוק.
drop policy if exists "anon insert leads" on public.leads;
create policy "anon insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- אדמין מחובר (supabase.auth) — קורא, מעדכן (סימון טופל), מוחק.
drop policy if exists "auth read leads" on public.leads;
create policy "auth read leads"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "auth update leads" on public.leads;
create policy "auth update leads"
  on public.leads for update
  to authenticated
  using (true) with check (true);

drop policy if exists "auth delete leads" on public.leads;
create policy "auth delete leads"
  on public.leads for delete
  to authenticated
  using (true);

-- ── (אופציונלי) התראת מייל על ליד חדש ───────────────────────────────────
-- לא נכלל כאן — דורש Edge Function / Database Webhook + ספק מייל (Resend וכו').
-- בינתיים: צפייה ב-/admin → טאב "📥 לידים".
