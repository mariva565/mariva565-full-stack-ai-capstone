# Lesson 6 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L6-OBS-01` | centralized security logging | `done` | Added `docs/security-observability-baseline.md` with current emitter inventory, normalized event contract, target Supabase-backed ingestion path, and retention/ownership baseline for security-relevant events. |
| `L6-DEP-01` | dependency audit cadence | `done` | Added `docs/dependency-security-audit-cadence.md` with required commands, cadence windows, severity policy, ownership, and release-blocker expectations; linked it from the release checklist and DoD. |

## P1 (High)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L6-OBS-02` | security alerting | `done` | Added `docs/security-alerting-runbook.md` with warn/critical thresholds, owner routing, first-response actions, release impact, and interim handling for instrumentation gaps across auth/chat/admin/authz/release signals. |
| `L6-DEP-02` | dependency maintenance workflow | `done` | Added `deps:*` scripts in `package.json` and `docs/dependency-review-checklist.md` so monthly/release dependency review can run through one short repeatable workflow. |
| `L6-2FA-01` | admin 2FA strategy | `done` | Added `docs/admin-2fa-rollout-strategy.md` with the chosen TOTP-first admin-only MFA rollout, `role + aal2` enforcement model, backup-factor/recovery policy, and phased implementation plan for `L6-2FA-02`. |
| `L6-OBS-03` | alerting automation | `done` | Added centralized event ingestion and first automated threshold checks via `supabase/migrations/20260320000000_security_event_sink_and_alert_incidents.sql`, `supabase/functions/_shared/securityEventLogger.ts`, `supabase/functions/security-event-ingest/index.ts`, browser forwarding in `src/utils/securityEventIngest.js` + telemetry hook updates, and authz-denied event emission in `supabase/functions/_shared/adminAuth.ts`. |
| `L6-CSP-01` | CSP rollout (report-only) | `done` | Added shared `Content-Security-Policy-Report-Only` baseline to `netlify.toml` and `vercel.json` with explicit allowlists for current CDN/font/map/Supabase usage; extended `src/utils/deploySecurityHeaders.test.js` to lock CSP parity between providers. Validation in this chat: `npm.cmd run test` PASS, `npm.cmd run build` PASS (2026-03-20). |
| `L6-REG-02` | attacker-style regressions | `done` | Added targeted hostile-flow regression coverage across auth/admin/telemetry paths: rapid retry cooldown transition + anti-abuse telemetry assertions (`src/utils/authThrottle.test.js`), auth mapper precedence and hostile payload safety (`src/utils/authErrorMapper.test.js`), admin mapper `admin_mfa_required` and hostile payload safety (`src/pages/admin/adminErrorMapper.test.js`), and anti-abuse payload sanitization/allowlist checks (`src/utils/antiAbuseTelemetry.test.js`). Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS, `npm.cmd run test:e2e -- tests/smoke/public-pages.spec.js` PASS (2026-03-21). |

## P2 (Later)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L6-2FA-02` | admin 2FA implementation | `in_progress` | Added `src/mfa.html`, `src/pages/mfa/mfa.js`, `src/services/mfaService.js`, profile/admin integration, `aal2` enforcement in admin Edge Functions, and `supabase/migrations/20260319000000_admin_aal2_policies.sql`. Local rollout checkpoint: backup admin exists; `admin@test.com` completed first TOTP enrollment; second admin flow was manually exercised. UX/session follow-up (2026-03-20): MFA verify redirect sync was tightened and inline status feedback was added near the 6-digit form so success/error is visible without scrolling to top toasts. Important current behavior: this rollout is session-based MFA (`aal2` once per admin session), not per-action MFA re-prompt. Preflight docs follow-up (2026-03-21): hosted rollout evidence/checklist refinement is now captured in `docs/admin-2fa-validation-checklist.md` and `docs/supabase-hosted-db-push-safe-rollout-checklist.md` with explicit no-deploy guardrails. Remaining: keep hosted rollout paused for the shared backend, then verify fresh-session challenge flow, `aal2`-only privileged admin actions, `aal1` rejection, backup MFA coverage, and recovery handling from `docs/admin-2fa-validation-checklist.md`. |
| `L6-CSP-02` | strict CSP enforcement | `done` | Final tightening is complete: removed `'unsafe-inline'` from `style-src` in both enforced and report-only CSP headers (`netlify.toml`, `vercel.json`) and synced parity baseline in `src/utils/deploySecurityHeaders.test.js`. Post-tighten validation in this slice stayed green (`npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` PASS 5/5, `npm.cmd run test` PASS, `npm.cmd run build` PASS), with runtime blocker audit still at zero (`style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`). |
| `L6-SES-01` | admin session hardening | `done` | Added explicit admin session-hardening policy in `docs/admin-session-hardening-policy.md` and implemented enforcement in `src/utils/adminSessionPolicy.js`, `src/pages/admin/admin.js`, `src/pages/admin/adminService.js`, and `supabase/functions/_shared/adminAuth.ts` (idle timeout `15m`, recent verification window `30m`, deterministic deny codes, reason-aware redirect bridge after MFA verify). Regression deny coverage added in `src/utils/adminSessionPolicy.test.js` and `src/pages/admin/adminErrorMapper.test.js`. Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS (2026-03-21). |
| `L6-RLS-01` | systematic RLS verification | `done` | Added structured read/write matrix in `docs/lesson-6-rls-verification-matrix.md` for sensitive tables and actor scenarios (`anon`, authenticated owner/non-owner, `admin aal1`, `admin aal2`, service role), plus automated negative-path checks in `src/utils/rlsPolicyMatrix.js` + `src/utils/rlsPolicyMatrix.test.js` (deny-path assertions are now test-blocked). |
| `L6-RLS-02` | storage materials owner-scope tighten | `done` | Added migration `supabase/migrations/20260321000000_materials_storage_owner_write_policies.sql` to replace broad authenticated `storage.objects` (`materials`) `insert/update` with owner-scoped policies (`owner = auth.uid()`, `TO authenticated`), and expanded deny-path regression checks in `src/utils/rlsPolicyMatrix.test.js` (non-owner/anon deny + broad-policy regression block). Validation in this slice: `npm.cmd run test` PASS (14 files / 93 tests), `npm.cmd run build` PASS (2026-03-21). |
| `L6-DEP-03` | dependency monitoring automation | `done` | Added automated dependency monitoring via `.github/dependabot.yml` (weekly npm + GitHub Actions dependency PRs with security labels/grouping) and `.github/workflows/dependency-security-monitoring.yml` (weekly runtime review + monthly/manual full audit evidence workflow using existing `deps:*` scripts). Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS (2026-03-21). |
| `L6-ABUSE-01` | public-form anti-bot criteria | `done` | Added `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` with explicit `Observe/Prepare/Activate` thresholds, risk-ranked public flows (`register`, `contact`), evidence sources, accessibility guardrails, and `L6-ABUSE-02` entry/rollback criteria. Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS (2026-03-21). |
| `L6-ABUSE-02` | public-form anti-bot rollout | `todo` | Implement the chosen anti-bot control only if the trigger criteria justify it. |

