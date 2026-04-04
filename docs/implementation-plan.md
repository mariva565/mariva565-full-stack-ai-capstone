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

**Пример от заданието (за сложност):** Софтуер за медицински данни (Mobile за снимки на пациенти + Web с портали за доктори/пациенти и админ панел). StudyHub v2 е аналогично сложен архитектурно.

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

- [x] root `package.json` с workspaces
- [x] `apps/web` (Next.js + TS + Tailwind)
- [x] `apps/mobile` (Expo + TS)
- [x] `packages/shared` (types + helpers)
- [x] `.env.example`
- [x] Commit: `chore: bootstrap monorepo with web, mobile and shared`

---

### ФАЗА 1 — DB Schema + Drizzle Migrations
**Цел:** 6 таблици и първа migration в Git

- [x] `drizzle/schema.ts` по модела от този документ
- [x] Drizzle config
- [x] Initial SQL migration
- [x] Seed за demo users (admin/user)
- [x] Commit: `feat(db): add Drizzle schema with 6 tables and Neon integration`

---

### ФАЗА 2 — Auth + Access Control
**Цел:** Register/Login/Logout + guards

- [x] JWT sign/verify helpers
- [x] Password hashing (bcrypt)
- [x] Auth endpoints
- [x] Middleware/guards за защитени web routes
- [x] API auth checks на server-side
- [x] Commit: `feat(auth): JWT auth with register, login, logout and role-aware middleware`

---

### Planned Auth Extension — Google Sign-In
**Goal:** Add Google sign-in without replacing the existing custom JWT auth architecture.

- Keep the current auth model:
  - Google becomes an additional provider, not a migration to `Auth.js`.
  - After Google identity is verified, StudyHub still issues the same app JWT/cookie used by email/password login.
- Add a dedicated Drizzle table for provider links:
  - `oauth_accounts`
  - suggested fields: `id`, `user_id`, `provider`, `provider_user_id`, `provider_email`, `created_at`
  - unique constraint on `provider + provider_user_id`
- Add backend Google verification flow:
  - `apps/web/lib/google.ts` for Google token validation
  - `POST /api/auth/google` for provider sign-in
- Account linking rules:
  - if a linked Google account exists -> sign in that user
  - if no linked account exists but there is a user with the same verified email -> link the Google account to that user
  - if no matching user exists -> create a new `user` account and then link it
- Keep the solution shared between web and mobile:
  - web and Expo mobile can both obtain a Google `id_token`
  - both clients can call the same `/api/auth/google` endpoint
- Security requirements:
  - accept only verified Google emails
  - validate provider token claims (`iss`, `aud`, `sub`)
  - keep error responses generic
  - log auth activity
  - commit the Drizzle migration SQL
- Planned deliverables:
  - Drizzle schema + migration for `oauth_accounts`
  - Google token verification helper
  - `/api/auth/google` endpoint
  - web auth button wiring
  - verification for existing-linked-user / existing-email-user / brand-new-user flows

---

### ФАЗА 3 — Core CRUD (Courses/Modules/Materials/Favorites)
**Цел:** Основният LMS flow

- [x] CRUD endpoints за courses/modules/materials
- [x] Favorites endpoints
- [x] Activity logging
- [x] Dashboard, Course Details, Material View/Edit
- [x] Commit: `feat(crud): courses, modules, materials CRUD with favorites and activity logging`

---

### ФАЗА 4 — Profile + Admin Panel
**Цел:** Пълен ролеви контрол

- [x] Profile страница (name/avatar)
- [x] Admin panel: users + content moderation + logs
- [x] Admin role checks на endpoint ниво
- [x] Commit: `feat(admin): profile page, admin panel with user management and moderation`

---

### ФАЗА 5 — Mobile App (3 screens)
**Цел:** Login + Courses List + Course Details

- [x] Expo API integration
- [x] Auth token storage (expo-secure-store)
- [x] 3 задължителни екрана (Login, Courses List, Course Details)
- [x] Commit: `feat(mobile): add login courses list and course details screens`

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
- [ ] README visual pack (hero + animated previews + badges + collapsible sections)
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

## Optional Backlog (Advanced Features)

