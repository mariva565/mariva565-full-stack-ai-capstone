# Admin 2FA Validation Checklist (`L6-2FA-02`)

Last updated: 2026-03-21

## 1) What is already implemented in repo
- `src/mfa.html` and `src/pages/mfa/mfa.js` add the admin MFA gate/setup/management flow.
- `src/services/mfaService.js` wraps Supabase TOTP MFA operations for admin users.
- `src/pages/admin/admin.js` now redirects `aal1` admin sessions to the MFA gate before admin UI loads.
- `src/profile.html` and `src/pages/profile/profile.js` now expose admin 2FA status and a link to manage factors.
- `supabase/functions/create-user/index.ts`, `supabase/functions/update-user/index.ts`, and `supabase/functions/delete-user/index.ts` now require `admin + aal2`.
- `src/pages/admin/adminService.js` block/unblock now goes through the hardened `update-user` function path instead of a direct browser write.
- `supabase/migrations/20260319000000_admin_aal2_policies.sql` tightens admin RLS policies to require `aal2` for privileged admin reads/writes.
- `supabase/config.toml` now enables local TOTP enrollment and verification.

## 1.1) Current expected behavior (do not treat as regressions)
As of 2026-03-20, these behaviors are expected in the current rollout state:

- Admin MFA is session-based (`aal2` per verified admin session), not per-action MFA. After successful challenge, each subsequent admin mutation in the same `aal2` session should not ask for a new 6-digit code.
- Delete/block/role-change UI first shows a confirm modal; this is UX confirmation only. MFA enforcement for these operations is in hardened Edge Function checks (`admin + aal2`), not in a separate popup.
- Course create/delete by the same signed-in user can still succeed through owner-based course RLS policies and is not by itself proof of missing MFA hardening.
- Local frontend currently uses hosted/shared Supabase credentials; because of that, Microsoft Authenticator entries may look like the Netlify/Vercel live backend context.
- MFA UX now includes inline status next to the 6-digit challenge form, so verification success/error is visible near the form even on long pages.

## 2) Current rollout checkpoint outside the repo
Confirmed locally, without changing the shared hosted Supabase project:

1. Rollout safety baseline:
   - a backup admin-capable account now exists.
   - the rollout no longer depends on a single demo admin account.
2. First real admin enrollment:
   - `admin@test.com` has already completed the first TOTP enrollment with Microsoft Authenticator in local testing.
   - this confirms the authenticator-app path works as expected without any extra Microsoft backend integration.

Still confirm explicitly before calling `L6-2FA-02` complete:

3. DB changes:
   - verify `supabase db push` (or the equivalent reviewed migration flow) has been applied in the target Supabase project so `20260319000000_admin_aal2_policies.sql` is active.
4. Hosted MFA settings:
   - verify the target Supabase project has hosted TOTP MFA enabled for the environment we will actually use day to day.
5. Backup MFA coverage:
   - add a second verified authenticator entry or complete MFA enrollment on the backup admin before removing any device or old fallback path.
6. Shared-live safety:
   - keep the hosted rollout paused until there is an isolated Supabase staging project or an explicit maintenance window for the shared backend used by Netlify and Vercel.

## 2.1) Preflight evidence slice (2026-03-21, no hosted deploy)
This slice intentionally executed no hosted rollout actions:

- no hosted `supabase db push`
- no hosted MFA setting changes
- no hosted deploy commands

Checklist refinement completed in this slice:

- this file now separates paused preflight evidence from rollout-window execution checks.
- `docs/supabase-hosted-db-push-safe-rollout-checklist.md` now includes a dedicated `L6-2FA-02` evidence log template for PASS/FAIL capture.

Preflight evidence already available:

- backup admin account exists and can sign in locally.
- `admin@test.com` completed first TOTP enrollment locally.
- second-admin local MFA path was manually exercised.
- expected session-based MFA behavior (`aal2` per session) is explicitly documented.

## 3) Preflight evidence pack (fill while rollout is paused)
1. Rollout metadata:
   - planned window date/time
   - target project ref
   - operator and backup operator
   - branch + commit hash
2. Hosted readiness proof (no push yet):
   - SQL snapshot from `supabase_migrations.schema_migrations` (latest versions captured)
   - confirmation note that hosted MFA/TOTP setting is enabled in the target project
   - rollback SQL snippets are prepared in a ready-to-run SQL tab (`docs/admin-2fa-emergency-rollback-sql-pack.md`)
3. Admin-account readiness:
   - primary admin with verified MFA factor
   - backup admin with verified MFA factor (or explicit pre-window enrollment step scheduled)
   - recovery owner and recovery communication path confirmed
4. Go/no-go gate:
   - if any item above is missing, keep `L6-2FA-02` as `in_progress` and do not run hosted push steps.

### 3.1) Current preflight record (2026-03-21, paused/no deploy)
- Record timestamp: `2026-03-21 15:07:53 +02:00`
- Target project ref: `mitaozfutwlzrccrecct` (from local `supabase/.temp/project-ref`)
- Branch + commit hash:
  - `security/lesson1-closeout-2026-03-18`
  - `bf1bcbec8f1567bb41eb1cee4ceb84e77501c2ed` (`bf1bcbe`)
- Operator: `mariy`
- Backup operator: `pending assignment (required before hosted rollout window)`
- Evidence location:
  - `docs/admin-2fa-validation-checklist.md`
  - `docs/supabase-hosted-db-push-safe-rollout-checklist.md`

## 4) Rollout-window manual validation flow
Run these checks only after migration/config changes are live in the target hosted project:

1. Admin setup:
   - `admin@test.com` has already completed the initial Microsoft Authenticator enrollment locally.
   - still confirm in the target environment that an `aal1` admin session opening `/admin.html` is redirected to `/mfa.html?next=/admin.html` and returns to admin after successful verification.
2. Admin challenge:
   - sign out and sign back in as the same admin
   - open `/admin.html`
   - confirm a 6-digit challenge is required
   - verify and confirm admin UI loads only after success
3. Admin actions with `aal2`:
   - create user
   - update user
   - change role
   - block/unblock user
   - delete user
   - change a system setting
4. Negative path with `aal1`:
   - use a session that is admin but has not completed the MFA challenge
   - confirm admin Edge Functions reject the mutation with an MFA-required response
   - confirm admin route sends the user to `/mfa.html`
5. Backup factor / backup admin:
   - add a second authenticator entry or complete MFA enrollment on the backup admin
   - confirm the intended backup path is actually usable
   - confirm the UI refuses removal of the last verified factor
6. Evidence capture:
   - record PASS/FAIL + short notes for each step in this file and in `docs/supabase-hosted-db-push-safe-rollout-checklist.md`.
   - record exact deny code/message for any `aal1` rejection that does not match expected MFA-required behavior.

## 5) Remaining gap before full completion
- Trusted lost-device recovery is still documented in `docs/admin-2fa-rollout-strategy.md`, but it is not yet implemented as an operator-facing server workflow in this repo.
- Preflight documentation is now ready, but hosted rollout/validation is still pending and intentionally paused.
- Because of that, `L6-2FA-02` should stay `in_progress` until fresh-session challenge validation, `aal2` admin mutation validation, backup MFA coverage, and recovery handling are closed.
