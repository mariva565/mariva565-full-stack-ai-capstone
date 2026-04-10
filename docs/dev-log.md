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
  - Google OAuth: production SHA-1 (от EAS Build), consent screen → "Published", redirect URIs с production домейн, env vars в EAS
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

### Session 13 (Dashboard redesign + pinned parity)

**What we implemented:**
- Rebuilt `apps/web/app/dashboard/page.tsx` with a new dashboard layout and behavior:
  - Hero section with workspace summary cards (courses, drafts, pinned)
  - Course search + status filter (`all/draft/published`)
  - New course form integrated in-page
  - `ConfirmModal` used for course deletion (removed browser `confirm()` here)
  - Toast feedback on create/delete errors and success
- Added dashboard UI components:
  - `apps/web/components/dashboard/dashboard-hero.tsx`
  - `apps/web/components/dashboard/create-course-form.tsx`
  - `apps/web/components/dashboard/course-filters.tsx`
  - `apps/web/components/dashboard/course-card.tsx`
  - `apps/web/components/dashboard/pinned-sidebar.tsx`
  - `apps/web/components/dashboard/pinned-material-item.tsx`
- Extended favorites API for pinned sidebar context:
  - `apps/web/app/api/favorites/route.ts`
  - GET now includes `tags`, `module`, and `course` context fields for each pinned material.

**Stability work done during this session:**
- Resolved stale/invalid build artifacts issue (`Cannot find module './496.js'`) by:
  1. stopping active dev server
  2. clearing `apps/web/.next`
  3. running a clean production build
  4. restarting `next dev` on `localhost:3000`

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck` PASS
- `npm.cmd --workspace @studyhub/web run build` PASS (clean build after cache reset)
- `http://localhost:3000/dashboard` returns `200` after restart
- Web dev server is running on `localhost:3000` (PID changed after clean restart)

### Session 14 (Next.js runtime chunk recovery and root tracing fix)

**Issue observed:**
- Runtime error in web app: `Cannot find module './331.js'` from `.next/server/webpack-runtime.js` when opening `/progress`.

**What we changed:**
- Cleared stale build artifacts in `apps/web/.next`.
- Updated `apps/web/next.config.ts` to pin monorepo tracing root:
  - `outputFileTracingRoot: path.join(__dirname, "../../")`
- This prevents Next from inferring an incorrect root when multiple lockfiles exist on the machine.

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run build:web` PASS (outside sandbox; sandbox run fails with `spawn EPERM`)

**Notes:**
- Next build warning about workspace root detection is resolved after the tracing root fix.
- If a similar missing chunk appears again during dev, stop dev server, clear `apps/web/.next`, then restart `next dev`.

### Session 15 (Progress page usability pass, no Trello complexity)

**Goal:**
- Make `/progress` easier for daily use without turning it into a kanban board.

**What we changed:**
- Refreshed `apps/web/app/progress/page.tsx` layout and UX:
  - Added summary KPI cards (total/done/active/overdue/ideas).
  - Added quick timeline filters: `All`, `Active`, `In Progress`, `Overdue`, `Done`.
  - Added filter-aware empty states.
  - Kept one-column workflow behavior but improved desktop ergonomics with two-column composition (timeline + ideas).
  - Added clearer status/action toast feedback for promote/status update failures and success states.
- Added new UI components:
  - `apps/web/components/progress/progress-summary-cards.tsx`
  - `apps/web/components/progress/timeline-filters.tsx`
- Improved progress subcomponents for light/dark consistency and readability:
  - `apps/web/components/progress/progress-bar.tsx`
  - `apps/web/components/progress/add-milestone-form.tsx`
  - `apps/web/components/progress/milestone-timeline.tsx`
  - `apps/web/components/progress/ideas-backlog.tsx`
- Fixed Ideas delete button text encoding issue (garbled symbol replaced with clear `Delete`).

**API correctness + guardrails:**
- Fixed milestone creation API to respect incoming `status` (including `idea`), which unblocks proper Ideas Backlog behavior:
  - `apps/web/app/api/milestones/route.ts`
- Added server-side status validation (`INVALID_STATUS`) and milestone id validation (`INVALID_ID`) for milestones endpoints:
  - `apps/web/app/api/milestones/route.ts`
  - `apps/web/app/api/milestones/[id]/route.ts`

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run build:web` PASS (outside sandbox)

**Notes:**
- `/progress` file remains under 300 lines after this pass.
- UX remains intentionally lightweight: no drag/drop, no board semantics.
- Follow-up tweak: timeline updates now refresh data without re-triggering full-page loading spinner after each action.

### Session 16 (v1-inspired Quick Access for Progress)

**Context:**
- Used v1 project (`Visual-Studio-Capstone-Project-StudyHub-interface-v3`) as visual/UX reference only (no code reuse), inspired by the compact right-side "Quick Access" pattern.

**What we implemented in v2 `/progress`:**
- Added a new right-column `Due Soon` card with top upcoming milestone deadlines:
  - `apps/web/components/progress/due-soon-list.tsx`
- Added shared progress helpers for cleaner page orchestration:
  - `apps/web/lib/progress.ts`
  - moved filter/overdue/status label helpers from page into lib
- Wired `Due Soon` into page and kept page under file-size limit:
  - `apps/web/app/progress/page.tsx` now 272 lines

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run build:web` timed out in this environment during verification (no TypeScript errors reported)

### Session 17 (Taskboard-inspired deadline categories in Progress)

**Reference used:**
- Reviewed `C:\Users\mariy\Projects\Soft-Tech-with-AI\11. Workshop\Taskboard` for deadline UX patterns only (no code copy).
- Borrowed behavior idea from `project-deadlines`: category-based deadline chips and timeline filtering.

**What was added in StudyHub v2:**
- New timeline filters in `/progress`:
  - `Today`
  - `Next 7 Days`
- Added reusable due-date classification helpers in:
  - `apps/web/lib/progress.ts`
  - categories: `none | overdue | today | next7 | upcoming`
- Added reusable deadline pill component:
  - `apps/web/components/progress/deadline-pill.tsx`
- Applied deadline pill rendering in:
  - `apps/web/components/progress/milestone-timeline.tsx`
  - `apps/web/components/progress/due-soon-list.tsx`

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 18 (Premium loader pass)

**What was implemented:**
- Upgraded the shared `Spinner` UI to a premium loading experience:
  - gradient atmosphere background when centered
  - glassmorphism card
  - animated mascot center element
  - rotating contextual tips
  - subtle motion transitions via Framer Motion
- Added global app-router loading boundary:
  - `apps/web/app/loading.tsx`

**Files touched:**
- `apps/web/components/ui/spinner.tsx`
- `apps/web/app/loading.tsx`

**Validation:**
- `npm.cmd run typecheck:web` PASS

**Notes:**
- Current premium loader is fully active for existing page-level `Spinner` use cases and for app-level route loading.
- Ready for direct Lottie swap once a downloadable `.json` or `.lottie` asset URL/file is provided.

### Session 19 (Premium loader with real Lottie integration)

**What was implemented:**
- Installed DotLottie React player in web workspace:
  - `@lottiefiles/dotlottie-react`
- Added a reusable loader wrapper:
  - `apps/web/components/ui/lottie-loader.tsx`
- Updated premium spinner center animation to use local Lottie asset:
  - `apps/web/components/ui/spinner.tsx`
  - source: `/public/lottie/loading.lottie`
- Kept existing premium UX intact:
  - gradient atmosphere background
  - glass card
  - rotating tips with animated transitions

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 20 (Timeline editing + notes + move up/down)

**What was implemented:**
- Added full inline milestone editing in `/progress` timeline:
  - edit title
  - edit notes/description
  - edit due date
- Added milestone order controls in expanded row:
  - `Move up`
  - `Move down`
  - changes persist to DB via API (`orderIndex`)
- Added stronger milestones API validation:
  - title is trimmed and required on create/update
  - description is normalized (`"" -> null`)
  - due date is normalized
  - `orderIndex` validation (`integer >= 0`)
- Refactored progress page state into a dedicated hook to keep page/component files within project size limits.

**Files touched:**
- `apps/web/app/progress/page.tsx`
- `apps/web/components/progress/use-progress-page-state.ts`
- `apps/web/components/progress/milestone-timeline.tsx`
- `apps/web/components/progress/milestone-editor.tsx`
- `apps/web/app/api/milestones/route.ts`
- `apps/web/app/api/milestones/[id]/route.ts`
- `apps/web/lib/progress.ts`

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 21 (Loading screen scale-up)

**What was implemented:**
- Enlarged centered premium loader to avoid miniature feel:
  - switched to full-screen container (`min-h-screen`)
  - increased glass card max width and padding
  - increased Lottie panel size and animation scale
  - increased loading title and tip typography
  - expanded background glow blobs for better visual balance

**Files touched:**
- `apps/web/components/ui/spinner.tsx`

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 22 (Progress interaction latency optimization)

**Why:**
- Editing/status/reorder/delete in `/progress` felt slow because each action triggered a full milestones reload request.

**What was implemented:**
- Optimized `use-progress-page-state` to update local milestone state directly from API responses:
  - add milestone/idea -> append returned record locally
  - status/promote/edit -> replace updated record locally
  - reorder -> optimistic local swap + server sync; fallback reload only on failure
  - delete -> local removal without full reload
- Kept initial load behavior unchanged.

**Files touched:**
- `apps/web/components/progress/use-progress-page-state.ts`

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 23 (Progress request timeout hardening)

**Why:**
- When dev server/HMR stalls, `/progress` fetches could remain pending too long, leaving users on loading state without clear feedback.

**What was implemented:**
- Added client-side request timeout wrapper in progress state hook (`12s`) for all milestone requests.
- Added timeout-specific error messaging toasts (instead of silent long wait).
- Kept existing optimistic updates from Session 22 intact.

**Files touched:**
- `apps/web/components/progress/use-progress-page-state.ts`

**Validation:**
- `npm.cmd run typecheck:web` PASS

### Session 24 (VS Code Next.js debug config for web workspace)

**Why:**
- Browser console showed `ChunkLoadError` + `ERR_CONNECTION_REFUSED` to `http://localhost:4010/...`, indicating stale client chunks were trying to load from a stopped server/port.

**What was implemented:**
- Added a dedicated VS Code launch config for Next.js web app in monorepo:
  - `.vscode/launch.json`
  - configuration name: `Next.js Debug (web)`
  - runs `npm run dev` with `cwd` set to `${workspaceFolder}/apps/web`
  - forces `PORT=3000` for a stable local URL
  - uses `serverReadyAction` pattern compatible with modern Next.js output (`Local: http://...`)

**Result:**
- F5 debug startup now consistently opens the running web app on port `3000`, reducing stale-port chunk loading issues during debugging.

### Session 25 (Dashboard course rename/edit support)

**Issue reported:**
- On `/dashboard`, course cards allowed only open/delete, so users could not edit course names from the dashboard UI.

**What was implemented:**
- Added `Edit` action to dashboard course cards:
  - `apps/web/components/dashboard/course-card.tsx`
- Added a dedicated edit modal with title/description form:
  - `apps/web/components/dashboard/edit-course-modal.tsx`
- Added a reusable dashboard edit hook to keep page files under the 300-line limit:
  - `apps/web/components/dashboard/use-dashboard-course-editor.ts`
- Wired dashboard page to the existing `PUT /api/courses/:id` endpoint:
  - `apps/web/app/dashboard/page.tsx`

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run lint:web` blocked by first-time interactive Next.js ESLint setup prompt (`next lint` configuration wizard), not by type errors.

### Session 26 (Login parity pass + auth theme toggle)

**What we implemented:**
- Refactored the web login screen into smaller auth components:
  - `apps/web/components/auth/login-form.tsx`
  - `apps/web/components/auth/use-login-form.ts`
  - `apps/web/components/auth/auth-icon-field.tsx`
  - `apps/web/components/auth/login-form-header.tsx`
  - `apps/web/components/auth/login-form-actions.tsx`
  - `apps/web/components/auth/auth-social-button.tsx`
  - `apps/web/components/auth/auth-section-divider.tsx`
- Refactored auth layout chrome into dedicated components:
  - `apps/web/components/auth/auth-header-controls.tsx`
  - `apps/web/components/auth/auth-mascot.tsx`
  - `apps/web/components/auth/auth-icons.tsx`
- Upgraded `/login` to better match the old StudyHub login UX while staying honest about current backend scope:
  - restored `Welcome Back` style heading and helper copy
  - added icon-based email/password fields
  - added `Forgot password?` action, `OR` divider, and Google sign-in button as clearly planned/upcoming actions
  - restored mobile mascot presence instead of hiding it on smaller screens
  - fixed the broken Bulgarian speech bubble text encoding (`Здравей! / Приятно учене!`)
- Added real dark-mode support for the web app root:
  - `apps/web/components/theme/theme-utils.ts`
  - `apps/web/components/theme/theme-script.tsx`
  - `apps/web/components/theme/theme-toggle.tsx`
  - wired theme bootstrapping + hydration-safe root layout updates in `apps/web/app/layout.tsx`

**Validation:**
- `npm.cmd run typecheck` PASS (`apps/web`)
- `npm.cmd run build` PASS (`apps/web`)

### Session 27 (Google sign-in plan + register parity pass)

**What we implemented:**
- Documented the planned Google sign-in extension in `docs/implementation-plan.md`:
  - keep the current custom JWT auth model
  - add a dedicated `oauth_accounts` table through Drizzle migration
  - introduce a shared `POST /api/auth/google` backend flow for both web and mobile
  - keep account-linking rules explicit for linked accounts, matching emails, and brand-new users
- Refactored the web register screen into smaller auth modules:
  - `apps/web/app/register/page.tsx`
  - `apps/web/components/auth/register-form.tsx`
  - `apps/web/components/auth/register-form-header.tsx`
  - `apps/web/components/auth/use-register-form.ts`
- Improved `/register` parity with the old StudyHub screen while staying aligned with the current backend:
  - restored `Join StudyHub` heading and helper copy
  - added icon-based full-name, email, and password fields
  - added an honest password helper that matches the current backend minimum length
  - normalized full-name input before submit to keep saved data cleaner
- Added a dedicated register button treatment in `apps/web/app/globals.css` to visually separate sign-up from sign-in.

**Validation:**
- `npm.cmd run build` PASS (`apps/web`)
- `npm.cmd run typecheck:web` PASS

### Session 28 (Login flow performance pass)

**Issue reported:**
- Login felt noticeably slow after submit.

**What we implemented:**
- Reduced post-login navigation overhead in `apps/web/components/auth/use-login-form.ts`:
  - prefetch `/dashboard` while the login screen is open
  - replace `router.push(...) + router.refresh()` with `router.replace(...)`
- Reduced dashboard bootstrap chatter by introducing a single aggregated endpoint:
  - `apps/web/app/api/dashboard/route.ts`
  - `apps/web/lib/dashboard-data.ts`
- Updated `apps/web/app/dashboard/page.tsx` to load dashboard state from one request instead of four parallel API calls during initial page load.

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run build:web` PASS

### Session 29 (Auth viewport fit + calmer background pass)

**Issue reported:**
- Login and register required page scrolling on normal browser zoom to see the full form.
- The auth background felt too busy and visually tiring instead of reading as a clean gradient.

**What we implemented:**
- Reduced vertical pressure across the auth UI:
  - smaller auth card padding in `apps/web/components/auth/auth-layout.tsx`
  - smaller mascot footprint in `apps/web/components/auth/auth-mascot.tsx`
  - tighter header, field, helper, and action spacing in the auth form components
  - removed the extra inline floating mascot from the card flow so mobile/smaller viewports keep more room for the form
- Replaced the animated mesh background with a calmer static gradient + soft blur blobs in `apps/web/components/auth/auth-layout.tsx`.
- Slightly compacted the top controls in:
  - `apps/web/components/auth/auth-header-controls.tsx`
  - `apps/web/components/theme/theme-toggle.tsx`

**Validation:**
- `npm.cmd run build:web` PASS
- `npm.cmd run typecheck:web` PASS

### Session 30 (Dashboard back-to-home action)

**Issue reported:**
- The dashboard had no visible way to navigate back to the public home page.

**What we implemented:**
- Added a `Back to Home` secondary action next to the dashboard hero CTA in `apps/web/components/dashboard/dashboard-hero.tsx`.
- Reused the existing arrow icon styling so the new action stays visually aligned with the auth/navigation language already used elsewhere in the app.

**Validation:**
- `npm.cmd run build:web` PASS
- `npm.cmd run typecheck:web` PASS

---

## 2026-04-01

### Session 31 (Profile parity pass + password change flow)

**Legacy comparison summary (v1 -> current v2 before this pass):**
- v2 profile was functionally minimal compared to v1:
  - plain single-card layout instead of a stronger avatar-led glass hero
  - no dedicated security section
  - no admin-specific quick actions
  - weaker field hierarchy/helper copy
- v1 also had username, website, avatar upload, and admin MFA affordances.
- For this pass we kept the current v2 backend scope honest:
  - no code copied from v1
  - no email verification work
  - Google sign-in remains planned only
  - avatar upload/MFA were not introduced because the current backend scope does not support them yet

**What we implemented:**
- Rebuilt `/profile` into smaller profile modules:
  - `apps/web/components/profile/profile-page-header.tsx`
  - `apps/web/components/profile/profile-hero-card.tsx`
  - `apps/web/components/profile/profile-details-card.tsx`
  - `apps/web/components/profile/profile-security-card.tsx`
  - `apps/web/components/profile/profile-admin-card.tsx`
  - `apps/web/components/profile/profile-field.tsx`
  - `apps/web/components/profile/profile-icons.tsx`
  - `apps/web/components/profile/use-profile-page-state.ts`
  - `apps/web/lib/profile.ts`
- Upgraded `/profile` UX:
  - premium glass + gradient presentation closer to v1 mood
  - larger avatar-led hero with live preview from the current form state
  - clearer read-only account metadata (email, role, member since)
  - honest helper copy explaining that avatar upload is still future scope and direct image URLs are the current path
  - admin-only quick actions card linking back to the admin panel
- Added a real password change flow from the profile page:
  - new API route: `apps/web/app/api/auth/password/route.ts`
  - validates current password, minimum length, and disallows reusing the same password
  - logs password changes via activity logging
- Fixed a profile update bug in:
  - `apps/web/app/api/auth/me/route.ts`
  - empty/null avatar values can now actually clear an existing saved avatar
