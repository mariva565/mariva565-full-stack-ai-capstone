# Security Chat Index (Handoff Guide)

## Why this file
This is the starting index for a new chat when the topic is large and we need fast continuity.

## Recommended reading order (2-5 minutes)
1. `docs/security-continuity-procedure.md`
   Reusable process: what to update, when, and mandatory handoff contract.
2. `docs/security-learning-master-plan.md`
   Big-picture learning roadmap + current lesson/subpoint marker.
3. `docs/security-chat-snapshot.md`
   Current status: what is done and what is next.
4. `docs/lesson-6-guided-security-review.md`
   Active lesson scope for operational security maturity.
5. `docs/lesson-6-task-tracker.md`
   Current task progress by ID (`L6-*`).
6. `docs/security-observability-baseline.md`
   Current centralized observability baseline, event taxonomy, and target sink model.
7. `docs/security-alerting-runbook.md`
   Current alert thresholds, owner routing, and first-response actions for the highest-signal security events.
8. `docs/dependency-security-audit-cadence.md`
   Current dependency review schedule, severity policy, and release-blocker rules.
9. `docs/dependency-review-checklist.md`
   Short recurring checklist and `deps:*` script entry points for monthly/release dependency review.
10. `docs/admin-2fa-rollout-strategy.md`
   Current admin-only 2FA strategy, `role + aal2` enforcement model, recovery expectations, and implementation phases.
11. `docs/admin-2fa-validation-checklist.md`
   Repo-complete vs hosted rollout steps for `L6-2FA-02`, including manual validation order.
12. `docs/security-playbook-bg.md`
   Core security principles and baseline.
13. `docs/production-security-release-checklist.md`
   Release blocker checklist for preview/live signoff.
14. `docs/lesson-5-live-verification-runbook.md`
   Step-by-step Netlify/Vercel live verification and rollback flow.
15. `docs/security-env-secrets-inventory.md`
   Current ownership map for frontend env vars and server-only secrets.
16. `docs/lesson-5-guided-security-review.md`
   Completed production-readiness context from the previous lesson.
17. `docs/security-hardening-log-2026-03-18.md`
   What has already been implemented in code.
18. `docs/definition-of-done.md`
   Quality, release, and security gates.

## What to provide at the start of a new chat
- Reference this file: `docs/security-chat-index.md`
- Choose chat mode:
  - `implement` (code changes)
  - `review` (analysis only)
  - `tests/docs` (validation and docs updates)
- Pick 1-3 task IDs from active tracker (currently `docs/lesson-6-task-tracker.md`)
  Example: `centralized security logging`, `dependency maintenance`, `admin 2FA implementation`

## Small-step rule
- One chat = 1-2 scoped tasks.
- After each chat: update
  - active lesson tracker (`docs/lesson-6-task-tracker.md` at current phase)
  - `docs/security-chat-snapshot.md`
  - `docs/security-learning-master-plan.md` only when lesson/subpoint changes
