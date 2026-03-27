# Lesson 6 Priority Hardening Plan (2026-03-21)

## 1) Purpose
This document converts the external security suggestions into a project-specific plan with clear priorities, task IDs, and done criteria.

Companion docs:
- `docs/lesson-6-guided-security-review.md`
- `docs/lesson-6-task-tracker.md`
- `docs/security-chat-snapshot.md`
- `docs/lesson-6-csp-report-only-triage.md`
- `docs/lesson-6-rls-verification-matrix.md`
- `docs/admin-session-hardening-policy.md`
- `docs/lesson-6-public-form-anti-bot-trigger-matrix.md`

## 2) Point-by-Point Evaluation

| Suggestion | Current state in repo | Decision | Tracking | Risk level | Rollback note |
| --- | --- | --- | --- | --- | --- |
| Strict CSP (`no unsafe-inline`, nonce/strict rules) | Inline script cleanup from Lesson 3 is complete; enforced and report-only CSP now both use strict `style-src` without `'unsafe-inline'`. | Keep strict policy enforced and monitor via regression/headers parity checks. | `L6-CSP-01`, `L6-CSP-02` | `medium` | If critical flow breaks, revert CSP header to last known-good baseline and keep Report-Only until violations are triaged. |
| Real alerting (not only runbook docs) | Alert thresholds and ownership exist, and the first centralized sink/rules slice is now implemented. | Keep active and tune with real traffic evidence. | `L6-OBS-03` | `low` to `medium` | If noise/false positives spike, disable only the new automated rule path and continue manual runbook routing temporarily. |
| Admin session hardening (idle timeout, short-lived admin sessions, re-auth windows) | Admin MFA remains session-based (`aal2`), and explicit session hardening is now implemented with idle timeout + recent verification window checks on client and Edge guardrails. | Keep policy active, monitor deny reasons, and tune windows via env values only if lockout evidence appears. | `L6-SES-01` | `medium` | If lockout/UX regressions appear, revert to current session-based `aal2` behavior while preserving server-side `admin + aal2` enforcement. |
| Attacker-style testing (brute-force, rapid requests, hostile payloads) | Targeted hostile-flow regressions were expanded across auth/admin/telemetry paths and are green. | Keep coverage as release blocker baseline; add hostile e2e only when stable. | `L6-REG-02` | `low` | If tests are flaky, quarantine/mark unstable scenario and keep deterministic unit/regression checks as release blockers. |
| Systematic RLS review | Structured matrix verification is now completed and documented, with mandatory deny-path checks enforced by tests. | Keep matrix + deny checks as baseline and scope targeted policy tighten follow-ups. | `L6-RLS-01` | `medium` | If policy tightening causes unexpected denial, roll back only the latest policy change and re-run matrix checks before re-applying. |
| Dependency monitoring automation | Monthly/release process and scripts exist; automation is now configured via Dependabot and CI scheduled audit workflow. | Keep automation active and tune schedule/scope only if signal-to-noise degrades. | `L6-DEP-03` | `low` | If automation is noisy, reduce schedule/scope instead of removing monitoring entirely. |
| CAPTCHA | Decision criteria are now explicitly documented for public forms (`Observe/Prepare/Activate`) with flow ranking and guardrails. | Keep signal-driven only; move to implementation only when `Activate` thresholds are met. | `L6-ABUSE-01`, `L6-ABUSE-02` | `medium` when enabled | If accessibility/UX impact is high, roll back CAPTCHA and keep existing throttling while trigger criteria are recalibrated. |
| Rate-limit tuning by real data | Baseline throttles exist. | Tune only after better centralized telemetry exists. | follow-up under `L6-OBS-03` | `medium` | If legitimate-user blocking rises, restore previous throttle values immediately and investigate with telemetry. |
| Admin audit logs | Activity log coverage exists. | Keep as maintenance, not a new priority epic right now. | maintenance | `low` | If volume/perf impact appears, reduce retention/query load before disabling logging. |

## 3) Explicit Non-Goals (Current Stage)
- No architecture rewrite.
- No enterprise-only tooling rollout.
- No broad "paranoia" controls without clear signals.

## 4) Action Plan (Phased)

### Phase 0: Close active blocker
1. `L6-2FA-02` (in progress)
   - Scope: hosted validation + backup/recovery checks from `docs/admin-2fa-validation-checklist.md`.
   - Done when: fresh-session challenge, `aal2` admin mutations, `aal1` rejection, and backup factor/admin checks are validated in target environment.
   - Preflight status (2026-03-21): evidence/checklist refinement is complete in `docs/admin-2fa-validation-checklist.md` and `docs/supabase-hosted-db-push-safe-rollout-checklist.md`; no hosted deploy actions were executed in this slice.
   - Risk level: `high`
   - Rollback note: if rollout issues appear, keep hosted rollout paused/revert to last stable auth settings and preserve existing hardened server checks.
   - Evidence: checklist PASS/FAIL notes + tracker/snapshot updates.

### Phase 1: Make alerting real
1. `L6-OBS-03` (done)
   - Scope: implement minimum centralized event ingestion + first automated threshold checks for high-signal auth/chat/admin events.
   - Result (2026-03-20): centralized sink is live via `security_events`/`security_alert_incidents`, Edge + browser telemetry forwarding is in place, and first automated warn/critical incident creation is active for the highest-signal matrix.
   - Risk level: `low` to `medium`
   - Rollback note: disable only automated threshold firing if needed; keep ingest + manual runbook review active.
   - Evidence: ingestion path, sample alert trigger output, and runbook/tracker sync.