- Updated handoff planning in `docs/implementation-plan.md` to mark the profile parity pass as completed in the active UI polish phase.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck` PASS
- `npm.cmd --workspace @studyhub/web run build` PASS
  - sandboxed build failed first with `spawn EPERM`
  - rerun outside sandbox succeeded

**Notes:**
- Existing build warnings from `jose` / Edge runtime are still present; this session did not introduce new build warnings.

### Session 32 (Real avatar uploads with Cloudflare R2)

**Why this moved up:**
- Jury feedback from the previous project specifically checked whether profile avatar upload works for real.
- Because of that, avatar upload is now treated as a practical must-have, not just optional polish.

**What we implemented:**
- Added Cloudflare R2 upload/delete helper:
  - `apps/web/lib/r2.ts`
- Added a dedicated avatar API route:
  - `apps/web/app/api/auth/avatar/route.ts`
  - `POST` uploads avatar image to R2, updates `users.avatar_url`, and replaces the previous stored avatar
  - `DELETE` removes the current avatar from storage and clears `users.avatar_url`
- Hardened profile update cleanup:
  - `apps/web/app/api/auth/me/route.ts`
  - when avatar is replaced through the normal profile save flow, previous R2 avatar cleanup is attempted server-side
- Upgraded profile client flow:
  - `apps/web/components/profile/use-profile-page-state.ts`
  - real file upload action wired to `/api/auth/avatar`
  - real remove-avatar action wired to `/api/auth/avatar`
  - added upload/remove loading and error states
- Upgraded profile UI:
  - `apps/web/components/profile/profile-details-card.tsx`
  - added visible `Upload photo` control with file picker
  - added clear upload rules (JPG/PNG/WebP/GIF, max 2 MB)
  - `apps/web/components/profile/profile-hero-card.tsx`
  - profile copy updated to reflect real R2-backed uploads
- Updated environment/docs:
  - `.env.example`
  - `README.md`
  - `docs/implementation-plan.md`

**Validation:**
- `npm.cmd install --workspace @studyhub/web @aws-sdk/client-s3` PASS (outside sandbox; required for R2 integration)
- `npm.cmd --workspace @studyhub/web run typecheck` PASS

**Important setup note:**
- Local `.env` still has empty `R2_*` values right now.
- Code support is implemented, but actual upload will work only after valid R2 credentials and public URL are added.

### Session 33 (Storage task deferred, UI focus restored)

**Decision:**
- File uploads remain planned work, but they are no longer the immediate focus for the current pass.
- We will continue with interface work first, then return to storage and finish a real setup for:
  - avatar uploads
  - course/material file uploads (`docs`, `pdf`, images)

**Documentation updates:**
- `docs/implementation-plan.md`
  - upload/storage work is now tracked as a deferred task
  - profile status text was adjusted so it no longer over-promises a finished storage-backed avatar flow

**Why:**
- Cloudflare R2 activation currently introduces billing friction in the learning flow.
- The assignment marks file uploads as non-mandatory, so UI work can continue first without blocking the capstone core.

### Session 34 (Course workspace save flow and module rename)

**Problem investigated:**
- On `/courses/[id]`, typing only into the material `Content` field felt like nothing was saving.
- The page also did not expose any way to rename an existing module title from the course workspace, so the seeded module name kept looking stuck.

**What changed:**
- Improved material creation flow:
  - `apps/web/lib/materials.ts`
    - added shared material-title fallback logic
    - quick notes can now derive a saved title from the first non-empty content line
  - `apps/web/app/api/modules/[id]/materials/route.ts`
    - server-side create flow now accepts quick-note creation when `Content` exists even if `Title` is blank
    - material type is normalized before save
- Improved course workspace UX:
  - `apps/web/app/courses/[id]/page.tsx`
    - added clearer validation/toasts for material creation
    - added module rename action wired to the existing module `PUT` API
  - `apps/web/components/course/module-list.tsx`
  - `apps/web/components/course/module-section.tsx`
    - added inline rename UI for module titles
    - clarified that `Content` is stored in Neon
    - clarified that quick notes can auto-generate a title when left blank

**Why this matters:**
- The save flow now matches beginner expectations better: writing note content is enough to create a material.
- Existing module titles are no longer effectively read-only from the page.

### Session 35 (Notes-first workspace polish)

**What changed:**
- Improved the course workspace for real note-taking use:
  - `apps/web/components/course/course-workspace-header.tsx`
    - added notes-first helper copy explaining that text notes are fully usable without file uploads
    - adjusted fallback description to emphasize study notes, not only attachments
  - `apps/web/components/course/module-section.tsx`
    - note submissions now use a clearer `Save note` label when the selected material type is `Note`
  - `apps/web/components/course/material-row.tsx`
    - materials now show a short content preview directly in the module list

**Why:**
- Even while storage-backed uploads remain deferred, the app should already be genuinely useful as a course notebook.
- The course page now better supports the user flow: write explanation -> save note -> scan note preview -> open for full edit later.

### Session 36 (Dashboard backlog quick capture)

**Problem investigated:**
- Adding an item to the Ideas Backlog required leaving the main dashboard flow and opening the separate progress board first.
- That made quick capture feel heavier than it should for a small backlog note.

**What changed:**
- Improved dashboard capture flow:
  - `apps/web/components/dashboard/quick-idea-capture.tsx`
    - added an always-available quick form for saving a new backlog idea directly from `/dashboard`
    - included a direct link to the full backlog section on `/progress`
  - `apps/web/app/dashboard/page.tsx`
    - wired the dashboard to `POST /api/milestones` with `status: "idea"`
    - updates the local milestone state immediately after save and shows success/error toast feedback
- Improved progress summary clarity:
  - `apps/web/components/dashboard/progress-widget.tsx`
    - progress percentage now ignores backlog ideas, so the widget reflects actual milestone completion
    - shows how many ideas are currently waiting in backlog
  - `apps/web/components/progress/ideas-backlog.tsx`
    - added an anchor target so dashboard links can jump straight to the backlog section

**Why:**
- Backlog capture should be a one-step action from the main workspace, not a context switch.
- The dashboard now supports the "note it now, organize it later" flow more naturally.

### Session 37 (Note save form unblocked)

**Problem investigated:**
- Saving a note could silently fail when the optional `Link / File URL` field contained text that was not a fully valid URL.
- Because the field used native `type="url"` validation, the browser could block the form submit before our own save logic ran.

**What changed:**
- `apps/web/components/course/module-section.tsx`
  - changed the create-material URL field to text input with `inputMode="url"` so quick note saves are not blocked by browser validation
- `apps/web/components/materials/material-editor-form.tsx`
  - applied the same fix to the material edit form
- `apps/web/app/courses/[id]/page.tsx`
  - trim title/content/file URL before resolving the saved title and submitting the create request
- `apps/web/app/materials/[id]/page.tsx`
  - trim title/content/file URL before submitting note edits

**Why:**
- Optional URL text should not prevent a plain study note from being saved.
- The save flow is now more forgiving and better matches the notes-first UX.

### Session 38 (Removed Lottie spinner from runtime)

**Problem investigated:**
- The centered loading screen was using a `.lottie` animation and surfacing a console error when that animation failed to load in dev.
- That added noise while debugging unrelated page issues.

**What changed:**
- `apps/web/components/ui/spinner.tsx`
  - replaced the Lottie-based loader with a CSS-only animated spinner
- `apps/web/components/ui/lottie-loader.tsx`
  - removed because it is no longer used

**Why:**
- The loader should stay dependable in `next dev` without extra animation runtime failure paths.

### Session 39 (Navbar mascot warning cleanup)

**Problem investigated:**
- The navbar mascot logo was raising a Next.js LCP warning in dev because it appears above the fold but was not marked as priority.

**What changed:**
- `apps/web/components/layout/Navbar.tsx`
  - added `priority` to the mascot `Image`

**Why:**
- This removes a noisy dev warning without affecting the page flow.

### Session 40 (Course workspace interaction pass)

**Problem investigated:**
- The course workspace still re-fetched the whole course/module/material tree after small actions like create material, rename module, delete module, or pin material.
- That made the page feel heavier than necessary during normal work.

**What changed:**
- `apps/web/app/courses/[id]/page.tsx`
  - module create now appends the returned module locally
  - module rename now updates local module state from the returned API payload
  - module delete now removes the module and its material bucket locally
  - material create now appends the returned material locally instead of reloading all modules
  - pin/unpin now updates favorite ids locally instead of re-fetching favorites

**Why:**
- Small actions should feel immediate.
- This reduces unnecessary request waterfalls and makes the course page calmer to work with in `dev`.

### Session 41 (Dashboard create-course proximity fix)

**Problem investigated:**
- After adding more dashboard widgets, the `+ New Course` button in the hero ended up too far from the actual create-course form.

**What changed:**
- `apps/web/app/dashboard/page.tsx`
  - moved the create-course form so it renders directly under the dashboard hero, before the widget row

**Why:**
- Toggling the form should reveal it right next to the action that opened it.

### Session 42 (Dashboard visual parity pass)

**Problem investigated:**
- The updated dashboard logic was in a better place, but visually it had drifted away from the warmer old StudyHub dashboard style.
- The page also was not really using the handwritten signature font that already exists elsewhere in the app.

**What changed:**
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - rebuilt the hero into a softer glass card with a handwritten `Dashboard` title and richer stat tiles
- `apps/web/components/dashboard/create-course-form.tsx`
  - redesigned the create form as a premium inline panel with clearer hierarchy
- `apps/web/components/dashboard/course-card.tsx`
  - restyled course cards toward the old dashboard mood: icon tile, handwritten title, softer shadows, pill actions
- `apps/web/components/dashboard/progress-widget.tsx`
  - updated widget styling for better parity with the new dashboard surface language
- `apps/web/components/dashboard/calendar-widget.tsx`
  - updated upcoming-events card styling to match the dashboard board feel
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - polished the quick backlog card to fit the new dashboard card family
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - updated the pinned area into a more intentional sidebar shelf panel
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - softened pinned item cards to match the refreshed shell

**Why:**
- The new dashboard now keeps the faster workflow while borrowing the old project's softer, more personal visual language.
- `Shantell Sans` is now used as the dashboard signature accent instead of sitting mostly unused on this page.

### Session 43 (Dashboard theme control and dark-mode cleanup)

**Problem investigated:**
- The dashboard had no visible theme toggle on authenticated pages, even though a global theme system already existed.
- In light mode, the refreshed dashboard surfaces still looked too heavy and could read like a broken half-dark theme instead of an intentional light design.

**What changed:**
- `apps/web/components/navbar.tsx`
  - added the shared `ThemeToggle` to the authenticated app navbar
  - refreshed the navbar into a lighter glass header with clearer active states
- `apps/web/components/dashboard/dashboard-page-shell.tsx`
  - added a dedicated dashboard shell with theme-aware background glows and a darker top atmosphere for the dashboard's dark mode
- `apps/web/app/dashboard/page.tsx`
  - wrapped dashboard content in the new shell without changing dashboard logic
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - separated light and dark hero treatments so the board reads airy in light mode and deliberate in dark mode
- `apps/web/components/dashboard/create-course-form.tsx`
  - updated the inline create panel to match the new light/dark board surfaces
- `apps/web/components/dashboard/progress-widget.tsx`
  - tuned the progress card styling to match the dashboard's lighter light mode and deeper dark mode
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - refined the backlog quick-capture card for better contrast in both themes
- `apps/web/components/dashboard/calendar-widget.tsx`
  - updated event card styling and event row surfaces for the new theme split
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - refreshed the shelf panel and tag filters to feel consistent across light/dark
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - softened pinned material cards in light mode and grounded them in dark mode
- `apps/web/components/dashboard/course-card.tsx`
  - adjusted course cards to stay bright in light mode and inherit the new dark dashboard language
- `apps/web/components/dashboard/course-filters.tsx`
  - wrapped filters in a dashboard surface instead of leaving them visually loose on the page

**Why:**
- The dashboard now has an explicit theme control, so dark mode is a choice instead of feeling like state leakage.
- Light mode reads clearly as light again, while dark mode can reuse the app's stronger signature navy/cyan look without extra runtime cost.

### Session 44 (Dashboard navbar identity pass)

**Problem investigated:**
- The authenticated dashboard navbar still used a temporary `S` badge instead of the real mascot/logo.
- The `StudyHub` wordmark did not match the signature font style used elsewhere in the project.
- The dashboard header also did not show which user profile was currently active near the logout action.

**What changed:**
- `apps/web/components/navbar.tsx`
  - replaced the temporary `S` badge with the real mascot logo asset
  - restored the `StudyHub` wordmark styling to the signature handwritten/gradient treatment used in the public navbar
  - added a profile chip near logout that shows avatar or initials, plus the current user name and role
  - kept the shared theme toggle in the authenticated navbar
- `apps/web/components/dashboard/dashboard-page-shell.tsx`
  - darkened the dark-mode background gradient so it sits closer to the login page atmosphere
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - slightly deepened the hero dark treatment and reduced glow intensity to avoid looking washed out

**Why:**
- The dashboard should feel like the same StudyHub brand once you log in, not like a different product.
- Showing the active profile near logout makes the navbar more informative and personal.

### Session 45 (Unified account pill in navbar)

**Problem investigated:**
- The authenticated navbar still treated the profile chip and the logout action as separate controls.
- The user wanted this area to feel like the old v1 account zone, where profile identity and logout sit together in one shared pill.

**What changed:**
- `apps/web/components/navbar.tsx`
  - merged the profile identity and logout action into one shared account pill
  - kept avatar/initials, name, and role grouped together
  - moved logout into a compact circular action inside the same pill, following the old v1 layout direction more closely

**Why:**
- The right side of the navbar now reads as one account control cluster instead of several unrelated chips.
- This is closer to the old StudyHub workspace feel while still fitting the current React/Tailwind app shell.

### Session 46 (Dashboard handwritten title polish)

**Problem investigated:**
- The handwritten dashboard titles were still using flat dark text in light mode, which made them feel heavier and less premium than the rest of the board.

**What changed:**
- `apps/web/app/globals.css`
  - added a reusable `dashboard-script-title` class for premium handwritten title treatment
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - applied the new premium script styling to the main `Dashboard` title
- `apps/web/components/dashboard/create-course-form.tsx`
  - applied the same treatment to the create-course panel heading
- `apps/web/components/dashboard/progress-widget.tsx`
  - updated the `Progress` title to use the premium script treatment
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - updated the backlog quick-capture title to use the premium script treatment
- `apps/web/components/dashboard/calendar-widget.tsx`
  - updated the calendar title to use the premium script treatment

**Why:**
- The handwritten headings now read more like tinted premium ink instead of plain black text.
- This keeps the dashboard elegant without adding runtime-heavy effects or over-animating the UI.

### Session 47 (Account pill simplification)

**Problem investigated:**
- The unified account pill in the authenticated navbar still felt too text-heavy.
- The user wanted it closer to the old compact v1 look, with just the profile identity and a logout action inside the same control.

**What changed:**
- `apps/web/components/navbar.tsx`
  - removed the extra `Signed in as` label from the account pill
  - collapsed the profile block into a simpler two-line layout: name + role
  - changed the role label to a friendlier presentation (`Administrator` / `Student`)
  - restyled the logout action inside the pill to a softer rose-tinted button, closer to the v1 direction

**Why:**
- The account zone now feels lighter and more premium, with less visual noise inside the pill.

### Session 48 (Dashboard palette cleanup and microinteractions)

**Problem investigated:**
- The dashboard had started to accumulate too many unrelated accent colors across course cards, type pills, and actions.
- Compared to v1, card/icon interactions also felt too static and flat.

**What changed:**
- `apps/web/components/dashboard/course-card.tsx`
  - added a spring hover lift for course cards
  - added microinteraction on the course glyph tile
  - reduced dashboard action color noise by softening the delete action and keeping edit mostly neutral
  - moved status pills away from loud amber/green toward the main brand/cyan family
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - added a subtle hover lift and richer shadow response for pinned material cards
- `apps/web/components/materials/material-type-pill.tsx`
  - simplified material type pills into a neutral shared pill with only a small accent dot per type
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - softened the active tag filter state so it no longer reads as a heavy solid purple chip

**Why:**
- The dashboard now feels closer to a single visual system instead of a collection of unrelated colors.
- Microinteractions are back in the cards and icon containers, which brings some of the v1 liveliness into the current app shell.

### Session 49 (Dashboard widget unification pass)

**Problem investigated:**
- The lower dashboard area still needed a more unified visual language across widgets and shelf sections.
- The user wanted the premium handwritten treatment to continue further down the page, along with more v1-style microinteractions.

**What changed:**
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - added hover lift to the hero stat cards
  - added a small motion response to the hero icon tile
- `apps/web/components/dashboard/progress-widget.tsx`
  - added panel hover motion
  - moved the progress accent from violet/pink toward the main brand/cyan range
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - added panel hover motion
  - aligned inputs, link accent, count pill, and CTA closer to the shared dashboard palette
- `apps/web/components/dashboard/calendar-widget.tsx`
  - added panel hover motion
  - reduced event-dot color noise to a tighter brand/cyan/rose/slate set
  - added a small row shift on hover for the event list
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - added panel hover motion
  - applied the premium handwritten title treatment to the sidebar heading
  - added small hover movement to tag filter chips
- `apps/web/components/dashboard/course-card.tsx`
  - applied the premium handwritten title treatment to course card titles
  - simplified the lower card accent chip away from extra pink/fuchsia tint

**Why:**
- The dashboard now carries the same premium title language further down the page.
- Widget movement and container response feel more intentional and more in line with the older StudyHub microinteraction style.

### Session 50 (Dashboard control system and darker shell)

**Problem investigated:**
- The dashboard still needed one shared control language for action buttons and pills instead of repeating similar-but-different classes.
- Dark mode also still felt too washed out in the page background outside the cards.

**What changed:**
- `apps/web/components/dashboard/dashboard-controls.tsx`
  - added a shared dashboard control system with:
    - `DashboardActionButton`
    - `DashboardPill`
    - `DashboardPillButton`
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - moved hero actions and the top workspace badge onto the shared control system
- `apps/web/components/dashboard/create-course-form.tsx`
  - moved the top badge and submit CTA onto the shared control system
- `apps/web/components/dashboard/course-card.tsx`
  - moved status badges, the lower card chip, and `Edit / Delete / Open` onto the shared control system
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - moved tag filter chips onto the shared control system
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - moved the backlog count pill and quick actions onto the shared control system
- `apps/web/components/dashboard/dashboard-page-shell.tsx`
  - replaced the previous lighter dark background treatment with a deeper near-solid navy shell and more restrained glow layers

**Why:**
- Dashboard actions, chips, and pills now belong to the same component family instead of drifting apart visually.
- Dark mode now has a stronger, more intentional atmosphere and should no longer feel too light behind the panels.

### Session 51 (Dark-mode typography and profile glow polish)

**Problem investigated:**
- In dark mode, the signature handwritten title gradient had become too pale and could read as plain white.
- Profile panels also felt a bit too flat against the darker page background.

**What changed:**
- `apps/web/app/globals.css`
  - strengthened the dark-mode `dashboard-script-title` gradient so purple/cyan tinting stays visible
- `apps/web/app/profile/page.tsx`
  - replaced the lighter dark profile background with a deeper near-solid navy atmosphere and restrained glow layers
- `apps/web/components/profile/profile-page-header.tsx`
  - applied the signature title treatment to `My Profile`
- `apps/web/components/profile/profile-hero-card.tsx`
  - added stronger dark-mode panel glow/shadow
- `apps/web/components/profile/profile-details-card.tsx`
  - added stronger dark-mode panel glow/shadow
- `apps/web/components/profile/profile-security-card.tsx`
  - added stronger dark-mode panel glow/shadow
- `apps/web/components/profile/profile-admin-card.tsx`
  - added stronger dark-mode panel glow/shadow

**Why:**
- The dark theme now keeps the signature gradient in the typography instead of washing it out to plain white.
- Profile containers have more lift from the background, restoring some of the glow that made the darker UI feel more atmospheric.

### Session 52 (Dashboard typography unification pass)

**Problem investigated:**
- The dashboard dark mode had reached a good surface/background balance, but the typography was still mixing the handwritten accent too widely across utility panels.
- That made the page feel less consistent than the course-card reference direction, where the script style works best as a selective accent.

**What changed:**
- `apps/web/components/dashboard/dashboard-page-shell.tsx`
  - set the dashboard shell to one shared `Poppins` typography base so filters, controls, labels, and body copy inherit the same sans style
- `apps/web/app/globals.css`
  - added a reusable `dashboard-panel-title` class for clean dashboard widget headings
- `apps/web/components/dashboard/create-course-form.tsx`
  - moved the panel headline from the handwritten accent to the new shared panel-title style
- `apps/web/components/dashboard/progress-widget.tsx`
  - moved the widget heading to the new shared panel-title style
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - moved the widget heading to the new shared panel-title style
- `apps/web/components/dashboard/calendar-widget.tsx`
  - moved the widget heading to the new shared panel-title style
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - moved the sidebar heading to the new shared panel-title style
- `apps/web/components/dashboard/dashboard-controls.tsx`
  - locked dashboard pills and action buttons to the same shared sans font family
- `apps/web/components/dashboard/edit-course-modal.tsx`
  - aligned the edit modal typography with the dashboard font system

**Why:**
- The handwritten accent now stays focused on the signature spots that benefit from it, instead of competing with every dashboard panel heading.
- Dashboard dark mode now reads as one typography system: clean sans UI chrome plus selective handwritten highlights.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 99 (Course, module, and material pages moved to server-first initial data)

**Problem investigated:**
- The remaining authenticated detail/workspace pages were still on the old pattern of `loading state -> useEffect -> fetch initial data -> render real content`.
- That left the heaviest content routes (`courses/[id]`, `modules/[id]`, `materials/[id]`) still vulnerable to the same delayed first paint we had already removed from Dashboard, Progress, Calendar, and Profile.

**What changed:**
- `apps/web/app/courses/[id]/page.tsx`
  - converted the route into an async server page
  - now resolves auth and course detail data before first render
- `apps/web/components/course/course-details-client-page.tsx`
  - extracted the interactive course workspace into a dedicated client shell
  - keeps add/edit/delete/reorder actions client-side only
- `apps/web/lib/course-details-data.ts`
  - added shared helpers for course summary + module list loading
- `apps/web/components/course/types.ts`
  - added shared course detail types for server/client handoff
- `apps/web/app/modules/[id]/page.tsx`
  - converted the module workspace route into an async server page
  - now loads module context, module materials, course modules, and favorites before first render
- `apps/web/components/modules/module-workspace-client-page.tsx`
  - extracted the interactive module workspace into a dedicated client shell
  - keeps create-material, filter/search/sort, and pin actions client-side
- `apps/web/lib/module-workspace-data.ts`
  - added shared helpers for module context and normalized module-material loading
- `apps/web/components/modules/types.ts`
  - added shared module workspace types for server/client handoff
- `apps/web/app/materials/[id]/page.tsx`
  - converted the material route into an async server page
  - now loads material detail and initial pin state server-side
- `apps/web/components/materials/material-page-client.tsx`
  - extracted the interactive material view/editor into a dedicated client shell
  - keeps edit/save/delete/pin actions client-side
- `apps/web/lib/material-detail-data.ts`
  - added shared material detail helpers with normalized timestamp output
- `apps/web/components/materials/types.ts`
  - added shared material page types for server/client handoff
- `apps/web/lib/favorites-data.ts`
  - centralized favorite-item loading and single-item pin-state lookup
- `apps/web/app/api/courses/[id]/route.ts`
- `apps/web/app/api/courses/[id]/modules/route.ts`
- `apps/web/app/api/modules/[id]/route.ts`
- `apps/web/app/api/modules/[id]/materials/route.ts`
- `apps/web/app/api/materials/[id]/route.ts`
- `apps/web/app/api/favorites/route.ts`
- `apps/web/lib/dashboard-data.ts`
  - now re-use the shared server data helpers instead of duplicating initial query shapes
- `docs/performance-guardrails.md`
  - updated the checklist to mark the three detail/workspace pages as completed
  - clarified that future authenticated pages should start with server-first planning before UI polish

**Why:**
- The remaining authenticated workspaces now follow the same server-first first-render path as the earlier optimized pages.
- First paint no longer depends on a client-side fetch for the core page content.
- Query shapes and normalization are more centralized, which lowers the chance of future drift between pages and API routes.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 98 (Performance planning rules promoted into project instructions)

**Problem investigated:**
- The performance guidance existed as a helpful checklist, but it still risked being treated as something to remember later instead of something to plan for up front.
- We needed the rule to be visible at the moment new work starts, not only after a slowdown appears.

**What changed:**
- `AGENTS.md`
  - added a new `Performance Planning` section
  - recorded the server-first initial data rule for new authenticated web pages
  - recorded the anti-pattern to avoid: designing around `empty state -> useEffect fetch -> real content`
  - recorded the preferred split between async server pages and dedicated client shells
  - updated the handoff prompt so future chats also read `docs/performance-guardrails.md`
- `docs/performance-guardrails.md`
  - added a `Planning Rule` section that frames performance as an input to page design, not just a later cleanup pass
  - added a short pre-build checklist for deciding first-paint data, server fetches, client-only state, and duplicate auth fetch risk

**Why:**
- The performance lessons are now part of the project instructions, not only session history.
- Future pages should be planned with the right loading architecture earlier, which lowers the chance of repeating the same regressions.

### Session 94 (Server-first initial data for Dashboard and Progress)

**Problem investigated:**
- Dashboard and Progress were both rendering empty client state first, then fetching data after mount.
- This caused the user-visible "zero values first, real numbers later" effect and made the app feel slower than it needed to.

**What changed:**
- `apps/web/lib/server-auth.ts`
  - added a small server helper that reads the auth token from cookies and redirects unauthenticated users to `/login`
- `apps/web/lib/dashboard-data.ts`
  - normalized dashboard payloads for server rendering, including stable string dates
- `apps/web/components/dashboard/types.ts`
  - extracted shared dashboard data types out of client UI files
- `apps/web/components/dashboard/dashboard-client-page.tsx`
  - moved the interactive dashboard UI into a dedicated client component seeded with initial server data
- `apps/web/app/dashboard/page.tsx`
  - converted the page into a server component that fetches dashboard data before render
- `apps/web/components/progress/types.ts`
  - extracted shared milestone/event types for the progress flow
- `apps/web/lib/progress-data.ts`
  - added a server helper that fetches milestones and events before render and normalizes their date fields
- `apps/web/components/progress/progress-page-client.tsx`
  - moved the interactive progress UI into a dedicated client component seeded with initial server data
- `apps/web/components/progress/use-progress-page-state.ts`
  - removed the initial client-side loading fetch and now starts from server-provided data while keeping client mutations intact
- `apps/web/app/progress/page.tsx`
  - converted the page into a server component that fetches progress data before render

**Why:**
- Dashboard and Progress now arrive already populated on first render instead of showing empty values and catching up later.
- This keeps the existing client interactivity, but removes the biggest source of the perceived loading lag on these two pages.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

## 2026-04-02

### Session 75 (Interface review cleanup before Admin)

**Problem investigated:**
- The restored `course -> module -> material` flow was structurally correct, but several surfaces still read like implementation notes instead of polished product UI.
- Key actions in the module and material cards were still more text-heavy than the v1 reference, especially around open/edit/source affordances.
- The material flow also still repeated state through extra chips (`Has source URL`, `Quick access`, `Not pinned`) even when those states were already visible elsewhere.

**What changed:**
- `apps/web/components/course/course-workspace-header.tsx`
  - simplified the eyebrow/helper copy so the course header sounds more like product UI and less like a handoff explanation
  - removed the extra hierarchy chip
  - changed the open-form CTA state from `Hide module form` to a quieter `Close`
- `apps/web/components/course/module-section.tsx`
  - shortened the fallback module description copy
  - switched the main module actions toward a lighter icon-toolbar treatment for view/edit/delete, closer to the v1 interaction language
- `apps/web/components/course/module-list.tsx`
  - tightened the empty-state copy
- `apps/web/components/modules/module-workspace-header.tsx`
  - replaced the upload/disclaimer-style helper copy with shorter product-facing guidance
  - changed the open-form CTA state from `Hide material form` to `Close`
- `apps/web/components/modules/module-sidebar.tsx`
  - shortened the sidebar helper copy
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - shortened both the helper text and empty state
- `apps/web/components/ui/action-icons.tsx`
  - added shared collection, pencil, trash, eye, and external-link icons so the module/material action bars can stay lighter and more consistent
- `apps/web/components/course/material-row.tsx`
  - removed the redundant `Has source URL` and `Quick access` chips
  - moved source/open actions to icon buttons so the title and preview stay visually dominant
- `apps/web/components/materials/material-view-panel.tsx`
  - moved source access into the main metadata/action area
  - removed the extra bottom `Open attached link/file` CTA
- `apps/web/components/materials/material-editor-form.tsx`
  - tightened the helper copy
- `apps/web/components/modules/module-material-composer.tsx`
  - tightened the helper copy and auto-title hint
- `apps/web/app/materials/[id]/page.tsx`
  - replaced the `Material workspace` framing with cleaner review/edit language
  - removed the negative `Not pinned` chip and only show the quick-access chip when the item is actually pinned

**Why:**
- The course/module/material flow now reads closer to a finished product and less like an explanation of the implementation.
- The action language is lighter and more v1-like: more icon-led, less repetitive text.
- Source and pin states still remain visible, but without the extra chip noise that was making the cards feel busier than necessary.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

**Recommended next adaptation target:**
- stay in the interface review checkpoint for one more manual browser pass across Dashboard, Course Details, module workspace, material detail, and Profile
- specifically verify mobile wrapping and hover balance of the new icon-heavy action bars
- only after that checkpoint looks clean should the next chat move into the Admin Panel adaptation pass

### Session 76 (Dashboard course-focus cleanup)

**Problem investigated:**
- The dashboard was still showing the `Progress Board`, `Quick Idea Capture`, and `Calendar Pulse` strip above the course area.
- That secondary productivity layer was starting to compete with the main dashboard meaning, which should stay centered on courses and pinned study materials.

**What changed:**
- `apps/web/app/dashboard/page.tsx`
  - removed the dashboard-only rendering of `ProgressWidget`, `QuickIdeaCapture`, and `CalendarWidget`
  - removed the page-level milestone/calendar/idea-create wiring that only existed to support that strip
  - kept the rest of the dashboard flow intact: hero, create-course form, course filters/cards, and pinned sidebar

**Why:**
- The dashboard now has a cleaner mental model and no longer splits attention between course management and a separate backlog/progress area.
- Courses stay as the primary object on the page, which better matches the product structure you called out.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 77 (Material card hierarchy cleanup)

**Problem investigated:**
- The material title inside the module workspace cards was still too close in scale to the module title above, which made the card hierarchy feel flat.
- The `Open material` action was also reading too heavy because the solid black treatment stood apart from the lighter secondary buttons around it.

**What changed:**
- `apps/web/components/course/material-row.tsx`
  - reduced the material title scale so note titles sit more clearly below the module heading level
  - changed the `Open material` action from a dark solid button to a lighter outlined button that matches the surrounding action language better

**Why:**
- The material cards now read with a clearer visual hierarchy.
- The main CTA still stays obvious, but no longer steals attention through a one-off black surface.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 78 (Module card fallback-copy removal)

**Problem investigated:**
- Module cards without a saved description were still showing fallback helper copy under the title.
- That line was no longer adding value and was making the cards feel busier than they needed to be.

**What changed:**
- `apps/web/components/course/module-section.tsx`
  - removed the fallback summary text entirely
  - module cards now show the second line only when a real module description exists

**Why:**
- Empty-description cards now read much cleaner and keep the focus on the module title and actions.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 79 (Progress nav exposure + course-card label removal)

**Problem investigated:**
- After the dashboard cleanup, the progress/backlog area no longer had an obvious entry point from the authenticated navigation.
- Dashboard course cards were also still carrying the `Course card` pill, which read like an internal UI label instead of meaningful user-facing information.

**What changed:**
- `apps/web/components/navbar.tsx`
  - added a direct `Progress` navigation link to the existing `/progress` page
- `apps/web/components/dashboard/course-card.tsx`
  - removed the `Course card` pill entirely
  - kept the footer focused on actions only

**Why:**
- The progress area is now easy to discover without putting it back into the dashboard itself.
- Course cards read cleaner and no longer waste attention on a redundant structural label.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 80 (Pinned shelf typography softening)

**Problem investigated:**
- The pinned-materials shelf on the dashboard still had some text reading too close to pure black, especially in the saved-item titles and tag filter pills.
- That made the shelf feel visually heavier than the surrounding softer brand/slate treatment.

**What changed:**
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - shifted pinned item titles from near-black to a softer brand tone
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - softened the inactive tag-filter pill text in that section

**Why:**
- The pinned shelf now feels more aligned with the rest of the dashboard typography and less visually harsh.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 81 (Progress calendar move + dashboard widget cleanup)

**Problem investigated:**
- The dashboard no longer rendered `ProgressWidget`, `QuickIdeaCapture`, and `CalendarWidget`, but the old dashboard-only widget files and extra dashboard data loading were still hanging around.
- The calendar summary also needed a real home inside the `Progress` area instead of remaining conceptually tied to the dashboard.

**What changed:**
- `apps/web/components/progress/upcoming-events-panel.tsx`
  - added a dedicated progress-side panel for upcoming calendar events in the next 7 days
  - linked that panel to the full `/calendar` page
- `apps/web/components/progress/use-progress-page-state.ts`
  - extended the progress page state to load calendar events alongside milestones
- `apps/web/app/progress/page.tsx`
  - placed the new upcoming-events panel in the right-side progress column above `Due Soon`
- `apps/web/lib/dashboard-data.ts`
  - removed milestone and event loading from the dashboard data helper because the dashboard no longer uses them
- `apps/web/components/dashboard/progress-widget.tsx`
  - removed as dead dashboard-only UI
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - removed as dead dashboard-only UI
- `apps/web/components/dashboard/calendar-widget.tsx`
  - removed after moving the calendar summary responsibility into the progress context

**Why:**
- The dashboard stays course-focused without carrying hidden leftover progress/calendar baggage in its data path.
- The calendar summary now sits where it makes more product sense: inside `Progress`, next to milestones, due-soon items, and the ideas backlog.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 82 (Progress typography + color softening)

**Problem investigated:**
- The `Progress` area was still using too much default sans treatment and too many near-black display titles compared with the rest of the app.
- That made the page feel visually disconnected from the softer signature/brand language already established across Dashboard, courses, modules, and materials.

**What changed:**
- `apps/web/app/progress/page.tsx`
  - moved the main page heading into the shared signature title treatment
  - softened the back-link hover color
  - upgraded the hero surface to the same premium light/dark blend used elsewhere
- `apps/web/components/progress/progress-bar.tsx`
  - moved the section heading into the shared panel-title treatment
- `apps/web/components/progress/due-soon-list.tsx`
  - upgraded the section heading treatment
  - softened item title color away from near-black
- `apps/web/components/progress/upcoming-events-panel.tsx`
  - upgraded the section heading treatment
  - softened event title color away from near-black
- `apps/web/components/progress/ideas-backlog.tsx`
  - upgraded the section heading treatment
  - softened backlog item titles away from near-black
- `apps/web/components/progress/milestone-timeline.tsx`
  - softened timeline item titles away from near-black
- `apps/web/components/progress/progress-summary-cards.tsx`
  - softened the number styling, especially the default `Total` card, so the stats no longer read as heavy black counters

**Why:**
- The progress page now feels much closer to the visual voice of the rest of the authenticated app.
- Display text stays readable, but the page no longer defaults to harsh black headings everywhere.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 56 (Authenticated navbar mascot cleanup)

**Problem investigated:**
- The authenticated navbar mascot needed a light backing because the logo asset has transparent areas.
- The previous white backing read as a visible white spot instead of a clean brand accent.

**What changed:**
- `apps/web/components/navbar.tsx`
  - switched the authenticated navbar mascot to the cropped logo asset for a tighter fit
  - replaced the solid white inner plate with a softer radial light backing and a lighter inner ring
  - kept the existing dark header styling while making the logo read more clearly without the hard white blob

**Why:**
- The mascot now has enough separation from the dark navbar without looking like a separate white patch behind it.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 57 (Authenticated navbar premium brand badge)

**Problem investigated:**
- The authenticated navbar logo no longer had the hard white spot, but the badge still felt too heavy and sticker-like.
- The brand mark needed a more premium dark-shell treatment instead of a simple icon sitting inside a white circle.

**What changed:**
- `apps/web/components/navbar.tsx`
  - extracted the navbar mascot into a dedicated `BrandMark` helper for cleaner structure
  - rebuilt the badge as a polished rounded shell with layered gloss, cyan-indigo ambient glow, and a pearl orb behind the mascot
  - kept the mascot readable on the dark header while making the mark feel more intentional and premium

**Why:**
- The logo now reads more like a crafted product badge and less like a transparent PNG placed over a white patch.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 58 (Navbar mascot de-patched with silhouette asset)

**Problem investigated:**
- Even after the premium badge pass, the mascot area still read like a layered patch rather than a natural brand mark.
- The visual issue came from relying on too many CSS surfaces to compensate for a transparent mascot asset.

**What changed:**
- `apps/web/public/assets/v1/icons/mascot-logo-navbar.png`
  - generated a dedicated navbar mascot asset with a soft white silhouette backing that follows the mascot shape instead of using a circular plate
- `apps/web/components/navbar.tsx`
  - removed the heavy boxed badge treatment
  - simplified the brand mark to a cleaner floating mascot with subtle cyan/indigo ambient glow
  - switched the navbar logo source to the new dedicated navbar asset

**Why:**
- The logo now reads as one intentional mark instead of a transparent PNG trying to sit on top of layered background patches.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 59 (Navbar mascot filled from internal transparency)

**Problem investigated:**
- The silhouette-backed navbar mascot removed the patch effect, but it still looked like a photographic negative because the whole outer shape was glowing light against the dark header.
- The real issue was the mascot asset itself: the internal transparent areas needed filling, not the outside silhouette.

**What changed:**
- `apps/web/public/assets/v1/icons/mascot-logo-navbar-filled.png`
  - generated a new navbar-specific mascot asset by filling only the internal transparent regions of the original mascot with a soft pearl white treatment
- `apps/web/components/navbar.tsx`
  - switched the brand mark to the new internally filled mascot asset
  - removed the stronger secondary glow treatment and kept only a very restrained ambient glow + shadow

**Why:**
- The mascot now reads like a normal logo on a dark surface instead of a white-outline cutout or inverted-photo effect.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 60 (Subtle navbar halo pass)

**Problem investigated:**
- After fixing the mascot transparency, the logo was finally clean, but it could still benefit from a little more separation from the dark header.
- The user wanted to test a halo again without reintroducing the old patch or negative-photo effect.

**What changed:**
- `apps/web/components/navbar.tsx`
  - added one restrained radial cyan-indigo halo layer behind the mascot
  - kept the existing internal-fill asset and avoided any new white backing plate

**Why:**
- The mascot now gets a softer premium lift from the header while staying clean and natural.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 61 (Scenic navbar glow pass)

**Problem investigated:**
- The subtle halo worked, but the user wanted to explore a slightly more scenic presentation.

**What changed:**
- `apps/web/components/navbar.tsx`
  - deepened the main halo into a richer cyan-indigo-violet bloom
  - added two small atmospheric glow pockets to make the mascot feel a bit more stage-lit
  - kept the mascot asset and overall silhouette unchanged

**Why:**
- The brand mark now has a touch more drama and presence without falling back into patch-like white backing.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 62 (Dashboard light-mode typography luxury pass)

**Problem investigated:**
- In light mode, the dashboard handwritten headings still started from a tone that felt too close to near-black.
- The user wanted the font color to feel a little lighter and more luxurious, closer to the earlier softer pass.

**What changed:**
- `apps/web/app/globals.css`
  - lightened the shared `dashboard-script-title` / `dashboard-panel-title` gradient toward softer indigo-lilac-teal tones
  - softened the light-mode title shadow so the lettering feels less heavy
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - softened stat-label and supporting-copy tones in light mode
  - eased the stat number color away from hard near-black
- `apps/web/components/dashboard/progress-widget.tsx`
  - softened the light-mode eyebrow label and supporting-copy tone
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - softened the supporting-copy tone in light mode
- `apps/web/components/dashboard/calendar-widget.tsx`
  - softened the light-mode eyebrow label, event title, and date tones

**Why:**
- The dashboard typography now feels more polished and airy in light mode, without losing readability.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 63 (Script title descender clipping fix)

**Problem investigated:**
- The handwritten title treatment looked slightly clipped at the bottom on pages like `/profile`.
- The issue came from the reusable script title treatment not leaving enough breathing room for descenders in the chosen font.

**What changed:**
- `apps/web/app/globals.css`
  - added a dedicated `line-height` and a small bottom padding to `.dashboard-script-title`

**Why:**
- Titles like `My Profile` now keep their handwritten descenders visible instead of looking trimmed at the baseline.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 64 (Profile signature headline + avatar upload honesty pass)

**Problem investigated:**
- The profile experience still mixed one standard bold name treatment with the newer signature typography language.
- Avatar upload messaging also sounded more complete than the actual state we want to communicate right now.

**What changed:**
- `apps/web/components/profile/profile-hero-card.tsx`
  - moved the main profile hero name onto the shared signature title treatment
  - replaced the old Cloudflare R2 upload copy with an honest “planned / not finalized yet” message
- `apps/web/components/profile/profile-details-card.tsx`
  - updated avatar URL helper copy to say external image links work now
  - replaced the direct upload action block with a clear `Coming soon` state instead of pretending the flow is final
- `apps/web/lib/profile.ts`
  - updated the “photo missing” status description to reflect that direct photo upload is planned, while image URLs already work
- `apps/web/app/profile/page.tsx`
  - removed now-unused direct-upload props from the details card wiring

**Why:**
- The profile page now feels visually more unified and communicates the avatar situation honestly instead of overpromising.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 74 (Legacy plus-button motion alignment)

**Problem investigated:**
- The create-action buttons still did not feel quite like the original StudyHub v1 interaction.
- The user called out the `+` animation specifically: it should feel closer to the legacy button behavior instead of looking like a generic modern hover effect.
- One module card label still said `Module workspace`, even though the current UI language had already been simplified to just `Module`.

**What changed:**
- `apps/web/components/course/course-workspace-header.tsx`
  - adjusted the `New module` plus icon to use a more v1-like hover motion with upward lift, bounce timing, and a quarter-turn spin
- `apps/web/components/modules/module-workspace-header.tsx`
  - matched the `Add material` plus icon to the same legacy-inspired motion so the two create buttons now feel consistent
- `apps/web/components/course/module-section.tsx`
  - changed the eyebrow label from `Module workspace` to `Module`

**Why:**
- The add buttons now feel closer to the original StudyHub interaction language the user remembered from v1.
- The module cards also read more cleanly without the older `workspace` wording.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 73 (Editable module descriptions + course card cleanup)

**Problem investigated:**
- The course module cards still showed a redundant `Contains X item` summary line that the UI no longer needed.
- The explanation text under each module title was not actually editable because modules did not yet have a stored `description` field in the schema.
- The user-facing control still said `Rename`, but the real need was to edit both the module title and the descriptive copy below it.

**What changed:**
- `drizzle/schema.ts`
  - added `description` to the `modules` table
- `drizzle/migrations/0002_faithful_mesmero.sql`
  - generated a new Drizzle migration for the module description column
  - made the SQL idempotent with `ADD COLUMN IF NOT EXISTS`
- `apps/web/app/api/courses/[id]/modules/route.ts`
  - create-module API now accepts and stores an optional module description
- `apps/web/app/api/modules/[id]/route.ts`
  - update-module API now accepts and persists description changes
- `apps/web/components/course/module-section.tsx`
  - removed the `Contains X item` line from the card
  - changed the action from `Rename` to `Edit details`
  - edit mode now supports both title and description
  - card copy now renders the stored module description when present
- `apps/web/components/course/course-workspace-header.tsx`
  - the new-module form now includes an optional description field
- `apps/web/app/courses/[id]/page.tsx`
  - removed module material-count fetching because those counts are no longer shown on the page
  - wired create/update flows to the new description field
- `apps/web/components/modules/module-workspace-header.tsx`
  - the module workspace header now reuses the stored module description instead of always showing the generic helper copy

**Why:**
- The course cards are now quieter and no longer waste space on redundant metadata.
- Module descriptions are now real editable content instead of fixed placeholder text, which makes the `Edit details` action honest and actually useful.
- Removing the old count-fetching also simplifies the course page and cuts unnecessary API calls.

**Validation:**
- `node_modules\\.bin\\drizzle-kit.cmd generate`
- applied the new `modules.description` column to the current dev database via Neon HTTP after `drizzle-kit migrate` stalled on the websocket migration path in this environment
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 72 (Icon-based pin and reorder controls)

**Problem investigated:**
- The material flow still used text buttons for `Pin / Pinned`, while the original StudyHub interface communicated that action more cleanly with a pin icon.
- The course module cards also still used text-based `Up / Down` controls, even though the older interface handled reorder actions with simple arrow icons.

**What changed:**
- `apps/web/components/ui/action-icons.tsx`
  - added a shared icon set for pin, move up, and move down controls
- `apps/web/components/course/material-row.tsx`
  - replaced the text-based pin button with an icon button inspired by the old pinned-state treatment
  - kept clear `title` and `aria-label` copy so the control remains understandable without visible text
- `apps/web/components/materials/material-view-panel.tsx`
  - switched the material detail pin action to the same icon button treatment
- `apps/web/components/course/module-section.tsx`
  - replaced `Up / Down` text controls with icon buttons so reorder actions read lighter and closer to the v1 interaction language

**Why:**
- These controls now feel more visual and less repetitive, especially in material cards where the title and metadata already carry enough text.
- The module cards also breathe better because reorder actions no longer compete with the main content copy.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 71 (Material type icons cleanup)

**Problem investigated:**
- The material cards still repeated the type too many times: once as a large text block inside the animated icon (`NOTE`), once again as a `Note` chip, and once more in the footer as `NOTE item`.
- That made the card feel text-heavy and distracted from the actual material title.

**What changed:**
- `apps/web/components/course/material-row.tsx`
  - replaced the text-based animated `NOTE/LINK/FILE` square with small illustrated SVG icons for note, link, and file
  - kept the hover interaction and glow treatment, but moved the emphasis from text to drawing
  - removed the redundant footer label (`NOTE item`, `LINK item`, `FILE item`)
  - kept the `MaterialTypePill` as the single textual type indicator on the card

**Why:**
- The material rows now feel quieter and more visual, which makes the user’s eye land on the title first instead of bouncing between repeated labels.
- The cleanup also scales correctly for link and file materials once those appear in the module.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 70 (Course module card simplification)

**Problem investigated:**
- The module titles on the course details cards were still too close in scale to the main course title above them.
- The metadata chips under each module card felt redundant: the module number was already shown in the left badge, and the `study item` chip was too vague to justify a highlighted pill.

**What changed:**
- `apps/web/components/course/module-section.tsx`
  - reduced the signature title scale so module names sit one level below the course title
  - removed the redundant metadata chips from the bottom of each card
  - replaced them with a quieter summary line such as `Contains 1 item` or `No items yet`

**Why:**
- The course page hierarchy now reads more naturally: course title first, module titles second.
- The cards also feel less busy because repeated structural labels no longer compete with the content and actions.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 69 (Course module cards typography + clearer count labels)

**Problem investigated:**
- The course details page still had a leftover draft feel in the module cards because the module titles were rendering in the default heavy sans treatment instead of the signature heading style.
- The count chip on each card said `1 material`, which read too much like an internal data label and was not clear enough in the interface.

**What changed:**
- `apps/web/components/course/module-section.tsx`
  - moved module card titles into the shared signature heading treatment
  - removed the truncation-heavy title styling so course module names can read more naturally
  - changed the count chip from `material/materials` to the clearer `study item/study items`
  - renamed the secondary order chip from `Step N` to `Module N` so the language matches the actual hierarchy

**Why:**
- The course details screen now stays visually aligned with the signature typography direction already established across the dashboard, module workspace, and material detail views.
- The card metadata also reads more like product copy and less like raw database terminology.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 68 (Signature font cleanup + material detail duplication fix)

**Problem investigated:**
- Several headings in the new module/material flow still looked like leftover draft typography instead of the intended signature treatment.
- Cyrillic titles were not reliably reading as “signature” because the handwritten stack needed a better fallback.
- The material detail page was also repeating the same material title twice: once in the page header and once again inside the main content panel.

**What changed:**
- `apps/web/app/globals.css`
  - added a Cyrillic-friendly handwritten fallback (`Caveat`) into the shared signature font stack
- `apps/web/components/modules/module-sidebar.tsx`
  - moved the course title into the signature treatment
  - updated module titles so the active item reads in the signature style instead of a leftover draft sans look
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - updated the “Pinned materials” heading to the signature treatment
- `apps/web/components/course/material-row.tsx`
  - changed the material row title from the temporary heavy sans treatment to the signature title treatment
- `apps/web/components/materials/material-view-panel.tsx`
  - moved the in-panel material title into the signature treatment
- `apps/web/app/materials/[id]/page.tsx`
  - removed the duplicated material title from the page header
  - turned the top section into a context header (“Material workspace”) so the actual content title only appears once

**Why:**
- The module/material flow now feels much more consistent with the premium signature direction already used in the stronger dashboard/profile passes.
- The material detail screen also reads cleaner because it no longer repeats the same title in two places.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 67 (Material card icon interaction + title styling)

**Problem investigated:**
- The user wanted the material card icon to feel more alive again, closer to the old StudyHub hover interaction.
- The material title also needed a cleaner font/color treatment to read closer to the original visual direction.

**What changed:**
- `apps/web/components/course/material-row.tsx`
  - added a hover animation to the material type icon with scale, lift, and slight rotation
  - restored a soft colored glow behind the icon so it feels more interactive on pointer hover
  - updated the icon label styling to a stronger uppercase badge treatment
  - refined the material title to use a cleaner Poppins-heavy look with a darker blue/slate tone and better hover color transition

**Why:**
- The material rows now feel closer to the old product's playful interaction language without breaking the newer premium layout.
- The title reads more intentional and visually anchored instead of feeling too plain.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 66 (Course -> modules -> materials hierarchy restoration)

**Problem investigated:**
- The current adaptation work still felt too flat compared with the original StudyHub flow.
- `Course Details` was mixing modules and materials on one screen, which blurred the intended hierarchy.
- `Materials` detail/edit had no strong breadcrumb back to the module context, so the navigation loop still felt incomplete.

**What changed:**
- `apps/web/app/api/modules/[id]/route.ts`
  - added a `GET` payload that returns both the selected module and its parent course context
- `apps/web/app/api/materials/[id]/route.ts`
  - expanded the `GET` payload to include module + course context for breadcrumbs and smarter redirects
- `apps/web/app/courses/[id]/page.tsx`
  - turned the page back into a true modules workspace for the selected course
  - removed the flattened inline materials management from this screen
  - added module creation, rename, delete, reorder, and clearer “Open materials” actions
- `apps/web/components/course/course-workspace-header.tsx`
  - rebuilt the course hero around the restored `course -> modules -> materials` flow
- `apps/web/components/course/module-list.tsx`
  - simplified the screen into a dedicated module-card list
- `apps/web/components/course/module-section.tsx`
  - redesigned each module item into a stronger premium card with order, counts, rename/reorder/delete actions, and direct module-workspace entry
- `apps/web/app/modules/[id]/page.tsx`
  - added a new dedicated module-level materials workspace route
  - brought in the original-style hierarchy more clearly with module sidebar, materials list, pinned rail, filters, sort, search, and quick create form
- `apps/web/components/modules/module-sidebar.tsx`
  - added a left rail for switching between modules inside the same course
- `apps/web/components/modules/module-workspace-header.tsx`
  - added the new module hero/toolbar with filters and create-material CTA
- `apps/web/components/modules/module-material-composer.tsx`
  - extracted the quick-create material form into a dedicated module-level surface
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - added a dedicated quick-access rail for pinned materials inside the current module
- `apps/web/components/course/material-row.tsx`
  - upgraded material items into clearer premium cards with better type emphasis, pin visibility, metadata, and open actions
- `apps/web/app/materials/[id]/page.tsx`
  - added explicit breadcrumb context back to the module and course
  - changed delete redirect to return to the module workspace instead of the dashboard
- `apps/web/components/materials/material-view-panel.tsx`
  - refined the view mode surface and action styling
- `apps/web/components/materials/material-editor-form.tsx`
  - refined the edit form styling to match the new module/material flow
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - changed the secondary pinned link target from the course page to the new module workspace
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - updated pinned search matching to include module names too

**Why:**
- The adapted web app now follows the original mental model more faithfully:
  - dashboard selects a course
  - course page manages modules
  - module page manages materials
  - material detail/edit keeps a clear path back to its module
- This also makes the UI feel less crowded and gives module/material actions much clearer ownership.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

**Recommended next adaptation target:**
- **First:** Interface review checkpoint
  - pause before the Admin Panel pass and review the current adapted UI in the browser
  - look specifically at Dashboard, Course Details, module workspace, material detail, and Profile for spacing, hierarchy, copy tone, mobile behavior, and visual consistency
  - capture any last small UI corrections before moving into the next large feature/polish block
- **Second:** Admin Panel adaptation pass
  - replace the remaining native `confirm()` flows with `ConfirmModal`
  - tighten tabs/cards/tables/empty states so they match the newer dashboard/profile/module quality bar
- **Third:** Public pages follow-up: `How it works` + `Contact`
  - still missing as dedicated app-router pages
  - good follow-up after the authenticated app surfaces feel settled
- **Fourth:** Sharing / `Shared with Me`
  - still the last major visible parity feature not started in the active plan
- **Fifth:** Avatar upload implementation revisit
  - keep this for after the remaining UI adaptation targets unless a dependable demo-safe upload path is chosen earlier

**Recommended prompt for the next chat:**
- `Read docs/dev-log.md and docs/implementation-plan.md and start with an interface review checkpoint before the Admin Panel pass. Review Dashboard, Course Details, module workspace, material detail, and Profile in the browser, note any remaining UI inconsistencies, and only then continue into admin adaptation work.`

### Session 65 (Cross-chat handoff for adaptation work)

**Current UI state:**
- Dashboard and Profile already went through the stronger premium/parity adaptation passes.
- Materials and Course Details have had parity work, but still need another refinement pass before they feel fully settled.
- Profile typography is now aligned with the shared signature treatment.
- Direct avatar upload is intentionally marked as planned / coming soon until we choose a reliable final solution.

**Recommended next adaptation target:**
- **First:** Course Details + Materials refinement pass
  - revisit module sections, material rows/cards, spacing, action clarity, and empty states
  - compare against the old product flow again, because the current pages still do not feel fully finished
- **Second:** Admin Panel adaptation pass
  - good next large pass after modules/materials feel truly settled
  - should include visual polish for tabs/cards/tables plus replacing any remaining native `confirm()` flows with `ConfirmModal`
- **Third:** Public pages follow-up: `How it works` + `Contact`
  - these should stay visible in the handoff because they still do not exist as dedicated app-router pages
  - they fit best as part of a later public-site adaptation / polish pass
- **Fourth:** Sharing / `Shared with Me`
  - still not started in the active plan
  - strong parity win because it exists in the old product direction and adds a visible collaboration story
- **Fifth:** Avatar upload implementation revisit
  - only after we are ready to commit to a dependable demo-friendly upload/storage path

**Recommended prompt for the next chat:**
- `Read docs/dev-log.md and docs/implementation-plan.md and continue with the Course Details + Materials refinement pass. Start by auditing the current module/material screens against the old StudyHub flow and list the UI/UX gaps before changing code.`

### Session 55 (Navbar wordmark and mascot polish)

**Problem investigated:**
- The `StudyHub` wordmark in the authenticated navbar looked clipped at the bottom.
- The mascot logo also sat directly on a transparent/dark background, which made it feel visually unfinished.

**What changed:**
- `apps/web/components/navbar.tsx`
  - added a clean white inner backing behind the mascot/logo so the transparent asset reads more clearly
  - adjusted the wordmark rendering with safer line-height, inline-block spacing, and transparent text fill so the lower edge no longer looks cut off
  - kept the existing gradient styling while making it render more cleanly in the navbar

**Why:**
- The brand area now looks more intentional and polished instead of clipped or visually hollow.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 83 (Calendar discoverability fix)

**Problem investigated:**
- The calendar had been moved out of the dashboard, but it was too hidden.
- It existed as a separate `/calendar` page and only had a small entry point inside the `Progress` sidebar, so it was easy to miss.

**What changed:**
- `apps/web/components/navbar.tsx`
  - added a direct `Calendar` navigation link
- `apps/web/app/progress/page.tsx`
  - added a visible `Open calendar` CTA in the hero area
- `apps/web/app/calendar/page.tsx`
  - changed the back-link from `Dashboard` to `Progress`

**Why:**
- The calendar now reads as part of the progress area, but it is no longer hidden behind a small secondary panel action.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 84 (Backlog layout move in Progress)

**Problem investigated:**
- The ideas backlog was still constrained to the narrow right rail in `Progress`.
- That made it feel secondary even though it belongs more naturally under the milestone workflow.

**What changed:**
- `apps/web/app/progress/page.tsx`
  - moved `IdeasBacklog` out of the right column
  - rendered it as a full-width section below the main progress grid

**Why:**
- The backlog now reads as part of the main planning flow instead of as a cramped sidebar widget.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 85 (Calendar theme parity fix)

**Problem investigated:**
- The calendar page was still hardcoded as a dark-only screen.
- It stayed visually dark even when the app was in light mode.

**What changed:**
- `apps/web/app/calendar/page.tsx`
  - rebuilt the page shell to respect light and dark theme variants
  - aligned the hero and month controls with the newer `Progress` styling
- `apps/web/components/calendar/calendar-grid.tsx`
  - added proper light-mode styling for headers, cells, selected state, and today state
- `apps/web/components/calendar/event-sidebar.tsx`
  - converted the sidebar, event cards, and form controls to proper light/dark styling
  - replaced the broken delete glyph with a simple `x`

**Why:**
- The calendar now behaves like the rest of the app instead of forcing a dark visual treatment.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 86 (Dashboard hero copy cleanup)

**Problem investigated:**
- The dashboard hero still carried a `Workspace Board` eyebrow label that read like internal UI naming.
- The helper sentence under `Dashboard` also felt optional and visually busy for such a straightforward screen.

**What changed:**
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - removed the `Workspace Board` pill
  - removed the helper paragraph under the main `Dashboard` title

**Why:**
- The hero now lands faster and keeps the focus on the page title, actions, and stats.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 87 (Interface review pass for Progress, Calendar, and module workspace)

**Problem investigated:**
- The current pre-Admin interface review still showed a few draft-like helper blocks, count pills, and heavier-than-needed text across `Progress`, `Calendar`, and the `course -> module` workspace flow.
- Some mobile states also felt a bit rigid because primary CTAs were still sized like desktop controls.
- The ideas backlog and calendar event rows had a few action areas where compact icons would read cleaner than repeated text labels.

**What changed:**
- `apps/web/app/progress/page.tsx`
  - removed the extra helper sentence from the hero
  - made the `Open calendar` CTA span full width on smaller screens
- `apps/web/components/progress/upcoming-events-panel.tsx`
  - simplified the copy from `Upcoming Events` + helper text into a tighter `Coming Up` treatment
  - shortened the calendar CTA label
- `apps/web/components/progress/due-soon-list.tsx`
  - replaced the vague `Focus` eyebrow with the clearer `Milestones`
- `apps/web/components/progress/ideas-backlog.tsx`
  - removed the helper line under the title
  - replaced the text-heavy row actions with icon actions for edit, promote, and delete
  - shortened the add CTA copy
- `apps/web/app/calendar/page.tsx`
  - removed the extra hero helper sentence
  - made the `Today` CTA more mobile-friendly
  - centered the month label between the previous/next controls and loosened the panel spacing
- `apps/web/components/calendar/event-sidebar.tsx`
  - replaced the plain `x` delete affordance with the shared trash icon button
  - added a softer day summary line instead of a separate empty-state sentence
- `apps/web/components/course/course-workspace-header.tsx`
  - replaced the module count pill with quieter metadata text
  - removed the helper banner and redundant form note
  - made the primary module CTA fill the available width on mobile
- `apps/web/components/modules/module-workspace-header.tsx`
  - replaced the count pills with a lighter `study items / pinned` metadata line
  - removed the helper banner and shortened the search placeholder copy
  - made the add-material CTA work better on mobile width
- `apps/web/components/modules/module-sidebar.tsx`
  - shortened the back-link copy
  - removed the extra helper text and module-count pill
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - shortened the main heading
  - removed the helper sentence and tightened the empty-state copy

**Why:**
- The progress/calendar area now lands faster without stacked helper copy repeating what the page already communicates visually.
- The course/module workspace also feels less like a draft scaffold because metadata stays visible without competing through pills and banners.
- Mobile layouts benefit from the wider CTA treatment, and the icon actions reduce visual noise in repeated list rows.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 88 (Progress calendar CTA cleanup)

**Problem investigated:**
- The calendar is already directly reachable from the authenticated navbar.
- The extra calendar buttons inside `Progress` made the page feel repetitive instead of more discoverable.

**What changed:**
- `apps/web/app/progress/page.tsx`
  - removed the hero-level `Open calendar` button
- `apps/web/components/progress/upcoming-events-panel.tsx`
  - removed the secondary `Calendar` CTA from the panel header

**Why:**
- `Progress` now relies on the navbar for calendar navigation instead of repeating the same action in multiple places.
- The page header and sidebar card read cleaner with less duplicate UI chrome.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 89 (Progress/navbar sans font cleanup)

**Problem investigated:**
- The plain sans text around the authenticated navbar and the `Progress` screen still read a bit like leftover draft typography.
- It was not actually Arial; the current default sans layer there was `Rubik`, but next to the handwritten titles it still felt too generic.

**What changed:**
- `apps/web/components/navbar.tsx`
  - switched the authenticated navbar chrome to the shared `font-poppins` treatment
- `apps/web/app/progress/page.tsx`
  - applied `font-poppins` to the page shell so the non-handwritten UI copy reads more intentionally
- `apps/web/app/calendar/page.tsx`
  - matched the calendar shell to the same `font-poppins` treatment for consistency with `Progress`

**Why:**
- The app chrome and the progress/calendar flow now feel less like they are falling back to a draft sans layer.
- The handwritten display titles still keep their stronger personality, but the supporting UI text now has a cleaner companion font.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 90 (Progress heading font hardening)

**Problem investigated:**
- Some `Progress` headings and item titles still looked too close to the base sans layer.
- Even after moving the page shell to `Poppins`, a few repeated labels still felt like they were relying too much on inheritance instead of explicit typography styling.

**What changed:**
- `apps/web/components/progress/progress-summary-cards.tsx`
  - applied explicit `font-poppins` styling to the stat card labels and values
- `apps/web/components/progress/progress-bar.tsx`
  - applied explicit `font-poppins` styling to the eyebrow copy, summary text, and percentage value
- `apps/web/components/progress/upcoming-events-panel.tsx`
  - applied explicit `font-poppins` styling to the panel eyebrow, event titles, and event dates
- `apps/web/components/progress/due-soon-list.tsx`
  - applied explicit `font-poppins` styling to the eyebrow and milestone titles
- `apps/web/components/progress/ideas-backlog.tsx`
  - applied explicit `font-poppins` styling to the eyebrow, count, and idea titles
- `apps/web/components/progress/milestone-timeline.tsx`
  - applied explicit `font-poppins` styling to milestone row titles

**Why:**
- The `Progress` screen no longer depends only on inherited shell typography for its most visible headings and repeated labels.
- The screen now reads more consistently next to the handwritten display titles instead of slipping back toward a generic draft look.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 91 (Course card icon interaction polish)

**Problem investigated:**
- The material `note` icon already had a more playful hover interaction with lift, scale, rotation, and glow.
- The dashboard course cards still used a calmer static glyph, so the icon language did not feel fully aligned.

**What changed:**
- `apps/web/components/dashboard/course-card.tsx`
  - wrapped the course glyph in a `motion` hover interaction
  - added a soft halo behind the icon
  - matched the icon behavior more closely to the material-card interaction language with lift, scale, and slight rotation

**Why:**
- Course cards now feel more alive on hover instead of visually lagging behind the stronger material-card polish.
- The dashboard keeps a more consistent icon interaction style across the main study flow.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 92 (Home animation visibility gating)

**Problem investigated:**
- Laptop heat suggested that some home-page effects were doing continuous work even when they were not actively needed.
- In v1, these effects were designed to wake up only when visible or in active use.

**What changed:**
- `apps/web/components/home/hero-3d.tsx`
  - added a viewport gate before loading the Three.js script and initializing the 3D scene
  - switched the external script load to `lazyOnload`
- `apps/web/components/ui/cursor-glow.tsx`
  - removed the always-running `requestAnimationFrame` loop
  - now starts animating only after actual mouse movement
  - stops animating again once the glow settles
  - pauses fully when the document is hidden
  - skips the effect for reduced-motion and non-fine-pointer environments

**Why:**
- The home page now behaves closer to the old v1 intent: expensive visual effects only spin up when they are visible or actively being used.
- This should reduce unnecessary CPU/GPU work and help with laptop heat while keeping the same visual direction.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 54 (Hero gradient visibility fix)

**Problem investigated:**
- The dashboard course cards were showing the intended lavender-to-cyan handwritten gradient clearly.
- The top dashboard hero still read too white, so the user could not really see the same effect there.

**What changed:**
- `apps/web/app/globals.css`
  - strengthened the dark handwritten title gradient so it reads visibly on larger headings too
  - added `background-size`, `background-repeat`, and `-webkit-text-fill-color: transparent` to make the clipped gradient render more reliably
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - increased the visible purple/cyan glow balance in the dark hero container
  - added a stronger upper-right haze and a soft purple bloom nearer the title area
  - aligned the stat tiles closer to the same premium dark surface language

**Why:**
- The top dashboard area now reads closer to the course-card reference instead of flattening into near-white text.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 53 (Dashboard signature titles + premium glow correction)

**Problem investigated:**
- The previous typography pass drifted away from the intended direction.
- The user clarified that the target was the existing handwritten dashboard title gradient from the course cards (`Cloudflare R2` / `Next.js` style), not plain sans panel headings.
- The dashboard also needed the same soft profile-style dark-surface glow in the background of its main panels.

**What changed:**
- `apps/web/app/globals.css`
  - aligned both `dashboard-script-title` and `dashboard-panel-title` to the same handwritten gradient title treatment
  - tuned the dark-mode title gradient to the softer lavender-to-cyan dashboard look from the existing course-card reference
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - added a profile-inspired internal glow blend to the dark hero surface
  - kept the main dashboard heading on the signature gradient style
- `apps/web/components/dashboard/course-card.tsx`
  - added the soft top-right glow haze and richer dark premium surface treatment
- `apps/web/components/dashboard/create-course-form.tsx`
  - kept the panel title on the signature gradient style
  - added the same premium dark surface glow blend
- `apps/web/components/dashboard/progress-widget.tsx`
  - kept the widget title on the signature gradient style
  - added the same premium dark surface glow blend
- `apps/web/components/dashboard/quick-idea-capture.tsx`
  - kept the widget title on the signature gradient style
  - added the same premium dark surface glow blend
- `apps/web/components/dashboard/calendar-widget.tsx`
  - kept the widget title on the signature gradient style
  - added the same premium dark surface glow blend
- `apps/web/components/dashboard/pinned-sidebar.tsx`
  - kept the sidebar title on the signature gradient style
  - added the same premium dark surface glow blend and soft haze
- `apps/web/components/dashboard/edit-course-modal.tsx`
  - aligned the modal heading and dark surface with the same visual language

**Why:**
- The dashboard now follows the intended rule more faithfully:
  - all dashboard headings use the handwritten signature gradient
  - dark surfaces carry the same soft luminous premium atmosphere seen on the profile page

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 93 (Loading fallback simplification)

**Problem investigated:**
- The user suspected the loading screen itself might be contributing unnecessary work and visual heaviness.
- The shared spinner had already been simplified functionally, but it still carried an unnecessary client boundary and an overly decorative centered fallback.

**What changed:**
- `apps/web/components/ui/spinner.tsx`
  - removed the unnecessary `"use client"` directive so the spinner can stay server-friendly
  - replaced the heavier centered loader with a simpler static card, one spinner ring, and short supporting copy
  - collapsed the old rotating tips concept into a single lightweight hint string
- `apps/web/app/loading.tsx`
  - shortened the global loading message
  - switched the fallback copy to a simpler one-line hint

**Why:**
- The loading experience now does less, hydrates less, and reads more like a calm fallback than a mini animated screen of its own.
- This keeps the loader out of the way while we continue tackling the bigger source of slowness: client-side page data fetching.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 95 (Calendar server-first initial data pass)

**Problem investigated:**
- The `Calendar` page was still loading its initial month entirely on the client.
- That meant the first render waited for `useEffect` + `/api/events?month=...`, which kept the same "empty shell first, real data second" pattern we had already removed from `Dashboard` and `Progress`.

**What changed:**
- `apps/web/app/calendar/page.tsx`
  - converted the route into an async server page
  - now reads the authenticated user server-side and fetches the initial calendar month before the first render
- `apps/web/components/calendar/calendar-client-page.tsx`
  - moved the interactive calendar UI into a dedicated client component
  - keeps month navigation, add/delete actions, and toast handling on the client
  - skips the redundant initial client fetch after hydration
- `apps/web/lib/calendar-data.ts`
  - added a shared calendar data helper for month-bound event loading and event date normalization
  - added a small helper for the initial year/month/selected-day view model
- `apps/web/app/api/events/route.ts`
  - re-used the shared calendar data helper for `GET /api/events`
  - now returns a clean `INVALID_MONTH` error for malformed `month` params
- `apps/web/components/calendar/types.ts`
  - added shared calendar event/view types
- `apps/web/components/calendar/calendar-grid.tsx`
  - now imports the shared calendar event type instead of owning it locally
- `apps/web/components/calendar/event-sidebar.tsx`
  - now imports the shared calendar event type from the new types file

**Why:**
- `Calendar` now follows the same server-first initial render pattern as `Dashboard` and `Progress`.
- The first page load can render immediately with real month data instead of waiting for a client-side fetch after hydration.
- The calendar event query logic is now centralized instead of split between the page and the API route.

**Extra cleanup:**
- Month navigation now keeps the selected day aligned with the visible month, so the sidebar does not stay stuck on a date from the previous month after switching months.
- Added a small inline "Updating events..." status for month-to-month client refreshes instead of using a full-page loading fallback.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

**Recommended next step:**
- Continue the pre-Admin performance polish with the separate navbar auth fetch removal in `apps/web/components/navbar.tsx`.
- After that, do the same server-first initial data pass for `Profile`.

### Session 96 (Performance guardrails documented for future pages)

**Problem investigated:**
- The recent speed/perceived-performance fixes were recorded in session notes, but not yet collected into a reusable checklist for future page work.
- That made it too easy to forget the same lessons when starting the next authenticated screens.

**What changed:**
- `docs/performance-guardrails.md`
  - added a dedicated performance checklist for future page development
  - documented the server-first initial data rule for authenticated screens
  - documented the anti-pattern to avoid: `empty client state -> useEffect fetch -> real content`
  - documented the navbar/shared-chrome rule so we do not keep adding separate auth fetches
  - documented lightweight loading and animation guardrails
  - recorded the current follow-up targets: navbar auth fetch cleanup and Profile server-first

**Why:**
- The performance fixes now live in one reusable document instead of being scattered only across individual session logs.
- Future chats and future pages can use the same checklist before introducing new loading regressions.

**Recommended future handoff:**
- Read `docs/dev-log.md`, `docs/implementation-plan.md`, and `docs/performance-guardrails.md` before continuing authenticated web-page work.

### Session 97 (Navbar auth fetch cleanup + Profile server-first)

**Problem investigated:**
- The authenticated navbar still made its own client-side `/api/auth/me` request after render just to get name, role, avatar, and the Admin link state.
- The Profile page still started as a client page with a full initial loading spinner and fetched its first user payload after mount.

**What changed:**
- `apps/web/lib/server-auth.ts`
  - added `getRequestUserOrNull()` so shared server-rendered UI can read the current auth user without forcing a redirect
- `apps/web/lib/profile-data.ts`
  - added shared profile-user selection + normalization helpers
  - added `getProfileUserById()` for server-first profile/nav loading
- `apps/web/components/navbar.tsx`
  - converted the exported navbar into a small server wrapper
  - now resolves the current user on the server and passes only the needed user chrome data down
- `apps/web/components/navbar-client.tsx`
  - holds the interactive/client navbar shell
  - removed the old `useEffect` auth fetch
- `apps/web/app/profile/page.tsx`
  - converted the profile route into an async server page
  - loads the authenticated profile before first render
- `apps/web/components/profile/profile-page-client.tsx`
  - extracted the interactive profile UI into a dedicated client component seeded with `initialUser`
- `apps/web/components/profile/use-profile-page-state.ts`
  - now starts from server-provided user data instead of loading it on mount
  - keeps profile save/password/avatar actions client-side
  - redirects to `/login` on later action-level `401` responses
- `apps/web/app/api/auth/me/route.ts`
  - now reuses shared auth/profile helpers instead of duplicating token parsing and user mapping
- `apps/web/app/api/auth/avatar/route.ts`
  - now reuses the shared profile-user selection/normalization helpers so client state keeps consistent string dates
- `docs/performance-guardrails.md`
  - updated the checklist to reflect that navbar and Profile are now completed
  - recorded the next likely server-first audit candidates: `courses/[id]`, `modules/[id]`, `materials/[id]`

**Why:**
- The navbar no longer waits for a post-render auth request just to show user chrome and admin visibility.
- Profile now lands with real user data on first render instead of showing a spinner and filling in later.
- The user/profile loading logic is more centralized, which lowers the chance of future drift between page code and auth APIs.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

## 2026-04-03

### Session 100 (Material/detail polish + quieter profile copy)

**Problem investigated:**
- The current pre-Admin checkpoint still had a few authenticated screens where the supporting sans layer, helper copy, and action layout felt heavier than the more polished dashboard/progress direction.
- The material detail screen in particular still read a bit too explanatory, and the profile page repeated the same avatar-upload caveat in multiple places.

**What changed:**
- `apps/web/components/course/course-details-client-page.tsx`
  - applied the shared `font-poppins` shell treatment so the course workspace matches the newer authenticated typography direction
- `apps/web/components/modules/module-workspace-client-page.tsx`
  - applied the same `font-poppins` shell treatment to the module workspace
- `apps/web/components/materials/material-page-client.tsx`
  - applied `font-poppins` to the page shell
  - shortened the hero copy
  - replaced the long inline course/module sentence with a cleaner metadata line
  - made the secondary course CTA work better on smaller screens
- `apps/web/components/materials/material-view-panel.tsx`
  - added a quieter saved-date eyebrow above the title
  - upgraded the source/pin controls and edit/delete actions to feel more aligned with the rest of the app
  - softened the content surface styling
  - replaced the bare `No content yet.` line with a fuller empty-state treatment
- `apps/web/components/profile/profile-page-client.tsx`
  - applied `font-poppins` to the page shell
- `apps/web/components/profile/profile-page-header.tsx`
  - removed the heavier account-settings badge
  - shortened the helper sentence
  - made the back action friendlier on mobile width
- `apps/web/components/profile/profile-hero-card.tsx`
  - shortened the avatar-upload honesty note
  - made the main action buttons stack more cleanly on mobile
- `apps/web/components/profile/profile-details-card.tsx`
  - removed the duplicated upload-status block
  - shortened the intro copy and avatar helper text

**Why:**
- The course/module/material/profile flow now shares the same cleaner authenticated typography companion instead of mixing back into the older draft-like sans feel.
- Material detail lands faster, with clearer metadata and calmer actions.
- Profile still communicates the upload limitation honestly, but without repeating the same message in multiple cards.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 101 (Pinned material title typography cleanup)

**Problem investigated:**
- Some pinned material cards were still rendering their item titles with a generic sans style that read closer to the old draft UI than to the current StudyHub signature typography.
- The most visible mismatch was in the dashboard pinned shelf, but the module workspace pinned sidebar still had the same leftover title treatment.

**What changed:**
- `apps/web/components/dashboard/pinned-material-item.tsx`
  - switched pinned material titles from the plain brand-colored sans style to the shared `dashboard-script-title` treatment
  - added the same subtle title hover shift used elsewhere in the content cards
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - applied the same signature title treatment to pinned material names inside the module sidebar

**Why:**
- Pinned material titles now match the rest of the course/module/material hierarchy instead of falling back to a draft-looking font style.
- The dashboard shelf and module pinned list now feel like the same design system.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 102 (Course card primary-action cleanup)

**Problem investigated:**
- Dashboard course cards still had a dedicated `Open` button even though the course title already acted as the primary navigation link.
- That made the footer feel busier than necessary and repeated the same action in two places.

**What changed:**
- `apps/web/components/dashboard/course-card.tsx`
  - removed the duplicate `Open` button from the footer
  - turned the upper content area of the card into the clearer primary click target
  - kept `Edit` and `Delete` as the remaining secondary actions in the footer

**Why:**
- The card now has a cleaner action hierarchy:
  - open the course from the main content/title area
  - use the footer only for management actions
- This keeps the stronger visual button styling elsewhere in the UI without overloading the course card footer.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 103 (Material card primary-action cleanup)

**Problem investigated:**
- Material cards in the course/module workspace still had a dedicated `Open` button even though the material title already opened the same detail page.
- That repeated the primary navigation action and made the top-right controls busier than needed.

**What changed:**
- `apps/web/components/course/material-row.tsx`
  - removed the duplicate `Open` button
  - turned the upper content area of the material card into the clearer primary click target
  - kept only the source-link action and quick-access pin action on the right

**Why:**
- The material card now follows the same action hierarchy as the course card:
  - open from the main content/title area
  - keep the side actions for secondary controls only
- This makes the card lighter without losing discoverability.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 104 (Cyrillic-safe app sans font fix)

**Problem investigated:**
- Mixed Bulgarian + English content still looked uneven in several authenticated screens even after the local UI polish passes.
- The root cause turned out to be global font coverage:
  - the shared app sans utility was conceptually treated as `Poppins`
  - but `Poppins` in the current Next font pipeline does not provide a Cyrillic subset
  - that caused Cyrillic text to fall back to a different font inside the same paragraph or card

**What changed:**
- `apps/web/app/layout.tsx`
  - removed the unused `Poppins` Next font setup from the root layout
- `apps/web/tailwind.config.ts`
  - pointed the shared `font-poppins` utility at the already-loaded Cyrillic-safe `Rubik` variable
  - kept the handwritten/signature utilities on `Shantell Sans`
- `apps/web/app/globals.css`
  - removed the old direct CSS font-family overrides for `font-poppins`, `font-shantell`, and `font-handwritten`
  - now relies on the Tailwind font utilities backed by the Next font variables
  - removed the old direct Google Fonts import for `Poppins`

**Why:**
- Mixed Bulgarian and English UI/content now stays on one consistent sans font instead of switching mid-line to a fallback.
- This fixes the uneven reading texture across notes, cards, helper copy, and other authenticated app surfaces.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build` ✅
- `npm.cmd --workspace @studyhub/web run typecheck` hit a local sandbox `.next/types` path mismatch after build, but the successful Next build already completed its own type/lint validation for this change.

