import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../../../drizzle/schema";
import { logActivity } from "../../../../lib/activity";
import { requireAuth } from "../../../../lib/api-utils";
import { db } from "../../../../lib/db";
import { getProfileUserSelection, normalizeProfileUser } from "../../../../lib/profile-data";
import { deleteAvatarBlob, uploadAvatarBlob, validateAvatarBlob } from "../../../../lib/blob-storage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  const formData = await request.formData();
  // TypeScript in this environment occasionally misses DOM FormData methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileEntry = (formData as any).get("file");
  if (!(fileEntry instanceof File)) {
    return NextResponse.json(
      { code: "MISSING_FILE", message: "Select an image file to upload." },
      { status: 400 }
    );
  }

  const validationMessage = validateAvatarBlob(fileEntry);
  if (validationMessage) {
    return NextResponse.json(
      { code: "INVALID_FILE", message: validationMessage },
      { status: 400 }
    );
  }

  const [existingUser] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  if (!existingUser) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found." },
      { status: 404 }
    );
  }

  let uploadedAvatarUrl: string | null = null;

  try {
    uploadedAvatarUrl = await uploadAvatarBlob({
      userId: auth.user.sub,
      file: fileEntry,
    });

    const [updatedUser] = await db
      .update(users)
      .set({ avatarUrl: uploadedAvatarUrl })
      .where(eq(users.id, auth.user.sub))
      .returning(getProfileUserSelection());

    if (existingUser.avatarUrl && existingUser.avatarUrl !== uploadedAvatarUrl) {
      try {
        await deleteAvatarBlob(existingUser.avatarUrl);
      } catch (cleanupError) {
        console.error("Failed to delete previous avatar from Blob:", cleanupError);
      }
    }

    await logActivity(auth.user.sub, "upload_avatar", auth.user.sub, {
      contentType: fileEntry.type,
      size: fileEntry.size,
    });

    return NextResponse.json({ user: normalizeProfileUser(updatedUser) });
  } catch (error) {
    if (uploadedAvatarUrl) {
      try {
        await deleteAvatarBlob(uploadedAvatarUrl);
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded avatar after error:", cleanupError);
      }
    }

    const message =
      error instanceof Error ? error.message : "Avatar upload failed.";

    return NextResponse.json(
      { code: "UPLOAD_FAILED", message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  const [existingUser] = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  if (!existingUser) {
    return NextResponse.json(
      { code: "USER_NOT_FOUND", message: "User not found." },
      { status: 404 }
    );
  }

  try {
    if (existingUser.avatarUrl) {
      await deleteAvatarBlob(existingUser.avatarUrl);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ avatarUrl: null })
      .where(eq(users.id, auth.user.sub))
      .returning(getProfileUserSelection());

    await logActivity(auth.user.sub, "remove_avatar", auth.user.sub);

    return NextResponse.json({ user: normalizeProfileUser(updatedUser) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove avatar.";

    return NextResponse.json(
      { code: "REMOVE_FAILED", message },
      { status: 500 }
    );
  }
}
