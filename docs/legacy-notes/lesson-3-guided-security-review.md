# Урок 3: CSP + Inline Script Cleanup

## Цел на урока
Да подготвим приложението за по-строга Content-Security-Policy (без `unsafe-inline`) чрез поетапно премахване на inline script/handler модели.

Оперативен прогрес:
- `docs/lesson-3-task-tracker.md`
- `docs/security-chat-snapshot.md`

Обхват:
- `login`
- `register`
- `index`
- `maintenance`
- `how-it-works`
- `modules`

Статус update (2026-03-19):
- Lesson 3 е стартиран (kickoff).
- Дефинирани са първите task ID за CSP cleanup.
- `L3-CSP-01` е изпълнена (inline script cleanup за auth pages).
- `L3-CSP-02` е изпълнена (index/maintenance inline handler и script cleanup към външни page-init файлове).
- `L3-CSP-03` е в прогрес (завършени са `how-it-works` + `modules` slices; остават следващите публични страници).

## Какво вече е добре
- Auth flow-овете имат централизирани anti-abuse контроли от Lesson 2.
- `login` и `register` вече са без inline script блокове.
- `index` и `maintenance` вече са без inline handler атрибути и без inline script блокове.
- `how-it-works` вече е без inline script блок и използва централизиран page-init модул.
- `modules` вече е без inline script блокове и без runtime inline `onclick` handlers.
- Има по-ясно разделение между HTML markup и page-init логика.

## 1) Auth Pages Inline Script Review
Файлове:
- `src/login.html`
- `src/register.html`
- `src/pages/login/loginPageInit.js`
- `src/pages/register/registerPageInit.js`

Наблюдения:
- Добре: theme toggle, AOS init и mascot UI логиката вече са изнесени в модулни JS файлове.
- Добре: `login/register` HTML вече използват само външни `<script src=...>` включвания.
- Риск: останалите публични страници все още имат inline модели.

Задачи:
- `L3-CSP-01` (P0, done): Премахнати inline script блокове от `login/register`; добавени отделни init модули.
  - Done when: auth страниците не съдържат inline script блокове и поведението остава същото. ✅

## 2) Public Pages CSP Gap Review
Файлове:
- `src/index.html`
- `src/maintenance.html`
- `src/how-it-works.html`
- `src/pages/how-it-works/howItWorksPage.js`
- `src/modules.html`
- `src/pages/modules/modules.js`
- `src/pages/modules/modulesPageInit.js`

Наблюдения:
- Добре: `index/maintenance/how-it-works/modules` са преминали към външни script файлове и са съвместими с по-строг CSP подход.
- Добре: `modules` runtime action бутоните вече са event-delegated и не rely-ват на inline `onclick`.
- Риск: има remaining inline script модели в други публични шаблони (`courses/contact/materials`).

Задачи:
- `L3-CSP-02` (P1, done): Премахване на remaining inline handlers и прехвърляне на first-wave high-impact inline script блокове към външни файлове (`index/maintenance`).
  - Done when: `index/maintenance` нямат inline handler атрибути и поне един голям inline script блок е модуларизиран. ✅
- `L3-CSP-03` (P1, in_progress): Продължаване на inline cleanup за останалите публични страници в малки поетапни slices.
  - Progress: `how-it-works` slice е завършен (inline script изнесен в `howItWorksPage.js` и са премахнати inline handler стилови присвоявания в lightbox частта). ✅
  - Progress: `modules` slice е завършен (AOS/chat init са изнесени в `modulesPageInit.js`, а action бутоните са мигрирани от inline `onclick` към `data-action` + delegation). ✅
  - Done when: `courses/contact/materials` са мигрирани към външни page-init скриптове без inline handlers.

## 3) Приоритизиран старт за екипа (следващ спринт)
Препоръчителен ред:
1. `L3-CSP-03` (по една страница на chat; следващ фокус `courses`).
2. Обновяване на CSP readiness note след всяка вълна cleanup.

## 4) Definition of Done за Урок 3 (чернова)
- Ключовите публични страници са без inline event handlers.
- Критичните inline script блокове са изнесени в module файлове.
- Няма регресия в auth/public UX след cleanup.
- `test/build` минават успешно след всяка стъпка.
