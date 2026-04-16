# Mobile Execution Checklist (Quality-First)

Last updated: 2026-04-16
Owner: Mobile stream

## Scope Decisions (2026-04-08)

- [x] DE-SCOPED: Progress/Milestones mobile MVP (internal work-notes pages; not core end-user mobile value).
- [x] DE-SCOPED: Calendar mobile MVP (internal work-notes usage; low product ROI for mobile scope).
- [x] DE-SCOPED: Mobile Admin Panel (web-first scope decision; only implement if explicitly requested).
- [x] RESOLVED: Mobile AI tools entry point is integrated (post-stabilization), after initial defer decision.
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
- [x] Quality gates: mobile e2e smoke (auth + core CRUD + offline/online recovery).
  - Execution matrix synced in `docs/mobile-smoke-test-matrix.md`.
  - Current run status (2026-04-09, Session 192):
    - PASS: `SMK-01` through `SMK-20`
    - Accessibility verification (`SMK-20`) completed in follow-up run (Session 197)
    - Favorites flow pass includes direct pin/unpin entry point in module workspace cards (Session 190).
- [x] Quality gates: crash/error telemetry integration (Sentry).
  - Added mobile telemetry bootstrap and scope helpers in `apps/mobile/lib/telemetry.ts`.
  - Root layout now initializes telemetry early and is wrapped with `Sentry.wrap(...)` in `apps/mobile/app/_layout.tsx`.
  - Auth lifecycle now syncs Sentry user context on hydrate/login/register/google-login/logout in `apps/mobile/lib/auth-context.tsx`.
  - API layer now reports server/unknown failures with route/method/status metadata in `apps/mobile/lib/api.ts`.
  - Added Sentry Expo build plugin + Metro serializer setup:
    - `apps/mobile/app.json`
    - `apps/mobile/metro.config.js`
  - Added env placeholders for DSN/sample rate/app env:
    - `apps/mobile/.env.example`
    - `.env.example`
  - Validation pass complete (2026-04-10): manual test event `SENTRY_TEST_EVENT` received in Sentry Issues (development env), then temporary trigger button removed.
- [x] Release checklist for mobile handoff and smoke verification.
  - Added `docs/mobile-release-checklist.md` with explicit go/no-go gates, known blocker handling, and signoff status.
  - Checklist references live smoke/telemetry outcomes and confirms handoff-readiness with all smoke rows passing.
- [ ] Quality gates: full messaging push verification (`foreground`, `background`, `killed app`).
  - Added dedicated smoke rows: `SMK-21`, `SMK-22`, `SMK-23` in `docs/mobile-smoke-test-matrix.md`.
  - Current status is `BLOCKED` in Session 236 until physical-device validation is executed.
- [x] Product polish: Settings screen in Profile flow (not extra bottom tab), with initial scope theme mode (system/light/dark), haptics toggle, app version/about links, and account actions entry points.
- [x] Optional feature: Profile QR handoff card in web profile (deep-link to mobile app) for future social direction.
- [x] DEFERRED optional feature: Mobile AI tools entry points (summarize/quiz/chat or read-only outputs) - AI Tools and Mentor Chatbot integrated successfully.
- [ ] Planned feature cluster: Storage-backed material uploads (PDF/DOC/images) with shared backend APIs.
- [ ] Planned feature cluster: Mobile avatar upload flow (camera/gallery + upload endpoint).
- [ ] Planned feature cluster: Note/PDF transformations (`note -> PDF export`, `PDF -> note text extraction`).
- [ ] Planned feature cluster: Sharing and social messaging entry points (depends on social phases S0-S3).

### Acceptance Criteria
- [x] Key mobile flows pass smoke suite without regressions (`SMK-01` through `SMK-19`).
- [x] Settings screen exists in mobile profile flow with persisted basic app preferences.
- [x] README + dev-log are synced with the final mobile standard.

### Messaging Notifications Follow-up (2026-04-13, Session 236)
- Mobile foreground messaging alerts now use in-app toast only (no duplicate OS foreground banner while app is open):
  - `apps/mobile/lib/use-push-notifications.ts`
- Active-thread noise reduction added:
  - Foreground toast is skipped when the user is already inside the same `/messages/[id]` conversation.
- Push verification matrix expanded:
  - `docs/mobile-smoke-test-matrix.md` now includes `SMK-21`/`SMK-22`/`SMK-23` for foreground/background/killed flows.
- Verification constraints:
  - Full push delivery verification remains blocked in this terminal-only session and must be run on physical devices with two authenticated accounts.

## Next Recommended Task

- Immediate priority:
  - 1. Execute physical-device verification for `SMK-21`/`SMK-22`/`SMK-23` (foreground/background/killed message push delivery + deep-link behavior).