## External review alignment (2026-03-20)
- The point-by-point evaluation and phased action plan are consolidated in `docs/lesson-6-priority-hardening-plan.md`.
- New tracker IDs introduced from this alignment: `L6-OBS-03`, `L6-CSP-01`, `L6-CSP-02`, `L6-SES-01`, `L6-REG-02`, `L6-RLS-01`, `L6-DEP-03`.
- Report-Only CSP triage evidence for `L6-CSP-02` is tracked in `docs/lesson-6-csp-report-only-triage.md`.

## L6-2FA-02 Quick Resume (2026-03-21)
- Hosted/shared Supabase rollout is still intentionally paused because it affects both Netlify and Vercel live paths.
- Local/admin flow currently behaves as designed: admin MFA challenge is required to elevate the session to `aal2`, then privileged paths rely on that session state.
- User admin mutations (`create-user`, `update-user`, `delete-user`, block/unblock, role change) enforce `admin + aal2` in hardened Edge Functions.
- A confirmation modal before destructive actions (for example delete user) is only a UX confirm step; it is not the MFA challenge.
- Own-course create/delete by the same signed-in user can still work via owner-based course RLS policies, so this alone is not proof that `aal2` enforcement failed.
- Microsoft Authenticator entry may look like the live environment because local frontend is currently wired to hosted/shared Supabase credentials.
- Preflight evidence pack is now prepared in `docs/admin-2fa-validation-checklist.md` and `docs/supabase-hosted-db-push-safe-rollout-checklist.md` (no hosted deploy actions executed in this prep slice).
- Decision still open for a later slice: keep session-based MFA only, or add stricter per-action re-auth window for the highest-risk admin mutations.

## L6-CSP-01 Handoff (2026-03-20)
- Done:
  - Added `Content-Security-Policy-Report-Only` to both deploy targets (`netlify.toml` + `vercel.json`) with the same baseline policy string.
  - Updated deploy header readiness coverage in `src/utils/deploySecurityHeaders.test.js` so CSP parity drift is now test-blocked.
  - Ran required validation commands: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Completed in follow-up: Report-Only triage prep is now documented in `docs/lesson-6-csp-report-only-triage.md`.
  - Continue with `L6-CSP-02` Stage B style hardening.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused for the shared Supabase backend; no hosted `supabase db push` in this slice.
  - CSP violation collection is currently manual (browser/devtools evidence) until a dedicated report ingestion endpoint is added.

## L6-CSP-02 Prep Handoff (2026-03-20)
- Done:
  - Added `docs/lesson-6-csp-report-only-triage.md` with `L6-CSP-01` evidence, current blockers, and staged `L6-CSP-02` rollout plan.
  - Added `src/utils/cspReadiness.test.js` to keep HTML templates free of inline `<script>` blocks and inline event-handler attributes (`on*=`).
  - Confirmed static blockers for strict `style-src` (112 inline `style="..."` hits and runtime style mutation hotspots).
  - Validation for this prep slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Stage A completed in follow-up (`Content-Security-Policy` is now enforced alongside Report-Only).
  - Stage B: migrate high-volume inline styles to CSS classes/custom properties, then remove `'unsafe-inline'` from `style-src`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused for shared Supabase (`no hosted supabase db push` in this slice).
  - CSP reporting remains manual until a dedicated `report-uri`/`report-to` endpoint is introduced.

