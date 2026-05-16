<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366F1,50:8B5CF6,100:06B6D4&height=200&section=header&text=Study%20Hub%20v2&fontSize=60&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Your%20Personal%20Learning%20Platform&descAlignY=60&descAlign=50" width="100%"/>

<div align="center">
  <img src="docs/assets/readme/mascot.gif" width="200" style="border-radius: 12%" alt="Study Hub mascot animation" />
</div>

<p align="center">
  <b>Full-stack LMS capstone for SoftUni "Full Stack Apps with AI"</b>
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-54-1E1B4B?style=for-the-badge&logo=expo" alt="Expo" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict-2563EB?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle-ORM-B7EA00?style=for-the-badge" alt="Drizzle ORM" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/Neon-PostgreSQL-00B894?style=for-the-badge" alt="Neon" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Complete-22C55E?style=flat-square" alt="Status complete" />
  <img src="https://img.shields.io/badge/Commits-310%2B-22C55E?style=flat-square" alt="310 plus commits" />
  <img src="https://img.shields.io/badge/TypeScript-Strict%20Mode-6366F1?style=flat-square" alt="TypeScript strict mode" />
  <img src="https://img.shields.io/badge/Tables-21-8B5CF6?style=flat-square" alt="21 database tables" />
  <img src="https://img.shields.io/badge/API-73%20routes-06B6D4?style=flat-square" alt="73 API routes" />
  <img src="https://img.shields.io/badge/Web-28%20pages-6366F1?style=flat-square" alt="28 web pages" />
  <img src="https://img.shields.io/badge/Mobile-21%20screens-8B5CF6?style=flat-square" alt="21 mobile screens" />
</p>

<p align="center">
  <a href="#system-architecture"><img src="https://img.shields.io/badge/Architecture-System%20Overview-8B5CF6?style=flat-square" alt="Architecture" /></a>
  <a href="#database-schema"><img src="https://img.shields.io/badge/DB-Schema%20Diagram-6366F1?style=flat-square" alt="DB schema diagram" /></a>
  <a href="#user-roles"><img src="https://img.shields.io/badge/Roles-Visitor%20%2B%20User%20%2B%20Mentor%20%2B%20Admin-06B6D4?style=flat-square" alt="Visitor, user, mentor, and admin roles" /></a>
  <a href="#demo-walkthrough"><img src="https://img.shields.io/badge/Demo-Walkthrough-8B5CF6?style=flat-square" alt="Demo walkthrough" /></a>
  <a href="#api-endpoints"><img src="https://img.shields.io/badge/API-Endpoints-6366F1?style=flat-square" alt="API endpoints" /></a>
</p>

---

## Live Demo