### Session 105 (Home typography color refinement)

**Problem investigated:**
- The home page already had the right handwritten/display font in key places, but some section headings and smaller titles still read as plain black instead of belonging to the richer StudyHub visual language.
- The issue was not font choice anymore, but the color treatment on several home-only titles.

**What changed:**
- `apps/web/app/globals.css`
  - added `home-display-title` for large home section headings
  - added `home-ink-title` for smaller home card/question titles
- `apps/web/components/home/features.tsx`
  - moved the main section heading to the richer home display treatment
- `apps/web/components/home/about.tsx`
  - moved the main section heading and benefit-card titles to the richer home title treatments
- `apps/web/components/home/faq.tsx`
  - moved the FAQ section heading and accordion question titles away from the plain black treatment
- `apps/web/components/home/glass-card.tsx`
  - upgraded feature-card titles so they use the richer home title treatment by default and still turn white on hover
- `apps/web/components/home/stats.tsx`
  - aligned stat labels to the same home title treatment for consistency if the section is re-enabled later
- `apps/web/app/page.tsx`
  - updated the footer wordmark away from the plain black look

**Why:**
- The home page now keeps its current font direction, but the headings and smaller titles feel more premium and less flat.
- This makes the public marketing surface feel closer to the stronger brand treatment already present in the hero and authenticated app.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 117 (Module material quick-edit shortcut)

