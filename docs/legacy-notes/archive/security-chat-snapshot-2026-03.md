# Security Chat Snapshot Archive (2026-03)

Source: `docs/security-chat-snapshot.md`
Archived on: 2026-03-21

Contains handoff notes moved from the live snapshot to keep it short.
Range moved: sections `8` through `22` from the pre-archive snapshot.

## 8) Handoff note (2026-03-20)
- Done:
  - Lesson 5 is started.
  - `L5-HDR-01` completed by adding `src/utils/deploySecurityHeaders.test.js` to assert the required Netlify/Vercel security headers and provider parity.
  - `L5-REL-01` completed by adding `docs/production-security-release-checklist.md` and linking it from the DoD/playbook flow.
  - `L5-SEC-01` completed by adding `docs/security-env-secrets-inventory.md`, refreshing `SECURITY.md` and `README.md`, and adding `src/utils/runtimeEnvContract.test.js`.
  - `L5-LIVE-01` completed by adding `docs/lesson-5-live-verification-runbook.md` with live smoke order, blocker rules, and Netlify/Vercel rollback guidance.
  - Lesson 5 docs are now: `docs/lesson-5-guided-security-review.md`, `docs/lesson-5-task-tracker.md`, `docs/production-security-release-checklist.md`, `docs/lesson-5-live-verification-runbook.md`, `docs/security-env-secrets-inventory.md`.
  - Validation after `L5-LIVE-01`: `npm.cmd run test`, `npm.cmd run build`, `npm.cmd run test:e2e` PASS.
  - Lesson 6 planning docs now exist: `docs/lesson-6-guided-security-review.md` and `docs/lesson-6-task-tracker.md`.
  - `L6-OBS-01` completed by adding `docs/security-observability-baseline.md` with current emitters, normalized event contract, target sink, and retention/ownership baseline.
  - `L6-DEP-01` completed by adding `docs/dependency-security-audit-cadence.md` and linking it into the release checklist and DoD as the dependency review policy.
  - `L6-OBS-02` completed by adding `docs/security-alerting-runbook.md` with warn/critical thresholds, owner routing, first-response actions, and release impact for key security signals.
  - `L6-DEP-02` completed by adding `deps:*` scripts in `package.json` and `docs/dependency-review-checklist.md` for a shorter repeatable dependency workflow.
  - Validation for `L6-DEP-02`: `npm.cmd run deps:review:local` PASS.
  - `L6-2FA-01` completed by adding `docs/admin-2fa-rollout-strategy.md` with the chosen TOTP-first admin-only MFA path, `role + aal2` enforcement model, backup-factor policy, recovery path, and phased implementation plan.
  - Validation for `L6-2FA-01`: docs-only update; no new tests were run in this chat.
  - `L6-2FA-02` is now in progress with repo implementation added in `src/mfa.html`, `src/pages/mfa/mfa.js`, `src/services/mfaService.js`, admin/profile integration, hardened admin Edge Functions, `supabase/config.toml`, and `supabase/migrations/20260319000000_admin_aal2_policies.sql`.
  - Added `docs/admin-2fa-validation-checklist.md` to separate repo-complete work from hosted rollout/manual verification steps.
  - Validation for this `L6-2FA-02` slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
  - Deno syntax validation could not run in this shell because `deno` is not installed.
  - Master-plan/snapshot handoff now points to Lesson 6 as the active workstream.
  - Local rollout checkpoint for `L6-2FA-02`: a backup admin account now exists.
  - Local rollout checkpoint for `L6-2FA-02`: `admin@test.com` completed first Microsoft Authenticator enrollment in local testing.
- Next:
  - Keep hosted rollout paused for the shared backend until an isolated environment or maintenance window exists.
  - Then verify fresh-session admin challenge, `aal2` privileged admin actions, `aal1` rejection, and backup MFA coverage from `docs/admin-2fa-validation-checklist.md`.
- Blocked/Risky:
  - The shared hosted Supabase backend is currently used by both live frontends, so direct rollout would affect both Netlify and Vercel.
  - Admin 2FA hard enforcement should wait until backup-factor or backup-admin MFA coverage is verified in the target environment and the trusted recovery flow is finalized.
  - CAPTCHA/anti-bot should remain signal-driven so it does not create unnecessary UX/accessibility cost.

## 9) Handoff note (2026-03-20, MFA follow-up)
- Done:
  - Tightened admin MFA verify redirect/session-sync behavior to reduce delayed admin entry after successful code.
  - Added inline verification feedback near the MFA challenge form so users do not need to scroll to top toasts to confirm success/failure.
  - Confirmed and documented expected behavior distinctions:
    - session-based MFA (`aal2`) vs per-action prompts,
    - confirm modal vs MFA challenge,
    - owner-course operations vs admin-wide mutation hardening.
  - Updated Lesson 6 tracker/review/checklist docs with quick-resume guidance for `L6-2FA-02`.
  - Validation in this follow-up: `npm run test` PASS, `npm run build` PASS.
