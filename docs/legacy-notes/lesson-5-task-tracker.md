# Lesson 5 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L5-HDR-01` | deploy headers readiness | `done` | Added `src/utils/deploySecurityHeaders.test.js` to enforce the required Netlify/Vercel security header baseline and provider parity as automated release-blocker coverage. |

## P1 (High)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L5-REL-01` | production checklist | `done` | Added `docs/production-security-release-checklist.md` and linked it into the release-quality bar via `docs/definition-of-done.md`, `docs/security-playbook-bg.md`, and the Lesson 5 handoff docs. |
| `L5-SEC-01` | secrets/env readiness | `done` | Added `docs/security-env-secrets-inventory.md`, refreshed `SECURITY.md` and `README.md` env guidance, and added `src/utils/runtimeEnvContract.test.js` to block unexpected frontend env usage or server-only secret identifiers. |
| `L5-LIVE-01` | live verification flow | `done` | Added `docs/lesson-5-live-verification-runbook.md` with repo-documented live domains, release-gate smoke order, evidence capture, and provider-specific rollback guidance for Netlify/Vercel incidents. |

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Use the Lesson 5 release checklist/runbook on the next real release candidate.

## Validation status (latest known)
- `npm.cmd run test` -> PASS (2026-03-19)
- `npm.cmd run build` -> PASS (2026-03-19)
- `npm.cmd run test:e2e` -> PASS (2026-03-19)