- [ ] **File Uploads / Storage Provider:**
  - Да изберем и финализираме storage provider за файлове и аватари (`R2` vs `UploadThing`) според най-лесния учебен setup.
  - Да довършим storage-backed avatar uploads така, че да са напълно конфигурирани и демонстрируеми.
  - Качване на снимки/PDF/docs към материалите.
  - Mobile: Снимане с камерата и директен ъплоуд.
- [ ] **Progress Tracking Module:**
  - `status`: not_started / in_progress / completed.
  - Визуализация на прогреса в Dashboard и Course Details.
- [ ] **Sharing & Permissions:**
  - Споделяне на материали/курсове с други потребители (View-only / Editor).
  - "Shared with me" таб в Dashboard.
- [ ] **AI Интеграция (Gemini):**
  - Автоматично резюме (Summarize) на текстови материали.
  - Генериране на Quiz по съдържанието.
  - AI Chat асистент за въпроси по материалите.
- [ ] **Advanced Security:**
  - Admin 2FA (Emergency rollback & validation).
  - Session hardening policy.
- [ ] **UI/UX Polish:**
  - Framer Motion анимации.
  - PDF export на бележки.
  - Тъмна/Светла тема авто-детект.

---

## README Visual Pack (да не забравим)

- [ ] Анимиран hero banner (SVG или GIF)
- [ ] Анимирани preview блокове за Web и Mobile flow
- [ ] Стилни badges + progress roadmap секция
- [ ] Collapsible `details` секции за clean и подреден README

---

---

## Фаза UI Polish + Feature Parity (активна)

> Последна актуализация: 2026-04-01
> Концепция: StudyHub е **личен бележник** за нещо, което учиш. Не е курс за завършване.

### Работен план (страница по страница)

| # | Страница / Задача | Статус | Описание |
|---|---|---|---|
| 1 | **Home page** | ✅ Завършена | Hero + Features + FAQ; split на компоненти (`components/home/`) |
| 2 | **Materials `[id]`** | ✅ Завършена (v1 parity pass) | Тагове (display + edit), Pin бутон, типове, filter All/Files/Links/Notes, sort |
| 3 | **Course Details `[id]`** | ✅ Завършена (v1 parity pass) | Добавяне на материал с type dropdown, тагове, филтър/сорт, pin |
| 4 | **Dashboard** | ✅ Завършена (v1 parity pass) | Pinned секция, search/filter по тагове, status filter, по-ясни course карти |
| 5 | **Profile** | ✅ Завършена (v1 parity pass) | Премиум hero/avatar layout, модулен account settings UI, password change flow, admin quick actions; storage-backed avatar upload остава за довършване след текущия UI focus |
| 6 | **Sharing** | ⏳ Не започната | Нова таблица `shares`, "Shared with Me" tab, share бутон |
| 7 | **UI компоненти** | 🟡 В процес | ConfirmModal/Toast/Spinner добавени; native `confirm()` flows вече са махнати от Dashboard/Admin, остава по-широк visual polish pass |
| 8 | **Mobile** | ⏳ Блокирана | Expo Go гърми на физически телефон; Android емулатор се инсталира |

### Препоръчан следващ фокус
> Update after Session 66: the Course Details + Materials refinement pass is complete and now restores the original hierarchy with a dedicated module workspace route at `/modules/[id]`. Before the Admin Panel pass, stop for an interface review checkpoint across Dashboard, Course Details, module workspace, material detail, and Profile.

- **1. Public page follow-up: `/how-it-works`**
  - Това е следващият page-sized focus и е подходящ за отделен нов chat.
  - Анимациите трябва да спират, когато секцията не е видима, и да не разчитат на безкрайни loops без нужда.
  - Да се спазва animation guardrail-ът: visibility-gated, interaction-gated и quiet when off-screen.
  - Да се пази модулността: split в `components/how-it-works/`, без монолитен page file, без прекалено големи client islands.
- **2. Course Details + Materials refinement pass**
  - Въпреки че са маркирани като parity-pass завършени, тези екрани още имат нужда от още adaptation polish.
  - Да се мине през module sections, material rows/cards, hierarchy, spacing, title/copy tones, empty states и action clarity.
  - Да се сравнят отново с v1 като UX поток, не само по feature checklist.
- **3. Admin Panel adaptation pass**
  - Голямо парче е и има смисъл да дойде след като modules/materials се усещат наистина довършени.
  - Да се мине през tabs, cards, tables, moderation actions, empty states и destructive flows.
  - Native `confirm()` диалозите вече са мигрирани към `ConfirmModal`; следващият фокус е по-цялостен polish на destructive flows и feedback states.