**Problem investigated:**
- In the module workspace, material cards exposed source and pin quick actions, but there was no equally fast edit shortcut inside the card container.
- That made small content corrections feel slower than needed because the user first had to open the detail page and only then switch to edit mode.

**What changed:**
- `apps/web/components/course/material-row.tsx`
  - added a dedicated quick-edit icon button in the card action cluster
  - the button links to the material detail route with `?edit=1`
- `apps/web/app/materials/[id]/page.tsx`
  - reads the `edit` search param on the server page
  - passes an `initialEditing` flag into the client page
- `apps/web/components/materials/material-page-client.tsx`
  - starts directly in edit mode when `initialEditing` is true

**Why:**
- Materials from the module workspace now have a true quick-edit path instead of only a quick-open path.
- The existing detail/edit architecture stays intact; the new button just lands the user directly in the editing state.

**Validation:**
- Not run by request: skipped build/dev restart to avoid disrupting the user's current dev session.

### Session 116 (Material type/source wording clarified)

**Problem investigated:**
- The material editor still exposed language from the temporary `fileUrl` data model in a way that could sound misleading.
- That made it look as if the `file` type was already a full upload flow, even though the current implementation still stores an external source URL and real file upload remains future scope.

**What changed:**
- `apps/web/components/materials/material-editor-form.tsx`
  - made the source field label dynamic:
    - `Link URL` for link materials
    - `File source URL` for file materials
    - `Optional source URL` for notes
  - added type-aware placeholders
  - added short helper copy that explains the real current behavior:
    - notes can stay text-only
    - links use a normal URL
    - file upload is still planned, so file materials currently use an external file link
  - tightened the intro copy so it talks about source details matching the selected material type

**Why:**
- The UI now matches the actual state of the feature instead of over-promising a finished upload flow.
- This keeps the long-term direction intact (`note`, `link`, `file upload`) while being honest about the current implementation.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 114 (Hero secondary CTA effect restored)

**Problem investigated:**
- The public home secondary CTA (`See How It Works`) still worked functionally, but it had lost part of the richer premium hover treatment that made the v1 button feel special.
- Compared to the old landing page, the current button looked flatter and less memorable.

**What changed:**
- `apps/web/app/globals.css`
  - upgraded `.btn-explore-features` with a stronger glass surface, richer shadowing, and a more polished hover state
  - restored the premium-effect feel with:
    - animated rotating highlight border
    - subtle internal radial glow on hover
    - stronger pressed/hover depth response
  - added `@keyframes rotateGradient` for the rotating border treatment
- `apps/web/components/home/hero-content.tsx`
  - wrapped the button label in a foreground span so the text stays visually above the decorative pseudo-elements

**Why:**
- The button now feels closer to the old v1 premium CTA instead of reading as a plain outlined pill.
- The effect stays CSS-only, so it adds visual richness without introducing heavier hero-side JavaScript work.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`
- The first build attempt hit only the tool timeout; the retry completed successfully.

### Session 115 (Create module button stretch fix)

**Problem investigated:**
- In the course workspace module-creation form, the `Create module` button could stretch vertically into a tall block instead of staying a normal button.
- The issue came from the large-screen grid layout stretching the second column item to match the full row height.

**What changed:**
- `apps/web/components/course/course-workspace-header.tsx`
  - changed the large-screen form grid to use a fixed action column and `lg:items-start`
  - set the submit button to stay `w-full` inside that action column, but align to the top instead of stretching to the full row height

**Why:**
- The button now behaves like a button again instead of a full-height sidebar block.
- The form keeps the same desktop two-column structure without affecting the server-first course page flow.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 112 (Shared handwritten title clipping pass)

**Problem investigated:**
- The clipping issue was not limited to one home heading anymore.
- Several handwritten/script-style titles still used very tight line-height values, and some local component classes overrode the utility defaults with even tighter `leading-*` values.

**What changed:**
- `apps/web/app/globals.css`
  - moved `dashboard-script-title`, `dashboard-panel-title`, `home-display-title`, and `home-ink-title` to safer shared vertical spacing
  - added slightly larger line-height plus small top/bottom padding so the handwritten glyphs have more room to render cleanly
- loosened the tightest local handwritten title usages in:
  - `apps/web/components/course/module-section.tsx`
  - `apps/web/components/course/material-row.tsx`
  - `apps/web/components/dashboard/pinned-material-item.tsx`
  - `apps/web/components/materials/material-view-panel.tsx`
  - `apps/web/components/modules/module-sidebar.tsx`
  - `apps/web/components/modules/module-pinned-sidebar.tsx`

**Why:**
- This turns the previous one-off heading fix into a broader typography safeguard for the handwritten brand titles.
- Multi-line script headings should now stop looking clipped from the bottom across the main public/app surfaces where we had kept aggressive custom leading values.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`
- Build completed successfully after a retry with a longer timeout; the earlier failure was only the tool timeout, not a compile error.

### Session 113 (Auth autofill stripe cleanup)

**Problem investigated:**
- The login fields could show pale horizontal bars inside the input area when the browser autofilled saved credentials.
- The visual issue came from the browser's autofill styling painting on the inner input element, which broke the intended single glass-field look.

**What changed:**
- `apps/web/components/auth/auth-icon-field.tsx`
  - added a dedicated `auth-field-input` class to the real `<input>`
- `apps/web/app/globals.css`
  - added a scoped WebKit autofill override for auth inputs
  - kept autofilled text/caret colors aligned with the normal theme
  - used autofill-safe background handling so the browser no longer draws a separate tinted stripe inside the field

**Why:**
- The auth fields should now read as one clean surface instead of a rounded shell with a second browser-colored rectangle inside it.
- This keeps saved-credentials autofill working, but removes the distracting visual artifact.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 109 (Local production chunk mismatch diagnosis)

**Problem investigated:**
- The local production preview on `http://localhost:3002/courses/[id]` failed with a generic client-side exception.
- Browser console showed `ChunkLoadError` and then broader `400 (Bad Request)` failures for multiple `/_next/static/*` assets, not just the course route chunk.
- Hard refresh (`Ctrl` + `Shift` + `R`) did not recover the page.

**What changed:**
- No application code changes.
- Confirmed the current workspace build contains the expected `/courses/[id]` chunk under `apps/web/.next/static/chunks/app/courses/[id]/`.
- Confirmed the running local server on port `3002` was still responding with invalid static-asset responses, which points to a stale or misaligned local `next start` process rather than a course-page rendering bug.

**Why:**
- This failure mode is caused by the local production preview process and its served assets being out of sync, so refreshing the browser alone is not enough.
- The fix path is to restart the local production server against the latest build instead of patching the `/courses/[id]` page.

**Validation:**
- local HTTP checks against `localhost:3002`
- `.next` asset presence review

### Session 107 (Public Features anchors made reliable)

**Problem investigated:**
- The public `Features` links were present in the navbar and page flow, but in practice they were not navigating reliably.
- The most likely cause was relying on App Router `Link` hash navigation for `/#features` style targets, which can feel inconsistent compared to plain anchor behavior in a public marketing page.

**What changed:**
- `apps/web/components/layout/Navbar.tsx`
  - changed hash-target nav items to use native anchor rendering for `/#features`, `/#about`, and `/#faq`
  - kept normal route links on `next/link`
- `apps/web/components/home/features.tsx`
  - added `scroll-mt` offset to the `features` section
- `apps/web/components/home/about.tsx`
  - added `scroll-mt` offset to the `about` section
- `apps/web/components/home/faq.tsx`
  - added `scroll-mt` offset to the `faq` section
- `apps/web/app/how-it-works/page.tsx`
  - changed the return link back to home features to a native anchor as well

**Why:**
- Public section jumps are now handled by regular browser anchor navigation, which is the most predictable behavior for this case.
- The added scroll offset also prevents the section title from landing hidden under the sticky navbar.

**Validation:**
- code-path review only

### Session 108 (Progress promote visibility + timeline font consistency)

**Problem investigated:**
- Promoting an item from `Ideas Backlog` removed it from the backlog immediately, but it was easy to miss where it landed afterward.
- The progress counters updated correctly, which confirmed the item was becoming a real milestone, but the UI did not make that transition obvious enough.
- In the milestone timeline, mixed English + Bulgarian titles still felt visually uneven in some rows.

**What changed:**
- `apps/web/components/progress/use-progress-page-state.ts`
  - after promoting an idea, keeps the item in the milestone flow by switching restricted timeline filters back to `active`
  - stores the promoted milestone id so the timeline can reveal it
- `apps/web/components/progress/progress-page-client.tsx`
  - passes the revealed milestone id into the timeline
  - uses explicit `font-rubik` on the page shell
- `apps/web/components/progress/milestone-timeline.tsx`
  - scrolls the promoted milestone into view
  - auto-expands it
  - adds a temporary highlight so the user can immediately spot it
  - switches the milestone row title to explicit `font-rubik`
- `apps/web/components/progress/ideas-backlog.tsx`
- `apps/web/components/progress/due-soon-list.tsx`
- `apps/web/components/progress/upcoming-events-panel.tsx`
- `apps/web/components/progress/progress-bar.tsx`
- `apps/web/components/progress/progress-summary-cards.tsx`
  - aligned visible progress typography to explicit `font-rubik` for more predictable mixed-language rendering

**Why:**
- Promoted ideas now behave more like a visible move, not like a disappearance.
- Progress percentages still update because the item really does become part of the milestone set.
- The progress screen now relies on the Cyrillic-safe app sans font more explicitly in the places where the mixed-language mismatch was most noticeable.

### Session 106 (Home CTA de-duplication + new How It Works page)

**Problem investigated:**
- The public home page had overlapping "Features" navigation signals:
  - navbar `Features`
  - hero secondary CTA `Explore Features`
- In practice that made the public navigation feel duplicated, and the current secondary CTA did not have a distinct destination like the old v1 `how-it-works` page.
- I also confirmed the home anchor setup was incomplete:
  - `Features` and `FAQ` links existed in the navbar
  - but the corresponding public sections did not both expose matching ids for reliable hash navigation

**What changed:**
- `apps/web/app/how-it-works/page.tsx`
  - added a new public `How It Works` page
  - kept it lightweight and server-rendered
  - reused the public shell and brand language without introducing new heavy client-side effects
- `apps/web/components/home/hero-content.tsx`
  - changed the secondary hero CTA from `Explore Features` to `See How It Works`
  - pointed it to `/how-it-works` instead of duplicating the home features anchor
- `apps/web/components/layout/Navbar.tsx`
  - changed section links to absolute home anchors (`/#features`, `/#about`, `/#faq`)
  - added a dedicated `How It Works` nav item on desktop and mobile
- `apps/web/components/home/features.tsx`
  - added `id="features"`
- `apps/web/components/home/faq.tsx`
  - added `id="faq"`

**Why:**
- `Features` now stays what it should be: a home section.
- The hero secondary CTA now has a separate job: explain the product flow in a calmer, more narrative public page.
- This matches the stronger v1 information architecture more closely without copying the old implementation.
- Absolute home anchors also prevent broken in-page links once the public nav is reused from another route.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 110 (Progress timeline interactivity pass)

**Problem investigated:**
- The milestone timeline already had the right data and filtering behavior, but the interaction still felt flatter than the rest of the polished pre-Admin app.
- Expanding items, reordering, and spotting newly added milestones worked functionally, yet the visual feedback was still too quiet for a page that is meant to feel active and motivating.

**What changed:**
- `apps/web/components/progress/milestone-timeline.tsx`
  - split the timeline row rendering into a dedicated item component so the file stays within the project size guardrails
  - kept the existing server-first/client-shell data flow untouched
  - reused the reveal flow with reduced-motion-aware scrolling/highlight timing
- `apps/web/components/progress/milestone-timeline-item.tsx`
  - rebuilt each row as a motion-driven card with hover lift, layout animation, richer glass surface styling, and a clearer step header
  - added animated expand/collapse transitions for milestone details
  - added a rotating chevron, stronger status marker treatment, and more polished action pills for move/edit/delete
  - kept the status-dot click interaction, but made the reveal state much more noticeable with a temporary pulse
- `apps/web/components/progress/milestone-timeline-item-helpers.tsx`
  - extracted the item styling/config/date-preview helpers so the row component stays smaller and easier to maintain
- `apps/web/components/progress/use-progress-page-state.ts`
  - after creating a new milestone, now reveals it in the timeline and resets restrictive filters back to `active` when needed so the new item does not feel lost

**Why:**
- The timeline now feels more alive through interaction-driven motion instead of always-running animation loops.
- Reordering and expanding milestones should feel clearer because the list now animates its layout and detail panels directly where the user is working.
- Newly created milestones now get the same "you can immediately spot where it went" treatment that we already added for promoted ideas.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`
- `npm.cmd --workspace @studyhub/web run build`
- Build still shows the existing `jose` Edge Runtime warning from `lib/jwt.ts`; no new warning was introduced by this timeline pass.

### Session 111 (Home Features heading layout/clipping fix)

**Problem investigated:**
- In the public `Features` section, the small eyebrow label and the main handwritten title could end up sitting on the same row.
- The larger handwritten heading also looked slightly clipped at the bottom in local preview.

**What changed:**
- `apps/web/components/home/features.tsx`
  - changed the `Features` eyebrow from `inline-block` to `block`
  - forced the section heading to render as a block-level title with a centered max width
- `apps/web/app/globals.css`
  - added safer `line-height` and bottom padding to `.home-display-title`
  - this gives the handwritten title a little more breathing room so the glyph bottoms do not get visually cut off

**Why:**
- The section hierarchy is clearer again:
  - `Features` on its own line
  - the main heading on the next line
- The title now has enough vertical room for the script font to render cleanly.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 118 (Course / module / material UX hierarchy audit)

**Problem investigated:**
- The current pre-Admin web flow feels harder to read at a glance than v1, even though the underlying data hierarchy is still `course -> module -> material`.
- The main question was whether v2 still follows the old structure logically, or whether the hierarchy became less obvious during the redesign.

**What was reviewed:**
- v2 current flow
  - `apps/web/components/course/course-workspace-header.tsx`
  - `apps/web/components/course/module-section.tsx`
  - `apps/web/components/modules/module-workspace-header.tsx`
  - `apps/web/components/modules/module-sidebar.tsx`
  - `apps/web/components/course/material-row.tsx`
  - `apps/web/components/materials/material-page-client.tsx`
- v1 reference flow
  - `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\src\pages\courses\coursesRenderer.js`
  - `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\src\modules.html`
  - `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\src\pages\modules\modules.js`
  - `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\src\materials.html`
  - `C:\Users\mariy\Projects\Visual-Studio-Capstone-Project-StudyHub-interface-v3\src\pages\materials\materialsRenderer.js`

**Findings:**
- The core hierarchy is still correct in v2:
  - dashboard lists courses
  - a course page manages modules
  - a module page manages materials
  - a material page shows one saved material
- v1 exposed that hierarchy more bluntly and therefore more clearly:
  - course cards opened a dedicated modules page
  - the modules page showed `Back to Courses`, the course title, and an explicit `Add Module`
  - each module row had a direct `View Materials` action
  - the materials page showed `Back to Modules`, a course badge, the current module title, and an explicit `Add Material`
- v2 keeps the data structure, but weakens the information architecture in a few places:
  - module cards on the course page rely on an icon-only `View materials` affordance
  - module pages sometimes use `study items` instead of `materials`
  - the material page header leads with `Review and edit` instead of the material title itself
  - opening a material moves the user into a more isolated detail page, while v1 kept the material list as the main workspace and used a separate edit page only as a secondary step

**Why this matters:**
- The issue is not the database or route nesting.
- The issue is that page identity and "where am I in the hierarchy?" are currently less explicit than in v1.
- This makes the product feel prettier, but a little less self-explanatory during normal authoring.

**Recommended next polish pass:**
- add stronger breadcrumb-style hierarchy across course, module, and material screens
- standardize terminology around `course`, `module`, and `material` instead of mixing in `study item`
- make the material page header identify the current material immediately, not just the edit state
- consider making the jump from module to material feel less like leaving the workspace

**Validation:**
- no build run for this audit pass by request

### Session 119 (Hierarchy / wayfinding pass across course, module, and material pages)

**Problem investigated:**
- The course -> module -> material structure was technically intact, but the UI still did not explain that hierarchy clearly enough during normal authoring.
- The biggest friction points were weak page-to-page wayfinding, mixed terminology, and the material page leading with an edit-state headline instead of the material itself.

**What changed:**
- `apps/web/components/ui/wayfinding-breadcrumbs.tsx`
  - added a shared breadcrumb component for the authenticated workspace flow
  - kept it lightweight and presentational so it can be reused without changing the existing server-first page structure
- `apps/web/components/course/course-workspace-header.tsx`
  - replaced the isolated back link with breadcrumb-based wayfinding from `Dashboard`
  - clarified the course workspace description so it explicitly says this is where modules are created before opening one to manage materials
  - renamed the primary CTA from `New module` to `Add module`
- `apps/web/components/course/module-section.tsx`
  - replaced the icon-only module-open affordance with an explicit `Open module` action
  - kept the edit / move / delete controls intact around it
- `apps/web/components/course/module-list.tsx`
  - updated the empty-state copy to connect modules directly to the next step of adding materials
- `apps/web/components/modules/module-workspace-header.tsx`
  - added breadcrumb wayfinding from `Dashboard` -> course -> current module
  - standardized `study item(s)` to `material(s)`
  - updated the search placeholder and helper copy so the page reads as a materials workspace, not a vague mixed-content area
- `apps/web/components/modules/module-workspace-client-page.tsx`
  - updated the empty-state copy so it points to adding the first material, not a generic study item
- `apps/web/components/modules/module-sidebar.tsx`
  - renamed the back action to `Back to course overview`
  - added a short helper line explaining that the sidebar is for switching the current module workspace
- `apps/web/components/course/material-row.tsx`
  - renamed the quick-edit affordance to `Edit material` for clearer intent
- `apps/web/components/materials/material-page-client.tsx`
  - added full breadcrumb wayfinding from `Dashboard` -> course -> module -> current material
  - changed the hero to lead with the material title itself instead of `Review and edit`
  - added clearer context copy for both view and edit states
  - changed the primary return CTA to `Back to module materials`
  - surfaced material-type and editing-state badges in the page header
- `apps/web/components/materials/material-view-panel.tsx`
  - reduced the repeated giant title treatment inside the detail panel
  - relabeled the action buttons to `Edit material` and `Delete material`
  - clarified the empty-note state so it references the current material directly

**Why:**
- The hierarchy should now be readable even if someone lands directly on a deeper page.
- The flow now says more clearly:
  - this is the course
  - these are its modules
  - this module contains materials
  - this screen is one specific material
- This keeps the stronger server-first architecture from the recent performance pass, but makes the navigation logic much easier to understand during demos and manual use.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`
- `npm.cmd --workspace @studyhub/web run build`

### Session 120 (Course module number badge interaction restored)

**Problem investigated:**
- In v1, the numbered module badge had a small but memorable hover interaction.
- In the current course module cards, the card itself already lifted on hover, but the numbered badge stayed comparatively static and lost some of that playful v1 feel.

**What changed:**
- `apps/web/components/course/module-section.tsx`
  - rebuilt the numbered module badge into a small layered surface
  - added a soft glow halo behind it on card hover
  - restored the v1-inspired badge reaction on hover:
    - gradient color shift
    - white text state
    - slight scale-up
    - slight negative rotation
    - stronger floating shadow

**Why:**
- The badge now feels like an active part of the card instead of a passive label.
- This brings back a bit of the playful visual response from v1 without adding heavy or always-running animation.
- The interaction stays tied to hover only, so it remains lightweight for the current performance-sensitive pre-Admin scope.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 121 (Dashboard draft status clarified)

**Problem investigated:**
- The `Draft` label on dashboard course cards looked like a floating chip without enough context.
- It was technically correct because new courses currently start with `courses.status = "draft"`, but the UI did not explain that this was the course state.

**What changed:**
- `apps/web/components/dashboard/course-card.tsx`
  - changed the card status wording from plain `Draft` / `Published` to `Draft course` / `Published course`
  - moved the status closer to the course title instead of leaving it as a detached top-right badge
  - added short helper text so the status reads like a course state, not like a random type/tag pill
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - renamed the stat from `Drafts` to `Draft Courses`
- `apps/web/components/dashboard/course-filters.tsx`
  - renamed the filter options to `All course states`, `Draft courses`, and `Published courses`
- `apps/web/components/dashboard/create-course-form.tsx`
  - added a small note that new courses start as draft courses

**Why:**
- The dashboard now explains what `draft` refers to:
  - it is the state of the course
  - not a material type
  - not a random decorative pill
- This makes the course cards easier to understand during demos and manual testing, especially while the publish flow is still lightweight.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 122 (Draft course pill removed from dashboard cards)

**Problem investigated:**
- Even after clarifying the `draft` wording, the draft course pill still added unnecessary noise on dashboard course cards.
- Since `draft` is the default course state right now, the badge was still drawing attention to something that does not need to be front-and-center on every card.

**What changed:**
- `apps/web/components/dashboard/course-card.tsx`
  - stopped rendering the status pill/helper block for `draft` courses
  - kept the status UI available for non-draft states such as `published`

**Why:**
- Draft is currently the normal baseline state for new courses, so it should not compete with the title and primary actions.
- This makes the card calmer and removes one more piece of visual ambiguity from the dashboard.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`

### Session 123 (Dashboard / module / material destination clarity pass)

**Problem investigated:**
- After the hierarchy / wayfinding pass, the page identity was clearer, but some transitions still relied too much on implied click targets.
- The biggest remaining friction points were:
  - dashboard course cards still had no explicit `Open course` action
  - module cards explained the hierarchy better, but not always the next step inside the module
  - material rows still depended too much on whole-card click behavior instead of an obvious `Open material` affordance
- The goal was to reduce user-facing hesitation without changing the server-first/auth/navbar architecture.

**What changed:**
- `apps/web/components/dashboard/dashboard-hero.tsx`
  - added short hierarchy helper copy explaining `course -> module -> material`
  - renamed the primary CTA to `+ Create Course`
- `apps/web/components/dashboard/create-course-form.tsx`
  - replaced the abstract intro copy with direct hierarchy guidance
- `apps/web/components/dashboard/course-card.tsx`
  - added an explicit `Open course` primary action
  - added clearer helper copy about managing modules and materials
  - renamed the secondary actions to `Edit course` / `Delete course`
- `apps/web/components/dashboard/dashboard-client-page.tsx`
  - clarified the dashboard empty-state filter message
- `apps/web/components/course/module-list.tsx`
  - added a section intro explaining that each module opens its own materials workspace
- `apps/web/components/course/module-section.tsx`
  - added helper copy clarifying what opening a module lets the user do
  - made the edit action label more specific for accessibility
- `apps/web/components/modules/module-sidebar.tsx`
  - clarified that the sidebar switches the current module workspace
- `apps/web/components/modules/module-material-composer.tsx`
  - clarified that each saved entry becomes one material inside the current module
- `apps/web/components/modules/module-pinned-sidebar.tsx`
  - renamed the panel to `Pinned materials`
  - clarified the empty-state copy
- `apps/web/components/course/material-row.tsx`
  - added an explicit `Open material` primary action
  - clarified source-link labels and the no-preview fallback copy

**Why:**
- The hierarchy is now not only named more clearly, but also acted on more explicitly through visible buttons and helper copy.
- This should lower the amount of guesswork for demo users and first-time users:
  - where to click next
  - what page opens next
  - what lives inside a course, module, or material

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`
- `npm.cmd --workspace @studyhub/web run build`

### Session 124 (Review checkpoint follow-up: profile/material clarity + backlog alignment)

**Problem investigated:**
- After the first review-checkpoint pass, the main hierarchy flow was clearer, but a few places still used softer or more abstract language than the rest of the authenticated workspace.
- The remaining small friction points were:
  - Profile still lacked the same breadcrumb-style wayfinding used on course/module/material pages
  - some profile labels leaned more decorative than practical
  - the material detail page still used a generic `Open source` label while material rows already used more specific file/link wording
  - the material detail badges could be slightly more explicit

**What changed:**
- `apps/web/components/profile/profile-page-header.tsx`
  - added breadcrumb wayfinding from `Dashboard` to `Profile`
  - clarified the header description so the page reads more directly as account settings
