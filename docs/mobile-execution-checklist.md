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
5) Product polish and optional expansion features (Settings, Profile QR, then AI tools)

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
- [x] UX hardening: haptics for success/destructive actions.
- [x] UX hardening: dashboard branding cleanup (remove decorative emoji markers and align `StudyHub` heading typography/color with auth/web branding).
- [x] UX hardening: hardware back behavior consistency in CRUD flows.
- [x] UX hardening: accessibility checks (Dynamic Type + VoiceOver/TalkBack).

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

### Completed UX slice (2026-04-09, haptics)
- Added reusable haptics helper with graceful fallback:
- `apps/mobile/lib/haptics.ts`
  - Uses `expo-haptics` if available
  - Falls back to built-in vibration patterns when `expo-haptics` is not installed
- Extended toast API for haptic intent control:
- `apps/mobile/lib/toast-context.tsx`
  - `showToast(message, type?, options?)` with `options.haptic`
  - defaults to success/error/info haptics by toast type
- Wired destructive haptics for destructive success flows:
- `apps/mobile/components/courses-list/use-courses-list.ts`
- `apps/mobile/components/module-workspace/module-workspace.mutations.ts`
- `apps/mobile/app/course/[id]/index.tsx`
- `apps/mobile/app/(tabs)/favorites.tsx`
- `apps/mobile/app/material/[id].tsx`
- Added destructive confirmation haptic tap feedback in:
- `apps/mobile/components/confirm-modal.tsx`
- Kept API contracts, mutation behavior, and query/cache lifecycle behavior unchanged.

### Completed UX slice (2026-04-09, auth branding harmony)
- Added mobile auth branding hero with desktop-aligned visual identity:
- `apps/mobile/components/auth/auth-brand-hero.tsx`
- `apps/mobile/components/auth/auth-brand-hero.styles.ts`
- Added local branding assets for mobile auth screens:
- `apps/mobile/assets/branding/logo.png`
- `apps/mobile/assets/branding/mascot.png`
- Wired branded hero into auth entry screens:
- `apps/mobile/components/login/login-screen.tsx`
- `apps/mobile/components/register/register-screen.tsx`
- Added one-sentence app explanation in login/register headers while keeping existing auth flow unchanged.

### Completed UX slice (2026-04-09, hardware back consistency)
- Added reusable navigation guard for unsaved form state:
- `apps/mobile/lib/use-confirm-discard.ts`
  - Intercepts back navigation via `beforeRemove` (hardware back, header back, gestures)
  - Shows discard confirmation only when a form is dirty
  - Exposes `allowNextLeave()` so successful save can navigate back without extra prompt
- Applied guard to CRUD form flows:
- `apps/mobile/app/create-course.tsx`
- `apps/mobile/app/course/[id]/add-module.tsx`
- `apps/mobile/app/course/[id]/edit.tsx`
- `apps/mobile/app/module/[id]/add-material.tsx`
- `apps/mobile/app/module/[id]/edit.tsx`
- `apps/mobile/app/material/[id]/edit.tsx`
- Kept API contracts and mutation behavior unchanged (only navigation/back UX hardening).

### Completed UX slice (2026-04-09, accessibility hardening)
- Added explicit VoiceOver/TalkBack form labels and hints in CRUD flows:
- `apps/mobile/app/create-course.tsx`
- `apps/mobile/app/course/[id]/add-module.tsx`
- `apps/mobile/app/course/[id]/edit.tsx`
- `apps/mobile/app/module/[id]/add-material.tsx`
- `apps/mobile/app/module/[id]/edit.tsx`
- `apps/mobile/app/material/[id]/edit.tsx`
- Added selected-state semantics for filter/type chips:
- `apps/mobile/components/type-filter-chips.tsx`
- `apps/mobile/app/module/[id]/add-material.tsx`
- `apps/mobile/app/material/[id]/edit.tsx`
- Improved screen-reader navigation hints and Dynamic Type resilience in core CRUD/favorites UI:
- `apps/mobile/app/(tabs)/favorites.tsx`
- `apps/mobile/components/courses-list/course-card.tsx`
- `apps/mobile/components/module-list-card.tsx`
- `apps/mobile/components/material-card.tsx`
- `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
- `apps/mobile/components/courses-list/courses-list-screen.tsx`
- `apps/mobile/components/search-bar.tsx`
- `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
- `apps/mobile/app/material/[id].tsx`
- Kept Phase 1 stabilization intact:
  - React Query lifecycle behavior unchanged
  - Query-managed `cache: false` reads unchanged
  - Timeout/retry tuning unchanged
  - Existing API contracts and mutation behavior unchanged

### Completed UX slice (2026-04-09, dashboard branding cleanup)
- Completed mobile dashboard (Courses tab) branding harmony with auth/web brand language:
- `apps/mobile/components/courses-list/courses-list-screen.tsx`
  - Header keeps the mascot with signature `StudyHub` typography (desktop-style icon removed from mobile dashboard).
  - Replaced emoji-based empty courses state with a branded no-courses card (mascot + signature `StudyHub` heading).
- `apps/mobile/components/courses-list/courses-list.styles.ts`
  - Added dedicated dashboard branding styles for header visuals and no-courses card.
- Removed decorative emoji marker usage from dashboard empty-state rendering path while preserving existing CRUD behavior.

### Acceptance Criteria
- [x] High-traffic files are under 300 lines and major functions stay under 60 lines.
- [x] Core CRUD/favorites flows are stable with improved perceived UX.

## Phase 3 - Quality Gates and Optional Features

### Tasks
- [ ] Quality gates: mobile e2e smoke (auth + core CRUD + offline/online recovery).
- [ ] Quality gates: crash/error telemetry integration (Sentry or equivalent).
- [ ] Release checklist for mobile handoff and smoke verification.
- [ ] Product polish: Settings screen in Profile flow (not extra bottom tab), with initial scope theme mode (system/light/dark), haptics toggle, app version/about links, and account actions entry points.
- [ ] Optional feature: Profile QR handoff card in web profile (deep-link to mobile app) for future social direction.
- [ ] DEFERRED optional feature: Mobile AI tools entry points (summarize/quiz/chat or read-only outputs), after Phases 1-2 pass.

### Acceptance Criteria
- [ ] Key mobile flows pass smoke suite without regressions.
- [ ] Settings screen exists in mobile profile flow with persisted basic app preferences.
- [ ] README + dev-log are synced with the final mobile standard.

## Next Recommended Task

- Start Phase 3 quality gates: mobile smoke verification for auth + core CRUD + offline/online recovery, then telemetry integration.
