# Dependency Security Audit Cadence (`L6-DEP-01`)

Last updated: 2026-03-19

## 1) Purpose
This document defines the recurring dependency review flow for StudyHub.

Goals:
- keep runtime and toolchain dependencies reviewed on a predictable schedule,
- make vulnerability handling consistent instead of ad hoc,
- turn high-risk dependency findings into explicit release decisions.

## 2) Current Dependency Baseline
Source of truth:
- `package.json`
- `package-lock.json`

Current runtime dependencies:
- `@popperjs/core`
- `@supabase/supabase-js`
- `bootstrap`
- `three`

Current dev/tooling dependencies:
- `@playwright/test`
- `jsdom`
- `vite`
- `vitest`

Lockfile rule:
- every dependency change must include the matching `package-lock.json` update,
- do not merge hand-edited lockfile changes without a package-manager-generated diff.

## 3) Required Command Set
Use `npm.cmd` in this Windows repo.

Script shortcuts available in `package.json`:
- `npm.cmd run deps:inventory`
- `npm.cmd run deps:outdated`
- `npm.cmd run deps:audit`
- `npm.cmd run deps:audit:runtime`
- `npm.cmd run deps:review:local`
- `npm.cmd run deps:review:release`
- `npm.cmd run deps:review:full`

Automation references (`L6-DEP-03`):
- `.github/dependabot.yml` (weekly dependency update monitoring for `npm` + `github-actions`)
- `.github/workflows/dependency-security-monitoring.yml` (weekly runtime review + monthly/manual full review evidence)

Inventory and drift review:
- `npm.cmd ls --depth=0`
- `npm.cmd outdated`

Security review:
- `npm.cmd audit --audit-level=moderate`
- `npm.cmd audit --omit=dev --audit-level=high`

Validation after updates:
- `npm.cmd run test`
- `npm.cmd run build`
- `npm.cmd run test:e2e`

Operational note:
- `npm audit` requires network access. If local audit is blocked by environment or sandbox limits, run it in an approved connected session or CI and record that evidence in the release notes/checklist.
- Quick execution checklist:
  - `docs/dependency-review-checklist.md`

## 4) Cadence
### Monthly maintenance review
Run once per month even if no release is planned.

Minimum steps:
1. Review direct dependency inventory with `npm.cmd ls --depth=0`.
2. Check version drift with `npm.cmd outdated`.
3. Run the two audit commands from section 3.
4. Classify findings by severity and dependency type.
5. Record owner and due date for anything not fixed immediately.

### Release-candidate review
Run for every preview/live release candidate that is meant to be shared outside local development.

Minimum steps:
1. Run `npm.cmd outdated`.
2. Run `npm.cmd audit --omit=dev --audit-level=high`.
3. If dependency changes are included in the candidate, also run `npm.cmd audit --audit-level=moderate`.
4. Apply required patches or record an explicit approved exception before signoff.
5. Run `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e` after dependency updates on the release candidate commit.

### Event-driven review
Run outside the normal schedule when:
- a dependency is upgraded,
- a security advisory affects one of the direct dependencies,
- CI/build/runtime starts failing after a transitive resolution change,
- a hosting/provider change requires toolchain updates.

## 5) Severity And Release Policy
`Critical`:
- Runtime dependency advisory: release blocker until patched, removed, or explicitly rolled back.
- Dev/toolchain advisory: release blocker if it affects build output integrity, deploy tooling, CI secrets exposure, or developer workstation trust assumptions.

`High`:
- Runtime dependency advisory: release blocker unless there is a documented approved exception with owner, scope, compensating control, and target fix date.
- Dev/toolchain advisory: not automatically a release blocker if it is isolated to local test tooling with no production path, but it must have an owner and target fix date within the next maintenance cycle.

`Moderate`:
- Not a default release blocker.
- Must be reviewed and either patched during the maintenance window or documented with rationale and due date.

`Low`:
- Track during scheduled maintenance; do not block release by default.

Dependency type rule:
- Runtime dependencies get stricter treatment than dev-only dependencies because they ship into the app or directly affect production behavior.

## 6) Patch Strategy
Preferred order:
1. Patch update
2. Minor update
3. Major update only in a scoped change with targeted validation

Rules:
- Avoid batching unrelated major upgrades into the same release candidate.
- If a dependency update changes build/runtime behavior, update docs and smoke expectations in the same change.
- If `npm audit fix` is used, review the resulting `package-lock.json` diff instead of trusting bulk changes blindly.

## 7) Ownership
Primary owner:
- current security hardening stream / lesson owner for cadence enforcement

Update owner:
- feature owner or release owner touching the dependency change

Reviewer:
- release reviewer completing `docs/production-security-release-checklist.md`

Escalation:
- if a blocker-level advisory cannot be patched safely before release, engineering/reviewer signoff must record:
  - affected package,
  - severity,
  - runtime vs dev-only scope,
  - compensating control,
  - rollback path,
  - target fix date.

## 8) Evidence To Keep
Keep lightweight evidence with the release candidate or maintenance note:
- date
- branch / commit
- commands run
- blocker findings (if any)
- approved exceptions (if any)
- validation result after dependency updates

Recommended storage locations:
- `docs/production-security-release-checklist.md` for release candidates
- `docs/security-chat-snapshot.md` for lesson-level maintenance handoff notes

## 9) Release Blocker Summary
Release is blocked when any of the following is true:
- a `critical` runtime dependency advisory is unresolved,
- a `high` runtime dependency advisory is unresolved and has no approved exception,
- a dev/toolchain advisory can affect build integrity, deploy security, or secret exposure and remains unresolved,
- dependency updates were applied but the required validation commands did not pass.

## 10) Next Step Handoff
What `L6-DEP-01` completes:
- one documented dependency review schedule,
- one command set for inventory/audit checks,
- one severity policy tied to release decisions.

What remains for `L6-DEP-02`:
- completed via `package.json` dependency-review scripts and `docs/dependency-review-checklist.md`.
