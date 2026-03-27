# Lesson 2 Anti-Abuse Runbook (`L2-OBS-02`)

Last updated: 2026-03-19

## 1) Purpose
This runbook defines how the team tunes anti-abuse limits and responds to repeated blocked requests for auth, AI chat, and admin mutation flows.

Goals:
- keep user-facing behavior predictable (`429` + retry guidance),
- reduce brute-force/spam/resource abuse risk,
- keep telemetry useful without storing sensitive payloads.

## 2) Scope
Covered controls:
- Auth cooldown/backoff: `src/utils/authThrottle.js`
- Chat server-side limiter: `supabase/functions/chat-with-ai/index.ts`
- Admin mutation limiter: `supabase/functions/_shared/adminMutationRateLimit.ts`
- Unified anti-abuse telemetry:
  - Frontend: `src/utils/antiAbuseTelemetry.js`
  - Edge functions: `supabase/functions/_shared/antiAbuseLogger.ts`

## 3) Event Contract (Unified)
Minimum event fields:
- `event`
- `source`
- `reason`
- `action`
- `timestamp`
- `details` (optional, sanitized)

Current sources:
- `auth`
- `chat`
- `admin`

Current reasons (examples):
- `cooldown_activated`
- `cooldown_blocked`
- `rate_limit`
- `rate_limit_received`
- `burst_blocked`

PII/sensitive data policy:
- No clear-text password/token/email in anti-abuse events.
- Keep `details` to operational fields only (for example `retryAfterSeconds`, `status`, `scope`, `endpoint`, `backoffLevel`).

## 4) Baseline Thresholds (Current Defaults)
Auth (client cooldown):
- `login`: threshold `5` failures / `10m`, base cooldown `30s`, max `5m`, backoff `x2`.
- `register`: threshold `4` failures / `10m`, base cooldown `45s`, max `6m`, backoff `x2`.
- `password_reset`: threshold `3` failures / `15m`, base cooldown `60s`, max `8m`, backoff `x2`.

Chat (server):
- `CHAT_RATE_LIMIT_MAX_REQUESTS=12` per `CHAT_RATE_LIMIT_WINDOW_MS=60000`.

Admin mutations (server):
- `ADMIN_MUTATION_RATE_LIMIT_MAX_REQUESTS=10` per `ADMIN_MUTATION_RATE_LIMIT_WINDOW_MS=60000`.

## 5) Response Levels
Use rolling 15-minute windows per source.

`Level 0 (Normal)`:
- Isolated blocked events, no visible user impact trend.
- Action: observe only; no threshold change.

`Level 1 (Elevated)`:
- Repeated blocked bursts from same flow/source.
- Action: collect examples, verify no false-positive UX regressions, prepare small tuning candidate.

`Level 2 (Incident)`:
- Sustained abuse pattern with user impact (many legitimate users blocked or endpoint pressure).
- Action: apply temporary stricter limit, monitor 30-60 minutes, then decide keep/revert.

## 6) Tuning Procedure
1. Confirm signal quality:
- Check anti-abuse events for `source/reason/action/status/retryAfterSeconds`.
- Confirm blocked events are not caused by client bug or retry loop.

2. Choose one control to adjust:
- Auth: `failureThreshold`, `cooldownMs`, `maxCooldownMs`, `backoffMultiplier`, `windowMs`.
- Chat/Admin: window/quota env vars.

3. Make minimal change:
- Adjust one parameter at a time.
- Start with 10-20% change (not drastic jumps).

4. Validate before/after:
- `npm.cmd run test`
- `npm.cmd run build`
- targeted smoke (`auth cooldown`, `chat 429`, `admin burst 429`)

5. Document decision:
- Update `docs/lesson-2-task-tracker.md` notes (if applicable).
- Update `docs/security-chat-snapshot.md` with short rationale and date.

## 7) Rollback Procedure
Rollback immediately if:
- legitimate users are blocked unexpectedly,
- auth/chat/admin error rate spikes after tuning.

Rollback steps:
1. Restore last known-good limit values.
2. Re-run `npm.cmd run test` + `npm.cmd run build`.
3. Re-check blocked event trend for 15-30 minutes.
4. Log rollback reason in snapshot/master plan notes.

## 8) Manual Smoke Checklist
- Repeated failed login/register/reset attempts trigger cooldown with safe messaging.
- Chat endpoint returns `429` + `retryAfterSeconds` and UI cooldown works.
- Admin burst create/update/delete is blocked with predictable `429` + `Retry-After`.
- Blocked events remain non-sensitive (no secrets/PII leak in telemetry/log payloads).

## 9) Ownership
- Implementation owner: security hardening stream (current lesson owner).
- Review cadence: every release candidate and after any real abuse incident.