| Platform | Link |
|---|---|
| Web App | [mariva565-full-stack-ai-capstone-we.vercel.app](https://mariva565-full-stack-ai-capstone-we.vercel.app) |
| Mobile APK | `TBD — EAS Build planned` |

Demo credentials: see [Demo Credentials](#demo-credentials)

## Product Preview

<table>
  <tr>
    <td width="50%">
      <img src="docs/assets/readme/preview-dashboard.png" width="100%" alt="StudyHub dashboard screenshot" />
      <br />
      <sub><b>Dashboard</b> - course overview and quick access</sub>
    </td>
    <td width="50%">
      <img src="docs/assets/readme/preview-course-workspace.png" width="100%" alt="StudyHub course workspace screenshot" />
      <br />
      <sub><b>Course workspace</b> - modules and study structure</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="docs/assets/readme/preview-materials.png" width="100%" alt="StudyHub materials screenshot" />
      <br />
      <sub><b>Materials</b> - organized notes, links, and learning resources</sub>
    </td>
    <td width="50%">
      <img src="docs/assets/readme/preview-profile.png" width="100%" alt="StudyHub profile screenshot" />
      <br />
      <sub><b>Profile</b> - account details, security, and mobile handoff</sub>
    </td>
  </tr>
</table>

## Mobile Preview

<table>
  <tr>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-courses.png" width="100%" alt="StudyHub mobile courses screen" />
      <br />
      <sub><b>Courses</b> - mobile course overview</sub>
    </td>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-favorites.png" width="100%" alt="StudyHub mobile favorites screen" />
      <br />
      <sub><b>Favorites</b> - pinned study materials</sub>
    </td>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-community.png" width="100%" alt="StudyHub mobile community screen" />
      <br />
      <sub><b>Community</b> - posts and discussions</sub>
    </td>
  </tr>
  <tr>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-profile.png" width="100%" alt="StudyHub mobile profile screen" />
      <br />
      <sub><b>Profile</b> - account and logout</sub>
    </td>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-settings.png" width="100%" alt="StudyHub mobile settings screen" />
      <br />
      <sub><b>Settings</b> - preferences and theme</sub>
    </td>
    <td width="33%">
      <img src="docs/assets/readme/preview-mobile-qr-scan.png" width="100%" alt="StudyHub mobile QR scan screen" />
      <br />
      <sub><b>QR handoff</b> - profile deep link scan</sub>
    </td>
  </tr>
</table>

## Mobile Demo

<video src="https://github.com/user-attachments/assets/4af18559-7e62-4ce6-9d9a-f30d5bf6656e" controls width="320"></video>

---

## About the Project

StudyHub v2 is a full rewrite of [StudyHub v1](https://github.com/mariva565/Test-Capstone-Project-StudyHub) (Vanilla JS + Supabase) with a modern full-stack architecture: **Next.js + Expo monorepo**.

The app is a personal **Learning Management System (LMS)** — a structured electronic notebook where users organize study materials hierarchically (`Courses -> Modules -> Materials`), track progress with milestones, and plan with a calendar.

Most tools make you choose: Notion gives you flexibility but no structure. Google Classroom gives you structure but no AI. StudyHub brings all three together — a full LMS hierarchy, a social community board with direct messaging, and AI-powered study tools (quiz generation, summarization, smart search) — in a single platform built for learners who want to do more than just take notes.

**Why a rewrite instead of a new concept:**
- The business logic is personally useful — I actively use StudyHub to organize my own SoftUni notes and plan this capstone.
- Rebuilding the same domain with a completely different stack creates a direct comparison between two architectural approaches.
- StudyHub v1 had monolithic files that were too risky to refactor before submission. v2 corrects that from day one with modular components.
- Some interface patterns remain recognizable on purpose, but the implementation is fully rewritten. This is adaptation and redesign, not copying.

---

## Progress Roadmap

| Phase | Scope | Status |
|---|---|---|
| Phase 0 | Monorepo bootstrap (npm workspaces) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 1 | DB schema + Drizzle migrations (21 tables) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 2 | Auth (JWT + Google OAuth + role guards) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 3 | Courses / modules / materials CRUD + favorites | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 4 | Profile + milestones + calendar + progress tracking | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 5 | Mobile app (CRUD flows + persisted React Query cache + Sentry telemetry validation + release checklist) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 6 | Admin panel (user management, moderation, logs) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 7 | AI study tools (Gemini chat, summarize, quiz) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 8 | UI polish (landing, how-it-works, contact, animations) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Social S0 | Roles (user / mentor / admin) + Course Membership | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Social S1 | Community Board — posts, comments, likes, bookmarks, moderation | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Social S2 | Ask Mentor — Q&A workflow with Mentor Inbox | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Social S3 | Messaging + notifications (web inbox/chat, mobile inbox/thread, browser + mobile push) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 9 | File storage (Vercel Blob — avatar + material uploads) | ![Done](https://img.shields.io/badge/Done-22C55E?style=flat-square) |
| Phase 10 | Deployment (Vercel + EAS Build) | ![In Progress](https://img.shields.io/badge/In%20Progress-F59E0B?style=flat-square) |

The social layer was introduced as a dedicated April 2026 expansion: Social S0 added course membership and the mentor role, Social S1 added the Community Board, Social S2 added the Ask Mentor workflow, and Social S3 completed direct messaging and notifications. It is designed as an LMS collaboration module rather than a standalone social network: posts can be linked to courses, questions have answer status, mentors work through a course-scoped inbox, and admins moderate platform-wide content.

---

## System Architecture

### Overview

```mermaid
graph TB
    WEB["Next.js Web App"] -->|REST API| SERVER
    MOBILE["Expo Mobile App"] -->|REST API| SERVER

    subgraph SERVER["Server Layer — 73 API Routes"]
        AUTH["Auth + OAuth"]
        CRUD["Courses / Modules / Materials"]
        SOCIAL["Community / Messages / Mentoring"]
        AI["AI Tools"]
        ADMIN["Admin Panel"]
    end

    SERVER --> DRIZZLE["Drizzle ORM"]
    DRIZZLE --> DB[("Neon PostgreSQL — 21 tables")]
    SERVER --> PUBLIC_BLOB["Vercel Blob — Public\navatars + post images"]
    SERVER --> PRIVATE_BLOB["Vercel Blob — Private\nmaterial files"]
```

### Backend Boundary

StudyHub intentionally uses **Next.js API Routes as the primary backend boundary** because the product has two first-class clients: the Next.js web app and the Expo mobile app. Both clients communicate with the same authenticated REST contract (`/api/*`), so validation, permissions, error responses, and data shapes stay consistent across web, mobile, Postman, and the live demo.

Keeping the API as the shared boundary also avoids duplicating business logic into separate web-only and mobile-only paths. The clients stay thin, while authentication checks, role permissions, validation, file access rules, and database queries remain centralized in server-side helpers.

On the web, authenticated pages still use async Server Components for server-side initial data where it improves first render. Client-side mutations, realtime updates, file uploads, AI tools, and all mobile flows go through the shared REST API. The actual business/data access logic lives behind that boundary in `apps/web/lib`, then persists through Drizzle ORM to Neon PostgreSQL.

This is a deliberate architectural choice over the alternative of using Server Actions for web and a separate REST API for mobile. In this particular project, that dual-entry approach would duplicate validation, error handling, and auth logic across two boundaries serving the same service layer. A single shared REST contract is simpler to maintain, easier to test (Postman, curl, automated tests), and standard practice for products with multiple client platforms.

This matches the capstone requirement for a client-server architecture where the React web frontend and React Native mobile client communicate with the Next.js backend through a RESTful API.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend Web | Next.js 15 + React 19 + TypeScript (strict) + Tailwind CSS |
| Backend API | Next.js API Routes — core + social + messaging route groups |
| Database | Neon PostgreSQL (serverless) + Drizzle ORM + SQL migrations (21 tables) |
| Auth | Custom JWT (jose, HS256, httpOnly cookies) + Google OAuth |
| Storage | Vercel Blob — public avatars/post images + private material files |
| Mobile | React Native + Expo SDK 54 + TanStack React Query + AsyncStorage persistence + Expo notifications |
| Monorepo | npm workspaces (`apps/web`, `apps/mobile`, `packages/shared`) |

### Rendering & Performance

- Async Server Components prepare authenticated initial data on the server, then hand it to focused client shells for mutations and realtime UI.
- Root metadata defines deployment-safe OpenGraph/Twitter defaults, while data-driven course, module, and material pages use `generateMetadata()` for page-specific titles.
- Route-level `loading.tsx` Suspense boundaries let Next.js show immediate skeleton/loading feedback while heavier pages such as dashboard, community, messages, and admin prepare data.
- Dynamic imports lazy-load below-the-fold landing sections, visual effects, chat, and admin tabs so the initial client bundle stays lighter.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as "User"
    participant F as "Frontend (Web and Mobile)"
    participant M as "Middleware"
    participant A as "API Route"
    participant D as "Database"

    Note over U,D: Registration
    U->>F: Submit register form
    F->>A: POST /api/auth/register
    A->>A: Hash password with bcryptjs
    A->>D: Insert user
    A->>A: Sign JWT with jose HS256 (1d)
    A-->>F: Set httpOnly token cookie
    F-->>U: Redirect to /dashboard

    Note over U,D: Login
    U->>F: Submit login form
    F->>A: POST /api/auth/login
    A->>D: Select user by email
    A->>A: Verify password hash
    A->>A: Sign JWT
    A-->>F: Set httpOnly token cookie
    F-->>U: Redirect to /dashboard

    Note over U,D: Protected Route Access
    U->>F: Navigates to /dashboard
    F->>M: Request with cookie
    M->>M: Verify JWT from cookie
    alt Token valid
        M-->>A: Forward request
        A->>A: requireAuth() extracts user
        A->>D: Query data
        A-->>F: Return response
    else Token missing, invalid, or expired
        M-->>F: Redirect to /login
    end

    Note over U,D: Admin-only access
    U->>F: Navigates to /admin
    F->>M: Request /admin with cookie
    M->>M: Verify JWT + check role
    alt Role is admin
        M-->>A: Forward request
        A->>A: requireAdmin()
        A-->>F: Return admin data
    else Role is not admin
        M-->>F: Redirect to /forbidden
    end
```

---

## Content Access Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant B as Vercel Blob

    U->>F: Opens Dashboard
    F->>A: GET /api/courses
    A->>D: Query user's courses
    A-->>F: JSON response

    U->>F: Navigate Course → Module → Material
    F->>A: GET /api/courses/[id]/modules → /modules/[id]/materials
    A->>D: Query with ownership check
    A-->>F: JSON response

    Note over U,B: Protected file flow
    U->>F: Upload file
    F->>A: POST /api/upload
    A->>B: Store in private Blob
    A->>D: Save metadata + pathname

    U->>F: Download file
    F->>A: GET /api/materials/[id]/file
    A->>D: Verify access
    A->>B: Fetch private Blob
    A-->>F: Stream file
```

---

## User Roles

### Visitor (unauthenticated)

No account required — public pages only.

| Action | Where |
|---|---|
| Browse landing page | `/` |
| Read feature overview | `/how-it-works` |
| Send contact message | `/contact` |
| Browse API documentation | `/api-docs` |
| Register a new account | `/register` |
| Login | `/login` |
| Request password reset | `/forgot-password` |
| Set new password via reset link | `/reset-password` |

Visitors are redirected to `/login` when attempting to access any protected page.

### Student (role: `user`)

| Action | Where |
|---|---|
| Register / login / logout | `/register`, `/login` |
| Create, edit, delete own courses | `/dashboard` |
| Create modules inside own courses | `/courses/[id]` |
| Create, edit, delete materials (text, link, file) | `/materials/[id]` |
| Bookmark materials as favorites | Any material card |
| Track progress with milestones | `/progress` |
| Plan with calendar events + weather widget | `/calendar` |
| Use Community rich-text posting (Tiptap) | `/community/new`, `/community/[id]/edit` |
| Read and write direct messages | `/messages`, `/messages/[id]` |
| Edit profile and avatar | `/profile` |

### Mentor (role: `mentor`)

| Action | Where |
|---|---|
| Everything a student can do | — |
| View questions from own courses in Mentor Inbox | `/mentor-inbox` |
| Filter questions by status (open / answered / closed) | `/mentor-inbox` |
| Mark questions as answered or close them | `/mentor-inbox` → inline status buttons |
| Answer questions via comments | `/community/[id]` |
| Assigned per-course via `course_members` table | Admin panel → Members tab |

### Admin (role: `admin`)

Everything a mentor can do, plus:

| Action | Where |
|---|---|
| View all users | `/admin` |
| Change user roles (user / mentor / admin) | `/admin` → Users tab |
| Delete users (with self-protection) | `/admin` → Users tab |
| Manage course members and mentor assignments | `/admin` → Members tab |
| View and delete any material | `/admin` → Materials tab |
| Approve / hide / pin community posts | `/admin` → Moderation tab |
| View activity logs (audit trail) | `/admin` → Activity Logs tab |

Admin cannot delete themselves or change their own role (self-protection enforced server-side).

### Platform scope per role

| Role | Web | Mobile |
|---|---|---|
| Visitor | 8 public pages (landing, how-it-works, contact, api-docs, auth pages) | N/A — mobile requires login |
| Student (`user`) | Full feature set | Full feature set |
| Mentor (`mentor`) | Full feature set + Mentor Inbox + moderation actions | Same as student — mentor-specific screens are web-only by design |
| Admin (`admin`) | Full feature set + Admin Panel (users, members, materials, moderation, activity logs) | Same as student — admin panel is web-only by design |

Mobile is intentionally scoped to the student experience. Mentor and admin workflows require larger tables, bulk actions, and moderation queues that are better suited to a desktop browser; roles are still recognized on mobile (profile badge, telemetry tag) but do not unlock additional UI.

---

## Database Schema

Current schema includes 21 tables with foreign key relationships, cascade deletes, and unique constraints.

```mermaid
erDiagram
    users ||--o{ courses : creates
    users ||--o{ modules : creates
    users ||--o{ materials : creates
    users ||--o{ favorites : bookmarks
    users ||--o{ milestones : tracks
    users ||--o{ events : schedules
    users ||--o{ activity_logs : generates
    users ||--o{ oauth_accounts : authenticates
    users ||--o{ password_reset_tokens : requests
    users ||--o{ posts : writes
    users ||--o{ comments : writes
    users ||--o{ messages : sends
    users ||--o{ user_push_tokens : registers

    courses ||--o{ modules : contains
    modules ||--o{ materials : contains
    materials ||--o{ favorites : bookmarked
    materials ||--o{ ai_tool_outputs : analyzed
    materials ||--o{ shared_materials : shared

    courses ||--o{ course_members : has
    courses ||--o{ posts : discussed_in
    posts ||--o{ comments : has
    posts ||--o{ post_likes : receives
    posts ||--o{ post_bookmarks : saved

    conversations ||--o{ conversation_members : has
    conversations ||--o{ messages : contains
```

### Table Descriptions

| # | Table | Purpose | Key relationships |
|---|---|---|---|
| 1 | `users` | User accounts with email, hashed password, role (user/mentor/admin) | Referenced by almost all tables via `created_by` or `user_id` |
| 2 | `courses` | Top-level containers for learning content | Created by user; contains modules |
| 3 | `modules` | Ordered sections within a course | Belongs to course (cascade delete); contains materials |
| 4 | `materials` | Learning content — text notes, links, or files | Belongs to module (cascade delete); can be favorited |
| 5 | `favorites` | Bookmarked materials per user | Unique constraint on (user_id, material_id) prevents duplicates |
| 6 | `milestones` | Personal progress goals with status workflow | not_started -> in_progress -> done; linkable to calendar events |
| 7 | `events` | Calendar entries with type and color | Optionally linked to a course or milestone |
| 8 | `activity_logs` | Audit trail for all user actions | Stores action_type + structured JSON details |
| 9 | `ai_tool_outputs` | Saved AI analysis results (summaries, quizzes) | Per user + material; indexed for fast lookup |
| 10 | `oauth_accounts` | External auth provider identities | Links Google OAuth to user; unique on (provider, provider_user_id) |
| 11 | `course_members` | Course membership + per-course mentor assignments | Unique (course_id, user_id); role: student or mentor |
| 12 | `posts` | Community Board posts (discussions, questions, resources, articles) | Linked to author and optionally to a course; supports pinning + moderation |
| 13 | `comments` | Flat comment threads on posts | Belongs to post (cascade delete); linked to author |
| 14 | `post_likes` / `post_bookmarks` | Social interactions on posts | Unique (post_id, user_id) prevents duplicates |
| 15 | `conversations` | Direct-message conversation containers | Referenced by conversation members + message history |
| 16 | `conversation_members` | Membership + unread cursor (`last_read_at`) per conversation | Unique (conversation_id, user_id) prevents duplicates |
| 17 | `messages` | Message history for conversations | Indexed by (conversation_id, created_at) for fast thread reads |
| 18 | `user_push_tokens` | Device push token registry for mobile notifications | Tracks active Expo tokens by user and platform |
| 19 | `password_reset_tokens` | One-hour expiry tokens for forgot-password flow | Linked to user; hashed token stored, `used` flag prevents reuse |
| 20 | `shared_materials` | Material sharing between users | Tracks who shared what with whom; unique (material, shared_by, shared_with) |

---

## Screens

### Web — 28 pages

| # | Route | Description | Auth |
|---|---|---|---|
| 1 | `/` | Landing page with animated hero and feature sections | Public |
| 2 | `/how-it-works` | Feature overview with visual explanations | Public |
| 3 | `/contact` | Contact form (server-side SMTP delivery) | Public |
| 4 | `/api-docs` | Interactive API documentation | Public |
| 5 | `/register` | User registration | Public |
| 6 | `/login` | Login (email/password + Google OAuth) | Public |
| 7 | `/forgot-password` | Request a password reset link by email | Public |
| 8 | `/reset-password` | Set a new password using a one-hour reset token | Public |
| 9 | `/dashboard` | Course cards + aggregated stats | Protected |
| 10 | `/dashboard/material-finder` | AI-powered material search assistant | Protected |
| 11 | `/courses/[id]` | Course detail — modules list with CRUD | Protected |
| 12 | `/modules/[id]` | Module detail — materials list with CRUD | Protected |
| 13 | `/materials/[id]` | Material view and edit (text, link, file) | Protected |
| 14 | `/profile` | Edit name, avatar upload | Protected |
| 15 | `/profile/[id]` | Public profile view + start direct message | Protected |
| 16 | `/progress` | Milestones tracker with status workflow | Protected |
| 17 | `/calendar` | Calendar with events + weather widget | Protected |
| 18 | `/community` | Community Feed — posts list with search, type filter, Load More | Protected |
| 19 | `/community/new` | Create post — Tiptap rich text editor | Protected |
| 20 | `/community/[id]` | Post details — rich content, comments, like/bookmark | Protected |
| 21 | `/community/[id]/edit` | Edit post (author or admin) | Protected |
| 22 | `/mentor-inbox` | Mentor Inbox — questions from mentored courses | Mentor / Admin |
| 23 | `/messages` | Direct messages inbox (unread indicators) | Protected |
| 24 | `/messages/[id]` | Direct message thread (real-time via Pusher) | Protected |
| 25 | `/admin` | Admin panel — users, materials, moderation, activity logs | Admin only |
| 26 | `/moderation` | Moderation queue shortcut | Admin only |
| 27 | `/forbidden` | 403 access denied page | Auto-redirect |
| 28 | `/dev/error-preview` | Error boundary testing (dev-only, noindex) | Dev |

### Mobile — 21 screens

| # | Screen | Description |
|---|---|---|
| 1 | Login | Email/password authentication against the same API |
| 2 | Register | Account creation from mobile |
| 3 | Courses (tab) | Course list with create/edit/delete actions |
| 4 | Community (tab) | Feed with filters/search + inbox CTA + new post CTA |
| 5 | Favorites (tab) | Pinned materials list with quick navigation |
| 6 | Profile (tab) | Profile details + edit name + logout |
| 7 | Create Course | Add a new course |
| 8 | Course Detail | Manage modules inside a selected course |
| 9 | Edit Course | Update course title/description |
| 10 | Add Module | Create module in a course |
| 11 | Module Workspace | Manage materials with search/type filters |
| 12 | Edit Module | Update module title/description |
| 13 | Add Material | Create note/link/file/video material |
| 14 | Material Detail | View material content, tags, and URL/file link |
| 15 | Edit Material | Update material content/type/tags/url |
| 16 | Community Post Details | Read rich content + comments + direct message CTA |
| 17 | Community Create Post | Create post with type/course selectors |
| 18 | Messages Inbox | Conversation list with unread state and pull-to-refresh |
| 19 | Message Thread | 1:1 thread with send + auto refetch + unread sync |
| 20 | Settings | Theme/debug/support actions |
| 21 | AI Tools (Material) | Mobile material AI tools entry point |

The mobile app connects to the **same Next.js backend** — no separate API needed.

Mobile intentionally ships only the student-facing flows. Mentor (`/mentor-inbox`) and admin (`/admin`) tooling lives on the web where it fits the UX better. See [Platform scope per role](#platform-scope-per-role) above.

### Mobile data layer

- **TanStack React Query** with AsyncStorage persistence — query cache survives app restarts
- Optimistic updates on delete flows; invalidation on create/edit
- Sentry telemetry integrated for crash and API error capture

---

## API Endpoints

73 routes grouped by feature domain. Full contract with request/response examples: [`docs/api-contract.md`](docs/api-contract.md). Postman collection: [`docs/StudyHub.postman_collection.json`](docs/StudyHub.postman_collection.json).

### Public

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/contact` | Send public contact form message via server-side SMTP with visitor `Reply-To` |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (email, name, password) |
| `POST` | `/api/auth/login` | Login — returns JWT in httpOnly cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/me` | Update profile (name, etc.) |
| `POST` | `/api/auth/password` | Change password (authenticated) |
| `POST` | `/api/auth/password-reset/request` | Request password reset email (anti-enumeration: always 200) |
| `POST` | `/api/auth/password-reset/confirm` | Set new password using one-hour reset token |
| `POST/DELETE` | `/api/auth/avatar` | Upload or remove avatar image (public Vercel Blob) |
| `POST` | `/api/auth/google` | Google OAuth login |

### Content CRUD

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List user's courses |
| `POST` | `/api/courses` | Create course |
| `GET/PUT/DELETE` | `/api/courses/[id]` | Course by id |
| `GET/POST` | `/api/courses/[id]/modules` | List / create modules for course |
| `GET/PUT/DELETE` | `/api/modules/[id]` | Module by id |
| `GET/POST` | `/api/modules/[id]/materials` | List / create materials for module |
| `GET/PUT/DELETE` | `/api/materials/[id]` | Material by id |
| `POST` | `/api/upload` | Upload material file (private Vercel Blob, 3 MB max) |
| `GET` | `/api/materials/[id]/file` | Protected file download (server-side proxy, ownership/shared check) |
| `POST` | `/api/materials/[id]/file-link` | Generate short-lived signed URL for mobile file access (60 s) |
| `POST` | `/api/upload/post-image` | Upload community post image (public Vercel Blob, 2 MB max) |

### Features

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/favorites` | List user's bookmarked materials |
| `POST/DELETE` | `/api/favorites` | Add / remove favorite |
| `GET/POST` | `/api/milestones` | List / create milestones |
| `PATCH/DELETE` | `/api/milestones/[id]` | Milestone by id |
| `GET/POST` | `/api/events` | List / create calendar events |
| `PATCH/DELETE` | `/api/events/[id]` | Event by id |
| `GET` | `/api/dashboard` | Aggregated stats (courses, materials, favorites count) |

### AI Tools

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Authenticated floating StudyHub Mentor chat assistant |
| `POST` | `/api/ai/tools` | AI analysis tools (summarize, quiz, explain) |
| `POST` | `/api/materials/[id]/extract-text` | Extract text from attached PDF/DOCX file (pdf-parse + mammoth) |
| `GET` | `/api/materials/search?q=...` | Search current user's materials (title/content/tags) with ranked top matches |
| `POST` | `/api/assistant/material-finder` | Isolated material finder assistant (search-first, Gemini optional for phrasing) |
| `GET/POST` | `/api/materials/[id]/ai-outputs` | Saved AI results per material |

### Ask Mentor — Social S2

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/mentor/questions` | List questions from mentored courses (mentor/admin); supports `?status=` filter |
| `PUT` | `/api/posts/[id]/answer-status` | Change `question_status` (open / answered / closed) — mentor of the course or admin |

### Community Board — Social S1

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | List posts (filters: type, courseId, search, page — 20/page) |
| `POST` | `/api/posts` | Create post |
| `GET` | `/api/posts/[id]` | Post details + comments + like/bookmark state |
| `PUT` | `/api/posts/[id]` | Edit post (author only) |
| `DELETE` | `/api/posts/[id]` | Delete post (author or admin) |
| `POST` | `/api/posts/[id]/comments` | Add comment |
| `DELETE` | `/api/comments/[id]` | Delete comment (author or admin) |
| `POST` | `/api/posts/[id]/like` | Toggle like |
| `POST` | `/api/posts/[id]/bookmark` | Toggle bookmark |
| `GET` | `/api/admin/posts` | All posts for moderation (admin only) |
| `PUT` | `/api/admin/posts/[id]` | Approve / hide / pin post (admin only) |
| `DELETE` | `/api/admin/posts/[id]` | Hard delete post (admin only) |

### Messaging and Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/conversations` | List user conversations / start or reuse a 1:1 conversation |
| `GET/POST` | `/api/conversations/[id]/messages` | Fetch thread history / send message (with unread updates + push trigger) |
| `POST` | `/api/pusher/auth` | Authorize private Pusher subscription channels |
| `GET` | `/api/notifications/comments` | Poll new comments on authored posts (since timestamp) |
| `POST` | `/api/mobile/push-token` | Register/update Expo push token for current user |
| `GET` | `/api/ping` | DB warm-up endpoint used before mobile mutation flows |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users (admin only) |
| `PUT/DELETE` | `/api/admin/users/[id]` | Change role / delete user (admin only) |
| `GET` | `/api/admin/courses` | List all courses for moderation |
| `DELETE` | `/api/admin/courses/[id]` | Delete any course |
| `POST` | `/api/admin/courses/bulk-delete` | Bulk delete courses |
| `GET` | `/api/admin/modules` | List all modules for moderation |
| `DELETE` | `/api/admin/modules/[id]` | Delete any module |
| `POST` | `/api/admin/modules/bulk-delete` | Bulk delete modules |
| `GET` | `/api/admin/materials` | List all materials for moderation |
| `DELETE` | `/api/admin/materials/[id]` | Delete any material |
| `POST` | `/api/admin/materials/bulk-delete` | Bulk delete materials |
| `GET` | `/api/admin/activity-logs` | View audit trail (admin only) |
| `GET` | `/api/admin/activity-stats` | Activity statistics and charts |
| `GET` | `/api/admin/stats` | Dashboard overview stats |
| `GET` | `/api/health` | Server health check |

---

## Security Baseline

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs (server-side only) |
| JWT tokens | jose library, HS256, 1-day expiry, httpOnly cookie |
| Route protection | `middleware.ts` — validates JWT on every protected request |
| Admin guards | `requireAdmin()` — server-side role check per endpoint |
| Self-protection | Admin cannot delete self or change own role |
| No client-side tokens | JWT never stored in localStorage — only httpOnly cookie |
| Input validation | Server-side validation before database operations |
| No secrets in errors | Error payloads never expose stack traces or sensitive data |
| TypeScript strict | Catches type errors at compile time across the entire codebase |

---

## Demo Walkthrough

> Step-by-step guide for testing the app (for jury review).

### As a Visitor (no account)

1. **Landing** — open `/` and browse the animated hero, feature sections, and footer
2. **How It Works** — go to `/how-it-works` for a visual feature overview
3. **Contact** — go to `/contact` and submit a test message
4. **API Docs** — go to `/api-docs` and browse the interactive endpoint documentation
5. **Protected redirect** — try opening `/dashboard` without logging in — you should be redirected to `/login`

### As a Student

1. **Register** — go to `/register`, create a new account
2. **Dashboard** — see the empty dashboard, create your first course
3. **Course** — open the course, add a module
4. **Module** — open the module, add materials (text note, link)
5. **Material Finder** — go to `/dashboard/material-finder`, search across your saved materials, and review ranked matches
6. **AI Chatbot** — open the floating StudyHub Mentor assistant on an authenticated page and ask a study question
7. **Favorites** — bookmark a material, see it highlighted
8. **Progress** — go to `/progress`, create a milestone, change its status
9. **Calendar** — go to `/calendar`, create an event and expand the weather widget (current + hourly + 3-day)
10. **Profile** — go to `/profile`, change your name and upload an avatar

### As a Community Member

1. **Community Feed** — go to `/community`, browse posts
2. **Filter** — use type filter (Discussion / Question / Resource / Article) or search bar
3. **Load More** — server-side pagination, 20 posts per page
4. **New Post** — click "New Post", choose type, optionally link to a course, and write with Tiptap rich text
5. **Post Details** — open a post, read rich content/comments, like or bookmark
6. **Add Comment** — write a comment, press Post
7. **Edit / Delete** — available on your own posts
8. **Direct Message** — use "Send message" from post/profile and continue in `/messages`
9. **Alerts** — enable browser alerts from navbar (`Enable Alerts`) for new messages/comments

### As a Mentor

1. **Login** with mentor credentials (or promote a user to mentor via Admin → Users tab)
2. **Mentor Inbox** — go to `/mentor-inbox` (visible in navbar for mentor/admin)
3. **Stats row** — see open / answered / closed question counts at a glance
4. **Filter** — click a stat card to filter by status; click again to show all
5. **Mark answered** — open a question card, click "Mark answered" to update its status
6. **Close / Reopen** — manage question lifecycle without leaving the inbox
7. **Open post** — click the title to go to the full post and add a comment

### As an Admin

1. **Login** with admin credentials (see [Demo Credentials](#demo-credentials))
2. **Admin Panel** — go to `/admin`
3. **Users tab** — see all registered users, change a user's role (user / mentor / admin)
4. **Members tab** — assign users as course mentors
5. **Moderation tab** — approve / hide / pin community posts
6. **Materials tab** — see all materials across all users
7. **Activity Logs tab** — see the audit trail of all actions

### On Mobile

1. **Connect** phone via USB (see [Quick Setup](#-quick-setup))
2. **Login** — same credentials as web
3. **Courses tab** — browse courses, pull-to-refresh, open CRUD actions
4. **Community tab** — browse/filter posts, open details, create post
5. **Messages inbox** — open `/messages`, verify unread indicators
6. **Message thread** — open a conversation and send/receive messages
7. **Module Workspace** — manage materials with search/type filters
8. **Material Detail** — open links/files and verify tags/content
9. **Profile tab** — edit user name and logout

---

## Demo Credentials

Demo credentials will be provided in a separate document submitted alongside the project.

---

## Key Folders and Files

```
studyhub-v2/
├── apps/
│   ├── web/                          # Next.js web app + API backend
│   │   ├── app/
│   │   │   ├── api/                  # Core + social + messaging API routes
│   │   │   │   ├── auth/             #   register, login, logout, me, password, avatar, google
│   │   │   │   ├── courses/          #   CRUD + nested modules
│   │   │   │   ├── modules/          #   CRUD + nested materials
│   │   │   │   ├── materials/        #   CRUD + AI outputs
│   │   │   │   ├── favorites/        #   create, list, remove
│   │   │   │   ├── milestones/       #   CRUD
│   │   │   │   ├── events/           #   CRUD
│   │   │   │   ├── ai/              #   Gemini chat + analysis tools
│   │   │   │   ├── dashboard/        #   aggregated stats
│   │   │   │   ├── admin/            #   users, courses, modules, materials, logs, stats
│   │   │   │   └── health/           #   health check
│   │   │   ├── login/                # Login page
│   │   │   ├── register/             # Register page
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── courses/[id]/         # Course detail + modules
│   │   │   ├── modules/[id]/         # Module detail + materials
│   │   │   ├── materials/[id]/       # Material view/edit
│   │   │   ├── profile/              # User profile
│   │   │   ├── progress/             # Milestones tracker
│   │   │   ├── calendar/             # Events calendar
│   │   │   ├── admin/                # Admin panel
│   │   │   ├── how-it-works/         # Landing info page
│   │   │   ├── contact/              # Contact page
│   │   │   ├── community/            # Community feed + details + create/edit
│   │   │   ├── mentor-inbox/         # Mentor Q&A inbox
│   │   │   ├── messages/             # Direct message inbox + thread
│   │   │   ├── moderation/           # Admin moderation queue shortcut
│   │   │   └── forbidden/            # 403 page
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/                   #   Base components (buttons, cards, modals, etc.)
│   │   │   ├── admin/                #   Admin panel tabs + management
│   │   │   ├── home/                 #   Landing page sections
│   │   │   ├── how-it-works/         #   How It Works page sections + 3D scenes
│   │   │   ├── contact/              #   Contact page + aurora background
│   │   │   ├── dashboard/            #   Dashboard widgets
│   │   │   ├── course/               #   Course-related components
│   │   │   ├── materials/            #   Material editor/viewer
│   │   │   ├── chat/                 #   AI chat widget + tools panel
│   │   │   ├── calendar/             #   Calendar components
│   │   │   └── progress/             #   Milestone components
│   │   ├── lib/                      # Server utilities
│   │   │   ├── db.ts                 #   Neon + Drizzle connection
│   │   │   ├── jwt.ts                #   JWT sign/verify (jose)
│   │   │   ├── auth.ts               #   Password hash/verify (bcryptjs)
│   │   │   ├── google.ts             #   Google OAuth token verification
│   │   │   ├── api-utils.ts          #   requireAuth(), requireAdmin()
│   │   │   └── activity.ts           #   Activity logging helper
│   │   └── middleware.ts             # Route protection + role guards
│   │
│   └── mobile/                       # Expo React Native app
│       ├── app/
│       │   ├── _layout.tsx           #   Root layout + auth provider
│       │   ├── login.tsx             #   Login screen
│       │   ├── register.tsx          #   Register screen
│       │   ├── (tabs)/               #   Courses, Community, Favorites, Profile tabs
│       │   ├── course/[id]/          #   Course details + edit + add module
│       │   ├── module/[id]/          #   Module workspace + edit + add material
│       │   ├── material/[id]/        #   Material detail/edit + AI tools
│       │   ├── community/            #   Mobile community details + create
│       │   ├── messages/             #   Inbox + thread
│       │   └── settings.tsx          #   Settings screen
│       └── lib/
│           └── auth-context.tsx      #   Auth state management
│
├── packages/
│   └── shared/                       # Shared TypeScript types/utils
│
├── drizzle/
│   ├── schema.ts                     # All 21 table definitions
│   └── migrations/                   # SQL migration files (committed)
│
├── docs/
│   ├── dev-log.md                    # Session-by-session development log
│   ├── api-contract.md               # API error contract + request/response examples
│   └── StudyHub.postman_collection.json  # Postman collection for API testing
│
├── drizzle.config.ts                 # Drizzle Kit configuration
├── package.json                      # Monorepo root (npm workspaces)
├── AGENTS.md                         # AI agent instructions
└── README.md
```

---

## Quick Setup

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
cp .env.example .env
```

### Environment

Copy `.env.example` and fill in the required values (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`). See `.env.example` for the full list.

### Run Web

```bash
npm run dev:web
```
Open: `http://localhost:3000`

### Run Mobile (Android)

```bash
# Terminal 1: start web API
npm run dev:web

# Terminal 2: start Expo on LAN
npm --workspace @studyhub/mobile run dev:mobile:lan
```

Prerequisites: phone and PC on the same Wi-Fi network; scan the QR code with Expo Go.

### Production Build (local preview)

```bash
npm run prod:web
```

Builds the Next.js app and starts it in production mode on `http://localhost:3000`.

---

## v1 -> v2 Transformation

| Topic | StudyHub v1 | StudyHub v2 |
|---|---|---|
| Frontend | Vanilla JS + Bootstrap | React + Next.js + TypeScript + Tailwind |
| Backend | Supabase (BaaS) | Next.js API Routes (custom) |
| Auth | Supabase Auth (GoTrue) | Custom JWT + Google OAuth |
| Database | Supabase PostgreSQL (6 tables) | Neon PostgreSQL + Drizzle ORM (21 tables) |
| Mobile | None | React Native + Expo + tabs/CRUD/community/messages + push-ready notifications |
| File structure | Single app, monolithic files | Monorepo + modular components (<300 LOC each)* |
| Deployment | Netlify + Vercel (dual) | Vercel (monorepo) |
| Security | RLS + CSP + MFA (partial) | JWT guards + middleware + role-based endpoints |

> **\*** A few files intentionally exceed 300 lines: `drizzle/schema.ts` (367 — single-file FK contract), `milestone-timeline-item.tsx` (340 — AnimatePresence context), `ai-tools-panel.tsx` (320 — tightly coupled AI tool tabs), `hero-3d.tsx` (310 — Three.js scene), `members-tab.tsx` (309 — admin data table). All other files stay under 300 LOC.

---

## Scalability Validation (10 000+ records)

Per course requirement, the application was stress-tested with a large synthetic dataset to prove that pagination, filtering, and query performance hold under realistic load.

### Dataset

A deterministic seed script (`drizzle/seed-stress.ts`) generated **91,000+ rows** across 11 tables on a dedicated Neon database branch:

| Table | Records |
|---|---:|
| users | 10,014 |
| courses | 1,008 |
| modules | 3,017 |
| materials | 10,064 |
| posts | 10,165 |
| comments | 20,392 |
| favorites | 5,000 |
| course_members | 2,009 |
| post_likes | 15,000 |
| post_bookmarks | 5,000 |
| activity_logs | 10,000 |

### API Response Times (server-side paginated, 50 items/page)

| Endpoint | Total Records | Page | Response Time |
|---|---:|---:|---:|
| `GET /api/admin/users` | 10,014 | 1 | 131 ms |
| `GET /api/admin/users` (deep page) | 10,014 | 200 | 165 ms |
| `GET /api/admin/users?search=stress` | 10,000 | 1 | 132 ms |
| `GET /api/admin/courses` | 1,008 | 1 | 135 ms |
| `GET /api/admin/modules` | 3,017 | 1 | 186 ms |
| `GET /api/admin/materials` | 10,064 | 1 | 155 ms |
| `GET /api/admin/materials` (deep page) | 10,064 | 200 | 153 ms |
| `GET /api/admin/members` | 2,009 | 1 | 247 ms |

All endpoints respond **under 250 ms** regardless of page depth or active search filters.

### Evidence

- Neon SQL Editor row counts: [`docs/Neon_SQL_editor_screenshot.png`](docs/Neon_SQL_editor_screenshot.png)
- Neon Tables view: [`docs/Neon_Test_Tables_screenshot.png`](docs/Neon_Test_Tables_screenshot.png)
- Validation ran on a short-lived Neon branch (`stress-test`), not production.
- Seed script: `npm run db:seed:stress` (requires `ALLOW_STRESS_SEED=true`).

### Pagination Strategy

- **Admin Panel**: numbered server-side pagination with `page`, `limit`, `total`, `hasMore` metadata — suited for precise data navigation.
- **Community Feed**: Load More pattern (social UX — Reddit/Twitter style) with server-side `OFFSET`/`LIMIT`.
- **7 btree indexes** added via Drizzle migration to support the paginated queries.

---

## File Storage — Vercel Blob

Two separate Blob stores with different privacy models:

| Store | Type | Purpose | Limit |
|---|---|---|---|
| `studyhub-avatars` | Public | Avatars + community post images | 2–3 MB |
| `studyhub-materials` | Private | Course material files (PDF, DOCX, images) | 3 MB |

**Why Vercel Blob over S3/R2:** No credit card required (Hobby plan), native Vercel integration, built-in public/private separation, and continuity with v1's private-storage pattern (Supabase Storage signed URLs → Vercel Blob authenticated proxy).

Private material files are never publicly accessible — downloads go through authenticated API routes (`/api/materials/[id]/file`) that enforce owner/shared-user access.

---

<div align="center">
  <strong>Made with ❤️ for the <a href="https://softuni.bg">SoftUni</a> "Full Stack Apps with AI" capstone.</strong>
</div>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,50:8B5CF6,100:6366F1&height=100&section=footer" width="100%"/>
