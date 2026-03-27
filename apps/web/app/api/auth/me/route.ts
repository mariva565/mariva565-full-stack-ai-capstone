import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { verifyToken } from "../../../../lib/jwt";
import { eq } from "drizzle-orm";
import { logActivity } from "../../../../lib/activity";

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

  const body = await request.json();
  const { name, avatarUrl } = body;

  const updates: Record<string, string> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof avatarUrl === "string") updates.avatarUrl = avatarUrl;

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

  return NextResponse.json({ user: updated });
}
