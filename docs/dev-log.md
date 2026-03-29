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

---

## 2026-03-28

### Сесия 2

**Какво направихме:**

- **Фаза 5** — завършена (Mobile App, 3 екрана):
  - Backend: добавихме Bearer token поддръжка в `requireAuth` (cookie + Authorization header)
  - Backend: login/register API-та вече връщат `token` в response body (за mobile storage)
  - `lib/api.ts` — API клиент с SecureStore за token persistence, platform-aware base URL
  - `lib/auth-context.tsx` — AuthProvider с auto-login check, login/logout
  - `app/_layout.tsx` — AuthGate: автоматичен redirect към login/courses
  - **Login екран** — email/password форма, error handling, demo credentials hint
  - **Courses List екран** — FlatList с pull-to-refresh, course cards с status badge, welcome bar, logout
  - **Course Details екран** — course info card, expandable modules, lazy-loaded materials с type icons и tags
  - Инсталирахме `expo-secure-store` за secure token storage
  - Fix: `@types/react` override в root `package.json` (deduplicate 19.0.14 vs 19.0.4 от react-native)
  - Fix: explicit `jsx: "react-jsx"` в mobile tsconfig (VS Code IDE compatibility)
  - Web build ✅, Mobile typecheck ✅

- CORS headers добавени в middleware за cross-origin API достъп (mobile web preview)
- Тествано: Expo web preview ✅ (login → courses list → course details с модули и материали)
- Expo Go на физическо устройство: "failed to download remote update" — за разследване по-късно
- Commit + push: `feat(mobile): add login, courses list and course details screens`

**Commit count:** 9 (target: 15+)
**Commit days:** 2 (target: 3+)

**Текуща фаза:** Фаза 5 завършена, Фаза 6 отложена

**Решение:** Deployment (Фаза 6) се отлага. Причина: безплатни планове на Netlify/Vercel — при всеки commit се deploy-ва и кредитите ще свършат. Първо ошлайфваме UI, после deploy-ваме наведнъж.

**Следващи стъпки:**
- UI polish и ошлайфване на уеб екраните
- Фаза 6: Deployment (когато UI е готов)
- Фаза 7: Documentation (README + architecture + DB diagram)

### Session 3 (Expo Go stability investigation)

**What we did:**
- Investigated Expo Go startup crash: "failed to download remote update" on physical device.
- Ran `npx expo-doctor`; initial failure showed missing required peer dependency `expo-constants` (required by `expo-router`).
- Installed SDK-compatible dependency with `npx expo install expo-constants` (resolved to `~17.1.8`).
- Re-ran `npx expo-doctor --verbose`: **17/17 checks passed**.
- Ran `npx expo install --check`: dependencies reported **up to date**.
- Verified there are **no canary versions** in `package.json` or `package-lock.json` (`NO_CANARY_MATCHES`).

**Notes:**
- The canary mention seen during doctor run was for temporary `expo-doctor` execution package (`npx`), not a project dependency.
- Current mobile dependency state is compatible with Expo SDK 53.

### Session 4 (Mobile script ergonomics)

**What we did:**
- Added mobile-local scripts so tunnel/LAN startup works directly from `apps/mobile` shell.
- New scripts in `apps/mobile/package.json`:
  - `dev:mobile:tunnel` -> `expo start --tunnel -c`
  - `dev:mobile:lan` -> `expo start --host lan -c`
- Verified script availability with `npm run --workspace=@studyhub/mobile`.

**Result:**
- `PS apps/mobile> npm run dev:mobile:tunnel` now works from the mobile folder.

### Session 5 (Tunnel timeout + mobile API base hardening)

**Issue observed:**
- `expo start --tunnel -c` failed with `CommandError: ngrok tunnel took too long to connect`.

**What we changed in code:**
- Reworked `apps/mobile/lib/api.ts` to remove hardcoded LAN IP.
- API base URL now resolves in this order:
  1. `EXPO_PUBLIC_API_URL` (if provided)
  2. Expo dev host (auto-detected from `expoConfig.hostUri`)
  3. Platform fallback (`10.0.2.2` for Android emulator / localhost for others)
- Added `EXPO_PUBLIC_API_URL` placeholder to `.env.example`.

**Why:**
- Tunnel failures are usually network-level (ngrok/VPN/firewall), but mobile API calls should not depend on manually edited LAN IP and should adapt automatically.

### Session 6 (Android USB fallback fully wired)

**What we did:**
- Added USB-based mobile startup scripts to avoid ngrok tunnel dependency:
  - root: `dev:mobile:usb`, `dev:mobile:android:usb`
  - mobile: `usb:reverse`, `dev:mobile:usb`, `android:usb`
