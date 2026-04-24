import { cache } from "react";
import { and, asc, eq, or } from "drizzle-orm";

import { courseMembers, courses, modules } from "../../../drizzle/schema";
import type { ModuleInfo } from "../components/course/module-section";
import type { CourseDetailsData, CourseSummary } from "../components/course/types";
import type { JwtPayload } from "./jwt";
import { db } from "./db";

export async function userCanAccessCourse(
  user: JwtPayload,
  courseId: number
): Promise<boolean> {
  if (user.role === "admin") return true;

  const [access] = await db
    .select({ id: courses.id })
    .from(courses)
    .leftJoin(
      courseMembers,
      and(
        eq(courseMembers.courseId, courses.id),
        eq(courseMembers.userId, user.sub)
      )
    )
    .where(
      and(
        eq(courses.id, courseId),
        or(
          eq(courses.createdBy, user.sub),
          eq(courseMembers.userId, user.sub)
        )
      )
    )
    .limit(1);

  return Boolean(access);
}

export const getCourseSummaryById = cache(async function getCourseSummaryById(courseId: number): Promise<CourseSummary | null> {
  const [course] = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
    })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  return course ?? null;
});

export async function getCourseModules(courseId: number): Promise<ModuleInfo[]> {
  return db
    .select({
      id: modules.id,
      courseId: modules.courseId,
      title: modules.title,
      description: modules.description,
      orderIndex: modules.orderIndex,
    })
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(asc(modules.orderIndex));
}

export async function getCourseDetailsData(
  user: JwtPayload,
  courseId: number
): Promise<CourseDetailsData | null> {
  const hasAccess = await userCanAccessCourse(user, courseId);
  if (!hasAccess) {
    return null;
  }

  const [course, courseModules] = await Promise.all([
    getCourseSummaryById(courseId),
    getCourseModules(courseId),
  ]);

  if (!course) {
    return null;
  }

  return {
    course,
    modules: courseModules,
  };
}
