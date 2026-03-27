# Lesson 4: Security Regression Tests

## Lesson Goal
Build durable regression coverage for security-critical behavior so future feature work cannot silently re-open known risks.

Operational progress:
- `docs/lesson-4-task-tracker.md`
- `docs/security-chat-snapshot.md`

Scope:
- Rich HTML sanitizer regressions (`XSS` risk controls)
- Auth negative-path regressions (cooldown, rate-limit mapping, safe messaging)
- Security smoke suite extensions for public/auth flows

Status update (2026-03-19):
- Lesson 4 is started.
- `L4-REG-01` is completed: sanitizer regression coverage is expanded in `src/utils/richHtmlSanitizer.test.js`.
- `L4-AUTH-01` is completed: auth negative-path regression coverage is expanded in `src/utils/authThrottle.test.js` and `src/utils/authErrorMapper.test.js`.
- `L4-AUTHZ-01` is completed: admin authz/rate-limit regression coverage is expanded in `src/pages/admin/adminErrorMapper.test.js`.
- `L4-SMOKE-01` is completed: e2e smoke suite now includes a security-sensitive auth scenario for enumeration-safe password reset messaging.

## 1) XSS Sanitizer Regression Review
Files:
- `src/utils/richHtmlSanitizer.js`
- `src/utils/richHtmlSanitizer.test.js`

Observations:
- Good: baseline sanitizer tests already covered script removal, inline handler stripping, unsafe link cleanup, and image-source controls.
- Gap: edge cases (comments, style stripping, disallowed tag unwrap flow, unsafe protocol combinations) needed explicit regression tests.

Tasks:
- `L4-REG-01` (P0, done): expand sanitizer regression tests for comment/style stripping, disallowed tag unwrap, unsafe link attr removal, and unsafe image protocol rejection.
  - Done when: regression suite fails on unsafe output and passes on expected sanitized output.

## 2) Auth Negative-Path Regression Review
Candidate files:
- `src/utils/authThrottle.js`
- `src/utils/authErrorMapper.js`
- `src/pages/admin/adminErrorMapper.js`
- `src/utils/registerFailureTelemetry.js`

Tasks:
- `L4-AUTH-01` (P1, done): add focused tests for auth error mapping and cooldown boundary behavior.
  - Done when: lockout/cooldown/rate-limit messaging remains stable across known backend error shapes.
- `L4-AUTHZ-01` (P1, done): add negative-path mapper tests for admin authz failures and mutation throttling messages.
  - Done when: admin unauthorized/forbidden/rate-limited states stay user-safe and deterministic.

## 3) Security Smoke Extension Review
Candidate files:
- `tests/smoke/public-pages.spec.js`
- `playwright.config.js`

Tasks:
- `L4-SMOKE-01` (P1, done): extend smoke coverage with one security-sensitive assertion per critical public/auth flow.
  - Done when: suite catches at least one sanitizer/auth regression that current smoke coverage would miss.

## 4) Recommended Start Order
Lesson 4 tasks are complete.

## 5) Lesson 4 Definition Of Done (Draft)
- Security regression suite covers sanitizer, auth negative paths, and at least one extended security smoke scenario.
- `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e` are green after each regression slice.
- Tracker/snapshot/master-plan stay synchronized after every completed slice.
