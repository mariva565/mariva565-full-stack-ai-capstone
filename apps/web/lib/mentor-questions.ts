import { db } from "./db";
import { posts, users, courses, courseMembers } from "../../../drizzle/schema";
import { eq, and, inArray, desc, sql } from "drizzle-orm";

export async function fetchMentorQuestions(userId: number, role: string, status?: string | null) {
  let courseIds: number[] | null = null;

  if (role === "mentor") {
    // Get courses this user mentors
    const memberships = await db
      .select({ courseId: courseMembers.courseId })
      .from(courseMembers)
      .where(and(eq(courseMembers.userId, userId), eq(courseMembers.role, "mentor")));
    courseIds = memberships.map((m) => m.courseId);
    if (courseIds.length === 0) {
      return [];
    }
  }

  const conditions = [eq(posts.postType, "question")];
  if (courseIds) conditions.push(inArray(posts.courseId, courseIds));
  if (status) conditions.push(eq(posts.questionStatus, status));

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      questionStatus: posts.questionStatus,
      courseId: posts.courseId,
      courseTitle: courses.title,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      createdAt: posts.createdAt,
      likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));

  return rows.map(r => ({
    ...r,
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString()
  }));
}
