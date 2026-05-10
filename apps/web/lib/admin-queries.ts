import { db } from "./db";
import { users, courses, modules, materials, posts, activityLogs } from "../../../drizzle/schema";
import { count, eq, gte, sql, or, ilike, and, inArray, desc, type SQL } from "drizzle-orm";
import { getMentoredCourseIds } from "./post-access";
import { list } from "@vercel/blob";

const LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB Vercel Hobby

export async function fetchAdminStats() {
  const [[userCount], [courseCount], [moduleCount], [materialCount]] =
    await Promise.all([
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(courses),
      db.select({ value: count() }).from(modules),
      db.select({ value: count() }).from(materials),
    ]);

  return {
    users: userCount.value,
    courses: courseCount.value,
    modules: moduleCount.value,
    materials: materialCount.value,
  };
}

export async function fetchModerationQueueOverview() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [[pendingPosts], [newUsers]] = await Promise.all([
    db.select({ value: count() }).from(posts).where(eq(posts.status, "pending")),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, sevenDaysAgo)),
  ]);

  return {
    pendingPosts: pendingPosts.value,
    newUsers: newUsers.value,
  };
}

async function sumStoreBytes(token: string): Promise<number> {
  let total = 0;
  let cursor: string | undefined;

  do {
    const result = await list({ token, cursor, limit: 1000 });
    for (const blob of result.blobs) {
      total += blob.size;
    }
    cursor = result.hasMore ? result.cursor : undefined;
  } while (cursor);

  return total;
}

export async function fetchStorageUsage() {
  const avatarToken = process.env.AVATAR_BLOB_READ_WRITE_TOKEN ?? "";
  const materialToken = process.env.MATERIAL_BLOB_READ_WRITE_TOKEN ?? "";

  const [avatarBytes, materialBytes] = await Promise.all([
    avatarToken ? sumStoreBytes(avatarToken) : Promise.resolve(0),
    materialToken ? sumStoreBytes(materialToken) : Promise.resolve(0),
  ]);

  const usedBytes = avatarBytes + materialBytes;

  return {
    usedBytes,
    limitBytes: LIMIT_BYTES,
    percent: Math.min(100, (usedBytes / LIMIT_BYTES) * 100),
    breakdown: { avatarBytes, materialBytes },
  };
}

export async function fetchActivityStats() {
  const startDate = new Date("2026-03-27T00:00:00Z");

  const stats = await db
    .select({
      day: sql<string>`DATE(${activityLogs.createdAt})`,
      value: count(),
    })
    .from(activityLogs)
    .where(gte(activityLogs.createdAt, startDate))
    .groupBy(sql`DATE(${activityLogs.createdAt})`)
    .orderBy(sql`DATE(${activityLogs.createdAt})`);

  const today = new Date();
  const result = [];
  let current = new Date(startDate);

  while (current <= today) {
    const dayStr = current.toISOString().split("T")[0];
    const match = stats.find((s) => s.day === dayStr);
    
    result.push({
      day: new Date(dayStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      value: match ? Number(match.value) : 0,
    });
    
    current.setDate(current.getDate() + 1);
  }

  return result;
}

const VALID_STATUSES = ["pending", "approved", "hidden"] as const;
const DEFAULT_COUNTS = { pending: 0, approved: 0, hidden: 0 };

function normalizeStatus(value: string | null) {
  return value && VALID_STATUSES.includes(value as (typeof VALID_STATUSES)[number])
    ? value
    : null;
}

function normalizePage(value: string | null) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 1;
  }
  return parsed;
}

function buildSearchCondition(search: string | null) {
  if (!search?.trim()) {
    return undefined;
  }
  const pattern = `%${search.trim()}%`;
  return or(
    ilike(posts.title, pattern),
    ilike(posts.content, pattern),
    ilike(users.name, pattern),
    ilike(courses.title, pattern)
  );
}

function combineWhere(conditions: Array<any>) {
  const applied = conditions.filter(Boolean);
  if (applied.length === 0) {
    return undefined;
  }
  return and(...applied);
}

function mapStatusCounts(rows: Array<{ status: string; count: number }>) {
  return rows.reduce(
    (acc, row) => {
      if (row.status === "pending") acc.pending = row.count;
      if (row.status === "approved") acc.approved = row.count;
      if (row.status === "hidden") acc.hidden = row.count;
      return acc;
    },
    { ...DEFAULT_COUNTS }
  );
}

export async function fetchModerationQueuePage(userId: number, role: string, statusParams: string | null, searchParamsStr: string | null, pageParam: string | null) {
  const normalizedStatus = normalizeStatus(statusParams);
  const search = searchParamsStr;
  const page = normalizePage(pageParam);
  const limit = 30;
  const offset = (page - 1) * limit;
  const searchCondition = buildSearchCondition(search);

  let scopeCondition: SQL | undefined = undefined;
  if (role === "mentor") {
    const mentorCourseIds = await getMentoredCourseIds(userId);
    if (mentorCourseIds.length === 0) {
      return {
        posts: [],
        page,
        hasMore: false,
        statusCounts: DEFAULT_COUNTS,
      };
    }
    scopeCondition = inArray(posts.courseId, mentorCourseIds);
  }

  const baseWhere = combineWhere([scopeCondition, searchCondition]);
  const rowsWhere = combineWhere([
    scopeCondition,
    searchCondition,
    normalizedStatus ? eq(posts.status, normalizedStatus) : undefined,
  ]);

  const [rows, statusCountRows] = await Promise.all([
    db
      .select({
        id: posts.id,
        title: posts.title,
        postType: posts.postType,
        status: posts.status,
        isPinned: posts.isPinned,
        questionStatus: posts.questionStatus,
        courseId: posts.courseId,
        courseTitle: courses.title,
        authorId: posts.authorId,
        authorName: users.name,
        createdAt: posts.createdAt,
        likeCount:
          sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(
            Number
          ),
        commentCount:
          sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(
            Number
          ),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(courses, eq(posts.courseId, courses.id))
      .where(rowsWhere)
      .orderBy(
        normalizedStatus
          ? desc(posts.createdAt)
          : sql`CASE
              WHEN ${posts.status} = 'pending' THEN 0
              WHEN ${posts.status} = 'hidden' THEN 1
              ELSE 2
            END`,
        desc(posts.createdAt)
      )
      .limit(limit)
      .offset(offset),
    db
      .select({
        status: posts.status,
        count: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(courses, eq(posts.courseId, courses.id))
      .where(baseWhere)
      .groupBy(posts.status),
  ]);

  return {
    posts: rows.map(r => ({ ...r, createdAt: r.createdAt?.toISOString() ?? new Date().toISOString() })),
    page,
    hasMore: rows.length === limit,
    statusCounts: mapStatusCounts(statusCountRows),
  };
}
