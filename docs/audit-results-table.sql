-- ════════════════════════════════════════════════════════════════════════
-- Shift Up · טבלת audit_results — תוצאות אבחון אנונימיות (/audit)
-- ════════════════════════════════════════════════════════════════════════
-- איך מריצים: Supabase Dashboard → SQL Editor → New query → הדבק → Run.
-- בטוח להריץ שוב (idempotent) — לא מוחק נתונים קיימים.
--
-- ⚠️ פרטיות: הטבלה הזו **אנונימית לחלוטין**. אין בה שם, טלפון, מייל,
--    IP או כל מזהה אחר, ואין מפתח שמקשר אותה לטבלת `leads`.
--    היא נועדה אך ורק לסטטיסטיקה מצטברת (ממוצעים, דליפות נפוצות).
--    לידים שהשאירו פרטים נשמרים בנפרד ב-`leads`.
-- ────────────────────────────────────────────────────────────────────────

create table if not exists public.audit_results (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  score       int  not null,          -- ציון כולל 0-100
  segment     text,                   -- time | both | money | none (מה משקיע היום)
  cat_scores  jsonb,                  -- {"offer":50,"funnel":67,"measure":0,...}
  answers     jsonb,                  -- [{"q":1,"cat":"offer","score":0}, ...]
  leaks       jsonb                   -- ["ההצעה שלך נשמעת כמו כולם", ...]
);

create index if not exists audit_results_created_at_idx on public.audit_results (created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.audit_results enable row level security;

-- מבקר אנונימי (anon key באתר) — מותר רק להוסיף תוצאה. אסור לקרוא/למחוק.
drop policy if exists "anon insert audit_results" on public.audit_results;
create policy "anon insert audit_results"
  on public.audit_results for insert
  to anon, authenticated
  with check (true);

-- אדמין מחובר (supabase.auth) — קורא בלבד (סטטיסטיקה ב-/admin).
drop policy if exists "auth read audit_results" on public.audit_results;
create policy "auth read audit_results"
  on public.audit_results for select
  to authenticated
  using (true);

drop policy if exists "auth delete audit_results" on public.audit_results;
create policy "auth delete audit_results"
  on public.audit_results for delete
  to authenticated
  using (true);
