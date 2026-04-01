import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { verifyToken } from "../../../../lib/jwt";
import { eq } from "drizzle-orm";
import { logActivity } from "../../../../lib/activity";
import { deleteAvatarByUrl } from "../../../../lib/r2";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { code: "NOT_AUTHENTICATED", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { code: "INVALID_TOKEN", message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { code: "NOT_AUTHENTICATED", message: "Not authenticated" },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { code: "INVALID_TOKEN", message: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    name?: string;
    avatarUrl?: string | null;
  };
  const updates: { name?: string; avatarUrl?: string | null } = {};
  const [currentUser] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!currentUser) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found" },
      { status: 404 }
    );
  }

  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }

  if (typeof body.avatarUrl === "string") {
    const normalizedAvatarUrl = body.avatarUrl.trim();
    updates.avatarUrl = normalizedAvatarUrl || null;
  }

  if (body.avatarUrl === null) {
    updates.avatarUrl = null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { code: "NO_CHANGES", message: "No valid fields to update" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, payload.sub))
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
    });

  await logActivity(payload.sub, "update_profile", updated.id, { fields: Object.keys(updates) });

  if (
    Object.prototype.hasOwnProperty.call(updates, "avatarUrl") &&
    currentUser.avatarUrl &&
    currentUser.avatarUrl !== updated.avatarUrl
  ) {
    try {
      await deleteAvatarByUrl(currentUser.avatarUrl);
    } catch (cleanupError) {
      console.error("Failed to delete replaced avatar from R2:", cleanupError);
    }
  }

  return NextResponse.json({ user: updated });
}
