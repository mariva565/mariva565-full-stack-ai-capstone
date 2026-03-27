# Capstone Foundation Playbook (Internal Brainstorm)

> Archive note (2026-03-27):
> This file is kept for historical brainstorming only.
> Active execution plan is docs/implementation-plan.md.
> Do not copy legacy Vanilla JS code; use this document only for ideas and checklists.

## 1) Purpose
This file is a single source of truth for early brainstorming and fast project setup.
Goals:
- maximize reuse from StudyHub
- avoid workshop overlap (taskboard/slack-like)
- enforce non-monolithic architecture from day 1
- plan a visible product + visual + backend transformation
- enforce mobile + desktop parity from day 1 (not a late polish task)
- enforce light + dark mode parity from day 1
- treat security baseline checks as release blockers

## 2) Idea Pool

### 2.1 First 3 ideas (kept)
1. Project Ops Hub
2. Client Portal for a small agency
3. Startup Knowledge & SOP Hub

### 2.2 Additional 3 ideas (kept)
1. Client Delivery Vault
2. Interview Prep Hub
3. Research & Paper Organizer

### 2.3 Extra ideas for backup
1. Freelancer Project Dossier
2. Coaching Program Workspace
3. Grant Writing Organizer
4. University Thesis Companion
5. Compliance & Policy Hub
6. Internal Onboarding Academy

## 3) Suggested Winner Matrix
Use this matrix when final capstone requirements are published.

| Idea | Reuse Potential | Visual Rebrand Potential | Backend Complexity | Demo Impact | Notes |
| --- | --- | --- | --- | --- | --- |
| Client Delivery Vault | High | High | Medium | High | Strong fit for file sharing + progress |
| Interview Prep Hub | High | Medium | Low-Medium | High | Natural fit for AI helpers |
| Research & Paper Organizer | Medium-High | High | Medium | Medium-High | Strong PDF/DOCX workflow story |
| SOP Hub | Very High | Medium | Low-Medium | Medium | Easy adaptation but close to current structure |

## 4) Non-Overlap Guard (avoid workshop similarity)
Do NOT prioritize:
- chat-first UI as core identity
- kanban-first workflow as core identity
- slack-like naming, channels, message stream as main feature

Prefer:
- structured repository of assets/knowledge/work items
- document + file + workflow lifecycle
- progress, review, audit, approvals

## 5) Reuse Inventory from StudyHub

### 5.1 Reuse almost 1:1
- layout scaffolding, forms, cards, tables, modal patterns
- notification system and confirmation flows
- utility helpers (formatting, extraction, local AI rules)
- test setup (vitest + playwright smoke)

### 5.2 Reuse with adaptation
- page orchestration modules
- service contracts (method shapes)
- admin flows and activity-feed UX

### 5.3 Rewrite required
- supabase-specific client integrations
- auth/session strategy
- backend-specific migrations/functions

## 6) UI Rebrand Checklist (mandatory)
1. Rename product, tagline, and all domain wording.
2. Replace hero section composition and layout.
3. Replace mascot/robot visual language and all related assets.
4. Replace icon family and illustration style.
5. Replace color system (primary/secondary/surface/accent tokens).
6. Replace typography system (headings/body scale).
7. Replace key page compositions (dashboard, details, list pages).
8. Replace onboarding and "How it works" narrative.
9. Replace screenshots/video/README marketing sections.
10. Ensure no "StudyHub" string remains in UI copy.

### 6.1 UX Parity Non-Negotiables (learned from past delays)
- Every feature is built and validated on both mobile and desktop during implementation, not postponed.
- Every feature is validated in both light and dark mode before being marked done.
- PR is not "done" if one form factor or one theme regresses.
- Keep a small responsive matrix per page (mobile, tablet, desktop) and check it weekly.

## 7) Feature Bank (Brainstorm)

### 7.1 Must-Have (MVP)
- auth + role-based access
- core domain hierarchy (3 levels)
- create/edit/delete for core items
- file upload + safe preview/download
- search + tag filters
- activity log
- profile settings
- progress tracking (new mandatory value)

