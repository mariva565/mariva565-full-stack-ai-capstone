import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { posts, users, courses } from "../../../../../../drizzle/schema";
import { requireAuth, requireMentor } from "../../../../lib/api-utils";
import { getMentoredCourseIds } from "../../../../lib/post-access";

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

// GET /api/admin/posts - moderation queue (mentor/admin scoped)
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;
  const mentorErr = requireMentor(auth.user);
  if (mentorErr) return mentorErr;

  const { searchParams } = new URL(request.url);
  const normalizedStatus = normalizeStatus(searchParams.get("status"));
  const search = searchParams.get("search");
  const page = normalizePage(searchParams.get("page"));
  const limit = 30;
  const offset = (page - 1) * limit;
  const searchCondition = buildSearchCondition(search);

  let scopeCondition: SQL | undefined = undefined;
  if (auth.user.role === "mentor") {
    const mentorCourseIds = await getMentoredCourseIds(auth.user.sub);
    if (mentorCourseIds.length === 0) {
      return NextResponse.json({
        posts: [],
        page,
        hasMore: false,
        statusCounts: DEFAULT_COUNTS,
      });
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

  return NextResponse.json({
    posts: rows,
    page,
    hasMore: rows.length === limit,
    statusCounts: mapStatusCounts(statusCountRows),
  });
}

