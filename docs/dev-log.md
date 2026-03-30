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
