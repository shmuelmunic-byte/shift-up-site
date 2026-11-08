-- /admin requires a second factor: is_hub_admin() is true only for an aal2 session.
-- Applied AFTER Shmuel enrolled an authenticator (otherwise the admin is locked out of every hub_* and site table).
-- The sync agent uses the service key and is not affected.
create or replace function public.is_hub_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.hub_admins a where a.user_id = (select auth.uid()))
     and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
$$;
