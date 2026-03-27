# Lesson 5 Live Verification Runbook (`L5-LIVE-01`)

Last updated: 2026-03-19

## 1) Purpose
This runbook defines the repeatable pre-release verification flow for the live Netlify and Vercel environments and the rollback decisions when a release gate fails.

Goals:
- verify that preview/live domains still respect the release blocker checklist,
- capture consistent evidence before signoff,
- keep rollback decisions fast and predictable when one provider fails.

## 2) Scope
Applies to:
- Netlify live/stable domain
- Vercel preview/live candidate domain
- every release candidate that is meant to be shared outside the local dev environment

Primary checklist:
- `docs/production-security-release-checklist.md`

Supporting references:
- `docs/security-env-secrets-inventory.md`
- `docs/definition-of-done.md`
- `tests/smoke/public-pages.spec.js`

## 3) Repo-Documented Live Domains
Use the current repo-documented domains unless the release candidate explicitly uses different URLs:

| Provider | Role | URL source |
| --- | --- | --- |
| Netlify | official grading demo / stable | `README.md` -> `https://studyhub-demo-mariva.netlify.app/` |
| Vercel | preview demo / release candidate | `README.md` -> `https://test-capstone-project-study-qih9ovduy-marj94567-projects.vercel.app` |

If the actual release candidate uses different domains, record the exact URLs in the checklist before starting smoke.

## 4) Pre-Flight Requirements
Do not start live verification until all of these are true:
- local release candidate commit is known (`branch` + `commit SHA`)
- `npm.cmd run test` passed
- `npm.cmd run build` passed
- `npm.cmd run test:e2e` passed
- provider deployment is complete for the candidate commit
- required env/secrets ownership still matches `docs/security-env-secrets-inventory.md`

## 5) Verification Sequence
### Step 1: Record release metadata
Fill section `1) Release Metadata` in `docs/production-security-release-checklist.md`.

Minimum record:
- date
- branch
- commit
- checked by
- release target (`Netlify`, `Vercel`, or `both`)

### Step 2: Confirm deploy-config evidence
For each target domain:
1. Request response headers from the public URL.
2. Confirm the required headers are visible and aligned with repo config.
3. Record pass/fail notes in the checklist.

Example command:

```powershell
curl.exe -I https://studyhub-demo-mariva.netlify.app/
curl.exe -I https://test-capstone-project-study-qih9ovduy-marj94567-projects.vercel.app/
```

Expected header family:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

### Step 3: Execute live smoke on each domain
For each provider/domain:
1. Open `/index.html` and confirm the page loads without blocking runtime errors.
2. Open `/login.html` and confirm the login form renders and accepts interaction.
3. Open `/register.html` and run a brand-new email registration smoke, or document the approved alternate smoke plan if real registration is intentionally restricted.
4. Trigger password reset from `/login.html` and verify the user-facing response stays generic and enumeration-safe.
5. Open `/contact.html`, submit the form, and confirm the success path works if the live domain exposes the contact backend.

Optional but recommended when credentials are available:
- verify one protected flow after login (`materials` or `profile`) to confirm the candidate is not only healthy for public pages.

### Step 4: Record outcome
Update section `5) Live Domain Smoke` in the checklist:
- mark each page/path as pass or fail
- write short notes for any alternate smoke plan, known limitation, or non-blocking observation
- if any critical line fails, stop the release candidate and move to rollback guidance

## 6) Release Gate Rules
Release is blocked immediately if any of the following happens:
- target domain does not serve the expected candidate
- required deploy headers are missing or mismatched
- registration/login critical path fails on a live target
- password reset messaging leaks account existence
- contact flow is expected for that domain but fails unexpectedly
- checklist evidence is incomplete

If one domain fails and the other passes, the release candidate is still considered blocked for the failing target.

## 7) Rollback Guidance
### Scenario A: Vercel preview fails, Netlify stable is healthy
Use when:
- preview candidate is broken
- stable/public grading domain still works

Action:
1. Stop sharing the broken Vercel preview URL.
2. Keep Netlify stable as the only approved live demo domain.
3. Redeploy the last known good preview commit to Vercel, or create a new preview from the last known good branch state.
4. Re-run the checklist only for the repaired preview target before re-sharing it.

### Scenario B: Netlify stable fails, Vercel preview is healthy
Use when:
- official stable domain is broken
- preview domain still works

Action:
1. Treat this as a release incident, not a minor preview issue.
2. Redeploy the last known good stable commit to Netlify immediately.
3. Do not treat Vercel preview as a full replacement for stable signoff unless an explicit exception is approved.
4. Re-run the critical live smoke on Netlify after rollback.

### Scenario C: Both providers fail
Action:
1. Freeze the release candidate.
2. Roll both providers back to the last known good commit.
3. Re-run automated validation locally (`test/build/test:e2e`).
4. Re-run live smoke on both domains before reopening release signoff.

## 8) Rollback Procedure
1. Identify the last known good commit that previously passed the checklist.
2. Redeploy that commit to the affected provider.
3. Re-run:
   - `npm.cmd run test`
   - `npm.cmd run build`
   - `npm.cmd run test:e2e`
4. Re-check public headers and the critical live smoke rows for the affected domain.
5. Update:
   - `docs/security-chat-snapshot.md`
   - `docs/security-learning-master-plan.md`
   - the release checklist notes for the incident

## 9) Evidence And Ownership
Minimum evidence to keep with the release candidate:
- completed `docs/production-security-release-checklist.md`
- target domains used for smoke
- commit SHA checked
- short note for any rollback or exception

Ownership:
- implementation/release owner: current security hardening stream owner
- reviewer/signoff owner: whoever completes the final release checklist signoff
