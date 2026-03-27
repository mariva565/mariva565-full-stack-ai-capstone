import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { users, courses, modules, materials, favorites, activityLogs } from "../../../../../../../drizzle/schema";
import { requireAuth, requireAdmin } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { eq } from "drizzle-orm";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid user ID" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { role } = body;

  if (!role || !["user", "admin"].includes(role)) {
    return NextResponse.json(
      { code: "INVALID_ROLE", message: "Role must be 'user' or 'admin'" },
      { status: 400 }
    );
  }

  if (userId === auth.user.sub) {
    return NextResponse.json(
      { code: "SELF_ROLE_CHANGE", message: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, userId))
    .returning({ id: users.id, email: users.email, name: users.name, role: users.role });

  if (!updated) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "User not found" },
      { status: 404 }
    );
  }

  await logActivity(auth.user.sub, "change_user_role", userId, { newRole: role });

  return NextResponse.json({ user: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const forbidden = requireAdmin(auth.user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return NextResponse.json(
      { code: "INVALID_ID", message: "Invalid user ID" },
      { status: 400 }
    );
  }

  if (userId === auth.user.sub) {
    return NextResponse.json(
      { code: "SELF_DELETE", message: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "User not found" },
      { status: 404 }
    );
  }

  // Clean up user's data (favorites, activity logs) then delete user
  await db.delete(favorites).where(eq(favorites.userId, userId));
  await db.delete(activityLogs).where(eq(activityLogs.userId, userId));

  // Delete materials created by user, then modules, then courses
  await db.delete(materials).where(eq(materials.createdBy, userId));
  await db.delete(modules).where(eq(modules.createdBy, userId));
  await db.delete(courses).where(eq(courses.createdBy, userId));

  await db.delete(users).where(eq(users.id, userId));

  await logActivity(auth.user.sub, "delete_user", userId, { email: existing.email });

  return NextResponse.json({ message: "User deleted" });
}
