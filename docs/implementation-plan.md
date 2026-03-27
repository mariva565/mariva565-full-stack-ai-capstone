# StudyHub v2 — Пълен план за действие (Handoff документ)

> **Последна актуализация:** 2026-03-27
> **Срок:** средата на май 2026
> **Статус:** ⏳ Фаза 0 — не е започната

---

## Handoff инструкции (за нови чатове / друго IDE)

При започване на нов чат, кажи:
> "Работя по StudyHub v2 капстоун проект. Прочети `docs/implementation-plan.md` и продължи от текущата фаза."

Текущата фаза и статусът на всяка стъпка се намират в секция **"Текущ статус"** по-долу.

---

## Проект: StudyHub v2

Пренаписване на StudyHub (LMS за бележки и учебни материали) с нов стек.
Курс: "Full Stack Apps with AI" @ SoftUni.

**Стар проект за справка:** `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3`
**Ново репо:** `https://github.com/mariva565/mariva565-full-stack-ai-capstone`

---

## Взети решения

| Тема | Решение |
|---|---|
| MFA | ❌ Пропускаме — усложнява тестването от журито |
| AI provider | ✅ Google Gemini API (безплатен tier) — ключът вече съществува |
| Deployment | ✅ Vercel (най-добра поддръжка за Next.js) |
| Storage | ✅ Cloudflare R2 (10GB безплатно) |
| PDF → Notes | ⏳ Оставяме за края ако остане време |
| Дизайн | ⏳ Ще се реши по-късно (лилава тема от стария проект — под въпрос) |
| File uploads | ✅ PDF + документи към материали |

---

## Технологии

| Слой | Технология |
|---|---|
| Frontend Web | Next.js 14 + React + TypeScript + Tailwind CSS |
| Backend API | Next.js API Routes |
| Database | Neon serverless PostgreSQL + Drizzle ORM |
| Auth | JWT (custom — без Auth.js) |
| Mobile | React Native + Expo |
| Storage | Cloudflare R2 |
| AI | Google Gemini API (gemini-1.5-flash) |
| Deploy | Vercel |

---

## Архитектура: Монорепо

```
capstone/                        ← root (текущата папка)
├── apps/
│   ├── web/                     ← Next.js app (API + уеб клиент)
│   │   ├── app/                 ← App Router
│   │   │   ├── api/             ← REST API endpoints
│   │   │   ├── (auth)/          ← login, register
│   │   │   ├── dashboard/       ← courses list
│   │   │   ├── courses/[id]/    ← course details
│   │   │   ├── materials/[id]/  ← material view/edit
│   │   │   ├── notes/           ← notes
│   │   │   ├── profile/         ← profile
│   │   │   ├── contact/         ← contact form
│   │   │   └── admin/           ← admin panel
│   │   ├── components/
│   │   ├── lib/                 ← jwt, db, gemini, r2 helpers
│   │   └── middleware.ts
│   └── mobile/                  ← Expo app
│       └── app/
│           ├── index.tsx         ← Courses list
│           ├── course/[id].tsx   ← Course details
│           └── profile.tsx       ← Profile
├── packages/
│   └── shared/                  ← Споделени TypeScript типове
├── drizzle/
│   ├── schema.ts                ← DB schema (Drizzle)
│   └── migrations/              ← SQL миграции (задължително в GitHub)
├── docs/
├── AGENTS.md
├── package.json                 ← npm workspaces root
└── README.md
```

---

## Database Schema (7 таблици)

### users
```
id, email, name, password_hash, role (user | admin),
avatar_url, created_at
```

### courses
```
id, title, description, created_by (→ users),
is_public, created_at
```

### modules
```
id, course_id (→ courses), title, order_index, created_at
```

### materials
```
id, module_id (→ modules), title, content,
type (text | link | file), file_url,
created_by (→ users), is_pinned, created_at
```

### notes
```
id, user_id (→ users), title, content,
material_id (→ materials, nullable),
is_shared, is_pinned, pdf_url, created_at
```

### contact_messages
```
id, user_id (→ users, nullable), name, email,
message, created_at
```

### activity_logs
```
id, user_id (→ users), action, entity_type,
entity_id, details (JSON), created_at
```

---

## API Endpoints

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

### Notes
- `GET    /api/notes`
- `POST   /api/notes`
- `PUT    /api/notes/:id`
- `DELETE /api/notes/:id`
- `POST   /api/notes/:id/pin`
- `POST   /api/notes/:id/share`
- `POST   /api/notes/:id/export-pdf`  ← Notes → PDF

### Storage
- `POST   /api/upload`               ← Upload file → R2, returns URL
- `DELETE /api/upload/:key`

