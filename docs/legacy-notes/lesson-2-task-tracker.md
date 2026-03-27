# Lesson 2 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L2-CHAT-01` | chat-with-ai | `done` | Added server-side per-user limiter in `supabase/functions/chat-with-ai/index.ts` with configurable window/quota (`CHAT_RATE_LIMIT_WINDOW_MS`, `CHAT_RATE_LIMIT_MAX_REQUESTS`) and `429` + `Retry-After` when exceeded. |
| `L2-AUTH-01` | auth | `done` | Added shared `src/utils/authThrottle.js` helper and migrated `login/register/password reset` flows to centralized cooldown state/messages (with UI button sync + tests). |
| `L2-ADM-01` | admin edge functions | `done` | Added server-side admin mutation limiter (shared `supabase/functions/_shared/adminMutationRateLimit.ts`) for `create-user`, `update-user`, `delete-user` with `429` + `Retry-After` on burst abuse. |

## P1 (High)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L2-CHAT-02` | chat-with-ai | `done` | Standardized chat `429` handling path (`message`, `retryAfterSeconds`, `Retry-After`) and updated `ChatWidget` with user-safe cooldown visualization + local retry blocking. |
| `L2-AUTH-02` | auth | `done` | Added stepped auth backoff in `authThrottle` with bounded escalation (`backoffMultiplier` + `maxCooldownMs`) and reset-on-success behavior, covered by new unit tests. |
| `L2-ADM-02` | admin edge functions | `done` | Added explicit admin burst-block telemetry helper (`logAdminMutationBlocked`) with minimal, non-sensitive signal payload (`source/reason/action/status/retryAfterSeconds/endpoint/scope`). |
| `L2-OBS-01` | observability | `done` | Added unified anti-abuse event schema utility (`event`, `source`, `reason`, `action`, `timestamp`, `details`) and wired it into auth/chat/frontend telemetry + edge admin/chat anti-abuse logs. |

## P2 (Later)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L2-OBS-02` | operations | `done` | Added anti-abuse runbook in `docs/lesson-2-anti-abuse-runbook.md` with threshold tuning, response levels, rollback flow, and smoke checklist. |

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Continue in `docs/lesson-3-task-tracker.md` (`CSP + Inline Script Cleanup`).
2. Keep Lesson 2 as closed reference unless regressions appear.
3. Re-run `npm.cmd run test` + `npm.cmd run build` if any Lesson 2 area is touched again.

## Validation status (latest known)
- `npm.cmd run test` -> PASS (2026-03-19)
- `npm.cmd run build` -> PASS (2026-03-19)
- `npm.cmd run test:e2e` -> PASS (2026-03-19)

