-- ═══════════════════════════════════════════════════════════════════════
-- audit_stats(p_score) — סטטיסטיקה חיה של האבחון, בלי לחשוף שורות בודדות
-- ולבלי לחשוף את מספר המשיבים (N קטן, לא מציגים אותו).
--
-- מחזיר JSON: { avg, better_than }
--   avg         = הציון הממוצע (מעוגל), מחושב בזמן אמת בכל קריאה.
--   better_than = כמה אחוזים מהמשיבים קיבלו ציון נמוך משלך (אחוזון).
--
-- SECURITY DEFINER: עוקף את ה-RLS (שחוסם קריאת שורות בודדות ל-anon),
-- אבל מחזיר רק אגרגט — אף פרט אישי ואף שורה בודדת לא דולפים החוצה.
-- להריץ פעם אחת ב-Supabase SQL Editor. idempotent.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.audit_stats(p_score int default null)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'avg', coalesce(round(avg(score)), 0)::int,
    'better_than', case
      when p_score is null or count(*) = 0 then null
      else round(100.0 * count(*) filter (where score < p_score) / count(*))::int
    end
  )
  from audit_results;
$$;

-- זמין לגולש אנונימי (מי שממלא את האבחון) וגם למחובר.
grant execute on function public.audit_stats(int) to anon, authenticated;
