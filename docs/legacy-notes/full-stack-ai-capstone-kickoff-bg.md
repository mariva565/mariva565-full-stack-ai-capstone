# Full Stack Apps with AI: Стартов План (BG)

## 1) Цел на документа
Този файл е практична инструкция как да стартираме **новия capstone проект** в чисто нова папка, без да смесваме код със стария проект, но с възможност да ползваме стари уроци чрез `legacy-reference/`.

## 1.1) Как работи заедно с вече наличната документация
Имаме вече силна база в:
- `docs/capstone-foundation-plan.md`
- подробната `docs/*security*.md` документация

За да няма дублиране:
- `docs/capstone-foundation-plan.md` е **стратегически master** (scope, идеи, риск, timeline, quality gates).
- Този файл (`full-stack-ai-capstone-kickoff-bg.md`) е **оперативен стартов чеклист** за нов repo.
- Security документите са **policy + runbook слой** и се реферират, не се пренаписват.

## 2) Къде работим
Работим в **нова root папка** и **нов GitHub repo**.

Препоръчани пътища:
- Нов проект: `C:\Users\mariy\Projects\fullstack-ai-capstone`
- Стар проект (само за референция): `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3`

## 3) Структура на новия проект
```text
fullstack-ai-capstone/
  AGENTS.md
  README.md
  .gitignore
  apps/
    web/          # Next.js (Web UI + API)
    mobile/       # Expo React Native app
  packages/
    db/           # Drizzle schema + migrations
    shared/       # Shared types / API client helpers
  docs/
    architecture.md
    database-schema.md
    setup.md
  legacy-reference/
    notes.md
    security-checklist.md
    deployment-checklist.md
```

## 4) Какво влиза в `legacy-reference/`
Слагаме само:
- бележки
- checklist-и
- примерни payload-и/скрийншоти
- връзки към ключови legacy документи, които ползваме като стандарт

Не слагаме:
- `.env` файлове
- `node_modules`
- стари миграции за директен reuse
- copy-paste на стар production код

## 4.1) Препоръчан initial docs packet за новия repo
При създаване на новия проект пренасяме като документация (не код):
- `docs/capstone-foundation-plan.md`
- `docs/security-playbook-bg.md`
- `docs/production-security-release-checklist.md`
- `docs/security-alerting-runbook.md`
- `docs/security-env-secrets-inventory.md`
- `docs/security-observability-baseline.md`
- `docs/admin-session-hardening-policy.md`
- `docs/admin-2fa-validation-checklist.md`

Тези файлове се адаптират към новите технологии (Next.js + Expo + Drizzle + Neon).

## 5) Security адаптация от стария проект
Пренасяме принципите, не кода 1:1:
- JWT auth (`register/login/logout`)
- роли: `user` и `admin`
- server-side validation на входа
- password hashing (`argon2` или `bcrypt`)
- access control във всеки защитен endpoint
- сигурно съхранение на токени:
  - Web: `httpOnly` cookie
  - Mobile: `Expo SecureStore`
- централен auth middleware + безопасни error съобщения

## 5.1) Security done criteria за новия проект
- Всеки защитен endpoint проверява JWT + role.
- Няма admin действие без server-side authorization check.
- Всички входни данни минават през schema validation.
- Secrets са само в env vars (без хардкод в repo).
- Има кратък security verification pass преди deploy.

## 6) Минимален scope за висока оценка
Тема: Task / Study Planner

Минимум:
- 4+ таблици (напр. `users`, `projects`, `tasks`, `comments`)
- 5+ web екрана
- 3+ mobile екрана
- admin panel (или отделен admin workflow)
- live deployment
- 15+ комита в 3+ различни дни

## 7) План по дни (beginner-friendly)
1. Ден 1: Монорепо scaffold + Next.js + Expo + първи commit-и.
2. Ден 2: DB schema + Drizzle migrations + seed/demo данни.
3. Ден 3: Auth + роли + защитени API endpoints.
4. Ден 4: Web екрани (минимум 5), responsive.
5. Ден 5: Mobile екрани (минимум 3) + API интеграция.
6. Ден 6: Admin polish + deploy + документация + финална проверка.

## 8) Commit стратегия (за rubric-а)
Правило: малки, смислени, работещи стъпки.

Примерни commit теми:
1. `init monorepo structure`
2. `add nextjs web app scaffold`
3. `add expo mobile scaffold`
4. `setup drizzle config and db package`
5. `add initial db schema (users/projects/tasks/comments)`
6. `add first migration scripts`
7. `implement register/login api`
8. `add jwt middleware and role guards`
9. `create dashboard and task list screen (web)`
10. `add task CRUD endpoints`
11. `add admin panel base`
12. `connect mobile login to api`
13. `connect mobile task list/details`
14. `deploy web app and set env vars`
15. `add final docs and demo credentials`

## 9) Definition of Done (минимум)
- App работи локално: web + mobile.
- Всички основни потоци са тествани с demo user и admin.
- Има SQL миграции в repo.
- Има `AGENTS.md` и пълна документация в `docs/`.
- Има live URL + sample credentials в README.

## 10) Бърз старт checklist
- [ ] Създадена нова папка и нов GitHub repo
- [ ] Монорепо структура с `apps/` и `packages/`
- [ ] Настроени Next.js, Expo, Drizzle, Neon
- [ ] Имплементирани auth + roles
- [ ] Направени required екрани (web + mobile)
- [ ] Добавени миграции и документация
- [ ] Deployment + demo credentials