### 7.2 Should-Have (strong capstone value)
- sharing with permissions (view-only/editor)
- status workflow (draft/in review/approved)
- due dates + reminders
- dashboard KPIs and trends
- export (PDF/CSV where relevant)

### 7.3 Could-Have (if time allows)
- templates and preset structures
- duplicate/clone flows
- bulk actions
- archiving lifecycle
- lightweight notifications center

## 8) New Core Feature: Progress Module

### 8.1 Product definition
Track progress per item and aggregate it at collection and dashboard levels.

### 8.2 Generic data model
- `progress_items`:
  - id
  - owner_id
  - entity_type
  - entity_id
  - status: not_started | in_progress | completed
  - progress_percent: 0..100
  - started_at
  - completed_at
  - updated_at
- `progress_snapshots` (optional):
  - id
  - owner_id
  - snapshot_date
  - overall_percent

### 8.3 UI placements
- dashboard summary cards
- mini progress bar on list cards
- detail page timeline
- admin aggregate panel

### 8.4 KPI set
- overall completion %
- completed this week
- avg time to complete item
- in-progress count
- overdue count (if due dates are enabled)

## 9) Architecture Blueprint (anti-monolith)

### 9.1 Guardrails
- no page-level god files
- hard warning over 250-300 lines per module
- hard warning over 40-60 lines per function
- no direct API calls from renderers
- strict separation: UI -> use-case -> service -> transport

### 9.2 Suggested structure
- `src/features/<feature>/components`
- `src/features/<feature>/pages`
- `src/features/<feature>/use-cases`
- `src/features/<feature>/services`
- `src/features/<feature>/state`
- `src/shared/ui`
- `src/shared/utils`
- `src/shared/api`

### 9.3 Refactor protocol if growth becomes monolithic
1. split handlers by use-case
2. isolate transport/API code
3. isolate rendering helpers
4. isolate state/selectors
5. add targeted unit/smoke tests before and after split

## 10) Backend Migration Strategy
1. Keep service method signatures as stable contracts.
2. Replace implementation behind adapters.
3. Introduce `apiClient` abstraction once.
4. Standardize error shape (`code`, `message`, `meta`).
5. Keep optimistic UI and toasts unchanged where possible.

## 11) Example Contract Templates

### 11.1 Service contract example
```ts
interface EntityService {
  list(params): Promise<{ data: Entity[]; error: AppError | null }>;
  getById(id: string): Promise<{ data: Entity | null; error: AppError | null }>;
  create(payload): Promise<{ data: Entity | null; error: AppError | null }>;
  update(id: string, payload): Promise<{ data: Entity | null; error: AppError | null }>;
  remove(id: string): Promise<{ error: AppError | null }>;
}
```

### 11.2 Error contract
```ts
type AppError = {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
};
```

## 12) Testing Plan

### 12.1 Minimum required
- unit tests for utility and pure logic modules
- smoke e2e for public pages + one key protected flow
- one integration-like test for progress update flow

### 12.2 Quality gates
- no critical flow without at least one automated test
- no merge of major feature without smoke pass
- no release build with known regression in core path

### 12.3 Critical Auth and Security Gates (non-negotiable)
- New user registration must work in every public environment before demo/jury (production and preview URLs).
- Hardcoded demo/test profiles and email-based role bypass are forbidden in runtime code.
- Release is blocked if registration fails for a new email in any live environment.

Ready automated check (local + CI):
```bash
npm run check:hardcoded-auth
```

This command scans `src/**` and `supabase/functions/**` for risky patterns such as:
- `admin@test.com`
- `student@studyhub.demo`
- `Demo Accounts`
- `DEV_USER`, `TEST_USER`, `DEFAULT_USER`, `MOCK_USER`, `SEED_USER`
- `user.email === '...'` bypass checks

### 12.4 Manual Smoke Check for Registration (must pass)
1. Open `/register.html` on each live domain (for example Netlify and Vercel).
2. Register with a brand-new email and valid password.
3. Expect success feedback and redirect according to the app flow.
4. Verify the user exists in `auth.users` and has synced app profile/role records.
5. If any environment fails, release is blocked until fixed.

