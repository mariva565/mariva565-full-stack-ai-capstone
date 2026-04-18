# StudyHub v2 — Audit Fix Plan

> **Създаден:** 2026-04-18 (Opus одит)
> **Изпълнител:** Sonnet (или текущ агент)
> **Инструкция:** Отваряй нов чат, кажи:
> "Прочети `docs/audit-fix-plan.md` и изпълни следващата неотметната задача. Commit-ни заедно с devlog update."

---

## Правила за изпълнение

- Всяка задача е самостоятелна — може да се изпълни в отделен чат
- Не бъндлвай задачи от различни групи в един commit
- Задачите в една група МОГАТ да се commit-нат заедно
- Спазвай max 300 реда / файл, Tailwind-only, dark mode
- Винаги: `tsc --noEmit` преди commit
- Винаги: обнови `docs/dev-log.md` заедно с кода

---

## Група A — Database Integrity (1 commit)

**Commit message:** `fix(db): add missing onDelete strategies and indexes to schema`

### A1. Добави onDelete на 7 FK-та

Файл: `drizzle/schema.ts`

- [x] **Линия 34** — `courses.createdBy`: добави `{ onDelete: "cascade" }`
  ```typescript
  .references(() => users.id, { onDelete: "cascade" })
  ```
- [x] **Линия 51** — `modules.createdBy`: добави `{ onDelete: "cascade" }`
- [x] **Линия 69** — `materials.createdBy`: добави `{ onDelete: "cascade" }`
- [x] **Линия 150** — `activityLogs.userId`: добави `{ onDelete: "set null" }`
  - ВНИМАНИЕ: за set null трябва да махнеш `.notNull()` от тази колона (линия 148-149)
  - Activity logs трябва да оцелеят при delete на user (audit trail)
- [x] **Линия 179** — `posts.authorId`: добави `{ onDelete: "cascade" }`
- [x] **Линия 195** — `comments.authorId`: добави `{ onDelete: "cascade" }`
- [x] **Линия 266** — `messages.senderId`: добави `{ onDelete: "cascade" }`

### A2. Добави индекси на често филтрирани FK колони

Файл: `drizzle/schema.ts`

- [x] `courses` — добави index на `createdBy`
- [x] `posts` — добави index на `authorId` и `courseId`
- [x] `comments` — добави index на `authorId`

### A3. Генерирай migration

- [x] Изпълни `npx drizzle-kit generate` от root
- [x] Провери генерирания SQL файл в `drizzle/migrations/`
- [x] Push-ни към Neon: `npx drizzle-kit push`

---

## Група B — Security Headers (1 commit)

**Commit message:** `feat(security): add security headers to Next.js config`

Файл: `apps/web/next.config.ts`

- [x] Добави `headers()` конфигурация:
  ```typescript
  import type { NextConfig } from "next";
  import path from "path";

  const nextConfig: NextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: path.join(__dirname, "../../"),
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "SAMEORIGIN" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-DNS-Prefetch-Control", value: "on" },
            { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          ],
        },
      ];
    },
  };

  export default nextConfig;
  ```

---

## Група C — Split монолитни файлове (по 1 commit на файл)

### C1. Split `chat-window.tsx` (339 → ~3 файла)

**Commit message:** `refactor: split chat-window into smaller components`

Файл: `apps/web/components/messages/chat-window.tsx`

- [x] Извлечи `ChatMessageBubble` компонент → `apps/web/components/messages/chat-message-bubble.tsx`
  - Props: `message: Message`, `isOwn: boolean`, `formatTime: (date: string) => string`
  - Включва аватар, балонче, timestamp
- [x] Извлечи `ChatInput` компонент → `apps/web/components/messages/chat-input.tsx`
  - Props: `value: string`, `onChange`, `onSend`, `sending: boolean`
  - Включва textarea + send бутон
- [x] Извлечи `ChatHeader` компонент → `apps/web/components/messages/chat-header.tsx`
  - Props: `otherUser: OtherUser | null`
  - Включва back бутон + аватар + име
- [x] Основният `ChatWindow` остава orchestrator: state + Pusher + layout
- [x] Всеки файл < 150 реда

### C2. Split `community-feed.tsx` (344 → ~3 файла)

**Commit message:** `refactor: split community-feed into smaller components`

Файл: `apps/web/components/community/community-feed.tsx`