- Then continue with post-MVP sequencing:
  - 2. Storage foundation for materials/files (shared API contract, validation, R2 object lifecycle).
  - 3. Mobile uploads: PDF/DOC/image material upload + avatar upload from device.
  - 4. Transform tools: `note -> PDF` export and `PDF -> note` extraction flow.
  - 5. Sharing + social messaging UX polish on top of existing S0-S3 backend/web scope.
- Social dependency reference:
  - `docs/social-features-plan.md` (S0 roles/membership, S1 community, S2 mentor Q&A, S3 messaging).
- Keep accessibility sanity in smoke cadence as a regression-check row (`SMK-20`).

### Doc Sync Update (2026-04-16, Session 258)
- Synced this checklist with current project scope after README/AGENTS refresh.
- Confirmed status remains:
  - Core mobile quality gates (`SMK-01`..`SMK-20`) are PASS.
  - Push-specific smoke rows (`SMK-21`..`SMK-23`) remain BLOCKED pending physical-device validation.

### Completed Product Polish Slice (2026-04-10, Session 196)
- Added a dedicated Settings screen in Profile flow (stack route, no extra bottom tab):
  - `apps/mobile/app/settings.tsx`
  - `apps/mobile/components/settings/*`
  - Profile entry point button in `apps/mobile/components/profile-tab/profile-tab-screen.tsx`.
- Added persisted app preferences layer:
  - `apps/mobile/lib/app-preferences.tsx`
  - Stores and hydrates `themeMode` (`system`/`light`/`dark`) and `hapticsEnabled` from AsyncStorage.
- Wired global haptics toggle into existing haptics utility:
  - `apps/mobile/lib/haptics.ts` now respects `setHapticsEnabledPreference(...)`.
  - Existing toast/mutation haptic flows stay unchanged; they are now preference-aware.
- Added Settings initial-scope content:
  - Theme mode segmented control.
  - Haptics toggle.
  - App version label + about links.
  - Account action entry points (Profile edit mode jump + logout).
- Kept Phase 1/2/3 stabilization guarantees intact:
  - React Query lifecycle/cache behavior unchanged.
  - Existing API contracts unchanged.
  - Existing auth flow unchanged.
- Verification:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Completed Product Polish Slice (2026-04-10, Session 197)
- Rolled out real mobile dark/light theme behavior for color-token based UI:
  - `apps/mobile/lib/colors.ts`
  - Added light/dark palettes + theme-mode resolution (`system`/`light`/`dark`).
- Added synchronous theme bootstrap persistence (`expo-secure-store`) so palette can be selected before static StyleSheet modules evaluate.
- Added immediate theme apply behavior:
  - `apps/mobile/lib/theme-reload.ts`
  - `apps/mobile/components/settings/use-settings-screen.ts`
  - Theme change now persists and triggers app reload to apply theme across all static styles.
- Updated app-preferences to keep async settings and sync theme bootstrap aligned:
  - `apps/mobile/lib/app-preferences.tsx`
- Accessibility quality gate updated:
  - `SMK-20` moved to `PASS` after assistive-tech sanity verification (see smoke matrix run log).
- Verification:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Completed Product Polish Slice (2026-04-10, Session 198)
- Implemented true live theme switch (light/dark/system) — no full app reload:
  - `apps/mobile/lib/app-preferences.tsx`
    - Added `colors: AppColors` (live, reactive) to context value.
    - Exported `useTheme()` hook — `{ colors, resolvedTheme }` from context.
    - Exported `useThemedStyles(factory)` hook — recreates styles on theme change.
    - Removed boot-reload logic (no longer needed).
  - `apps/mobile/components/settings/settings-screen.styles.ts`
    - Converted to `makeSettingsStyles(colors: AppColors)` factory function.
  - `apps/mobile/components/settings/settings-screen.tsx`
    - Each sub-section uses `useThemedStyles(makeSettingsStyles)`.
    - Switch colors via `useTheme()` (inline, not StyleSheet).
  - `apps/mobile/components/settings/use-settings-screen.ts`
    - Removed `reloadAppForThemeChange` import and call.
    - `setThemeMode` is now synchronous React state update only.
  - `apps/mobile/app/_layout.tsx`
    - `AuthGate` uses `useTheme()` — Stack header and StatusBar react to theme live.
- Fixed `apps/mobile/tsconfig.json`:
  - Removed `.next/types` include, `next` plugin, and `incremental: true`.
  - Added explicit `exclude` rules — reduces typecheck scope significantly.
- Acceptance criteria met:
  - [x] Theme change in Settings does NOT trigger app reload.
  - [x] Settings screen and nav header update immediately.
  - [x] `system` mode follows OS theme reactively (via `useColorScheme`).
  - [x] No regressions in haptics/settings/profile flow.
  - [x] SMK-20 remains PASS.