### 12.5 Responsive + Theme Gates (non-negotiable)
- Validate key flows on mobile and desktop before each release candidate.
- Validate key flows in both light and dark mode before each release candidate.
- Block release if critical pages are unusable in any required viewport/theme.
- Keep regression checks for: layout breaks, hidden controls, contrast/readability, modal usability.

### 12.6 Security Baseline Gates (carry-over from StudyHub hardening)
- Sanitize rich HTML content and escape user-provided render data.
- Allow only safe URL protocols in user-facing links (`http/https` by default).
- Enforce auth/authz and strict payload validation in edge/backend functions.
- Enforce strong password policy consistently in UI and backend validation.
- Enforce deploy security headers (frame, sniffing, referrer, HSTS, permissions policies).
- Keep templates CSP-ready from day 1:
  - no inline `<script>` blocks in HTML templates
  - no inline event handlers (`on*=`) in HTML
  - no inline `style="..."` attributes in HTML
- Prefer class/data-attribute state for UI toggles (show/hide/active/loading) instead of runtime `.style`/`cssText`.
- Allow runtime computed styles only for truly dynamic values (drag/drop, geometry, pointer-driven transforms), and isolate them in small dedicated modules.
- Add automated guardrails early:
  - HTML readiness test for inline script/event/style patterns
  - runtime style-blocker audit (`style=`, `.style`, `cssText`, `setAttribute('style', ...)`)
  - animation/interaction smoke (`tests/smoke/animation-regression.spec.js`) after major UI/CSP slices
- Release is blocked if any critical security gate fails.
- Reference docs for implementation detail:
  - `docs/security-playbook-bg.md`
  - `docs/security-hardening-log-2026-03-18.md`
  - `docs/definition-of-done.md`

## 13) Demo Strategy for Jury
1. 60-second product intro with problem framing.
2. Fast role-based login and dashboard walkthrough.
3. End-to-end create/edit/share/progress scenario.
4. Show activity logs and admin controls.
5. Show tests and architecture choices (anti-monolith).
6. Close with "what is reused vs what is new".

## 14) Originality Checklist
- new repository
- new domain terms
- new branding and visuals
- new backend implementation
- at least 2-3 new features (progress mandatory)
- explicit architecture note: reused modules vs new modules

## 15) Delivery Timeline Template (6-week example)
Week 1: decision, domain model, architecture setup, base scaffold
Week 2: auth, core entities, first CRUD vertical slice
Week 3: file handling, sharing, dashboard baseline
Week 4: progress module, analytics cards, admin refinements
Week 5: polish, test hardening, bug bash, UX cleanup
Week 6: demo script, documentation, final rehearsal

## 16) Risks and Mitigation
- Scope creep -> freeze MVP by end of week 1
- Monolithic growth -> enforce module/function limits weekly
- Backend uncertainty -> adapter-first service layer
- Visual similarity to old project -> rebrand checklist mandatory
- Late regressions -> smoke suite on every major branch update

## 17) Open Questions (resolved after official assignment)
Status date: 2026-03-26

1. Backend stack is mandatory: Next.js + PostgreSQL (Neon) + Drizzle ORM.
2. Architecture is mandatory: Node.js monorepo with Next.js app + Expo mobile app, client-server over REST API.
3. Mandatory scope includes:
   - JWT auth (register/login/logout)
   - roles (normal/admin)
   - admin panel or equivalent privileged workflow
   - minimum 4 DB tables
   - minimum 5 web screens
   - minimum 3 mobile screens
4. Deployment is mandatory: live Internet URL required.
5. Documentation is mandatory: architecture, DB schema, setup, key folders/files, project description.
6. Repo activity is graded explicitly: at least 15 commits across at least 3 days.

