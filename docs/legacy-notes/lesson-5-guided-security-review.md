# Lesson 5: Production Security Readiness

## Lesson Goal
Turn the existing security baseline into explicit production release blockers with automated deploy-config checks and a final readiness checklist.

Operational progress:
- `docs/lesson-5-task-tracker.md`
- `docs/security-chat-snapshot.md`

Scope:
- Deploy security headers readiness and provider parity checks
- Production env/secrets checklist review
- Final release-blocker verification flow for preview/live environments

Status update (2026-03-19):
- Lesson 5 is completed.
- `L5-HDR-01` is completed: automated readiness coverage now verifies that required deploy security headers stay present and aligned between `netlify.toml` and `vercel.json`.
- `L5-REL-01` is completed: the production security release checklist is documented and linked into the release/DoD flow.
- `L5-SEC-01` is completed: the env/secrets inventory is documented and the frontend runtime env contract is guarded by automated tests.
- `L5-LIVE-01` is completed: a repeatable live verification runbook and rollback flow now cover Netlify/Vercel release gating.
- Validation after `L5-LIVE-01`: `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run test:e2e` PASS.

## 1) Deploy Security Headers Readiness Review
Files:
- `netlify.toml`
- `vercel.json`
- `src/utils/deploySecurityHeaders.test.js`

Observations:
- Good: both hosting providers already ship the core hardened header baseline.
- Gap: before this slice, deploy-config drift could silently remove or change a critical header without an automated test failure.

Tasks:
- `L5-HDR-01` (P0, done): add automated readiness coverage for required production security headers and Netlify/Vercel parity.
  - Done when: the test suite fails if any required header is removed, renamed, or mismatched across the two deploy configs.

## 2) Secrets + Environment Readiness Review
Candidate files:
- `SECURITY.md`
- `README.md`
- `docs/security-env-secrets-inventory.md`
- `src/services/supabaseClient.js`
- `src/utils/runtimeEnvContract.test.js`
- `supabase/functions/*`

Tasks:
- `L5-SEC-01` (P1, done): document and verify the production env/secrets inventory for frontend-visible values vs server-only secrets.
  - Done when: required runtime env vars are explicit, server-only secrets are never expected by client code, and docs clearly state which system owns each secret.
  - Result: `docs/security-env-secrets-inventory.md` defines ownership by system, `SECURITY.md` and `README.md` now point to the same contract, and `src/utils/runtimeEnvContract.test.js` fails if frontend code starts using unexpected env vars or secret identifiers.

## 3) Release Blocker Checklist Review
Candidate files:
- `docs/production-security-release-checklist.md`
- `docs/definition-of-done.md`
- `docs/security-playbook-bg.md`
- `tests/smoke/public-pages.spec.js`

Tasks:
- `L5-REL-01` (P1, done): create the final production security checklist for preview/live release verification.
  - Done when: the checklist covers deploy headers, auth/register live smoke, automated test evidence, and release-blocker signoff.
  - Result: `docs/production-security-release-checklist.md` is now the release-candidate checklist and is referenced from the DoD/playbook docs.
- `L5-LIVE-01` (P1, done): document the repeatable live-environment verification flow for Netlify/Vercel before release.
  - Done when: there is a clear manual verification path plus a blocker/rollback note when a live domain fails.
  - Result: `docs/lesson-5-live-verification-runbook.md` now defines domain selection, live smoke order, release blockers, and provider-specific rollback actions.

## 4) Recommended Start Order
1. `L5-HDR-01` (done)
2. `L5-REL-01` (done)
3. `L5-SEC-01` (done)
4. `L5-LIVE-01` (done)

## 5) Lesson 5 Definition Of Done (Draft)
- Production security checklist exists and is kept current.
- Deploy-config guardrails are automated for both hosting providers.
- `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e` are green after each Lesson 5 slice.
- Tracker/snapshot/master-plan stay synchronized after every completed slice.
- Live-environment security verification is documented before release candidate signoff.