## L6-CSP-02 Stage A Handoff (2026-03-20)
- Done:
  - Enabled enforced `Content-Security-Policy` in both deploy targets (`netlify.toml` + `vercel.json`) using the staged policy (`script-src` strict; temporary style compatibility).
  - Kept `Content-Security-Policy-Report-Only` active for continued signal collection while enforcing Stage A.
  - Updated `src/utils/deploySecurityHeaders.test.js` so parity tests now require both enforced and report-only CSP headers.
  - Validation in this Stage A slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Stage B: remove top inline-style hotspots and transition away from `style-src 'unsafe-inline'`.
  - After style migration, tighten CSP further and close `L6-CSP-02`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push` in this slice).
  - Strict style enforcement is still blocked by existing inline style usage.

## L6-CSP-02 Stage B Slice Handoff (2026-03-20)
- Done:
  - Replaced major inline-style hotspots with class-based styling in `src/components/layout.js`, including navbar/offcanvas/avatar fragments and the already-logged-in modal overlay.
  - Reworked admin hotspot templates in `src/pages/admin/admin.js` (unauthorized screen + map marker/popup/legend templates + role-modal icon state + edit field visibility + CSV hidden link) to remove inline style usage.
  - Reworked materials hotspot templates in `src/pages/materials/materialsHandlers.js` (pending window placeholders, preview loading state, PDF export node/mount, plain-note formatter) to remove inline style usage.
  - Added centralized Stage B CSS surface in `src/styles/components/csp-stage-b.css` and imported it from `src/styles/main.css`; aligned `src/admin.html` map/edit/role-modal markup with class-based states.
  - Validation in this Stage B slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Continue Stage B by removing remaining inline style blockers outside this hotspot set (notably HTML inline `style="..."` attributes and print-preview inline style/script template in `src/pages/materials/materialsHandlers.js`).
  - After residual blockers are cleared, tighten `style-src` by removing `'unsafe-inline'` and run critical smoke checks before closing `L6-CSP-02`.
- Blocked/Risky:
  - Keep hosted `L6-2FA-02` rollout paused on the shared backend (`no hosted supabase db push` in this slice).
  - Strict style enforcement still has regression risk until residual inline style/script templates are migrated.

## L6-CSP-02 Stage B Residual Cleanup Handoff (2026-03-20)
- Done:
  - Removed remaining inline `style="..."` attributes from `src/*.html` and migrated them to centralized classes in `src/styles/components/csp-stage-b.css`.
  - Removed inline print-template `<style>/<script>` from `src/pages/materials/materialsHandlers.js`; print preview now loads `src/styles/components/materials-print-preview.css` and binds print/close behavior from module code.
  - Updated `src/utils/deploySecurityHeaders.test.js` baseline and expanded `src/utils/cspReadiness.test.js` with inline-style-attribute blocking.
  - Ran explicit runtime-style audit before final tighten and found remaining blockers: 31 JS template inline `style=` usages, 76 `.style` mutations, 5 `cssText` usages.
  - Applied safe rollback for style-side CSP: restored `'unsafe-inline'` in `style-src` (Netlify + Vercel, enforced + report-only), while keeping script-side strict CSP unchanged.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS, `npm.cmd run test:e2e -- tests/smoke/public-pages.spec.js` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Run a dedicated runtime style hardening slice for `L6-CSP-02`: migrate JS-template `style=` usages, replace `.style`/`cssText` mutations with class/state-driven patterns, and finish print-flow smoke checks.
  - After runtime migration, re-attempt final `style-src` tighten and then start `L6-REG-02` attacker-style regression expansion.
- Blocked/Risky:
  - Hosted/shared Supabase rollout for `L6-2FA-02` remains intentionally paused and out of scope in this slice.
  - Final style-side CSP hardening remains blocked by runtime style mutations (31/76/5 audit footprint), so `style-src` must stay temporarily relaxed (`'unsafe-inline'`) until the dedicated migration slice is complete.

## L6-CSP-02 Runtime Style Migration Follow-up (2026-03-20)
- Done:
  - Completed the remaining `style=` cleanup outside the previous admin/courses/materials scope by removing the runtime inline style fallback in `src/pages/login/login.js`.
  - Kept test semantics intact while removing literal `style=` tokens from `src/utils/richHtmlSanitizer.test.js` fixture strings/assertion constants.
  - Migrated next highest-value discrete runtime toggles to classes only (no computed-style rewrite): auth page fade state (`src/pages/login/login.js`, `src/pages/register/register.js`, `src/styles/layouts/auth.css`), contact form success show/hide state (`src/pages/contact/contact.js`, `src/styles/layouts/contact.css`), profile avatar remove-link visibility (`src/pages/profile/profile.js`), maintenance mascot fallback visibility (`src/pages/maintenance/maintenancePageInit.js`), and reduced-motion canvas hiding (`src/pages/contact/contactConstellation.js`, `src/pages/index/indexHero3d.js`).
  - Post-slice blocker audit results: `style= 31 -> 0`, `.style/.style= 60 -> 42` (or `76 -> 42` from Stage B rollback baseline), `cssText 5 -> 3`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Continue `L6-CSP-02` with remaining discrete state toggles in high-density files (`src/pages/how-it-works/howItWorksPage.js`, `src/pages/index/indexPageEffects.js`) while still avoiding dynamic computed style rewrites in this pass.
  - After additional runtime reduction and smoke checks, plan final pre-tighten audit before attempting `style-src` strictness again.
- Blocked/Risky:
  - `style-src` remains intentionally rolled back (`'unsafe-inline'`) until remaining dynamic runtime style hotspots are migrated.
  - Highest remaining blockers are concentrated in animation-heavy files where careless conversion could regress UX if done too broadly.

## L6-CSP-02 Visual Parity + Runtime Toggle Slice (2026-03-20)
- Done:
  - Verified visual parity scope without redesign changes: home CTA block remains in its restored state (including decorative particle animation hookup) and How-It-Works hero orbit remained untouched.
  - Fixed the How-It-Works hero `Study Hub` text cascade mismatch with a minimal targeted selector adjustment in `src/styles/components/csp-stage-b.css` (`.text-gradient.csp-inline-style-022`) so migrated values win over the global `.text-gradient` utility exactly like the original inline style.
  - Migrated safe discrete runtime style toggles to class states in `src/pages/how-it-works/howItWorksPage.js` + `src/styles/how-it-works.css` (lightbox open/close, close-button hover, scroll-to-top visibility/hover), removing the remaining `cssText` usage in that page script.
  - Migrated the home AOS fallback reveal from direct `.style` mutation to class-based state (`.aos-fallback-visible`) in `src/pages/index/indexPageEffects.js` + `src/styles/main.css`.
  - Post-slice blocker audit results (this chat baseline -> after): `style= 0 -> 0`, `.style/.style= 43 -> 21`, `cssText 3 -> 0`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Continue `L6-CSP-02` only on remaining safe discrete toggles where possible (for example `indexPageEffects`/`indexHero3d`/`coursesPageInit`) while explicitly avoiding dynamic computed style rewrites.
  - Re-run runtime blocker audit after each narrow slice and attempt final `style-src` tightening only when remaining hotspots are either migrated safely or deliberately accepted as dynamic exceptions.
- Blocked/Risky:
  - `style-src` stays intentionally rolled back (`'unsafe-inline'`) until remaining runtime hotspots are reduced to a confident pre-tighten baseline.
  - Remaining blockers are mostly animation/interaction-driven style mutations where broad refactors carry UX regression risk.

## L6-CSP-02 Animation/Interaction Regression Gate (2026-03-21)
- Done:
  - Added animation/interactions manual gate checklist in `docs/animation-interaction-regression-checklist.md` covering Home, How-It-Works, and Contact flows (desktop/mobile, light/dark, reduced motion).
  - Added automated visual/interactions smoke in `tests/smoke/animation-regression.spec.js`:
    - visual snapshots: home CTA card, how-it-works hero text block, contact form card
    - interaction checks: how-it-works lightbox open/close, home scroll-to-top visibility toggle
  - Generated Playwright baseline snapshots in `tests/smoke/animation-regression.spec.js-snapshots/`.
  - Validation in this slice: `npx.cmd playwright test tests/smoke/animation-regression.spec.js` PASS (2026-03-21, 5/5).
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Run `tests/smoke/animation-regression.spec.js` after each narrow `L6-CSP-02` runtime-style slice before attempting any `style-src` tightening.
  - Continue reducing remaining `.style` hotspots with safe discrete-toggle migration only.
- Blocked/Risky:
  - Visual snapshot baselines are OS/browser-render dependent; update snapshots only when a visual change is intentionally approved.
  - Dynamic computed style hotspots still require cautious migration to avoid UX regressions.

## L6-CSP-02 Runtime Toggle Micro Slice (2026-03-21)
- Done:
  - Verified visual parity without redesign changes using the animation regression gate:
    - Home CTA card snapshot remains stable (`clean gradient` baseline in `tests/smoke/animation-regression.spec.js-snapshots/home-cta-card-edge-smoke-win32.png`).
    - How-It-Works hero `Study Hub` text effect snapshot remains stable.
  - Confirmed no remaining JS/TS template inline `style=` blockers in `src/**/*.js,ts` (`0`).
  - Migrated 3 safe runtime `.style` mutations to class-based styling:
    - `src/pages/index/indexHero3d.js`: reduced-motion canvas hide now uses `.hero-canvas-hidden`.
    - `src/components/BohemianParticles.js`: canvas sizing moved from runtime inline styles to `.bohemian-particles-canvas`.
    - `src/styles/components/csp-stage-b.css`: added the two supporting classes.
  - Runtime blocker audit (this chat baseline -> after): `style= 0 -> 0`, `.style/.style= 21 -> 18`, `cssText 0 -> 0`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice:
    - `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` PASS (2/2)
    - `npm.cmd run test` PASS
    - `npm.cmd run build` PASS
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Continue only safe discrete-toggle migration in remaining `.style` hotspots (first candidate: fallback cleanup in `src/pages/courses/coursesPageInit.js`), while still avoiding dynamic computed transform/position rewrites.
  - Re-run blocker audit and animation regression gate after each narrow slice before another `style-src` tightening attempt.
- Blocked/Risky:
  - `style-src` remains intentionally rolled back (`'unsafe-inline'`) until remaining runtime hotspots are reduced to a low-risk pre-tighten baseline.
  - Remaining `.style` blockers are mostly interaction-heavy and dynamic by design (mouse position/transform/progress), so migration should stay selective.

## L6-CSP-02 Effect-Preserving Runtime Slice 1 (2026-03-21)
- Done:
  - Preserved home-page interaction effects while removing runtime style writes in `src/pages/index/indexPageEffects.js`:
    - cursor glow follow now uses Web Animations API (no direct `.style.left/.style.top` writes),
    - feature-card tilt now uses animation state writes,
    - magnetic button/icon parallax now uses animation state writes,
    - about mascot shine follow now uses animation state writes,
    - benefit-card spotlight follow is preserved via runtime overlay element (`.runtime-spotlight-overlay`) with animation-driven movement.
  - Added supporting spotlight CSS in `src/styles/main.css` (`.runtime-spotlight-host`, `.runtime-spotlight-overlay`).
  - Kept visual parity guard green for the required scope:
    - home CTA snapshot stable,
    - how-it-works hero `Study Hub` snapshot stable.
  - Runtime blocker audit (this slice baseline -> after): `style= 0 -> 0`, `.style/.style= 16 -> 4`, `cssText 0 -> 0`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice:
    - `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` PASS (2/2)
    - `npm.cmd run test` PASS
    - `npm.cmd run build` PASS
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Finish remaining `.style` hotspots in `src/pages/how-it-works/howItWorksPage.js` and `src/pages/login/loginPageInit.js` with the same effect-preserving approach.
  - Re-run blocker audit and animation regression smoke after each narrow slice before another `style-src` tightening attempt.
- Blocked/Risky:
  - Remaining blockers are still dynamic effect paths (`timeline` + `tilt`) that need careful conversion to avoid visible interaction regressions.
  - `style-src` must stay relaxed until remaining runtime writes are reduced to a stable pre-tighten baseline.

## L6-CSP-02 Effect-Preserving Runtime Slice 2 (2026-03-21)
- Done:
  - Migrated the remaining effect-heavy runtime writes in `src/pages/how-it-works/howItWorksPage.js` from direct `.style` mutation to Web Animations API state updates:
    - timeline progress now animates via transform state (`scaleY`) instead of runtime height writes,
    - gallery-card tilt interaction now uses animation state writes (mousemove + mouseleave).
  - Migrated the final runtime `.style` write in `src/pages/login/loginPageInit.js` (mascot tilt tracking) to animation state updates while preserving the visual interaction.
  - Runtime blocker audit (this slice baseline -> after): `style= 0 -> 0`, `.style/.style= 1 -> 0` (or `4 -> 0` from previous full-slice snapshot), `cssText 0 -> 0`, `setAttribute('style', ...) 0 -> 0`.
  - Validation in this slice:
    - `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` PASS (2/2)
    - `npm.cmd run test` PASS
    - `npm.cmd run build` PASS
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Run one controlled pre-tighten readiness slice (full animation smoke + CSP preflight checklist + deploy-header parity confirmation) before attempting style-src tightening in a separate chat.
- Blocked/Risky:
  - `style-src` remains intentionally relaxed (`'unsafe-inline'`) in this chat by plan; tightening should happen only after pre-tighten checks remain stable.
  - Animation-heavy surfaces still need regression gating on every CSP step to avoid visual drift.

## L6-CSP-02 Pre-Tighten Readiness Slice (2026-03-21)
- Done:
  - Ran full animation/interactions regression smoke gate: `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` PASS (5/5).
  - Ran CSP preflight guardrails: `npm.cmd run test -- src/utils/cspReadiness.test.js src/utils/deploySecurityHeaders.test.js` PASS (2 files, 6 tests).
  - Re-validated full baseline after preflight: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
  - Re-ran runtime blocker audit and confirmed no residual JS/TS blockers: `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`).
  - Execute final `style-src` tightening in a dedicated chat only (remove `'unsafe-inline'`, run full smoke/test/build gate, then decide close/no-close for `L6-CSP-02`).
- Blocked/Risky:
  - Tightening step still carries regression risk and must be isolated from other changes.
  - Animation snapshot baselines should only be updated for explicitly approved visual changes.

## L6-CSP-02 Final `style-src` Tightening Slice (2026-03-21)
- Done:
  - Removed `'unsafe-inline'` from `style-src` in both enforced and report-only CSP headers in `netlify.toml` and `vercel.json`.
  - Synced deploy parity baseline in `src/utils/deploySecurityHeaders.test.js` so tests now lock the strict `style-src` variant.
  - Revalidated animation and interaction parity with the required gate:
    - `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` PASS (5/5)
    - `npm.cmd run test` PASS
    - `npm.cmd run build` PASS
  - Re-ran JS/TS runtime blocker audit and confirmed strict baseline remains clean: `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Start `L6-REG-02` attacker-style regression expansion in the next dedicated chat.
