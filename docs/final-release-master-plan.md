# StudyHub v2 — Final Release Master Plan

Last updated: 2026-05-17  
Owner: release stream  
Purpose: single source of truth for the final capstone stretch after the 2026-05-16 assignment update

## Read This First
This plan supersedes older fragmented "what remains" lists for final release work.
Before starting a new session, read:

1. `docs/dev-log.md`
2. `docs/final-release-master-plan.md`
3. `docs/implementation-plan.md`
4. `docs/performance-guardrails.md`
5. `docs/mobile-release-checklist.md`
6. `docs/mobile-smoke-test-matrix.md`
7. `docs/security-release-readiness.md`

## Current Snapshot
### Already done
- Web production deployment is live.
- Expo web deployment is live.
- Production Drizzle migrations are applied.
- Security audit is complete.
- Web production smoke passed for auth, OAuth, Blob, AI, community, admin, password reset, and headers.
- Core mobile scope is implemented.
- Mobile smoke rows `SMK-01` through `SMK-23` are `PASS`.
- Android APK build, device validation, GitHub Release upload, and README link are complete.
- README, architecture diagrams, API docs, AGENTS, and repo hygiene had a strong pre-deploy pass.

### Still open
- Final release review, tag/release hygiene, and demo-freeze checks.
- Final documentation closeout for any still-true limitations plus supporting-doc sync.

## Priority Model
### Mandatory for the updated assignment
1. Server-side pagination that is defensible under load.
2. 10,000-record scalability validation with documented evidence.
3. Live Next.js app.
4. Live Expo web export.
5. Documentation synced to final delivered state.

### Important because we already planned and built toward it
1. Android APK via EAS.
2. APK published in GitHub Releases.
3. Physical-device validation of native-only mobile flows and push behavior.

### Optional / post-core
1. GitHub Actions test workflow.
2. Tiny contact-form Server Action experiment on a separate branch.
3. Automated backups.
4. CSP enforcement beyond report-only rollout.
5. Admin 2FA.

## Non-Negotiable Safety Rules
- Do not run heavy seeds against Neon `production`.
- Use Drizzle migrations for schema/index changes.
- Use a dedicated Neon branch for stress validation.
- Keep production read-mostly until the defense.
- Do not mix optional refactors into mandatory slices.
- Every session updates `docs/dev-log.md`.
- `docs/dev-log.md` must remain UTF-8 with BOM.
- Before any commit, run `npm run check:mojibake`.

## Resource Budget Guardrails
### Neon
- [ ] Before any heavy database operation, check the **actual** quota and current usage in the Neon console; treat the console as source of truth if public plan docs and older project notes differ.
- [ ] Keep stress validation on a short-lived branch only; never run the full stress seed on `production`.
- [ ] Run a small dry seed before the full branch seed.
- [ ] Monitor branch compute while the stress run is active.
- [ ] Capture the needed evidence, then delete the branch once it is no longer useful.
- [ ] Avoid long-lived manual tabs, polling loops, or repeated exploratory queries after validation is complete.

Current public Free-plan reference points to remember while planning:
- `191.9` total compute hours/month.
- Up to `5` compute hours/month for non-default branch computes.
- Up to `10` branches per Free-plan project.
- The total allowance is larger than our older local note, but the branch-compute allowance is much smaller and matters directly for stress validation.

### Vercel Hobby
- [ ] Before release-week work, check the project usage dashboard instead of assuming the free plan has infinite headroom.
- [ ] Do not route bulk seeding, exports, or heavy batch jobs through Vercel Functions; run stress tooling from local scripts against the Neon branch.
- [ ] Keep paginated API responses comfortably small; Vercel Functions have a hard request/response payload ceiling.
- [ ] Keep production smoke focused and finite; avoid accidental load testing against the live deployment.
- [ ] Confirm the project's function-runtime mode before relying on a long execution window.

Current public Hobby-plan reference points to remember while planning:
- `4` CPU-hours active CPU.
- `360` GB-hours provisioned memory.
- First `1,000,000` function invocations.
- First `100` GB-hours function duration.
- `4.5 MB` maximum request or response payload for a Vercel Function.
- Function payloads have a fixed maximum size, so pagination is also a hosting-safety measure, not only a database optimization.

