# Security Chat Snapshot (Current State)

Last updated: 2026-03-21

## 1) Where we are now
- Baseline security hardening is in place (XSS, Edge Functions auth/validation, password policy, deploy headers).
- Lesson 1 is completed for `login/register/materials/admin`.
- DoD and release/security gates are documented.
- Lesson 2 is completed (`Rate Limiting + Anti-Abuse`): `L2-CHAT-01`, `L2-AUTH-01`, `L2-ADM-01`, `L2-CHAT-02`, `L2-OBS-01`, `L2-AUTH-02`, `L2-ADM-02`, `L2-OBS-02`.
- Lesson 3 is completed (`CSP + Inline Script Cleanup`): `L3-CSP-01`, `L3-CSP-02`, `L3-CSP-03` are done (`how-it-works` + `modules` + `courses` + `contact` + `materials` slices done).
- Lesson 4 is completed (`Security Regression Tests`): `L4-REG-01`, `L4-AUTH-01`, `L4-AUTHZ-01`, `L4-SMOKE-01` are done.
- Lesson 5 is started (`Production Security Readiness`): `L5-HDR-01` is done.
- Lesson 5 continued: `L5-REL-01` and `L5-SEC-01` are done.
- Lesson 5 is completed: `L5-LIVE-01` is done.
- Lesson 6 started (`Operational Security Maturity`): `L6-OBS-01`, `L6-OBS-02`, `L6-OBS-03`, `L6-DEP-01`, `L6-DEP-02`, `L6-DEP-03`, `L6-2FA-01`, `L6-CSP-01`, `L6-CSP-02`, `L6-REG-02`, `L6-RLS-01`, `L6-RLS-02`, `L6-SES-01`, and `L6-ABUSE-01` are done; `L6-2FA-02` remains in progress (hosted rollout intentionally paused); strict `style-src` tightening remains enforced (no `'unsafe-inline'`) with runtime blocker baseline still clean in JS/TS (`style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`); `L6-ABUSE-02` remains conditional on trigger activation.

## 2) Already completed (high level)
- XSS hardening for notes/material rendering.
- Edge Function hardening for `chat-with-ai`, `create-user`, `update-user`, `delete-user`.
- Unified strong password policy in UI and backend validation.
- Security headers in `netlify.toml` and `vercel.json`.
- Automated deploy header readiness coverage now protects Netlify/Vercel config parity.
- Production security release checklist now exists for preview/live signoff.
- Env/secrets ownership is documented and frontend env usage is guarded by automated tests.
- Live verification runbook and rollback guidance now exist for Netlify/Vercel release gates.
- Lesson 2 anti-abuse runbook (`docs/lesson-2-anti-abuse-runbook.md`).