- `apps/web/components/profile/profile-hero-card.tsx`
  - renamed the hero label from `Workspace identity` to `Account overview`
  - clarified the avatar note to say direct uploads are still pending, while external image URLs work now
- `apps/web/components/materials/material-page-client.tsx`
  - changed `Editing now` to `Editing material`
  - changed `Quick access` to `Pinned to quick access`
- `apps/web/components/materials/material-view-panel.tsx`
  - aligned the external-link action label with the clearer material-row wording:
    - `Open file URL`
    - `Open saved link`

**Checkpoint notes:**
- Confirmed `How It Works` already exists at `/how-it-works`
- Confirmed a dedicated `Contact` page is still missing
- Confirmed Google sign-in is still a planned placeholder in the auth UI, not yet wired end-to-end
- Admin remains the next large implementation/polish block once the pre-Admin user flow feels finished

**Why:**
- These changes make the authenticated flow feel more internally consistent:
  - the same breadcrumb logic now reaches the profile page too
  - labels explain user actions more concretely
  - material link/file actions no longer use a vague catch-all term

**Validation:**
- `npm.cmd --workspace @studyhub/web run build`

### Session 125 (Google Sign-In Integration)

**Goal:**
- Implement Google Sign-In as promised in the `implementation-plan.md`.

**What changed:**
- `drizzle/schema.ts`
  - Added `oauthAccounts` table for storing external identities, linked to `users`.
- `apps/web/lib/google.ts`
  - Added `verifyGoogleIdToken` helper using `google-auth-library`.
- `apps/web/app/api/auth/google/route.ts`
  - Added complete OAuth verification and account matching/creation flow. New Google users get a secure, generated 32-byte bcrypt-hashed placeholder password to satisfy existing schema constraints.
- `apps/web/components/providers.tsx`
  - Wrapped Next.js app in `<GoogleOAuthProvider>` to enable the GIS components.
- `apps/web/components/auth/auth-google-sign-in.tsx`
  - Implemented the actual `<GoogleLogin>` component mapping responses to our `/api/auth/google` API.
- `<LoginFormActions>` and `<RegisterForm>`
  - Hooked the actual component in place of the placeholder.

**Why:**
- By creating the `oauth_accounts` table, the platform now flawlessly supports users registering with Google directly, linking their existing email accounts, or mixing standard and OAuth authentication smoothly, laying the exact generic groundwork the Expo mobile app will need next.

**Validation:**
- `npm.cmd --workspace @studyhub/web run typecheck`
- DB pushing and Google Sign-in complete e2e.

### Session 126 (Navigation polish, slug URLs, UI cleanup)

**Goal:**
- Make it crystal clear where the user is in the hierarchy (courses → modules → materials).
- Make browser tab titles and URL addresses self-descriptive instead of just numeric IDs.
- Remove all draft-style explanatory text that was leaked from development into production UI.

**URL Structure — Slug URLs implemented:**
- Created `apps/web/lib/slugify.ts` — utility that transforms titles into URL-safe strings.
- Restructured routing to use optional catch-all segments (`[[...slug]]`):
  - `apps/web/app/courses/[id]/[[...slug]]/page.tsx`
  - `apps/web/app/modules/[id]/[[...slug]]/page.tsx`
  - `apps/web/app/materials/[id]/[[...slug]]/page.tsx`
- Old `[id]/page.tsx` files deleted (replaced by the new slug-aware ones).
- All navigation links throughout the app now append a slug:
  - `/courses/4/capstone-terminology-and-issues`
  - `/modules/1/terminology`
  - `/materials/9/linting`
- The slug is decorative — the server only uses the numeric ID.
- Updated link generation in:
  - `course-card.tsx`, `module-section.tsx`, `module-sidebar.tsx`
  - `material-row.tsx`, `pinned-material-item.tsx`, `module-pinned-sidebar.tsx`
  - `module-workspace-header.tsx`, `material-page-client.tsx`

**Browser tab titles — full breadcrumb path:**
- `generateMetadata` in each route page now builds a path matching the breadcrumbs:
  - Course page: `Full-Stack Apps with AI — StudyHub`
  - Module page: `TypeScript Basics › Full-Stack Apps with AI — StudyHub`
  - Material page: `Video link › TypeScript Basics › Full-Stack Apps with AI — StudyHub`

**UI Cleanup — removed draft/redundant elements:**
- Removed duplicate sub-header navigation from course and module workspace headers:
  - `COURSE: ... / MODULE WORKSPACE` row deleted from `module-workspace-header.tsx`
  - `Course Workspace / Modules` row deleted from `course-workspace-header.tsx`
  - Breadcrumbs already provide this information.
- Removed `materialCount / pinnedCount` display from `module-workspace-header.tsx`.
- Removed `moduleCount` display from `course-workspace-header.tsx`.
- Removed `Draft Courses` stat pill from `dashboard-hero.tsx` (kept Courses + Pinned Materials).
- Removed `"Open this course to manage its modules and materials."` from `course-card.tsx`.
- Cleaned up unused props (`draftCount`, `materialCount`, `pinnedCount`, `moduleCount`) from component interfaces and their callers.

**Files touched:**
- `apps/web/lib/slugify.ts` [NEW]
- `apps/web/app/courses/[id]/[[...slug]]/page.tsx` [NEW]
- `apps/web/app/modules/[id]/[[...slug]]/page.tsx` [NEW]
- `apps/web/app/materials/[id]/[[...slug]]/page.tsx` [NEW]
- `apps/web/app/courses/[id]/page.tsx` [DELETED]
- `apps/web/app/modules/[id]/page.tsx` [DELETED]
- `apps/web/app/materials/[id]/page.tsx` [DELETED]
- `apps/web/components/dashboard/dashboard-hero.tsx`
- `apps/web/components/dashboard/dashboard-client-page.tsx`
- `apps/web/components/dashboard/course-card.tsx`
- `apps/web/components/dashboard/pinned-material-item.tsx`
- `apps/web/components/course/course-workspace-header.tsx`
- `apps/web/components/course/course-details-client-page.tsx`
- `apps/web/components/course/module-section.tsx`
- `apps/web/components/course/material-row.tsx`
- `apps/web/components/modules/module-workspace-header.tsx`
- `apps/web/components/modules/module-workspace-client-page.tsx`
- `apps/web/components/modules/module-sidebar.tsx`
- `apps/web/components/modules/module-pinned-sidebar.tsx`
- `apps/web/components/materials/material-page-client.tsx`

**Validation:**
- All changes are straightforward prop removal and string interpolation — no logic changes.
- TypeScript check was attempted but tsc hung (environment issue, not code error).

**Next steps for new chat:**
- Run `npm run typecheck:web` and `npm run build:web` to confirm clean compilation.
- Check remaining `confirm()` calls in admin panel and migrate to `ConfirmModal`.
- Continue with admin panel polish.
- "Shared with Me" feature implementation.
- Avatar storage (Cloudflare R2).
- Contact page (still missing from nav).
- Mobile: test updated navigation on Expo.

### Session 127 (Build verification + admin confirm modal cleanup)

**Goal:**
- Verify that the slug URL refactor still compiles cleanly.
- Replace the last remaining native `confirm()` dialogs in the admin panel.
- Sanity-check the `Contact` page handoff note.

**What changed:**
- Verified the `Contact` page already exists and is wired in the app:
  - route: `apps/web/app/contact/page.tsx`
  - nav links: `apps/web/components/layout/Navbar.tsx`
- Found the Session 126 typecheck failure cause:
  - stale generated `.next/types` files were still referencing deleted `[id]/page.tsx` routes after the slug migration
  - cleaned `apps/web/.next` and `apps/web/tsconfig.tsbuildinfo`, then reran validation successfully
- Migrated the last admin destructive flows away from browser `confirm()`:
  - `apps/web/components/admin/users-tab.tsx`
  - `apps/web/components/admin/materials-tab.tsx`
  - both tabs now open `ConfirmModal` and keep delete-busy state in React instead of using blocking browser dialogs
  - delete failures now use the shared `readErrorMessage(...)` helper for cleaner fallback messaging

**Validation:**
- `npm.cmd run typecheck:web` PASS
- `npm.cmd run build:web` PASS
  - `/contact` is present in the production route output
  - unchanged warning remains from `jose` + Edge runtime (`CompressionStream` / `DecompressionStream`) in `lib/jwt.ts`

**Current follow-up:**
- `/how-it-works` should be the next page-sized follow-up in a new chat
- For `/how-it-works`, animations should stop when sections are not visible and should avoid unnecessary looping behavior
- Keep `/how-it-works` modular: split components early and avoid a monolithic page implementation
- Continue with broader admin panel polish (tabs, cards, moderation feedback, empty states)
- "Shared with Me" remains the next large parity feature
- Avatar storage / R2 demo hardening still remains
- Mobile should still be retested against the new slug URLs

### Session 128 (Priority reset recorded for next chat)

**Goal:**
- Record the new implementation order for the next chat so the handoff is unambiguous.

**What changed:**
- Updated the active `implementation-plan.md` follow-up ordering so the AI chatbot parity pass from v1 is the next recorded priority.
- Kept the admin panel adaptation pass immediately after it, instead of as the first follow-up.

**Current priority order:**
- First: AI chatbot parity pass from v1
- Second: Admin panel polish

**Validation:**
- Docs-only update; no code changes or build step needed.

### Session 129 (Contact access restored on home page)

**Goal:**
- Restore a clearer `Contact` entry point on the public home page, not only in the navbar.

**What changed:**
- `apps/web/components/home/cta-banner.tsx`
  - kept the primary `Create Free Account` action
  - added a secondary `Contact Us` CTA button that links to `/contact`
- `apps/web/app/page.tsx`
  - added a `Contact` link in the footer link cluster next to `Login` and `Register`

**Why:**
- `Contact` was already available in the navbar, but the lower-page access pattern from the older public-site flow was missing.
- This restores a more obvious bottom-of-page route into the contact screen for visitors who scroll through the landing page first.

**Validation:**
- `npm.cmd run build:web` PASS
- `npm.cmd run typecheck:web` PASS
  - note: when run before `next build`, typecheck can fail if `.next/types` has not been regenerated yet

### Session 130 (Handoff reprioritized for How It Works)

**Goal:**
- Record that the next large page task should be `/how-it-works`, not the AI chatbot pass.

**What changed:**
- Updated the active handoff order so `/how-it-works` becomes the next page-sized follow-up.
- Moved the AI chatbot parity pass from v1 later in the queue, after the core page work is ready.
- Added explicit implementation reminders for the future `/how-it-works` pass:
  - animations should stop when not visible
  - avoid unnecessary infinite loops
  - keep the implementation modular and split into dedicated components early

**Current priority note for next chat:**
- First: `/how-it-works`
- AI chatbot stays for later, after the pages are ready

**Validation:**
- Docs-only update; no code changes or build step needed.

### Session 131 (How It Works page rebuilt with visibility-gated motion)

**Goal:**
- Replace the monolithic `/how-it-works` page with a modular public-page implementation that follows the animation guardrails.

**What changed:**
- `apps/web/app/how-it-works/page.tsx`
  - now exports route metadata and delegates to a dedicated page shell
- Added a new `apps/web/components/how-it-works/` module set:
  - `content.ts`
  - `how-it-works-page.tsx`
  - `how-it-works-hero.tsx`
  - `how-it-works-flow-preview.tsx`
  - `how-it-works-steps.tsx`
  - `how-it-works-structure-map.tsx`
  - `how-it-works-highlights.tsx`
  - `how-it-works-cta.tsx`
- Replaced the old single-file page with split server/client components and kept every new file under the project size limit.
- Added two visibility-gated motion areas:
  - the hero flow preview only cycles while visible
  - the structure-map highlight only cycles while visible
- Used `useVisibleAnimation` plus reduced-motion-aware loops instead of always-running background animation.
- Kept public routing intact and preserved `Contact` access through the navbar, the home-page lower entry points, and the new lower CTA on `/how-it-works`.

**Why:**
- This keeps the page visually premium without reintroducing noisy off-screen animation or oversized client islands.
- The new structure also makes future public-page polish easier to continue section by section.

**Validation:**
- `npm.cmd --workspace @studyhub/web run build` PASS
- `npm.cmd --workspace @studyhub/web run typecheck` PASS
  - note: the first typecheck failed because `.next/types` was stale/missing until `next build` regenerated them

### Session 132 (How It Works - Parity Polish)

**What we implemented:**
- Further refined the `/how-it-works` page to achieve exact 1:1 visual parity with v1:
  - Repaired the CSS z-index and overflow context of the 3D Hero scene so it doesn't overlap the global navbar on scroll.
  - Aligned 3D scene geometry values to precisely match the legacy `howItWorks-3d.js` ring dimensions and scaling.
  - Expanded background stars to fill the entire hero section, not just the canvas square.
  - Addressed text clipping issues in the 'Shantell Sans' heading.
  - Re-implemented v1 AOS (Animate On Scroll) slide-in animations for timeline items using Framer Motion with matching `ease-out-cubic` equivalents.
  - Restored CSS scroll progress tracking for the connecting timeline stroke.
  - Repaired SVG gradient icons; they are now properly colored and switch to white on hover instead of being transparent/invisible.
  - Fixed tailwind animation configurations (removed invalid `translateX(-50%)` from pulse rings, and substituted non-existent `duration-400` with `duration-500`).
  - Adjusted the Create Course step icon shape to exactly mirror `bi-journal-plus` instead of relying on `clipboard-plus-fill` which looked like a battery.

**Validation:**
- Micro-reactions and animations visually confirmed to perfectly match the original StudyHub presentation layout.

### Session 133 (Contact Page — Tailwind-Only Compliance)

**Why:**
- The Contact page violated the project rule "Tailwind only, no inline styles" from `AGENTS.md`.
- Three components had `style={{...}}` blocks with gradients, blur filters, and CSS animations.

**What we fixed:**

| File | Violation | Fix |
|---|---|---|
| `app/contact/page.tsx` | `style={{ background, backgroundSize, animation }}` | Replaced with `.contact-bg` CSS class |
| `components/contact/contact-aurora.tsx` | 3× `style={{}}` (dimensions, radial-gradient, blur, animation) | Replaced with Tailwind arbitrary values + `.aurora-1/2/3` CSS classes |
| `components/contact/contact-form.tsx` | `style={{ background, backdropFilter }}` | Replaced with `bg-white/[0.06] backdrop-blur-[20px]` |

- Added `.contact-bg`, `.aurora-1`, `.aurora-2`, `.aurora-3` CSS classes to `app/globals.css`.
- The `cosmic-gradient` and `aurora-drift-1/2/3` keyframes already existed in `globals.css` — only the class wrappers were missing.
- Visual output is identical; only the implementation now complies with the project rules.

**Files touched:**
- `apps/web/app/contact/page.tsx`
- `apps/web/components/contact/contact-aurora.tsx`
- `apps/web/components/contact/contact-form.tsx`
- `apps/web/app/globals.css`

### Session 134 (Login copy cleanup + Google button polish)

**Goal:**
- Remove the extra helper sentence under `Welcome Back` on the login screen.
- Make the Google login button read in English and feel a bit more polished.

**What changed:**
- `apps/web/components/auth/login-form-header.tsx`
  - removed the `Please enter your details to sign in.` paragraph under the main heading
- `apps/web/components/auth/auth-google-sign-in.tsx`
  - added a small `variant` prop so the login screen can use a dedicated presentation without changing register
  - forced the Google button locale to English with `locale="en"`
  - switched the login CTA text to the sign-in version instead of the broader continue label
  - added a cleaner framed container plus a rectangular filled style for the login-only variant
- `apps/web/components/auth/login-form-actions.tsx`
  - wired the login screen to the new Google button variant

**Why:**
- The login header now feels cleaner and less repetitive.
- The Google CTA is more explicit for returning users and no longer depends on browser locale for English copy.

### Session 135 (Login Google button theme correction)

**Goal:**
- Remove the black Google sign-in button style on the login screen.

**What changed:**
- `apps/web/components/auth/auth-google-sign-in.tsx`
  - changed the Google button theme back to `outline`, so the login variant is no longer rendered as a black CTA

**Why:**
- The previous `filled_black` choice made the Google button feel too heavy against the auth card.
- `outline` keeps the English label and cleaner shape changes, but fits the existing login UI much better.

### Session 136 (Login badge removal)

**Goal:**
- Remove the `Study smarter` badge above `Welcome Back` on the login screen.

**What changed:**
- `apps/web/components/auth/login-form-header.tsx`
  - removed the top eyebrow badge from the login header
  - tightened the heading spacing so the layout still feels balanced without it

**Why:**
- The login screen reads cleaner with just the main heading and account prompt.

### Session 137 (Login heading color polish)

**Goal:**
- Remove the flat black look from the `Welcome Back` heading on the login screen.

**What changed:**
- `apps/web/components/auth/login-form-header.tsx`
  - replaced the plain dark text color with a brand-aligned gradient text treatment
  - kept dark-mode readability with a softer light-to-cyan gradient instead of pure white

**Why:**
- The old solid black heading felt too basic against the glassy auth card.
- The new treatment keeps the screen more premium and visually connected to the StudyHub palette.

### Session 138 (Auth mascot sparkle effect restored)

**Goal:**
- Bring back the playful sparkle feel around the login mascot speech bubble from v1.

**What changed:**
- `apps/web/components/auth/auth-mascot.tsx`
  - rebuilt the speech-bubble decoration into explicit sparkle elements instead of a single inline character
  - added two animated sparkle icons around the bubble to match the old visual cue more closely
  - kept the rest of the mascot block lightweight and unchanged
- `apps/web/app/globals.css`
  - added `authSparkle` keyframes for the new twinkle motion

**Why:**
- In v1 the visible "iskri" around the bubble were part of the auth mascot personality.
- Restoring them brings back the charm from the old login without reintroducing a heavier particle canvas.

### Session 139 (Login helper note removed)

**Goal:**
- Remove the leftover implementation-note text from the login screen.

**What changed:**
- `apps/web/components/auth/login-form-actions.tsx`
  - removed the dashed helper box under Google sign-in about password reset parity and JWT flow stability

**Why:**
- The message reads like internal development commentary instead of user-facing UI copy.
- The login screen is cleaner and more production-ready without it.

### Session 140 (Safe refactor pass for home cards and progress state)

**Goal:**
- Clean up the most worthwhile inline-style hotspots without chasing zero inline styles everywhere.
- Split the oversized progress page state hook into smaller focused modules.
- Leave the sensitive `hero-3d.tsx` code untouched.

**What changed:**
- `apps/web/components/home/about.tsx`
  - split the section into smaller building blocks
  - moved benefit-card and mascot-card visuals into dedicated components
  - replaced static inline gradients/blob styles with Tailwind arbitrary-value classes
- `apps/web/components/home/about-benefit-card.tsx`
  - rebuilt the spotlight hover effect with React state + Framer Motion instead of direct DOM style mutation
  - kept the floating icon interaction while moving static visual styling into classes
- `apps/web/components/home/about-mascot-card.tsx`
  - rebuilt the mascot-card shine effect with motion-driven state instead of CSS variable writes through `setProperty`
  - kept the existing glossy-card presentation and hover feel
- `apps/web/components/home/glass-card.tsx`
  - replaced avoidable inline backgrounds, shadows, borders, and transforms with Tailwind classes and motion state
  - moved the tilt interaction away from direct `element.style.transform` mutation
- `apps/web/components/progress/use-progress-page-state.ts`
  - reduced the orchestration hook to a smaller composition layer
- `apps/web/components/progress/use-progress-derived-state.ts`
  - extracted milestone filtering, counts, and filter-option derivation
- `apps/web/components/progress/use-progress-request.ts`
  - extracted timeout-aware fetch helpers and progress snapshot loading
- `apps/web/components/progress/use-progress-mutations.ts`
  - extracted add/edit/promote/status/reorder milestone mutations
- `apps/web/components/progress/use-progress-delete-mutation.ts`
  - extracted delete modal state and delete confirmation logic
- `apps/web/components/progress/use-progress-page-state.types.ts`
  - added shared response/state types for the split progress hooks
- `docs/implementation-plan.md`
  - added a planned forgot-password reset task so the auth follow-up does not get lost

**Why:**
- `about.tsx` and `glass-card.tsx` were the most worthwhile cleanup targets because they mixed static styling with inline blocks and direct DOM style writes.
- The progress state hook was well beyond the project line-limit guidance and was carrying too many responsibilities in one file.
- Keeping the rest of the dynamic inline styles in the app avoids unnecessary churn where inline values are still the right tool.

**Verification:**
- `npm.cmd run typecheck:web`

### Session 154 (Favicon dark-mode fill fix)

**Goal:**
- Ensure the favicon stays visible on dark tabs by filling the mascot interior with solid white.

**What changed:**
- `apps/web/public/assets/v1/favicon.png`
  - filled enclosed transparent regions with white to match the filled mascot style
- `apps/web/public/assets/v1/icons/favicon.png`
  - applied the same filled interior to keep the legacy asset in sync

**Why:**
- The previous favicon had transparent interior areas, which disappeared against dark browser chrome.

### Session 154 (Profile password visibility + copy polish)

**Goal:**
- Finish removing leftover developer-style copy from the profile page and make password entry easier during profile updates.

**What changed:**
- `apps/web/components/profile/profile-page-header.tsx`
  - shortened the page intro to a cleaner user-facing summary
- `apps/web/components/profile/profile-details-card.tsx`
  - replaced the remaining edit/status copy with simpler saved-state messaging
- `apps/web/components/profile/profile-security-card.tsx`
  - kept the password section copy concise and user-facing
- `apps/web/components/profile/profile-admin-card.tsx`
  - trimmed the admin description to a straightforward CTA
- `apps/web/lib/profile.ts`
  - rewrote the missing-avatar status text so it explains the current URL-based flow without "planned" wording
- `apps/web/components/profile/profile-field.tsx`
  - added the same show/hide password toggle used on login forms
  - applied it to password fields in the profile security form via the shared field component

**Why:**
- The profile page should read like a finished product, not like internal implementation notes.
- Showing typed passwords on demand reduces mistakes during password changes and matches the login experience.

**Verification:**
- `npm.cmd run typecheck:web`

### Session 141 (Progress roadmap refresh + mobile backlog planning)

**Goal:**
- Refresh the `/progress` planning board so it reflects the real current project state.
- Rework milestone deadlines around the final capstone deadline on `27 May 2026`.
- Add an explicit mobile backlog split into must-have, nice-to-have, and can-wait work.

**What changed:**
- Updated the existing progress milestones in the Neon database for the active planning board:
  - kept completed foundation milestones
  - replaced outdated future items with a cleaner roadmap from April through the final submission window
  - marked current reality more honestly (`done`, `in_progress`, `not_started`, `idea`)
- Added mobile work directly into the progress board:
  - must-have mobile milestones for material details, favorites/quick access, course-details cleanup, and device/auth hardening
  - mobile backlog ideas for offline/cache, push notifications, and camera scan uploads
- Updated deadline events in the same board:
  - deployment target event moved to the late-May delivery window
  - final capstone deadline event aligned to `Graduation: capstone project + final quiz`

**Why:**
- The older progress board still reflected an earlier project plan and several outdated deadlines.
- The project now has a clearer end date and a much better picture of what is already done versus what still matters.
- Mobile work needed to become visible in the same planning space instead of living only in docs or memory.

### Session 142 (Progress board follow-up clarity updates)

**Goal:**
- Refine the refreshed planning board after user review so important backlog items are easier to spot.

**What changed:**
- Restored the mobile backlog idea items in the Neon-backed progress board after a brief over-trim:
  - `Mobile nice-to-have: offline/cache support`
  - `Mobile can-wait: push notifications`
  - `Mobile can-wait: camera scan uploads`
- Renamed the AI item so it reads as an explicit chatbot task:
  - `AI chatbot integration (Gemini / v1 parity)`
- Added explicit release-planning milestones that were previously only implied:
  - `Security hardening + auth/access review`
  - `Testing + smoke regression pass`

**Why:**
- The board should show the full realistic backlog, not hide optional-but-useful items.
- AI, security, and testing need to be visible as named deliverables, not only assumed work streams.

### Session 143 (Legacy DB migration assessment note)

**Goal:**
- Preserve the current thinking about a possible StudyHub v1 → v2 data migration without starting implementation yet.

**What changed:**
- `docs/implementation-plan.md`
  - added a dedicated investigation note for a future legacy-database migration
  - recorded the current conclusion that this would need a custom import/mapping flow, not a direct DB copy
  - captured the main schema mismatches already identified:
    - Supabase auth/profiles/roles (`uuid`) vs current app users (`integer`)
    - old materials model vs current materials model
    - old `is_pinned` vs current `favorites`
    - legacy-only shared/contact/security tables without clean 1:1 targets
  - listed what seems realistically migratable and what would need separate decisions later

**Why:**
- The migration idea may still be useful later, but it is risky enough that the current reasoning should be documented before we forget the tradeoffs.

### Session 144 (README adaptation rationale added)

**Goal:**
- Document clearly in the README why StudyHub v2 adapts the StudyHub v1 business logic instead of switching to a completely different project concept.

**What changed:**
  - `README.md`
  - added a new explanation in `Project Story` covering:
    - the personal practical value of the business logic
    - the goal of making the idea more viable and maintainable
    - the learning value of comparing two very different technology stacks on the same domain
    - the architectural lesson learned from some overly monolithic files in the v1 codebase
    - the fact that v1 already documented a future refactor direction, and v2 is the place where that intention is actively carried out
    - the fact that recognizable UI patterns do not mean code copying
  - expanded the closing notes to state more explicitly that the legacy repo is a reference/comparison baseline, not a source for copied implementation

**Why:**
- The README should explain the adaptation choice as a deliberate product and engineering decision, not leave it open to interpretation.
- This gives a clearer capstone narrative: same domain problem, new architecture, better maintainability, and explicit learning goals.

### Session 145 (README real-use note added)

**Goal:**
- Record more explicitly in the README that StudyHub is already being used in practice during the capstone process.

**What changed:**
- `README.md`
  - added a new point in `Project Story` stating that the app is actively used for:
    - lesson notes
    - planning the capstone development itself
  - this strengthens the argument that the project has real current utility, not only theoretical or future value

**Why:**
- This makes the README more honest and concrete about the project's real role in the workflow.
- It also supports the product narrative: StudyHub is not just being rebuilt as an exercise, but is already being used as a study and planning tool.

### Session 146 (Material page scroll-to-top button)

**Goal:**
- Improve the material detail page UX with a direct way to jump back to the top after long reading or editing sessions.

**What changed:**
- `apps/web/components/materials/material-page-client.tsx`
  - wired in the existing shared `ScrollToTop` floating button on the material detail page
  - the button appears after scrolling and smoothly returns the user to the top of the screen

**Why:**
- Material pages can become long when notes, links, and edit forms grow.
- A dedicated back-to-top control makes navigation faster and more comfortable without introducing new custom UI code.

### Session 147 (Auth password visibility toggle)

**Goal:**
- Make password entry easier on the web login and register screens by letting users verify what they typed before submitting.

**What changed:**
- `apps/web/components/auth/auth-icon-field.tsx`
  - turned the shared auth field into a client component
  - added local password visibility state for `type="password"` inputs
  - added a show/hide toggle button with accessible labels
- `apps/web/components/auth/auth-icons.tsx`
  - added eye and eye-off icons for the new visibility control

**Why:**
- This reduces friction from mistyped passwords during sign-in and account creation.
- Keeping the behavior inside the shared auth field avoids duplicate logic between the login and register forms.

**Verification:**
- `npm.cmd run typecheck:web`
- `npm.cmd run build:web`
- `npm.cmd run lint:web` could not complete because `next lint` is still prompting for initial ESLint setup in this workspace.

### Session 148 (AI tools JSON hardening)

**Goal:**
- Stop `/api/ai/tools` from returning truncated or malformed quiz/flashcard/definition payloads when Gemini cuts off mid-response.

**What changed:**
- `apps/web/lib/gemini.ts`
  - added a shared request helper that supports Gemini JSON mode through `responseMimeType: "application/json"`
  - added `askGeminiJson()` for structured tool responses
  - detect `finishReason === "MAX_TOKENS"` and treat that model response as truncated instead of accepting partial output
  - kept a small JSON normalization fallback so fenced JSON can still be parsed safely if needed
- `apps/web/app/api/ai/tools/route.ts`
  - moved `quiz`, `flashcards`, and `definitions` to structured JSON requests instead of free-form text parsing
  - added per-tool response schemas and runtime validators before data is returned to the UI
  - tightened prompts so quiz explanations and other generated items stay concise
  - replaced the old "return raw text if parsing fails" path with a safe `AI_INVALID_RESPONSE` error for incomplete model output
  - removed the noisy raw/cleaned JSON debug flow that was printing chunks of model output

**Why:**
- The previous flow relied on Gemini obeying a plain-text prompt and then regex-cleaning the response.
- When the model stopped mid-array, the route could end up with broken JSON like the truncated quiz payload from this session.
- Structured JSON mode plus validation makes the API fail safely instead of leaking malformed data into the client.

**Verification:**
- `npm.cmd run typecheck:web`
- `npm.cmd run build:web`

### Session 149 (Dev script correction after invalid Next flag)

**Goal:**
- Restore the web dev script after a failed attempt to force a different local bundler flag.

**What changed:**
- `apps/web/package.json`
  - reverted the web workspace `dev` script back to `next dev`

**Why:**
- In this project setup (`next@15.5.14`), `next dev --webpack` is not a valid CLI option.
- Production build still passes, so the right immediate move was to restore the standard dev command instead of leaving a broken script in place.

**Verification:**
- `npm.cmd run typecheck:web`
- `npm.cmd run build:web`

### Session 150 (Saved AI outputs under materials + auth-route chat hide)

**Goal:**
- Let AI tool results be saved as separate records under a material instead of disappearing on refresh.
- Add an `Insert into note` flow so saved or freshly generated AI content can be appended into the material editor when needed.
- Keep the AI chatbot out of `/login` and `/register`.

**What changed:**
- Database / migrations
  - `drizzle/schema.ts`
    - added new `ai_tool_outputs` table with:
      - `user_id`
      - `material_id`
      - `tool`
      - `data` (`jsonb`)
      - `created_at`
    - added indexes for `(user_id, material_id)` and `(material_id, created_at)`
  - generated Drizzle migration files:
    - `drizzle/migrations/0004_flowery_zombie.sql`
    - `drizzle/migrations/meta/0004_snapshot.json`
    - updated `drizzle/migrations/meta/_journal.json`
- Shared AI output handling
  - `apps/web/lib/ai-tool-outputs.ts`
    - centralized AI tool names, saved-output/result types, validators, labels, preview text, and note-formatting helpers
  - `apps/web/lib/ai-tool-output-data.ts`
    - added material-scoped saved AI output loading and row mapping
  - `apps/web/lib/material-detail-data.ts`
    - material page data now includes saved AI outputs for the current user and material
  - `apps/web/components/materials/types.ts`
    - extended `MaterialPageData` with `aiOutputs`
