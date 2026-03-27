# Урок 1: Guided Security Review (Login / Register / Materials / Admin)

## Цел на урока
Да направим практичен security review по ключовите екрани и да извадим конкретни задачи за екипа.

Оперативен прогрес:
- `docs/lesson-1-task-tracker.md`
- `docs/security-chat-snapshot.md`

Обхват:
- `login`
- `register`
- `materials`
- `admin`

Статус update (2026-03-18):
- `L1-MAT-01` е изпълнена.
- `L1-ADM-01` е изпълнена.
- `L1-ADM-02` е изпълнена.
- `L1-LOGIN-01` е изпълнена.
- `L1-REG-01` е изпълнена.
- `L1-MAT-03` е изпълнена.
- `L1-MAT-02` е изпълнена.
- `L1-LOGIN-02` е изпълнена.
- `L1-REG-02` е изпълнена.
- `L1-ADM-03` е изпълнена.
- `L1-ADM-04` е изпълнена.
- `L1-LOGIN-03` е изпълнена.
- `L1-REG-03` е изпълнена.

## Какво вече е добре
- Има централизирана политика за силна парола (`src/utils/passwordPolicy.js`).
- Има XSS hardening за rich notes (`sanitizeRichHtmlNote` в `materialsHandlers.js`).
- Има backend hardening в Edge Functions (auth + payload checks за admin/chat функции).

## 1) Login Screen Review
Файлове:
- `src/pages/login/login.js`
- `src/login.html`
- `src/services/authService.js`

Наблюдения:
- Добре: submit бутонът се disable-ва при login заявка.
- Добре: login/OAuth грешките минават през централен auth error mapper с user-safe съобщения.
- Риск: много външни CDN ресурси без CSP/SRI baseline.

Задачи:
- `L1-LOGIN-01` (P1, done): Добавен е централен `auth error mapper`; UI показва само user-safe съобщения.
  - Done when: UI не показва сурови provider/backend грешки. ✅
- `L1-LOGIN-02` (P1, done): Добавен client-side cooldown след поредица неуспешни login опити (timed lock + feedback).
  - Done when: многократни опити блокират бутона временно + ясна обратна връзка. ✅
- `L1-LOGIN-03` (P2, done): Добавен/валидиран е secure `forgot password` flow.
  - Done when: потребител може сигурно да инициира reset. ✅

## 2) Register Screen Review
Файлове:
- `src/pages/register/register.js`
- `src/register.html`

Наблюдения:
- Добре: strong password проверка е налична.
- Добре: `fullName` вече има client-side trim + дължина (2-120) валидация преди submit.
- Риск: сурови backend грешки към UI (`Registration failed: ...`).

Задачи:
- `L1-REG-01` (P1, done): Добавена client-side валидация за `fullName` (trim + нормализация на интервали + 2-120 символа).
  - Done when: невалидни стойности не стигат до backend. ✅
- `L1-REG-02` (P1, done): Register flow вече използва user-safe auth error mapper.
  - Done when: не се показва сурова backend/provider грешка. ✅
- `L1-REG-03` (P2, done): Добавена е telemetry логика за неуспешни register опити без clear-text чувствителни данни.
  - Done when: има наблюдаемост без чувствителен data leak. ✅

## 3) Materials Screen Review
Файлове:
- `src/pages/materials/materials.js`
- `src/pages/materials/materialsRenderer.js`
- `src/pages/materials/materialsHandlers.js`

Наблюдения:
- Добре: `sanitizeRichHtmlNote` и safe URL логика вече са налични.
- Добре: inline `onclick` в `renderCourseList` е премахнат; навигацията е през event listeners + `encodeURIComponent`.
- Риск: `window.open(..., '_blank')` се ползва на няколко места без explicit `noopener/noreferrer` защита на ниво API call.

Задачи:
- `L1-MAT-01` (P0, done): Премахнат inline `onclick` от `renderCourseList`; използвани са event listeners + `encodeURIComponent` за ID.
  - Done when: няма inline JS в генерирания card HTML. ✅
- `L1-MAT-02` (P1, done): Добавен е централен helper за безопасно new-tab отваряне и materials сценарии минават през него.
  - Done when: всички new-tab сценарии минават през helper. ✅
- `L1-MAT-03` (P1, done): Добавени unit тестове за sanitizer-а (`script`, `onerror`, `javascript:`, `data:` URL edge cases).
  - Done when: има test suite, който хваща регресии в XSS hardening. ✅

## 4) Admin Screen Review
Файлове:
- `src/admin.html`
- `src/pages/admin/admin.js`
- `src/pages/admin/adminRenderer.js`
- `src/pages/admin/adminService.js`

Наблюдения:
- Добре: admin actions минават през Edge Functions с bearer token.
- Добре: debug `window.onerror` overlay е премахнат от production HTML.
- Добре: inline `onclick/onchange` handlers са премахнати от `admin.html` и прехвърлени към JS listeners.
- Риск: `avatar_url` се вкарва директно в `<img src="...">` без sanitize helper.

Задачи:
- `L1-ADM-01` (P0, done): Премахнат production `window.onerror` debug overlay от `src/admin.html`.
  - Done when: няма HTML injection от runtime error strings. ✅
- `L1-ADM-02` (P0, done): Премахнати inline handlers от admin UI (`onclick/onchange` в `admin.html` и inline `onerror` във fallback шаблон в `admin.js`); прехвърлени към listeners.
  - Done when: admin page е съвместима със strict CSP без `unsafe-inline`. ✅
- `L1-ADM-03` (P1, done): Добавен е safe URL helper за avatar `src` (allowlist `https/http/blob` + fallback image).
  - Done when: невалиден/опасен avatar URL не се рендерира директно. ✅
- `L1-ADM-04` (P1, done): Нормализирани са user-facing error messages за admin operations.
  - Done when: internal stack/provider messages не се показват директно. ✅

## 5) Приоритизиран старт за екипа (първи спринт)
Следващи приоритети след последния update:
1. Lesson 1 е затворен (DoD + smoke checklist изпълнени).
2. Подготовка за Lesson 2 (`Rate Limiting + Anti-Abuse`).
3. Дефиниране на първи Lesson 2 implementation задачи.

## 6) Definition of Done за Урок 1
- Няма inline JS handlers в прегледаните екрани.
- Няма сурови backend/provider грешки директно в toast/alert.
- Има автоматични тестове за sanitizer edge cases.
- Security smoke check е минат за login/register/materials/admin.

## 7) Security Smoke Checklist (ръчен)
- Login с грешни данни не издава чувствителни вътрешни грешки.
- Register с невалидно име/парола се блокира преди заявка.
- Materials рендер на rich note не изпълнява скриптове/inline handlers.
- Admin page не инжектира HTML от runtime errors.
- Всички new-tab действия работят с безопасни опции.

Текуща валидация (2026-03-18):
- `npm.cmd run test` -> PASS
- `npm.cmd run build` -> PASS
- `npm.cmd run test:e2e` -> PASS
- Inline handler scan за reviewed screens (`login/register/materials/admin`) -> PASS

