import { asc, eq } from "drizzle-orm";

import { courses, modules } from "../../../drizzle/schema";
import type { ModuleInfo } from "../components/course/module-section";
import type { CourseDetailsData, CourseSummary } from "../components/course/types";
import { db } from "./db";

export async function getCourseSummaryById(courseId: number): Promise<CourseSummary | null> {
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
}

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

export async function getCourseDetailsData(courseId: number): Promise<CourseDetailsData | null> {
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
