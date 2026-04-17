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

- [ ] Извлечи `ChatMessageBubble` компонент → `apps/web/components/messages/chat-message-bubble.tsx`
  - Props: `message: Message`, `isOwn: boolean`, `formatTime: (date: string) => string`
  - Включва аватар, балонче, timestamp
- [ ] Извлечи `ChatInput` компонент → `apps/web/components/messages/chat-input.tsx`
  - Props: `value: string`, `onChange`, `onSend`, `sending: boolean`
  - Включва textarea + send бутон
- [ ] Извлечи `ChatHeader` компонент → `apps/web/components/messages/chat-header.tsx`
  - Props: `otherUser: OtherUser | null`
  - Включва back бутон + аватар + име
- [ ] Основният `ChatWindow` остава orchestrator: state + Pusher + layout
- [ ] Всеки файл < 150 реда

### C2. Split `community-feed.tsx` (344 → ~3 файла)

**Commit message:** `refactor: split community-feed into smaller components`

Файл: `apps/web/components/community/community-feed.tsx`

- [ ] Извлечи `PostCard` компонент → `apps/web/components/community/post-card.tsx`
  - Вече е дефиниран като функция на линия 73 — просто го премести в отделен файл
  - Props: `post: Post`, `currentUserId: number`, `onLike: (id: number) => void`
- [ ] Извлечи типове и константи → `apps/web/components/community/feed-types.ts`
  - `Post` type, `TYPE_LABELS`, `Q_STATUS`, `timeAgo()`, `stripHtml()`
  - ВНИМАНИЕ: `post-details.tsx` вече import-ва от `./post-types` — провери дали вече съществуват споделени типове и ги reuse-ни
- [ ] Основният `CommunityFeed` остава: state + fetch + filters + layout
- [ ] Всеки файл < 200 реда

### C3. Split `post-details.tsx` (340 → ~2 файла)

**Commit message:** `refactor: split post-details into smaller components`

Файл: `apps/web/components/community/post-details.tsx`

- [ ] Извлечи `PostHeader` → `apps/web/components/community/post-header.tsx`
  - Автор, timestamp, type badge, pinned badge, edit/delete бутони
- [ ] Извлечи `PostCommentForm` → `apps/web/components/community/post-comment-form.tsx`
  - Textarea + submit бутон за нов коментар
- [ ] `CommentItem` вече е отделен файл — добре
- [ ] Основният `PostDetails` остава: state + fetch + layout
- [ ] Всеки файл < 200 реда

### C4. Split `milestone-timeline-item.tsx` (340 → ~2 файла)

**Commit message:** `refactor: split milestone-timeline-item`

Файл: `apps/web/components/progress/milestone-timeline-item.tsx`

- [ ] Проверка: файлът вече import-ва helpers от `./milestone-timeline-item-helpers` — добър знак
- [ ] Извлечи collapsed view (кликнат timeline елемент) → `milestone-timeline-card.tsx`
  - Status circle + title + deadline pill + meta
- [ ] Извлечи expanded panel (когато е разгънат) → `milestone-timeline-expanded.tsx`
  - Description + action бутони (edit/delete/move/status)
- [ ] Основният компонент остава orchestrator за AnimatePresence
- [ ] Всеки файл < 180 реда

### C5. Split `use-web-messages-notifications.ts` (313 → 2 файла)

**Commit message:** `refactor: split web messages notification hook`

Файл: `apps/web/components/messages/use-web-messages-notifications.ts`

- [ ] Извлечи Pusher subscription логиката → `use-messages-pusher.ts`
  - Pusher connect, subscribe, bind events, cleanup
- [ ] Извлечи Browser Notification логиката → `use-browser-notifications.ts`
  - Permission request, showNotification(), click handler
- [ ] Основният hook остава composition: combines двата подхука
- [ ] Всеки файл < 200 реда

### C6. Split `material-form-screen.tsx` (395 → ~2 файла)

**Commit message:** `refactor: split mobile material-form-screen`

Файл: `apps/mobile/components/material-form/material-form-screen.tsx`

