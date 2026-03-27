# Security Learning Master Plan

## 1) Big Picture
This project includes a structured internal learning track for security.
Goal: learn security in practice while improving the real codebase.

We use a split-by-chat approach so context stays manageable:
- small scoped tasks
- clear handoff after each chat
- documented progress by lesson and task ID

## 2) Learning Strategy
- Learn on real project screens and flows (`login/register/materials/admin`).
- Apply fixes directly in code.
- Validate with build/tests/smoke checks.
- Document every milestone and next step.

## 3) Curriculum (Planned)

### Lesson 0: Baseline Hardening (Done)
- XSS hardening for materials/notes rendering.
- Edge Functions auth + validation hardening.
- Unified strong password policy.
- Deploy security headers.

### Lesson 1: Guided Security Review by Screens (Done)
Subpoints:
1. Login review
2. Register review
3. Materials review
4. Admin review
5. Prioritized first sprint task list
6. Lesson 1 Definition of Done
7. Lesson 1 smoke checklist

### Lesson 2: Rate Limiting + Anti-Abuse (Done)
- Endpoint-level anti-abuse strategy.
- Basic throttling/cooldown patterns.
- Abuse monitoring signals.

### Lesson 3: CSP + Inline Script Cleanup (Done)
- Move away from inline handlers.
- Prepare strict Content-Security-Policy.
- Reduce XSS surface area further.

### Lesson 4: Security Regression Tests (Done)
- XSS sanitizer regression tests.
- Auth/authz negative-path tests.
- Security smoke suite extension.

### Lesson 5: Production Security Readiness (Done)
- Final security checklist.
- Release blockers verification.
- Documentation finalization.

### Lesson 6: Operational Security Maturity (In Progress)
- Centralized security logging + alerting.
- Dependency audit + patch cadence.
- Admin 2FA rollout.
- Decision-driven CAPTCHA/anti-bot for public forms.
- External-review follow-up backlog: alerting automation, CSP rollout, admin session hardening, attacker-style regressions, structured RLS verification, and dependency monitoring automation.

## 4) Current Progress Marker
- Current lesson: **Lesson 6 (In Progress)**
- Current subpoint: **`L6-OBS-01`, `L6-OBS-02`, `L6-OBS-03`, `L6-DEP-01`, `L6-DEP-02`, `L6-DEP-03`, `L6-2FA-01`, `L6-CSP-01`, `L6-CSP-02`, `L6-REG-02`, `L6-RLS-01`, `L6-RLS-02`, `L6-SES-01`, and `L6-ABUSE-01` are done; `L6-2FA-02` remains in progress with hosted rollout paused; strict `style-src` enforcement is active without `'unsafe-inline'`, runtime JS/TS blockers remain at zero (`style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`), and structured RLS matrix deny-path checks (including materials storage owner-scope writes) are test-blocked**
- Recently completed: `L6-2FA-02` preflight evidence/checklist refinement slice updated `docs/admin-2fa-validation-checklist.md` and `docs/supabase-hosted-db-push-safe-rollout-checklist.md` with explicit no-deploy guardrails, rollout-window evidence capture, PASS/FAIL templates, and a concrete paused preflight record (project ref + branch/commit + operator) while keeping hosted rollout paused; hosted emergency rollback SQL is now documented in `docs/admin-2fa-emergency-rollback-sql-pack.md`.
- Validation snapshot (2026-03-21): latest `L6-2FA-02` preflight slice is docs-only (no hosted deploy commands, no hosted `supabase db push`). Prior green baseline remains unchanged: `npm.cmd run test` PASS (14 files / 93 tests), `npm.cmd run build` PASS, runtime JS/TS style blockers remain at zero (`style= 0`, `.style/.style= 0`, `cssText 0`, `setAttribute('style', ...) 0`), full animation/interactions gate remains green (5/5), and `npm.cmd run test:e2e -- tests/smoke/public-pages.spec.js` remains PASS (6/6).
- Active next tasks:
  1. Keep hosted rollout paused until there is an isolated Supabase staging project or an explicit maintenance window for the shared backend; no hosted `supabase db push` while shared.
  2. During an approved window, execute the prepared hosted rollout checklist for `L6-2FA-02` and capture PASS/FAIL evidence from `docs/admin-2fa-validation-checklist.md`.
  3. Keep `L6-ABUSE-02` conditional; roll out anti-bot only when `L6-ABUSE-01` reaches `Activate`.
  4. Review first hosted run evidence from dependency monitoring automation and tune noise thresholds only if needed.

## 5) Progress Tracking Rules
After each chat update:
- `docs/security-continuity-procedure.md` is the reusable workflow contract across projects/chats
- active lesson tracker (`docs/lesson-6-task-tracker.md` for current phase)
- `docs/security-chat-snapshot.md`
- this file (`docs/security-learning-master-plan.md`) when lesson/subpoint changes

## 6) Reference Documents
- `docs/security-continuity-procedure.md`
- `docs/security-chat-index.md`
- `docs/security-chat-snapshot.md`
- `docs/lesson-1-guided-security-review.md`
- `docs/lesson-1-task-tracker.md`
- `docs/lesson-2-guided-security-review.md`
- `docs/lesson-2-task-tracker.md`
- `docs/lesson-2-anti-abuse-runbook.md`
- `docs/lesson-3-guided-security-review.md`
- `docs/lesson-3-task-tracker.md`
- `docs/lesson-4-guided-security-review.md`
- `docs/lesson-4-task-tracker.md`
- `docs/lesson-5-guided-security-review.md`
- `docs/lesson-5-task-tracker.md`
- `docs/production-security-release-checklist.md`
- `docs/lesson-5-live-verification-runbook.md`
- `docs/lesson-6-guided-security-review.md`
- `docs/lesson-6-task-tracker.md`
- `docs/lesson-6-priority-hardening-plan.md`
- `docs/lesson-6-csp-report-only-triage.md`
- `docs/lesson-6-rls-verification-matrix.md`
- `docs/lesson-6-public-form-anti-bot-trigger-matrix.md`
- `docs/animation-interaction-regression-checklist.md`
- `docs/security-observability-baseline.md`
- `docs/security-alerting-runbook.md`
- `docs/dependency-security-audit-cadence.md`
- `docs/dependency-review-checklist.md`
- `docs/admin-2fa-rollout-strategy.md`
- `docs/admin-2fa-validation-checklist.md`
- `docs/admin-session-hardening-policy.md`
- `docs/security-env-secrets-inventory.md`
- `docs/security-playbook-bg.md`
- `docs/security-hardening-log-2026-03-18.md`
- `docs/definition-of-done.md`
- `docs/next-chat-prompt-templates.md`