- Next:
  - Keep hosted rollout paused until isolated staging or approved maintenance window.
  - When resumed, execute full `docs/admin-2fa-validation-checklist.md` in the target project and close `L6-2FA-02` only after backup/recovery checks.
- Blocked/Risky:
  - Shared hosted Supabase currently underpins both Netlify and Vercel live paths.
  - Trusted lost-device recovery is documented but still not implemented as an operator-facing server workflow.

## 10) Handoff note (2026-03-20, Priority hardening planning)
- Done:
  - Added `docs/lesson-6-priority-hardening-plan.md` with point-by-point evaluation for all external suggestions and a phased action plan.
  - Synced Lesson 6 tracker with new IDs: `L6-OBS-03`, `L6-CSP-01`, `L6-CSP-02`, `L6-SES-01`, `L6-REG-02`, `L6-RLS-01`, `L6-DEP-03`.
  - Updated recommended next-chat order to keep `L6-2FA-02` first, then move to operational alerting and CSP rollout if hosted rollout stays paused.
- Next:
  - Continue `L6-2FA-02` when rollout window/staging is available.
  - If rollout remains paused, execute `L6-OBS-03` then `L6-CSP-01` as the highest-value non-blocked work.
- Blocked/Risky:
  - Shared hosted Supabase still limits immediate rollout validation for admin MFA.
  - CSP enforcement (`L6-CSP-02`) should not start before Report-Only evidence from `L6-CSP-01` is reviewed.

## 11) Handoff note (2026-03-20, `L6-OBS-03` implementation)
- Done:
  - Added centralized storage tables via `supabase/migrations/20260320000000_security_event_sink_and_alert_incidents.sql`.
  - Added shared server logger/rule evaluator in `supabase/functions/_shared/securityEventLogger.ts`.
  - Added browser ingestion function `supabase/functions/security-event-ingest/index.ts` and enabled it in `supabase/config.toml`.
  - Wired Edge anti-abuse/admin authz-denied signals into centralized logging (`supabase/functions/_shared/antiAbuseLogger.ts`, `supabase/functions/_shared/adminAuth.ts`).
  - Wired browser auth/register telemetry forwarding (`src/utils/securityEventIngest.js`, `src/utils/antiAbuseTelemetry.js`, `src/utils/registerFailureTelemetry.js`).
  - Updated Lesson 6 docs/tracker to reflect `L6-OBS-03` completion and remaining next steps.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep `L6-2FA-02` first when hosted rollout window is available.
  - If rollout remains paused, start `L6-CSP-01` and then `L6-REG-02`.
- Blocked/Risky:
  - Hosted Supabase rollout remains intentionally paused for shared backend safety.
  - New alert thresholds need real-traffic tuning to reduce false positives.

## 12) Handoff note (2026-03-20, `L6-CSP-01` implementation)
- Done:
  - Implemented `Content-Security-Policy-Report-Only` in both deploy configs: `netlify.toml` and `vercel.json`.
  - Added CSP policy parity protection to `src/utils/deploySecurityHeaders.test.js` so Netlify/Vercel drift is test-blocked.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Review Report-Only CSP violations from preview/live critical paths and document triage outcomes.
  - Use violation evidence to scope `L6-CSP-02` strict enforcement (`no unsafe-inline`) in a controlled follow-up.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused for the shared Supabase backend; no hosted `supabase db push` was performed in this chat.
  - CSP reporting is currently manual evidence collection (browser/devtools) until a dedicated report ingestion endpoint is added.

## 13) Handoff note (2026-03-20, `L6-CSP-02` prep)
- Done:
  - Added `docs/lesson-6-csp-report-only-triage.md` with Report-Only evidence, host coverage, blockers, and staged enforcement plan.
  - Added `src/utils/cspReadiness.test.js` to keep HTML templates free of inline `<script>` blocks and inline `on*` handler attributes.
  - Confirmed strict script readiness is strong, while strict style readiness still requires migration work (inline `style` and runtime style mutation hotspots).
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Stage A was completed in the follow-up slice (see handoff note 14).
  - Continue staged inline-style cleanup before removing `'unsafe-inline'` from `style-src`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused for shared Supabase backend; no hosted `supabase db push` in this slice.
  - CSP violation collection remains mostly manual until dedicated `report-uri`/`report-to` ingestion is added.

