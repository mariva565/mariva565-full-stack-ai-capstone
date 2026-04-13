import { and, eq } from "drizzle-orm";
import { courseMembers } from "../../../drizzle/schema";
import { db } from "./db";
import type { JwtPayload } from "./jwt";

type PostAccessSnapshot = {
  authorId: number;
  status: string;
  courseId: number | null;
};

type PostModerationSnapshot = {
  courseId: number | null;
};

async function isMentorOfCourse(userId: number, courseId: number): Promise<boolean> {
  const [membership] = await db
    .select({ id: courseMembers.id })
    .from(courseMembers)
    .where(
      and(
        eq(courseMembers.userId, userId),
        eq(courseMembers.courseId, courseId),
        eq(courseMembers.role, "mentor")
      )
    )
    .limit(1);

  return !!membership;
}

export async function canUserAccessPost(
  user: JwtPayload,
  post: PostAccessSnapshot
): Promise<boolean> {
  if (post.status === "approved") {
    return true;
  }
  if (post.authorId === user.sub || user.role === "admin") {
    return true;
  }
  if (user.role !== "mentor" || post.courseId === null) {
    return false;
  }

  return isMentorOfCourse(user.sub, post.courseId);
}

export async function canUserModeratePost(
  user: JwtPayload,
  post: PostModerationSnapshot
): Promise<boolean> {
  if (user.role === "admin") {
    return true;
  }
  if (user.role !== "mentor" || post.courseId === null) {
    return false;
  }

  return isMentorOfCourse(user.sub, post.courseId);
}

export async function getMentoredCourseIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ courseId: courseMembers.courseId })
    .from(courseMembers)
    .where(
      and(
        eq(courseMembers.userId, userId),
        eq(courseMembers.role, "mentor")
      )
    );

  return rows.map((row) => row.courseId);
}