## 3) Active workstream
- Lesson 6 is active (`Operational Security Maturity`).
- Files: `docs/lesson-6-guided-security-review.md`, `docs/lesson-6-task-tracker.md`
- Supporting docs: `docs/security-observability-baseline.md`, `docs/security-alerting-runbook.md`, `docs/dependency-security-audit-cadence.md`, `docs/dependency-review-checklist.md`, `docs/admin-2fa-rollout-strategy.md`, `docs/admin-2fa-validation-checklist.md`, `docs/lesson-6-priority-hardening-plan.md`, `docs/lesson-6-csp-report-only-triage.md`, `docs/lesson-6-rls-verification-matrix.md`, `docs/lesson-6-public-form-anti-bot-trigger-matrix.md`, `docs/security-playbook-bg.md`, `docs/security-learning-master-plan.md`, `docs/lesson-2-anti-abuse-runbook.md`, `docs/production-security-release-checklist.md`
- Master plan: `docs/security-learning-master-plan.md`
- Validation status (2026-03-21): `L6-CSP-02`, `L6-REG-02`, `L6-RLS-01`, `L6-RLS-02`, `L6-DEP-03`, `L6-SES-01`, and `L6-ABUSE-01` slices are green. Session-hardening deny/regression tests are PASS (`src/utils/adminSessionPolicy.test.js`, `src/pages/admin/adminErrorMapper.test.js`), RLS storage tighten deny-path checks are PASS (`src/utils/rlsPolicyMatrix.test.js`), dependency monitoring automation config is in place (`.github/dependabot.yml`, `.github/workflows/dependency-security-monitoring.yml`), public-form anti-bot trigger criteria are documented (`docs/lesson-6-public-form-anti-bot-trigger-matrix.md`), full unit suite is PASS (`npm.cmd run test`, 14 files / 93 tests), baseline build is PASS (`npm.cmd run build`), public-pages security smoke remains PASS (`npm.cmd run test:e2e -- tests/smoke/public-pages.spec.js`, 6/6), full animation/interactions regression gate remains PASS (`npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js`, 5/5), and runtime blocker audit remains zero (`style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`).
- Local rollout checkpoint (2026-03-20): backup admin account created; `admin@test.com` completed first TOTP enrollment with Microsoft Authenticator in local testing; hosted/shared Supabase remains untouched.
- Local UX/session checkpoint (2026-03-20): admin MFA verify path now surfaces inline status near the 6-digit form and uses faster session-sync/redirect handling; `npm run test` PASS and `npm run build` PASS in this chat.
- Preflight checklist checkpoint (2026-03-21): `L6-2FA-02` evidence/checklist refinement is complete in `docs/admin-2fa-validation-checklist.md` and `docs/supabase-hosted-db-push-safe-rollout-checklist.md`; current paused record now includes project ref, branch/commit, and operator metadata; this remains a docs-only slice with no hosted deploy actions.
- Rollback readiness checkpoint (2026-03-21): hosted incident SQL pack is now documented in `docs/admin-2fa-emergency-rollback-sql-pack.md` (Level 1/2/3 compatibility options + strict restore script).
- Current behavior clarification (2026-03-20): `L6-2FA-02` is currently session-based MFA (`aal2` per admin session), not per-action MFA re-prompt.

## 4) Recommended start for next chat
Pick 1-2 tasks from:
1. Keep hosted `L6-2FA-02` rollout paused on shared Supabase (no hosted `supabase db push`) until isolated staging or an approved maintenance window exists.
2. During an approved rollout window, execute the prepared `L6-2FA-02` checklist package (`docs/admin-2fa-validation-checklist.md` + `docs/supabase-hosted-db-push-safe-rollout-checklist.md`) and capture PASS/FAIL evidence.
3. Keep `L6-ABUSE-02` conditional and start only if `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` reaches `Activate`.
4. Review first scheduled/manual CI evidence run for `L6-DEP-03` and tune automation noise only if needed.

## 5) Next wave after current step
- Lesson 5 production readiness wave is complete.
- Lesson 6 operational maturity wave is now in progress.
- `L6-OBS-01`, `L6-OBS-02`, `L6-OBS-03`, `L6-DEP-01`, `L6-DEP-02`, `L6-DEP-03`, `L6-2FA-01`, `L6-CSP-01`, `L6-CSP-02`, `L6-REG-02`, `L6-RLS-01`, `L6-RLS-02`, `L6-SES-01`, and `L6-ABUSE-01` are complete; `L6-2FA-02` is in progress and now has local first-factor proof plus a backup admin plus prepared hosted preflight evidence docs, while hosted enforcement validation remains intentionally deferred.

## 5.1 Current lesson pointer
- Lesson: `Lesson 6 (active)`
- Subpoint: `L6-OBS-01, L6-OBS-02, L6-OBS-03, L6-DEP-01, L6-DEP-02, L6-DEP-03, L6-2FA-01, L6-CSP-01, L6-CSP-02, L6-REG-02, L6-RLS-01, L6-RLS-02, L6-SES-01, and L6-ABUSE-01 done; L6-2FA-02 hosted rollout paused; strict style-src is enforced (no unsafe-inline) and runtime blocker baseline in JS/TS remains cleared (style= 0, .style/.style= 0, cssText 0)`

## 6) Non-negotiable rules
- Mobile + desktop parity from day 1.
- Light + dark mode parity from day 1.
- Security baseline checks are release blockers.

