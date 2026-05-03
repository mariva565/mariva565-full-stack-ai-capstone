import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { users } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "../../../../lib/activity";
import { requireAuth } from "../../../../lib/api-utils";
import { getProfileUserById, getProfileUserSelection, normalizeProfileUser } from "../../../../lib/profile-data";
import { deleteAvatarBlob, isValidAvatarBlobUrl } from "../../../../lib/blob-storage";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const user = await getProfileUserById(auth.user.sub);

  if (!user) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const body = (await request.json()) as {
    name?: string;
    avatarUrl?: string | null;
  };
  const updates: { name?: string; avatarUrl?: string | null } = {};
  const [currentUser] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
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
    if (normalizedAvatarUrl) {
      if (!isValidAvatarBlobUrl(normalizedAvatarUrl)) {
        return NextResponse.json(
          {
            code: "INVALID_AVATAR_URL",
            message: "Avatar URL must be from the configured storage bucket",
          },
          { status: 400 }
        );
      }
      updates.avatarUrl = normalizedAvatarUrl;
    } else {
      updates.avatarUrl = null;
    }
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
    .where(eq(users.id, auth.user.sub))
    .returning(getProfileUserSelection());

  await logActivity(auth.user.sub, "update_profile", updated.id, { fields: Object.keys(updates) });

  if (
    Object.prototype.hasOwnProperty.call(updates, "avatarUrl") &&
    currentUser.avatarUrl &&
    currentUser.avatarUrl !== updated.avatarUrl
  ) {
    try {
      await deleteAvatarBlob(currentUser.avatarUrl);
    } catch (cleanupError) {
      console.error("Failed to delete replaced avatar from Blob:", cleanupError);
    }
  }

  return NextResponse.json({ user: normalizeProfileUser(updated) });
}
