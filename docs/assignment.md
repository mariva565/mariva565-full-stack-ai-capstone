# Capstone Project Assignment — "Full Stack Apps with AI"

> Source: SoftUni course "Full Stack Apps with AI"

## Project Info

| Field | Value |
|---|---|
| Author | … |
| Email | … |
| GitHub Repo | … |
| Live Project URL | … |
| Sample credentials | … |

---

## 1. Project Assignment

Using agentic AI development implement and deploy a fully functional multi-platform full-stack app.

- Implement a backend + Web client app + mobile client app (for Android / iOS).
- The topic and scope of your project is up to you.
- Examples: blog system, social network, listings website, recipes catalog, hotel booking platform, issue tracking system, project planner, poll system, meme generator.

---

## 2. Project Requirements

### Technologies

- **Backend:** Next.js + PostgreSQL
- **Database:** Neon serverless PostgreSQL + Drizzle ORM
- **Frontend:** Next.js + React + TypeScript + Tailwind
- **Mobile app:** React Native + Expo

### Architecture

- Client-server architecture:
  - React frontend with Next.js backend, communicating via RESTful API
  - React Native mobile client with Next.js backend, communicating via RESTful API
- Node.js monorepo: Next.js Web app + Expo mobile app
  - The Next.js app holds back-end APIs + Web client app
  - The Expo app holds the React Native mobile app
- Serverless deployment on a managed platform (like Netlify) with serverless database (like Neon)

### User Interface (UI)

- Minimum **5 app screens** (pages / popups / others)
- Example: register, login, main page, view / add / edit / delete entity, admin panel
- Responsive design for desktop and mobile browsers
- Use icons, effects and visual cues to enhance UX
- Place different app screens in separate components

### Backend

- Next.js + Drizzle ORM + PostgreSQL as backend
- Store data in PostgreSQL (Neon DB) with Drizzle ORM
- JWT tokens for authentication (users, register, login, logout)
- Object storage (like Cloudflare R2) for file uploads/downloads

### Authentication and Authorization

- JWT tokens for auth and authorization (custom code or Auth.js)
- Users (register, login, logout) and roles (normal and admin)
- Access control in API endpoints and server-side components
- Admin panel in the Web app

### Database

- Minimum **4 DB tables** (with relationships)
- Examples: users, profiles, articles, photos / users, posts, photos, comments
- Best practices: normalization, indexing, relationships
- Always use Drizzle migrations for schema changes
- DB migration SQL scripts must be committed in the GitHub repo

### Storage

- File uploads/downloads: **non-mandatory**
- Store user files (photos, documents) in object storage (e.g. Cloudflare R2)

### Deployment

- Project deployed live on the Internet (Netlify, Vercel or similar)
- Provide sample credentials (e.g. demo / demo123) for testing

### GitHub Repo

- Minimum **15 commits** in GitHub
- Commits on at least **3 different days**
- Optionally: branches and pull requests
- AGENTS.md file with agent instructions

> Your public GitHub repo is the most important project asset! The commit history demonstrates you have worked seriously on your own.

### Documentation

- Project description (what it does, who can do what)
- Architecture: frontend, backend, database, APIs, mobile app, technologies, components
- Database schema design (visualize main DB tables and relationships)
- Local development setup guide
- Key folders and files and their purpose

---

## 3. Project Implementation

- Use modern AI-assisted development (GitHub Copilot / Claude Code)
- Split into manageable steps, use the AI dev loop:
  1. Prompt the agent → implement → run & test → refine → commit and push / discard

---

## 4. Project Assessment (100 points)

| Criteria | Max Score | Description |
|---|---|---|
| GitHub Commits | 0…15 | At least 15 commits (1 score per commit, max 15) |
| GitHub Commit Days | 0…15 | Commits on 3 different days (5 score per day, max 15) |
| Architecture | 0…5 | Monorepo, Next.js app, Expo app, client-server, HTTP communication |
| Backend API | 0…7 | Backend API endpoints with authentication |
| Database | 0…8 | At least 4 DB tables (2 per table, max 8), ORM and migrations |
| Auth and Security | 0…5 | Correct server-side user permissions handling |
| Web App Screens | 0…10 | At least 5 screens with responsive design (2 per screen, max 10) |
| Admin Panel | 0…10 | Users, roles, and admin panel (or special users) |
| Mobile App | 0…9 | Mobile app connecting to server API, at least 3 screens (3 per screen, max 9) |
| Deployment | 0…10 | Project published live and working properly |
| Documentation | 0…6 | Project documentation in GitHub repo |
| **Total** | **100** | |
