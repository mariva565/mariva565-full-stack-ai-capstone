import { db } from "./db";
import { posts, users, courses, postLikes, postBookmarks } from "../../../drizzle/schema";
import { desc, eq, and, or, sql, inArray } from "drizzle-orm";
import type { Post } from "../components/community/post-types";

const PAGE_LIMIT = 20;

/**
 * Server-side fetch of the first page of community posts.
 * Used by the page server component so PostCards render on first paint (SSR),
 * eliminating the client-side fetch that delays LCP.
 */
export async function fetchInitialPosts(userId: number): Promise<{ posts: Post[]; hasMore: boolean }> {
  const conditions = [
    or(
      eq(posts.status, "approved"),
      eq(posts.authorId, userId),
    )!,
  ];

  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      postType: posts.postType,
      status: posts.status,
      isPinned: posts.isPinned,
      questionStatus: posts.questionStatus,
      courseId: posts.courseId,
      courseTitle: courses.title,
      authorId: posts.authorId,
      authorName: users.name,
      authorAvatarUrl: users.avatarUrl,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      likeCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_id = ${posts.id})`.mapWith(Number),
      commentCount: sql<number>`(SELECT COUNT(*) FROM comments WHERE post_id = ${posts.id})`.mapWith(Number),
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(courses, eq(posts.courseId, courses.id))
    .where(and(...conditions))
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(PAGE_LIMIT)
    .offset(0);

  const postIds = rows.map((r) => r.id);
  const [likedRows, bookmarkedRows] = postIds.length > 0
    ? await Promise.all([
        db.select({ postId: postLikes.postId }).from(postLikes)
          .where(and(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds))),
        db.select({ postId: postBookmarks.postId }).from(postBookmarks)
          .where(and(eq(postBookmarks.userId, userId), inArray(postBookmarks.postId, postIds))),
      ])
    : [[], []];

  const likedSet = new Set(likedRows.map((r) => r.postId));
  const bookmarkedSet = new Set(bookmarkedRows.map((r) => r.postId));

  const result: Post[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    postType: r.postType,
    status: r.status,
    isPinned: r.isPinned,
    questionStatus: r.questionStatus,
    courseId: r.courseId,
    courseTitle: r.courseTitle,
    authorId: r.authorId,
    authorName: r.authorName ?? "Unknown",
    authorAvatarUrl: r.authorAvatarUrl,
    createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
    updatedAt: r.updatedAt?.toISOString?.() ?? (r.updatedAt ? String(r.updatedAt) : undefined),
    likeCount: r.likeCount,
    commentCount: r.commentCount,
    isLiked: likedSet.has(r.id),
    isBookmarked: bookmarkedSet.has(r.id),
  }));

  return { posts: result, hasMore: rows.length === PAGE_LIMIT };
}
