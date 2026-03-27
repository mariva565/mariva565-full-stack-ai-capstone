# Урок 2: Rate Limiting + Anti-Abuse (Auth / AI Chat / Admin)

## Цел на урока
Да намалим риска от brute-force, spam и resource abuse чрез последователни ограничения на критични потоци и базова наблюдаемост.

Оперативен прогрес:
- `docs/lesson-2-task-tracker.md`
- `docs/security-chat-snapshot.md`

Обхват:
- `login` + `forgot password`
- `register`
- `chat-with-ai` (Edge Function)
- `create-user` / `update-user` / `delete-user` (Edge Functions)

Статус update (2026-03-19):
- Lesson 2 е дефиниран (kickoff).
- Първи задачи са създадени и приоритизирани в Lesson 2 tracker.
- `L2-CHAT-01` е изпълнена (server-side rate limit за `chat-with-ai` + `429` при надвишаване).
- `L2-AUTH-01` е изпълнена (shared auth throttle за login/register/password reset).
- `L2-ADM-01` е изпълнена (admin mutation limiter за `create-user/update-user/delete-user` + `429`).
- `L2-CHAT-02` е изпълнена (429 contract + client-side cooldown визуализация в ChatWidget).
- `L2-OBS-01` е изпълнена (унифицирана anti-abuse event схема за auth/chat/admin блокирания).
- `L2-AUTH-02` е изпълнена (стъпаловиден auth backoff с bounded escalation).
- `L2-ADM-02` е изпълнена (минимален non-sensitive telemetry сигнал за blocked admin burst опити).
- `L2-OBS-02` е изпълнена (оперативен anti-abuse runbook за threshold tuning и response).
- Lesson 2 closeout е изпълнен (validation snapshot + DoD alignment).

## Какво вече е добре
- Login flow вече има client-side cooldown при повтарящи се неуспешни опити.
- Auth entry points вече използват централен `authThrottle` helper с унифицирани cooldown съобщения.
- Auth/admin error mapper-ите вече разпознават rate-limit клас грешки и връщат user-safe съобщения.
- Edge Functions вече имат auth + payload validation и CORS контрол.

## 1) Auth Entry Points Review (Login / Register / Forgot Password)
Файлове:
- `src/pages/login/login.js`
- `src/pages/register/register.js`
- `src/services/authService.js`

Наблюдения:
- Добре: login/register/password reset вече споделят единен client-side throttle слой.
- Добре: reset и register бутони получават същия cooldown UX модел като login.
- Добре: auth cooldown вече е стъпаловиден (ескалира и е ограничен с upper cap).
- Риск: throttle-ът остава client-side (`localStorage`) и не е заместител на server-side лимит.

Задачи:
- `L2-AUTH-01` (P0, done): Добавен е централизиран client-side auth throttle helper за `login/register/password reset`.
  - Done when: всички auth entry points използват единна throttle политика и user-safe cooldown messaging. ✅
- `L2-AUTH-02` (P1, done): Добавена е backoff политика за поредица от auth неуспехи (стъпаловидни cooldown прозорци с горна граница).
  - Done when: при повтаряща се злоупотреба времето за изчакване расте контролирано и UX остава предвидим. ✅

## 2) AI Chat Endpoint Review
Файл:
- `supabase/functions/chat-with-ai/index.ts`

Наблюдения:
- Добре: endpoint-ът валидира auth token и лимитира payload размер/структура.
- Риск: липсва честотен контрол на ниво endpoint за скъпа AI операция.
- Риск: няма стандартизиран `429` отговор с `retry` насока към клиента.

Задачи:
- `L2-CHAT-01` (P0, done): Добавен е server-side rate limit за `chat-with-ai` (по потребител, с прозорец и максимален брой заявки).
  - Done when: при надвишаване се връща `429`, а валидните заявки продължават нормално. ✅
- `L2-CHAT-02` (P1, done): Уеднаквен е `429` contract (`message` + `retryAfterSeconds`) и е добавена клиентска визуализация.
  - Done when: UI показва безопасно съобщение и предвидим retry интервал. ✅

## 3) Admin Mutation Endpoints Review
Файлове:
- `supabase/functions/create-user/index.ts`
- `supabase/functions/update-user/index.ts`
- `supabase/functions/delete-user/index.ts`

Наблюдения:
- Добре: endpoint-ите са ограничени за admin и имат валидация на входа.
- Добре: blocked admin burst опитите вече се логват с унифициран non-sensitive anti-abuse сигнал.

Задачи:
- `L2-ADM-01` (P0, done): Добавен е mutation rate limit за admin write операции.
  - Done when: честотата на create/update/delete е ограничена на ниво admin identity. ✅
- `L2-ADM-02` (P1, done): Блокираните admin burst заявки се логват с минимален, non-sensitive сигнал.
  - Done when: има проследимост без изтичане на чувствителни данни. ✅

## 4) Abuse Monitoring Signals Review
Файлове:
- `src/utils/registerFailureTelemetry.js`
- `src/utils/authErrorMapper.js`
- `src/pages/admin/adminErrorMapper.js`

Наблюдения:
- Добре: има начален слой за нормализиране на auth failure причини.
- Добре: има единна anti-abuse event таксономия за `auth/chat/admin`.
- Добре: има оперативен runbook за tuning на прагове и реакция (`docs/lesson-2-anti-abuse-runbook.md`).

Задачи:
- `L2-OBS-01` (P1, done): Дефинирана е минимална anti-abuse event схема (`event`, `source`, `reason`, `timestamp`, `action`).
  - Done when: chat/auth/admin блокирания могат да се проследяват по унифициран формат. ✅
- `L2-OBS-02` (P2, done): Кратък оперативен runbook за tuning на лимити и response playbook.
  - Done when: екипът има писмена процедура за корекция на прагове след реални сигнали. ✅

## 5) Приоритизиран старт за екипа (следващ спринт)
Препоръчителен ред:
1. Lesson 2 е затворен; продължаваме в `docs/lesson-3-guided-security-review.md`.
2. Следващ приоритет: `L3-CSP-02` (public pages inline cleanup).

## 6) Definition of Done за Урок 2
- Критичните endpoints (`chat-with-ai`, admin write функции) връщат предвидим `429` при надвишен лимит.
- Auth entry points имат единна anti-abuse cooldown политика.
- Блокираните заявки се сигнализират по минимален, non-sensitive формат.
- Smoke тестът покрива поне един over-limit сценарий за auth и chat.

## 7) Security Smoke Checklist (ръчен)
- Повтарящи се login/register/reset опити активират cooldown без изтичане на чувствителни детайли.
- `chat-with-ai` връща `429` при burst заявки и UI показва user-safe retry съобщение.
- Admin burst create/update/delete опити се ограничават предвидимо.
- При блокиране има проследим telemetry сигнал без PII/secret leak.

Текуща валидация (2026-03-19):
- `npm.cmd run test` -> PASS
- `npm.cmd run build` -> PASS
- `npm.cmd run test:e2e` -> PASS