- [x] Извлечи `PostCard` компонент → `apps/web/components/community/post-card.tsx`
  - Props: `post: Post`, `currentUserId: number`, `onLike: (id: number) => void`
- [x] Типове reuse-нати от вече съществуващия `./post-types` (добавени `commentCount?`, `updatedAt?`)
  - `Q_STATUS` и `stripHtml` остават в `post-card.tsx` (само там се ползват)
- [x] Основният `CommunityFeed` остава: state + fetch + filters + layout
- [x] Всеки файл < 200 реда

### C3. Split `post-details.tsx` (340 → ~2 файла)

**Commit message:** `refactor: split post-details into smaller components`

Файл: `apps/web/components/community/post-details.tsx`

- [x] Извлечи `PostHeader` → `apps/web/components/community/post-header.tsx`
  - Автор, timestamp, type badge, pinned badge, edit/delete бутони, like/bookmark
- [x] Извлечи `PostCommentForm` → `apps/web/components/community/post-comment-form.tsx`
  - Textarea + submit бутон за нов коментар
- [x] `CommentItem` вече е отделен файл — добре
- [x] Основният `PostDetails` остава: state + fetch + layout
- [x] Всеки файл < 200 реда

### C4. Split `milestone-timeline-item.tsx` (340 → ~2 файла) — ПРОПУСНАТА

**Commit message:** `refactor: split milestone-timeline-item`

Файл: `apps/web/components/progress/milestone-timeline-item.tsx`

> **ПРОПУСНАТА** — рискът надвишава ползата:
> - Файлът е само 40 реда над лимита (340)
> - Helpers вече са в `milestone-timeline-item-helpers.ts`
> - Collapsed card и expanded panel споделят AnimatePresence context, `arePropsEqual` memo, и 20+ state/callback props — split би изисквал prop-drilling на целия Props interface към 2 sub-компонента
> - Сложността нараства, читаемостта не се подобрява

- [x] Оценено — пропускане потвърдено

### C5. Split `use-web-messages-notifications.ts` (313 → 2 файла)

**Commit message:** `refactor: split web messages notification hook`

Файл: `apps/web/components/messages/use-web-messages-notifications.ts`

> Бележка: файлът е polling-базиран (няма Pusher). Извлечена е browser notification логиката.

- [x] Извлечи Browser Notification логиката → `use-browser-notifications.ts`
  - Permission state, requestNotificationPermission(), showNativeNotification()
  - Бонус: коментарните нотификации също минават през showNativeNotification (премахнато inline дублиране)
- [x] Основният hook остава composition: polling + unread detection + toast
- [x] Всеки файл < 200 реда

### C6. Split `material-form-screen.tsx` (395 → ~2 файла)

**Commit message:** `refactor: split mobile material-form-screen`

Файл: `apps/mobile/components/material-form/material-form-screen.tsx`

- [x] `MaterialInputField` → `material-form-input.tsx` (включва InputFieldProps тип)
- [x] `MaterialTypeSelector` → `material-form-type-picker.tsx`
- [x] `FocusedField` тип добавен в `material-form.types.ts` (споделен)
- [x] Основният `MaterialFormScreen` остава: state + submit + layout (~205 реда)
- [x] Всеки файл < 200 реда

---

## Група D — TypeScript `any` → proper types (1 commit)

**Commit message:** `fix(types): replace any with proper TypeScript types`

- [x] `apps/web/components/auth/auth-google-sign-in.tsx:39`
  - `catch (err: any)` → `catch (err: unknown)`, после `err instanceof Error ? err.message : "..."`
- [x] `apps/mobile/components/community/post-card.tsx:12-13`
  - `post: any` → локален `PostCardData` тип с всички използвани полета
  - `styles: any` → `Record<string, ViewStyle | TextStyle>`
- [x] `apps/mobile/components/material/ai-tools/use-ai-tools.ts:31`
  - `data: any` → `apiFetch<ToolResult>` (типът вече е импортиран)
- [x] `apps/web/app/api/admin/posts/route.ts:73`
  - `let scopeCondition: any` → `let scopeCondition: SQL | undefined`
- [x] `apps/web/components/community/post-details.tsx:17`
  - вече има `// eslint-disable-next-line @typescript-eslint/no-explicit-any` ✅

---

## Група E — Inline styles cleanup (1 commit)

**Commit message:** `refactor: replace inline styles with Tailwind classes`