## 18) Decision Log (live)
- [x] Backend stack confirmed from assignment brief.
- [x] Monorepo architecture confirmed from assignment brief.
- [ ] Final primary idea (recommended: Task/Study Planner).
- [ ] Backup idea.
- [ ] MVP feature freeze based on rubric-driven minimum scope.
- [ ] Demo flow freeze (user + admin + mobile flow).
- [ ] Live deployment URL recorded.
- [ ] Demo credentials recorded.

## 19) Immediate Next Action
Convert this document from generic brainstorm to rubric-driven execution:
1. Lock final idea + backup idea.
2. Freeze MVP strictly by official scoring criteria.
3. Create repo/day-by-day commit plan (15+ commits over 3+ days).
4. Start implementation in a new repository root with `legacy-reference/` docs only (no direct legacy code copy).
## 20) File-by-File Migration Checklist (Legacy Optional Path: Client Delivery Vault)

Important note (2026-03-26):
- This section describes an older migration-first strategy and is now **optional/legacy**.
- For the official "Full Stack Apps with AI" assignment, default execution path is section 23 (rubric alignment) plus the new monorepo kickoff plan.
- Use section 20 only if we explicitly choose a migration-heavy approach for a specific module.

### 20.1 Domain rename map
- `courses` -> `clients`
- `modules` -> `campaigns`
- `materials` -> `deliverables`
- `shared_notes` -> `shared_deliverables`
- `activity_logs` -> `activity_logs` (keep)
- `system_settings` -> `system_settings` (keep)

### 20.2 Phase A: Copy as-is (high confidence reuse)
- [ ] Copy `src/styles/**` -> `src/shared/styles/**`
- [ ] Copy `src/components/Spinner.js` -> `src/shared/ui/Spinner.js`
- [ ] Copy `src/utils/notifications.js` -> `src/shared/ui/notifications.js`
- [ ] Copy `src/utils/formatters.js` -> `src/shared/utils/formatters.js`
- [ ] Copy `src/utils/fileExtractor.js` -> `src/shared/utils/fileExtractor.js`
- [ ] Copy `src/utils/localAi.js` -> `src/shared/utils/localAi.js`
- [ ] Copy `src/utils/formatters.test.js` -> `src/shared/utils/formatters.test.js`
- [ ] Copy `tests/smoke/public-pages.spec.js` as smoke-test baseline and adapt selectors later

### 20.3 Phase B: Rename and adapt UI/domain language
- [ ] `src/pages/courses/*` -> `src/features/clients/pages/*`
- [ ] `src/pages/modules/*` -> `src/features/campaigns/pages/*`
- [ ] `src/pages/materials/*` -> `src/features/deliverables/pages/*`
- [ ] `src/pages/material-edit/*` -> `src/features/deliverables-editor/pages/*`
- [ ] Update labels in UI copy: `Course/Module/Material` -> `Client/Campaign/Deliverable`
- [ ] Rework hero sections and remove mascot/robot visuals
- [ ] Replace legacy screenshots/assets in `src/assets/**` and `public/**`

### 20.4 Phase C: Rewrite backend integration only
- [ ] Replace `src/services/supabaseClient.js` with `src/shared/api/apiClient.ts|js`
- [ ] Rewrite `src/services/authService.js` to new auth backend
- [ ] Rewrite `src/services/coursesService.js` -> `clientsService`
- [ ] Rewrite `src/services/modulesService.js` -> `campaignsService`
- [ ] Rewrite `src/services/materialsService.js` -> `deliverablesService`
- [ ] Rewrite `src/services/sharedNotesService.js` -> `sharedDeliverablesService`
- [ ] Rewrite `src/services/storageService.js` for new storage provider
- [ ] Rewrite `src/services/activityService.js` transport (keep event model)
- [ ] Rewrite `src/services/settingsService.js` transport
- [ ] Rewrite `src/pages/admin/adminService.js` transport calls

### 20.5 Phase D: Add new Progress feature (mandatory)
- [ ] Add `src/features/progress/services/progressService.ts|js`
- [ ] Add `src/features/progress/components/ProgressBadge.*`
- [ ] Add `src/features/progress/components/ProgressBar.*`
- [ ] Add dashboard progress cards in `src/features/dashboard/*`
- [ ] Add progress update actions in deliverable details flow
- [ ] Add tests for progress calculations and one e2e smoke path