## Master Sequence
### Phase A — Final Assignment Alignment
#### A1. Lock the plan
- [x] Compare the new final assignment against the shipped project.
- [x] Identify the real gaps:
  - Expo web live URL
  - 10k load proof
  - broader backend pagination
- [x] Keep Server Actions as optional insurance only.
- [x] Preserve APK as an additional official deliverable.

#### A2. Sync the planning docs
- [x] Mark this file as the current release master plan in future handoffs.
- [x] Update docs that still describe Expo web as fallback-only.
- [x] Keep older local plans as reference, but do not let them override this file.

Exit criteria:
- A new agent can read one plan and understand exactly what remains.

### Phase B — Scalability Foundation

#### B1. Backend pagination work
Required routes:
- [x] `GET /api/courses`
- [x] `GET /api/admin/users`
- [x] `GET /api/admin/courses`
- [x] `GET /api/admin/modules`
- [x] `GET /api/admin/materials`
- [x] `GET /api/admin/members`

Required behavior:
- [x] Accept `page` and `limit`.
- [x] Return paged records plus `page`, `limit`, `total`, `hasMore`.
- [x] Move search/filtering server-side where the current UI filters entire in-memory arrays.
- [x] Preserve current sort order and UX behavior.
- [x] Update admin tab components to consume backend paging instead of slicing full datasets locally.
- [x] Add or update integration/type coverage where practical.

Second-wave, not first blocker:

- [ ] Rework `/api/conversations` so inbox state does not read all messages from all conversations.
- [ ] Add message-history paging to `/api/conversations/[id]/messages`.

#### B2. Index audit and migrations

Obvious first-pass indexes to add with Drizzle migrations if still missing after review:

- [x] `modules.course_id`
- [x] `modules.created_by`
- [x] `materials.module_id`
- [x] `materials.created_by`
- [x] `comments.post_id`
- [x] `course_members.user_id`
- [x] `activity_logs.created_at`

Measurement rule:

- [x] Run `EXPLAIN ANALYZE` on real stress-branch queries before adding workload-specific indexes.
- [x] Do not add speculative indexes only for appearance.

Verification for Phase B:

- [x] `npm run typecheck`
- [x] relevant tests for changed routes/components
- [x] `npm run build:web`
- [x] `npm run check:mojibake`

Exit criteria:
- Large admin surfaces are truly server-paginated before stress data exists.

### Phase C — Stress Dataset and Validation

#### C1. Create stress tooling

- [x] Add `drizzle/seed-stress.ts`.
- [x] Add root script `db:seed:stress`.
- [x] Require `ALLOW_STRESS_SEED=true`.
- [x] Use deterministic synthetic data.
- [x] Use stable prefixes such as `stress-...`.
- [x] Insert in batches:
  - users: `500`
  - other large tables: `1,000`
- [x] Reuse one precomputed password hash for synthetic users.
- [x] Print final count summary.
- [x] Keep the normal demo seed untouched.

#### C2. Official stress dataset
Target counts:

| Table | Count |
|---|---:|
| `users` | `10,000` |
| `courses` | `1,000` |
| `modules` | `3,000` |
| `materials` | `10,000` |
| `posts` | `10,000` |
| `comments` | `20,000` |
| `favorites` | `5,000` |
| `course_members` | `2,000` |
| `post_likes` | `15,000` |
| `post_bookmarks` | `5,000` |
| `activity_logs` | `10,000` |

#### C3. Safe execution order

- [x] Check the actual Neon quota in the console.
- [x] Create Neon branch `stress-test` from `studyhub` production.
- [x] Confirm the connection string points to the branch, not production.
- [x] Run a small dry run first.
- [x] Verify FK integrity and UI behavior on the dry run.
- [x] Run the full stress seed on the branch only.
- [x] Record dataset counts and warm-response timings.
- [x] Delete the branch after evidence is captured and no longer needed.

#### C4. Official validation surfaces
API checks:

- [x] `/api/admin/users?page=1&limit=50`
- [x] `/api/admin/users?page=200&limit=50`
- [x] `/api/admin/users?search=stress`
- [x] `/api/admin/courses?page=1&limit=50`
- [x] `/api/admin/modules?page=1&limit=50`
- [x] `/api/admin/materials?page=1&limit=50`
- [x] `/api/admin/materials?page=200&limit=50`
- [x] `/api/admin/members?page=1&limit=50`
- [x] `/api/courses?page=1`
- [x] `/api/courses?page=50`