### AI (Gemini)
- `POST   /api/ai/chat`              ← Chat асистент
- `POST   /api/ai/summarize`         ← Summarize material
- `POST   /api/ai/quiz`              ← Generate quiz от material

### Contact
- `POST   /api/contact`

### Admin
- `GET    /api/admin/users`
- `PUT    /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`
- `GET    /api/admin/courses`
- `DELETE /api/admin/courses/:id`
- `GET    /api/admin/activity-logs`
- `GET    /api/admin/contact-messages`

---

## Уеб екрани (8 екрана)

| # | Екран | Път | Достъп |
|---|---|---|---|
| 1 | Register | `/register` | публичен |
| 2 | Login | `/login` | публичен |
| 3 | Dashboard | `/dashboard` | login |
| 4 | Course Details | `/courses/[id]` | login |
| 5 | Material View/Edit | `/materials/[id]` | login |
| 6 | Notes | `/notes` | login |
| 7 | Profile | `/profile` | login |
| 8 | Contact | `/contact` | публичен |
| 9 | Admin Panel | `/admin` | admin |

---

## Мобилни екрани (3 екрана — Expo)

| # | Екран | Файл |
|---|---|---|
| 1 | Courses List | `app/index.tsx` |
| 2 | Course Details | `app/course/[id].tsx` |
| 3 | Profile | `app/profile.tsx` |

Мобилното се свързва към същия Next.js backend.

---

## Admin Panel функции

- Таб **Users**: виж всички, смени роля (user ↔ admin), изтрий
- Таб **Courses**: виж всички, изтрий
- Таб **Activity Logs**: виж последните действия
- Таб **Contact Messages**: виж входящите съобщения

---

## AI функции (Gemini 1.5 Flash — безплатен)

| Функция | Тригер | Описание |
|---|---|---|
| Chat асистент | FAB бутон (всяка страница) | Чат с AI, настроен за програмисти |
| Summarize | Бутон в Material View | Обобщава съдържанието на материала |
| Quiz | Бутон в Material View | Генерира 5 въпроса от материала |

---

## Фази на разработка

### ФАЗА 0 — Монорепо + DB Setup
**Цел:** Работещо скеле, свързано с Neon DB

- [ ] `package.json` с npm workspaces (root)
- [ ] `apps/web` — Next.js 14 с TypeScript + Tailwind
- [ ] `apps/mobile` — Expo с TypeScript
- [ ] `packages/shared` — споделени типове
- [ ] Neon DB акаунт + connection string
- [ ] `drizzle/schema.ts` — пълна схема (7 таблици)
- [ ] Drizzle config + първа миграция
- [ ] `.env.example` файл
- [ ] Commit: "feat: monorepo setup with Next.js, Expo and Drizzle schema"

---

### ФАЗА 1 — Auth (JWT)
**Цел:** Register, Login, Logout, защитени routes

- [ ] `lib/jwt.ts` — sign, verify JWT
- [ ] `lib/auth.ts` — hashPassword, verifyPassword (bcrypt)
- [ ] `middleware.ts` — JWT middleware за защитени routes
- [ ] API: `POST /api/auth/register`
- [ ] API: `POST /api/auth/login`
- [ ] API: `POST /api/auth/logout`
- [ ] API: `GET /api/auth/me`
- [ ] Уеб: Register страница
- [ ] Уеб: Login страница
- [ ] Seed: admin@studyhub.dev / admin123, user@studyhub.dev / user123
- [ ] Commit: "feat: JWT auth — register, login, logout"

---

### ФАЗА 2 — Courses + Modules + Materials CRUD
**Цел:** Основната функционалност

- [ ] API: CRUD за courses
- [ ] API: CRUD за modules
- [ ] API: CRUD за materials
- [ ] Activity logging при всяко действие
- [ ] Уеб: Dashboard (courses list)
- [ ] Уеб: Course Details (modules → materials)
- [ ] Уеб: Material View/Edit
- [ ] Commit: "feat: courses, modules, materials CRUD"

---

### ФАЗА 3 — Notes + Storage (Cloudflare R2)
**Цел:** Бележки, качване на файлове, PDF export

- [ ] Cloudflare R2 bucket setup
- [ ] `lib/r2.ts` — upload, delete helpers
- [ ] API: `POST /api/upload`
- [ ] Файлов upload в Material form
- [ ] API: CRUD за notes
- [ ] Notes: pin, share функции
- [ ] `lib/pdf.ts` — Notes → PDF (с `jspdf`)
- [ ] API: `POST /api/notes/:id/export-pdf`
- [ ] Уеб: Notes страница
- [ ] Commit: "feat: notes, file upload (R2), PDF export"

---

### ФАЗА 4 — AI функции (Gemini)
**Цел:** Chat, Summarize, Quiz

