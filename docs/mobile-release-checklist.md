# Mobile Release Checklist (Phase 3 Handoff)

Last updated: 2026-04-16  
Owner: Mobile stream  
Scope: Expo mobile release-readiness signoff for StudyHub v2

## Purpose

Use this checklist to confirm mobile quality gates before release/handoff.
This checklist is grounded in:
- `docs/mobile-smoke-test-matrix.md`
- `docs/mobile-execution-checklist.md`
- `docs/mobile-phone-testing-handoff.md`

## Current Gate Summary (2026-04-16)

- Smoke matrix: `SMK-01` through `SMK-20` = `PASS`
- Accessibility sanity (`SMK-20`) = `PASS`
- Messaging push verification rows: `SMK-21` through `SMK-23` = `BLOCKED` (requires physical-device run with two accounts)
- Telemetry: Sentry integrated and validated with manual event (`SENTRY_TEST_EVENT`)
- Result: `CONDITIONAL GO for core handoff` (full push-delivery signoff pending)

## Release Readiness Checklist

## 1) Environment and Startup

- [x] Backend starts and responds on `http://localhost:3000`
- [x] Mobile Metro starts via LAN script (`npm --workspace @studyhub/mobile run dev:mobile:lan`)
- [x] `EXPO_PUBLIC_API_URL` points to active backend host/IP for the test environment
- [x] No stale process conflict on ports (`3000`, `8081`)

## 2) Auth and Session Stability

- [x] Login works (`SMK-01`)
- [x] Logout works (`SMK-02`)
- [x] Register flow works (`SMK-03`)
- [x] Session persists after app restart (`SMK-04`)

## 3) Core Product Flows

- [x] Courses CRUD stable (`SMK-05`..`SMK-07`)
- [x] Modules CRUD stable (`SMK-08`..`SMK-10`)
- [x] Materials CRUD stable (`SMK-11`..`SMK-13`)
- [x] Favorites parity stable (`SMK-14`..`SMK-16`)

## 4) Lifecycle and Recovery

- [x] Offline/online recovery works (`SMK-17`)
- [x] AppState background/foreground recovery works (`SMK-18`)
- [x] Dirty-form back confirmation works (`SMK-19`)

## 5) Telemetry and Observability

- [x] Sentry SDK initialized in mobile app bootstrap
- [x] Sentry user context synced via auth lifecycle
- [x] API server/unknown failures reported to Sentry
- [x] Manual telemetry validation passed (`SENTRY_TEST_EVENT` visible in Sentry Issues)
- [x] Temporary test trigger removed after validation

## 6) Documentation and Handoff Completeness

- [x] Mobile execution checklist synced
- [x] Mobile smoke matrix synced
- [x] Dev log synced with release/handoff updates
- [x] Mobile phone testing handoff doc available for setup/recovery

## 7) Known Blockers / Risks

- [ ] Push delivery validation for messages is pending on physical devices:
  - `SMK-21`: foreground incoming message path
  - `SMK-22`: background notification + tap deep-link
  - `SMK-23`: killed-app cold-start + tap deep-link

## 8) Go / No-Go Rule

- `GO` (core handoff) when sections 1 through 6 are complete and only non-regression device-only validations remain.
- `FULL GO` when section 7 has no unresolved blockers and `SMK-21`..`SMK-23` are verified on physical devices.
- `NO-GO` if any smoke row regresses to `FAIL`.

## Signoff

- Checklist owner signoff: `Complete`
- Date: `2026-04-16`
- Release status: `Core handoff-ready; awaiting final device push verification for SMK-21..SMK-23`
