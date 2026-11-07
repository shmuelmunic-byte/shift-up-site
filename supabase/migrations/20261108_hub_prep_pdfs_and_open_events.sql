-- Applied to shift-up-cms on 2026-11-08 (migration name: hub_prep_pdfs_and_open_events).
-- 1) Call-prep PDFs: a private bucket the local sync agent uploads to (service role).
--    Only the hub admin can read, and only through short signed links from /admin.
-- 2) Calendar items with no date yet ("בלי תאריך", "אמצע נובמבר", "אחרי 15.11") are
--    mirrored too, with starts_at empty and the original wording in when_text.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hub-prep', 'hub-prep', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "hub admin read prep pdfs" on storage.objects for select to authenticated
  using (bucket_id = 'hub-prep' and (select public.is_hub_admin()));

alter table public.hub_events alter column starts_at drop not null;