- Added `apps/mobile/scripts/usb-reverse.js`:
  - auto-detects `adb` from PATH, `ANDROID_SDK_ROOT`/`ANDROID_HOME`, Android SDK default path, and Winget install path
  - starts ADB server
  - applies `adb reverse` for required ports (`8081`, `3000`, `19000-19002`)
  - returns clear error when no Android device is detected
- Updated README with Android USB fallback usage steps.
- Installed Android SDK Platform-Tools (`Google.PlatformTools`) via Winget to provide `adb`.

**Validation:**
- Scripts are listed in both root and mobile workspaces.
- `usb:reverse` now runs and reaches device detection (fails with clear message when no USB device is connected).

### Session 7 (SDK 54 compatibility recovery + simplified USB launch)

**Goal:**
- Resolve Expo Go incompatibility (`Expo Go SDK 54` vs project `SDK 53`) and stop prolonged setup loop.

**What we did:**
- Upgraded mobile workspace to Expo SDK 54 stack (`expo ~54`, RN/React/Router aligned).
- Resolved dependency conflicts (`@types/react` override and clean reinstall path).
- Performed full clean reinstall to remove mixed SDK 53/54 artifacts.
- Verified with `expo-doctor --verbose`: **17/17 checks passed**.
- Started USB localhost workflow and confirmed:
  - Metro listening on `:8081`
  - ADB reverse mappings active (`8081`, `3000`, `19000-19002`)
  - Expo Go launch intent sent to device (`exp://127.0.0.1:8081`)

**Result:**
- Project is now SDK 54 compatible and launched through USB localhost flow.

### Session 8 (Runtime 500 stabilization)

**Issue:**
- Expo Go showed a red screen with runtime `500` after initial app load.

**Root cause found:**
- A stale `next start` process was occupying port `3000`.
- New `dev:web` then started on `3001`, while mobile API client still targeted `http://localhost:3000` via USB reverse.
- Mobile app requests were hitting the wrong backend process.

**Fix applied:**
- Stopped stale Next.js processes.
- Relaunched web dev server and confirmed it runs on `http://localhost:3000`.
- Confirmed Metro on `http://localhost:8081`.
- Re-applied ADB reverse mappings and relaunched Expo Go URL (`exp://127.0.0.1:8081`).

**Result:**
- Correct port alignment restored (`web=3000`, `metro=8081`).

### Session 9 (Structured mobile handoff created)

**What we added:**
- New detailed handoff/playbook document for phone testing:
  - `docs/mobile-phone-testing-handoff.md`
- README updated:
  - Expo badge updated to SDK 54
  - Added explicit link to the mobile phone testing playbook

**Purpose:**
- Prevent repeated setup loops and preserve a deterministic mobile testing path for next sessions.

### Session 10 (Expo Go — РЕШЕНО + UI планиране)

**Expo Go на физически телефон — РАБОТИ. Ето какво беше проблемът:**

**1. Monorepo + Expo Router entry point**
- Expo търсеше стар `App.js` файл, но проектът е в `apps/mobile` с `expo-router`.
- Решение: Създадохме `apps/mobile/index.js` с `import "expo-router/entry"` и сменихме `"main": "index.js"` в `package.json`.

**2. Windows Firewall + мрежов профил**
- WiFi мрежата беше на "Public" → Windows блокираше входящи връзки от телефона.
- Решение: Сменихме на **Private** + разрешихме Node.js в Firewall при prompt.
- LAN режимът (`--host lan`) работи след тези промени.

**3. Тунел като fallback**
- `--tunnel` (ngrok) заобикаля firewall проблемите но е по-бавен и понякога timeout-ва.
- За стабилна работа: **LAN + Private мрежа** е по-добро от тунел.

**4. API URL**
- Създадохме `apps/mobile/.env` с `EXPO_PUBLIC_API_URL=http://192.168.1.9:3000`.
- Metro зарежда `.env` автоматично — потвърдено от `env: export EXPO_PUBLIC_API_URL` в лога.

**5. Сив екран / навигация**
- `useRootNavigationState()` в `_layout.tsx` изчаква навигацията да се инициализира преди redirect.

**Golden path за следващ път:**
1. WiFi мрежа на "Private" (еднократна настройка)
2. `npm run dev:web` (терминал 1)
3. `npm --workspace @studyhub/mobile run dev:mobile:lan` (терминал 2)
4. В Expo Go въведи: `exp://192.168.1.9:8081`

---

### Session 10 (Expo Go deep investigation + UI планиране)

**Expo Go — root cause идентифициран:**
- Махнахме `eas.projectId` и `owner` от `app.json` (причиняваха OTA update check към EAS сървъри).
- Махнахме deprecated `expo-router/babel` от `babel.config.js`.
- Потвърдено: телефонът достига Metro (bundle се изтегля за 93ms кеширано).
- Дори минимален "Hello World" layout гърми → проблемът е в Expo Go app-а на устройството, не в кода.
- **Решение:** Инсталиран Android Studio + емулатор (Pixel 8, API 37, изтегля се). Ще се ползва вместо физически телефон.

