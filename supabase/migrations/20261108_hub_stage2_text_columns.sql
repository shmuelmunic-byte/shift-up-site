-- Applied to shift-up-cms on 2026-11-08 (migration name: hub_stage2_text_columns).
-- Stage 2 (sync agent): keep the original free text next to parsed dates/amounts,
-- since the center files write things like "אחרי 10.11" or "שבוע הבא".
alter table public.hub_tasks add column if not exists due_text text, add column if not exists status_note text, add column if not exists section text;
alter table public.hub_events add column if not exists when_text text;
alter table public.hub_collect add column if not exists amount_text text;
