# Lesson 4 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L4-REG-01` | sanitizer regressions | `done` | Expanded `src/utils/richHtmlSanitizer.test.js` with security regression cases: comment/style stripping, disallowed tag unwrap handling, unsafe link attr cleanup when href is removed, and unsafe image protocol rejection. |

## P1 (High)
| Task ID | Area | Status | Notes |
| --- | --- | --- | --- |
| `L4-AUTH-01` | auth negative paths | `done` | Expanded `src/utils/authThrottle.test.js` with cooldown boundary and persisted-state sanitation regressions; expanded `src/utils/authErrorMapper.test.js` with rate-limit/network/oauth/password-reset negative-path mapping checks. |
| `L4-AUTHZ-01` | admin authz paths | `done` | Expanded `src/pages/admin/adminErrorMapper.test.js` with regression checks for `401/403/42501` permission mapping, rate-limit code/message mapping, delete-conflict pattern mapping, validation-path mapping, precedence of network-safe messaging, and unknown-context fallback behavior. |
| `L4-SMOKE-01` | e2e security smoke | `done` | Extended `tests/smoke/public-pages.spec.js` with password-reset enumeration-safety regression (`/auth/v1/recover` mocked `user_not_found` response must still render generic user-safe toast). |

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Start Lesson 5 (`Production Security Readiness`) with one focused readiness slice.

## Validation status (latest known)
- `npm.cmd run test` -> PASS (2026-03-19)
- `npm.cmd run build` -> PASS (2026-03-19)
- `npm.cmd run test:e2e` -> PASS (2026-03-19)
