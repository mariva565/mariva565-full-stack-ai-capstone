# Lesson 6: Operational Security Maturity

## Lesson Goal
Turn the current security baseline into a repeatable operational model with monitoring, maintenance, and stronger account-protection controls.

Operational progress:
- `docs/lesson-6-task-tracker.md`
- `docs/security-chat-snapshot.md`

Scope:
- Centralized security logging + alerting
- Dependency audit + patch cadence
- Admin 2FA rollout planning and validation
- Decision-driven CAPTCHA/anti-bot controls for public forms

Status update (2026-03-21):
- Lesson 6 is active.
- This document converts the "next-stage" items from `docs/security-playbook-bg.md` into tracked task IDs.
- `L6-OBS-01` is completed: the centralized security observability baseline is now documented in `docs/security-observability-baseline.md` with current emitter inventory, target sink, ownership model, and retention rules.
- `L6-OBS-02` is completed: alert thresholds, owner routing, and first-response actions are now documented in `docs/security-alerting-runbook.md`.
- `L6-DEP-01` is completed: the dependency audit cadence is now documented in `docs/dependency-security-audit-cadence.md` and linked into the release/DoD flow.
- `L6-DEP-02` is completed: dependency review is now easier to run via `package.json` scripts and `docs/dependency-review-checklist.md`.
- `L6-ABUSE-01` is completed: explicit anti-bot decision thresholds are now documented in `docs/lesson-6-public-form-anti-bot-trigger-matrix.md`; `L6-ABUSE-02` remains conditional on trigger activation.
- `L6-2FA-01` is completed: the chosen admin-only 2FA path is now documented in `docs/admin-2fa-rollout-strategy.md` with a TOTP-first rollout, `role + aal2` enforcement model, recovery policy, and implementation phases.
- `L6-2FA-02` is in progress: the repo now contains the admin MFA gate, profile integration, `aal2`-enforced admin functions, and RLS hardening migration; local rollout progress now includes a backup admin account plus first TOTP enrollment on `admin@test.com`, second-admin local flow validation, and MFA UX/session-sync improvements on `mfa.html`, while hosted rollout remains intentionally paused and the remaining validation is tracked in `docs/admin-2fa-validation-checklist.md`.
- `L6-OBS-03` is completed: a minimum centralized sink and first automated threshold checks are now implemented via `supabase/migrations/20260320000000_security_event_sink_and_alert_incidents.sql`, `supabase/functions/_shared/securityEventLogger.ts`, and `supabase/functions/security-event-ingest/index.ts`; browser-safe auth/register/chat telemetry now forwards through `src/utils/securityEventIngest.js`, and admin authz denials now emit structured events in `supabase/functions/_shared/adminAuth.ts`.
- `L6-CSP-01` is completed: `Content-Security-Policy-Report-Only` is now configured in both `netlify.toml` and `vercel.json`, and deploy-header parity coverage now includes CSP in `src/utils/deploySecurityHeaders.test.js`.
- `L6-CSP-02` is in progress: Stage A enforcement is active (`Content-Security-Policy` in `netlify.toml` + `vercel.json`) with strict `script-src` and temporary `style-src 'unsafe-inline'`; Stage B hotspot/residual cleanup is complete, runtime blocker reduction is ongoing (`.style/.style= 21`, `cssText 0`), and an animation/interactions regression gate is now documented in `docs/animation-interaction-regression-checklist.md` with automated coverage in `tests/smoke/animation-regression.spec.js`.
- External-review hardening points are now consolidated in `docs/lesson-6-priority-hardening-plan.md` and mapped to new tracker IDs (`L6-OBS-03`, `L6-CSP-01`, `L6-CSP-02`, `L6-SES-01`, `L6-REG-02`, `L6-RLS-01`, `L6-DEP-03`).
- Expected current behavior note: the current rollout is session-based MFA (`aal2`) rather than per-action re-prompt; destructive admin actions still show a confirm modal first, and enforcement happens server-side in hardened Edge Functions.
- Recommended next slice: keep hosted rollout paused for the shared backend (no hosted `supabase db push` while shared), then finish fresh-session challenge validation, `aal2` admin mutation checks, `aal1` rejection checks, backup MFA coverage, and recovery handling for `L6-2FA-02`; while paused, continue narrow `L6-CSP-02` runtime-style cleanup and run `tests/smoke/animation-regression.spec.js` after each slice before any final `style-src` tightening attempt.

## 1) Centralized Security Logging + Alerting Review
Candidate files:
- `docs/security-playbook-bg.md`
- `docs/security-hardening-log-2026-03-18.md`
- `docs/lesson-2-anti-abuse-runbook.md`
- `src/utils/registerFailureTelemetry.js`
- `supabase/functions/*`

Observations:
- Good: the project already emits bounded security signals for auth failures, anti-abuse cases, and admin mutation blocking.
- Gap: those signals are not yet routed through one centralized review path with explicit alert ownership and response thresholds.

Tasks:
- `L6-OBS-01` (P0, done): define a centralized security event inventory, sink, retention owner, and minimum event schema for auth/admin/chat/security failures.
  - Done when: the team has one documented ingestion path and one consistent event taxonomy for security-relevant signals across frontend-safe telemetry and server-side events.
  - Result: `docs/security-observability-baseline.md` now documents the current emitters, schema normalization rules, target Supabase-backed ingestion path, and retention/ownership baseline.
- `L6-OBS-02` (P1, done): define alert thresholds, owners, and first-response actions for the highest-signal security events.
  - Done when: repeated auth abuse, admin mutation blocking, suspicious authz failures, and similar events have documented thresholds plus a linked operational response path.
  - Result: `docs/security-alerting-runbook.md` now defines warn/critical thresholds, owner routing, first-response steps, release impact, and interim handling for instrumentation gaps.