### 20.6 Phase E: Anti-monolith enforcement tasks
- [ ] Split any module above 300 lines before merge
- [ ] Split any function above 60 lines before merge
- [ ] Keep API calls out of renderer files
- [ ] Add one test whenever a module is split/refactored

### 20.7 Phase F: Documentation and demo
- [ ] Create `docs/reused-vs-new.md`
- [ ] Create `docs/architecture.md`
- [ ] Update `README.md` with new brand/domain screenshots
- [ ] Prepare 5-minute demo script with one end-to-end progress scenario

### 20.8 Phase G: UX + Security Baseline (from week 1)
- [ ] Define required responsive matrix per key page (mobile/tablet/desktop).
- [ ] Define required theme matrix per key page (light/dark).
- [ ] Add "not done until both themes + form factors pass" to team definition of done.
- [ ] Port/implement rich-content sanitization and safe URL rendering utilities early.
- [ ] Port/implement unified strong password policy helper early.
- [ ] Configure security headers in hosting config before first public preview.
- [ ] Add a short security smoke checklist to PR/release template.
- [ ] Add CSP-ready template rule: no inline `<script>`, `on*=`, or `style=` in HTML from the first feature slice.
- [ ] Model UI state with CSS classes/data attributes first; avoid `.style`/`cssText` for simple toggles.
- [ ] Add early blocker audit script/check for runtime style mutations and track counts weekly.
- [ ] Add/keep animation-interaction regression smoke (`tests/smoke/animation-regression.spec.js`) for key public pages.

## 21) Backup Fast-Switch Mapping (Interview Prep Hub)
If capstone rules or team preference require fast pivot:
- `clients` -> `tracks`
- `campaigns` -> `topics`
- `deliverables` -> `resources/questions/notes`
- Keep the same technical migration checklist from section 20 (only domain naming and copy change).

## 22) Week-1 Practical Deliverables
- [ ] Decide primary + backup idea
- [ ] Initialize new repo with feature-first structure
- [ ] Import Phase A modules (copy as-is)
- [ ] Complete Phase B naming + UI copy replacement
- [ ] Implement first rewritten service (auth or clients)
- [ ] Ship one vertical slice: login -> list -> create -> progress update
- [ ] Freeze responsive + theme baseline rules (mobile/desktop + light/dark) in writing
- [ ] Freeze security baseline gates in writing and wire them into review flow

## 23) Official Assignment Alignment Matrix (2026-03-26)
Use this section as the main scoring tracker during implementation.

| Criterion | Required | Planned Evidence |
|---|---|---|
| GitHub Commits | >=15 commits | Commit log with small vertical slices |
| GitHub Commit Days | >=3 days | Commits distributed across at least 3 dates |
| Architecture | Monorepo: Next.js + Expo + REST | `apps/web`, `apps/mobile`, shared packages, API routes |
| Backend API | Auth + functional endpoints | Register/login/logout + entity CRUD + admin endpoints |
| Database | >=4 tables + ORM + migrations | Drizzle schema + SQL migrations committed |
| Auth and Security | Server-side permission checks | JWT middleware + role guards + validation |
| Web App Screens | >=5 responsive screens | Auth pages + dashboard + CRUD + admin page |
| Admin Panel | Privileged user workflow | Web admin screen and restricted actions |
| Mobile App | >=3 screens with API integration | Login + list + details/create in Expo app |
| Deployment | Live and working URL | Vercel/Netlify URL in README |
| Documentation | Complete repo docs | Project description, architecture, DB diagram, setup, key folders |

### 23.1 Non-negotiable implementation guardrails
- Build MVP to satisfy all minimum rubric constraints first.
- No feature is considered done without server-side auth checks.
- Every DB schema change must ship with a Drizzle migration.
- Keep documentation updated in the same day as technical changes.
- Track score impact per commit in PR notes or commit message body.

