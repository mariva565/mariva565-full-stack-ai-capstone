# StudyHub v2 — План за изпълнение (Assignment-Locked)

> **Последна актуализация:** 2026-03-27  
> **Срок:** средата на май 2026  
> **Статус:** ⏳ Фаза 0 — не е започната

---

## Handoff инструкции

При започване на нов чат, кажи:
> "Работя по StudyHub v2 капстоун проект. Прочети `docs/implementation-plan.md` и продължи от текущата фаза."

---

## MVP Rubric Lock (задължително)

Този документ е заключен по заданието. Първо изпълняваме минимума за оценяване, после optional функционалности.

- [ ] Monorepo: `apps/web` + `apps/mobile` + `packages/shared`
- [ ] Next.js (web + API routes), Expo (mobile), Neon + Drizzle
- [ ] JWT auth: register/login/logout + роли `user/admin`
- [ ] Server-side auth check за всички защитени API
- [ ] Server-side admin role checks за admin действия
- [ ] 6 таблици (точно по AGENTS.md)
- [ ] Drizzle migrations committed в GitHub
- [ ] 7 web екрана (responsive)
- [ ] 3 mobile екрана
- [ ] Admin panel (users + content moderation)
- [ ] Live deployment + demo credentials
- [ ] 15+ commits в 3+ различни дни

---

## Проект

StudyHub v2 е LMS за организиране на учебни материали.

**Стар проект (само визуална/логическа справка):**  
`C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3`

**Важно:** Не копираме Vanilla JS код. Пренаписваме в React + TypeScript.

---

## Технологии

| Слой | Технология |
|---|---|
| Frontend Web | Next.js + React + TypeScript + Tailwind CSS |
| Backend API | Next.js API Routes (RESTful) |
| Database | Neon serverless PostgreSQL + Drizzle ORM |
| Auth | JWT (custom) |
| Mobile | React Native + Expo |
| Deploy | Vercel или Netlify |
| Optional | Cloudflare R2, AI функции |

---

## Архитектура (монорепо)

```text
capstone/
├── apps/
│   ├── web/                  ← Next.js (API + web client)
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── register/
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── courses/[id]/
│   │   │   ├── materials/[id]/
│   │   │   ├── profile/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   └── middleware.ts
│   └── mobile/               ← Expo app
│       └── app/
│           ├── login.tsx
│           ├── index.tsx
│           └── course/[id].tsx
├── packages/
│   └── shared/               ← shared types/utils/api client
├── drizzle/
│   ├── schema.ts
│   └── migrations/
├── docs/
├── AGENTS.md
└── README.md
```

---

## Database Schema (6 таблици, Drizzle ORM)

### users
```text
id, email, name, password_hash, role (user/admin), avatar_url, created_at
```

### courses
```text
id, title, description, created_by (FK→users), is_public, status, created_at
```

### modules
```text
id, course_id (FK→courses), title, order_index, created_by (FK→users)
```

### materials
```text
id, module_id (FK→modules), title, content, material_type, file_url, tags, created_by (FK→users)
```

### favorites
```text
id, user_id (FK→users), material_id (FK→materials), created_at
```

### activity_logs
```text
id, user_id (FK→users), action_type, target_id, details (JSON), created_at
```

---

## API Endpoints (MVP)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Courses
- `GET    /api/courses`
- `POST   /api/courses`
- `GET    /api/courses/:id`
- `PUT    /api/courses/:id`
- `DELETE /api/courses/:id`

### Modules
- `GET    /api/courses/:id/modules`
- `POST   /api/courses/:id/modules`
- `PUT    /api/modules/:id`
- `DELETE /api/modules/:id`

### Materials
- `GET    /api/modules/:id/materials`
- `POST   /api/modules/:id/materials`
- `GET    /api/materials/:id`
- `PUT    /api/materials/:id`
- `DELETE /api/materials/:id`

### Favorites
- `GET    /api/favorites`
- `POST   /api/favorites`
- `DELETE /api/favorites/:id`

### Admin
- `GET    /api/admin/users`
- `PUT    /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`
- `GET    /api/admin/materials`
- `DELETE /api/admin/materials/:id`
- `GET    /api/admin/activity-logs`

---

## Уеб екрани (7 задължителни, responsive)

| # | Екран | Път | Достъп |
|---|---|---|---|
| 1 | Register | `/register` | публичен |
| 2 | Login | `/login` | публичен |
| 3 | Dashboard | `/dashboard` | login |
| 4 | Course Details | `/courses/[id]` | login |
| 5 | Material View/Edit | `/materials/[id]` | login |
| 6 | Profile | `/profile` | login |
| 7 | Admin Panel | `/admin` | admin |

---

## Мобилни екрани (3 задължителни, Expo)

| # | Екран | Файл |
|---|---|---|
| 1 | Login | `app/login.tsx` |
| 2 | Courses List | `app/index.tsx` |
| 3 | Course Details | `app/course/[id].tsx` |

Мобилното приложение използва същия Next.js backend API.

---

## Security и Quality Gates (blocking)

- [ ] Всички API endpoints валидират JWT server-side
- [ ] Всички admin endpoints валидират `role === 'admin'` server-side
- [ ] Няма sensitive данни в error responses
- [ ] User input се sanitize-ва преди render
- [ ] Tailwind only: без inline styles
- [ ] TypeScript strict mode е включен
- [ ] Компонентите са в отделни файлове (без монолитни page файлове)
- [ ] Всяка schema промяна минава през Drizzle migration

---

## Фази на разработка (MVP-first)

### ФАЗА 0 — Monorepo Bootstrap
**Цел:** Работещо скеле за web + mobile + shared

