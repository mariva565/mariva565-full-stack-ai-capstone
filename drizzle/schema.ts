import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  date,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── 1. users ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' | 'mentor' | 'admin'
  avatarUrl: text("avatar_url"),
  blocked: boolean("blocked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 2. courses ─────────────────────────────────────────────
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  isPublic: boolean("is_public").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // 'draft' | 'published'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 3. modules ─────────────────────────────────────────────
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
});

// ─── 4. materials ───────────────────────────────────────────
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  materialType: varchar("material_type", { length: 20 })
    .notNull()
    .default("text"), // 'text' | 'link' | 'file'
  fileUrl: text("file_url"),
  tags: text("tags"), // comma-separated or JSON string
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 5. favorites ───────────────────────────────────────────
export const favorites = pgTable(
  "favorites",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorites_user_material_idx").on(
      table.userId,
      table.materialId
    ),
  ]
);

// ─── 6. milestones ──────────────────────────────────────────
export const aiToolOutputs = pgTable(
  "ai_tool_outputs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    materialId: integer("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "cascade" }),
    tool: varchar("tool", { length: 32 }).notNull(),
    data: jsonb("data").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("ai_tool_outputs_user_material_idx").on(table.userId, table.materialId),
    index("ai_tool_outputs_material_created_idx").on(table.materialId, table.createdAt),
  ]
);

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("not_started"), // 'not_started' | 'in_progress' | 'done'
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 7. events ──────────────────────────────────────────────
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  type: varchar("type", { length: 20 }).notNull().default("reminder"), // 'deadline' | 'reminder' | 'milestone' | 'exam' | 'personal'
  color: varchar("color", { length: 7 }), // hex color e.g. '#8b5cf6'
  courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
  milestoneId: integer("milestone_id").references(() => milestones.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 8. activity_logs ───────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  actionType: varchar("action_type", { length: 50 }).notNull(), // 'login' | 'create_course' | ...
  targetId: integer("target_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 9. course_members ──────────────────────────────────────
export const courseMembers = pgTable(
  "course_members",
  {
    id: serial("id").primaryKey(),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull().default("student"), // 'student' | 'mentor'
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("course_members_course_user_idx").on(table.courseId, table.userId),
  ]
);

// ─── 10. posts ──────────────────────────────────────────────
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  postType: varchar("post_type", { length: 20 }).notNull().default("discussion"), // 'discussion' | 'question' | 'resource' | 'article'
  status: varchar("status", { length: 20 }).notNull().default("approved"), // 'pending' | 'approved' | 'hidden'
  courseId: integer("course_id").references(() => courses.id, { onDelete: "set null" }),
  isPinned: boolean("is_pinned").notNull().default(false),
  questionStatus: varchar("question_status", { length: 20 }), // NULL | 'open' | 'answered' | 'closed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── 11. comments ───────────────────────────────────────────
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── 12. post_likes ─────────────────────────────────────────
export const postLikes = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("post_likes_post_user_idx").on(table.postId, table.userId),
  ]
);

// ─── 13. post_bookmarks ─────────────────────────────────────
export const postBookmarks = pgTable(
  "post_bookmarks",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("post_bookmarks_post_user_idx").on(table.postId, table.userId),
  ]
);

// ─── 14. oauth_accounts ─────────────────────────────────────
export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 50 }).notNull(), // 'google'
    providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
    providerEmail: varchar("provider_email", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("oauth_accounts_provider_user_id_idx").on(
      table.provider,
      table.providerUserId
    ),
  ]
);
