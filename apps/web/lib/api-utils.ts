import { NextRequest, NextResponse } from "next/server";
import { verifyToken, type JwtPayload } from "./jwt";
import { db } from "./db";
import { courseMembers } from "../../../drizzle/schema";
import { and, eq } from "drizzle-orm";

/**
 * Extract and verify the JWT from request cookies or Authorization header.
 * Supports both cookie-based auth (web) and Bearer token auth (mobile).
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: JwtPayload } | { error: NextResponse }> {
  // Try cookie first, then Authorization: Bearer header
  let token = request.cookies.get("token")?.value;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return {
      error: NextResponse.json(
        { code: "NOT_AUTHENTICATED", message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      error: NextResponse.json(
        { code: "INVALID_TOKEN", message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }

  return { user: payload };
}

/**
 * Require admin role. Call after requireAuth.
 */
export function requireAdmin(user: JwtPayload): NextResponse | null {
  if (user.role !== "admin") {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Admin access required" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Require mentor or admin role. Call after requireAuth.
 */
export function requireMentor(user: JwtPayload): NextResponse | null {
  if (user.role !== "mentor" && user.role !== "admin") {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Mentor access required" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if the user is a mentor (or admin) for a specific course.
 * Returns null if allowed, or a 403 NextResponse if not.
 */
export async function requireCourseMentor(
  user: JwtPayload,
  courseId: number
): Promise<NextResponse | null> {
  if (user.role === "admin") return null;

  const [membership] = await db
    .select({ role: courseMembers.role })
    .from(courseMembers)
    .where(
      and(
        eq(courseMembers.courseId, courseId),
        eq(courseMembers.userId, user.sub)
      )
    )
    .limit(1);

  if (!membership || membership.role !== "mentor") {
    return NextResponse.json(
      { code: "FORBIDDEN", message: "Course mentor access required" },
      { status: 403 }
    );
  }
  return null;
}
