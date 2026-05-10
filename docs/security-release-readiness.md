# StudyHub v2 Security Release Readiness

Use this checklist before a preview/live deployment that will be shown outside local development.
It adapts the reusable v1 security audit process to the v2 stack: Next.js API Routes, JWT auth,
Neon/Drizzle, Vercel Blob, Expo, Pusher, and Gemini.

## Release Metadata

| Field | Value |
| --- | --- |
| Date | |
| Branch | |
| Commit | |
| Checked by | |
| Target | Vercel / Netlify / other |

## Required Gates

- [ ] `npm run check:mojibake` passes.
- [ ] `npm run typecheck` passes, or each workspace typecheck result is recorded.
- [ ] `npm run build:web` passes for the release candidate.
- [ ] `npm run deps:audit:runtime` has no unapproved high/critical runtime advisory.
- [ ] Any skipped mobile physical-device checks are documented with reason and follow-up.
- [ ] No `.env`, `.env.local`, secrets, tokens, screenshots, or logs with secrets are included in git.

## Web/API Security Checks

- [ ] Authenticated API routes verify JWT server-side before returning private data.
- [ ] Admin routes verify `role === "admin"` server-side.
- [ ] Mentor/admin-only pages redirect unauthorized users to `/forbidden` or return `403`.
- [ ] Error responses keep the `{ code, message }` contract and do not expose stack traces.
- [ ] Public abuse-prone routes keep rate limiting enabled: login, register, contact, AI chat/tools.
- [ ] User rich text is sanitized before render and before persistence where applicable.
- [ ] Material file access stays behind the private Blob flow; public post/avatar images use the public Blob flow intentionally.
- [ ] Pusher private-channel auth validates channel membership and does not authorize arbitrary channels.

## Headers And CSP

Current pre-deploy baseline:
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-DNS-Prefetch-Control`

Before final public launch:
- [ ] Confirm headers on the deployed domain.
- [ ] Add `Strict-Transport-Security` only after HTTPS deployment is stable.
- [ ] Roll out CSP in stages: `Content-Security-Policy-Report-Only`, triage, then enforced policy.
- [ ] Test CSP with Google OAuth, Pusher, Vercel Blob images/files, Gemini calls, Expo Web, and Three.js assets.

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
- `EXPO_PUBLIC_SENTRY_*`

Release checks:
- [ ] `.env.example` contains placeholders for required values only.
- [ ] Vercel/hosting env vars match the release target.
- [ ] `ALLOWED_ORIGINS` includes only intended web/mobile origins for the target environment.
- [ ] `ALLOW_DEMO_SEED` is not enabled for production.

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
