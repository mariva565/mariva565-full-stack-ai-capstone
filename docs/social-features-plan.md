# StudyHub v2 — Social Features Plan

> **Дата:** 2026-04-05
> **Статус:** Идея / чакаща имплементация
> **Приоритет:** След основните фази (mobile, deploy, polish)

---

## Мотивация

StudyHub е личен бележник за учене. Но реалното учене не е само бележки —
включва и **общуване**: дискусии с колеги, въпроси към ментори, споделяне на ресурси.

Пример от реалния свят (SoftUni):
- Учебен план + бележки → **вече го имаме** (courses → modules → materials)
- ФБ група на курса → **Community Board**
- "Консултирай се с ментор" → **Ask Mentor**

Целта: всичко на едно място, вместо 3 отделни платформи.

---

## Обзор на функциите

| Функция | Сложност | Приоритет |
|---|---|---|
| Роли: user / mentor / admin | Ниска | ⭐ Основа |
| Course Membership (кой е в кой курс) | Ниска | ⭐ Основа |
| Community Board (posts + comments + likes) | Средна | ⭐ Първа |
| Ask Mentor (CRUD-based Q&A) | Ниска | ⭐ Втора |
| Post Moderation (admin approve/hide) | Ниска | ⭐ С Board-а |
| Real-time messaging (Pusher) | Висока | 🔮 Опция |
| Real-time messaging (Socket.io) | Много висока | 🔮 Опция |

---

## Фаза S0: Роли + Course Membership

**Концепция:** Три роли (user, mentor, admin) + таблица за membership в курсове.
Менторът е обвързан с конкретни курсове — вижда и отговаря само на въпроси от своите курсове.

### Промяна в users.role

```
Сега:    'user' | 'admin'
Ново:    'user' | 'mentor' | 'admin'
```

### Какво може всяка роля

| Действие | user | mentor | admin |
|---|---|---|---|
| Пише posts / коментари / лайкове | ✅ | ✅ | ✅ |
| Вижда Mentor Inbox | ❌ | ✅ (само своите курсове) | ✅ (всички) |
| Отговаря на mentor въпроси | ❌ | ✅ (само своите курсове) | ✅ |
| Модерира posts (approve/hide) | ❌ | ❌ | ✅ |
| Manage users / roles | ❌ | ❌ | ✅ |
| Manage курсове на други | ❌ | ❌ | ✅ |

### Нова таблица: course_members

```sql
CREATE TABLE course_members (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL DEFAULT 'student',
    -- 'student' | 'mentor'
  joined_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);
```

### Drizzle schema

```typescript
export const courseMembers = pgTable("course_members", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("course_members_course_user_idx").on(table.courseId, table.userId),
]);
```

### API Routes

```
GET    /api/courses/:id/members         — списък members на курс
POST   /api/courses/:id/members         — добави member (admin или course mentor)
DELETE /api/courses/:id/members/:userId  — премахни member
PUT    /api/courses/:id/members/:userId  — смени роля (student ↔ mentor)
```

### Auth helpers (нови)

```typescript
requireMentor()          — проверява users.role === 'mentor' || 'admin'
requireCourseMentor(id)  — проверява дали user е mentor за конкретен курс
```

### Как се връзва с останалите фази

```
S0 (роли + membership)
 │
 ├── S1 (Community Board)
 │    └── posts имат course_id → филтрираш по курс
 │         └── course mentors виждат само posts от своите курсове
 │
 ├── S2 (Ask Mentor)
 │    └── mentor въпроси отиват към mentors на съответния курс
 │
 └── S3 (Real-time messaging)
      └── user може да пише на mentor от своя курс
```

### Пример

1. Admin създава курс "JavaScript Basics"
2. Admin добавя Иван като mentor на курса
3. Мария се записва (или admin я добавя) като student
4. Мария публикува въпрос в Community Board с course = "JavaScript Basics"
5. Иван вижда въпроса в Mentor Inbox (защото е mentor на този курс)
6. Петър (mentor на "Python") НЕ вижда въпроса
7. Admin вижда всичко

### Приблизителен effort: 1-2 дни

---

## Фаза S1: Community Board

**Концепция:** Потребителите публикуват въпроси, бележки, полезни линкове.
Другите коментират и лайкват. Админът модерира.

### Нови таблици

