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
- **Auth:** JWT tokens (register, login, logout) + Google OAuth + roles (user, admin)
- **Mobile:** React Native + Expo
- **AI:** Google Gemini API (chat, summarize, quiz generation)
- **3D/Visuals:** Three.js (landing page scenes)
- **Storage:** Cloudflare R2 (optional, for file uploads)
- **Deploy:** Vercel or Netlify

## Architecture

Monorepo with two apps communicating via REST API:

```
capstone/
├── apps/
│   ├── web/                  ← Next.js (backend API + web client)
│   │   ├── app/
│   │   │   ├── api/          ← RESTful API routes
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── courses/[id]/
│   │   │   ├── modules/[id]/
│   │   │   ├── materials/[id]/
│   │   │   ├── calendar/
│   │   │   ├── progress/
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   ├── how-it-works/
│   │   │   └── contact/
│   │   ├── components/       ← UI components (by page + shared ui/)
│   │   ├── lib/              ← Helpers (auth, db, AI, etc.)
│   │   └── middleware.ts
│   └── mobile/               ← Expo (React Native mobile client)
│       └── app/
│           ├── login.tsx
│           ├── index.tsx     ← Courses List
│           └── course/[id].tsx
├── packages/
│   └── shared/               ← Shared types, utils, API client
├── drizzle/                  ← DB schema + migrations
├── docs/                     ← Documentation
├── AGENTS.md                 ← This file
└── README.md
```

## Database Tables (10 tables, Drizzle ORM)

- **users** — id, email, name, password_hash, role (user/admin), avatar_url, blocked, created_at
- **courses** — id, title, description, created_by (FK→users), is_public, status, created_at
- **modules** — id, course_id (FK→courses), title, description, order_index, created_by (FK→users)
- **materials** — id, module_id (FK→modules), title, content, material_type, file_url, tags, created_by (FK→users), created_at
- **favorites** — id, user_id (FK→users), material_id (FK→materials), created_at
- **milestones** — id, user_id (FK→users), title, description, status, due_date, completed_at, order_index, created_at
- **events** — id, user_id (FK→users), title, description, date, type, color, course_id (FK→courses), milestone_id (FK→milestones), created_at
- **activity_logs** — id, user_id (FK→users), action_type, target_id, details (JSON), created_at
- **oauth_accounts** — id, user_id (FK→users), provider, provider_user_id, provider_email, created_at
- **ai_tool_outputs** — id, user_id (FK→users), material_id (FK→materials), tool, data (JSON), created_at

Every schema change MUST use Drizzle migrations. Migration SQL scripts must be committed.

## Web Screens (13 screens, responsive)

| # | Screen | Path | Access |
|---|---|---|---|
| 1 | Landing Page | `/` | public |
| 2 | How It Works | `/how-it-works` | public |
| 3 | Contact | `/contact` | public |
| 4 | Register | `/register` | public |
| 5 | Login | `/login` | public |
| 6 | Dashboard | `/dashboard` | login |
| 7 | Course Details | `/courses/[id]` | login |
| 8 | Module Workspace | `/modules/[id]` | login |
| 9 | Material View/Edit | `/materials/[id]` | login |
| 10 | Calendar | `/calendar` | login |
| 11 | Progress | `/progress` | login |
| 12 | Profile | `/profile` | login |
| 13 | Admin Panel | `/admin` | admin |

Additional: `/forbidden` (error page for unauthorized access)

## Mobile Scope (Current, 2026-04-10)

In-scope mobile product flows:
1. Auth (`/login`, `/register`)
2. Courses list + course details
3. Module workspace + material view/edit
4. Favorites (pin/unpin + favorites list tab)
5. Profile (basic account actions)

Out-of-scope on mobile for this capstone:
- Progress/Milestones pages (web working pages for development tracking)
- Calendar page (web working page for development tracking)
- Admin Panel (web-first; do not build full mobile admin unless explicitly requested)

Current mobile quality-gate status:
- `SMK-01` through `SMK-20`: PASS
- `SMK-20` accessibility sanity: PASS (VoiceOver/TalkBack sanity verification completed)
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
