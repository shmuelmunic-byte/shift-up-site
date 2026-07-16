-- ════════════════════════════════════════════════════════════════════════
-- Shift Up · setup.sql — קובץ הרצה אחד (לידים + CMS + התראת מייל)
-- ────────────────────────────────────────────────────────────────────────
-- מריצים פעם אחת: Supabase → SQL Editor → New query → הדבק הכל → Run.
-- idempotent — בטוח להריץ שוב. עד שמריצים, האתר עובד על fallback מהקוד.
-- לפני הרצה: ב-PART 3 החלף את re_REPLACE_WITH_YOUR_KEY במפתח Resend שלך.
-- ════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════
-- PART 1 · טבלת leads (לידים מהטופס)
-- ════════════════════════════════════════════════════════════════════════

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


-- ════════════════════════════════════════════════════════════════════════
-- PART 2 · CMS לסקשנים (Trust / Pain / WhatYouGet / Proof) + טקסטים
-- ════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════
-- Shift Up · CMS לסקשנים החדשים (Trust / Pain / WhatYouGet / Proof)
-- ────────────────────────────────────────────────────────────────────────
-- מריצים פעם אחת: Supabase → SQL Editor → New query → הדבק → Run.
-- בטוח להריץ שוב (idempotent): טבלאות נזרעות רק אם ריקות, site_content עם on conflict.
-- עד שמריצים — האתר מציג fallback מהקוד, לא נשבר.
-- ════════════════════════════════════════════════════════════════════════

-- פונקציית עזר ל-RLS אחיד: public read + auth write
create or replace function public._apply_cms_rls(tbl text) returns void as $$
begin
  execute format('alter table public.%I enable row level security', tbl);
  execute format('drop policy if exists "public read" on public.%I', tbl);
  execute format('create policy "public read" on public.%I for select using (true)', tbl);
  execute format('drop policy if exists "auth write" on public.%I', tbl);
  execute format($p$create policy "auth write" on public.%I for all to authenticated using (true) with check (true)$p$, tbl);
end; $$ language plpgsql;

-- ── trust_pillars (סקשן 2) ───────────────────────────────────────────────
create table if not exists public.trust_pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null, text text not null, position int not null default 0
);
select public._apply_cms_rls('trust_pillars');
insert into public.trust_pillars (title, text, position)
select * from (values
  ('מבוסס מחקר', 'אף שקל לא נכנס לקמפיין לפני מחקר: קהל, מתחרים, מסר. החלטות על דאטה — לא על תחושת בטן.', 0),
  ('הבטחת ביצוע', 'חודש הניהול הראשון על אחריותי: אם הוא לא מביא פניות — ממשיך לעבוד בלי לגבות, עד שעובד.', 1),
  ('בגובה העיניים', 'שותף ביצוע, לא מוכר. שיחת היכרות חינם — נבדוק התאמה בלי לחץ ובלי באזוורדז.', 2)
) as v(title, text, position)
where not exists (select 1 from public.trust_pillars);

-- ── pain_points (סקשן 3) ─────────────────────────────────────────────────
create table if not exists public.pain_points (
  id uuid primary key default gen_random_uuid(),
  text text not null, position int not null default 0
);
select public._apply_cms_rls('pain_points');
insert into public.pain_points (text, position)
select * from (values
  ('שורף תקציב על ממומן — והלידים פשוט לא מגיעים.', 0),
  ('מפרסם, אבל לא באמת בטוח מה המסר שעובד, ולמי.', 1),
  ('במקום לנהל את העסק, אתה רודף אחרי הקמפיינים והפוסטים.', 2),
  ('כבר נכווית מסוכנות שהבטיחה הרים — והעבירה אותך למתמחה.', 3)
) as v(text, position)
where not exists (select 1 from public.pain_points);

