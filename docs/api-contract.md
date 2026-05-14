# StudyHub API Contract

Last reviewed: 2026-04-23

This document summarizes the StudyHub REST API contract used by the Next.js web app and the Expo mobile app.

## Base URL

Local development:

```text
http://localhost:3000
```

Production:

```text
TBD after Vercel/Netlify deployment
```

## Transport

- All API routes live under `/api`.
- Request and response bodies are JSON unless noted.
- Web auth uses an httpOnly `token` cookie.
- Mobile auth uses `Authorization: Bearer <jwt>` headers.
- Public endpoints are limited to contact, health/ping, and auth entry points.

## Error Contract

Error responses should use this shape:

```json
{
  "code": "SOME_ERROR_CODE",
  "message": "Human-readable message"
}
```

Rules:

- Do not return stack traces to clients.
- Use stable `code` values for client branching.
- Keep `message` safe for display or logging.

Common status codes:

| Status | Meaning |
|---|---|
| `200` | Request succeeded |
| `201` | Resource created |
| `400` | Invalid input |
| `401` | Missing or invalid auth |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Duplicate or conflict |
| `500` | Unexpected server failure |

## Auth Flow

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request:

```json
{
  "email": "student@example.com",
  "name": "Demo Student",
  "password": "student123"
}
```

Success: `201 Created`

```json
{
  "message": "Registration successful",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "user"
  }
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "student@example.com",
  "password": "student123"
}
```

Success: `200 OK`

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "Demo Student",
    "role": "user"
  }
}
```

### Current User

```http
GET /api/auth/me
Authorization: Bearer <jwt>
```

Success: `200 OK`

```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "name": "Demo Student",
    "role": "user"
  }
}
```

## Core Resource Examples

### Courses

```http
GET /api/courses?page=1&limit=50&search=api
Authorization: Bearer <jwt>
```

Success:

```json
{
  "courses": [],
  "page": 1,
  "limit": 50,
  "total": 0,
  "hasMore": false
}
```

```http
POST /api/courses
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "title": "Back-End APIs",
  "description": "SoftUni lesson notes"
}
```

Success: `201 Created`

```json
{
  "course": {
    "id": 10,
    "title": "Back-End APIs",
    "description": "SoftUni lesson notes"
  }
}
```

### Modules

```http
GET /api/courses/10/modules
Authorization: Bearer <jwt>
```

Success:

```json
{
  "modules": []
}
```

```http
POST /api/courses/10/modules
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "title": "REST and HTTP",
  "description": "Methods, status codes, JSON",
  "orderIndex": 0
}
```

Success: `201 Created`

### Materials

```http
GET /api/modules/5/materials
Authorization: Bearer <jwt>
```

Success:

```json
{
  "materials": []
}
```

```http
POST /api/modules/5/materials
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "title": "HTTP status codes",
  "content": "200 OK, 201 Created, 400 Bad Request...",
  "materialType": "text",
  "tags": "backend,http,rest"
}
```

Success: `201 Created`

## Social And Messaging Examples

### Community Posts

```http
GET /api/posts?page=1&type=question&search=jwt
Authorization: Bearer <jwt>
```

Success:

```json
{
  "posts": [],
  "page": 1,
  "hasMore": false
}
```

### Conversations

```http
POST /api/conversations
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "userId": 2
}
```

Success:

```json
{
  "id": 7
}
```

```http
POST /api/conversations/7/messages
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request:

```json
{
  "content": "Can you help me with JWT auth?"
}
```

Success: `201 Created`

## Admin Examples

Admin endpoints require an authenticated user with `role === "admin"`.

```http
GET /api/admin/users?page=1&limit=50&search=ada
Authorization: Bearer <admin-jwt>
```

Success:

```json
{
  "users": [],
  "page": 1,
  "limit": 50,
  "total": 0,
  "hasMore": false
}
```

Unauthorized role response:

```json
{
  "code": "FORBIDDEN",
  "message": "Admin access required"
}
```

## Notes

- The API currently uses `PUT` for several partial updates. This is documented as an existing project convention.
- Pagination exists on high-volume surfaces such as community posts, admin moderation views, admin list views, and authenticated course lists.
- Core personal lists currently return full scoped lists because they are smaller and user-scoped.
- Persistent state is stored in Neon PostgreSQL through Drizzle ORM. The app does not rely on local JSON files, so it is compatible with serverless deployment constraints.
