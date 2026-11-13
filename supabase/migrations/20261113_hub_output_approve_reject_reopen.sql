-- Applied to shift-up-cms on 2026-11-13 (migration name: hub_output_approve_reject_reopen).
-- "מאשר" / "לא מאשר" (with reasons) on an agent's output waiting for Shmuel, and "החזר לאישור"
-- on a task marked done/approved in the last 24h. hub-sync writes them to משימות_תיק.md and the agency queue.
alter table public.hub_actions drop constraint if exists hub_actions_kind_check;
alter table public.hub_actions add constraint hub_actions_kind_check
  check (kind in ('task_done','task_add','task_postpone','task_irrelevant','payment_received','file_open','agent_start','step_approve','output_approve','output_reject','task_reopen'));