-- ── outcomes (סקשן 6 — "מה תקבל") ────────────────────────────────────────
create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),
  title text not null, text text not null, position int not null default 0
);
select public._apply_cms_rls('outcomes');
insert into public.outcomes (title, text, position)
select * from (values
  ('לידים שנכנסים — לא רק חשיפות', 'קמפיינים שמביאים פניות אמיתיות מלקוחות שמתאימים לך. לא לייקים, לא "מודעות מותג" מעורפלת — פניות שאפשר לסגור.', 0),
  ('שקט נפשי — מישהו אחד אחראי', 'אתה מפסיק לרדוף אחרי פוסטים, קמפיינים ומספרים. איש אחד לוקח את כל השיווק לידיים, מבצע ומדווח לך.', 1),
  ('מסר חד שאתה גאה בו', 'סוף סוף השיווק שלך נשמע כמוך — מזקק את מה שמייחד אותך, ומבדל אותך מהמתחרים בלי הנחות.', 2),
  ('הזמן שלך חוזר אליך', 'במקום להתעסק בשיווק, אתה חוזר לעשות את מה שאתה הכי טוב בו — לנהל ולהצמיח את העסק.', 3)
) as v(title, text, position)
where not exists (select 1 from public.outcomes);

-- ── proof_cases (סקשן 8 — קייסים, steps = jsonb) ─────────────────────────
-- steps = text שמכיל JSON (array של {k,v}). נקרא ב-Proof.jsx עם JSON.parse,
-- ונערך ב-/admin כ-textarea רגיל (jsonb היה מציג [object Object] בעריכה).
create table if not exists public.proof_cases (
  id uuid primary key default gen_random_uuid(),
  tag text, title text not null, subtitle text, quote text,
  steps text not null default '[]', position int not null default 0
);
select public._apply_cms_rls('proof_cases');
insert into public.proof_cases (tag, title, subtitle, quote, steps, position)
select * from (values
  ('דוגמת תהליך', 'עסק קינוחי בוטיק', 'מיצוב פרימיום בשוק רווי', 'We don''t sell cakes, we sell style.',
   '[{"k":"הכאב","v":"בשוק רווי, הלקוחה לא שואלת \"כמה זה עולה\" — אלא \"מה יגידו?\". המחיר לא הבעיה, הסטטוס הוא."},{"k":"המיצוב","v":"לא עוד קונדיטוריה — בית עיצוב. מוכרים חוויה ויוקרה, לא קילו שוקולד."},{"k":"המשפך","v":"פרסונה ברורה (\"הפרפקציוניסטית המארחת\"), מסר שמדבר לסטטוס, וערוצים ויזואליים שמשדרים יוקרה."}]', 0),
  ('דוגמת תהליך · פרויקט קורס', 'City Transformer', 'יצירת קטגוריה חדשה', 'קטן עליך.',
   '[{"k":"הבעיה","v":"רכב חשמלי מתקפל — קטגוריה שאין לה עדיין מדף בתודעת הצרכן."},{"k":"המיצוב","v":"במקום להילחם על מקום קיים — יוצרים קטגוריה חדשה. קונספט \"קטן עליך\"."},{"k":"הקריאייטיב","v":"שפת מותג Urban Luxury, פרסונות, וסטוריבורד וידאו שמספר את הסיפור."}]', 1)
) as v(tag, title, subtitle, quote, steps, position)
where not exists (select 1 from public.proof_cases);

-- ── proof_grid (סקשן 8 — גריד מודעות) ────────────────────────────────────
-- file = שם קובץ בתוך public/portfolio/ (העלאת תמונות = ידנית לתיקייה, לא דרך admin)
create table if not exists public.proof_grid (
  id uuid primary key default gen_random_uuid(),
  file text not null, client text not null, field text, position int not null default 0
);
select public._apply_cms_rls('proof_grid');
insert into public.proof_grid (file, client, field, position)
select * from (values
  ('events-yehuda.jpg', 'יהודה סימן-טוב', 'אירועים', 0),
  ('realestate-villas.jpg', 'Real Estate', 'נדל"ן', 1),
  ('legal-skler.jpg', 'עו"ד סקלר', 'משפטי', 2),
  ('retail-kehilot-card.jpg', 'קהילות קארד', 'קמעונאות', 3),
  ('food-shira-events.jpg', 'SHIRA', 'אוכל', 4),
  ('health-24fit.png', '24fit', 'כושר', 5),
  ('home-emanuel.jpg', 'עמנואל צבע', 'שירותי בית', 6),
  ('beauty-hili.jpg', 'Hili Nails', 'יופי', 7),
  ('education-imahot.jpg', 'סדנת אימהות', 'הורות', 8)
) as v(file, client, field, position)
where not exists (select 1 from public.proof_grid);

