# Admin 2FA Emergency Rollback SQL Pack (`L6-2FA-02`)

Last updated: 2026-03-21

Use this pack only for hosted incident handling on the shared Supabase project.
It is intentionally copy/paste friendly for SQL Editor emergency use.

Safety rules:
- apply only during an approved incident window;
- record who ran the SQL, when, and why;
- keep this temporary and restore strict `aal2` after triage.

## 1) Quick Diagnostics (before patch)
Run first and keep the output in incident notes:

```sql
select pg_get_functiondef('public.is_admin_aal2()'::regprocedure) as is_admin_aal2_definition;

select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where
  (schemaname = 'public' and tablename in (
    'user_roles',
    'profiles',
    'materials',
    'courses',
    'modules',
    'activity_logs',
    'contact_messages',
    'system_settings'
  ))
  or
  (schemaname = 'storage' and tablename = 'objects' and policyname = 'Admins can delete any material')
order by schemaname, tablename, policyname;
```

## 2) Level 1 Emergency Patch (fastest, least invasive)
Use for immediate admin lockout recovery.
This only relaxes `public.is_admin_aal2()` and leaves policies unchanged.

```sql
begin;

create or replace function public.is_admin_aal2()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return public.is_admin();
end;
$$;

commit;
```

## 3) Level 2 Compatibility Patch (broader)
Use if Level 1 is not enough and admin policy behavior is still unstable.
This keeps admin-only checks but drops the strict `aal2` dependency temporarily.

```sql
begin;

create or replace function public.is_admin_aal2()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return public.is_admin();
end;
$$;

drop policy if exists "user_roles_admin_read_all" on public.user_roles;
create policy "user_roles_admin_read_all"
  on public.user_roles for select
  to authenticated
  using ( public.is_admin() );

drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert"
  on public.user_roles for insert
  to authenticated
  with check ( public.is_admin() );

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
  on public.user_roles for update
  to authenticated
  using ( public.is_admin() );

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
  on public.user_roles for delete
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can update all materials" on public.materials;
create policy "Admins can update all materials"
  on public.materials for update
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can delete all materials" on public.materials;
create policy "Admins can delete all materials"
  on public.materials for delete
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can delete any material" on storage.objects;
create policy "Admins can delete any material"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'materials' and public.is_admin() );

drop policy if exists "Admins can manage all courses" on public.courses;
create policy "Admins can manage all courses"
  on public.courses for all
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "Admins can manage all modules" on public.modules;
create policy "Admins can manage all modules"
  on public.modules for all
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "Admins can view logs" on public.activity_logs;
create policy "Admins can view logs"
  on public.activity_logs for select
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using ( public.is_admin() );

drop policy if exists "Admins can update settings" on public.system_settings;
create policy "Admins can update settings"
  on public.system_settings for update
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "Admins can insert settings" on public.system_settings;
create policy "Admins can insert settings"
  on public.system_settings for insert
  to authenticated
  with check ( public.is_admin() );

commit;
```

## 4) Level 3 Legacy Settings Fallback (last resort)
Use only if `system_settings` writes are the blocker and you explicitly accept weaker policy temporarily.

```sql
begin;

drop policy if exists "Admins can update settings" on public.system_settings;
drop policy if exists "Admins can insert settings" on public.system_settings;

create policy "Authenticated users can update settings"
  on public.system_settings for update
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can insert settings"
  on public.system_settings for insert
  with check ( auth.role() = 'authenticated' );

commit;
```

## 5) Strict Restore Script (re-enable intended hardening)
Run after incident triage when the platform is stable again.
This restores the intended `aal2` behavior from `20260319000000_admin_aal2_policies.sql`.

```sql
begin;

create or replace function public.is_admin_aal2()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return public.is_admin() and coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2';
end;
$$;

drop policy if exists "user_roles_admin_read_all" on public.user_roles;
create policy "user_roles_admin_read_all"
  on public.user_roles for select
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert"
  on public.user_roles for insert
  to authenticated
  with check ( public.is_admin_aal2() );

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
  on public.user_roles for update
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
  on public.user_roles for delete
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Admins can update all materials" on public.materials;
create policy "Admins can update all materials"
  on public.materials for update
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Admins can delete all materials" on public.materials;
create policy "Admins can delete all materials"
  on public.materials for delete
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Admins can delete any material" on storage.objects;
create policy "Admins can delete any material"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'materials' and public.is_admin_aal2() );

drop policy if exists "Admins can manage all courses" on public.courses;
create policy "Admins can manage all courses"
  on public.courses for all
  to authenticated
  using ( public.is_admin_aal2() )
  with check ( public.is_admin_aal2() );

drop policy if exists "Admins can manage all modules" on public.modules;
create policy "Admins can manage all modules"
  on public.modules for all
  to authenticated
  using ( public.is_admin_aal2() )
  with check ( public.is_admin_aal2() );

drop policy if exists "Admins can view logs" on public.activity_logs;
create policy "Admins can view logs"
  on public.activity_logs for select
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using ( public.is_admin_aal2() );

drop policy if exists "Authenticated users can update settings" on public.system_settings;
drop policy if exists "Authenticated users can insert settings" on public.system_settings;

drop policy if exists "Admins can update settings" on public.system_settings;
create policy "Admins can update settings"
  on public.system_settings for update
  to authenticated
  using ( public.is_admin_aal2() )
  with check ( public.is_admin_aal2() );

drop policy if exists "Admins can insert settings" on public.system_settings;
create policy "Admins can insert settings"
  on public.system_settings for insert
  to authenticated
  with check ( public.is_admin_aal2() );

commit;
```

## 6) After-Patch Validation (minimum)
- confirm admin can access critical admin flows;
- confirm no unexpected `401/403/42501` in admin mutations;
- run the `L6-2FA-02` checks in `docs/admin-2fa-validation-checklist.md`;
- record outcome in `docs/supabase-hosted-db-push-safe-rollout-checklist.md` section `5.1`.