- Material page + AI tools UI
  - `apps/web/app/api/materials/[id]/ai-outputs/route.ts`
    - added authenticated `GET`/`POST` API for loading and saving AI outputs per material
  - `apps/web/components/materials/ai-tools-panel.tsx`
    - added `Save result`
    - added `Insert into note`
    - renders saved AI outputs below the current result
    - disables new generation when the material has no content, while still showing previously saved AI entries
  - `apps/web/components/materials/ai-tool-result-content.tsx`
    - extracted summary/quiz/flashcard/definition result rendering into a dedicated component
  - `apps/web/components/materials/saved-ai-output-list.tsx`
    - added the saved-results list under the material with expandable entries and `Insert into note`
  - `apps/web/components/materials/material-page-client.tsx`
    - keeps saved AI outputs in page state
    - appends selected AI output into the note editor instead of overwriting the existing note
    - shows a toast reminding the user to save the material after inserting AI content into the editor
- Auth-route chatbot visibility
  - `apps/web/components/chat/chat-route-visibility.tsx`
    - added pathname-based hiding for `/login` and `/register`
  - `apps/web/components/chat/chat-gate.tsx`
    - now routes authenticated chat rendering through the visibility gate instead of mounting the widget directly everywhere

**Why:**
- The AI tool results were previously session-only UI state.
- Saving them as separate DB-backed records keeps them reusable without polluting the main material note.
- `Insert into note` keeps the saved AI output and the main note as two separate concepts: snapshot first, merge into notes only when wanted.
- The chatbot should stay available inside the signed-in app, but it should not appear on the auth screens.

**Verification:**
- `npm.cmd run typecheck:web`
- `npm.cmd run build:web`
  - build passed
  - existing `jose` Edge-runtime warnings are still present and were not introduced by this session
- `npx.cmd drizzle-kit generate`
- attempted `npx.cmd drizzle-kit migrate`
  - migrate stalled again on the Neon websocket path in this environment
  - applied the `ai_tool_outputs` table and indexes directly to the current Neon database via Neon HTTP
  - verified the table exists afterward

**Audit note:**
- Reviewed the current worktree before updating `dev-log`.
- No additional unfinished source-file diffs from other agents were present in `git status` beyond this session's material-AI changes and the generated migration files.

### Session 151 (Progress board milestone refresh after feature review)

**Goal:**
- Sync the `/progress` milestone board with the real current project state after reviewing the latest completed features.

**What changed:**
- Updated the Neon-backed progress milestones for the active planning board (`user_id = 1`):
  - marked Google auth as completed:
    - `Google sign-in (web auth)`
  - replaced the outdated AI-summary-only idea with a completed broader AI-tools milestone:
    - `AI material tools: summary, quiz, flashcards, definitions`
  - moved the chatbot work from backlog idea into the active lane:
    - `AI chatbot integration polish (Gemini)` -> `in_progress`
  - refreshed milestone ordering so the new completed items sit with the completed delivery track and the AI chatbot work sits near the active roadmap instead of inside the ideas backlog

**Why:**
- The progress page is database-backed, so the board had drifted behind the actual app state.
- Google sign-in and the material AI tools are already real features, not future ideas.
- The chatbot also exists already, so it is more honest to track it as active polish work than as untouched backlog.

**Verification:**
- Queried the updated `milestones` rows from Neon after the write and confirmed the refreshed titles, statuses, due dates, and ordering.

### Session 152 (Recovered standalone error-page note into dev log)

**Goal:**
- Preserve the useful history from an old standalone `update-log.js` helper and retire the helper itself.

**What changed:**
- Recorded the previously unlogged custom error-page work in the main session log:
  - `apps/web/app/not-found.tsx`
  - `apps/web/components/not-found/not-found-client.tsx`
  - `apps/web/app/forbidden/page.tsx`
  - `apps/web/components/forbidden/forbidden-client.tsx`
  - premium custom `404` and `403` screens with dark mode, animated mascot treatment, and reduced-motion awareness
- Removed the root-level `update-log.js` helper after confirming it was:
  - not referenced by `package.json`
  - not part of build/dev flows
  - only appending a hard-coded text block into `docs/dev-log.md`

**Why:**
- The custom error pages are worth keeping in the real project history.
- The helper script had become a stale one-off utility and was easy to mistake for an active project script.

**Note:**
- The old helper also mentioned spinner cleanup, but spinner work is already documented elsewhere in `docs/dev-log.md`, so that part was not duplicated here.

### Session 153 (Profile copy cleanup for admin view)

**Goal:**
- Remove developer-facing notes and extra implementation copy from the profile experience, especially the admin-only section.

**What changed:**
- `apps/web/components/profile/profile-admin-card.tsx`
  - simplified the admin card to a short user-facing message plus the admin-panel CTA
  - removed the extra highlight blocks about role checks and logs
- `apps/web/components/profile/profile-hero-card.tsx`
  - removed the avatar-upload status note that read like an implementation update
- `apps/web/components/profile/profile-details-card.tsx`
  - trimmed the profile-details intro copy
  - removed the temporary avatar URL helper note
- `apps/web/components/profile/profile-security-card.tsx`
  - replaced the "Current backend rule" label with a cleaner user-facing password tip

**Why:**
- The profile page should feel finished and user-facing, not like a staging area for development notes.
- Admin users especially do not need extra explanatory boxes when a direct route to the admin panel is already available.

**Verification:**
- `npm.cmd run typecheck:web`

---

### Session 154 (Google Button Beautification + Fix)

**What we implemented:**
- Fixed a critical syntax error in `apps/web/components/auth/auth-google-sign-in.tsx` (duplicate `return` statement).
- Upgraded the Google Sign-In button to a premium "wow" state:
    - **Glassmorphism**: Enhanced `backdrop-blur` and semi-transparent backgrounds with refined borders.
    - **Shine Animation**: Added a CSS-based "sweep" shine effect that triggers on hover.
    - **Hover Glow**: Integrated a radial gradient glow matching the brand's primary purple.
    - **Typography**: Applied `font-shantell` and bold weights for a more premium, friendly feel.
    - **Micro-interactions**: Refined Framer Motion transitions (spring ease, subtle scale/lift).
- Unified the button style across both `/login` and `/register` by using `variant="login"`.
- Improved the `default` variant for future reuse in other parts of the app.

**Verification:**
- `npm.cmd run build` PASS (`apps/web`)
- Manual verification: Button renders correctly on both auth pages with all animations active.

---

## 2026-04-07

### Session 155 (Dev Server Performance Optimisation)

**Problem:**
- The Next.js dev server was compiling pages very slowly and navigation between routes took a long time.

**Root-cause analysis:**
1. **Three.js statically imported** (~600 KB) in `hero-3d-scene.tsx` and `bohemian-particles.tsx` — bundled into the main chunk even for pages that never use 3D.
2. **Zero `next/dynamic` usage** across the entire project — every heavy component (Three.js, ChatWidget) was statically imported.
3. **Rubik font loaded 7 weights** (300–900) but weight 300 (`font-light`) was never used anywhere.
4. **Double JWT verification per request** — both `<Navbar />` and `<ChatGate />` in root layout independently called `getRequestUserOrNull()`, running JWT decode twice on every navigation.

**What changed:**

- `apps/web/components/how-it-works/how-it-works-hero.tsx`
  - Replaced static `import { Hero3dScene }` with `next/dynamic` + `{ ssr: false }` — Three.js is now code-split and only loaded when the how-it-works page is visited.

- `apps/web/components/how-it-works/how-it-works-cta.tsx`
  - Replaced static `import { BohemianParticles }` with `next/dynamic` + `{ ssr: false }` — same treatment for the second Three.js consumer.

- `apps/web/components/chat/chat-route-visibility.tsx`
  - Replaced static `import { ChatWidget }` with `next/dynamic` + `{ ssr: false }` — chat widget JS is no longer included in the initial page bundle.

- `apps/web/app/layout.tsx`
  - Removed Rubik weight `"300"` from the font declaration (6 weights instead of 7).

- `apps/web/lib/server-auth.ts`
  - Wrapped `getRequestUserOrNull` with React `cache()` so that multiple calls within the same server request (Navbar + ChatGate) only run JWT verification once.

**What we investigated but left unchanged:**
- The landing-page `Navbar` (`components/layout/Navbar.tsx`) used by `/` and `/how-it-works` is a separate component from the global auth-aware navbar (`components/navbar.tsx`). The global navbar already hides itself on public routes via `PUBLIC_PATHS` check, so there is no visual duplication.

**Verification:**
- `tsc --noEmit` — PASS, zero errors.

### Session 156 (Mobile UI Polish + Material Screen)

**Какво направихме:**

- **UI polish на всички mobile екрани:**
  - **Login** — purple→indigo gradient фон, fade-in + slide-up анимация на картата, input labels с focus states (purple border + glow), gradient бутон, demo credentials с divider
  - **Courses List** — gradient header с welcome message + role badge + stats ред (courses/published/drafts), purple left accent на картите, staggered fade-in анимации, махнат draft/published badge от картите
  - **Course Details** — gradient hero секция, module номера в кръгчета, material type icons като цветни кръгове (N/L/F/V) вместо emoji, material count badge на модулите, LayoutAnimation за expand/collapse
  - **Global** — StatusBar light style с purple фон, header с тъмно purple + бял текст, loading screen с purple фон

- **Нов екран — Material View (`apps/mobile/app/material/[id].tsx`):**
  - Gradient header с тип badge (Note/Link/File/Video)
  - Пълен текст на материала (без numberOfLines ограничение)
  - Link/File URL бутон с Linking.openURL
  - Tags секция
  - Pull-to-refresh

- **Материалите в Course Details са натискаеми** — при tap навигират към `/material/[id]`

- **Добавен `expo-linear-gradient`** — за gradient фонове на всички екрани

- **Обновен `docs/mobile-phone-testing-handoff.md`** — пренаписан с LAN golden path като препоръчан метод, USB като алтернатива, recovery checklist

**Файлове:**
- `apps/mobile/app/login.tsx` — redesign
- `apps/mobile/app/index.tsx` — redesign
- `apps/mobile/app/course/[id].tsx` — redesign + material navigation
- `apps/mobile/app/material/[id].tsx` — нов екран
- `apps/mobile/app/_layout.tsx` — StatusBar + header config
- `apps/mobile/package.json` — expo-linear-gradient dependency
- `docs/mobile-phone-testing-handoff.md` — пренаписан

**Тествано:**
- `tsc --noEmit` — PASS
- Expo Go на физическо устройство (LAN mode) — всички 4 екрана работят
- Login → Courses List → Course Details → Material View — навигация ✅

### Session 157 (Mobile — нови екрани + CRUD)

**Какво направихме:**

- **Register екран (`apps/mobile/app/register.tsx`):**
  - Gradient фон, 3 полета (name, email, password), fade-in анимация
  - Линк към Login ("Already have an account? Sign In")
  - AuthGate обновен да позволява `/register` без auth

- **Profile екран (`apps/mobile/app/profile.tsx`):**
  - Gradient hero с initials аватар, име, роля
  - Edit name с inline TextInput, Save/Cancel бутони
  - Success/error feedback след запис
  - Pull-to-refresh

- **Create Course екран (`apps/mobile/app/create-course.tsx`):**
  - Title + Description полета, gradient бутон
  - FAB бутон (+) добавен в Courses List за бърз достъп
  - След създаване — автоматично връщане към списъка

- **Add Module екран (`apps/mobile/app/course/[id]/add-module.tsx`):**
  - Title + Description полета
  - Dashed "Add Module" бутон в Course Details

- **Add Material екран (`apps/mobile/app/module/[id]/add-material.tsx`):**
  - Type selector (Note/Link/File/Video) с цветни chips
  - Title, Content (multiline), URL (условно), Tags полета
  - Dashed "Add Material" бутон в expanded module

- **Навигация обновена:**
  - Login ↔ Register линкове
  - Courses List → Profile бутон в header-а
  - Courses List → Create Course (FAB)
  - Course Details → Add Module
  - Module (expanded) → Add Material
  - `register` функция добавена в `auth-context.tsx`

- **Споделени компоненти:**
  - `components/branded-spinner.tsx` — purple кръг с ActivityIndicator + message текст, интегриран в Courses List, Course Details, Material View, Profile
  - `components/empty-state.tsx` — icon в кръг + title + subtitle, интегриран в Courses List и Course Details

- **Структурна промяна:**
  - `app/course/[id].tsx` преместен в `app/course/[id]/index.tsx` за поддръжка на nested routes (`add-module`)

- **Махнат draft/published badge** от course картите в Courses List (по желание на потребителя)

**Файлове (нови):**
- `apps/mobile/app/register.tsx`
- `apps/mobile/app/profile.tsx`
- `apps/mobile/app/create-course.tsx`
- `apps/mobile/app/course/[id]/add-module.tsx`
- `apps/mobile/app/module/[id]/add-material.tsx`
- `apps/mobile/components/branded-spinner.tsx`
- `apps/mobile/components/empty-state.tsx`

**Файлове (променени):**
- `apps/mobile/lib/auth-context.tsx` — добавена `register()` функция
- `apps/mobile/app/login.tsx` — добавен линк към Register
- `apps/mobile/app/_layout.tsx` — AuthGate поддържа register екран
- `apps/mobile/app/index.tsx` — FAB бутон, Profile бутон, BrandedSpinner, EmptyState
- `apps/mobile/app/course/[id]/index.tsx` — Add Module/Material бутони, преместен от `[id].tsx`

**Тествано:**
- `tsc --noEmit` — PASS
- Expo Go на физическо устройство — Create Course работи, курсът се появява в списъка
### Session 158 (Mobile CRUD actions + refresh hardening)

**What we changed:**
- Hardened `apps/mobile/lib/api.ts` so mobile requests no longer assume every response is valid JSON.
- Added focus-driven refresh on the main mobile list/detail flows so returning from create/edit screens reloads current data instead of showing stale state.
- Added shared mobile action UI:
  - `apps/mobile/components/entity-actions.tsx`
- Added edit screens:
  - `apps/mobile/app/course/[id]/edit.tsx`
  - `apps/mobile/app/module/[id]/edit.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
- Added `Edit` / `Delete` actions directly on mobile containers:
  - course cards in `apps/mobile/app/index.tsx`
  - module cards in `apps/mobile/app/course/[id]/index.tsx`
  - material cards in `apps/mobile/app/course/[id]/index.tsx`
- Added delete confirmations for courses, modules, and materials.
- Updated the material details screen to:
  - refresh on focus
  - guard external URL opening with `Linking.canOpenURL`
  - show a safer fallback alert on invalid or broken links

**Why:**
- Mobile create/edit flows were returning to stale parent screens because the parent data only loaded on first mount.
- The user wanted direct editing and deletion from the visible course/module/material containers instead of needing separate indirect flows.
- The API client and external-link handling needed a small resilience pass to avoid fragile runtime behavior.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck`

### Session 159 (Mobile refactor handoff backfill)

**Goal:**
- Preserve the missed planning note from the previous chat before starting the next mobile implementation pass.

**What we aligned on:**
- The current mobile information architecture needs a clearer split:
  - `course/[id]` should stay a cleaner course overview
  - `module/[id]` should become the dedicated workspace for module-level material management
  - `material/[id]` remains the detail/edit destination
- The next highest-value mobile refactor should happen in this order:
  - add a standalone `module/[id]` screen
  - move the material list out of the course screen and into that module screen
  - clean up `apps/mobile/app/course/[id]/index.tsx` so it stops carrying mixed responsibilities
  - continue later with search/filter and favorites

**Why:**
- The current course screen is doing too much at once, which mixes navigation intent and makes the UX feel less app-like.
- A dedicated module route will make the flow more natural on mobile and create a safer base for later CRUD polish, search, favorites, and spacing improvements.

**Implementation note for the next session:**
- Keep the refactor component-first and use it as an opportunity to split the oversized mobile screen files into smaller route-specific pieces.

### Session 160 (Mobile module workspace refactor)

**What we changed:**
- Added a dedicated mobile module workspace route:
  - `apps/mobile/app/module/[id]/index.tsx`
- Moved material-list responsibility out of the course screen:
  - `apps/mobile/app/course/[id]/index.tsx` now focuses on course overview + module navigation
  - tapping a module now opens `/module/[id]`
- Added shared mobile building blocks for the refactor:
  - `apps/mobile/components/module-list-card.tsx`
  - `apps/mobile/components/material-card.tsx`
  - `apps/mobile/lib/studyhub-types.ts`
  - `apps/mobile/lib/material-utils.ts`
- Updated the module workspace flow to include:
  - module header/hero
  - material list
  - `Add Material`
  - `Edit Module`
  - `Delete Module`
  - material-level `Edit` / `Delete`
- Simplified the course screen UX:
  - clearer "Course overview" hero
  - dedicated modules section with cleaner hierarchy
  - per-module card copy that points the user toward the workspace model
- Reused the new shared material helpers in:
  - `apps/mobile/app/material/[id].tsx`
  - tags now use shared parsing instead of route-local duplication

**Why:**
- The old mobile course screen was carrying course overview, module actions, and material workspace responsibilities all at once.
- Splitting course -> module -> material makes navigation clearer, keeps each route more focused, and gives a safer base for the next mobile polish steps.

**Code quality outcome:**
- `apps/mobile/app/course/[id]/index.tsx` dropped below the 300-line guardrail.
- `apps/mobile/app/module/[id]/index.tsx` was added as a focused workspace route instead of growing the course screen further.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck`

### Session 161 (Mobile UX layer — toast, confirm modal, search/filter, bottom tabs)

**What we changed:**

1. **Toast notification system**
   - Added `apps/mobile/lib/toast-context.tsx` — `ToastProvider` with animated slide-in toasts (success / error / info), auto-dismiss after 3 s, tap to dismiss
   - Wired into root layout (`apps/mobile/app/_layout.tsx`)
   - Available everywhere via `useToast().showToast(msg, type?)`

2. **ConfirmModal component**
   - Added `apps/mobile/components/confirm-modal.tsx` — styled modal with loading spinner on the confirm button, destructive variant for delete actions
   - Replaces every `Alert.alert` confirmation across the app

3. **Replaced all `Alert.alert` calls**
   - `apps/mobile/app/(tabs)/index.tsx` — course delete
   - `apps/mobile/app/course/[id]/index.tsx` — course + module delete
   - `apps/mobile/app/module/[id]/index.tsx` — module + material delete
   - `apps/mobile/app/material/[id].tsx` — link open errors
   - `apps/mobile/app/(tabs)/profile.tsx` — profile save feedback
   - Zero `Alert.alert` imports remain in the codebase

4. **Search + type filter in module workspace**
   - Added `apps/mobile/components/search-bar.tsx` — reusable search input with clear button
   - Added `apps/mobile/components/type-filter-chips.tsx` — horizontal scroll chips (All / Note / Link / File / Video)
   - Integrated in `apps/mobile/app/module/[id]/index.tsx`:
     - filters by title, content, and tags
     - filters by material type
     - shows "No matches" empty state when filters produce zero results
     - search + chips only appear when there are materials to filter

5. **Bottom tab navigation**
   - Created `apps/mobile/app/(tabs)/_layout.tsx` with Courses + Profile tabs
   - Moved `index.tsx` → `(tabs)/index.tsx`, `profile.tsx` → `(tabs)/profile.tsx`
   - Updated root `_layout.tsx` to register `(tabs)` as a headerless stack screen
   - Removed the old Profile button from the courses header (tabs handle it now)
   - Profile screen now uses toast instead of inline `saveMsg` banner

**Why:**
- `Alert.alert` is a native dialog that feels out of place in a branded app — the new toast and confirm modal match the StudyHub visual language and give loading feedback during async deletes.
- Search + filter is the single most useful feature for a module workspace with many materials.
- Bottom tabs make the app feel "app-like" instead of relying on header buttons for primary navigation.

**New files (5):**
- `apps/mobile/lib/toast-context.tsx`
- `apps/mobile/components/confirm-modal.tsx`
- `apps/mobile/components/search-bar.tsx`
- `apps/mobile/components/type-filter-chips.tsx`
- `apps/mobile/app/(tabs)/_layout.tsx`

**Modified files (6):**
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx` (moved from `app/index.tsx`)
- `apps/mobile/app/(tabs)/profile.tsx` (moved from `app/profile.tsx`)
- `apps/mobile/app/course/[id]/index.tsx`
- `apps/mobile/app/module/[id]/index.tsx`
- `apps/mobile/app/material/[id].tsx`

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` — passes clean

---

## 2026-04-07

### Сесия (Google OAuth за мобилно + import fix)

**Какво направихме:**

1. **Google Cloud Console — OAuth client IDs за мобилно приложение**
   - Създадохме Android debug keystore (`~/.android/debug.keystore`) с `keytool`
   - Извлякохме SHA-1 fingerprint: `ED:B9:01:61:F3:48:6F:DE:D5:AF:BE:F7:EE:79:59:C1:36:12:C7:F3`
   - Създадохме Android OAuth client (package: `com.studyhub.mobile`)
   - Създадохме iOS OAuth client (bundle ID: `com.studyhub.mobile`)
   - Добавихме и трите client ID-та в `apps/mobile/.env`:
     - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (съществуваше — работи за десктоп)
     - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` (ново)
     - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (ново)

2. **Оправени счупени import пътища в 11 файла**
   - Проблем: всички import-и имаха едно `../` в повече (вероятно от преместване на файлове при добавяне на `(tabs)/` layout)
   - Засегнати файлове:
     - `app/login.tsx`, `app/register.tsx`, `app/create-course.tsx`
     - `app/(tabs)/index.tsx`
     - `app/course/[id]/add-module.tsx`, `app/course/[id]/edit.tsx`, `app/course/[id]/index.tsx`
     - `app/material/[id].tsx`
     - `app/module/[id]/add-material.tsx`, `app/module/[id]/edit.tsx`, `app/module/[id]/index.tsx`

3. **Google OAuth backend — вече работи**
   - `apps/web/app/api/auth/google/route.ts` обработва и `access_token` (от Expo), и `id_token` (от web)
   - При нов Google потребител се генерира случаен 64-символен hex пароль (`crypto.randomBytes(32)`) и се хешира — акаунтът е защитен от password login
   - Мобилният `loginWithGoogle()` в `auth-context.tsx` извиква същия endpoint

4. **Google Sign-In бутон компонент**
   - `apps/mobile/components/auth/GoogleSignInButton.tsx` — стилизиран бутон с анимиран shine ефект, интегриран в login и register екраните

5. **Google OAuth в Expo Go — не работи (очаквано)**
   - `auth.expo.io` proxy е deprecated от Expo SDK 50+ — Google оторизира потребителя, но proxy-то не може да върне redirect обратно в Expo Go
   - Expo Go не поддържа native Google Sign-In (нужен е development build или production build)
   - Грешката е `400: redirect_uri_mismatch` — Expo Go праща `exp://192.168.x.x:8081`, Google приема само `https://`
   - **Решение:** За development — тестваме Google login на десктоп (работи), на мобилен — email/password. При EAS production build Google OAuth ще работи автоматично, защото:
     - Приложението се компилира с правилния signing key
     - SHA-1 fingerprint съвпада с Android client-а в Google Console
     - Redirect минава native през Android/iOS системата (не през browser proxy)

6. **Fix: `package.json` main entry point**
   - Поправихме `"main": "index.js"` → `"main": "expo-router/entry"` (беше счупено от предишна сесия)

7. **Google Cloud Console настройки**
   - Web client: добавен Authorized redirect URI `https://auth.expo.io/@mariva/studyhub-v2`
   - Android client: SHA-1 от debug keystore, package `com.studyhub.mobile`
   - iOS client: bundle ID `com.studyhub.mobile` (App Store ID и Team ID оставени празни — опционални)
   - OAuth consent screen е в "Testing" режим — достатъчно за development

8. **Инсталиран EAS CLI глобално** (`npm install -g eas-cli`) — готов за бъдещи production builds

9. **`.env.example` обновен** с всички Google OAuth env vars за документация

10. **Премахнати неизползвани import-и** (`makeRedirectUri` от `expo-auth-session` — не се ползва в крайния код)

**Текущо състояние на Google OAuth:**
- Десктоп (web): работи — login и register с Google акаунт ✅
- Мобилен (Expo Go): не работи — auth proxy deprecated, ползва се email/password ⚠️
- Мобилен (production build): ще работи при EAS Build с правилния SHA-1 🔜

**Deployment бележка — Google OAuth:**
- При production deployment ще трябва:
  - Нов SHA-1 от production keystore (EAS Build генерира свой) → нов Android OAuth client или добавяне на втори fingerprint
  - Google OAuth consent screen да се смени от "Testing" на "Published" (за да могат всички потребители, не само test users)
  - Authorized redirect URIs да се обновят с production домейна
  - `EXPO_PUBLIC_GOOGLE_*` env vars да се добавят в EAS/production конфигурацията
- Google OAuth в Expo Go не работи (auth proxy deprecated) — това е нормално и очаквано, не е бъг

**Verification:**
- `npx tsc --noEmit` — 0 грешки

---

## 2026-04-08

### Сесия 161

**Какво направихме:**
- Преглед и анализ на мобилното приложение — идентифицирани 50 подобрения по приоритет (UX, code quality, липсващи функции)
- **UI polish — emoji иконки вместо букви:**
  - Tab bar: "C" → 📚, "P" → 👤 (с opacity fade за inactive състояние)
  - Material types: "N" → 📝, "L" → 🔗, "F" → 📄, "V" → 🎬
  - Променени файлове: `app/(tabs)/_layout.tsx`, `lib/material-utils.ts`, `app/module/[id]/add-material.tsx`, `app/material/[id]/edit.tsx`

**Забележки от анализа (за следващи сесии):**
- High priority: офлайн кеширане (React Query), по-добро error handling в api.ts, type safety (премахване на `any`)
- Medium: form validation в реално време, accessibility labels, централизиране на дублиран MATERIAL_TYPES, color constants файл, logout в Profile вместо в header
- Липсващи функции: progress tracking, favorites/bookmarks, глобално търсене, dark mode, course publish/draft toggle от мобилното

### Session 162 (Mobile backlog tracking after icon pass)

**Goal:**
- Keep a clean list of all items that remain from the original mobile review so we can execute them in order.

**Remaining backlog (source: original priority list):**

High priority:
- [ ] Offline caching across mobile data screens (target direction: React Query + AsyncStorage persistence).
- [ ] Better API error handling end-to-end (distinguish invalid credentials vs network/server errors in UI flows).
- [ ] Type safety hardening (remove remaining `any`, remove route casts, enforce typed Expo Router navigation).

Medium priority:
- [ ] Realtime inline form validation (login/register/create flows).
- [ ] Centralize `MATERIAL_TYPES` usage everywhere (single source of truth).
- [ ] Extract and apply shared `COLORS` constants (reduce hardcoded brand hex values).
- [ ] Accessibility labels for key actions and controls (FAB, auth actions, edit/delete actions, navigation CTAs).
- [ ] Move/standardize logout placement in Profile tab (instead of Courses header flow).

Missing features (later phase):
- [ ] Progress tracking (material read state + completion percentages).
- [ ] Favorites/Bookmarks quick-access flow.
- [ ] Global search (not only inside a single module).
- [ ] Dark mode support in mobile app.
- [ ] Course status toggle (publish/draft) from mobile.

**Execution note:**
- We will ship high-priority items first, then medium UX polish, then feature additions.

### Session 163 (Mobile high-priority execution pass)

**What we changed:**
- Implemented API-level offline-friendly caching in `apps/mobile/lib/api.ts`:
  - GET responses are cached in AsyncStorage with TTL.
  - Network failures and 5xx responses can fall back to cached data.
  - Non-GET authenticated mutations clear scoped cache.
- Upgraded mobile API error model:
  - `ApiError` now includes `kind` and normalized fallback messages (validation/auth/forbidden/not_found/conflict/rate_limited/server/network).
  - Added safer network error handling (`NETWORK_ERROR`) and user-facing fallback messages.
- Hardened auth cache lifecycle in `apps/mobile/lib/auth-context.tsx`:
  - clear cached API data on login/register/google-login/logout.
  - clear cache when token is invalid during bootstrap.
- Completed type-safety cleanup for mobile navigation and catches:
  - Removed all `as any` route casts from mobile app screens.
  - Switched key dynamic routes to typed object navigation (`pathname + params`).
  - Removed remaining `catch (...: any)` usage.
- Medium UX improvements started:
  - Moved `Logout` action from Courses header to Profile screen.
  - Added baseline accessibility labels for key action buttons (FAB + profile logout).

**Files updated:**
- `apps/mobile/lib/api.ts`
- `apps/mobile/lib/auth-context.tsx`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/course/[id]/index.tsx`
- `apps/mobile/app/module/[id]/index.tsx`
- `apps/mobile/app/create-course.tsx`
- `apps/mobile/app/module/[id]/edit.tsx`

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 189 (Phase 3 smoke stabilization: web dev API runtime workaround)

**Issue observed:**
- Physical-device mobile app could reach the web server process, but auth requests still failed with the generic fallback:
  - `"Connection failed. Is the server running?"`
- Metro/LAN manifest was healthy (`hostUri: 192.168.1.9:8081`), so this was **not** the previous zombie Metro `127.0.0.1` issue.
- Direct local verification showed the web dev server process on port `3000` was responding incorrectly on API routes:
  - `GET /api/ping` -> `200` with body `{}`
  - `POST /api/auth/login` -> `200` with body `{}`
- Those routes should return structured JSON payloads, so the mobile client was receiving invalid auth/warmup responses.

**What we changed:**
- Updated `apps/web/package.json`:
  - Changed the web dev script from `next dev --turbopack` to `next dev`.
- Fixed `apps/web/app/api/ping/route.ts`:
  - Corrected the `db` import path from `../../lib/db` to `../../../lib/db`.

**Why:**
- Current evidence points to a local dev-runtime problem rather than an API logic bug:
  - web root page rendered normally
  - mobile device reached port `3000`
  - only API route payloads were malformed in the active dev server instance
- Removing Turbopack from the dev script is a low-risk workaround to stabilize local API behavior for Phase 3 smoke testing.

**Next step required:**
- Restart the web server so the updated script takes effect:
  - stop the current `dev:web`
  - start `npm run dev:web` again
- Then re-test login/register and the Phase 3 RETEST rows (`SMK-03`, `SMK-05`, `SMK-06`, `SMK-07`).

**Verification:**
- `npm.cmd run --workspace @studyhub/web typecheck` -> pass

### Session 190 (Phase 3 smoke stabilization: Favorites pin/unpin entry point in module workspace)

**Issue observed:**
- Mobile users could not discover a practical way to pin materials from the module workspace list.
- Favorites existed in app logic and in material details screen, but there was no direct `Pin/Unpin` action on material cards where users spend most of the CRUD flow.

**What we changed:**
- Added direct `Pin/Unpin` action to module workspace material cards:
  - `apps/mobile/components/material-card.tsx`
    - new optional props: `isPinned`, `favoriteBusy`, `onToggleFavorite`
    - renders a dedicated favorite action button in the card footer
- Wired favorites query + optimistic toggle mutation into module workspace view model:
  - `apps/mobile/components/module-workspace/use-module-workspace.ts`
    - added favorites query (`queryKeys.favorites.lists()`)
    - added optimistic pin/unpin mutation with rollback and toast feedback
    - exposed new view-model helpers:
      - `isMaterialPinned(materialId)`
      - `isFavoriteBusy(materialId)`
      - `toggleMaterialFavorite(material)`
- Connected screen rendering to the new view-model capabilities:
  - `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