## 14) Handoff note (2026-03-20, `L6-CSP-02` Stage A enforcement)
- Done:
  - Added enforced `Content-Security-Policy` in both deploy configs (`netlify.toml`, `vercel.json`) while retaining `Content-Security-Policy-Report-Only`.
  - Kept Stage A policy strict for scripts and temporarily compatible for styles (`style-src 'unsafe-inline'`) to avoid regression while style migration is pending.
  - Updated deploy header readiness coverage so parity tests now assert both enforced and report-only CSP headers.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Continue Stage B style cleanup to remove inline-style hotspots.
  - Tighten `style-src` after cleanup and close `L6-CSP-02`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase backend; no hosted `supabase db push` in this slice.
  - Strict style enforcement still has functional risk until inline-style debt is reduced.

## 15) Handoff note (2026-03-20, `L6-CSP-02` Stage B hotspot migration)
- Done:
  - Removed high-volume inline-style hotspots from `src/components/layout.js`, `src/pages/admin/admin.js`, and `src/pages/materials/materialsHandlers.js`.
  - Added centralized class-based replacements in `src/styles/components/csp-stage-b.css` (wired through `src/styles/main.css`) and aligned affected admin markup in `src/admin.html`.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Continue Stage B residual cleanup for remaining inline `style="..."`/style-script templates before final `style-src` tightening.
  - After cleanup, remove `'unsafe-inline'` from `style-src`, run smoke checks, and close `L6-CSP-02`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase backend; no hosted `supabase db push` in this slice.
  - Residual inline styling/templates (outside migrated hotspots) still block strict style CSP completion.

## 16) Handoff note (2026-03-20, `L6-CSP-02` Stage B residual cleanup)
- Done:
  - Removed remaining inline `style="..."` attributes from `src/*.html` by migrating them to centralized classes in `src/styles/components/csp-stage-b.css`.
  - Removed print-template inline `<style>/<script>` from `src/pages/materials/materialsHandlers.js`; print preview now uses external `src/styles/components/materials-print-preview.css` and module-bound listeners.
  - Audited runtime blockers before final tighten and captured remaining footprint: 31 JS template inline `style=` usages, 76 `.style` mutations, 5 `cssText` usages.
  - Applied safe rollback by restoring `'unsafe-inline'` in `style-src` (enforced + report-only) in `netlify.toml` and `vercel.json`; script-side strict CSP remains enforced.
  - Updated CSP readiness guardrails: `src/utils/deploySecurityHeaders.test.js` baseline aligned and `src/utils/cspReadiness.test.js` now also blocks inline style attributes.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase backend; no hosted `supabase db push`.
  - Run dedicated runtime style migration for `L6-CSP-02` (`style=` in JS templates, `.style` mutations, `cssText` removal) with class/state-driven replacements.
  - After migration, re-attempt strict `style-src` and then start `L6-REG-02` attacker-style regression expansion.
- Blocked/Risky:
  - Hosted/shared Supabase remains intentionally paused for `L6-2FA-02` rollout changes.
  - Final style-side strict CSP remains blocked by runtime style mutations, so `style-src` must stay temporarily relaxed until the follow-up migration slice is complete.

## 17) Handoff note (2026-03-20, `L6-CSP-02` visual parity + runtime-toggle follow-up)
- Done:
  - Verified parity scope without redesign: home CTA block stayed in restored state (including decorative particle animation wiring), and How-It-Works hero orbit was left unchanged.
  - Fixed the How-It-Works hero `Study Hub` text mismatch via targeted cascade correction (`.text-gradient.csp-inline-style-022`) so migrated style values match pre-migration behavior.
  - Migrated safe discrete runtime style toggles to stable classes in `src/pages/how-it-works/howItWorksPage.js` + `src/styles/how-it-works.css` (lightbox open/close + scroll-to-top states), removing remaining `cssText` usage there.
  - Migrated AOS fallback reveal in `src/pages/index/indexPageEffects.js` from inline `.style` assignments to class state (`.aos-fallback-visible` in `src/styles/main.css`).
  - Runtime blocker audit (this chat baseline -> after): `style= 0 -> 0`, `.style/.style= 43 -> 21`, `cssText 3 -> 0`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused for shared Supabase (`no hosted supabase db push`).
  - Continue narrow `L6-CSP-02` migration only for safe discrete toggles in remaining hotspots; avoid dynamic computed-style rewrites.
  - Re-audit blockers and attempt final `style-src` tightening only after remaining hotspots are stable.
- Blocked/Risky:
  - `style-src` remains intentionally relaxed (`'unsafe-inline'`) until runtime-style hotspot risk is lower.
  - Remaining blockers are concentrated in interaction-heavy animation logic where broad conversion could regress UX.

