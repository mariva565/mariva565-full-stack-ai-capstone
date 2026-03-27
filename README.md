<p align="center">
  <img src="docs/assets/readme/hero.svg" width="100%" alt="StudyHub v2 animated hero banner" />
</p>

<p align="center">
  <b>Full-stack LMS capstone for SoftUni "Full Stack Apps with AI"</b>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-53-1E1B4B?style=for-the-badge&logo=expo" alt="Expo" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict-2563EB?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle-ORM-B7EA00?style=for-the-badge" alt="Drizzle ORM" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Neon-PostgreSQL-00B894?style=for-the-badge" alt="Neon" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Progress-F59E0B?style=flat-square" alt="Status in progress" />
  <img src="https://img.shields.io/badge/MVP%20Roadmap-13%25-0EA5E9?style=flat-square" alt="MVP roadmap progress 13 percent" />
  <img src="https://img.shields.io/badge/Commits-15%2B%20Target-22C55E?style=flat-square" alt="Commit target 15 plus" />
  <img src="https://img.shields.io/badge/TypeScript-Strict%20Mode-1D4ED8?style=flat-square" alt="TypeScript strict mode" />
</p>

<p align="center">
  <a href="#animated-showcase"><img src="https://img.shields.io/badge/Preview-Animated%20Showcase-FF6B6B?style=flat-square" alt="Animated showcase" /></a>
  <a href="#progress-roadmap"><img src="https://img.shields.io/badge/Roadmap-Delivery%20Phases-7A5CFF?style=flat-square" alt="Delivery phases" /></a>
  <a href="#quick-setup"><img src="https://img.shields.io/badge/Setup-Quick%20Start-17C2B5?style=flat-square" alt="Quick setup" /></a>
  <a href="#project-details"><img src="https://img.shields.io/badge/Docs-Project%20Details-FF9F43?style=flat-square" alt="Project details" /></a>
</p>

## Animated Showcase

- Live Web App: `TBD`
- Mobile Demo (Expo): `TBD`
- Video Walkthrough: `TBD`

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Web App Preview</h3>
      <img src="docs/assets/readme/web-preview.svg" alt="Animated web flow preview" />
      <p>Animated SVG flow for register -> dashboard -> course details.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Mobile App Preview</h3>
      <img src="docs/assets/readme/mobile-preview.svg" alt="Animated mobile flow preview" />
      <p>Animated SVG flow for login -> courses -> details.</p>
    </td>
  </tr>
</table>

## Progress Roadmap

`MVP delivery pulse: [###.......] 13% (1/8 phases complete)`

| Phase | Scope | Status |
|---|---|---|
| Phase 0 | Monorepo bootstrap | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 1 | DB schema + Drizzle migrations | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 2 | Auth + JWT guards | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 3 | Courses/modules/materials CRUD + favorites | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 4 | Profile + admin panel | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 5 | Mobile API integration | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 6 | Deployment (Vercel/Netlify) | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |
| Phase 7 | Docs + demo polish | ![Planned](https://img.shields.io/badge/Planned-64748B?style=flat-square) |

## Project Details

<details open>
  <summary><b>Project Story</b></summary>

StudyHub v2 is a full rewrite of StudyHub v1 with a modern full-stack architecture.
The goal is a rubric-first LMS that ships clean backend security, responsive web UI, and mobile parity.
</details>

<details>
  <summary><b>Stack and Architecture</b></summary>

| Layer | Technology |
|---|---|
| Frontend Web | Next.js + React + TypeScript + Tailwind CSS |
| Backend API | Next.js API Routes (RESTful) |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | JWT (register/login/logout) + role-based access |
| Mobile | React Native + Expo |
| Shared | Monorepo package for common TypeScript types/utils |

```text
capstone/
|- apps/
|  |- web/        # Next.js web client + API
|  |- mobile/     # Expo app
|- packages/
|  |- shared/     # Shared TypeScript types
|- drizzle/       # Schema + migrations
|- docs/          # Assignment + implementation notes
|- AGENTS.md
`- README.md
```
</details>

<details>
  <summary><b>Feature Scope</b></summary>

MVP:
- JWT auth with server-side checks
- Roles (`user`, `admin`) with admin guards
- Courses -> modules -> materials hierarchy
- Favorites + activity logging
- Admin panel (users + moderation + logs)
- 7 responsive web screens
- 3 mobile screens

Optional after MVP:
- Cloudflare R2 uploads
- AI summarize/quiz/chat
- Notes + PDF export
- Contact flow
</details>

<details>
  <summary><b>Required Screens</b></summary>

Web (7):
1. Register
2. Login
3. Dashboard
4. Course Details
5. Material View/Edit
6. Profile
7. Admin Panel

Mobile (3):
1. Login
2. Courses List
3. Course Details
</details>

<details>
  <summary><b>Database and Security Baseline</b></summary>

Tables:
1. `users`
2. `courses`
3. `modules`
4. `materials`
5. `favorites`
6. `activity_logs`

Rules:
- Every schema change is shipped with a Drizzle migration
- Server-side JWT validation for protected routes
- Server-side admin role validation for admin actions
- No sensitive data in error payloads
- Input sanitization before rendering
- TypeScript strict mode
- Tailwind-based styling for web UI
</details>

<details>
  <summary><b>API Overview</b></summary>

Auth endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Core endpoints:
- Courses CRUD
- Modules CRUD
- Materials CRUD
- Favorites create/list/remove

Admin endpoints:
- Users list / role update / delete
- Materials moderation
- Activity logs
</details>

## Quick Setup

Requirements:
- Node.js 20+
- npm 10+

Install:
```bash
npm install
copy .env.example .env
```

Run web:
```bash
npm run dev:web
```
Open: `http://localhost:3000`

Run mobile:
```bash
npm run dev:mobile
```

Alternative mobile connection modes:
```bash
npm run dev:mobile:tunnel
npm run dev:mobile:lan
```

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@studyhub.dev | admin123 |
| User | user@studyhub.dev | user123 |

## v1 -> v2 Transformation

| Topic | StudyHub v1 | StudyHub v2 |
|---|---|---|
| Frontend | Vanilla JS | React + Next.js + TypeScript |
| Backend | Supabase-centric | Next.js API + Neon + Drizzle |
| Mobile | None | React Native + Expo |
| Structure | Single app style | Monorepo + shared package |

## Notes

- Legacy repository is used only as visual/logical reference.
- No Vanilla JS code is copied into this project.