## 7) Handoff checklist (end of each chat)
- Follow `docs/security-continuity-procedure.md` (mode + update matrix + 6-block handoff contract)
- Update active lesson tracker (`docs/lesson-6-task-tracker.md`)
- Update this snapshot file
- Update `docs/security-learning-master-plan.md` when lesson/subpoint changes
- Leave short handoff note:
  - what is done
  - what is next
  - what is blocked/risky

## 8) Archived handoffs
- Older handoff notes were moved to `docs/archive/security-chat-snapshot-2026-03.md`.
- Live snapshot keeps current state + the latest 3 handoff notes for faster continuity.

## 9) Handoff note (2026-03-21, `L6-2FA-02` preflight evidence/checklist refinement slice)
- Done:
  - Refined `docs/admin-2fa-validation-checklist.md` with:
    - explicit preflight evidence pack sections,
    - no-hosted-deploy guardrails,
    - rollout-window PASS/FAIL capture guidance.
  - Refined `docs/supabase-hosted-db-push-safe-rollout-checklist.md` with:
    - stronger `L6-2FA-02` preflight readiness checks,
    - backup-admin MFA readiness checks,
    - copy/paste evidence log template for `aal1`/`aal2` validation.
  - Synced tracker/plan/master-plan docs so preflight readiness is explicit while hosted rollout remains paused.
  - Validation in this slice:
    - docs-only update
    - no hosted deploy commands
    - no hosted `supabase db push`
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until isolated staging/maintenance window.
  - During an approved window, execute the prepared `L6-2FA-02` hosted checklist and collect PASS/FAIL evidence before completion decisions.
  - Keep `L6-ABUSE-02` conditional and start only if `L6-ABUSE-01` reaches `Activate`.
- Blocked/Risky:
  - Shared hosted Supabase coupling remains the primary delivery risk for rollout-dependent tasks.
  - `L6-2FA-02` cannot be closed until hosted validation + backup/recovery confirmation is complete.

## 10) Handoff note (2026-03-21, `L6-ABUSE-01` public-form trigger criteria slice)
- Done:
  - Added `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` with explicit `Observe/Prepare/Activate` thresholds for public forms.
  - Defined concrete evidence sources, risk-ranked flows (`register`, `contact`), accessibility/UX guardrails, and rollback gates.
  - Locked `L6-ABUSE-02` behind activation thresholds instead of blanket rollout.
  - Validation in this slice:
    - `npm.cmd run test` PASS (14 files / 93 tests)
    - `npm.cmd run build` PASS
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until isolated staging/maintenance window.
  - Start `L6-ABUSE-02` only if `L6-ABUSE-01` reaches `Activate`.
  - Review first hosted `L6-DEP-03` workflow evidence run and tune schedule/scope only if automation noise is high.
- Blocked/Risky:
  - `L6-ABUSE-02` remains intentionally blocked until trigger evidence is met.
  - Shared hosted Supabase coupling remains the primary delivery risk for rollout-dependent tasks.

## 11) Handoff note (2026-03-21, `L6-DEP-03` dependency monitoring automation slice)
- Done:
  - Added Dependabot automation in `.github/dependabot.yml` for weekly `npm` and `github-actions` dependency checks.
  - Added CI workflow `.github/workflows/dependency-security-monitoring.yml` with:
    - weekly runtime-focused dependency gate (`deps:review:release`),
    - monthly/manual full dependency gate (`deps:review:full`),
    - log artifact upload for recurring evidence.
  - Kept existing manual cadence/checklist docs as the baseline process; automation now supplies recurring signal.
  - Validation in this slice:
    - `npm.cmd run test` PASS (14 files / 93 tests)
    - `npm.cmd run build` PASS
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until isolated staging/maintenance window.
  - Keep `L6-ABUSE-02` conditional and start only if `L6-ABUSE-01` reaches `Activate`.
  - Review first hosted workflow evidence run and tune schedule/scope only if automation noise is high.
- Blocked/Risky:
  - First scheduled/manual hosted workflow execution evidence is pending in GitHub Actions.
  - Shared hosted Supabase coupling remains the primary delivery risk for rollout-dependent tasks.
