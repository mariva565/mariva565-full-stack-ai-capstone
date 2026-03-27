# Production Security Release Checklist

Use this checklist for every preview/live release candidate.
If any required item fails, the release stays blocked until fixed or explicitly rolled back.

Execution guide:
- `docs/lesson-5-live-verification-runbook.md`
- `docs/supabase-hosted-db-push-safe-rollout-checklist.md` (when migration push is part of release)

## 1) Release Metadata
| Field | Value |
| --- | --- |
| Date | |
| Branch | |
| Commit | |
| Checked by | |
| Release target | Netlify / Vercel / both |

## 2) Automated Release Blockers
- [ ] `npm.cmd run test` passed on the release candidate commit.
- [ ] `npm.cmd run build` passed on the release candidate commit.
- [ ] `npm.cmd run test:e2e` passed on the release candidate commit.
- [ ] Deploy header guard passed (`src/utils/deploySecurityHeaders.test.js`).
- [ ] Client env contract guard passed (`src/utils/runtimeEnvContract.test.js`).

## 3) Dependency Review
- [ ] Dependency review followed `docs/dependency-security-audit-cadence.md`.
- [ ] `npm.cmd outdated` was reviewed for the release candidate commit.
- [ ] `npm.cmd audit --omit=dev --audit-level=high` found no unapproved high/critical runtime advisory.
- [ ] Any remaining non-blocking dev/toolchain advisory has an owner, rationale, and target fix date.

## 4) Deploy Config Readiness
- [ ] Netlify deploy headers come from `netlify.toml` in the release candidate commit.
- [ ] Vercel deploy headers come from `vercel.json` in the release candidate commit.
- [ ] Required headers are still present: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`.
- [ ] No manual hosting-panel override bypassed the repo-tracked header config.

## 5) Environment And Secrets Readiness
- [ ] Frontend runtime uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] Service-role keys and provider API secrets remain server-side only.
- [ ] Required values are configured in the owning system described in `docs/security-env-secrets-inventory.md`.
- [ ] No secrets appear in repo files, screenshots, logs, or demo notes.

## 6) Live Domain Smoke
Run this section using `docs/lesson-5-live-verification-runbook.md`.

| Domain | Landing | Login | Register | Password Reset Safe | Contact | Result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Netlify | [ ] | [ ] | [ ] | [ ] | [ ] | | |
| Vercel | [ ] | [ ] | [ ] | [ ] | [ ] | | |

Expected outcomes:
- `Landing`: `/index.html` loads without blocking runtime errors.
- `Login`: `/login.html` loads and sign-in flow is reachable.
- `Register`: `/register.html` works for a brand-new email or an equivalent approved live smoke plan is recorded.
- `Password Reset Safe`: password reset keeps the generic user-safe message contract.
- `Contact`: contact submit works when the live environment exposes the contact flow.

## 7) Final Signoff
- [ ] No critical security gate is failing.
- [ ] No known high-severity security regression remains without an approved exception.
- [ ] No blocker-level dependency advisory remains without an approved exception.
- [ ] Any failed item has an owner, a rollback path, and release remains blocked until resolved.

| Signoff | Name |
| --- | --- |
| Engineering | |
| QA / Reviewer | |
