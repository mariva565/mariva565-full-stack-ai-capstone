import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { users } from "../../../../../../drizzle/schema";
import { logActivity } from "../../../../lib/activity";
import { hashPassword, verifyPassword } from "../../../../lib/auth";
import { requireAuth } from "../../../../lib/api-utils";
import { db } from "../../../../lib/db";
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from "../../../../lib/password-validation";

type PasswordPayload = {
  currentPassword?: string;
  newPassword?: string;
};

function getValidationMessage(payload: PasswordPayload): string | null {
  if (!payload.currentPassword || !payload.newPassword) {
    return "Current password and new password are required.";
  }

  if (!isStrongPassword(payload.newPassword)) {
    return PASSWORD_POLICY_MESSAGE;
  }

  if (payload.currentPassword === payload.newPassword) {
    return "Choose a new password different from the current one.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  const payload = (await request.json()) as PasswordPayload;
  const validationMessage = getValidationMessage(payload);
  if (validationMessage) {
    return NextResponse.json(
      { code: "INVALID_PASSWORD", message: validationMessage },
      { status: 400 }
    );
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  if (!user || !verifyPassword(payload.currentPassword!, user.passwordHash)) {
    return NextResponse.json(
      { code: "INVALID_CREDENTIALS", message: "Current password is incorrect." },
      { status: 401 }
    );
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(payload.newPassword!) })
    .where(eq(users.id, auth.user.sub));

  await logActivity(auth.user.sub, "change_password", auth.user.sub, {
    source: "profile",
  });

  return NextResponse.json({ message: "Password updated successfully." });
}
