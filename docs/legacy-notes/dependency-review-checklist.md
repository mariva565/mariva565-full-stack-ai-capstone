# Dependency Review Checklist (`L6-DEP-02`)

Last updated: 2026-03-19

## 1) Purpose
This is the short repeatable dependency-maintenance checklist for StudyHub.

Use it when you want the practical steps without re-reading the full policy in `docs/dependency-security-audit-cadence.md`.

## 2) Script Shortcuts
Use `npm.cmd` in this repo.

- `npm.cmd run deps:inventory`
- `npm.cmd run deps:outdated`
- `npm.cmd run deps:audit:runtime`
- `npm.cmd run deps:audit`
- `npm.cmd run deps:review:local`
- `npm.cmd run deps:review:release`
- `npm.cmd run deps:review:full`

Notes:
- `deps:review:local` is safe for offline/local inventory only.
- `deps:outdated` and `deps:audit*` require network access or a connected CI environment.
- Automated companion signal exists via `.github/dependabot.yml` and `.github/workflows/dependency-security-monitoring.yml`; keep this checklist as the manual/release baseline.

## 3) Monthly Checklist
- [ ] Run `npm.cmd run deps:review:full` in a connected environment.
- [ ] Review direct dependencies and unexpected version drift.
- [ ] Classify findings by `runtime` vs `dev/tooling`.
- [ ] Patch blockers immediately or record owner + due date.
- [ ] If packages were updated, run `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e`.

## 4) Release-Candidate Checklist
- [ ] Run `npm.cmd run deps:review:release` in a connected environment.
- [ ] Confirm no unapproved `high`/`critical` runtime advisory remains.
- [ ] Record any approved exception in the release evidence.
- [ ] If dependency updates are included, run the full validation set on the release candidate commit.
- [ ] Update `docs/production-security-release-checklist.md`.

## 5) Evidence To Keep
- [ ] Date
- [ ] Branch / commit
- [ ] Commands run
- [ ] Findings / exceptions
- [ ] Validation result after dependency updates

## 6) Policy Reference
For severity rules, release blockers, and ownership:
- `docs/dependency-security-audit-cadence.md`
