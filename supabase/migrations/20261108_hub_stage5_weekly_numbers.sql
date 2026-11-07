-- hub stage 5: weekly sales numbers (this week vs last week) live in hub_goals
-- previous = last week's count, detail = names behind this week's count
alter table public.hub_goals add column if not exists previous numeric;
alter table public.hub_goals add column if not exists detail text;
