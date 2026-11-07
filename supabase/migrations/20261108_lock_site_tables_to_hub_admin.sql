-- Applied to shift-up-cms on 2026-11-08 (migration name: lock_site_tables_to_hub_admin).
-- Before: any authenticated user could read leads/audit results and edit site content.
-- Now only hub admins (is_hub_admin()). Public read + anon insert policies are unchanged.

drop policy "auth read leads"   on public.leads;
drop policy "auth update leads" on public.leads;
drop policy "auth delete leads" on public.leads;
create policy "admin read leads"   on public.leads for select to authenticated using ((select public.is_hub_admin()));
create policy "admin update leads" on public.leads for update to authenticated using ((select public.is_hub_admin())) with check ((select public.is_hub_admin()));
create policy "admin delete leads" on public.leads for delete to authenticated using ((select public.is_hub_admin()));

drop policy "auth read audit_results"   on public.audit_results;
drop policy "auth delete audit_results" on public.audit_results;
create policy "admin read audit_results"   on public.audit_results for select to authenticated using ((select public.is_hub_admin()));
create policy "admin delete audit_results" on public.audit_results for delete to authenticated using ((select public.is_hub_admin()));

do $$
declare r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('faqs','ig_links','outcomes','pain_points','process_steps','prompts',
                        'proof_cases','proof_grid','site_content','stats','testimonials',
                        'trust_pillars','why_me_reasons')
      and cmd = 'ALL'
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
    execute format(
      'create policy "admin write" on public.%I for all to authenticated using ((select public.is_hub_admin())) with check ((select public.is_hub_admin()))',
      r.tablename);
  end loop;
end $$;