- [ ] root `package.json` с workspaces
- [ ] `apps/web` (Next.js + TS + Tailwind)
- [ ] `apps/mobile` (Expo + TS)
- [ ] `packages/shared` (types + helpers)
- [ ] `.env.example`
- [ ] Commit: `chore: bootstrap monorepo with web, mobile and shared`

---

### ФАЗА 1 — DB Schema + Drizzle Migrations
**Цел:** 6 таблици и първа migration в Git

- [ ] `drizzle/schema.ts` по модела от този документ
- [ ] Drizzle config
- [ ] Initial SQL migration
- [ ] Seed за demo users (admin/user)
- [ ] Commit: `feat(db): add studyhub schema with 6 tables`

---

### ФАЗА 2 — Auth + Access Control
**Цел:** Register/Login/Logout + guards

- [ ] JWT sign/verify helpers
- [ ] Password hashing (bcrypt/argon2)
- [ ] Auth endpoints
- [ ] Middleware/guards за защитени web routes
- [ ] API auth checks на server-side
- [ ] Commit: `feat(auth): jwt auth with role-aware guards`

---

### ФАЗА 3 — Core CRUD (Courses/Modules/Materials/Favorites)
**Цел:** Основният LMS flow

- [ ] CRUD endpoints за courses/modules/materials
- [ ] Favorites endpoints
- [ ] Activity logging
- [ ] Dashboard, Course Details, Material View/Edit
- [ ] Commit: `feat(core): implement courses modules materials and favorites`

---

### ФАЗА 4 — Profile + Admin Panel
**Цел:** Пълен ролеви контрол

- [ ] Profile страница (name/avatar)
- [ ] Admin panel: users + content moderation + logs
- [ ] Admin role checks на endpoint ниво
- [ ] Commit: `feat(admin): add user management and moderation`

---

### ФАЗА 5 — Mobile App (3 screens)
**Цел:** Login + Courses List + Course Details

- [ ] Expo API integration
- [ ] Auth token storage
- [ ] 3 задължителни екрана
- [ ] Commit: `feat(mobile): add login courses list and course details`

---

### ФАЗА 6 — Deployment + Demo Access
**Цел:** Live проект за жури

- [ ] Deploy на Vercel/Netlify
- [ ] Environment variables в хостинга
- [ ] Production DB migration
- [ ] Smoke test на основните потоци
- [ ] Demo credentials валидни
- [ ] Commit: `feat(deploy): publish production build with demo access`

---

### ФАЗА 7 — Documentation + Final Hardening
**Цел:** Пълна repo документация

- [ ] README: описание + роли + screenshots
- [ ] Архитектура и ключови папки
- [ ] DB диаграма (Mermaid/dbdiagram)
- [ ] Local setup guide
- [ ] API summary
- [ ] Commit: `docs: finalize architecture setup and api documentation`

---

## Commit Plan (15+ commits, 3+ дни)

| Ден | Дата | Фокус | Цел комити |
|---|---|---|---|
| Ден 1 | 2026-03-27 | Фаза 0 + Фаза 1 | 5 |
| Ден 2 | 2026-03-30 | Фаза 2 + Фаза 3 + част от Фаза 4 | 6 |
| Ден 3 | 2026-03-31 | Фаза 4/5/6/7 | 5 |
| **Общо** |  |  | **16+** |

---

## Scoring Tracker (100 точки)

| Критерий | Макс | Как покриваме | Фаза |
|---|---|---|---|
| GitHub Commits (15+) | 15 | 16+ комита по календар | всички |
| Commit Days (3+) | 15 | 3 отделни дати | всички |
| Architecture | 5 | Monorepo + REST + Expo | 0 |
| Backend API | 7 | Auth + CRUD + Admin endpoints | 2-4 |
| Database | 8 | 6 таблици + Drizzle migrations | 1 |
| Auth & Security | 5 | JWT + server-side guards + role checks | 2 |
| Web Screens | 10 | 7 responsive екрана | 3-4 |
| Admin Panel | 10 | Users + moderation + logs | 4 |
| Mobile App | 9 | 3 API-integrated екрана | 5 |
| Deployment | 10 | Live URL + demo access | 6 |
| Documentation | 6 | README + architecture + DB + setup | 7 |
| **Общо** | **100** |  |  |

---

## Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://...neon.tech/studyhub

# JWT
JWT_SECRET=...

# App
NEXT_PUBLIC_API_URL=https://...vercel.app

# Optional: Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Optional: AI
GEMINI_API_KEY=
```

---

## Demo Credentials (за журито)

| Роля | Email | Парола |
|---|---|---|
| Admin | admin@studyhub.dev | admin123 |
| User | user@studyhub.dev | user123 |

---

## Optional Backlog (след MVP)

- [ ] Cloudflare R2 file uploads за материали
- [ ] AI: summarize/quiz/chat
- [ ] Contact страница/форма
- [ ] Notes + PDF export
- [ ] UI polish анимации и допълнителни UX детайли

---

## Текущ статус

| Фаза | Статус |
|---|---|
| Фаза 0: Bootstrap | ⏳ Не е започната |
| Фаза 1: DB + Migrations | ⏳ Не е започната |
| Фаза 2: Auth + Guards | ⏳ Не е започната |
| Фаза 3: Core CRUD + Favorites | ⏳ Не е започната |
| Фаза 4: Profile + Admin | ⏳ Не е започната |
| Фаза 5: Mobile | ⏳ Не е започната |
| Фаза 6: Deployment | ⏳ Не е започната |
| Фаза 7: Docs | ⏳ Не е започната |