- `L6-OBS-03` (P1, done): implement a minimum centralized sink plus first automated threshold checks.
  - Done when: at least one non-manual alert path is active on top of centralized security-event storage.
  - Result: `security_events` / `security_alert_incidents` storage is now in `supabase/migrations/20260320000000_security_event_sink_and_alert_incidents.sql`; shared evaluation is in `supabase/functions/_shared/securityEventLogger.ts`; browser ingest is in `supabase/functions/security-event-ingest/index.ts`; frontend telemetry forwarding now uses `src/utils/securityEventIngest.js`.

## 2) Dependency Audit + Patch Cadence Review
Candidate files:
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/definition-of-done.md`

Observations:
- Good: the repo already has test/build gates that reduce regression risk when dependencies change.
- Gap: there is no explicit audit schedule, severity policy, or owner cadence for routine dependency review and patching.

Tasks:
- `L6-DEP-01` (P0, done): document a dependency audit cadence with owner, command set, severity thresholds, and release-blocker rules.
  - Done when: the team has a repeatable monthly/release-candidate dependency review flow with clear evidence expectations.
  - Result: `docs/dependency-security-audit-cadence.md` now defines the required audit commands, cadence windows, severity policy, ownership, and release-blocker expectations, and `docs/production-security-release-checklist.md` / `docs/definition-of-done.md` now reference that policy.
- `L6-DEP-02` (P1, done): add a lightweight dependency-maintenance checklist or script reference for recurring audits.
  - Done when: dependency review no longer depends on ad-hoc memory and has one small repeatable repo-documented path.
  - Result: `package.json` now includes `deps:*` review shortcuts and `docs/dependency-review-checklist.md` provides the short repeatable monthly/release workflow.

## 3) Admin 2FA Review
Candidate files:
- `src/login.html`
- `src/pages/login/*`
- `src/pages/admin/*`
- `supabase/config.toml`
- `README.md`

Observations:
- Good: admin flows already have auth/authz hardening, password policy, and live-release gates.
- Gap: admin access still depends on single-factor authentication and needs a rollout path that avoids accidental maintainer lockout.

Tasks:
- `L6-2FA-01` (P1, done): review provider/application options for admin-only 2FA and choose a rollout strategy.
  - Done when: the selected path, enrollment rules, recovery/fallback flow, and affected screens are documented.
  - Result: `docs/admin-2fa-rollout-strategy.md` now defines the chosen TOTP-first rollout, `role + aal2` enforcement pattern, admin recovery expectations, and phased implementation plan.
- `L6-2FA-02` (P2, in_progress): implement and validate the selected admin 2FA flow.
  - Done when: admin sign-in, enrollment, `aal2` enforcement, and recovery behavior are implemented and covered by targeted validation.
  - Current repo result: `src/mfa.html`, `src/pages/mfa/mfa.js`, `src/services/mfaService.js`, admin/profile integrations, hardened admin Edge Functions, and `supabase/migrations/20260319000000_admin_aal2_policies.sql` are in place.
  - Current local checkpoint: a backup admin account exists and `admin@test.com` has already completed first-factor enrollment with Microsoft Authenticator in local testing.
  - Remaining validation: once rollout is approved for a non-shared environment or maintenance window, verify the target Supabase project has the migration/settings we expect, then complete the fresh-session challenge, `aal2` privileged admin action checks, `aal1` rejection checks, and backup MFA coverage in `docs/admin-2fa-validation-checklist.md`.

## 4) Public Form Anti-Bot Review
Candidate files:
- `docs/lesson-2-anti-abuse-runbook.md`
- `docs/lesson-6-public-form-anti-bot-trigger-matrix.md`
- `docs/production-security-release-checklist.md`
- `src/register.html`
- `src/contact.html`
- `src/pages/register/*`
- `src/pages/contact/*`

Observations:
- Good: rate limiting/cooldown already protects auth/chat/admin flows from basic burst abuse.
- Gap: there is no explicit trigger matrix for when CAPTCHA or another anti-bot layer should be added to public forms.

Tasks:
- `L6-ABUSE-01` (P2, done): define abuse thresholds and decision criteria for adding CAPTCHA/anti-bot protection to public forms.
  - Done when: the team can explain when anti-bot is required, which flows are highest risk, and what accessibility/usability tradeoff is acceptable.
  - Result: `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` now defines `Observe/Prepare/Activate` thresholds, evidence sources, flow ranking (`register`, `contact`), accessibility guardrails, and explicit `L6-ABUSE-02` entry criteria.
- `L6-ABUSE-02` (P2, todo): implement the selected anti-bot control for the highest-risk public flow if thresholds justify it.
  - Done when: the chosen flow has bot protection with user-safe failure behavior and the rollout is documented.

## 5) Recommended Start Order
1. Finish `L6-2FA-02`
2. `L6-CSP-02` Stage B style hardening (`style-src` tightening prep)
3. `L6-REG-02`

## 6) Lesson 6 Definition Of Done (Draft)
- Centralized security signal ownership and alert routing are documented.
- Dependency audit cadence exists and is used as recurring maintenance work.
- Admin 2FA strategy is documented in `docs/admin-2fa-rollout-strategy.md` before implementation; if implemented, it includes validation and recovery guidance.
- CAPTCHA/anti-bot remains decision-driven with explicit trigger criteria, not blanket-added without evidence.
- Tracker/snapshot/master-plan stay synchronized after every Lesson 6 slice.