```sql
-- posts
CREATE TABLE posts (
  id            SERIAL PRIMARY KEY,
  author_id     INTEGER NOT NULL REFERENCES users(id),
  title         VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  post_type     VARCHAR(20) NOT NULL DEFAULT 'discussion',
    -- 'discussion' | 'question' | 'resource' | 'article'
  status        VARCHAR(20) NOT NULL DEFAULT 'approved',
    -- 'pending' | 'approved' | 'hidden'
  course_id     INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    -- опционално: "За кой курс е този post?"
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- comments
CREATE TABLE comments (
  id            SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id     INTEGER NOT NULL REFERENCES users(id),
  content       TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- post_likes
CREATE TABLE post_likes (
  id            SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- post_bookmarks (запазване на posts — reuse на favorites логиката)
CREATE TABLE post_bookmarks (
  id            SERIAL PRIMARY KEY,
  post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### Drizzle schema (ориентировъчно)

```typescript
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  postType: varchar("post_type", { length: 20 }).notNull().default("discussion"),
  status: varchar("status", { length: 20 }).notNull().default("approved"),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("post_likes_post_user_idx").on(table.postId, table.userId),
]);

export const postBookmarks = pgTable("post_bookmarks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("post_bookmarks_post_user_idx").on(table.postId, table.userId),
]);
```

### API Routes

```
GET    /api/posts              — списък posts (с филтри: type, course, status)
POST   /api/posts              — създай post
GET    /api/posts/:id          — детайли + comments + like count
PUT    /api/posts/:id          — редактирай (само автор)
DELETE /api/posts/:id          — изтрий (автор или admin)

POST   /api/posts/:id/comments — добави коментар
DELETE /api/comments/:id       — изтрий коментар (автор или admin)

POST   /api/posts/:id/like     — toggle like
POST   /api/posts/:id/bookmark — toggle bookmark

GET    /api/admin/posts        — всички posts (за модерация)
PUT    /api/admin/posts/:id    — промени status (approve/hide)
```

### Web екрани

| Екран | Път | Описание |
|---|---|---|
| Community Feed | `/community` | Списък posts, филтри по тип/курс, search |
| Post Details | `/community/:id` | Post + коментари + like/bookmark бутони |
| Create Post | `/community/new` | Форма: title, content, type, course (optional) |
| Edit Post | `/community/:id/edit` | Само за автора |
| Admin: Moderation | `/admin` (нов таб) | Pending posts, approve/hide actions |

### Mobile екрани

| Екран | Описание |
|---|---|
| Community Feed | Списък posts (scroll) |
| Post Details | Post + коментари |
| Create Post | Кратка форма |

### Какво се reuse-ва от съществуващия код

- **Auth** — същият JWT, requireAuth(), requireAdmin()
- **Favorites логика** — post_bookmarks е аналогична на materials favorites
- **Admin panel** — добавяш нов таб "Moderation"
- **Activity logs** — логваш create_post, add_comment, etc.
- **Navbar** — добавяш "Community" линк

### Приблизителен effort: 3-4 дни

---

## Фаза S2: Ask Mentor (CRUD-based Q&A)

**Концепция:** User задава въпрос за конкретен курс. Mentor на този курс вижда
и отговаря. Визуално изглежда като conversation thread, но е обикновен CRUD.

### Как работи

Не е отделна система — **използва Community Board** с филтър:

- User създава post с `post_type: 'question'` и избира `course_id`
- Въпросът получава `question_status: 'open'`
- **Mentor на този курс** (course_members.role = 'mentor') вижда въпроса в Mentor Inbox
- Mentor отговаря с comment
- Mentor или admin сменя status → `answered` → `closed`
- Admin вижда **всички** mentor въпроси, mentor вижда **само своите курсове**

### Допълнения към posts таблицата

```sql
ALTER TABLE posts ADD COLUMN question_status VARCHAR(20);
  -- NULL за не-въпроси, 'open' | 'answered' | 'closed' за въпроси
```

### Допълнителни API Routes

```
GET  /api/posts?type=question&status=open          — Mentor Inbox (филтрира по course membership)
GET  /api/mentor/questions                          — shortcut: въпроси за моите курсове
PUT  /api/posts/:id/answer-status                   — mentor/admin сменя question_status
```

### Web екрани

| Екран | Описание |
|---|---|
| Ask Mentor | Филтриран изглед: само type=question, форма с course picker |
| Mentor Inbox | Mentor вижда въпроси от своите курсове; admin — всички |

### Логика на Mentor Inbox

```
if (user.role === 'admin')
  → покажи всички въпроси
