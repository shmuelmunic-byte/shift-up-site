-- Applied to shift-up-cms on 2026-11-07 (migration name: hub_stage1_tables_rls).
-- Unified work area (/admin), stage 1: mirror tables + action queue, admin-only access.
-- Files in the client center stay the source of truth; these tables are a live
-- mirror written only by the local sync agent (service role, bypasses RLS).

create table public.hub_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_hub_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.hub_admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_hub_admin() from public, anon;
grant execute on function public.is_hub_admin() to authenticated;

create table public.hub_clients (
  id text primary key, name text not null, business text, stage text, status text,
  next_action text, waiting_on text, waiting_since date, next_meeting_at timestamptz,
  payment_status text, phone text, folder_path text,
  tasks_done int not null default 0, tasks_total int not null default 0,
  file_updated date, synced_at timestamptz not null default now()
);

create table public.hub_tasks (
  id text primary key, client_id text references public.hub_clients(id) on delete cascade,
  title text not null, owner text, waiting_on text, since date, due date,
  status text not null default 'open', done_at date, source_file text,
  synced_at timestamptz not null default now()
);
create index hub_tasks_client_idx on public.hub_tasks(client_id);
create index hub_tasks_due_idx on public.hub_tasks(due) where status = 'open';

create table public.hub_events (
  id text primary key, client_id text references public.hub_clients(id) on delete set null,
  title text not null, kind text, starts_at timestamptz not null, ends_at timestamptz,
  prep_pdf text, synced_at timestamptz not null default now()
);
create index hub_events_start_idx on public.hub_events(starts_at);
create index hub_events_client_idx on public.hub_events(client_id);

create table public.hub_inbox (
  id text primary key, client_id text references public.hub_clients(id) on delete set null,
  contact_name text, phone text, kind text not null check (kind in ('reply','reach_out')),
  preview varchar(140), last_message_at timestamptz, priority int not null default 0,
  synced_at timestamptz not null default now()
);
create index hub_inbox_client_idx on public.hub_inbox(client_id);

create table public.hub_collect (
  id text primary key, client_id text references public.hub_clients(id) on delete set null,
  who text not null, amount numeric(10,2), since date, note text,
  status text not null default 'open' check (status in ('open','paid')), paid_at date,
  synced_at timestamptz not null default now()
);
create index hub_collect_client_idx on public.hub_collect(client_id);

create table public.hub_goals (
  key text primary key, label text not null, current numeric, target numeric,
  synced_at timestamptz not null default now()
);

create table public.hub_actions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  kind text not null check (kind in ('task_done','task_add','task_postpone','payment_received')),
  target_id text, payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','applied','failed')),
  applied_at timestamptz, error text
);
create index hub_actions_pending_idx on public.hub_actions(created_at) where status = 'pending';
create index hub_actions_created_by_idx on public.hub_actions(created_by);

create table public.hub_sync_status (
  agent text primary key, last_seen_at timestamptz, last_ok_at timestamptz, note text
);

alter table public.hub_admins      enable row level security;
alter table public.hub_clients     enable row level security;
alter table public.hub_tasks       enable row level security;
alter table public.hub_events      enable row level security;
alter table public.hub_inbox       enable row level security;
alter table public.hub_collect     enable row level security;
alter table public.hub_goals       enable row level security;
alter table public.hub_actions     enable row level security;
alter table public.hub_sync_status enable row level security;

revoke all on public.hub_admins, public.hub_clients, public.hub_tasks, public.hub_events,
  public.hub_inbox, public.hub_collect, public.hub_goals, public.hub_actions, public.hub_sync_status from anon;

create policy "hub admin read" on public.hub_clients     for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_tasks       for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_events      for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_inbox       for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_collect     for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_goals       for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read" on public.hub_sync_status for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin read own" on public.hub_admins  for select to authenticated using (user_id = (select auth.uid()));
create policy "hub admin read" on public.hub_actions for select to authenticated using ((select public.is_hub_admin()));
create policy "hub admin queue" on public.hub_actions for insert to authenticated
  with check ((select public.is_hub_admin()) and status = 'pending' and created_by = (select auth.uid()));

-- the single admin = the existing site admin user
insert into public.hub_admins (user_id, email)
select id, email from auth.users where email = 'shmuelmunic@gmail.com';

alter publication supabase_realtime add table
  public.hub_clients, public.hub_tasks, public.hub_events, public.hub_inbox,
  public.hub_collect, public.hub_goals, public.hub_actions, public.hub_sync_status;
