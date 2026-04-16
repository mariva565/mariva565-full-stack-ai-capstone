# AGENTS.md — AI Agent Instructions

## Project Overview

**StudyHub v2** — A full-stack Learning Management System (LMS) for organizing study materials.
This is a capstone project for the SoftUni "Full Stack Apps with AI" course.

It is a rewrite of a previous project (StudyHub v1, Vanilla JS + Supabase) using a completely new tech stack.
The old project is at `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\` and should be used **only as a visual/logical reference** — no code should be copied.

## Tech Stack (mandatory)

- **Frontend Web:** Next.js + React + TypeScript + Tailwind CSS + Framer Motion
- **Backend API:** Next.js API Routes (RESTful)
- **Database:** Neon serverless PostgreSQL + Drizzle ORM
- **Auth:** JWT tokens (register, login, logout) + Google OAuth + roles (user, mentor, admin)
- **Mobile:** React Native + Expo + TanStack React Query
- **AI:** Google Gemini API (chat, summarize, quiz generation)
- **Realtime & Notifications:** Pusher (web realtime), Browser Notification API, Expo notifications + Expo push tokens
- **3D/Visuals:** Three.js (landing page scenes)
- **Storage:** Cloudflare R2 (optional, for file uploads)
- **Deploy:** Vercel or Netlify

## Architecture

Monorepo with two apps communicating via REST API:

```
capstone/
├── apps/
│   ├── web/                          ← Next.js (backend API + web client)
│   │   ├── app/
│   │   │   ├── api/                  ← auth/content/admin/social/messaging routes
│   │   │   ├── register/ login/ dashboard/
│   │   │   ├── courses/[id]/ modules/[id]/ materials/[id]/
│   │   │   ├── community/ mentor-inbox/ messages/
│   │   │   ├── calendar/ progress/ profile/ admin/ moderation/
│   │   │   ├── how-it-works/ contact/ forbidden/
│   │   │   └── page.tsx              ← landing `/`
│   │   ├── components/               ← UI components (by page + shared ui/)
│   │   ├── lib/                      ← auth/db/ai/realtime/notifications helpers
│   │   └── middleware.ts
│   └── mobile/                       ← Expo (React Native mobile client)
│       ├── app/
│       │   ├── (tabs)/               ← courses/community/favorites/profile
│       │   ├── login.tsx register.tsx settings.tsx
│       │   ├── course/[id]/ module/[id]/ material/[id]/
│       │   ├── community/[id].tsx community/new.tsx
│       │   └── messages/index.tsx messages/[id].tsx
│       └── lib/                      ← auth/api/query/toast/push hooks
├── packages/
│   └── shared/                       ← Shared types, utils, API client
├── drizzle/                          ← DB schema + migrations
├── docs/                             ← Documentation
├── AGENTS.md                         ← This file
└── README.md
```

## Database Tables (19 tables, Drizzle ORM)

- **users** — id, email, name, password_hash, role (user/mentor/admin), avatar_url, blocked, created_at
- **courses** — id, title, description, created_by (FK→users), is_public, status, created_at
- **modules** — id, course_id (FK→courses), title, description, order_index, created_by (FK→users)
- **materials** — id, module_id (FK→modules), title, content, material_type, file_url, tags, created_by (FK→users), created_at
- **favorites** — id, user_id (FK→users), material_id (FK→materials), created_at
- **ai_tool_outputs** — id, user_id (FK→users), material_id (FK→materials), tool, data (JSON), created_at
- **milestones** — id, user_id (FK→users), title, description, status, due_date, completed_at, order_index, created_at
- **events** — id, user_id (FK→users), title, description, date, type, color, course_id (FK→courses), milestone_id (FK→milestones), created_at
- **activity_logs** — id, user_id (FK→users), action_type, target_id, details (JSON), created_at
- **oauth_accounts** — id, user_id (FK→users), provider, provider_user_id, provider_email, created_at
- **course_members** — id, course_id (FK→courses), user_id (FK→users), role, joined_at
- **posts** — id, author_id (FK→users), title, content, post_type, status, course_id (FK→courses), is_pinned, question_status, created_at, updated_at
- **comments** — id, post_id (FK→posts), author_id (FK→users), content, created_at
- **post_likes** — id, post_id (FK→posts), user_id (FK→users), created_at
- **post_bookmarks** — id, post_id (FK→posts), user_id (FK→users), created_at
- **conversations** — id, created_at
- **conversation_members** — id, conversation_id (FK→conversations), user_id (FK→users), joined_at, last_read_at
- **messages** — id, conversation_id (FK→conversations), sender_id (FK→users), content, created_at
- **user_push_tokens** — id, user_id (FK→users), token, platform, app_ownership, is_active, created_at, updated_at, last_seen_at

Every schema change MUST use Drizzle migrations. Migration SQL scripts must be committed.

## Web Screens (23 screens, responsive)

| # | Screen | Path | Access |
|---|---|---|---|
| 1 | Landing Page | `/` | public (guest + authenticated) |
| 2 | How It Works | `/how-it-works` | public |
| 3 | Contact | `/contact` | public |
| 4 | Register | `/register` | public |
| 5 | Login | `/login` | public |
| 6 | Dashboard | `/dashboard` | login |
| 7 | Course Details | `/courses/[id]` | login |
| 8 | Module Workspace | `/modules/[id]` | login |
| 9 | Material View/Edit | `/materials/[id]` | login |
| 10 | Profile | `/profile` | login |
| 11 | Public Profile | `/profile/[id]` | login |
| 12 | Progress | `/progress` | login |
| 13 | Calendar | `/calendar` | login |
| 14 | Admin Panel | `/admin` | admin |
| 15 | Moderation Queue | `/moderation` | admin |
| 16 | Forbidden (403) | `/forbidden` | public |
| 17 | Community Feed | `/community` | login |
| 18 | Community Create | `/community/new` | login |
| 19 | Community Details | `/community/[id]` | login |
| 20 | Community Edit | `/community/[id]/edit` | login (author/admin) |
| 21 | Mentor Inbox | `/mentor-inbox` | mentor/admin |
| 22 | Messages Inbox | `/messages` | login |
| 23 | Message Thread | `/messages/[id]` | login |

Additional: `/forbidden` is the unauthorized destination for role-guarded pages. Unauthorized `/admin` access redirects to `/forbidden` via middleware.
Navigation parity note: navbar `Home` always points to `/` even for authenticated users; authenticated navbar should expose `Dashboard` CTA instead of `Login`/`Register`.

## Mobile Scope (Current, 2026-04-16)

In-scope mobile product flows:
1. Auth (`/login`, `/register`)
2. Courses/modules/materials CRUD
3. Favorites (pin/unpin + favorites tab)
4. Community feed + create + details
5. Direct messaging (inbox + thread)
6. Push-notification pipeline (messages/comments) with deep-link handlers
7. Profile + settings basics

Out-of-scope on mobile for this capstone:
- Progress/Milestones pages (web working pages for development tracking)
- Calendar page (web working page for development tracking)
- Admin Panel (web-first; do not build full mobile admin unless explicitly requested)

Current mobile quality-gate status:
- `SMK-01` through `SMK-20`: PASS
- `SMK-20` accessibility sanity: PASS (VoiceOver/TalkBack sanity verification completed)
- `SMK-21` through `SMK-23` (messages push foreground/background/cold-start): BLOCKED in terminal-only runs; requires physical-device validation
- Sentry telemetry integration: DONE and validated (`SENTRY_TEST_EVENT` received in Sentry Issues, test trigger removed)

## Key Rules

### Security
- All API endpoints must validate auth (JWT) server-side
- Admin actions must check role === 'admin' server-side
- No sensitive data in error responses
- Sanitize user input before rendering
- Never commit `.env` or secrets — only `.env.example` with placeholders
- Error responses use `{ code, message }` format — no stack traces

### Code Quality
- **Max 300 lines per file** — split early if approaching limit
- **Max 60 lines per function** — extract helpers proactively
- Components in separate files (no monolithic page files)
- TypeScript strict mode
- API error contract: `{ code: string, message: string }`

### Task Scoping
- Before making changes, identify:
  - the primary task type: feature, bug fix, refactor, or docs sync
  - the affected layers: web, backend/API, mobile, database, shared, docs
  - the likely files and helpers involved
  - whether cross-layer follow-through is required
- Keep one primary objective per task.
- Allow multi-layer changes only when they complete the same feature or fix end-to-end.
- Do not bundle unrelated cleanup into the same change.

### Context Loading Rules
- Do not scan the entire repository by default.
- Start from the smallest relevant scope.
- Expand only when shared contracts, auth, schema, navigation, parity, or docs are affected.
- Avoid large file dumps; read the relevant sections only.

### Simplicity Rule
- Prefer the simplest solution that fully satisfies the task and respects project constraints.
- Avoid:
  - premature optimization
  - unnecessary abstractions
  - speculative generalization
- Do not introduce reusable abstractions unless reuse is already proven.

### Testing Mindset
- For every change, consider:
  - happy path
  - edge cases
  - failure scenarios
  - regression risk
- Run the smallest relevant validation available.
- If full verification is not possible, state that clearly.

### Encoding & Text Safety
- **All text/code files must be UTF-8**. Never save project files as ANSI/Windows-1251/Windows-1252.
- **`docs/dev-log.md` must be UTF-8 with BOM** to avoid PowerShell/editor mis-detection on Windows.
- When writing files from scripts/tools, always set encoding explicitly (`utf-8` or `utf-8-sig` for `dev-log.md`).
- If mojibake appears (for example CP1251/CP1252 artifact text or replacement-character corruption), stop and repair encoding before continuing with functional edits.
- Before commit, run a quick artifact scan for mojibake patterns in changed docs.
- Repo guardrail: install hooks once with `npm run hooks:install` (enables `.githooks/pre-commit` mojibake check).

### Performance Planning
- For new authenticated web pages, plan **server-first initial data** from the start whenever first render depends on user-specific content.
- Avoid designing pages around `empty state -> useEffect fetch -> real content` if the initial content can be rendered on the server.
- Prefer page structure like:
  - async `app/.../page.tsx` for auth + initial data
  - dedicated client component for mutations and interactive UI state
- Avoid duplicate auth fetches in shared chrome like the navbar.
- Keep loading fallbacks lightweight and quiet.
- Before building or refactoring an authenticated screen, review `docs/performance-guardrails.md`.

### Styling & UI Design (Premium Standards)
- **Tailwind only**: Use utility classes (zero inline styles).
- **Dark mode from day 1**: Every component must have a `dark:` variant.
- **Glassmorphism & Gradients**: Use `backdrop-blur`, semi-transparent backgrounds, and subtle HSL-tailored gradients for a premium feel.
- **Animations**: Use **Framer Motion** for interactions (hover, entrance, layout transitions).
- **Modern Typography**: Use Google Fonts like 'Outfit' or 'Inter'.
- **Visual Parity with v1**: For every page, check the old project for specific UI/UX patterns (colors, shadows, micro-animations) and reconstruct them using these modern technologies.

### Component-First Architecture
- **Max 300 lines per file**: Extract sub-components to `components/<page-name>/` proactively.
- **Max 60 lines per function**: Extract logic to helpers or custom hooks.
- **No Monolithic Pages**: Page files in `app/` should mostly be orchestrators, delegating UI to specialized components.

### Handoff

> ⚠️ **ЗАДЪЛЖИТЕЛНО — ВСЯКА СЕСИЯ БЕЗ ИЗКЛЮЧЕНИЕ**
>
> Всяка нова чат сесия започва без паметта на предишната.
> Потребителят работи в множество сесии (понякога с различни агенти) и единственият начин
> следващата сесия да знае какво е свършено е чрез `docs/dev-log.md`.
> Има и автоматична memory система (MEMORY.md), но тя е high-level.
> Devlog-ът е детайлният запис — файлове, endpoints, решения, статус.
> Ако не го обновиш, следващата сесия започва от нулата.

**`docs/dev-log.md` — правила за попълване:**

- Добавяй нов запис в края на файла с формат `## YYYY-MM-DD`
- Всяка логически свързана група промени → отделен `### Session NNN — <кратко описание>` блок
- Кодировка: файлът се поддържа в **UTF-8 with BOM** (без ANSI/CP1251 save).
- За всеки блок включи:
  - **Какво направихме** — списък с конкретни промени (нови файлове, API endpoints, компоненти)
  - **Файлове** — кои файлове са засегнати
  - **Verification** — резултат от `tsc --noEmit` или `typecheck` скрипта
  - **Решения** — важни архитектурни или UX решения, ако има такива
- Commit-ни devlog заедно с кода — не като отделен commit след това

**Останала документация:**
- `docs/implementation-plan.md` — обнови статуса когато фаза завършва
- При mobile quality/release работа синхронизирай:
  - `docs/mobile-execution-checklist.md`
  - `docs/mobile-smoke-test-matrix.md`
  - `docs/mobile-release-checklist.md`

**Prompt за нов чат:** "Read `docs/dev-log.md`, `docs/implementation-plan.md`, `docs/performance-guardrails.md`, `docs/mobile-execution-checklist.md`, and `docs/mobile-smoke-test-matrix.md`, then continue from the current phase."

## Legacy Reference

The old StudyHub project can be consulted for:
- Visual design reference (screenshots, layout ideas)
- Security patterns (`docs/security-playbook-bg.md`)
- DB schema concepts (ER diagram in README)
- Foundation plan (`docs/capstone-foundation-plan.md`)

Do NOT copy any Vanilla JS code. Rewrite everything in React + TypeScript.

## GitHub Requirements

- Minimum 15 commits across at least 3 different days
- Each commit should be a small, meaningful change
- Commit messages in English, descriptive
