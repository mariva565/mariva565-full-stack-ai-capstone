# Dev Log — StudyHub v2

Дневник на разработката. Обновява се при всяка сесия.

---

## 2026-03-27

### Сесия 1 (вечер)

**Какво направихме:**
- Обсъдихме проекта, решихме да преработим StudyHub v1 с нов стек
- Прегледахме стария проект и legacy notes
- Уточнихме всички функции и взехме решения (без MFA, Vercel, R2, Gemini)
- Написахме пълен implementation plan (`docs/implementation-plan.md`)
- Поправихме README (махнахме счупени SVG, fix `copy`→`cp`, optional→planned)
- **Фаза 0** — потвърдена завършена (монорепо scaffold съществуваше)
- **Фаза 1** — завършена:
  - Инсталирахме Drizzle ORM + Neon driver + bcryptjs
  - Създадохме `drizzle/schema.ts` с 6 таблици (users, courses, modules, materials, favorites, activity_logs)
  - Генерирахме SQL миграция (`drizzle/migrations/0000_init.sql`)
  - Създадохме Neon акаунт и база данни (EU Central)
  - Push-нахме schema към Neon
  - Seed-нахме demo users (admin + user)
  - Тествахме: DB connection ✅, 6 tables ✅, Next.js стартира ✅
  - Commit + push: `feat(db): add Drizzle schema with 6 tables and Neon integration`
  - Сменихме Neon паролата (старата е невалидна)

- **Фаза 2** — завършена:
  - `lib/db.ts` — Drizzle client с Neon
  - `lib/jwt.ts` — sign/verify JWT с jose (Edge-compatible)
  - `lib/auth.ts` — bcrypt password hashing
  - `middleware.ts` — JWT guard за защитени routes + admin-only paths
  - 4 API endpoints: register, login, logout, me
  - Login + Register страници (responsive + dark mode)
  - Tailwind dark mode включен (class strategy)
  - Тествано: login ✅, register ✅, /me ✅, build ✅, browser ✅
  - Commit + push: `feat(auth): JWT auth with register, login, logout and role-aware middleware`

- **Фаза 3** — завършена:
  - `lib/api-utils.ts` — requireAuth + requireAdmin helpers
  - `lib/activity.ts` — logActivity helper
  - API: full CRUD за courses, modules, materials
  - API: favorites (add/list/remove) с unique constraint
  - Dashboard страница — list courses, create, delete
  - Course Details страница — modules с materials, add/delete
  - Material View/Edit страница — view, edit, delete
  - Всички страници responsive + dark mode
  - Build ✅
  - Commit + push: `feat(crud): courses, modules, materials CRUD with favorites and activity logging`
  - Обновихме AGENTS.md с code quality правила и handoff инструкции

- **Фаза 4** — завършена:
  - `PUT /api/auth/me` — profile update (name, avatarUrl) с activity logging
  - Profile страница — avatar display (initials fallback), edit name/avatar, read-only email/date
  - Admin API: `GET /api/admin/users`, `PUT /api/admin/users/:id` (role change), `DELETE /api/admin/users/:id`
  - Admin API: `GET /api/admin/materials`, `DELETE /api/admin/materials/:id`
  - Admin API: `GET /api/admin/activity-logs` (с limit param)
  - Admin panel: 3 таба (Users, Materials, Activity Logs)
  - Users tab: role dropdown, delete user с cascade cleanup
  - Materials tab: показва course/author, admin delete
  - Activity tab: последни действия с user info и details JSON
  - Всички компоненти разделени (<300 lines): `components/admin/{users,materials,activity}-tab.tsx`
  - Self-protection: admin не може да изтрие себе си или да смени своята роля
  - Build ✅

**Commit count:** 8 (target: 15+)
**Commit days:** 1 (target: 3+)

**Текуща фаза:** Фаза 5 — Mobile App (не е започната)

**Следващи стъпки:**
- Expo app: Login, Courses List, Course Details (3 екрана)
- `.env` трябва да е копиран и в `apps/web/.env` за build да работи