-- ── site_content — טקסטים בודדים (כותרות/תת-כותרות) ──────────────────────
-- key, value, section, label, type. נערכים אוטומטית בטאב "תוכן" ב-/admin.
insert into public.site_content (key, value, section, label, type) values
  ('trust.title',          'למה לסמוך עליי?',            'רצועת אמון', 'כותרת', 'text'),
  ('trust.title_accent',   'כי הסיכון עליי.',            'רצועת אמון', 'כותרת — חלק ירוק', 'text'),
  ('pain.kicker',          'רגע של אמת',                  'כאב', 'תווית עליונה', 'text'),
  ('pain.title',           'נמאס לרדוף אחרי השיווק — ולא לראות תוצאה?', 'כאב', 'כותרת (הוק)', 'text'),
  ('pain.bridge',          'זה לא חייב להיות ככה.',        'כאב', 'מעבר — חלק לבן', 'text'),
  ('pain.bridge_accent',   'יש דרך אחת מסודרת.',          'כאב', 'מעבר — חלק ירוק', 'text'),
  ('wyg.kicker',           'What You Get',                'מה תקבל', 'תווית עליונה', 'text'),
  ('wyg.title',            'בשורה התחתונה?',              'מה תקבל', 'כותרת — חלק לבן', 'text'),
  ('wyg.title_accent',     'לידים ושקט.',                 'מה תקבל', 'כותרת — חלק ירוק', 'text'),
  ('wyg.subtitle',         'אתה ממשיך לנהל את העסק. את השיווק אני לוקח על עצמי — וזה מה שמחזירים לך.', 'מה תקבל', 'תת-כותרת', 'textarea'),
  ('wyg.summary',          'תפסיק להיות מנהל שיווק במשרה חלקית.', 'מה תקבל', 'שורת סיכום — חלק לבן', 'text'),
  ('wyg.summary_accent',   'תהיה שוב הבעלים.',            'מה תקבל', 'שורת סיכום — חלק ירוק', 'text'),
  ('proof.kicker',         'The Proof',                   'הוכחה', 'תווית עליונה', 'text'),
  ('proof.title',          'לא מבטיח.',                   'הוכחה', 'כותרת — חלק לבן', 'text'),
  ('proof.title_accent',   'מראה.',                       'הוכחה', 'כותרת — חלק ירוק', 'text'),
  ('proof.lead',           'קודם החשיבה — איך מחקר מדויק בונה מיצוב של עסק. אחר כך הביצוע — קריאייטיב אמיתי שיצרתי, בכל תחום ולכל קהל.', 'הוכחה', 'פסקת פתיחה', 'textarea'),
  ('proof.grid_title',     'קריאייטיב שמוכר —',           'הוכחה', 'כותרת גריד — חלק לבן', 'text'),
  ('proof.grid_title_accent','בכל תחום, לכל קהל.',        'הוכחה', 'כותרת גריד — חלק ירוק', 'text'),
  ('leadform.scarcity',    'מקום קייס מייסדים אחד פנוי — הקמה 1,500 ₪ במקום 2,250 ₪', 'טופס לידים', 'רצועת scarcity', 'text'),
  ('leadform.title',       'בוא נעשה לעסק שלך',           'טופס לידים', 'כותרת — חלק כהה', 'text'),
  ('leadform.title_accent','Shift Up.',                   'טופס לידים', 'כותרת — חלק ירוק', 'text'),
  ('leadform.subtitle',    'השאר פרטים ואחזור אליך לשיחת היכרות קצרה — נבדוק יחד אם יש התאמה.', 'טופס לידים', 'תת-כותרת', 'textarea'),
  ('leadform.price_note',  'הקמה 2,250 ₪ + ניהול מ-1,300 ₪/חודש · חודש הניהול הראשון — על אחריותי.', 'טופס לידים', 'שורת מחיר', 'text'),
  ('leadform.wa_title',    'מעדיף לדבר עכשיו?',           'טופס לידים', 'כותרת וואטסאפ', 'text'),
  ('leadform.soft_door',   'עוד לא בשל? זה בסדר. תוכל פשוט לעקוב ולקבל ערך — גלול מטה לקהילת ה-WhatsApp השקטה.', 'טופס לידים', 'דלת שלישית רכה', 'textarea')