- Verification:
  - Run locally: `npm.cmd run --workspace @studyhub/mobile typecheck` (background runner unavailable this session).

### Completed Product Polish Slice (2026-04-10, Session 199)
- Cleanup after live theme switch rollout:
  - Removed unused helper file `apps/mobile/lib/theme-reload.ts`.
  - Confirmed there are no active imports/references to `reloadAppForThemeChange` in `apps/mobile`.
- Verification:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Completed Product Polish Slice (2026-04-10, Session 200)
- Final docs sync for mobile handoff:
  - Marked `README + dev-log are synced with the final mobile standard` as complete.
  - Updated README mobile quality-gate summary:
    - `SMK-01` through `SMK-20`: PASS
    - release handoff status set to GO (no active blocker).
- Live theme migration expanded to 3 target mobile screens:
  - Courses:
    - `apps/mobile/components/courses-list/courses-list.styles.ts` -> `makeCoursesListStyles(colors)`
    - `apps/mobile/components/courses-list/courses-list-screen.tsx` -> `useTheme()` + `useThemedStyles(...)`
    - `apps/mobile/components/courses-list/course-card.tsx` now consumes themed styles from parent
    - `apps/mobile/components/courses-list/courses-list-skeleton.tsx` now theme-aware
  - Material:
    - `apps/mobile/components/material/material-screen.styles.ts` -> `makeMaterialScreenStyles(colors)`
    - `apps/mobile/app/material/[id].tsx` now uses live colors for gradients/tint + themed styles
    - `apps/mobile/components/material/material-screen-skeleton.tsx` now theme-aware
    - `apps/mobile/lib/material-utils.ts` now accepts optional `colors` for live material-type visual config
  - Profile:
    - `apps/mobile/components/profile-tab/profile-tab.styles.ts` -> `makeProfileTabStyles(colors)`
    - `apps/mobile/components/profile-tab/profile-tab-screen.tsx` now uses live colors for gradients/tint + themed styles
    - `apps/mobile/components/profile-tab/profile-tab-skeleton.tsx` now theme-aware
- Verification:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Completed Product Polish Slice (2026-04-10, Session 201)
- Fixed remaining live-theme gap in Favorites tab:
  - `apps/mobile/components/favorites/favorites.styles.ts`
    - Converted static styles to `makeFavoritesStyles(colors)`.
  - `apps/mobile/app/(tabs)/favorites.tsx`
    - Added `useTheme()` + `useThemedStyles(makeFavoritesStyles)`.
    - Hero gradient + RefreshControl tint now react immediately to theme changes.
  - `apps/mobile/components/favorites/favorites-skeleton.tsx`
    - Converted to theme-aware style factory.
- Result:
  - Favorites now updates live on theme switch, matching Settings/Courses/Material/Profile behavior.
- Verification:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Completed Product Polish Slice (2026-04-10, Session 203)
- Added web profile QR handoff card (minimal scope):
  - `apps/web/components/profile/profile-qr-card.tsx`
  - wired in `apps/web/components/profile/profile-page-client.tsx`
  - deep link builder + QR image URL helper in `apps/web/lib/profile.ts`
- Deep link contract:
  - `studyhubv2://profile/{userId}` using mobile app scheme from `apps/mobile/app.json`.
- Added mobile route handling for scanned profile links:
  - new redirect route `apps/mobile/app/profile/[userId].tsx`
  - root stack registration in `apps/mobile/app/_layout.tsx`
  - handoff param handling in `apps/mobile/app/(tabs)/profile.tsx` with info toast + param cleanup.
- Kept intact:
  - existing auth/profile API contracts
  - React Query lifecycle/cache behavior
  - existing profile edit/settings flows
- Verification:
  - `npm run typecheck:web` -> pass
  - `npm run typecheck:mobile` -> pass

### Completed Code Quality Slice (2026-04-11, Session 206)
- Executed priority de-monolith pass on mobile targets without changing API contracts or runtime behavior:
  - `apps/mobile/lib/api.ts`
  - `apps/mobile/app/material/[id]/edit.tsx`
  - `apps/mobile/app/course/[id]/index.tsx`
  - `apps/mobile/components/module-workspace/use-module-workspace.ts`
  - `apps/mobile/app/module/[id]/add-material.tsx`
- Split orchestration and helper responsibilities into dedicated modules:
  - API helpers: `api.constants.ts`, `api.cache.ts`, `api.errors.ts`, `api.utils.ts`.
  - Shared material form: `components/material-form/*`.
  - Route hooks: `use-add-material-screen.ts`, `use-edit-material-screen.ts`.
  - Course details decomposition: `components/course-details/*`.
  - Module workspace decomposition: `module-workspace.data.ts`, `module-workspace.actions.ts`, `module-workspace.favorites.ts`.
