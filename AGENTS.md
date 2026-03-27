# AGENTS.md — AI Agent Instructions

## Project Overview

**StudyHub v2** — A full-stack Learning Management System (LMS) for organizing study materials.
This is a capstone project for the SoftUni "Full Stack Apps with AI" course.

It is a rewrite of a previous project (StudyHub v1, Vanilla JS + Supabase) using a completely new tech stack.
The old project is at `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\` and should be used **only as a visual/logical reference** — no code should be copied.

## Tech Stack (mandatory)

- **Frontend Web:** Next.js + React + TypeScript + Tailwind CSS
- **Backend API:** Next.js API Routes (RESTful)
- **Database:** Neon serverless PostgreSQL + Drizzle ORM
- **Auth:** JWT tokens (register, login, logout) + roles (user, admin)
- **Mobile:** React Native + Expo
- **Storage:** Cloudflare R2 (optional, for file uploads)
- **Deploy:** Vercel or Netlify

## Architecture

Monorepo with two apps communicating via REST API:

```
capstone/
├── apps/
│   ├── web/          ← Next.js (backend API + web client)
│   └── mobile/       ← Expo (React Native mobile client)
├── packages/
│   └── shared/       ← Shared types, utils, API client
├── drizzle/          ← DB schema + migrations
├── docs/             ← Documentation
├── AGENTS.md         ← This file
└── README.md
```

## Database Tables (6 tables, Drizzle ORM)

- **users** — id, email, name, password_hash, role (user/admin), avatar_url, created_at
- **courses** — id, title, description, created_by (FK→users), is_public, status, created_at
- **modules** — id, course_id (FK→courses), title, order_index, created_by (FK→users)
- **materials** — id, module_id (FK→modules), title, content, material_type, file_url, tags, created_by (FK→users)
- **favorites** — id, user_id (FK→users), material_id (FK→materials), created_at
- **activity_logs** — id, user_id (FK→users), action_type, target_id, details (JSON), created_at

Every schema change MUST use Drizzle migrations. Migration SQL scripts must be committed.

## Web Screens (7 screens, responsive)

1. Register, 2. Login, 3. Dashboard (courses list), 4. Course Details (modules → materials),
5. Material View/Edit, 6. Profile, 7. Admin Panel (user management + content moderation)

## Mobile Screens (3 screens)

1. Login, 2. Courses List, 3. Course Details

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

### Styling
- Use Tailwind for all styling — **zero inline styles** (`style=`, `.style`, `cssText`)
- **Responsive from day 1:** every component uses `sm:`, `md:`, `lg:` breakpoints
- **Dark mode from day 1:** every color class has a `dark:` variant
- Tailwind dark mode strategy: `class` (set on `<html>`)

### Handoff
- Update `docs/dev-log.md` at end of each session
- Update `docs/implementation-plan.md` status when a phase completes
- New chat prompt: "Read `docs/dev-log.md` and `docs/implementation-plan.md` and continue from current phase."

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