## 18) Handoff note (2026-03-21, animation/interactions regression gate)
- Done:
  - Added `docs/animation-interaction-regression-checklist.md` as the manual validation checklist for Home/How-It-Works/Contact animation and interaction parity.
  - Added `tests/smoke/animation-regression.spec.js` with visual snapshots and targeted interaction checks.
  - Generated baseline snapshots in `tests/smoke/animation-regression.spec.js-snapshots/`.
  - Validation in this slice: `npx.cmd playwright test tests/smoke/animation-regression.spec.js` PASS (5/5).
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Use `tests/smoke/animation-regression.spec.js` as a required smoke gate after each `L6-CSP-02` runtime-style migration slice.
  - Continue narrow `.style` hotspot reduction before final `style-src` tightening attempt.
- Blocked/Risky:
  - Snapshot baselines can drift across environments; update snapshots only on intentional approved visual changes.
  - Remaining runtime `.style` hotspots are still interaction-heavy and need careful migration.

## 19) Handoff note (2026-03-21, `L6-CSP-02` effect-preserving runtime slice 1)
- Done:
  - Applied an effect-preserving migration in `src/pages/index/indexPageEffects.js` to remove runtime `.style` writes without removing visual interactions:
    - cursor glow follow, feature-card tilt, and magnetic button/icon parallax now use Web Animations API state writes,
    - about mascot shine tracking now uses animation-driven overlay movement,
    - benefit-card spotlight tracking now uses runtime overlay elements plus CSS classes in `src/styles/main.css`.
  - Runtime blocker audit after this slice: `style= 0`, `.style/.style= 4`, `cssText 0`, `setAttribute('style', ...) 0`.
  - Validation in this slice: `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` PASS (2/2), `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Finish the remaining dynamic hotspots in `src/pages/how-it-works/howItWorksPage.js` and `src/pages/login/loginPageInit.js` with the same effect-preserving approach.
  - Re-run blocker audit + animation smoke after each narrow slice before attempting style-src tightening.
- Blocked/Risky:
  - Remaining blockers are concentrated in interaction-heavy transform/progress effects where broad rewrites can regress UX if not sliced carefully.
  - `style-src` should remain temporarily relaxed until these final runtime hotspots are migrated safely.

## 20) Handoff note (2026-03-21, `L6-CSP-02` effect-preserving runtime slice 2)
- Done:
  - Migrated the remaining runtime `.style` effect paths in `src/pages/how-it-works/howItWorksPage.js` to Web Animations API state writes (timeline progress transform + gallery tilt interaction).
  - Migrated the final runtime `.style` path in `src/pages/login/loginPageInit.js` (mascot tilt) to animation state writes while preserving behavior.
  - Runtime blocker audit after this slice: `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`.
  - Validation in this slice: `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` PASS (2/2), `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Run a controlled pre-tighten readiness slice (full animation smoke + CSP preflight checklist + deploy-header parity check) before a separate style-src tightening chat.
- Blocked/Risky:
  - `style-src` remains intentionally relaxed in this chat; tightening is deferred by plan.
  - Animation-heavy surfaces must keep regression smoke as a required gate on every CSP tightening step.

## 21) Handoff note (2026-03-21, `L6-CSP-02` pre-tighten readiness slice)
- Done:
  - Completed full regression gate before tightening: `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` PASS (5/5).
  - Completed CSP/header preflight gate: `npm.cmd run test -- src/utils/cspReadiness.test.js src/utils/deploySecurityHeaders.test.js` PASS.
  - Revalidated full baseline: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
  - Rechecked runtime JS/TS blocker baseline: `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Run final strict `style-src` tightening in a dedicated chat only, with full smoke/test/build/blocker-gate immediately after.
- Blocked/Risky:
  - Tightening remains high-sensitivity and should stay isolated from unrelated code changes.
  - Snapshot baselines must not be updated unless visual changes are explicitly approved.

## 22) Handoff note (2026-03-21, `L6-CSP-02` final `style-src` tightening slice)
- Done:
  - Removed `'unsafe-inline'` from `style-src` in enforced and report-only CSP headers in both `netlify.toml` and `vercel.json`.
  - Synced deploy parity baseline in `src/utils/deploySecurityHeaders.test.js`.
  - Validation in this slice:
    - `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` PASS (5/5)
    - `npm.cmd run test` PASS
    - `npm.cmd run build` PASS
  - Runtime JS/TS blocker audit remains clean: `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until an isolated window exists.
  - Start `L6-REG-02` attacker-style regression expansion.
- Blocked/Risky:
  - CSP style tightening is complete; primary remaining Lesson 6 risk is hosted rollout coupling for `L6-2FA-02`.
  - Snapshot baselines should only be updated for explicitly approved visual changes.

