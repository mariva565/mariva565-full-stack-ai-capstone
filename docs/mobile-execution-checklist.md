# Mobile Execution Checklist (Quality-First)

Last updated: 2026-04-08
Owner: Mobile stream

## Scope Decisions (2026-04-08)

- [x] DE-SCOPED: Progress/Milestones mobile MVP (internal work-notes pages; not core end-user mobile value).
- [x] DE-SCOPED: Calendar mobile MVP (internal work-notes usage; low product ROI for mobile scope).
- [x] DE-SCOPED: Mobile Admin Panel (web-first scope decision; only implement if explicitly requested).
- [x] DEFERRED: Mobile AI tools/chat (move after core mobile quality baseline is stable).
- [x] DE-SCOPED: Admin QR entry point (no product need for this capstone scope).

## Priority Order (after mobile standards reassessment)

1) Stability and data correctness
2) Code quality and maintainability guardrails
3) Mobile UX standards hardening
4) Quality gates and release readiness
5) Optional expansion features (Profile QR, then AI tools)

## Phase 1 - Stabilization First (active)

### Tasks
- [ ] React Native lifecycle integration: `focusManager` + `onlineManager` (`AppState` + `NetInfo`).
- [ ] Final cache policy between React Query cache and `apiFetch` cache (avoid double stale behavior).
- [ ] Document cache policy in `README.md` and enforce consistently on query-managed paths.
- [ ] Keep Favorites parity working (pin/unpin + list + quick navigation) while hardening lifecycle/cache behavior.

### Acceptance Criteria
- [ ] Foreground/background + offline/online transitions produce expected refetch behavior.
- [ ] No duplicated stale behavior between React Query persistence and API cache.
- [ ] `npm.cmd run --workspace @studyhub/mobile typecheck` passes after each slice.

## Phase 2 - Guardrails and UX Hardening

### Tasks
- [ ] Split large mobile files into hooks/UI subcomponents per guardrails:
- [ ] `apps/mobile/app/module/[id]/index.tsx`
- [ ] `apps/mobile/app/(tabs)/index.tsx`
- [ ] `apps/mobile/app/(tabs)/profile.tsx`
- [ ] `apps/mobile/app/login.tsx`
- [ ] `apps/mobile/app/register.tsx`
- [ ] UX hardening: skeleton loading states on key screens.
- [ ] UX hardening: explicit offline/empty/error states.
- [ ] UX hardening: haptics for success/destructive actions.
- [ ] UX hardening: hardware back behavior consistency in CRUD flows.
- [ ] UX hardening: accessibility checks (Dynamic Type + VoiceOver/TalkBack).

### Acceptance Criteria
- [ ] High-traffic files are under 300 lines and major functions stay under 60 lines.
- [ ] Core CRUD/favorites flows are stable with improved perceived UX.

## Phase 3 - Quality Gates and Optional Features

### Tasks
- [ ] Quality gates: mobile e2e smoke (auth + core CRUD + offline/online recovery).
- [ ] Quality gates: crash/error telemetry integration (Sentry or equivalent).
- [ ] Release checklist for mobile handoff and smoke verification.
- [ ] Optional feature: Profile QR handoff card in web profile (deep-link to mobile app) for future social direction.
- [ ] DEFERRED optional feature: Mobile AI tools entry points (summarize/quiz/chat or read-only outputs), after Phases 1-2 pass.

### Acceptance Criteria
- [ ] Key mobile flows pass smoke suite without regressions.
- [ ] README + dev-log are synced with the final mobile standard.

## Next Recommended Task

- Start with Phase 1 / lifecycle integration (`focusManager` + `onlineManager`) and cache policy hardening.
