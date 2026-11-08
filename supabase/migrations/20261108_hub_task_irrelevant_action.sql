-- Applied to shift-up-cms on 2026-11-08 (migration name: hub_task_irrelevant_action).
-- "Not relevant" with a reason, from /admin. The sync agent moves the task to "בוצע" with ❌
-- and the reason, and adds a line to the client's log.
alter table public.hub_actions drop constraint if exists hub_actions_kind_check;
alter table public.hub_actions add constraint hub_actions_kind_check
  check (kind in ('task_done','task_add','task_postpone','task_irrelevant','payment_received'));
