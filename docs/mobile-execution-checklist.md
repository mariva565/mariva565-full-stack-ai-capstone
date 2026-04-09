# Mobile Execution Checklist (Quality-First)

Last updated: 2026-04-09
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

## Phase 1 - Stabilization First (completed)

### Tasks
- [x] React Native lifecycle integration: `focusManager` + `onlineManager` (`AppState` + `NetInfo`) implemented in code.
- [x] Lifecycle integration manual verification on physical device (foreground/background + offline/online transitions).
- [x] Final cache policy between React Query cache and `apiFetch` cache (avoid double stale behavior).
- [x] Document cache policy in `README.md` and enforce consistently on query-managed paths.
- [x] Keep Favorites parity working (pin/unpin + list + quick navigation) while hardening lifecycle/cache behavior.

### Acceptance Criteria
- [x] Foreground/background + offline/online transitions produce expected refetch behavior.
- [x] No duplicated stale behavior between React Query persistence and API cache.
- [x] `npm.cmd run --workspace @studyhub/mobile typecheck` passes after each slice.

### Physical-device verification still required (Phase 1)
- [x] AppState scenario: background app for 30-60s, return foreground, confirm React Query refetches key screens (Courses, Course Details, Module Workspace, Material, Favorites, Profile).
- [x] NetInfo scenario: disable network while screen is open, re-enable network, confirm reconnect-driven refetch and no stale lock from API cache.
- [x] Combined scenario: go offline -> background app -> foreground still offline -> go online, confirm recovery behavior remains consistent.

## Phase 2 - Guardrails and UX Hardening

### Tasks
- [x] Split large mobile files into hooks/UI subcomponents per guardrails:
- [x] `apps/mobile/app/module/[id]/index.tsx`
- [x] `apps/mobile/app/(tabs)/index.tsx`
- [x] `apps/mobile/app/(tabs)/profile.tsx`
- [x] `apps/mobile/app/login.tsx`
- [x] `apps/mobile/app/register.tsx`
- [x] UX hardening: skeleton loading states on key screens.
- [x] UX hardening: explicit offline/empty/error states.
- [ ] UX hardening: haptics for success/destructive actions.
- [ ] UX hardening: hardware back behavior consistency in CRUD flows.
- [ ] UX hardening: accessibility checks (Dynamic Type + VoiceOver/TalkBack).

### Completed UX slice (2026-04-09)
- Added reusable animated skeleton primitives in `apps/mobile/components/skeleton/skeleton-block.tsx`.
- Wired skeleton loading states into key mobile screens:
- `apps/mobile/app/(tabs)/index.tsx` (via `components/courses-list/*`)
- `apps/mobile/app/module/[id]/index.tsx` (via `components/module-workspace/*`)
- `apps/mobile/app/material/[id].tsx`
- `apps/mobile/app/(tabs)/favorites.tsx`
- `apps/mobile/app/(tabs)/profile.tsx` (via `components/profile-tab/*`)
- Preserved Phase 1 behavior: React Query lifecycle wiring, query-managed reads using `cache: false`, timeout/retry tuning, and Expo startup script workaround remained unchanged.

### Completed UX slice (2026-04-09, later session)
- Added reusable request-state primitives:
- `apps/mobile/components/request-state.tsx`
- `apps/mobile/components/network-banner.tsx`
- `apps/mobile/lib/network.ts` (`useIsOffline` + offline state helper)
- Wired explicit offline/error/empty handling across key screens:
- `apps/mobile/components/courses-list/courses-list-screen.tsx`
- `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
- `apps/mobile/app/material/[id].tsx`
- `apps/mobile/app/(tabs)/favorites.tsx`
- `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
- Added offline banner wrappers in related style files:
- `apps/mobile/components/favorites/favorites.styles.ts`
- `apps/mobile/components/material/material-screen.styles.ts`
- `apps/mobile/components/module-workspace/module-workspace.styles.ts`
- `apps/mobile/components/profile-tab/profile-tab.styles.ts`
- Preserved Phase 1 behavior (React Query lifecycle + query-managed `cache: false` reads + existing mutation contracts).

### Acceptance Criteria
- [x] High-traffic files are under 300 lines and major functions stay under 60 lines.
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

- Continue Phase 2 UX hardening with haptics for success/destructive actions.
