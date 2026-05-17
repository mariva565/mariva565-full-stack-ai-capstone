import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { modules, courses } from "../../../../../../../drizzle/schema";
import { requireAuth, requireCourseMentor } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import {
  getCourseModules,
  userCanAccessCourse,
} from "../../../../../lib/course-details-data";
import { eq, max } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

async function getNextModuleOrderIndex(courseId: number) {
  const [result] = await db
    .select({ maxOrderIndex: max(modules.orderIndex) })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  return (result?.maxOrderIndex ?? -1) + 1;
}

function isValidOrderIndex(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

// GET /api/courses/:id/modules
export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const courseId = Number(id);
  const hasAccess = await userCanAccessCourse(auth.user, courseId);

  if (!hasAccess) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Course not found" },
      { status: 404 }
    );
  }

  const rows = await getCourseModules(courseId);

  return NextResponse.json({ modules: rows });
}

// POST /api/courses/:id/modules
export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const courseId = Number(id);
  const body = await request.json();
  const { title, description, orderIndex } = body;

  if (!title) {
    return NextResponse.json(
      { code: "MISSING_TITLE", message: "Title is required" },
      { status: 400 }
    );
  }

  // Verify caller owns the course, is a course mentor, or is admin
  if (auth.user.role !== "admin") {
    const [parentCourse] = await db
      .select({ createdBy: courses.createdBy })
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!parentCourse) {
      return NextResponse.json(
        { code: "NOT_FOUND", message: "Course not found" },
        { status: 404 }
      );
    }

    if (parentCourse.createdBy !== auth.user.sub) {
      const mentorCheck = await requireCourseMentor(auth.user, courseId);
      if (mentorCheck) return mentorCheck;
    }
  }

  const nextOrderIndex = isValidOrderIndex(orderIndex)
    ? orderIndex
    : await getNextModuleOrderIndex(courseId);

  const [mod] = await db
    .insert(modules)
    .values({
      courseId,
      title,
      description: description ?? null,
      orderIndex: nextOrderIndex,
      createdBy: auth.user.sub,
    })
    .returning();

  await logActivity(auth.user.sub, "create_module", mod.id, {
    title: mod.title,
    description: mod.description,
    courseId,
  });

  return NextResponse.json({ module: mod }, { status: 201 });
}