**UI планиране — анализ на v1:**
- Прегледан живия v1 проект за справка.
- Идентифицирани липсващи функции в v2 спрямо v1.
- Уточнена концепцията: StudyHub е **личен бележник**, не курс за завършване → progress tracking не е подходящ.

**Следващи стъпки — работен план:**
- Виж секция "Фаза UI Polish + Feature Parity" в `docs/implementation-plan.md`.
- Следващата задача: **Home page** (hero + features + faq, split компоненти).

---

## 2026-03-29

### Session 11 (Home page + React dedup fix)

**Какво направихме:**

**Home страница — завършена:**
- `components/home/hero.tsx` — mini-nav + hero с badge, headline, 2 CTA бутона, gradient blob
- `components/home/features.tsx` — 6 feature карти в responsive grid (1→2→3 колони)
- `components/home/faq.tsx` — accordion FAQ с 5 въпроса (client component, анимирана + иконка)
- `app/page.tsx` — 16 реда, само импорти + footer
- `app/layout.tsx` — премахнат hardcoded `className="dark"` → светла тема по подразбиране

**Бъг: дублиран React instance в монорепо (критичен, блокира build)**

_Симптом:_ `npm run build` гърми с `TypeError: Cannot read properties of null (reading 'useContext')` при prerender на `/404`.

_Root cause:_ npm workspace hoisting конфликт:
- `apps/mobile` изисква `react@19.1.0` → hoisted на root като `node_modules/react@19.1.0`
- `apps/web` имаше `react@19.0.0` → npm го инсталира в `apps/web/node_modules/react@19.0.0`
- `react-dom` се закача към root (19.1.0), но Next.js `_error.js` изпълнява `useContext` с web instance (19.0.0) → `null`

_Fix:_
1. Синхронизирахме версията: `apps/web/package.json` → `react: "19.1.0"`, `react-dom: "19.1.0"` (точно, без `^`)
2. Изтрихме всички `node_modules/` и `package-lock.json` от root
3. `npm install` от нулата → npm deduplica и ползва само root 19.1.0

_Ако се повтори:_
```bash
rm -rf node_modules apps/web/node_modules apps/mobile/node_modules package-lock.json
npm install
```
Провери след това:
```bash
node -e "try{console.log('web:', require('./apps/web/node_modules/react/package.json').version)}catch(e){console.log('web: deduped OK')}; console.log('root:', require('./node_modules/react/package.json').version)"
# Трябва: web: deduped OK / root: 19.1.0
```

**Build ✅ — 26 routes, `/` = 106 kB First Load JS**

### Session 12 (Feature parity pass for Course Details + Material pages)

**What we implemented:**
- Added shared UI primitives in `apps/web/components/ui/`:
  - `confirm-modal.tsx` (replaces browser `confirm()`)
  - `toast.tsx`
  - `spinner.tsx`
- Added material/domain helpers:
  - `apps/web/lib/materials.ts` (type normalization, tag parsing/serialization)
  - `apps/web/lib/course-materials.ts` (filter/search/sort helpers)
  - `apps/web/lib/http.ts` (`readErrorMessage`)
- Refactored Course Details page (`/courses/[id]`) into smaller components:
  - `components/course/course-workspace-header.tsx`
  - `components/course/module-list.tsx`
  - `components/course/module-section.tsx`
  - `components/course/material-row.tsx`
- Upgraded `/courses/[id]` functionality:
  - Material create form supports `type`, `tags`, `fileUrl`
  - Global material filter: `All / Notes / Links / Files`
  - Sorting: `Newest / Oldest / Title`
  - Search across title/content/tags
  - Pin/unpin from list via `/api/favorites`
  - Delete module now uses `ConfirmModal`
  - Toast feedback on create/delete/pin actions
- Refactored Material page (`/materials/[id]`) into smaller components:
  - `components/materials/material-editor-form.tsx`
  - `components/materials/material-view-panel.tsx`
- Upgraded `/materials/[id]` functionality:
  - Edit now includes `type`, `tags`, `fileUrl`
  - Tag pills in read mode
  - Pin/unpin via `/api/favorites`
  - Delete now uses `ConfirmModal`
  - Loading state uses `Spinner`
  - Success/error feedback via `Toast`

**Quality checks:**
- `npm.cmd --workspace @studyhub/web run typecheck` PASS
- `npm.cmd --workspace @studyhub/web run build` PASS
  - Initial sandboxed build failed with `spawn EPERM`; rerun outside sandbox succeeded.

**Code quality constraints validated:**
- Page files remain within 300-line rule:
  - `apps/web/app/courses/[id]/page.tsx` = 300 lines
  - `apps/web/app/materials/[id]/page.tsx` = 258 lines