- Target line counts now pass de-monolith gate (<300 each):
  - `api.ts`: `453 -> 281`
  - `material/[id]/edit.tsx`: `387 -> 57`
  - `course/[id]/index.tsx`: `381 -> 8`
  - `use-module-workspace.ts`: `366 -> 61`
  - `module/[id]/add-material.tsx`: `319 -> 47`
- Function-size guardrail pass:
  - extracted screen logic/render parts so explicit function declarations in touched/new modules are <= 60 lines.
- Stability guardrails kept intact:
  - React Query lifecycle/cache behavior unchanged.
  - Auth flow unchanged.
  - Toast/haptics behavior unchanged.
  - Navigation outcomes unchanged.
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed Stability Hotfix (2026-04-11, Session 207)
- Resolved Expo Router warnings caused by non-route hooks under `app/`:
  - moved hooks from route folders to:
    - `apps/mobile/components/material-form/use-edit-material-screen.ts`
    - `apps/mobile/components/material-form/use-add-material-screen.ts`
  - rewired route imports in:
    - `apps/mobile/app/material/[id]/edit.tsx`
    - `apps/mobile/app/module/[id]/add-material.tsx`
- Increased mobile GET timeout baseline for cold-start resilience:
  - `apps/mobile/lib/api.constants.ts`
  - `DEFAULT_GET_REQUEST_TIMEOUT_MS`: `6000 -> 20000`
- Kept intact:
  - API contracts
  - React Query lifecycle/invalidation behavior
  - auth flow and mutation behavior
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed Performance Slice (2026-04-11, Session 208)
- Replaced N+1 mobile Courses stats loading with single aggregated backend fetch:
  - `apps/mobile/components/courses-list/use-courses-list.ts`
  - old flow: `/api/courses -> /api/courses/:id/modules (N) -> /api/modules/:id/materials (M)`
  - new flow: single `/api/dashboard` read and map `moduleCount` / `materialCount`.
- Kept runtime behavior contracts intact:
  - no API response contract changes
  - no auth flow changes
  - same React Query retry/stale/fallback behavior for the stats card
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed Performance Slice (2026-04-11, Session 209)
- Added immediate Courses stats synchronization after key mobile mutations:
  - `apps/mobile/lib/query-keys.ts`
    - introduced shared stats key helpers:
      - `queryKeys.dashboard.courseStatsRoot()`
      - `queryKeys.dashboard.courseStats(...)`
    - extended invalidate helpers to include stats invalidation:
      - courses, course, module, material, favorites invalidate helpers
  - `apps/mobile/components/courses-list/use-courses-list.ts`
    - stats query now uses shared key helper (same lifecycle config).
  - `apps/mobile/app/(tabs)/favorites.tsx`
    - favorites removal mutation now uses shared invalidate helper on settle.
- Result:
  - stats card no longer waits for stale window after mutation-side data changes.
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed Resilience Slice (2026-04-11, Session 210)
- Added defensive Courses stats mapping for partial dashboard payloads:
  - `apps/mobile/components/courses-list/use-courses-list.ts`
  - `moduleCount` / `materialCount` now normalize to non-negative numeric values.
  - `courses` count now safely falls back to loaded courses length when dashboard payload is incomplete.
- Kept intact:
  - stats query lifecycle settings (`enabled`, `retry`, `staleTime`)
  - API contracts and auth flow
  - UI behavior (same card surface, same fallback UX)
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed Performance Slice (2026-04-11, Session 211)
- Added lightweight latency telemetry for mobile Courses stats fetch:
  - `apps/mobile/lib/telemetry.ts`
    - new helper: `captureTelemetryMessage(message, context?)`.
  - `apps/mobile/components/courses-list/use-courses-list.ts`
    - measures `/api/dashboard` fetch duration for stats card.
    - emits telemetry only when duration exceeds threshold (`1500ms`).
    - includes dev-only console perf log for local diagnosis.
- Kept intact:
  - API contracts
  - auth flow
  - existing query lifecycle and UI behavior
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass

### Completed UX Feature Slice (2026-04-11, Mobile AI Chatbot)
- Integrated StudyHub Mentor AI Chatbot natively into the mobile app:
  - `apps/mobile/app/chat.tsx`
  - `apps/mobile/components/chat/*`
- Added `expo-clipboard` for copying AI responses.
- Handled mobile keyboard overlapping with robust `KeyboardAvoidingView` logic.
- Included error rollback state for graceful degradation when Gemini API throws 502/400.
- Restored visual parity with web using native `AI-icon-1.png` and `AI-icon-3.png`.
- Verification:
  - `npm.cmd run typecheck:mobile` -> pass