- Blocked/Risky:
  - CSP style tightening is complete; primary remaining Lesson 6 risk is hosted rollout coupling for `L6-2FA-02`, not CSP headers.
  - Animation snapshot baselines still need explicit approval before any future update.

## L6-REG-02 Attacker-Style Regression Slice (2026-03-21)
- Done:
  - Expanded auth hostile-flow coverage in `src/utils/authThrottle.test.js` with rapid retry pressure during active cooldown, including anti-abuse transition assertions (`cooldown_activated` -> `cooldown_blocked`) and stable backoff-level expectations.
  - Expanded auth error mapping coverage in `src/utils/authErrorMapper.test.js`:
    - network-vs-rate-limit precedence safety,
    - password-reset rate-limit transition mapping,
    - hostile backend payload non-leak fallback assertions.
  - Expanded admin error mapping coverage in `src/pages/admin/adminErrorMapper.test.js`:
    - explicit `admin_mfa_required` mapping,
    - network precedence over MFA-required pattern noise,
    - hostile backend payload non-leak fallback assertions.
  - Expanded anti-abuse telemetry coverage in `src/utils/antiAbuseTelemetry.test.js` with adversarial payload sanitization checks (field normalization + detail allowlist + length caps).
  - Validation in this slice: `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Start `L6-RLS-01` structured verification matrix in a dedicated follow-up chat.
- Blocked/Risky:
  - Regression coverage is stronger but still unit-heavy; if future flaky e2e hostile scenarios are added, keep deterministic unit checks as the release blocker baseline.
  - Hosted/shared Supabase coupling remains the primary Lesson 6 delivery risk.

## L6-RLS-01 Structured Matrix Verification Slice (2026-03-21)
- Done:
  - Added structured RLS matrix evidence doc: `docs/lesson-6-rls-verification-matrix.md` with read/write coverage for sensitive tables and actor scenarios (`anon`, authenticated owner/non-owner, admin `aal1`, admin `aal2`, service role).
  - Added migration-state parser helper (`src/utils/rlsPolicyMatrix.js`) that reconstructs active policy state from `supabase/migrations/*.sql`.
  - Added mandatory negative-path regression coverage in `src/utils/rlsPolicyMatrix.test.js`, including:
    - `admin aal1` deny checks via `public.is_admin_aal2()` gates on privileged policies,
    - stale broad policy-drop checks (`user_roles`, `system_settings`, storage delete),
    - admin-only read for `contact_messages`,
    - owner-scoped write checks for `courses/modules/materials`,
    - closed client access for `security_events` + `security_alert_incidents`.
  - Validation in this slice: `npm.cmd run test -- src/utils/rlsPolicyMatrix.test.js` PASS, `npm.cmd run test` PASS, `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Start a focused follow-up decision on storage policy tightening (`storage.objects` materials bucket currently allows authenticated `insert/update`), then scope migration/test plan before any hosted rollout.
- Blocked/Risky:
  - `L6-RLS-01` verification is complete, but policy-hardening follow-up remains for storage materials bucket update/insert breadth.
  - Hosted/shared Supabase coupling remains a global delivery risk for any policy rollout slice.

## L6-SES-01 Admin Session Hardening Slice (2026-03-21)
- Done:
  - Added policy spec doc in `docs/admin-session-hardening-policy.md` with explicit windows and rollback guidance.
  - Added shared policy helpers and decision engine in `src/utils/adminSessionPolicy.js` (activity touch, recent-verify recording, short sync bridge, deterministic allow/deny reasons/codes).
  - Enforced admin gate behavior in `src/pages/admin/admin.js`:
    - reason-aware redirect to `/mfa.html?next=/admin.html&reason=...`,
    - admin activity tracking to keep idle window evidence updated.
  - Enforced mutation preflight policy in `src/pages/admin/adminService.js` and server-side deny windows in `supabase/functions/_shared/adminAuth.ts`, with deny code passthrough from admin Edge Functions.
  - Expanded deny/regression coverage:
    - `src/utils/adminSessionPolicy.test.js` (policy decision negatives and bridge behavior),
    - `src/pages/admin/adminErrorMapper.test.js` (new deny-code mapping and precedence safety).
  - Validation in this slice: `npm.cmd run test` PASS (14 files / 92 tests), `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Keep `L6-RLS-02` storage policy tighten as baseline and watch for regressions during future policy changes.
- Blocked/Risky:
  - Server-side "idle timeout" currently relies on JWT age (`iat`) as a conservative guardrail and does not observe per-request activity directly.
  - Hosted/shared Supabase coupling remains the primary delivery risk for rollout-dependent tasks.

## L6-RLS-02 Storage Objects Materials Tighten Slice (2026-03-21)
- Done:
  - Added migration `supabase/migrations/20260321000000_materials_storage_owner_write_policies.sql`:
    - dropped broad policies `Authenticated users can upload materials` and `Authenticated users can update materials`,
    - created owner-scoped replacements `Users can upload own materials` and `Users can update own materials` with `TO authenticated` and `owner = auth.uid()` boundaries for the `materials` bucket.
  - Expanded deny-path coverage in `src/utils/rlsPolicyMatrix.test.js`:
    - broad storage write policy names are test-blocked as stale,
    - `storage.objects` (`materials`) `insert/update` now require authenticated-only role scope and owner checks (`owner = auth.uid()`),
    - regression check blocks old broad `(SELECT auth.role()) = 'authenticated'` write pattern for materials bucket.
  - Synced matrix evidence in `docs/lesson-6-rls-verification-matrix.md` so storage write expectations now show non-owner deny and owner-scoped allow.
  - Validation in this slice: `npm.cmd run test` PASS (14 files / 93 tests), `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Keep `L6-DEP-03` dependency monitoring automation as baseline and review first hosted workflow evidence run.
- Blocked/Risky:
  - Hosted/shared Supabase coupling remains the primary rollout risk for any migration deployment.
  - This slice validates policy state from migration history; hosted runtime verification remains intentionally deferred while rollout is paused.

## L6-DEP-03 Dependency Monitoring Automation Slice (2026-03-21)
- Done:
  - Added Dependabot automation in `.github/dependabot.yml`:
    - weekly `npm` update checks with grouped patch/minor updates (`production` + `development`),
    - weekly `github-actions` dependency checks,
    - dependency/security labels and commit prefixes.
  - Added CI dependency monitoring workflow in `.github/workflows/dependency-security-monitoring.yml`:
    - weekly scheduled runtime-focused review (`deps:review:release`),
    - monthly scheduled and manual full review (`deps:review:full`),
    - uploaded audit logs as build artifacts for evidence retention.
  - Kept existing local/manual policy flow intact in `docs/dependency-security-audit-cadence.md` and `docs/dependency-review-checklist.md`; automation extends it, not replaces it.
  - Validation in this slice: `npm.cmd run test` PASS (14 files / 93 tests), `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Keep `L6-ABUSE-02` conditional and start only if `L6-ABUSE-01` reaches `Activate`.
- Blocked/Risky:
  - First hosted CI evidence run for the new scheduled workflow depends on GitHub Actions schedule/manual dispatch.
  - If dependency bot noise is high, reduce schedule/scope before disabling automation.

## L6-ABUSE-01 Public-Form Trigger Criteria Slice (2026-03-21)
- Done:
  - Added `docs/lesson-6-public-form-anti-bot-trigger-matrix.md` with explicit anti-bot decision thresholds:
    - `Observe/Prepare/Activate` levels for `register` and `contact` flows,
    - trigger rule for when `L6-ABUSE-02` can start (not before),
    - accessibility/UX guardrails and concrete rollback criteria.
  - Synced Lesson 6 planning and continuity docs so `L6-ABUSE-01` is tracked as complete and `L6-ABUSE-02` remains conditional.
  - Validation in this slice: `npm.cmd run test` PASS (14 files / 93 tests), `npm.cmd run build` PASS.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until staging/maintenance window is approved.
  - Start `L6-ABUSE-02` only if the new trigger matrix reaches `Activate`.
  - Review first hosted `L6-DEP-03` workflow evidence run and tune automation noise only if needed.
- Blocked/Risky:
  - `L6-ABUSE-02` is intentionally blocked behind evidence thresholds; no rollout without trigger activation.
  - Shared hosted Supabase coupling remains the primary rollout risk for `L6-2FA-02`.

## L6-2FA-02 Preflight Evidence And Checklist Refinement Slice (2026-03-21)
- Done:
  - Refined `docs/admin-2fa-validation-checklist.md` with:
    - explicit preflight-only evidence section,
    - no-hosted-deploy guardrails,
    - rollout-window validation sequence and PASS/FAIL evidence capture.
  - Refined `docs/supabase-hosted-db-push-safe-rollout-checklist.md` with:
    - stronger `L6-2FA-02` preflight readiness checks (including backup-admin MFA readiness),
    - explicit evidence log template for `aal1`/`aal2` checks,
    - stronger "do not push" guardrail when preflight/baseline fails.
  - Added `docs/admin-2fa-emergency-rollback-sql-pack.md` with copy/paste hosted incident SQL:
    - Level 1 fast compatibility patch,
    - Level 2 broader compatibility patch,
    - Level 3 last-resort legacy settings fallback,
    - strict restore script to re-enable intended `aal2` hardening after triage.
  - Filled current paused preflight record values in both checklists:
    - project ref (`mitaozfutwlzrccrecct`),
    - branch/commit (`security/lesson1-closeout-2026-03-18` @ `bf1bcbec8f1567bb41eb1cee4ceb84e77501c2ed`),
    - operator (`mariy`) and explicit backup-operator assignment gap.
  - Synced tracker/plan/snapshot/master-plan notes so the current state is explicit: preflight docs ready, hosted rollout still paused.
- Next:
  - Keep hosted `L6-2FA-02` rollout paused on shared Supabase (`no hosted supabase db push`) until isolated staging or an approved maintenance window exists.
  - During that approved window, execute the prepared hosted checklist and record PASS/FAIL evidence before any completion decision.
  - Keep `L6-ABUSE-02` conditional and start only if `Activate` thresholds are reached.
- Blocked/Risky:
  - Shared hosted Supabase coupling remains the primary rollout risk for `L6-2FA-02`.
  - `L6-2FA-02` cannot be closed without hosted validation + backup/recovery confirmation in the target environment.

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Keep hosted `L6-2FA-02` rollout paused on the shared backend (no hosted `supabase db push`) until isolated staging or an approved maintenance window exists.
2. Execute the prepared hosted rollout checklist for `L6-2FA-02` during an approved window and capture PASS/FAIL evidence (still no hosted `supabase db push` outside that window).
3. Review whether `L6-ABUSE-02` activation thresholds are met before any anti-bot implementation.

## Validation status (latest known)
- This chat (`L6-2FA-02` preflight evidence/checklist refinement slice): docs-only update completed; no hosted deploy commands executed; no hosted `supabase db push` in this slice (2026-03-21)
- This chat (`L6-ABUSE-01` public-form trigger criteria slice): `npm.cmd run test` -> PASS (2026-03-21, 14 files / 93 tests)
- This chat (`L6-ABUSE-01` public-form trigger criteria slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-DEP-03` dependency monitoring automation slice): `npm.cmd run test` -> PASS (2026-03-21, 14 files / 93 tests)
- This chat (`L6-DEP-03` dependency monitoring automation slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-RLS-02` storage.objects materials tighten slice): `npm.cmd run test` -> PASS (2026-03-21, 14 files / 93 tests)
- This chat (`L6-RLS-02` storage.objects materials tighten slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-SES-01` admin session hardening slice): `npm.cmd run test` -> PASS (2026-03-21, 14 files / 92 tests)
- This chat (`L6-SES-01` admin session hardening slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-RLS-01` structured matrix verification slice): `npm.cmd run test -- src/utils/rlsPolicyMatrix.test.js` -> PASS (2026-03-21, 6 tests)
- This chat (`L6-RLS-01` structured matrix verification slice): `npm.cmd run test` -> PASS (2026-03-21, 13 files / 80 tests)
- This chat (`L6-RLS-01` structured matrix verification slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-REG-02` attacker-style regression slice): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-REG-02` attacker-style regression slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-REG-02` attacker-style regression slice): `npm.cmd run test:e2e -- tests/smoke/public-pages.spec.js` -> PASS (2026-03-21, 6/6)
- This chat (`L6-CSP-02` final `style-src` tightening slice): `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` -> PASS (2026-03-21, 5/5)
- This chat (`L6-CSP-02` final `style-src` tightening slice): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` final `style-src` tightening slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` final `style-src` tightening slice): blocker audit -> `style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0` (2026-03-21)
- This chat (`L6-CSP-02` pre-tighten readiness slice): `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js` -> PASS (2026-03-21, 5/5)
- This chat (`L6-CSP-02` pre-tighten readiness slice): `npm.cmd run test -- src/utils/cspReadiness.test.js src/utils/deploySecurityHeaders.test.js` -> PASS (2026-03-21, 2 files / 6 tests)
- This chat (`L6-CSP-02` pre-tighten readiness slice): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` pre-tighten readiness slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` effect-preserving runtime slice 2): `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` -> PASS (2026-03-21, 2/2)
- This chat (`L6-CSP-02` effect-preserving runtime slice 2): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` effect-preserving runtime slice 2): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` effect-preserving runtime slice 1): `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` -> PASS (2026-03-21, 2/2)
- This chat (`L6-CSP-02` effect-preserving runtime slice 1): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` effect-preserving runtime slice 1): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` runtime toggle micro slice): `npm.cmd run test:e2e -- tests/smoke/animation-regression.spec.js --grep "home CTA|how-it-works hero"` -> PASS (2026-03-21, 2/2)
- This chat (`L6-CSP-02` runtime toggle micro slice): `npm.cmd run test` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` runtime toggle micro slice): `npm.cmd run build` -> PASS (2026-03-21)
- This chat (`L6-CSP-02` animation/interactions regression gate): `npx.cmd playwright test tests/smoke/animation-regression.spec.js` -> PASS (2026-03-21, 5/5)
- This chat (`L6-CSP-02` visual parity + runtime toggle slice): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` visual parity + runtime toggle slice): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` runtime-style migration follow-up): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` runtime-style migration follow-up): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` safe rollback after runtime blocker audit): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` safe rollback after runtime blocker audit): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage B residual cleanup): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage B residual cleanup): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage B slice): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage B slice): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage A): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` Stage A): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` prep): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-02` prep): `npm.cmd run build` -> PASS (2026-03-20)
- This chat (`L6-CSP-01`): `npm.cmd run test` -> PASS (2026-03-20)
- This chat (`L6-CSP-01`): `npm.cmd run build` -> PASS (2026-03-20)
- This chat: `npm.cmd run test` -> PASS (2026-03-20)
- This chat: `npm.cmd run build` -> PASS (2026-03-20)
- This chat: `npm run test` -> PASS (2026-03-20)
- This chat: `npm run build` -> PASS (2026-03-20)
- This chat: `npm.cmd run test` -> PASS (2026-03-19)
- This chat: `npm.cmd run build` -> PASS (2026-03-19)
- This chat: Deno syntax validation could not run because `deno` is not installed in this shell.
- Local rollout checkpoint: backup admin created and `admin@test.com` completed first Microsoft Authenticator enrollment in local testing (2026-03-20)
- `npm.cmd run deps:review:local` -> PASS (2026-03-19)
- Network-required dependency audit commands were not run in this chat.
- Last known baseline: `npm.cmd run test` -> PASS (2026-03-19)
- Last known baseline: `npm.cmd run build` -> PASS (2026-03-19)
- Last known baseline: `npm.cmd run test:e2e` -> PASS (2026-03-19)
