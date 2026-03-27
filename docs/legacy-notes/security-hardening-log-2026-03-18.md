# Security Hardening Log - 2026-03-18

## Scope
Практически security подобрения върху StudyHub кода, с фокус:
- XSS и безопасно рендериране
- auth/authz hardening в Edge Functions
- пароли и account security
- deploy security headers

## Applied Changes

### 1) XSS Hardening (Materials)
Files:
- `src/pages/materials/materialsHandlers.js`
- `src/pages/materials/materialsRenderer.js`

Done:
- добавен allowlist sanitizer за rich HTML бележки
- unsafe tags/attrs се премахват (вкл. `on*`, `style`, unsafe `href/src`)
- unsafe URL схеми се блокират
- тагове/атрибути се escape-ват при рендер

Result:
- значително намален риск от stored/reflected XSS при бележки и metadata render.

### 2) Edge Functions Hardening
Files:
- `supabase/functions/chat-with-ai/index.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/update-user/index.ts`
- `supabase/functions/delete-user/index.ts`

Done:
- задължителни auth проверки
- admin authorization за user-management функции
- входна валидация (email/uuid/role/password)
- минимизирани грешки към клиента (без debug leak)
- payload guardrails за AI chat

Result:
- по-нисък риск от abuse, privilege misuse и изтичане на вътрешни подробности.

### 3) Password Policy Unification
Files:
- `src/utils/passwordPolicy.js`
- `src/pages/register/register.js`
- `src/pages/profile/profile.js`
- `src/pages/admin/admin.js`
- `src/register.html`
- `src/profile.html`
- `src/admin.html`
- `supabase/config.toml`

Done:
- единна политика: >= 10 chars + upper/lower/number/symbol
- UI + JS validation синхронизирани
- Supabase local config hardening:
  - `minimum_password_length = 10`
  - `secure_password_change = true`

Result:
- по-добра устойчивост срещу brute-force/credential stuffing със слаби пароли.

### 4) Deployment Security Headers
Files:
- `netlify.toml`
- `vercel.json`

Done:
- добавени базови защитни headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS, COOP, CORP)

Result:
- подобрена защита на browser/security boundary в production.

### 5) Production Readiness Guardrails
Files:
- `src/utils/deploySecurityHeaders.test.js`
- `src/utils/runtimeEnvContract.test.js`
- `docs/production-security-release-checklist.md`
- `docs/security-env-secrets-inventory.md`
- `docs/lesson-5-live-verification-runbook.md`
- `SECURITY.md`

Done:
- automated deploy-config regression coverage for required Netlify/Vercel security headers
- automated frontend env contract coverage for approved `VITE_*` usage and server-only secret markers
- final production release checklist for preview/live signoff
- explicit env/secrets ownership inventory for frontend vs Supabase Edge Functions
- live verification runbook and rollback matrix for Netlify/Vercel release gates

Result:
- по-нисък риск от deploy-config drift, client-side secret misuse и неясна release готовност преди production release.

### 6) Operational Maintenance Baseline
Files:
- `docs/security-observability-baseline.md`
- `docs/security-alerting-runbook.md`
- `docs/dependency-security-audit-cadence.md`
- `docs/dependency-review-checklist.md`
- `docs/definition-of-done.md`
- `docs/production-security-release-checklist.md`

Done:
- documented centralized observability baseline for security-relevant signals
- documented alert thresholds, owner routing, and first-response actions for the highest-signal security events
- documented dependency review cadence with severity policy and release-blocker rules
- added short dependency-review scripts and checklist for recurring execution
- linked dependency review expectations into the release checklist and definition of done

Result:
- по-нисък риск security maintenance задачите да останат ad hoc или да се пропуснат преди release.

### 7) Admin 2FA Rollout Strategy
Files:
- `docs/admin-2fa-rollout-strategy.md`

Done:
- reviewed the current StudyHub auth/admin flow and the documented Supabase MFA capabilities
- selected a TOTP-first admin-only rollout instead of a blanket MFA requirement
- defined the `role + aal2` enforcement model for admin entry and privileged admin mutations
- documented backup-factor expectations, trusted recovery path, and phased implementation steps for `L6-2FA-02`

Result:
- по-нисък риск admin 2FA да се имплементира ad hoc или да доведе до maintainer lockout по време на rollout.

### 8) Admin 2FA Implementation Slice
Files:
- `src/mfa.html`
- `src/pages/mfa/mfa.js`
- `src/services/mfaService.js`
- `src/utils/adminMfaState.js`
- `src/utils/adminMfaState.test.js`
- `src/pages/admin/admin.js`
- `src/pages/admin/adminService.js`
- `src/pages/profile/profile.js`
- `src/profile.html`
- `supabase/functions/_shared/adminAuth.ts`
- `supabase/functions/create-user/index.ts`
- `supabase/functions/update-user/index.ts`
- `supabase/functions/delete-user/index.ts`
- `supabase/config.toml`
- `supabase/migrations/20260319000000_admin_aal2_policies.sql`
- `vite.config.js`

Done:
- added an admin MFA setup/challenge/management page that works with Microsoft Authenticator and other TOTP apps
- added repo-level admin MFA state helpers plus focused validation coverage
- gated `/admin.html` so `aal1` admin sessions are redirected to the MFA flow before admin UI loads
- exposed admin MFA status and management entrypoint from the profile security section
- required `aal2` in the admin Edge Functions for create/update/delete user mutations
- moved block/unblock through the hardened admin function path instead of a direct client-side profile update
- added a migration to require `aal2` for admin-critical RLS policies on roles/materials/courses/modules/logs/contact-messages/settings/storage deletes
- documented the remaining hosted/manual rollout steps in `docs/admin-2fa-validation-checklist.md`

Result:
- значително по-нисък риск privileged admin actions да останат достъпни само с парола или да заобиколят MFA през старите demo policies.

## Validation
- `npm.cmd run build` -> PASS
- `npm.cmd run test` -> FAILED (environment-level `spawn EPERM` в този Windows shell; не е от кода)

## Recommended Next Tasks
- Завършване на hosted rollout/validation за `L6-2FA-02` по `docs/admin-2fa-validation-checklist.md`.
- Дефиниране на `L6-ABUSE-01` trigger criteria за публични форми.
- Използване на dependency review cadence-а в следващия release/maintenance цикъл.