- **4. Public pages follow-up: `Contact`**
  - `Contact` route вече съществува и долният достъп от home page е възстановен.
  - Остава по-късен polish pass: real submit flow, Tailwind-only cleanup и общо public-site consistency изчистване.
- **5. Sharing / "Shared with Me"**
  - Това е последната голяма v1-style parity функционалност, която още стои като `не е започната`.
  - Изисква schema + API + UI таб/бутон, но дава много добра стойност за adaptation story-то.
- **6. Avatar upload solution**
  - Засега UI-то е честно маркирано като planned / coming soon.
  - Да се върнем към него чак след като има ясен и надежден storage/upload подход за демо.
- **7. AI chatbot parity pass (from v1)**
  - Да остане за след като основните страници са готови.
  - Тогава да се върнем към provider/backend flow, UI entry points и честния demo scope за AI асистента.

### Правила за имплементация
- Всеки файл < 300 реда (без монолити)
- Tailwind only, без inline styles
- Dark mode от ден 1 на всеки компонент
- Shared UI компоненти в `components/ui/`
- Page-specific компоненти в `components/<page-name>/`

### Анализ на v1 (справка)
V1 (Vanilla JS) живее на Vercel. Ключови функции за репликиране:
- Тагове — pill badges на материали, comma-separated edit
- Pin — иконка на карта, pinned sidebar секция
- Material types — file / link / note с цветни иконки
- Filter + sort на materials списъка
- "Shared with Me" tab
- Search в materials

---

## Текущ статус

| Фаза | Статус | Бележки |
|---|---|---|
| Фаза 0: Bootstrap | ✅ MVP | Структурата е готова |
| Фаза 1: DB + Migrations | ✅ MVP | 8 таблици (6 оригинални + milestones + events); schema може да расте |
| Фаза 2: Auth + Guards | ✅ MVP | Работи, но липсва: password reset, email verification, Google sign-in, session management |
| Фаза 3: Core CRUD + Favorites | ✅ MVP | Основен flow работи; липсва: file upload, rich text editor, bulk operations |
| Фаза 4: Profile + Admin | ✅ MVP | Profile parity pass е направен + password change; липсва: финално storage решение за avatars/files, admin dashboard stats, export |
| Фаза 5: Mobile | ✅ MVP | 3 екрана; липсва: favorites, materials view, offline, push notifications |
| Landing Page | 🟡 ~40% | Hero+Features+Stats+FAQ+CTA done; липсва: About секция, scroll анимации |
| UI Polish | 🟡 В процес | ConfirmModal/Toast/Spinner добавени; остава много работа по всички екрани |
| Calendar + Progress | ✅ MVP | Работещи pages + dashboard widgets; нужен polish |
| Фаза 6: Deployment | ⏳ Не е започната | |
| Фаза 7: Docs | ⏳ Не е започната | |

---

## Session 131–132 Update (2026-04-03 / 2026-04-04)

- `/how-it-works` is now **fully complete** — v1 visual parity achieved.
  - Rebuilt as modular sections in `components/how-it-works/`
  - Hero 3D scene geometry, ring scale, and mascot match v1 exactly
  - Background stars span the full hero, not just the canvas
  - Heading text clipping fixed (Shantell Sans cursive 'b')
  - Timeline: AOS-style slide-in animations (Framer Motion, ease-out-cubic)
  - Timeline: scroll-driven progress stroke with CSS `transition-[height]`
  - Timeline: marker pulse rings animate correctly (tailwind `animate-pulse-ring`)
  - Timeline: icon hover micro-reactions (scale + 5° rotate, color fill transition)
  - Timeline: feature tag hover lift effect
  - Icons: all SVG paths corrected (including journal-plus vs. battery confusion)
  - Dark mode support throughout all components
  - No z-index bleed over navbar; `isolate` + `overflow-clip` contain the hero
  - Looping motion is visibility-gated, reduced-motion-aware, and quiet off-screen
  - Public routing intact: Contact in navbar and home-page entry points
- Recommended next focus order:
  - 1. Admin Panel adaptation pass
  - 2. Public pages follow-up: `Contact`
  - 3. Sharing / "Shared with Me"
  - 4. Avatar upload solution
  - 5. AI chatbot parity pass (from v1)
