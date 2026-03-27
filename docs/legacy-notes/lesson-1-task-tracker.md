# Lesson 1 Task Tracker

Status legend:
- `todo`
- `in_progress`
- `done`
- `blocked`

## P0 (Critical First)
| Task ID | Screen | Status | Notes |
| --- | --- | --- | --- |
| `L1-MAT-01` | materials | `done` | Inline `onclick` removed from `renderCourseList`; card listeners use `encodeURIComponent` for `courseId`. |
| `L1-ADM-01` | admin | `done` | Removed debug `window.onerror` overlay from `src/admin.html` (no runtime error HTML injection). |
| `L1-ADM-02` | admin | `done` | Removed inline handlers from admin UI (`onclick/onchange` in `src/admin.html` + inline image `onerror` in `admin.js` fallback template); moved behavior to JS listeners. |

## P1 (High)
| Task ID | Screen | Status | Notes |
| --- | --- | --- | --- |
| `L1-LOGIN-01` | login | `done` | Added central `authErrorMapper` and replaced raw login/OAuth error toasts with safe user messages. |
| `L1-LOGIN-02` | login | `done` | Added client-side cooldown after repeated failed login attempts (local state + timed button lock). |
| `L1-REG-01` | register | `done` | Added client-side `fullName` normalization/validation (trim + collapse whitespace, 2-120 chars) before register request. |
| `L1-REG-02` | register | `done` | Register flow now uses `mapAuthErrorToUserMessage(..., 'register')` and hides raw provider/backend error text. |
| `L1-MAT-02` | materials | `done` | Added shared `safeNewTab` helper and routed materials new-tab flows through it (`download`, `view file`, `print preview`). |
| `L1-MAT-03` | materials | `done` | Added sanitizer regression unit tests (`script`, `onerror`, `javascript:`, `data:` cases) and extracted sanitizer util for isolated testing. |
| `L1-ADM-03` | admin | `done` | Added safe avatar URL helper in admin renderer (`http/https/blob` allowlist) with fallback avatar image URL for unsafe/invalid input. |
| `L1-ADM-04` | admin | `done` | Added centralized admin error mapper and routed admin table/toast/map failures through safe user-facing messages (no raw backend/provider text). |

## P2 (Later)
| Task ID | Screen | Status | Notes |
| --- | --- | --- | --- |
| `L1-LOGIN-03` | login | `done` | Added secure forgot-password flow on login (`requestPasswordReset`) with controlled redirect and enumeration-safe user messaging. |
| `L1-REG-03` | register | `done` | Added sanitized register-failure telemetry (reason/code/timestamp only, local buffered log, no clear-text email/password/raw backend messages). |

## Next chat pick
Pick max 2 tasks per chat. Recommended order:
1. Start Lesson 2 planning (`Rate Limiting + Anti-Abuse`) with concrete task IDs.
2. Pick first Lesson 2 implementation task (max 1-2 per chat).

## Smoke status (2026-03-18)
- `npm.cmd run test` -> PASS
- `npm.cmd run build` -> PASS
- `npm.cmd run test:e2e` -> PASS (executed outside sandbox)
- Inline handler scan for reviewed screens (`login/register/materials/admin`) -> PASS
- Lesson 1 DoD closeout -> PASS
