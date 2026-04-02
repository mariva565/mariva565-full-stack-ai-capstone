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