Capture:

- [x] exact seeded counts
- [x] screenshots (`docs/Neon_SQL_editor_screenshot.png`, `docs/Neon_Test_Tables_screenshot.png`)
- [x] timings (all endpoints < 250ms)
- [x] index changes justified by measured plans
- [x] note that validation ran on a Neon branch, not production

Verification for Phase C:

- [x] stress script dry-run success
- [x] full branch seed success
- [x] paginated UI behavior verified
- [x] README scalability section updated after results exist

Exit criteria:
- Scalability is no longer a claim; it is documented evidence.

### Phase D — Expo Web Official Deliverable

- [x] Review native-only modules for browser-safe fallbacks before publishing:
  - push notifications
  - camera/image picker
  - document picker / file handling
- [x] Add explicit Expo web export configuration if still missing.
- [x] Run:
  - `cd apps/mobile`
  - `npx expo export --platform web --output-dir dist`
- [x] Deploy `apps/mobile/dist` as a static site.
- [x] Record the public Expo web URL.
- [x] Smoke test:
  - login
  - Google login
  - courses
  - community
  - messages inbox
  - profile/logout
- [x] Add Expo web URL to README `Live Demo`.
- [x] Update release docs so Expo web is not described as fallback-only anymore.

Current public Expo web URL:
- `https://studyhub-mobile-mariva.netlify.app`

For Expo web Google login, the Web OAuth client must also allow:
- JavaScript origin `https://studyhub-mobile-mariva.netlify.app`
- Redirect URI `https://studyhub-mobile-mariva.netlify.app/login`

Exit criteria:
- The assignment has two public live URLs: web and Expo web.

### Phase E — Native Mobile / APK Deliverable

#### E1. Pre-build setup

- [x] Align version metadata if needed:
  - `apps/mobile/app.json`
  - `apps/mobile/package.json`
- [x] Confirm `EXPO_PUBLIC_API_URL` points to production.
- [ ] Confirm Google OAuth production setup:
  - consent screen `Published`
  - standalone/native Android auth lets the Expo Google provider use its package-based redirect `com.studyhub.mobile:/oauthredirect`
  - Android app config explicitly registers `android.scheme: "com.studyhub.mobile"` in addition to the user-facing `studyhubv2` scheme so the APK can receive that redirect
  - Expo Router rewrites native `/oauthredirect` callbacks to `/login` through `app/+native-intent.tsx` so the OAuth callback is not rendered as a user-facing route
  - Expo web origin and `/login` redirect URI present
  - correct Web OAuth client ID
  - [x] Android OAuth client present for `com.studyhub.mobile` and the EAS signing-certificate SHA-1
    - confirmed EAS preview signing SHA-1: `A5:30:BD:22:16:20:E3:67:B4:26:00:A7:59:ED:9A:9F:30:CB:87:68`
    - Android client ID updated to the EAS-release client ending in `4j36bet048rhn7pdhrfuvtsu1migbbcl`
  - iOS OAuth client present for bundle ID `com.studyhub.mobile`
- [x] Confirm EAS env vars:
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - optional `EXPO_PUBLIC_SENTRY_DSN`
- [x] Confirm Android push prerequisites before the next APK rebuild:
  - [x] Firebase Android app registered for package `com.studyhub.mobile`
  - [x] `apps/mobile/google-services.json` present
  - [x] `apps/mobile/app.json` declares `android.googleServicesFile: "./google-services.json"`
  - [x] FCM V1 service-account key attached in EAS Credentials for the Android app identifier
- [x] Confirm `SENTRY_AUTH_TOKEN` only if source maps are desired; preview APK build intentionally disables Sentry auto-upload instead.

#### E2. Build and artifact

- [x] `cd apps/mobile`
- [x] `eas whoami`
- [x] `eas build --platform android --profile preview`
- [x] If rebuilding after fixes, increment Android `versionCode`.
- [x] Download APK from EAS.
- [x] Create GitHub Release and upload APK.
- [x] Add APK link to README.

#### E3. Physical-device validation

