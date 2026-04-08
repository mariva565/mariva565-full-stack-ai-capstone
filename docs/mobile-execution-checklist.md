# Mobile Execution Checklist (Sprint 1 -> Sprint 2)

Last updated: 2026-04-08
Owner: Mobile stream

## Sprint 1 - Desktop Parity (5 working days)

### Tasks
- [x] Favorites on mobile: pin/unpin + favorites list + quick access from tabs.
- [ ] Progress/Milestones on mobile: list + create + status update (MVP parity).
- [ ] Calendar on mobile: list + create/edit/delete event (MVP parity).
- [ ] Material AI section on mobile: show AI outputs + trigger summarize/quiz.
- [ ] React Query keys for all new domains (`favorites`, `milestones`, `events`, `aiOutputs`) + invalidate rules.

### Acceptance Criteria
- [x] Favorites actions update UI immediately (optimistic update + invalidate on settle).
- [x] No manual `useEffect` fetch in new Favorites flow (React Query only).
- [x] `npm.cmd run --workspace @studyhub/mobile typecheck` passes.
- [x] `docs/dev-log.md` updated with implementation details.
- [ ] Sprint 1 complete only when all Sprint 1 tasks above are done.

## Sprint 2 - Mobile Production Standards (5 working days)

### Tasks
- [ ] React Native lifecycle integration: `focusManager` + `onlineManager` (`AppState` + `NetInfo`).
- [ ] Final cache policy between React Query cache and `apiFetch` cache (avoid double stale behavior).
- [ ] Split large mobile files into hooks/UI subcomponents per guardrails.
- [ ] UX hardening: skeleton loading states, offline states, haptics for critical actions, back-navigation consistency.
- [ ] Quality gates: mobile e2e smoke (auth + core CRUD), crash/error telemetry, release checklist.

### Acceptance Criteria
- [ ] Foreground/background + offline/online scenarios are stable.
- [ ] Key mobile flows pass smoke tests with no regressions.
- [ ] `README.md` + `docs/dev-log.md` reflect the updated mobile production standard.

## Next Recommended Task

- Continue with Sprint 1 / Task 2: Progress + Milestones mobile MVP.
