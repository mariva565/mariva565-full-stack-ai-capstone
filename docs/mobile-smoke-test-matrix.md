# Mobile Smoke Test Matrix (Phase 3)

Last updated: 2026-04-09 (Session 192)
Owner: Mobile stream  
Status: In progress - SMK-01 through SMK-19 PASS; SMK-20 BLOCKED (no VoiceOver/TalkBack environment)

## Goal

Validate that core mobile flows are stable end-to-end before telemetry and release handoff:
- Auth
- Core CRUD (courses/modules/materials)
- Favorites parity
- Offline/online recovery
- Background/foreground recovery

## Environment Preflight

1. Start backend:
```bash
npm run dev:web
```
2. Confirm backend is on `http://localhost:3000` (not `3001`).
3. Start mobile:
```bash
npm --workspace @studyhub/mobile run dev:mobile:lan
```
4. Ensure `apps/mobile/.env` has correct LAN IP in `EXPO_PUBLIC_API_URL`.
5. Use a physical device (same Wi-Fi, Expo Go).

## Test Data

- Account A: regular user (existing seeded user or freshly registered).
- Account B: second user for quick auth/session sanity (optional).
- At least one existing course/module/material in Account A for read/edit/delete checks.

## Execution Matrix

Mark each item with `PASS`, `FAIL`, or `BLOCKED` and add short notes.

| ID | Area | Scenario | Expected result | Status | Notes |
|---|---|---|---|---|---|
| SMK-01 | Auth | Login with valid credentials | Lands on Courses tab, no crash, data loads | `PASS` | Login succeeds; intermittent first-attempt timeout observed once (retry succeeds). |
| SMK-02 | Auth | Logout from Profile tab | Returns to Login screen, protected tabs blocked | `PASS` | Logout returned to login screen as expected. |
| SMK-03 | Auth | Register new account | Account created, routed to authenticated area | `PASS` | Re-tested after warmup/timeout fixes; account creation and redirect succeeded. |
| SMK-04 | Session | App restart after login | Session persists, user stays authenticated | `PASS` | Session remained authenticated after full app restart. |
| SMK-05 | Courses CRUD | Create course | New course appears in list without stale/duplicate state | `PASS` | Re-tested after warmup/timeout fixes; create flow stable. |
| SMK-06 | Courses CRUD | Edit course | Updated course values persist and render correctly | `PASS` | Re-tested after warmup/timeout fixes; edit flow stable. |
| SMK-07 | Courses CRUD | Delete course | Course removed, confirm flow works, no orphan UI state | `PASS` | Re-tested after warmup/timeout fixes; delete flow stable. |
| SMK-08 | Modules CRUD | Add module in course | Module appears in course details and module workspace | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-09 | Modules CRUD | Edit module | Changes persist across course/module screens | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-10 | Modules CRUD | Delete module | Module removed from course and workspace lists | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-11 | Materials CRUD | Add material (note/link) | Material appears in module workspace and detail opens | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-12 | Materials CRUD | Edit material | Changes persist; link/file rendering remains correct | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-13 | Materials CRUD | Delete material | Material removed cleanly with correct feedback | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-14 | Favorites | Pin material from material screen | Favorites tab updates with pinned item | `PASS` | Passed after adding direct workspace pin/unpin entry point. |
| SMK-15 | Favorites | Unpin from favorites tab | Item removed with consistent optimistic behavior | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-16 | Navigation | Quick navigation from favorites | Course/Module/Material links open correct targets | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-17 | Offline/Online | Go offline while in app, then online | Offline states shown; reconnect refetch recovers data | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-18 | AppState | Background app 30-60s, return foreground | Key screens refetch as expected, no stale lock | `PASS` | Passed after auth hydration smoothing (Session 191). |
| SMK-19 | Form Safety | Back during dirty CRUD form | Discard confirmation appears consistently | `PASS` | Manual physical-device run reported stable behavior. |
| SMK-20 | Accessibility sanity | VoiceOver/TalkBack basic pass on core actions | Primary controls are announced with meaningful labels | `BLOCKED` | Device/environment did not have VoiceOver/TalkBack verification available in this run. |

## Exit Criteria

- No `FAIL` in `SMK-01` through `SMK-19`.
- Any `BLOCKED` item has a clear blocker and owner.
- If any `FAIL` appears, create fix task(s), re-run only impacted rows, then do one final full sanity sweep (`SMK-01`, `SMK-05`, `SMK-11`, `SMK-14`, `SMK-17`).

## Run Log

### Run 1 (2026-04-09)
- Result: PASS: SMK-01, SMK-02, SMK-04. FAIL: SMK-03, SMK-05, SMK-06, SMK-07.
- Root cause (Session 186): Unhandled promise rejections causing red Uncaught overlay. Fixed via try/catch hardening + mutate() instead of mutateAsync().
- Remaining blocker after Session 186: Intermittent mutation timeouts (action succeeds server-side, client times out).

### Root Cause Analysis (Session 187)
- Backend uses `drizzle-orm/neon-http` (stateless HTTP driver). Every DB query is a fresh HTTP request to Neon serverless.
- Neon free tier suspends DB after ~5 minutes of inactivity. Wake-up takes 5-30+ seconds.
- 25s mutation timeout was not enough to survive a full cold-start round-trip.
- Pattern: server completes the action, client already aborted -> "timeout" on mobile, success server-side.

### Fix applied (Session 187)
- `apps/mobile/lib/api.ts`: mutation timeout 25s -> 45s.
- `apps/web/app/api/ping/route.ts`: new DB-touching warmup probe (no auth, `SELECT 1`).
- `apps/mobile/lib/auth-context.tsx`: `warmupBackend()` fired after login + auto-login to pre-warm DB before first mutation.
- Typecheck: pass.

### Run 2 (2026-04-09)
- Result: PASS: `SMK-01` through `SMK-19`.
- BLOCKED: `SMK-20` (no VoiceOver/TalkBack test environment available in this run).
- Notes:
  - Retest rows from Session 187 (`SMK-03`, `SMK-05`, `SMK-06`, `SMK-07`) now pass after timeout + warmup stabilization.
  - Favorites flows (`SMK-14`, `SMK-15`) pass after adding direct pin/unpin action in module workspace cards.
