# Supabase Hosted DB Push Safe Rollout Checklist

Use this checklist before any `supabase db push` against a hosted/shared Supabase project.
You can complete sections 1-3 as preflight evidence while rollout is paused.

## 1) Scope And Risk
- Shared backend impact: Netlify + Vercel are both affected immediately after push.
- Highest-risk migration in current queue: `20260319000000_admin_aal2_policies.sql` (admin authz behavior can change right away).
- Lower-risk migration in current queue: `20260320000000_security_event_sink_and_alert_incidents.sql` (adds observability tables/indexes).

## 2) Preflight (No Push Yet)
- [ ] Maintenance window or explicit team approval exists.
- [ ] Backup admin account is confirmed and can sign in.
- [ ] One admin account with working MFA factor is confirmed.
- [ ] Backup admin MFA factor is confirmed or a pre-window enrollment step is scheduled.
- [ ] Current commit hash and migration set are recorded.
- [ ] Latest hosted migration versions are captured from `supabase_migrations.schema_migrations`.
- [ ] Target project MFA/TOTP hosted setting is confirmed for the same project ref.
- [ ] Rollback SQL snippets (section 6) are ready in SQL Editor tab before push.
- [ ] `docs/admin-2fa-validation-checklist.md` section 3 preflight evidence pack is filled.

Record:
- Date/time:
- Project ref:
- Branch/commit:
- Operator:
- Backup operator:
- Evidence location (doc/log path):

## 2.1) Current paused preflight status (2026-03-21, no push)
- [ ] Maintenance window or explicit team approval exists.
- [x] Backup admin account is confirmed and can sign in.
- [x] One admin account with working MFA factor is confirmed.
- [ ] Backup admin MFA factor is confirmed or a pre-window enrollment step is scheduled.
- [x] Current commit hash and migration set are recorded.
- [ ] Latest hosted migration versions are captured from `supabase_migrations.schema_migrations`.
- [ ] Target project MFA/TOTP hosted setting is confirmed for the same project ref.
- [ ] Rollback SQL snippets are prepared in SQL Editor tab before push.
- [x] `docs/admin-2fa-validation-checklist.md` section 3 preflight evidence pack is filled.

Record snapshot:
- Date/time: `2026-03-21 15:07:53 +02:00`
- Project ref: `mitaozfutwlzrccrecct`
- Branch/commit: `security/lesson1-closeout-2026-03-18` @ `bf1bcbec8f1567bb41eb1cee4ceb84e77501c2ed` (`bf1bcbe`)
- Operator: `mariy`
- Backup operator: `pending assignment (required before hosted rollout window)`
- Evidence location:
  - `docs/admin-2fa-validation-checklist.md`
  - `docs/supabase-hosted-db-push-safe-rollout-checklist.md`

## 3) Pre-Push Smoke Baseline
- [ ] Admin login works.
- [ ] `aal1` admin gets MFA challenge as expected.
- [ ] `aal2` admin can complete at least one privileged action.
- [ ] Public critical paths (`/login.html`, `/register.html`) still load and work.
- [ ] Expected deny behavior for `aal1` admin mutation is documented (target error mapping and redirect path).

If baseline fails, do not push and keep hosted rollout paused.

## 4) Push Steps
1. Confirm you are linked to the intended project:
   - `supabase projects list`
   - `supabase link --project-ref <PROJECT_REF>` (if needed)
2. Review pending migration versions in SQL Editor:
   - `select version from supabase_migrations.schema_migrations order by version desc limit 20;`
3. Push migrations:
   - `supabase db push`

## 5) Post-Push Validation (Immediate)
- [ ] `L6-2FA-02` checks:
  - [ ] Fresh admin session (`aal1`) is redirected/challenged.
  - [ ] `aal2` required mutations are allowed only after challenge.
  - [ ] `aal1` mutation attempts are rejected.
  - [ ] Backup admin can complete MFA challenge and reach admin safely.
  - [ ] Last-factor removal is blocked or otherwise explicitly guarded by the intended UX/policy.
- [ ] `L6-OBS-03` checks:
  - [ ] `security_events` table exists and accepts entries.
  - [ ] `security_alert_incidents` table exists.
  - [ ] `security-event-ingest` function is reachable.

### 5.1) `L6-2FA-02` evidence log (copy/paste template)
- Window timestamp:
- Operator:
- Admin account tested:
- Step result:
  - `aal1` challenge redirect: PASS/FAIL + note
  - `aal2` privileged mutation: PASS/FAIL + note
  - `aal1` mutation rejection: PASS/FAIL + deny code/message
  - backup-admin MFA path: PASS/FAIL + note
- Decision:
  - keep `L6-2FA-02` `in_progress`, or
  - candidate for completion (only if recovery expectations are also closed).

Quick SQL checks:
```sql
select to_regclass('public.security_events') as security_events_table;
select to_regclass('public.security_alert_incidents') as security_alert_incidents_table;
select id, source, reason, action, emitted_at
from public.security_events
order by id desc
limit 10;
```

Quick function check (PowerShell example):
```powershell
$body = @{ source = "auth"; reason = "cooldown_blocked"; action = "login" } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri "$env:VITE_SUPABASE_URL/functions/v1/security-event-ingest" `
  -Headers @{ apikey = $env:VITE_SUPABASE_ANON_KEY; "Content-Type" = "application/json" } `
  -Body $body
```

## 6) Emergency Rollback Notes
Primary SQL pack:
- `docs/admin-2fa-emergency-rollback-sql-pack.md`

### 6.1 Emergency compatibility patch for admin `aal2` lockout
Use only if admin users are unexpectedly blocked from critical operations:
```sql
create or replace function public.is_admin_aal2()
returns boolean
language plpgsql
stable
as $$
begin
  return public.is_admin();
end;
$$;
```
This is temporary emergency mode. Reapply strict `aal2` function after triage using section 5 in `docs/admin-2fa-emergency-rollback-sql-pack.md`.

### 6.2 Roll back observability tables (if needed)
```sql
drop table if exists public.security_alert_incidents;
drop table if exists public.security_events;
```

## 7) Final Handoff Update
- [ ] Update `docs/lesson-6-task-tracker.md` (PASS/FAIL evidence).
- [ ] Update `docs/security-chat-snapshot.md` (done/next/blocked).
- [ ] Update `docs/security-learning-master-plan.md` if active subpoint changed.