on conflict (key) do nothing;

drop function if exists public._apply_cms_rls(text);

-- ════════════════════════════════════════════════════════════════════════
-- PART 3 · התראת מייל על ליד חדש (pg_net → Resend) — בלי Edge Function/CLI
-- ════════════════════════════════════════════════════════════════════════
-- ⚠️ ערוך שורה אחת: החלף 're_REPLACE_WITH_YOUR_KEY' במפתח שלך מ-resend.com.
--    (אופציונלי) שנה את כתובת היעד אם לא shmuelmunic@gmail.com.
-- בלי מפתח תקין — הטריגר פשוט מדלג, הליד נשמר כרגיל.

create extension if not exists pg_net;

-- שמירת סודות ב-Vault (פעם אחת)
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'resend_api_key') then
    perform vault.create_secret('re_REPLACE_WITH_YOUR_KEY', 'resend_api_key');
  end if;
  if not exists (select 1 from vault.secrets where name = 'notify_to') then
    perform vault.create_secret('shmuelmunic@gmail.com', 'notify_to');
  end if;
end $$;

-- פונקציית הטריגר: שולחת מייל דרך Resend על כל ליד חדש
create or replace function public.notify_new_lead() returns trigger
language plpgsql security definer as $$
declare
  api_key text;
  to_addr text;
  wa text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into to_addr from vault.decrypted_secrets where name = 'notify_to';
  if api_key is null or api_key = 're_REPLACE_WITH_YOUR_KEY' then
    return new; -- מפתח לא הוגדר — מדלגים בשקט, הליד כבר נשמר
  end if;

  wa := regexp_replace(coalesce(new.phone, ''), '\D', '', 'g');
  wa := regexp_replace(wa, '^0', '972');

  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json'),
    body    := jsonb_build_object(
      'from',    'Shift Up Leads <onboarding@resend.dev>',
      'to',      jsonb_build_array(coalesce(to_addr, 'shmuelmunic@gmail.com')),
      'subject', '📥 ליד חדש: ' || coalesce(new.name, new.phone),
      'html',
        '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:520px;margin:auto">' ||
        '<div style="background:#0c1118;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">' ||
        '<div style="color:#34d97b;font-weight:bold;font-size:12px">ליד חדש · SHIFT UP</div>' ||
        '<div style="font-size:20px;font-weight:900">' || coalesce(new.name, 'ללא שם') || '</div></div>' ||
        '<div style="background:#f4f7fb;color:#0c1118;padding:18px 22px;border-radius:0 0 12px 12px;line-height:1.8">' ||
        '<b>טלפון:</b> ' || coalesce(new.phone, '—') || '<br>' ||
        '<b>תחום:</b> '  || coalesce(new.business, '—') || '<br>' ||
        '<b>הודעה:</b> ' || coalesce(new.message, '—') || '<br>' ||
        '<b>מקור:</b> '  || coalesce(new.source, 'form') ||
        '<div style="margin-top:14px">' ||
        '<a href="https://wa.me/' || wa || '" style="background:#25955a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">פתח בוואטסאפ</a> ' ||
        '<a href="https://www.shiftup.marketing/admin" style="color:#117a41;padding:10px;font-weight:bold">/admin</a>' ||
        '</div></div></div>'
    )
  );
  return new;
end $$;

drop trigger if exists trg_notify_new_lead on public.leads;
create trigger trg_notify_new_lead
  after insert on public.leads
  for each row execute function public.notify_new_lead();

-- בדיקה ידנית (אופציונלי): הסר הערה והרץ כדי לקבל מייל מיד.
-- insert into public.leads (name, phone, business, message) values ('בדיקה', '0501234567', 'בדיקה', 'מייל בדיקה');