- Extended view-model type contract accordingly:
  - `apps/mobile/components/module-workspace/module-workspace.types.ts`

**Result:**
- Users can now pin/unpin materials directly from module workspace cards without opening each material detail screen first.
- This unblocks practical execution of `SMK-14` and `SMK-15` in the smoke matrix.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 191 (Phase 3 smoke stabilization: background/foreground auth hydration smoothing)

**Issue observed:**
- Returning from background frequently felt like a cold app boot (initial loader and delayed restore), instead of immediate resume.

**What we changed:**
- Updated `apps/mobile/lib/auth-context.tsx`:
  - Added persisted user snapshot cache (`studyhub_user_snapshot_v1`) via AsyncStorage.
  - Hydrates `user` state immediately from snapshot when a token exists.
  - Persists snapshot on login/register/google-login and clears it on logout/auth reset.
  - Increased startup `/api/auth/me` timeout to `20s` and forced no-cache for validation.
  - Kept session/snapshot on transient network/server failures; only clears session on auth/forbidden errors.
  - Preserved Neon pre-warm behavior.

**Why:**
- Startup auth validation previously hard-blocked UI on every remount and could feel like full relaunch.
- Snapshot-first hydration improves perceived foreground resume stability in mobile smoke flows.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 192 (Phase 3 smoke execution synced: SMK-01..SMK-19 pass, SMK-20 blocked)

**Run outcome reported:**
- Physical-device smoke execution completed for all practical flows.
- PASS: `SMK-01` through `SMK-19`.
- BLOCKED: `SMK-20` because VoiceOver/TalkBack verification was not available in the current test environment.

**What we synced in docs:**
- Updated `docs/mobile-smoke-test-matrix.md`:
  - Status line now reflects `SMK-01..SMK-19` pass state.
  - Converted prior RETEST/PENDING rows to PASS where re-run was completed.
  - Marked `SMK-20` as BLOCKED with explicit reason.
  - Added Run 2 summary.
- Updated `docs/mobile-execution-checklist.md`:
  - Marked Phase 3 smoke quality gate task as complete for covered scenarios.
  - Updated acceptance criteria for key flow pass.
  - Updated next recommended task to telemetry integration + release checklist.

**Next step:**
- Proceed to telemetry integration (Sentry or equivalent), then release checklist.
- Keep `SMK-20` tracked as BLOCKED until accessibility test environment is available.

### Session 188 (Phase 3 smoke stabilization: auth branding asset fix + broader DB warmup coverage)

**Issue observed:**
- Mobile auth screens started failing to bundle after the legacy `logo.png` asset was removed from `apps/mobile/assets/branding`.
- Metro error:
  - `Unable to resolve "../../assets/branding/logo.png" from "apps/mobile/components/auth/auth-brand-hero.tsx"`
- At the same time, the auth header regressed visually because it rendered the wrong visual asset instead of the mascot.

**What we changed:**
- Updated `apps/mobile/components/auth/auth-brand-hero.tsx`:
  - Replaced the broken `logo.png` import with the remaining `mascot.png` branding asset.
  - Marked the mascot image as decorative (`accessible={false}`).
- Updated `apps/mobile/components/auth/auth-brand-hero.styles.ts`:
  - Renamed the image style from `logo` to `mascot`.
  - Increased the auth hero image size so the mascot reads clearly again on login/register.
- Broadened Phase 3 Neon pre-warm coverage in `apps/mobile/lib/auth-context.tsx`:
  - Fire `warmupBackend()` on unauthenticated app start so the login/register screen can wake Neon in the background before the first auth mutation.
  - Fire `warmupBackend()` after successful register and Google login as well (email login + auto-login were already covered in Session 187).

**Why this matters for Phase 3:**
- Restores Android bundle compilation so physical-device smoke testing can continue.
- Removes a misleading auth-screen visual regression while keeping the branding aligned with the intended mascot-first mobile look.
- Further reduces the chance that the first auth mutation hits a Neon free-tier cold start.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass
- Android bundle probe via Metro LAN URL -> `200 OK`
- `rg --line-number --hidden --glob '!node_modules/**' "logo\\.png" apps/mobile` -> no remaining mobile references

### Session 187 (Phase 3 smoke stabilization: Neon cold-start root cause + fix)

**Root cause identified:**
- All four FAIL rows (`SMK-03`, `SMK-05`, `SMK-06`, `SMK-07`) share the same pattern: action completes server-side, but mobile shows timeout error.
- Backend uses `drizzle-orm/neon-http` — a stateless HTTP driver. Every DB query is a separate HTTP request to Neon serverless.
- Neon free tier suspends the database after ~5 minutes of inactivity. Wake-up takes 5–30+ seconds.
- The previous 25s mutation timeout was not enough to survive a full cold-start round-trip from mobile → Next.js → Neon wake → DB query → response.

**What we changed:**
- `apps/mobile/lib/api.ts`:
  - Increased `DEFAULT_MUTATION_REQUEST_TIMEOUT_MS` from `25s` to `45s` (covers Neon cold-start window on free tier).
  - Added exported `warmupBackend()` — fire-and-forget GET to `/api/ping` (60s timeout, no auth) to proactively wake the DB.
- `apps/web/app/api/ping/route.ts` (NEW):
  - Lightweight DB-touching probe: `SELECT 1` via Drizzle, no auth, returns `{ ok: true, latency: N }`.
  - Used exclusively for pre-warming; not an application endpoint.
- `apps/mobile/lib/auth-context.tsx`:
  - `warmupBackend()` called after successful explicit login (email/password).
  - `warmupBackend()` called after successful auto-login (stored token → `/api/auth/me`).
  - Both calls are fire-and-forget; never block the auth flow.

**Smoke status after fix:**
- PASS: `SMK-01`, `SMK-02`, `SMK-04`
- RETEST (fix applied): `SMK-03`, `SMK-05`, `SMK-06`, `SMK-07`
- PENDING: `SMK-08` through `SMK-20`

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` → pass

---

### Session 186 (Phase 3 smoke execution: timeout reliability + runtime crash hardening)

**What we changed:**
- Continued Phase 3 smoke execution on physical device and logged initial outcomes in `docs/mobile-smoke-test-matrix.md`:
  - PASS: `SMK-01`, `SMK-02`, `SMK-04`
  - FAIL: `SMK-03`, `SMK-05`, `SMK-06`, `SMK-07`
  - Core observed issue: intermittent request timeouts despite server-side success in some CRUD/auth actions.
- Hardened mobile networking timeout behavior in `apps/mobile/lib/api.ts`:
  - Increased mutation timeout window from `12s` to `25s`.
  - Kept GET timeout shorter (`6s`) to avoid long hangs on read flows.
  - Improved timeout message for mutations to indicate action may have succeeded server-side.
- Fixed unhandled promise paths that were causing red `Uncaught (in promise)` runtime overlays:
  - `apps/mobile/components/courses-list/use-courses-list.ts`
    - delete confirm flow now awaits mutation in `try/catch/finally` instead of unhandled `.finally(...)` chain.
  - `apps/mobile/components/confirm-modal.tsx`
    - defensive `catch` in confirm handler to prevent promise rejection bubbling to runtime overlay.
  - `apps/mobile/app/(tabs)/favorites.tsx`
    - switched unpin action call to `mutate(...)` (callback-managed errors) instead of bare `mutateAsync(...)`.
  - `apps/mobile/components/courses-list/courses-list.types.ts`
    - aligned `confirmDeleteCourse` signature with async behavior.
- Addressed intermittent Metro startup watcher crash:
  - `apps/mobile/metro.config.js`
  - narrowed `watchFolders` to required workspace folders (instead of watching full monorepo root) to reduce Windows watcher overload (`Failed to start watch mode`).
- Added VS Code run configurations for quicker local startup:
  - `.vscode/launch.json`
  - `Run: dev:web`, `Run: dev:mobile:lan`, and compound `Run: Web + Mobile (LAN)`.

**Known open issue after fixes:**
- Intermittent timeout behavior still observed during smoke reruns; requires another focused pass on network stability and retry strategy before Phase 3 smoke can be marked complete.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 185 (Phase 3 kickoff: mobile smoke quality-gate package)

**What we changed:**
- Started Phase 3 quality gates with a dedicated physical-device smoke execution artifact:
  - `docs/mobile-smoke-test-matrix.md`
  - Includes preflight setup, test-data assumptions, 20 smoke scenarios, pass/fail logging columns, and exit criteria.
- Coverage in the matrix:
  - auth/session
  - courses/modules/materials CRUD
  - favorites parity and quick navigation
  - offline/online recovery
  - AppState background/foreground recovery
  - dirty-form back/discard behavior
  - accessibility sanity pass
- Updated `docs/mobile-execution-checklist.md`:
  - Added explicit reference that smoke execution matrix is prepared and ready for run logging.
  - Updated next recommended task to execute the matrix on a physical device and then proceed to telemetry.

**Status:**
- Smoke matrix setup complete.
- Physical-device smoke execution still pending (rows are `PENDING` until run).

### Session 184 (Dashboard branding final polish after visual review)

**What we changed:**
- Finalized the mobile dashboard branding decision after UI review:
  - Kept the mascot in the Courses dashboard header and no-courses card.
  - Removed the desktop-style icon from dashboard branding areas.
- Kept auth branding aligned for mobile sign-in/sign-up with clean logo-first presentation (without extra decorative marker before it).
- Updated docs copy to match the final visual decision:
  - `docs/mobile-execution-checklist.md` dashboard branding notes now reflect mascot-first dashboard branding.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 183 (Phase 2: accessibility hardening + CRUD/favorites stability acceptance)

**What we changed:**
- Completed accessibility hardening pass for core mobile CRUD and favorites flows.
- Added explicit VoiceOver/TalkBack labels + hints on form controls in CRUD screens:
  - `apps/mobile/app/create-course.tsx`
  - `apps/mobile/app/course/[id]/add-module.tsx`
  - `apps/mobile/app/course/[id]/edit.tsx`
  - `apps/mobile/app/module/[id]/add-material.tsx`
  - `apps/mobile/app/module/[id]/edit.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
- Added selected-state accessibility semantics for chips/type selectors:
  - `apps/mobile/components/type-filter-chips.tsx`
  - material-type selectors in add/edit material screens
- Improved VoiceOver/TalkBack action discoverability with contextual hints and Dynamic Type resilience in shared CRUD/favorites UI:
  - `apps/mobile/app/(tabs)/favorites.tsx`
  - `apps/mobile/components/courses-list/course-card.tsx`
  - `apps/mobile/components/module-list-card.tsx`
  - `apps/mobile/components/material-card.tsx`
  - `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
  - `apps/mobile/components/courses-list/courses-list-screen.tsx`
  - `apps/mobile/components/search-bar.tsx`
  - `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
  - `apps/mobile/app/material/[id].tsx`

**Phase 1 stabilization guardrails kept intact:**
- React Query lifecycle integration unchanged
- Query-managed reads with `cache: false` unchanged
- Timeout/retry tuning unchanged
- API contracts and mutation behavior unchanged

**Checklist sync:**
- Marked Phase 2 accessibility task as completed in `docs/mobile-execution-checklist.md`.
- Marked Phase 2 acceptance criterion "Core CRUD/favorites flows are stable with improved perceived UX" as completed.
- Updated next recommended task to finish dashboard branding cleanup, then proceed to Phase 3 quality gates.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 181 (Checkpoint: Phase 2 continuity + dashboard branding backlog)

**What we changed:**
- Added an explicit continuity checkpoint so current UI polish detours do not hide remaining Phase 2 priorities.
- Updated `docs/mobile-execution-checklist.md` Phase 2 tasks with a tracked UI-hardening item:
  - dashboard branding cleanup:
    - remove decorative emoji markers
    - align `StudyHub` heading typography/color with auth/web brand language
- Updated "Next Recommended Task" in checklist to keep sequence clear:
  - finish hardware back consistency first
  - then execute dashboard branding cleanup

**Why:**
- Preserve momentum on core UX hardening while keeping requested branding fixes visible and scheduled.

**Verification:**
- Docs-only continuity update (no runtime code changes in this session).

### Session 182 (Phase 2: hardware back consistency in CRUD forms)

**What we changed:**
- Implemented reusable unsaved-changes navigation guard:
  - `apps/mobile/lib/use-confirm-discard.ts`
  - Uses navigation `beforeRemove` to intercept back actions consistently (hardware back, header back, gesture back).
  - Shows discard confirmation only when form state is dirty.
  - Supports save flow via `allowNextLeave()` to avoid extra prompt after successful submit.
- Applied guard in all mobile CRUD form screens:
  - `apps/mobile/app/create-course.tsx`
  - `apps/mobile/app/course/[id]/add-module.tsx`
  - `apps/mobile/app/course/[id]/edit.tsx`
  - `apps/mobile/app/module/[id]/add-material.tsx`
  - `apps/mobile/app/module/[id]/edit.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
- Dirty-state checks are field-aware per screen (text fields and material-type selector where applicable).

**Kept intact (as requested):**
- API contracts
- Mutation behavior
- React Query lifecycle/cache policy choices

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 181 (Phase 1 manual verification pass + Expo Router warning cleanup)

**Manual device verification result (reported):**
- AppState scenario: pass
- NetInfo scenario: pass
- Combined offline/background/reconnect scenario: pass
- Note: reconnect flow initially showed longer spinner duration; stabilized with timeout/retry tuning from Session 180.

**Additional issue observed:**
- Expo Router warnings in terminal:
  - `Route "./(tabs)/favorites.styles.ts" is missing the required default export`
  - `Route "./material/material-screen.styles.ts" is missing the required default export`

**What we changed:**
- Moved style-only files out of `app/` so Expo Router no longer treats them as route modules:
  - `apps/mobile/app/(tabs)/favorites.styles.ts` -> `apps/mobile/components/favorites/favorites.styles.ts`
  - `apps/mobile/app/material/material-screen.styles.ts` -> `apps/mobile/components/material/material-screen.styles.ts`
- Updated imports:
  - `apps/mobile/app/(tabs)/favorites.tsx`
  - `apps/mobile/app/material/[id].tsx`
- Synced `docs/mobile-execution-checklist.md`:
  - Phase 1 manual verification + acceptance criteria marked complete.
  - Next recommended task moved to Phase 2 guardrail refactor.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 180 (Reconnect spinner stabilization)

**Issue observed during manual device test:**
- After offline -> online recovery, navigation remained usable but loading spinners could stay visible too long on data screens.

**What we changed:**
- Added request timeout support in `apps/mobile/lib/api.ts`:
  - default API request timeout (`6s`) via `fetchWithTimeout(...)` + `AbortController`
  - timeout now returns a network error message (`Request timed out. Please try again.`)
- Reduced query retry aggressiveness in `apps/mobile/lib/query-client.ts`:
  - retry policy now allows only one retry cycle for retryable query errors.

**Why:**
- Prevent long-hanging requests after network transitions from keeping screens in prolonged spinner states.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Next validation required on device:**
- Re-run NetInfo reconnect scenario and confirm spinner duration is now acceptable.

### Session 179 (Mobile start scripts hardened for Expo dependency-validation crash)

**Issue observed:**
- Repeated `Body is unusable: Body has already been read` crash when running mobile start commands without env workaround.
- Crash originates in Expo CLI dependency validation flow (`getNativeModuleVersionsAsync`).

**What we changed:**
- Updated mobile npm scripts in `apps/mobile/package.json` to always set:
  - `EXPO_NO_DEPENDENCY_VALIDATION=1`
- Hardened scripts:
  - `start`
  - `dev:mobile:tunnel`
  - `dev:mobile:lan`
  - `dev:mobile:usb`
  - `android:usb`
  - `android`
  - `ios`
  - `web`

**Verification:**
- `npm.cmd --workspace @studyhub/mobile run dev:mobile:lan` now reaches:
  - `Waiting on http://localhost:8081`
  - no `Body is unusable` crash in startup path

### Session 183 (Phase 2 guardrail refactor completed: login + register split)

**What we changed:**
- Split `apps/mobile/app/login.tsx` into a thin route + feature modules:
  - `apps/mobile/components/login/login-screen.tsx`
  - `apps/mobile/components/login/use-login-screen.ts`
  - `apps/mobile/components/login/login-screen.styles.ts`
- Split `apps/mobile/app/register.tsx` into a thin route + feature modules:
  - `apps/mobile/components/register/register-screen.tsx`
  - `apps/mobile/components/register/use-register-screen.ts`
  - `apps/mobile/components/register/register-screen.styles.ts`
- Preserved existing auth behavior:
  - email/password validation timing and touched-field flow
  - API error handling contract and loading states
  - Google sign-in flow (`expo-auth-session`) and existing redirect URI
  - animated card entrance and auth route switching (`login` <-> `register`)

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Phase 2 status update:**
- Guardrail file-splitting targets are now complete:
  - `apps/mobile/app/module/[id]/index.tsx`
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/app/login.tsx`
  - `apps/mobile/app/register.tsx`
- Next Phase 2 work: UX hardening (skeleton/loading/offline/accessibility/haptics).

### Session 182 (Phase 2 guardrail refactor continued: profile tab split)

**What we changed:**
- Split `apps/mobile/app/(tabs)/profile.tsx` into a thin route file and extracted feature modules under:
  - `apps/mobile/components/profile-tab/profile-tab-screen.tsx` (UI composition)
  - `apps/mobile/components/profile-tab/use-profile-tab.ts` (query/mutation/editor-state orchestration)
  - `apps/mobile/components/profile-tab/profile-tab.styles.ts` (styles)
  - `apps/mobile/components/profile-tab/profile-tab.types.ts` (feature-local types)
- Preserved behavior for:
  - profile read via React Query (`/api/auth/me`, `cache: false`)
  - optimistic profile name update on save with rollback on error
  - refresh/retry behavior and profile editor flow (edit/cancel/save)
  - logout action, role badge, and member-since display
- Guardrail compliance after split:
  - route file is now minimal
  - extracted files are under 300 lines
  - major functions remain under 60 lines

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Phase 2 status update:**
- Completed guardrail split targets:
  - `apps/mobile/app/module/[id]/index.tsx`
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
- Remaining guardrail split targets:
  - `apps/mobile/app/login.tsx`
  - `apps/mobile/app/register.tsx`

### Session 181 (Phase 2 guardrail refactor continued: courses tab split)

**What we changed:**
- Split `apps/mobile/app/(tabs)/index.tsx` into a thin route file and extracted feature modules under:
  - `apps/mobile/components/courses-list/courses-list-screen.tsx` (UI composition)
  - `apps/mobile/components/courses-list/use-courses-list.ts` (query/mutation/state orchestration)
  - `apps/mobile/components/courses-list/course-card.tsx` (animated item card)
  - `apps/mobile/components/courses-list/courses-list.styles.ts` (styles)
  - `apps/mobile/components/courses-list/courses-list.types.ts` (feature-local types)
- Preserved behavior for:
  - query-managed courses list read with `cache: false`
  - focus refetch invalidation for courses list
  - optimistic course delete and rollback on error
  - existing header stats, empty/error/loading states, and create-course FAB flow
- Kept file/function guardrails:
  - route file is now minimal
  - extracted files stay under 300 lines
  - major functions remain under 60 lines

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Phase 2 status update:**
- Completed guardrail split targets:
  - `apps/mobile/app/module/[id]/index.tsx`
  - `apps/mobile/app/(tabs)/index.tsx`
- Remaining guardrail split targets:
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/app/login.tsx`
  - `apps/mobile/app/register.tsx`

### Session 180 (Phase 2 guardrail refactor started: module workspace split)

**What we changed:**
- Split `apps/mobile/app/module/[id]/index.tsx` into smaller route + feature modules while preserving behavior:
  - `apps/mobile/app/module/[id]/index.tsx` is now a thin orchestrator route file.
  - New feature files in `apps/mobile/components/module-workspace/`:
    - `module-workspace-screen.tsx` (UI composition)
    - `use-module-workspace.ts` (state orchestration)
    - `module-workspace.queries.ts` (React Query read hooks + focus refetch)
    - `module-workspace.mutations.ts` (delete flows with optimistic updates + invalidation)
    - `module-workspace.helpers.ts` (search/filter + confirm copy helpers)
    - `module-workspace.styles.ts` (styles)
    - `module-workspace.types.ts` (feature-local types)
- Kept Phase 1 stabilization behavior intact:
  - query-managed GET reads still use `cache: false` in module workspace queries,
  - focus-driven invalidation remains active,
  - delete module/material optimistic behavior and invalidation logic preserved.
- Removed route-co-located type file and moved feature types under `components/` to avoid Expo Router route-file warnings.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Phase 2 status update:**
- Completed:
  - `apps/mobile/app/module/[id]/index.tsx` guardrail split (`<300` file-size guardrail achieved across extracted files).
- Remaining Phase 2 guardrail split targets:
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/app/login.tsx`
  - `apps/mobile/app/register.tsx`

### Session 178 (Expo LAN start crash workaround: dependency validation skip)

**Issue observed:**
- `npm --workspace @studyhub/mobile run dev:mobile:lan` failed at startup with:
  - `TypeError: Body is unusable: Body has already been read`
  - stack trace in Expo CLI dependency validation path (`getNativeModuleVersionsAsync` -> `validateDependenciesVersionsAsync`)

**What we verified:**
- Environment currently uses `Node v22.21.0`.
- Running mobile start with dependency validation disabled starts Metro successfully:
  - `set EXPO_NO_DEPENDENCY_VALIDATION=1&& npm.cmd --workspace @studyhub/mobile run dev:mobile:lan`
  - output reaches `Waiting on http://localhost:8081`

**Current guidance for this branch/session:**
- Use `EXPO_NO_DEPENDENCY_VALIDATION=1` for mobile start commands when this crash appears.
- Continue physical-device Phase 1 lifecycle checks after Metro is up.

### Session 177 (Phase 1 cache-policy rollout completed for query-managed reads)

**What we changed:**
- Completed the remaining React Query GET cache-policy rollout in mobile screens:
  - `apps/mobile/app/module/[id]/index.tsx`
    - module detail query (`/api/modules/[id]`) now uses `cache: false`
    - module materials query (`/api/modules/[id]/materials`) now uses `cache: false`
  - `apps/mobile/app/material/[id].tsx`
    - material detail query (`/api/materials/[id]`) now uses `cache: false`
- Re-audited all `useQuery` reads in mobile routes and confirmed query-managed GET paths now consistently bypass `apiFetch` cache.
- Kept `apiFetch` cache behavior for non-query/auth bootstrap paths (for example `AuthProvider` bootstrap `GET /api/auth/me`) per Phase 1 policy.
- Updated `README.md` mobile data-layer section with explicit cache policy:
  - React Query-managed reads use `cache: false`.
  - `apiFetch` cache remains enabled for non-query/auth bootstrap usage.
- Updated `docs/mobile-execution-checklist.md`:
  - marked cache-policy tasks as complete
  - kept physical-device lifecycle verification as pending
  - added explicit AppState + NetInfo verification matrix items

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Still pending (physical-device verification):**
- AppState foreground/background refetch behavior on core screens.
- NetInfo offline/online reconnect refetch behavior.
- Combined offline + background + reconnect recovery flow.

### Session 176 (Mobile stability hardening kickoff + handoff)

**What we did in this slice (context-safe handoff prep):**
- Audited the current branch and confirmed these stabilization pieces are already present in code:
  - lifecycle wiring file exists: `apps/mobile/lib/react-query-lifecycle.ts`
  - root startup wiring exists: `apps/mobile/app/_layout.tsx` calls `configureReactQueryLifecycle()`
  - partial cache-policy rollout already exists (`cache: false`) in:
    - `apps/mobile/app/(tabs)/profile.tsx`
    - `apps/mobile/app/(tabs)/index.tsx`
    - `apps/mobile/app/course/[id]/index.tsx`
- Revalidated type safety before handoff:
  - `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.
- Updated continuity docs:
  - `docs/mobile-execution-checklist.md` (Phase 1 task wording + next task)
  - this handoff block in `docs/dev-log.md`

**Current status:**
- No additional runtime code changes were finalized in this handoff-only slice.
- This slice is intentionally paused for context management and clean continuation.

**Remaining work for next chat (same phase):**
- Finish cache-policy rollout for remaining React Query/GET read paths:
  - `apps/mobile/app/module/[id]/index.tsx`
  - `apps/mobile/app/material/[id].tsx`
  - `apps/mobile/app/course/[id]/edit.tsx`
  - `apps/mobile/app/module/[id]/edit.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
- Add brief README note for mobile cache policy (`React Query` as primary source for query-managed reads).
- Run manual device validation scenarios:
  - app background -> foreground refresh behavior
  - offline -> online reconnect behavior
  - core CRUD + favorites after reconnect

**Next chat handoff prompt (copy/paste):**
`Read docs/dev-log.md and docs/mobile-execution-checklist.md. Continue Phase 1 stabilization. Complete cache-policy rollout by setting cache:false on remaining query-managed GET reads in mobile screens, keep apiFetch cache for non-query/auth bootstrap paths, then run npm.cmd run --workspace @studyhub/mobile typecheck and document what was completed + what still needs physical-device verification (AppState + NetInfo scenarios).`

### Session 175 (Mobile roadmap reprioritized: quality-first + QR scope decision)

**Context from planning discussion:**
- Mobile standards score (`5.5/10`) was treated as a signal to prioritize app quality/stability over decorative expansion.
- Requested scope decisions:
  - move mobile AI work later,
  - do not build Admin QR,
  - keep focus on improving existing mobile experience first.

**What we changed:**
- Reworked `docs/mobile-execution-checklist.md` into a quality-first roadmap:
  - `Phase 1`: lifecycle + cache correctness first.
  - `Phase 2`: guardrail-driven refactors + UX hardening.
  - `Phase 3`: quality gates, then optional expansion.
- Added/confirmed scope statuses:
  - `DEFERRED`: mobile AI entry points/tools.
  - `DE-SCOPED`: Admin QR.
  - `Optional later`: profile QR handoff (social-ready future idea).
- Updated "Next Recommended Task" to start with lifecycle integration (`focusManager` + `onlineManager`) and cache policy hardening.

**Why:**
- For this capstone stage, reliability and maintainability improve the mobile quality score more than adding new AI feature surface area.
- This order also fits the current learning path and reduces implementation risk.

**Verification:**
- Docs-only planning update (no runtime code changes in this session).

### Session 174 (AI env location clarification for continuity)

**What we changed:**
- Updated `README.md` with a dedicated AI env note clarifying where `GEMINI_API_KEY` is read from in local development and what is required in production deploys.
  - Local dev (web AI routes): key is expected in `apps/web/.env`.
  - Root `.env` can remain empty for `GEMINI_API_KEY` without breaking local web AI if `apps/web/.env` is configured.
  - Production: `GEMINI_API_KEY` must be set in Vercel/Netlify environment variables.

**Why:**
- Prevent repeated confusion across sessions about "empty root `.env` vs working AI endpoints".

**Verification:**
- Docs-only update (no runtime code changes in this session).

### Session 173 (AGENTS.md scope sync with current mobile direction)

**What we changed:**
- Updated `AGENTS.md` mobile definition from fixed "3 screens" to current in-scope/out-of-scope mobile product scope.
  - In-scope: auth, courses, module/material workspace, favorites, profile.
  - Out-of-scope: mobile Progress/Milestones, mobile Calendar, and full mobile Admin Panel (web-first unless explicitly requested).
- Synced docs wording with the same decision:
  - `docs/dev-log.md` scope-decision reason text for mobile admin de-scope.
  - `docs/mobile-execution-checklist.md` admin de-scope reason text.

**Why:**
- Keep AI execution instructions aligned with real product direction, so future sessions do not re-open de-scoped work by mistake.

**Verification:**
- Documentation + instruction sync only (no runtime code changes in this session).

**Continuity checklist:**
- Added `docs/mobile-execution-checklist.md` with Sprint 1 / Sprint 2 tasks, acceptance criteria, and current status checkboxes.

### Session 172 (Kickoff prompt master checklist mirrored in dev-log)

**Requested continuity update:**
- Mirrored all mobile tasks from the kickoff prompt directly inside `docs/dev-log.md` (not only in a separate checklist file), so future chats can continue from one source.

**Kickoff baseline assessment (reference):**
- Mobile core CRUD + data layer: `8/10`
- Parity vs desktop: `6/10`
- Production readiness (mobile standards): `5.5/10`
- Overall current MVP: `7/10`

**Scope decisions (2026-04-08):**
- Progress/Milestones mobile MVP is de-scoped (internal work-notes pages, not end-user mobile value for this capstone).
- Calendar mobile MVP is de-scoped (internal work-notes usage, low product value for mobile scope).
- Admin panel on mobile is de-scoped by default for this project.
  - Reason: web-first admin scope for this capstone; implement mobile admin only if explicitly requested.
  - Practical note: full admin panels are commonly web-first due complexity, lower frequency of admin actions, and better desktop workflow.

**Master checklist from kickoff prompt:**
- [x] Feature parity: Favorites (pin/unpin + favorites list + tab access).
- [x] DE-SCOPED: Progress/Milestones mobile (read + basic create/edit/status update).
- [x] DE-SCOPED: Calendar mobile (read + basic create/edit/delete).
- [ ] Feature parity: AI entry points on mobile (summarize/quiz/chat) or read-only AI outputs.

- [ ] React Query RN lifecycle: integrate `focusManager` with `AppState`.
- [ ] React Query RN lifecycle: integrate `onlineManager` with `NetInfo`.
- [ ] Validate foreground/online refetch behavior across key mobile screens.

- [ ] Cache policy: define single source of truth between React Query persistence and `apiFetch` AsyncStorage cache.
- [ ] Cache policy: decide where `apiFetch` cache must be disabled for query-managed read paths.
- [ ] Cache policy: document policy in `README.md` and enforce in mobile data calls.

- [ ] Guardrails refactor: split `apps/mobile/app/module/[id]/index.tsx` (<300 lines; extract hooks/components).
- [ ] Guardrails refactor: split `apps/mobile/app/(tabs)/profile.tsx` (<300 lines; extract hooks/components).
- [ ] Guardrails refactor: split `apps/mobile/app/(tabs)/index.tsx` (<300 lines; extract hooks/components).
- [ ] Guardrails refactor: split `apps/mobile/app/register.tsx` (<300 lines; extract hooks/components).
- [ ] Guardrails refactor: split `apps/mobile/app/login.tsx` (<300 lines; extract hooks/components).
- [ ] Guardrails: keep functions under 60 lines during refactors/new work.

