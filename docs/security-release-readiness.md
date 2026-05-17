# StudyHub v2 Security Release Readiness

Use this checklist before a preview/live deployment that will be shown outside local development.
It adapts the reusable v1 security audit process to the v2 stack: Next.js API Routes, JWT auth,
Neon/Drizzle, Vercel Blob, Expo, Pusher, and Gemini.

## Release Metadata

| Field | Value |
| --- | --- |
| Date | 2026-05-14 |
| Branch | `main` |
| Commit | `98bdcf9` |
| Checked by | Codex |
| Target | Vercel production web + EAS preview APK preparation |

## Required Gates

- [x] `npm run check:mojibake` passes.
- [x] `npm run typecheck` passes, or each workspace typecheck result is recorded.
- [x] `npm run build:web` passes for the release candidate.
- [x] `npm run deps:audit:runtime` has no unapproved high/critical runtime advisory.
- [x] Any skipped mobile physical-device checks are documented with reason and follow-up.
- [x] No `.env`, `.env.local`, secrets, tokens, screenshots, or logs with secrets are included in git.

Current pass notes (2026-05-14):
- `npm run check:mojibake` -> pass.
- `npm run typecheck` -> pass for web, mobile, and shared workspaces.
- `npm run build:web` -> pass. Build still emits the known non-blocking `jose` Edge Runtime warnings through `lib/jwt.ts`.
- `npm run deps:audit:runtime` -> pass at high threshold. Remaining output is moderate `postcss` advisories through Next/Expo; npm suggests a breaking forced fix, so this remains tracked but non-blocking for the capstone demo.
- `git ls-files | rg '(^|/)\.env(\.|$)'` -> only `.env.example` and `apps/mobile/.env.example` are tracked.
- Mobile physical-device push checks are documented as pending in `docs/mobile-release-checklist.md` and `docs/mobile-execution-checklist.md` (`SMK-21`..`SMK-23`); the concrete open prerequisite is native Android Firebase/FCM setup for the standalone APK.

## Web/API Security Checks

- [x] Authenticated API routes verify JWT server-side before returning private data.
- [x] Admin routes verify `role === "admin"` server-side.
- [x] Mentor/admin-only pages redirect unauthorized users to `/forbidden` or return `403`.
- [x] Error responses keep the `{ code, message }` contract and do not expose stack traces.
- [x] Public abuse-prone routes keep rate limiting enabled: login, register, contact, AI chat/tools.
- [x] User rich text is sanitized before render and before persistence where applicable.
- [x] Material file access stays behind the private Blob flow; public post/avatar images use the public Blob flow intentionally.
- [x] Pusher private-channel auth validates channel membership and does not authorize arbitrary channels.

Status note: these checks are carried forward from the completed security audit (#52) and the 2026-05-12 deployment smoke pass. No fresh route-by-route code review was performed in the 2026-05-14 documentation pass.

## Headers And CSP

Current pre-deploy baseline:
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-DNS-Prefetch-Control`

Before final public launch:
- [x] Confirm headers on the deployed domain.
- [x] Add `Strict-Transport-Security` only after HTTPS deployment is stable.
- [ ] Roll out CSP in stages: `Content-Security-Policy-Report-Only`, triage, then enforced policy.
- [ ] Test CSP with Google OAuth, Pusher, Vercel Blob images/files, Gemini calls, Expo Web, and Three.js assets.

Current deployed header check (2026-05-14):
- Target: `https://mariva565-full-stack-ai-capstone-we.vercel.app`
- `HEAD /` returned `200`.
- Present: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, `Cross-Origin-Opener-Policy`, and `Strict-Transport-Security`.
- CSP rollout remains staged/deferred; do not enforce CSP before OAuth/Pusher/Blob/Expo/Three.js smoke coverage.

## Environment Contract

Server runtime values:
- `DATABASE_URL`
- `JWT_SECRET`
- `FILE_LINK_SIGNING_SECRET`
- `GEMINI_API_KEY`
- `PUSHER_APP_ID`
- `PUSHER_KEY`
- `PUSHER_SECRET`
- `PUSHER_CLUSTER`
- `AVATAR_BLOB_READ_WRITE_TOKEN`
- `MATERIAL_BLOB_READ_WRITE_TOKEN`
- `SMTP_*`
- `SENTRY_AUTH_TOKEN`
- `EXPO_PUSH_ACCESS_TOKEN`
- `TEST_DATABASE_URL` (local/integration only)
- `TEST_BASE_URL` (local/integration only)

Public client values:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_SENTRY_*`

Release checks:
- [x] `.env.example` contains placeholders for required values only.
- [x] Vercel/hosting env vars match the deployed web release target.
- [x] `ALLOWED_ORIGINS` includes only intended web/mobile origins for the target environment.
- [x] `ALLOW_DEMO_SEED` is not enabled for production.
- [x] EAS preview env values confirmed before the APK build:
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - optional `EXPO_PUBLIC_SENTRY_DSN`

Status note: web production env was validated during the 2026-05-12 deploy smoke pass. On 2026-05-16, the EAS `preview` environment was confirmed for the production API URL, Google web/Android/iOS client IDs, Expo web redirect URI, and public Sentry DSN; the current EAS Android signing SHA-1 was confirmed as `A5:30:BD:22:16:20:E3:67:B4:26:00:A7:59:ED:9A:9F:30:CB:87:68`, and the Android client ID was moved to the EAS-release client ending in `4j36bet048rhn7pdhrfuvtsu1migbbcl`. Native APK auth now lets the Expo Google provider use its Android package-based redirect `com.studyhub.mobile:/oauthredirect`; `apps/mobile/app.json` registers both the public `studyhubv2` deep-link scheme and Android-only `com.studyhub.mobile` so the APK can receive native callbacks, while `app/+native-intent.tsx` rewrites OAuth callback links back to `/login` instead of exposing them as user-facing routes. Expo web keeps its hosted `/login` redirect. The preview APK build intentionally uses `SENTRY_DISABLE_AUTO_UPLOAD=true` instead of requiring `SENTRY_AUTH_TOKEN` for source-map upload.

Mobile push note (2026-05-17):
- Native Android Firebase/FCM setup is now complete for the next standalone APK:
  - `apps/mobile/google-services.json` and `android.googleServicesFile` are in place
  - EAS Credentials shows an FCM V1 service-account key for Firebase project `studyhub-56b8a`
- `SMK-21`..`SMK-23` remain blocked only until a fresh FCM-enabled APK is built and validated on physical devices.

## Dependency Review

Run for every release candidate:

```powershell
npm run deps:inventory
npm run deps:outdated
npm run deps:audit:runtime
```

Policy:
- Critical runtime advisories block release until patched or rolled back.
- High runtime advisories block release unless an explicit exception is documented.
- Moderate/low advisories should be tracked but do not automatically block the capstone demo.
- Avoid broad major upgrades during demo freeze unless they fix a release blocker.

## Deferred Hardening

Admin 2FA was implemented in StudyHub v1 as a security-hardening experiment, but it is intentionally
deferred in v2 until after the capstone defense. The jury needs a predictable demo path, and the v1
Supabase `aal2` model does not transfer directly to the v2 JWT/Next stack.

Post-defense candidates:
- staged CSP enforcement,
- centralized security event logging,
- admin 2FA/session hardening,
- stricter dependency automation,
- expanded attacker-style regression tests.