- [x] Install APK on a real Android phone.
- [x] Login/register against production backend.
- [x] Google login on device.
- [x] Avatar upload.
- [x] Material upload/download.
- [x] Community post create/like/bookmark.
- [x] Run `SMK-21`, `SMK-22`, `SMK-23` with two accounts after the Firebase/FCM-enabled APK registers a fresh native push token.
- [x] Re-test notification deep-link back navigation after the local replacement-navigation fix lands in the next rebuilt APK.
- [x] Update:
  - `docs/mobile-smoke-test-matrix.md`
  - `docs/mobile-release-checklist.md`
  - `docs/dev-log.md`

Exit criteria:
- APK is real, downloadable, tested, and documented.

### Phase F — Release Documentation and Repo Finalization

#### F1. README final pass

- [x] Add Expo web live URL.
- [x] Add APK release link in the README `Releases` section.
- [x] Update commits badge.
- [x] Mark Phase 10 `Done` only when all release deliverables are complete.
- [x] Replace old 150-post load-test section with official 10k+ validation results.
- [x] Document the final deployment package:
  - web URL
  - Expo web URL
  - APK link
- [ ] Add or refresh known limitations only if still true.

#### F2. Supporting docs

- [x] Update `docs/implementation-plan.md` final statuses if needed.
- [x] Update `docs/mobile-release-checklist.md`.
- [x] Update `docs/mobile-smoke-test-matrix.md`.
- [x] Keep `docs/security-release-readiness.md` aligned with final release metadata.
- [x] Update `AGENTS.md` counts/status only if shipped scope changes.

#### F3. Final repo hygiene

- [ ] `git status` review.
- [ ] `git diff` review.
- [ ] Verify no secrets, logs, or scratch artifacts are staged.
- [ ] After the final secret/artifact review, make the GitHub repository public so the examiners can inspect it.
- [ ] Run:
  - `npm run check:mojibake`
  - `npm run typecheck`
  - `npm run build:web`
  - `npm run deps:audit:runtime`
- [ ] Confirm live web health endpoint.
- [ ] Confirm live security headers remain present.
- [ ] Review final release notes / demo notes.

Exit criteria:
- The repository tells the exact truth about the delivered project.

### Phase G — Demo Readiness and Freeze

Before freeze:

- [ ] Create/verify demo credentials.
- [ ] Ensure demo user has useful content.
- [ ] Rehearse student, mentor, admin, mobile, and scalability demo paths.
- [ ] Check Neon usage after final validation.
- [ ] Check Vercel logs, Sentry, and storage usage.

Freeze rule:

- From `2026-05-25 16:00` onward:
  - bugfixes only
  - no schema changes
  - no env rotations
  - no dependency upgrades
  - no optional refactors

Exit criteria:
- Nothing important depends on memory, luck, or a single agent session.

## Optional Tail After Mandatory Work

### Contact Server Action experiment

Only after Phases B through F are complete:

- [ ] Create separate Git branch, e.g. `experiment/contact-server-action`.
- [ ] Keep the change contact-only.
- [ ] Reuse the existing SMTP helper.
- [ ] Do not weaken rate limiting.
- [ ] Run local + build + real email verification.
- [ ] Merge only if it remains low-risk and clearly useful for defense.

### GitHub Actions

- [ ] Optional workflow for typecheck/tests on push.
- [ ] Do only if required work is green and schedule still has room.

### Automated backups

- [ ] Explicitly post-defense unless the instructor requests them.

### Messaging polish

- [ ] Add owner-only message deletion with a clear deleted-state treatment.
- [ ] Add owner-only message editing with an `edited` indicator.
- [ ] Wire the message actions end-to-end across API, realtime updates, web, and mobile before considering them shipped.
- [ ] Fix the mobile empty-thread composer layout so the input stays above the keyboard even before the first message is sent.

## Session Handoff Template
At the end of every session, append to `docs/dev-log.md`:

1. what changed
2. files touched
3. verification run
4. decisions made
5. next exact step

For a new chat, use:

> Read `docs/dev-log.md`, `docs/final-release-master-plan.md`, `docs/implementation-plan.md`, `docs/performance-guardrails.md`, `docs/mobile-release-checklist.md`, and `docs/mobile-smoke-test-matrix.md`, then continue from the first unchecked mandatory item in the master plan.
