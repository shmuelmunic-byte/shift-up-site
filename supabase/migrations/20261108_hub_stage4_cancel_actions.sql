-- Applied to shift-up-cms on 2026-11-08 (migration name: hub_stage4_cancel_actions).
-- Stage 4 (light actions): a tap in /admin is saved at once (no delayed send), and the
-- few seconds of "undo" mark it cancelled. The admin may only flip pending -> cancelled,
-- and only the status column. The local sync agent (service role) does the rest.
alter table public.hub_actions drop constraint if exists hub_actions_status_check;
alter table public.hub_actions add constraint hub_actions_status_check
  check (status in ('pending','applied','failed','cancelled'));
alter table public.hub_actions add constraint hub_actions_payload_small
  check (pg_column_size(payload) < 4000);

revoke update, delete, truncate, references, trigger on public.hub_actions from authenticated;
grant update (status) on public.hub_actions to authenticated;

create policy "hub admin cancel pending" on public.hub_actions for update to authenticated
  using ((select public.is_hub_admin()) and status = 'pending')
  with check ((select public.is_hub_admin()) and status = 'cancelled');