- [ ] Mobile UX standards: add haptics for destructive/success actions.
- [ ] Mobile UX standards: add richer skeleton loading states for major flows.
- [ ] Mobile UX standards: improve empty/offline states for core screens.
- [ ] Mobile UX standards: verify Dynamic Type / font scaling behavior.
- [ ] Mobile UX standards: verify VoiceOver/TalkBack navigation flow.
- [ ] Mobile UX standards: verify hardware back behavior on all CRUD screens.

- [ ] Release readiness: add mobile e2e smoke suite (auth + CRUD happy path + offline/online recovery).
- [ ] Release readiness: add crash/error telemetry (Sentry or equivalent).
- [ ] Release readiness: finalize mobile release checklist in docs.

**Sprint plan tracking (from kickoff):**

Sprint 1 - Parity
- [x] Task 1: Favorites.
- [x] DE-SCOPED: Task 2 (Progress/Milestones).
- [x] DE-SCOPED: Task 3 (Calendar).
- [ ] Task 4: Material AI section.
- [ ] Task 5: Query keys + invalidate rules for new domains.

Sprint 2 - Production standards
- [ ] Task 1: lifecycle integration (`focusManager`/`onlineManager`).
- [ ] Task 2: cache policy hardening.
- [ ] Task 3: guardrail-driven file splitting.
- [ ] Task 4: UX hardening.
- [ ] Task 5: quality gates (e2e + telemetry + release checklist).

**Acceptance gates mirrored from kickoff:**
- [ ] Sprint 1 complete when remaining in-scope parity tasks are implemented and visible without manual `useEffect` fetch patterns.
- [ ] Sprint 2 complete when lifecycle/offline stability and smoke quality gates pass, and docs are fully synced.

**Backlog status update (Session 162 list):**
- [x] Better API error handling end-to-end.
- [x] Type safety hardening (`any`/route casts removed in mobile app).
- [ ] Offline caching with React Query + AsyncStorage persistence.
  - Note: API-level AsyncStorage caching is now implemented; React Query migration remains optional next upgrade step.
- [x] Move/standardize logout placement in Profile tab.
- [ ] Realtime inline form validation (login/register/create flows).
- [ ] Centralize `MATERIAL_TYPES` usage everywhere.
- [ ] Extract and apply shared `COLORS` constants.
- [ ] Accessibility labels full sweep across all interactive controls.

### Session 164 (Realtime inline form validation)

**What we changed:**
- Added shared validation helpers in `apps/mobile/lib/validation.ts`:
  - `validateRequired`
  - `validateEmail`
  - `validateMinLength`
- Wired realtime inline validation in mobile auth/create forms:
  - `apps/mobile/app/login.tsx`
    - email + password field validation shown inline after touch/blur
    - submit now marks fields touched and blocks request until valid
    - API error banner clears while user edits
  - `apps/mobile/app/register.tsx`
    - name + email + password validation shown inline
    - password length validation moved to realtime field feedback
    - submit marks all fields touched and only proceeds when valid
    - API error banner clears while user edits
  - `apps/mobile/app/create-course.tsx`
    - course title required validation shown inline in realtime
    - submit marks title as touched and blocks invalid request
    - API error banner clears while user edits

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Backlog status update (Session 162 list):**
- [x] Realtime inline form validation (login/register/create flows).

### Session 165 (Centralized MATERIAL_TYPES)

**What we changed:**
- Consolidated material type definitions into one source of truth in `apps/mobile/lib/material-utils.ts`:
  - `MaterialType` union (`note | link | file | video`)
  - `MATERIAL_TYPE_CONFIG`
  - `MATERIAL_TYPE_OPTIONS`
  - `DEFAULT_MATERIAL_TYPE`
  - `normalizeMaterialType`
  - `isUrlMaterialType`
- Removed duplicated local `MATERIAL_TYPES` arrays from:
  - `apps/mobile/app/module/[id]/add-material.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
- Updated screens/components to consume shared material type config/options:
  - `apps/mobile/app/module/[id]/add-material.tsx`
  - `apps/mobile/app/material/[id]/edit.tsx`
  - `apps/mobile/components/type-filter-chips.tsx`
  - `apps/mobile/app/module/[id]/index.tsx` (typed filter state with `MaterialType | null`)
- Stabilized icon values in config using Unicode escapes (encoding-safe across environments).

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Backlog status update (Session 162 list):**
- [x] Centralize `MATERIAL_TYPES` usage everywhere (single source of truth).

### Session 166 (Action button layout + colors/accessibility pass)

**What we changed first (requested before next tasks):**
- Moved `Edit/Delete` actions to stable bottom-right placement in container cards to avoid overlap with titles/content:
  - `apps/mobile/components/entity-actions.tsx` (right-aligned action row)
  - `apps/mobile/components/material-card.tsx` (dedicated footer + right-aligned actions)
  - `apps/mobile/components/module-list-card.tsx` (footer actions anchored bottom-right)
  - `apps/mobile/app/(tabs)/index.tsx` (course card action area separated with top border)

**Then continued with colors + accessibility improvements:**
- Added shared mobile color tokens:
  - `apps/mobile/lib/colors.ts` (`COLORS`, `GRADIENTS`)
- Wired shared color constants into core shell/shared components:
  - `apps/mobile/app/_layout.tsx`
  - `apps/mobile/app/(tabs)/_layout.tsx`
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/components/entity-actions.tsx`
  - `apps/mobile/components/material-card.tsx`
  - `apps/mobile/components/module-list-card.tsx`
  - `apps/mobile/components/search-bar.tsx`
  - `apps/mobile/components/type-filter-chips.tsx`
  - `apps/mobile/components/confirm-modal.tsx`
- Added/expanded accessibility labels on key interactive controls across major flows:
  - Course cards (`open/edit/delete`), FAB, retry buttons
  - Profile action buttons
  - Course/module/material page primary actions
  - Add/edit form primary + cancel buttons
  - Material type selectors and filter chips
  - Search clear button
  - Confirm modal buttons

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Backlog status update (Session 162 list):**
- [ ] Extract and apply shared `COLORS` constants.
  - Note: implemented in app shell + key shared components and major screens; wider replacement can continue file-by-file.
- [ ] Accessibility labels full sweep across all interactive controls.
  - Note: major navigation/actions/forms are covered; remaining edge controls can be finished in a final sweep.

### Session 167 (Mobile tab icon regression fix)

**Issue reported:**
- Mobile bottom-tab icons for `Courses` and `Profile` rendered incorrectly (emoji/text fallback became visually broken on some devices).

**What we changed:**
- Replaced emoji-based tab icon rendering with stable vector icons (`AntDesign`) in:
  - `apps/mobile/app/(tabs)/_layout.tsx`
- Updated tab icon component to use:
  - `book` icon for `Courses`
  - `user` icon for `Profile`
- Kept existing active/inactive visual states and color tokens from shared `COLORS`.

**Why this fixes it:**
- Emoji glyph rendering is device/font dependent; `@expo/vector-icons` provides consistent cross-device icon rendering.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 168 (Finish remaining colors + accessibility sweep)

**What we changed:**
- Completed mobile color token rollout with shared constants in `apps/mobile/lib/colors.ts`:
  - Added missing shared tokens (surface/input states, semantic success/info/link/warning tones, shadow, etc.).
  - Replaced remaining hardcoded brand colors and screen-level hex literals across mobile screens/components.
- Updated major mobile screens/forms/details to consume `COLORS`/`GRADIENTS`:
  - `app/create-course.tsx`
  - `app/course/[id]/index.tsx`
  - `app/course/[id]/edit.tsx`
  - `app/course/[id]/add-module.tsx`
  - `app/module/[id]/index.tsx`
  - `app/module/[id]/edit.tsx`
  - `app/module/[id]/add-material.tsx`
  - `app/material/[id].tsx`
  - `app/material/[id]/edit.tsx`
  - `app/login.tsx`
  - `app/register.tsx`
  - `app/(tabs)/profile.tsx`
- Updated shared components/helpers for color consistency and accessibility:
  - `components/auth/GoogleSignInButton.tsx` (shared color tokens + explicit `accessibilityLabel`)
  - `components/branded-spinner.tsx`
  - `components/confirm-modal.tsx`
  - `components/empty-state.tsx`
  - `lib/toast-context.tsx` (shared token colors + dismiss accessibility label)
  - `lib/material-utils.ts` (material visual config now consumes shared color tokens)
- Fixed mobile auth UI text glyph issues from encoding fallback by replacing with stable Unicode-safe values in auth screens.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass
- `rg --line-number \"#4d33c4|#2e1d7a|#7c5ce7\" apps/mobile` -> only `lib/colors.ts` (expected source of truth)
- `rg --line-number \"#[0-9A-Fa-f]{3,8}\" apps/mobile` -> only `lib/colors.ts` (all other mobile literals removed)

**Backlog status update (Session 162 list):**
- [x] Extract and apply shared `COLORS` constants.
- [x] Accessibility labels full sweep across interactive controls in mobile flows/components.
### Session 169 (Mobile React Query migration + persisted cache)

**What we changed:**
- Added React Query infrastructure for mobile:
  - `apps/mobile/lib/query-client.ts` with shared `QueryClient` defaults and AsyncStorage persister.
  - `apps/mobile/lib/query-keys.ts` with normalized query keys and invalidate helpers.
  - Wired `PersistQueryClientProvider` in `apps/mobile/app/_layout.tsx`.
- Hardened auth lifecycle for persisted query cache safety:
  - `apps/mobile/lib/auth-context.tsx` now clears React Query cache on invalid token, login/register/google-login, and logout.
- Migrated core mobile data screens from manual fetch to `useQuery/useMutation`:
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
  - `apps/mobile/app/course/[id]/index.tsx`
  - `apps/mobile/app/module/[id]/index.tsx`
  - `apps/mobile/app/material/[id].tsx`
- Added optimistic updates and invalidation for delete/edit/create flows:
  - Optimistic delete for courses/modules/materials in list/detail screens.
  - Invalidation wired in create/edit forms:
    - `app/create-course.tsx`
    - `app/course/[id]/edit.tsx`
    - `app/course/[id]/add-module.tsx`
    - `app/module/[id]/edit.tsx`
    - `app/module/[id]/add-material.tsx`
    - `app/material/[id]/edit.tsx`
- Kept `apiFetch` as the request layer so existing API cache + error behavior remains the same and is now complemented by React Query state/persistence.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 170 (Docs sync: mobile React Query + README refresh)

**What we changed:**
- Updated `README.md` to reflect current mobile implementation state after React Query migration:
  - Mobile badge/phase/stack rows now mention persisted React Query cache.
  - Replaced outdated "3 screens" section with current mobile route/screen flows.
  - Added a dedicated "Mobile data layer" section (React Query + AsyncStorage persistence + query-key invalidation + optimistic updates).
  - Updated "On Mobile" demo walkthrough with current CRUD/module/material/profile flow.
  - Added install note for npm/arborist workspace bug and documented the `apps/mobile` install workaround.
  - Updated USB run section to highlight `npm run dev:mobile:usb` helper script.
- Added this session note to `docs/dev-log.md`.

**Verification:**
- Documentation-only update (no runtime code changes in this session).

### Session 171 (Mobile Favorites parity: tab + pin/unpin)

**What we changed:**
- Implemented mobile Favorites domain wiring:
  - Added `FavoriteItem` mobile shared type in `apps/mobile/lib/studyhub-types.ts`.
  - Added `apps/mobile/lib/favorites.ts` with favorites API helpers and optimistic list helpers.
  - Extended React Query key map with `queryKeys.favorites.lists()` and `invalidateFavoritesList(...)` in `apps/mobile/lib/query-keys.ts`.
- Added a dedicated Favorites tab screen:
  - New route `apps/mobile/app/(tabs)/favorites.tsx`.
  - Reads `/api/favorites` via React Query, supports pull-to-refresh, empty/error states.
  - Includes quick-access actions to open linked `Course`, `Module`, and `Material`.
  - Supports `Unpin` with optimistic UI update and rollback on failure.
- Updated tab navigation to expose Favorites:
  - `apps/mobile/app/(tabs)/_layout.tsx` now includes `Favorites` tab with icon.
- Added pin/unpin on Material details:
  - `apps/mobile/app/material/[id].tsx` now loads favorites list, computes pin state, and toggles with optimistic cache updates.
  - Refetch/invalidation flows now include favorites on focus and after mutation settle.
- Refactored material screen styling for file-size guardrail:
  - Moved style definitions from `app/material/[id].tsx` into `app/material/material-screen.styles.ts`.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 176 (Phase 2 UX hardening: reusable skeleton loading states)

**What we changed:**
- Added reusable animated skeleton primitives:
  - `apps/mobile/components/skeleton/skeleton-block.tsx`
    - `useSkeletonPulse()` shared pulse animation hook
    - `SkeletonBlock` reusable placeholder block used by all loading layouts
- Added screen-specific skeleton layouts wired to the target key flows:
  - Courses: `apps/mobile/components/courses-list/courses-list-skeleton.tsx`
  - Module workspace: `apps/mobile/components/module-workspace/module-workspace-skeleton.tsx`
  - Material detail: `apps/mobile/components/material/material-screen-skeleton.tsx`
  - Favorites tab: `apps/mobile/components/favorites/favorites-skeleton.tsx`
  - Profile tab: `apps/mobile/components/profile-tab/profile-tab-skeleton.tsx`
- Replaced spinner-only initial loading states with skeleton states in:
  - `apps/mobile/components/courses-list/courses-list-screen.tsx`
  - `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
  - `apps/mobile/app/material/[id].tsx`
  - `apps/mobile/app/(tabs)/favorites.tsx`
  - `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
- Kept Phase 1 stabilization behavior intact:
  - No API contract changes
  - No mutation behavior changes
  - React Query lifecycle/cache policy and query-managed `cache: false` reads unchanged
  - Existing timeout/retry tuning and Expo start script workaround unchanged

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Remaining Phase 2 UX tasks:**
- Explicit offline/empty/error state pass across core mobile CRUD + favorites screens
- Haptics for success/destructive actions
- Hardware back behavior consistency in CRUD flows
- Accessibility checks for Dynamic Type and VoiceOver/TalkBack

### Session 177 (Phase 2 UX hardening: explicit offline/empty/error states)

**What we changed:**
- Added reusable request-state building blocks:
  - `apps/mobile/components/request-state.tsx`
  - `apps/mobile/components/network-banner.tsx`
  - `apps/mobile/lib/network.ts` (`useIsOffline` + shared offline-state helper)
- Wired explicit offline/error/empty state handling on key mobile screens:
  - `apps/mobile/components/courses-list/courses-list-screen.tsx`
    - offline-specific error and empty fallbacks
    - offline banner when rendering cached/synced course list
  - `apps/mobile/components/module-workspace/module-workspace-screen.tsx`
    - offline-specific error and empty fallbacks
    - offline banner above materials section
  - `apps/mobile/app/material/[id].tsx`
    - offline-aware error fallback
    - offline banner when rendering synced material content
  - `apps/mobile/app/(tabs)/favorites.tsx`
    - offline-aware error and empty fallbacks
    - offline banner when rendering synced favorites
  - `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
    - offline-aware error fallback
    - offline banner when rendering synced profile data
- Added small style wrappers for offline banners in:
  - `apps/mobile/components/favorites/favorites.styles.ts`
  - `apps/mobile/components/material/material-screen.styles.ts`
  - `apps/mobile/components/module-workspace/module-workspace.styles.ts`
  - `apps/mobile/components/profile-tab/profile-tab.styles.ts`

**Kept intact (as requested):**
- React Query lifecycle behavior
- Query-managed reads with `cache: false` policy
- Existing API contracts
- Existing mutation behavior
- Existing timeout/retry tuning and Expo startup workaround scripts

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Remaining Phase 2 UX tasks:**
- Haptics for success/destructive actions
- Hardware back behavior consistency in CRUD flows
- Accessibility checks for Dynamic Type and VoiceOver/TalkBack

### Session 178 (Phase 2 UX hardening: haptics for success/destructive actions)

**What we changed:**
- Added reusable haptics utility:
  - `apps/mobile/lib/haptics.ts`
  - Behavior:
    - Uses `expo-haptics` when available in the runtime
    - Falls back to built-in vibration patterns if `expo-haptics` is not installed
- Extended toast system to support haptic intent:
  - `apps/mobile/lib/toast-context.tsx`
  - `showToast(...)` now supports optional `haptic` overrides:
    - `default` (type-based success/error/info)
    - `destructive`
    - `none`
- Wired destructive haptic feedback in destructive success paths:
  - `apps/mobile/components/courses-list/use-courses-list.ts` (`Course deleted`)
  - `apps/mobile/components/module-workspace/module-workspace.mutations.ts` (`Module deleted`, `Material deleted`)
  - `apps/mobile/app/course/[id]/index.tsx` (`Course deleted`, `Module deleted`)
  - `apps/mobile/app/(tabs)/favorites.tsx` (`Removed from favorites`)
  - `apps/mobile/app/material/[id].tsx` (`Material unpinned` as destructive, `Material pinned` as normal success)
- Added destructive confirmation tap feedback in:
  - `apps/mobile/components/confirm-modal.tsx` (when `destructive` confirm is pressed)

**Notes on dependency install:**
- Attempted to install `expo-haptics` in mobile workspace, but install commands were unstable in this environment (timeouts and npm arborist/workspace error).
- Implemented a robust fallback path so haptics still work now without blocking progress.

**Kept intact (as requested):**
- API contracts
- Mutation behavior
- React Query lifecycle integration
- Query-managed reads with `cache: false`
- Existing timeout/retry tuning and Expo startup script workaround

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

**Remaining Phase 2 UX tasks:**
- Hardware back behavior consistency in CRUD flows
- Accessibility checks for Dynamic Type and VoiceOver/TalkBack

### Session 179 (Roadmap update: mobile Settings screen planned)

**What we changed:**
- Added a planned mobile `Settings` feature to roadmap docs so it is tracked before post-Phase-2 implementation.
- Updated `docs/mobile-execution-checklist.md`:
  - Priority order now explicitly includes product polish with Settings before other optional expansion items.
  - Added Phase 3 task for `Settings` in Profile flow (not a separate bottom tab).
  - Defined lean initial scope:
    - theme mode (`system` / `light` / `dark`)
    - haptics toggle
    - app version/about links
    - account actions entry points
  - Added acceptance criterion for persisted basic app preferences in Settings.

**Verification:**
- Docs-only update (no runtime code changes in this session).

### Session 180 (Auth UI branding harmony: logo, mascot, signature title)

**What we changed:**
- Implemented lightweight branding polish on mobile auth entry screens (without changing auth behavior):
  - Added reusable branded header component:
    - `apps/mobile/components/auth/auth-brand-hero.tsx`
    - `apps/mobile/components/auth/auth-brand-hero.styles.ts`
  - Added local branding assets for mobile:
    - `apps/mobile/assets/branding/logo.png`
    - `apps/mobile/assets/branding/mascot.png`
  - Wired branded header into:
    - `apps/mobile/components/login/login-screen.tsx`
    - `apps/mobile/components/register/register-screen.tsx`
- Updated auth header content to align with desktop branding:
  - Signature-style `StudyHub` title with accent color split (`Study`/`Hub`)
  - Logo + mascot shown together in header
  - One-sentence explanation of app purpose:
    - "Your personal learning hub for courses, modules, and study materials in one place."
- Removed obsolete emoji-logo style blocks from:
  - `apps/mobile/components/login/login-screen.styles.ts`
  - `apps/mobile/components/register/register-screen.styles.ts`

**Kept intact:**
- Login/register API contracts and flow
- React Query/cache/lifecycle behavior
- Existing validation, mutations, and navigation behavior

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 193 (Phase 3 quality gate: Sentry telemetry integration)

**What we changed:**
- Implemented mobile telemetry foundation with Sentry:
  - Added centralized telemetry module:
    - `apps/mobile/lib/telemetry.ts`
    - Handles `Sentry.init`, DSN/sample-rate env parsing, breadcrumb auth-header scrubbing, user scope updates, and scoped exception capture helpers.
- Wired telemetry into mobile app bootstrap:
  - `apps/mobile/app/_layout.tsx`
    - Initializes telemetry early at module load.
    - Wraps root layout with `Sentry.wrap(...)` for runtime error capture.
- Synced auth lifecycle with telemetry user context:
  - `apps/mobile/lib/auth-context.tsx`
    - Sets/clears Sentry user on session hydrate, login, register, Google login, and logout.
    - Captures unexpected bootstrap auth failures (server/unknown) to telemetry.
- Added server-failure telemetry capture in API layer:
  - `apps/mobile/lib/api.ts`
    - Captures `server`/`unknown` API failures with safe metadata (`method`, `path`, `status`, `code`) before rethrowing.
- Added Sentry build/runtime configuration:
  - `apps/mobile/app.json`
    - Added `@sentry/react-native/expo` plugin.
  - `apps/mobile/metro.config.js`
    - Switched to `getSentryExpoConfig(...)` while preserving monorepo watch/resolver tuning.
  - Added telemetry env placeholders:
    - `apps/mobile/.env.example`
    - `.env.example`

**Docs synced:**
- Updated `docs/mobile-execution-checklist.md`:
  - Marked telemetry quality gate as complete.
  - Added implementation notes and changed next recommended task to release checklist + handoff verification.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 194 (Sentry telemetry validation pass + temporary trigger cleanup)

**What we validated:**
- Confirmed end-to-end telemetry delivery in Sentry by triggering a manual test event.
- Sentry Issues captured the expected event: `SENTRY_TEST_EVENT` (development environment).

**Temporary test wiring (added then removed in same session):**
- Added a dev-only `Sentry test` action in Profile tab to trigger a safe test exception.
- After validation, removed the temporary trigger so mobile UI returned to clean production-ready state.
- Files touched during add/remove cycle:
  - `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
  - `apps/mobile/components/profile-tab/profile-tab.styles.ts`

**Additional stabilization:**
- Resolved Metro module-resolution issue after dependency changes by extending resolver paths for nested React Native internals:
  - `apps/mobile/metro.config.js`
  - Added `apps/mobile/node_modules/react-native/node_modules` in `resolver.nodeModulesPaths`.

**Docs synced:**
- Updated `docs/mobile-execution-checklist.md` telemetry item with explicit validation note and cleanup confirmation.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass

### Session 195 (Docs alignment: AGENTS + README + mobile release handoff sync)

**What we changed:**
- Updated `AGENTS.md` to reflect current project state:
  - Corrected DB table count from 9 -> 10.
  - Updated mobile scope date to `2026-04-10`.
  - Added current mobile quality-gate snapshot (`SMK-01`..`SMK-19` PASS, `SMK-20` BLOCKED, Sentry validated).
  - Extended handoff instructions to include mobile quality docs (`mobile-execution-checklist`, `mobile-smoke-test-matrix`, `mobile-release-checklist`).
- Updated `README.md` for latest mobile progress and handoff docs:
  - Phase 5 roadmap row now includes telemetry validation + release checklist completion.
  - Architecture overview mobile node updated from `3 screens` to `13+ screens`.
  - Added "Mobile quality gates and release readiness" section with current status.
  - Added Sentry mobile telemetry env guidance in Quick Setup.
  - Updated docs tree and troubleshooting references to include:
    - `docs/mobile-execution-checklist.md`
    - `docs/mobile-smoke-test-matrix.md`
    - `docs/mobile-release-checklist.md`
- Synced mobile release/verification docs:
  - Added `docs/mobile-release-checklist.md` (go/no-go handoff checklist).
  - Updated `docs/mobile-execution-checklist.md` to mark release checklist task complete.
  - Updated `docs/mobile-smoke-test-matrix.md` with release-handoff confirmation status and telemetry note.
- Workspace cleanup:
  - Removed accidental tracked empty files from repo root:
    - `0`
    - `studyhub-v2@0.1.0`
    - `java.lang.Thread`

**Verification:**
- Documentation-only session (no runtime code changes).
- Mobile telemetry and type safety were already validated in Session 194.

### Session 196 (Mobile Settings screen in Profile flow + persisted app preferences)

**What we changed:**
- Implemented a dedicated mobile `Settings` screen in Profile flow (without adding a new bottom tab):
  - New route: `apps/mobile/app/settings.tsx`
  - New screen module: `apps/mobile/components/settings/*`
  - Added Profile entry-point button: `apps/mobile/components/profile-tab/profile-tab-screen.tsx`
- Added persisted app preferences layer for initial Settings scope:
  - `apps/mobile/lib/app-preferences.tsx`
  - Persists and hydrates:
    - `themeMode`: `system` / `light` / `dark`
    - `hapticsEnabled`: `true` / `false`
- Wired haptics preference into existing haptics utility:
  - `apps/mobile/lib/haptics.ts`
  - Added preference gate via `setHapticsEnabledPreference(...)` so existing toast/mutation haptics respect user Settings.
- Added Settings initial-scope sections:
  - Theme mode selector (segmented control)
  - Haptics toggle
  - App version + about links
  - Account action entry points:
    - jump to Profile edit mode
    - logout
- Added Profile edit-mode jump handling from Settings entry point:
  - `apps/mobile/app/(tabs)/profile.tsx` now handles `?edit=1` route param and opens profile editor state.
- Registered Settings screen in root stack:
  - `apps/mobile/app/_layout.tsx`

**Kept intact (per guardrails):**
- React Query lifecycle/cache behavior remains unchanged.
- Existing API contracts remain unchanged.
- Existing auth flow remains unchanged.
- No temporary debug buttons were introduced.

**Quality-gate note:**
- `SMK-20` accessibility sanity remains `BLOCKED` (no VoiceOver/TalkBack environment available in this session).

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Session 197 (Mobile dark/light mode rollout + SMK-20 pass sync)

**What we changed:**
- Completed real mobile theme-mode behavior for existing color-token based UI:
  - Refactored `apps/mobile/lib/colors.ts` to support:
    - `ThemeMode` (`system` / `light` / `dark`)
    - light + dark palettes
    - resolved palette bootstrap at app start
  - Added synchronous theme persistence key (`studyhub_theme_mode_v1`) using `expo-secure-store` sync API so palette can be selected before style modules are evaluated.
- Extended settings theme behavior to apply immediately:
  - `apps/mobile/components/settings/use-settings-screen.ts`
  - On theme change:
    - persist mode
    - trigger app reload (`expo-updates` with `DevSettings` fallback) so all static StyleSheet modules pick up the new palette.
- Added reload helper:
  - `apps/mobile/lib/theme-reload.ts`
- Updated app-preferences wiring to keep persisted mode and runtime mode aligned:
  - `apps/mobile/lib/app-preferences.tsx`
  - syncs theme mode to secure storage during hydrate
  - triggers one-time reload if a legacy async-stored mode differs from runtime boot mode
- Typed Settings theme models against shared color theme type:
  - `apps/mobile/components/settings/settings.types.ts`

**Quality-gate/docs sync:**
- Marked `SMK-20` accessibility sanity as `PASS` in:
  - `docs/mobile-smoke-test-matrix.md`
  - `docs/mobile-execution-checklist.md`
  - `docs/mobile-release-checklist.md`
  - `AGENTS.md`

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.

### Session 198 (Live theme switch — no reload)

**Goal:**
- Remove the full app reload triggered on theme change in Settings.
- Implement true reactive light/dark/system theme switching without `reloadAppForThemeChange()`.

**What we changed:**

- Extended `apps/mobile/lib/app-preferences.tsx`:
  - Added `colors: AppColors` to context value (reactive, recomputed on every theme/system change).
  - Exported `useTheme()` hook — returns `{ colors, resolvedTheme }` from context.
  - Exported `useThemedStyles(factory)` hook — memoizes `StyleSheet.create(factory(colors))` per theme; recreates automatically when theme changes.
  - Removed the boot-reload logic (`RUNTIME_BOOT_THEME_MODE` + `reloadAppForThemeChange` on mismatch) — no longer needed since styles are now computed dynamically.

- Converted `apps/mobile/components/settings/settings-screen.styles.ts`:
  - Changed from static `StyleSheet.create({ ...COLORS... })` to `export function makeSettingsStyles(colors: AppColors)` factory.

- Updated `apps/mobile/components/settings/settings-screen.tsx`:
  - Each section now calls `useThemedStyles(makeSettingsStyles)` instead of importing a static `styles` object.
  - `Switch` color props now come from `useTheme()` (inline values, cannot use StyleSheet).
  - Settings screen colors update immediately on theme change — no restart, no reload.

- Updated `apps/mobile/components/settings/use-settings-screen.ts`:
  - Removed `reloadAppForThemeChange` import and call.
  - Removed "Applying theme…" toast.
  - `setThemeMode` now simply calls `preferences.setThemeMode(value)` — context re-renders subscribers instantly.

- Updated `apps/mobile/app/_layout.tsx`:
  - `AuthGate` now calls `useTheme()` to get live `colors`.
  - Stack `screenOptions` (header background, tint, shadow) and `StatusBar` are now driven by live colors.
  - Font-loading fallback still uses static `COLORS` (acceptable — rendered before provider tree is active).

- Fixed `apps/mobile/tsconfig.json`:
  - Removed `.next/types/**/*.ts` include (irrelevant for Expo project, caused slowness).
  - Removed `next` plugin entry from compilerOptions.
  - Changed `incremental: true` → `false` (avoids stale `.tsbuildinfo` hangs).
  - Added explicit `exclude` for `node_modules`, `.expo`, `dist`, `build`, `babel.config.js`, `metro.config.js`.

**Architecture note:**
- `theme-reload.ts` was kept as a stub in Session 198 and removed in Session 199 cleanup.
- Static `StyleSheet.create()` files (courses, materials, profile, etc.) still capture boot-time colors. They are correct on first render and do not hot-swap — acceptable for this scope. Full migration of all style files can follow incrementally using `makeXxxStyles(colors)` factory pattern introduced here.
- `system` mode reactivity is already covered by `useColorScheme()` in `AppPreferencesProvider` — no additional work needed.

**Kept intact (per guardrails):**
- React Query lifecycle/cache behavior unchanged.
- Existing API contracts unchanged.
- Existing auth flow unchanged.
- Haptics preference unchanged.
- SMK-20 remains PASS.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` — run locally in IDE terminal (background runner unavailable this session due to stuck cmd.exe environment).

### Session 199 (Theme reload helper cleanup)

**Goal:**
- Remove dead code left after Session 198 live theme switch rollout.

**What we changed:**
- Deleted unused file:
  - `apps/mobile/lib/theme-reload.ts`
- Confirmed there are no active code references to `reloadAppForThemeChange` in `apps/mobile`.

**Verification:**
- `npm.cmd run --workspace @studyhub/mobile typecheck` -> pass.
