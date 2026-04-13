import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { requireAuth } from "../../../../lib/api-utils";
import { userPushTokens } from "../../../../../../drizzle/schema";
import { isExpoPushToken } from "../../../../lib/expo-push";

function sanitizeStringField(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

// POST /api/mobile/push-token
// Body: { token: string, platform?: string, appOwnership?: string }
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) {
    return auth.error;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const rawToken =
    body && typeof body === "object" && "token" in body
      ? (body as { token?: unknown }).token
      : undefined;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!token || !isExpoPushToken(token)) {
    return NextResponse.json(
      { code: "INVALID_TOKEN", message: "Invalid Expo push token" },
      { status: 400 }
    );
  }

  const rawPlatform =
    body && typeof body === "object" && "platform" in body
      ? (body as { platform?: unknown }).platform
      : undefined;
  const rawAppOwnership =
    body && typeof body === "object" && "appOwnership" in body
      ? (body as { appOwnership?: unknown }).appOwnership
      : undefined;

  const platform = sanitizeStringField(rawPlatform, 20) ?? "unknown";
  const appOwnership = sanitizeStringField(rawAppOwnership, 20);
  const now = new Date();

  const [existing] = await db
    .select({ id: userPushTokens.id, userId: userPushTokens.userId })
    .from(userPushTokens)
    .where(eq(userPushTokens.token, token))
    .limit(1);

  if (!existing) {
    await db.insert(userPushTokens).values({
      userId: auth.user.sub,
      token,
      platform,
      appOwnership,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  await db
    .update(userPushTokens)
    .set({
      userId: auth.user.sub,
      platform,
      appOwnership,
      isActive: true,
      lastSeenAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(userPushTokens.id, existing.id),
        eq(userPushTokens.token, token)
      )
    );

  return NextResponse.json({ ok: true });
}
