# StudyHub v2 — Capstone Project Plan

## Обща идея

Пренаписване на StudyHub с нов стек за курса "Full Stack Apps with AI". Същата концепция (LMS за бележки и учебни материали) с нов branding, нови технологии, и опционално — публичен/социален елемент (споделяне на ресурси + favorites + модерация).

## Технологии (задължителни от заданието)

| Слой | Технология |
|---|---|
| Frontend Web | Next.js + React + TypeScript + Tailwind |
| Backend API | Next.js API Routes |
| Database | Neon serverless PostgreSQL + Drizzle ORM |
| Auth | JWT (custom или Auth.js) |
| Мобилно | React Native + Expo |
| Storage | Cloudflare R2 (опционално) |
| Deploy | Vercel или Netlify |

## Архитектура: Монорепо

```
capstone/
├── apps/
│   ├── web/          ← Next.js app (backend API + уеб клиент)
│   └── mobile/       ← Expo app (React Native)
├── packages/
│   └── shared/       ← Споделени типове, utils, API client
├── drizzle/          ← DB schema + миграции
├── docs/             ← Документация + legacy notes
├── AGENTS.md         ← AI agent instructions
├── package.json      ← Root workspace config
└── README.md
```

## Database Schema (6 таблици, Drizzle ORM)

| Таблица | Описание |
|---|---|
| **users** | id, email, name, password_hash, role (user/admin), avatar_url, created_at |
| **courses** | id, title, description, created_by, is_public, status, created_at |
| **modules** | id, course_id (FK), title, order_index, created_by |
| **materials** | id, module_id (FK), title, content, material_type, file_url, tags, created_by |
| **favorites** | id, user_id (FK), material_id (FK), created_at |
| **activity_logs** | id, user_id, action_type, target_id, details (JSON), created_at |

## Екрани — Уеб (7 екрана)

1. Register, 2. Login, 3. Dashboard (courses list), 4. Course Details (modules → materials),
5. Material View/Edit, 6. Profile, 7. Admin Panel

## Екрани — Мобилно (3 екрана)

1. Login, 2. Courses List, 3. Course Details

## Фази на разработка

### Фаза 0: Подготовка — Монорепо + DB setup
### Фаза 1: Auth (JWT + roles)
### Фаза 2: Core CRUD (courses, modules, materials)
### Фаза 3: Admin Panel + Favorites + Activity Logs
### Фаза 4: Mobile App (Expo — 3 screens)
### Фаза 5: Deploy + Documentation
### Фаза 6: Polish (Three.js, animations, R2 storage)

## Scoring Tracker (100 точки)

| Критерий | Макс | План |
|---|---|---|
| GitHub Commits (15+) | 15 | ~20 комита |
| Commit Days (3+) | 15 | 3+ дни |
| Architecture | 5 | Монорепо, REST API |
| Backend API | 7 | Auth + CRUD endpoints |
| Database (4+) | 8 | 6 таблици + миграции |
| Auth & Security | 5 | JWT + роли |
| Web Screens (5+) | 10 | 7 екрана |
| Admin Panel | 10 | User mgmt + moderation |
| Mobile (3+) | 9 | 3 екрана |
| Deployment | 10 | Vercel/Netlify |
| Documentation | 6 | README |

## Отворени въпроси

- Име на проекта — ще се реши по-късно
- Neon акаунт — ще се създаде когато се учи в курса
- Cloudflare R2 — опционално, по-късно
- Социален елемент — ще се реши по-късно