Файл по файл — замени `style={{...}}` с Tailwind arbitrary values където е възможно.

**Приоритетни файлове (по-лесните замени):**

- [x] `apps/web/components/layout/Navbar.tsx` — 2 inline styles
- [x] `apps/web/components/not-found/not-found-client.tsx` — 2 inline styles
- [x] `apps/web/components/forbidden/forbidden-client.tsx` — 2 inline styles
- [x] `apps/web/components/home/cta-banner.tsx` — 2 inline styles
- [x] `apps/web/components/how-it-works/how-it-works-hero.tsx` — 2 inline styles
- [x] `apps/web/components/progress/progress-bar.tsx` — runtime `width: ${pct}%` → оставен като inline style ✅
- [x] `apps/web/components/ui/add-material-fab.tsx` — 1 inline style

**Допустими изключения (runtime-динамични):**
- `progress-bar.tsx` — динамичен `width` процент → OK да остане
- `hero-3d.tsx` — Three.js canvas → OK
- `tilt.tsx`, `magnetic.tsx`, `cursor-glow.tsx` — runtime transform стойности от mouse position → OK
- `how-it-works-gallery.tsx` — transform за carousel → OK

**Правило:** ако стойността идва от JavaScript variable (mouse position, scroll offset, calculated percentage), inline style е приемлив. Ако е фиксирана стойност — замени с Tailwind.

---

## Група F — Dependency cleanup (1 commit)

**Commit message:** `chore: align dependency versions across monorepo`

- [x] Уеднакви `drizzle-kit` — махни от `apps/mobile/package.json` (mobile не ползва drizzle-kit директно)
  - Root и web да използват една и съща версия (предпочитаме по-новата `^0.18.1`)
- [x] Уеднакви TypeScript — всички на `~5.8.3` или всички на `~5.9.2`
  - Препоръка: `~5.8.3` (по-стабилна, по-малко рискове)
- [x] Премести `framer-motion` и `three` от root `package.json` в `apps/web/package.json` devDependencies → dependencies
  - Провери дали web вече ги има — ако да, просто махни от root
- [x] `npm install` от root за regenerate lock file
- [x] Провери build: `tsc --noEmit` минава чисто ✅

---

## Група G — Console cleanup в API routes ~~(1 commit, optional)~~

> **ПРОПУСНАТА** — `console.error` остава. Вариант Б (logger без Sentry) само заглушава грешките в production без да ги логва — по-лошо от сегашното. Sentry за web (`@sentry/nextjs`) не е в scope за capstone дедлайна.

**Commit message:** `refactor: replace console.error with structured error handling in API routes`

Това е optional за capstone — console.error в catch блокове не е критично.
Ако се прави:

- [ ] Не просто трий console.error — те помагат при debug
- [ ] Вариант 1: остави ги (приемливо за capstone)
- [ ] Вариант 2: създай прост logger wrapper `lib/logger.ts`:
  ```typescript
  export const logger = {
    error: (msg: string, err?: unknown) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(msg, err);
      }
      // В production: изпращай към Sentry или подобен
    },
  };
  ```
  После замени `console.error` с `logger.error` в API routes.

---

## Приоритет на изпълнение

| Ред | Група | Описание | Усилие | Важност |
|---|---|---|---|---|
| 1 | **A** | DB integrity — onDelete + indexes | ~30 min | Критично |
| 2 | **B** | Security headers | ~10 min | Критично |
| 3 | **C1-C6** | Split монолитни файлове | ~2-3 часа | Важно |
| 4 | **D** | TypeScript any → proper types | ~20 min | Важно |
| 5 | **E** | Inline styles → Tailwind | ~30 min | Средно |
| 6 | **F** | Dependency alignment | ~15 min | Ниско |
| 7 | **G** | Console cleanup | ~20 min | Optional |

---

## Verification checklist (след всичко)

- [ ] `npx tsc --noEmit` минава чисто (от `apps/web`)
- [ ] `npm run dev:web` стартира без грешки
- [ ] Няма файл > 300 реда (без chat-widget.tsx и hero-3d.tsx)
- [ ] Grep за `style={{` показва само runtime-динамични стойности
- [ ] Grep за `: any` показва 0 резултата (без hero-3d.tsx Three.js обекти)
- [ ] Schema е push-ната към Neon
- [ ] `docs/dev-log.md` е обновен с всички промени
