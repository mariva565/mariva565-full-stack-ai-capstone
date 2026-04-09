# Mobile Smoke Test Matrix (Phase 3)

Last updated: 2026-04-09  
Owner: Mobile stream  
Status: In progress (run started; physical-device execution active)

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
| SMK-03 | Auth | Register new account | Account created, routed to authenticated area | `FAIL` | First submit timed out with failed registration message; second submit returned \"email already exists\" (likely first request succeeded server-side). |
| SMK-04 | Session | App restart after login | Session persists, user stays authenticated | `PASS` | Session remained authenticated after full app restart. |
| SMK-05 | Courses CRUD | Create course | New course appears in list without stale/duplicate state | `FAIL` | Course creation succeeded, but timeout errors appeared during flow. |
| SMK-06 | Courses CRUD | Edit course | Updated course values persist and render correctly | `FAIL` | Course edit succeeded, but timeout errors appeared repeatedly. |
| SMK-07 | Courses CRUD | Delete course | Course removed, confirm flow works, no orphan UI state | `FAIL` | Delete completed server-side (verified via admin), but mobile showed timeout/red error. |
| SMK-08 | Modules CRUD | Add module in course | Module appears in course details and module workspace | `PENDING` | |
| SMK-09 | Modules CRUD | Edit module | Changes persist across course/module screens | `PENDING` | |
| SMK-10 | Modules CRUD | Delete module | Module removed from course and workspace lists | `PENDING` | |
| SMK-11 | Materials CRUD | Add material (note/link) | Material appears in module workspace and detail opens | `PENDING` | |
| SMK-12 | Materials CRUD | Edit material | Changes persist; link/file rendering remains correct | `PENDING` | |
| SMK-13 | Materials CRUD | Delete material | Material removed cleanly with correct feedback | `PENDING` | |
| SMK-14 | Favorites | Pin material from material screen | Favorites tab updates with pinned item | `PENDING` | |
| SMK-15 | Favorites | Unpin from favorites tab | Item removed with consistent optimistic behavior | `PENDING` | |
| SMK-16 | Navigation | Quick navigation from favorites | Course/Module/Material links open correct targets | `PENDING` | |
| SMK-17 | Offline/Online | Go offline while in app, then online | Offline states shown; reconnect refetch recovers data | `PENDING` | |
| SMK-18 | AppState | Background app 30-60s, return foreground | Key screens refetch as expected, no stale lock | `PENDING` | |
| SMK-19 | Form Safety | Back during dirty CRUD form | Discard confirmation appears consistently | `PENDING` | |
| SMK-20 | Accessibility sanity | VoiceOver/TalkBack basic pass on core actions | Primary controls are announced with meaningful labels | `PENDING` | |

## Exit Criteria

- No `FAIL` in `SMK-01` through `SMK-19`.
- Any `BLOCKED` item has a clear blocker and owner.
- If any `FAIL` appears, create fix task(s), re-run only impacted rows, then do one final full sanity sweep (`SMK-01`, `SMK-05`, `SMK-11`, `SMK-14`, `SMK-17`).

## Run Log

- Run date: 2026-04-09
- Tester: Pending
- Device: Pending
- OS version: Pending
- Expo Go version: Pending
- Result summary: Run started. Preflight verified (`localhost:3000` and `localhost:8081` responding with HTTP 200). Intermittent first-attempt auth timeout observed once; retry succeeded.