### Phase 2: Complete CSP rollout
1. `L6-CSP-01` (done)
   - Scope: add baseline `Content-Security-Policy-Report-Only` for Netlify/Vercel.
   - Done when: Report-Only policy ships without breaking critical flows and violations are reviewed.
   - Result (2026-03-20): Report-Only CSP is now active in `netlify.toml` and `vercel.json`, and provider parity is enforced via `src/utils/deploySecurityHeaders.test.js`.
   - Risk level: `medium`
   - Rollback note: remove/relax Report-Only policy if critical flow noise is too high and reintroduce incrementally.
   - Evidence: `npm.cmd run test` PASS, `npm.cmd run build` PASS, plus deploy-header test parity for CSP.
2. `L6-CSP-02` (done)
   - Scope: enforce CSP without `unsafe-inline`; keep third-party allowances explicit/minimal.
   - Done when: enforced policy is live and critical pages pass smoke checks.
   - Result (2026-03-21): strict `style-src` enforcement is complete (`no 'unsafe-inline'`) in both `netlify.toml` and `vercel.json`, with deploy-header parity locked by `src/utils/deploySecurityHeaders.test.js`; animation/interactions smoke and test/build gates are green.
   - Risk level: `medium`
   - Rollback note: immediately revert enforced CSP header to previous baseline if login/register/admin critical path breaks.
   - Evidence: triage doc + readiness test + deploy header parity checks + `npm.cmd run test` PASS + `npm.cmd run build` PASS.

### Phase 3: Expand attacker-style regressions
1. `L6-REG-02` (done)
   - Scope: add targeted tests for rapid retries, rate-limit transitions, and malicious payload patterns across auth/admin flows.
   - Done when: at least one new hostile-flow regression test exists per critical area and fails on security regressions.
   - Result (2026-03-21): hostile-flow coverage was expanded in `src/utils/authThrottle.test.js`, `src/utils/authErrorMapper.test.js`, `src/pages/admin/adminErrorMapper.test.js`, and `src/utils/antiAbuseTelemetry.test.js`.
   - Risk level: `low`
   - Rollback note: if instability appears, isolate flaky scenarios and keep stable security regressions mandatory.
   - Evidence: test files + `npm.cmd run test` PASS + `npm.cmd run build` PASS.

### Phase 4: Session hardening + confidence follow-up
1. `L6-SES-01` (done)
   - Scope: define and enforce admin session policy (idle timeout + recent verification window) with deterministic deny handling.
   - Done when: admin session-policy checks are enforced client + server side and deny/regression tests are green.
   - Result (2026-03-21): session policy was added in `src/utils/adminSessionPolicy.js`, enforced in `src/pages/admin/admin.js`, `src/pages/admin/adminService.js`, and `supabase/functions/_shared/adminAuth.ts` (including explicit deny codes and reason-aware MFA redirect path); companion doc added in `docs/admin-session-hardening-policy.md`.
   - Risk level: `medium`
   - Rollback note: if lockout friction rises, increase policy windows and keep `admin + aal2` enforcement as the minimum floor.
   - Evidence: `src/utils/adminSessionPolicy.test.js` + `src/pages/admin/adminErrorMapper.test.js` + `npm.cmd run test` PASS + `npm.cmd run build` PASS.
2. `L6-RLS-01` (done)
   - Scope: create one RLS matrix (`who can read/write`) and verify sensitive negative paths.
   - Done when: matrix is documented and spot checks are recorded.
   - Result (2026-03-21): matrix and negative-path evidence are documented in `docs/lesson-6-rls-verification-matrix.md`; migration-aware policy parsing and deny checks were added in `src/utils/rlsPolicyMatrix.js` + `src/utils/rlsPolicyMatrix.test.js`.
   - Risk level: `medium`
   - Rollback note: revert only the latest policy delta if access regressions are detected, then re-run matrix validation.
   - Evidence: matrix doc + `npm.cmd run test -- src/utils/rlsPolicyMatrix.test.js` PASS + `npm.cmd run test` PASS + `npm.cmd run build` PASS.
3. `L6-DEP-03` (done)
   - Scope: add dependency monitoring automation path (for example Dependabot config and/or CI audit schedule).
   - Done when: recurring automated signal exists beyond manual cadence.
   - Result (2026-03-21): added `.github/dependabot.yml` for weekly dependency update monitoring and `.github/workflows/dependency-security-monitoring.yml` for weekly runtime and monthly/manual full audit signal using existing `deps:*` scripts.
   - Risk level: `low`
   - Rollback note: reduce bot scope/schedule if noisy; do not remove baseline monthly/release manual checks.
   - Evidence: config/workflow files + `npm.cmd run test` PASS + `npm.cmd run build` PASS in this slice (first hosted scheduled/manual run evidence pending in GitHub Actions).

### Phase 5: Optional signal-driven controls
1. `L6-ABUSE-01` (done) then `L6-ABUSE-02` (todo)
   - Scope: add CAPTCHA/anti-bot only if measured abuse triggers justify it.
   - Done when: trigger matrix exists first; implementation only follows a justified decision.
   - Result (2026-03-21): added `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` with explicit thresholds, evidence inputs, flow ranking, accessibility guardrails, and rollout/rollback gates.
   - Risk level: `medium`
   - Rollback note: disable CAPTCHA and fall back to throttling/cooldown if user friction exceeds security benefit.

## 5) Top 3 Focus (if only three items can be done now)
1. Finish `L6-2FA-02`.
2. Execute the prepared `L6-2FA-02` hosted rollout checklist only during an approved window (still no hosted `supabase db push` outside that window).
3. Keep `L6-ABUSE-02` conditional and start only if `L6-ABUSE-01` thresholds hit `Activate`.