- [ ] `InputField` компонент (дефиниран на линия ~22) — вече е вътрешен, премести в `material-form-input.tsx`
- [ ] `TypePicker` секцията → `material-form-type-picker.tsx`
  - Бутоните за material type selection
- [ ] Основният `MaterialFormScreen` остава: state + submit + layout
- [ ] Всеки файл < 200 реда

---

## Група D — TypeScript `any` → proper types (1 commit)

**Commit message:** `fix(types): replace any with proper TypeScript types`

- [ ] `apps/web/components/auth/auth-google-sign-in.tsx:39`
  - `catch (err: any)` → `catch (err: unknown)`, после `err instanceof Error ? err.message : "..."`
- [ ] `apps/mobile/components/community/post-card.tsx:12-13`
  - `post: any` → import и използвай `Post` тип от shared или дефинирай локално
  - `styles: any` → `styles: ReturnType<typeof StyleSheet.create>` или конкретен тип
- [ ] `apps/mobile/components/material/ai-tools/use-ai-tools.ts:31`
  - `data: any` → дефинирай union type `SummaryResult | QuizResult | FlashcardsResult`
- [ ] `apps/web/app/api/admin/posts/route.ts:73`
  - `let scopeCondition: any` → `let scopeCondition: SQL | undefined` (import `SQL` from `drizzle-orm`)
- [ ] `apps/web/components/community/post-details.tsx:17`
  - `require("dompurify") as any` — добави `// eslint-disable` коментар или типизирай с `typeof import("dompurify")`

---

## Група E — Inline styles cleanup (1 commit)

**Commit message:** `refactor: replace inline styles with Tailwind classes`

Файл по файл — замени `style={{...}}` с Tailwind arbitrary values където е възможно.

**Приоритетни файлове (по-лесните замени):**

- [ ] `apps/web/components/layout/Navbar.tsx` — 2 inline styles
- [ ] `apps/web/components/not-found/not-found-client.tsx` — 2 inline styles
- [ ] `apps/web/components/forbidden/forbidden-client.tsx` — 2 inline styles
- [ ] `apps/web/components/home/cta-banner.tsx` — 2 inline styles
- [ ] `apps/web/components/how-it-works/how-it-works-hero.tsx` — 2 inline styles
- [ ] `apps/web/components/progress/progress-bar.tsx` — 1 inline style (вероятно динамичен width — `style={{ width: \`${pct}%\` }}` → `style={{ width }}` е OK за runtime стойности)
- [ ] `apps/web/components/ui/add-material-fab.tsx` — 1 inline style

**Допустими изключения (runtime-динамични):**
- `progress-bar.tsx` — динамичен `width` процент → OK да остане
- `hero-3d.tsx` — Three.js canvas → OK
- `tilt.tsx`, `magnetic.tsx`, `cursor-glow.tsx` — runtime transform стойности от mouse position → OK
- `how-it-works-gallery.tsx` — transform за carousel → OK

**Правило:** ако стойността идва от JavaScript variable (mouse position, scroll offset, calculated percentage), inline style е приемлив. Ако е фиксирана стойност — замени с Tailwind.

---

## Група F — Dependency cleanup (1 commit)

**Commit message:** `chore: align dependency versions across monorepo`

- [ ] Уеднакви `drizzle-kit` — махни от `apps/mobile/package.json` (mobile не ползва drizzle-kit директно)
  - Root и web да използват една и съща версия (предпочитаме по-новата `^0.18.1`)
- [ ] Уеднакви TypeScript — всички на `~5.8.3` или всички на `~5.9.2`
  - Препоръка: `~5.8.3` (по-стабилна, по-малко рискове)
- [ ] Премести `framer-motion` и `three` от root `package.json` в `apps/web/package.json` devDependencies → dependencies
  - Провери дали web вече ги има — ако да, просто махни от root
- [ ] `npm install` от root за regenerate lock file
- [ ] Провери build: `npm run dev:web` стартира без грешки

---

## Група G — Console cleanup в API routes (1 commit, optional)

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