- [ ] `lib/gemini.ts` — Gemini API клиент
- [ ] API: `POST /api/ai/chat`
- [ ] API: `POST /api/ai/summarize`
- [ ] API: `POST /api/ai/quiz`
- [ ] Уеб: Chat widget (FAB)
- [ ] Уеб: Summarize бутон в Material View
- [ ] Уеб: Quiz генератор в Material View
- [ ] Rate limiting за AI endpoints
- [ ] Commit: "feat: Gemini AI — chat, summarize, quiz"

---

### ФАЗА 5 — Admin Panel
**Цел:** Пълен admin интерфейс

- [ ] API: admin endpoints (users, courses, logs, contact)
- [ ] Уеб: Admin Panel страница (4 таба)
- [ ] Role guard — само admin може да достъпи `/admin`
- [ ] Commit: "feat: admin panel — users, courses, logs"

---

### ФАЗА 6 — Contact Form + Profile
**Цел:** Останалите уеб екрани

- [ ] API: `POST /api/contact`
- [ ] Уеб: Contact страница
- [ ] Уеб: Profile страница (редакция на name, avatar)
- [ ] Commit: "feat: contact form and profile page"

---

### ФАЗА 7 — Mobile App (Expo)
**Цел:** 3 работещи мобилни екрана

- [ ] Expo настройка — API base URL към Vercel
- [ ] Shared auth token (AsyncStorage)
- [ ] Екран 1: Login
- [ ] Екран 2: Courses List
- [ ] Екран 3: Course Details
- [ ] Commit: "feat: mobile app — login, courses, course details"

---

### ФАЗА 8 — Deployment (Vercel + Neon)
**Цел:** Работещ live проект

- [ ] Vercel проект — свързан с GitHub repo
- [ ] Environment variables в Vercel
- [ ] Neon production DB — `drizzle-kit push`
- [ ] Vercel deploy — тест на всички endpoints
- [ ] Demo credentials работят
- [ ] Commit: "feat: production deployment on Vercel"

---

### ФАЗА 9 — Документация
**Цел:** Пълна документация в GitHub

- [ ] README.md — описание, screenshots, tech stack
- [ ] DB schema диаграма (dbdiagram.io или Mermaid)
- [ ] Local development setup guide
- [ ] API reference (основните endpoints)
- [ ] AGENTS.md — актуализиран
- [ ] Commit: "docs: complete project documentation"

---

### ФАЗА 10 — Polish (ако остане време)
- [ ] PDF → Notes (парсване на PDF)
- [ ] Лилава тема / mascot от стария проект
- [ ] Анимации, transitions
- [ ] Допълнителни commits за да стигнем 20+

---

## Scoring Tracker (100 точки)

| Критерий | Макс | Как го покриваме | Фаза |
|---|---|---|---|
| GitHub Commits (15+) | 15 | ~20 комита, 1 на фаза + | всички |
| Commit Days (3+) | 15 | работа в различни дни | всички |
| Architecture | 5 | монорепо, REST API, Expo | 0 |
| Backend API | 7 | auth + CRUD + AI endpoints | 1-5 |
| Database (4+) | 8 | 7 таблици + миграции | 0 |
| Auth & Security | 5 | JWT + роли + middleware | 1 |
| Web Screens (5+) | 10 | 9 екрана | 1-6 |
| Admin Panel | 10 | 4 таба, role guard | 5 |
| Mobile (3+) | 9 | 3 екрана | 7 |
| Deployment | 10 | Vercel + Neon | 8 |
| Documentation | 6 | README + schema | 9 |
| **Общо** | **100** | | |

---

## Environment Variables (.env)

```env
# Database
DATABASE_URL=postgresql://...neon.tech/studyhub

# JWT
JWT_SECRET=...

# Gemini AI
GEMINI_API_KEY=...

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=studyhub-files
R2_PUBLIC_URL=https://...r2.dev

# App
NEXT_PUBLIC_API_URL=https://...vercel.app
```

---

## Demo Credentials (за журито)

| Роля | Email | Парола |
|---|---|---|
| Admin | admin@studyhub.dev | admin123 |
| User | user@studyhub.dev | user123 |

---

## Текущ статус

| Фаза | Статус |
|---|---|
| Фаза 0: Монорепо + DB | ⏳ Не е започната |
| Фаза 1: Auth | ⏳ Не е започната |
| Фаза 2: CRUD | ⏳ Не е започната |
| Фаза 3: Notes + Storage | ⏳ Не е започната |
| Фаза 4: AI | ⏳ Не е започната |
| Фаза 5: Admin | ⏳ Не е започната |
| Фаза 6: Contact + Profile | ⏳ Не е започната |
| Фаза 7: Mobile | ⏳ Не е започната |
| Фаза 8: Deployment | ⏳ Не е започната |
| Фаза 9: Docs | ⏳ Не е започната |
