-- Applied to shift-up-cms on 2026-11-23 (migration name: hub_crm_value_source_log).
-- CRM screens in /admin: deal value, lead source and a short log for the person-card timeline.
-- All three are optional and filled by the local sync agent (hub-sync.mjs) from the client's memory file:
--   deal_value = frontmatter key "שווי" (shekels)
--   source     = one word, from frontmatter "מקור" / "ערוץ" / "פוסט_מקור"
--   log        = the last 15 log lines: [{d, t, k, dir, x}], x capped at 180 chars, phone numbers removed
-- Read access stays as it is: the existing "hub admin read" policy on hub_clients.
alter table public.hub_clients
  add column if not exists deal_value numeric,
  add column if not exists source text,
  add column if not exists log jsonb;

comment on column public.hub_clients.deal_value is 'frontmatter key: שווי (shekels, optional)';
comment on column public.hub_clients.source is 'one word, from frontmatter מקור / ערוץ / פוסט_מקור';
comment on column public.hub_clients.log is 'last 15 log lines: [{d, t, k, dir, x}], x capped at 180 chars';