else if (user.role === 'mentor')
  → вземи курсовете от course_members WHERE user_id = me AND role = 'mentor'
  → покажи въпроси WHERE course_id IN (моите курсове)
else
  → 403 Forbidden
```

### Приблизителен effort: 1-2 дни (след S1)

---

## Фаза S3: Real-time Messaging (ОПЦИЯ)

> ⚠️ Това е **nice-to-have**. Правим го само ако всичко останало е ready.

### Вариант A: Pusher (препоръчителен)

**Какво е Pusher:** Cloud WebSocket service. Ти не хостваш нищо —
пращаш event от backend-а, Pusher го deliver-ва на клиентите.

**Free tier:** 200k messages/day, 100 concurrent connections — достатъчно.

#### Нови таблици

```sql
CREATE TABLE conversations (
  id            SERIAL PRIMARY KEY,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_members (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### API Routes

```
GET    /api/conversations              — моите разговори
POST   /api/conversations              — създай разговор (с user)
GET    /api/conversations/:id/messages — history
POST   /api/conversations/:id/messages — изпрати съобщение (+ Pusher trigger)
```

#### Как работи real-time частта

```
1. User A изпраща POST /api/conversations/:id/messages
2. Backend записва в DB
3. Backend вика pusher.trigger('conversation-123', 'new-message', data)
4. User B е subscribed за 'conversation-123' → получава event → UI update
```

#### Нужни пакети

```bash
npm install pusher        # backend (server SDK)
npm install pusher-js     # frontend (client SDK)
```

#### Web екрани

| Екран | Описание |
|---|---|
| Messages | Списък разговори (inbox) |
| Chat | Конкретен разговор, real-time messages |

#### Mobile екрани

| Екран | Описание |
|---|---|
| Messages | Inbox |
| Chat | Real-time conversation |

#### Приблизителен effort: 5-7 дни (web + mobile)

---

### Вариант B: Socket.io (по-сложен)

**Не се препоръчва** за този проект, но за пълнота:

- Трябва отделен Node.js сървър (Next.js API routes не поддържат WebSocket)
- Отделен deploy (не може на Vercel)
- По-сложна auth (трябва JWT verification в socket middleware)
- По-сложно на mobile (socket.io-client за React Native)

#### Приблизителен effort: 8-12 дни

---

## Ред на имплементация

```
Текущи приоритети (първо!):
  ├── Phase 5: Mobile (Expo) .................. 🔴 задължително
  ├── Phase 6: Deploy (Vercel) ................ 🔴 задължително
  ├── Phase 7: Docs ........................... 🔴 задължително
  └── UI Polish ............................... 🟡 важно

Social features (след горните):
  ├── S0: Роли + Course Membership ............ 🟢 1-2 дни
  ├── S1: Community Board ..................... 🟢 3-4 дни
  ├── S2: Ask Mentor .......................... 🟢 1-2 дни
  └── S3: Real-time Messaging ................. 🔮 5-7 дни (ако има време)

Общо social: S0+S1+S2 = ~6-8 дни | S3 = +5-7 дни опция
```

---

## Какво добавя към проекта

### Преди social features
- 9 таблици, 7 web екрана, 2 роли, CRUD + auth + admin

### След S0 + S1 + S2
- **14 таблици** (+course_members, posts, comments, post_likes, post_bookmarks)
- **3 роли** (user, mentor, admin) + course-level roles (student, mentor)
- **10+ web екрана**
- **6+ mobile екрана**
- User-generated content + moderation + mentor Q&A workflow
- Проектът разказва история: "Уча → записвам → питам ментор → обсъждам с колеги"

### След S3 (ако стигнем)
- **17 таблици** (+ conversations, conversation_members, messages)
- Real-time функционалност
- Интеграция с external service (Pusher)

---

## Какво НЕ правим

- ❌ Follow system
- ❌ Notifications (push/email)
- ❌ Stories / media upload
- ❌ Video calls
- ❌ Advanced search / recommendations
- ❌ Threaded replies (коментарите са flat, не nested)

Тези са извън scope-а. Проектът трябва да е **завършен и polish-нат**,
не натъпкан с half-baked features.
