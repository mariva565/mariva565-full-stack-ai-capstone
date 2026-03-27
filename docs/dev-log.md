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

**Commit count:** 5 (target: 15+)
**Commit days:** 1 (target: 3+)

**Текуща фаза:** Фаза 2 — Auth + JWT (не е започната)

**Следващи стъпки:**
- `lib/db.ts` — Drizzle client instance
- `lib/jwt.ts` — sign/verify JWT
- `lib/auth.ts` — password hashing
- `middleware.ts` — JWT guard за защитени routes
- Auth API endpoints (register, login, logout, me)
- Login + Register web pages
