# Admin Session Hardening Policy (`L6-SES-01`)

Date: 2026-03-21

## Purpose
Add explicit admin-session constraints on top of `admin + aal2`:
- idle timeout for admin activity,
- recent verification window for privileged admin mutations.

## Policy values
- Admin idle timeout: `15 minutes` (`ADMIN_SESSION_IDLE_TIMEOUT_MS = 900000` on client; `ADMIN_SESSION_IDLE_TIMEOUT_SECONDS = 900` on Edge Functions).
- Recent admin verification window: `30 minutes` (`ADMIN_SESSION_RECENT_VERIFY_WINDOW_MS = 1800000` on client; `ADMIN_RECENT_VERIFY_WINDOW_SECONDS = 1800` on Edge Functions).
- Short sync bridge after MFA challenge: `20 seconds` (`ADMIN_SESSION_SYNC_BRIDGE_WINDOW_MS = 20000`) to absorb token refresh propagation immediately after verification.

## Enforcement points
1. Client admin boot gate (`src/pages/admin/admin.js`)
- if admin session is `aal2` but stale by policy (idle or recent-verification window), redirect to `/mfa.html` with reason.
- continuously touches admin activity timestamp while admin page is active.

2. Mutation preflight (`src/pages/admin/adminService.js`)
- before invoking `create-user`, `update-user`, `delete-user`, enforce local policy check and deny early if stale.
- deny error codes:
  - `admin_mfa_required`
  - `admin_recent_mfa_required`
  - `admin_session_idle_timeout`

3. Server-side deny guard (`supabase/functions/_shared/adminAuth.ts`)
- keeps `admin + aal2` check.
- adds JWT claim age checks (`auth_time`/`iat`) for recent-verification and session-idle windows.
- returns explicit deny codes so UI maps to deterministic user-safe messages.

## Regression coverage
- `src/utils/adminSessionPolicy.test.js`
  - verifies allow/deny decisions for `aal2` missing, idle timeout, recent-verification expiry, sync bridge handling, JWT AAL parsing.
- `src/pages/admin/adminErrorMapper.test.js`
  - verifies mapping for `admin_recent_mfa_required` and `admin_session_idle_timeout` plus network-precedence safety.

## Rollback strategy
- if false-positive lockouts appear:
  1. temporarily relax client-only gate by increasing windows,
  2. keep Edge `admin + aal2` checks intact,
  3. tune env-based server windows (`ADMIN_SESSION_IDLE_TIMEOUT_SECONDS`, `ADMIN_RECENT_VERIFY_WINDOW_SECONDS`) instead of removing policy entirely.

## Validation for this slice
- `npm.cmd run test -- src/utils/adminSessionPolicy.test.js src/pages/admin/adminErrorMapper.test.js` PASS
- `npm.cmd run test` PASS
- `npm.cmd run build` PASS
- No hosted rollout actions executed (`no supabase db push`).
