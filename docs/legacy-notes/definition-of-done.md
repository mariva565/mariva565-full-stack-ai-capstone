# Definition of Done (Team Baseline)

## 1) Purpose
This file defines the minimum quality bar for every feature, fix, and refactor.
If any required gate below fails, the task is **not done**.

## 2) Core Rule
- "Works on my machine" is not enough.
- A task is done only when functional, responsive, theme-safe, and security-safe.

## 3) Mandatory Gates (All Tasks)
- Acceptance criteria are fully implemented.
- No blocking console/runtime errors in the affected flow.
- Relevant tests pass (`unit`, `smoke`, or `manual smoke` depending on scope).
- Related docs/checklists are updated when behavior changes.

## 4) Responsive + Theme Gates (Non-Negotiable)
- Critical flow works on mobile and desktop.
- Critical flow works in light and dark mode.
- No hidden/overlapping controls in required viewports.
- Readability/contrast is acceptable in both themes.

## 5) Security Gates (Non-Negotiable)
- User input is validated and safely rendered (escape/sanitize where needed).
- Only safe link protocols are allowed for user-facing URLs.
- Auth/authz is enforced for protected actions.
- Client code uses only explicitly approved public runtime env vars.
- No secrets in source code or logs.
- Error messages do not leak internal sensitive details.
- Required deploy security headers remain active.
- Dependency risk is reviewed according to `docs/dependency-security-audit-cadence.md` when dependencies change or when preparing a release candidate.

## 6) Code Quality Gates
- No new "god module" or oversized function without split/justification.
- API/transport calls are not mixed into pure renderer/presentation helpers.
- Naming and structure follow the project conventions.
- Dead code and debug leftovers are removed.

## 7) Testing Gates
- Small change: targeted validation + manual smoke.
- Medium/large change: automated test updates plus manual smoke.
- Auth/security change: explicit auth/security smoke check is required.

## 8) Documentation Gates
- If UX/flow changes, update the relevant docs.
- If security behavior changes, update:
  - `docs/security-playbook-bg.md`
  - `docs/security-hardening-log-2026-03-18.md`
  - this DoD file if the quality bar changed
- Preview/live release candidates must complete `docs/production-security-release-checklist.md`.

## 9) Release Blockers
Release is blocked if any of the following is true:
- registration/login critical path is broken in any live environment
- major flow fails on mobile or desktop
- major flow fails in light or dark mode
- critical security gate fails
- blocker-level dependency advisory exists without an approved exception
- required production security checklist evidence is missing for the release candidate
- known high-severity regression exists without approved exception

## 10) Quick PR Checklist
- [ ] Acceptance criteria complete
- [ ] Mobile + desktop checked
- [ ] Light + dark checked
- [ ] Security gates checked
- [ ] Tests/smoke passed
- [ ] Docs updated
