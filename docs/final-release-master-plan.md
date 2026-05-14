# StudyHub v2 — Final Release Master Plan

Last updated: 2026-05-16  
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
- Production Drizzle migrations are applied.
- Security audit is complete.
- Web production smoke passed for auth, OAuth, Blob, AI, community, admin, password reset, and headers.
- Core mobile scope is implemented.
- Mobile smoke rows `SMK-01` through `SMK-20` are `PASS`.
- README, architecture diagrams, API docs, AGENTS, and repo hygiene had a strong pre-deploy pass.

### Still open
- Final-assignment scalability proof:
  - true server-side pagination on remaining large admin collections
  - official 10k+ stress validation dataset and results
- Official Expo web deployment and URL.
- Android APK build, device validation, GitHub Release upload, and README link.
- Physical-device message push validation:
  - `SMK-21`
  - `SMK-22`
  - `SMK-23`
- Final README/release docs update after all live URLs and artifact links exist.
- Final release review, tag/release hygiene, and demo-freeze checks.

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

- [ ] `modules.course_id`
- [ ] `modules.created_by`
- [ ] `materials.module_id`
- [ ] `materials.created_by`
- [ ] `comments.post_id`
- [ ] `course_members.user_id`
- [ ] `activity_logs.created_at`

Measurement rule:

- [ ] Run `EXPLAIN ANALYZE` on real stress-branch queries before adding workload-specific indexes.
- [ ] Do not add speculative indexes only for appearance.

Verification for Phase B:

- [ ] `npm run typecheck`
- [ ] relevant tests for changed routes/components
- [ ] `npm run build:web`
- [ ] `npm run check:mojibake`

Exit criteria:
- Large admin surfaces are truly server-paginated before stress data exists.

### Phase C — Stress Dataset and Validation

#### C1. Create stress tooling

- [ ] Add `drizzle/seed-stress.ts`.
- [ ] Add root script `db:seed:stress`.
- [ ] Require `ALLOW_STRESS_SEED=true`.
- [ ] Use deterministic synthetic data.
- [ ] Use stable prefixes such as `stress-...`.
- [ ] Insert in batches:
  - users: `500`
  - other large tables: `1,000`
- [ ] Reuse one precomputed password hash for synthetic users.
- [ ] Print final count summary.
- [ ] Keep the normal demo seed untouched.

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

- [ ] Check the actual Neon quota in the console.
- [ ] Create Neon branch `stress-test` from `studyhub` production.
- [ ] Confirm the connection string points to the branch, not production.
- [ ] Run a small dry run first.
- [ ] Verify FK integrity and UI behavior on the dry run.
- [ ] Run the full stress seed on the branch only.
- [ ] Record dataset counts and warm-response timings.
- [ ] Delete the branch after evidence is captured and no longer needed.

#### C4. Official validation surfaces
API checks:

- [ ] `/api/posts?page=1`
- [ ] `/api/posts?page=50`
- [ ] `/api/posts?page=1&type=question`
- [ ] `/api/admin/users?page=1&limit=50`
- [ ] `/api/admin/materials?page=1&limit=50`
- [ ] `/api/admin/materials?page=200&limit=50`
- [ ] `/api/admin/activity-logs?page=1&limit=50`

UI checks:

- [ ] `/community`
- [ ] `/admin` Users tab
- [ ] `/admin` Materials tab
- [ ] `/dashboard/material-finder`

Capture:

- [ ] exact seeded counts
- [ ] screenshots or short screen recording
- [ ] timings
- [ ] index changes justified by measured plans
- [ ] note that validation ran on a Neon branch, not production

Verification for Phase C:

- [ ] stress script dry-run success
- [ ] full branch seed success
- [ ] paginated UI behavior verified
- [ ] README scalability section updated after results exist

Exit criteria:
- Scalability is no longer a claim; it is documented evidence.

### Phase D — Expo Web Official Deliverable

- [ ] Review native-only modules for browser-safe fallbacks before publishing:
  - push notifications
  - camera/image picker
  - document picker / file handling
- [ ] Add explicit Expo web export configuration if still missing.
- [ ] Run:
  - `cd apps/mobile`
  - `npx expo export --platform web --output-dir dist`
- [ ] Deploy `apps/mobile/dist` as a static site.
- [ ] Record the public Expo web URL.
- [ ] Smoke test:
  - login
  - courses
  - community
  - messages inbox
  - profile/logout
- [ ] Add Expo web URL to README `Live Demo`.
- [ ] Update release docs so Expo web is not described as fallback-only anymore.

Exit criteria:
- The assignment has two public live URLs: web and Expo web.

### Phase E — Native Mobile / APK Deliverable

#### E1. Pre-build setup

- [ ] Align version metadata if needed:
  - `apps/mobile/app.json`
  - `apps/mobile/package.json`
- [ ] Confirm `EXPO_PUBLIC_API_URL` points to production.
- [ ] Confirm Google OAuth production setup:
  - consent screen `Published`
  - Expo redirect URI present
  - correct Web OAuth client ID
- [ ] Confirm EAS env vars:
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
  - optional `EXPO_PUBLIC_SENTRY_DSN`
- [ ] Confirm `SENTRY_AUTH_TOKEN` only if source maps are desired.

#### E2. Build and artifact

- [ ] `cd apps/mobile`
- [ ] `eas whoami`
- [ ] `eas build --platform android --profile preview`
- [ ] If rebuilding after fixes, increment Android `versionCode`.
- [ ] Download APK from EAS.
- [ ] Create GitHub Release and upload APK.
- [ ] Add APK link to README.

#### E3. Physical-device validation

- [ ] Install APK on a real Android phone.
- [ ] Login/register against production backend.
- [ ] Google login on device.
- [ ] Avatar upload.
- [ ] Material upload/download.
- [ ] Community post create/like/bookmark.
- [ ] Run `SMK-21`, `SMK-22`, `SMK-23` with two accounts.
- [ ] Update:
  - `docs/mobile-smoke-test-matrix.md`
  - `docs/mobile-release-checklist.md`
  - `docs/dev-log.md`

Exit criteria:
- APK is real, downloadable, tested, and documented.

### Phase F — Release Documentation and Repo Finalization

#### F1. README final pass

- [ ] Add Expo web live URL.
- [ ] Add APK release link.
- [ ] Update commits badge.
- [ ] Mark Phase 10 `Done` only when all release deliverables are complete.
- [ ] Replace old 150-post load-test section with official 10k+ validation results.
- [ ] Document the final deployment package:
  - web URL
  - Expo web URL
  - APK link
- [ ] Add or refresh known limitations only if still true.

#### F2. Supporting docs

- [ ] Update `docs/implementation-plan.md` final statuses if needed.
- [ ] Update `docs/mobile-release-checklist.md`.
- [ ] Update `docs/mobile-smoke-test-matrix.md`.
- [ ] Keep `docs/security-release-readiness.md` aligned with final release metadata.
- [ ] Update `AGENTS.md` counts/status only if shipped scope changes.

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

## Session Handoff Template
At the end of every session, append to `docs/dev-log.md`:

1. what changed
2. files touched
3. verification run
4. decisions made
5. next exact step

For a new chat, use:

> Read `docs/dev-log.md`, `docs/final-release-master-plan.md`, `docs/implementation-plan.md`, `docs/performance-guardrails.md`, `docs/mobile-release-checklist.md`, and `docs/mobile-smoke-test-matrix.md`, then continue from the first unchecked mandatory item in the master plan.
