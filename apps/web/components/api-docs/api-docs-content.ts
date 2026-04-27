export type ApiDocMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEndpointDoc = {
  method: ApiDocMethod;
  path: string;
  auth: string;
  description: string;
  requestExample?: string;
  responseExample: string;
  statusCodes: string[];
};

export type ApiSectionDoc = {
  eyebrow: string;
  title: string;
  description: string;
  endpoints: ApiEndpointDoc[];
};

export const apiDocsHighlights = [
  {
    label: "Base URL",
    value: "http://localhost:3000",
    note: "Local development entry point for web, mobile, and Postman.",
  },
  {
    label: "Authorization",
    value: "Bearer <token>",
    note: "Mobile and external clients send JWT through the Authorization header.",
  },
  {
    label: "Error Contract",
    value: '{ "code": "...", "message": "..." }',
    note: "StudyHub returns stable error codes and does not expose stack traces to clients.",
  },
] as const;

export const apiDocsSections: ApiSectionDoc[] = [
  {
    eyebrow: "Auth",
    title: "Authentication And Identity",
    description:
      "StudyHub uses JWT auth with cookie support for the web client and Bearer support for mobile and external tools.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        auth: "Public",
        description: "Create a new account and immediately receive a StudyHub JWT.",
        requestExample: `{
  "email": "student@example.com",
  "name": "Demo Student",
  "password": "student123"
}`,
        responseExample: `{
  "message": "Registration successful",
  "token": "<jwt>",
  "user": { "id": 1, "email": "student@example.com", "role": "user" }
}`,
        statusCodes: ["201 Created", "400 Bad Request", "409 Conflict", "500 Internal Server Error"],
      },
      {
        method: "POST",
        path: "/api/auth/login",
        auth: "Public",
        description: "Verify credentials, set the httpOnly cookie, and return the JWT in JSON for mobile/Postman flows.",
        requestExample: `{
  "email": "reader@example.com",
  "password": "<your-password>"
}`,
        responseExample: `{
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": 2, "email": "reader@example.com", "name": "Demo Reader", "role": "user" }
}`,
        statusCodes: ["200 OK", "400 Bad Request", "401 Unauthorized", "500 Internal Server Error"],
      },
      {
        method: "GET",
        path: "/api/auth/me",
        auth: "Bearer or cookie",
        description: "Resolve the currently authenticated user from the JWT payload.",
        responseExample: `{
  "user": { "id": 2, "email": "reader@example.com", "name": "Demo Reader", "role": "user" }
}`,
        statusCodes: ["200 OK", "401 Unauthorized", "404 Not Found"],
      },
    ],
  },
  {
    eyebrow: "Content",
    title: "Courses, Modules, Materials",
    description:
      "The core LMS hierarchy is modeled as Courses -> Modules -> Materials and is shared by the web and mobile clients.",
    endpoints: [
      {
        method: "GET",
        path: "/api/courses",
        auth: "Bearer or cookie",
        description: "List the current user's courses and memberships.",
        responseExample: `{
  "courses": []
}`,
        statusCodes: ["200 OK", "401 Unauthorized"],
      },
      {
        method: "POST",
        path: "/api/courses",
        auth: "Bearer or cookie",
        description: "Create a course owned by the authenticated user.",
        requestExample: `{
  "title": "Back-End APIs",
  "description": "SoftUni lesson notes"
}`,
        responseExample: `{
  "course": { "id": 10, "title": "Back-End APIs", "description": "SoftUni lesson notes" }
}`,
        statusCodes: ["201 Created", "400 Bad Request", "401 Unauthorized"],
      },
      {
        method: "POST",
        path: "/api/modules/{id}/materials",
        auth: "Bearer or cookie",
        description: "Create a new material inside an existing module.",
        requestExample: `{
  "title": "HTTP status codes",
  "content": "200 OK, 201 Created, 400 Bad Request...",
  "materialType": "text",
  "tags": "backend,http,rest"
}`,
        responseExample: `{
  "material": { "id": 42, "title": "HTTP status codes", "materialType": "text" }
}`,
        statusCodes: ["201 Created", "400 Bad Request", "401 Unauthorized", "404 Not Found"],
      },
    ],
  },
  {
    eyebrow: "Features",
    title: "Favorites, Planning, Dashboard",
    description:
      "These routes support personal organization flows on top of the content hierarchy.",
    endpoints: [
      {
        method: "GET",
        path: "/api/favorites",
        auth: "Bearer or cookie",
        description: "Return all materials bookmarked by the current user.",
        responseExample: `{
  "favorites": []
}`,
        statusCodes: ["200 OK", "401 Unauthorized"],
      },
      {
        method: "POST",
        path: "/api/milestones",
        auth: "Bearer or cookie",
        description: "Create a progress milestone used by the Progress page.",
        requestExample: `{
  "title": "Lesson 09",
  "description": "Finish backend audit",
  "status": "in_progress"
}`,
        responseExample: `{
  "milestone": { "id": 5, "title": "Lesson 09", "status": "in_progress" }
}`,
        statusCodes: ["201 Created", "400 Bad Request", "401 Unauthorized"],
      },
      {
        method: "GET",
        path: "/api/dashboard",
        auth: "Bearer or cookie",
        description: "Return aggregated counters and top-level dashboard data.",
        responseExample: `{
  "coursesCount": 4,
  "materialsCount": 12,
  "favoritesCount": 3
}`,
        statusCodes: ["200 OK", "401 Unauthorized"],
      },
    ],
  },
  {
    eyebrow: "Community",
    title: "Posts, Questions, Messaging",
    description:
      "High-traffic social surfaces already use pagination where it matters, while direct messaging is real-time and push-aware.",
    endpoints: [
      {
        method: "GET",
        path: "/api/posts?page=1&type=question&search=jwt",
        auth: "Bearer or cookie",
        description: "List community posts with filters and paginated response metadata.",
        responseExample: `{
  "posts": [],
  "page": 1,
  "hasMore": false
}`,
        statusCodes: ["200 OK", "401 Unauthorized"],
      },
      {
        method: "POST",
        path: "/api/posts",
        auth: "Bearer or cookie",
        description: "Create a discussion, question, resource, or article post.",
        requestExample: `{
  "title": "How do JWT tokens work?",
  "content": "<p>I need a clearer explanation.</p>",
  "postType": "question"
}`,
        responseExample: `{
  "post": { "id": 77, "title": "How do JWT tokens work?", "postType": "question", "status": "pending" }
}`,
        statusCodes: ["201 Created", "400 Bad Request", "401 Unauthorized"],
      },
      {
        method: "POST",
        path: "/api/conversations/{id}/messages",
        auth: "Bearer or cookie",
        description: "Send a message to an existing conversation and trigger realtime/push side effects.",
        requestExample: `{
  "content": "Can you help me with JWT auth?"
}`,
        responseExample: `{
  "id": 18,
  "content": "Can you help me with JWT auth?"
}`,
        statusCodes: ["201 Created", "400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
      },
    ],
  },
  {
    eyebrow: "Admin",
    title: "Moderation And Audit Trails",
    description:
      "Role-protected endpoints expose operational views for users, moderation queues, and activity reporting.",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/users",
        auth: "Admin",
        description: "List all users for admin management.",
        responseExample: `{
  "users": []
}`,
        statusCodes: ["200 OK", "401 Unauthorized", "403 Forbidden"],
      },
      {
        method: "GET",
        path: "/api/admin/posts?page=1",
        auth: "Mentor or admin",
        description: "Return moderation queue rows with page metadata and per-status counters.",
        responseExample: `{
  "posts": [],
  "page": 1,
  "hasMore": false,
  "statusCounts": { "pending": 0, "approved": 0, "hidden": 0 }
}`,
        statusCodes: ["200 OK", "401 Unauthorized", "403 Forbidden"],
      },
      {
        method: "GET",
        path: "/api/admin/activity-logs?page=1&limit=50",
        auth: "Admin",
        description: "Return recent audit log entries. Paginated with `page` (default 1) and `limit` (default 50, max 200). `hasMore` indicates whether another page is available.",
        responseExample: `{
  "logs": [],
  "page": 1,
  "hasMore": false
}`,
        statusCodes: ["200 OK", "401 Unauthorized", "403 Forbidden"],
      },
    ],
  },
];
