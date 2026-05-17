import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import {
  conversationMembers,
  messages,
  userPushTokens,
  users,
} from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { isConversationMember } from "../../../../../lib/conversation-access";
import { pusherServer } from "../../../../../lib/pusher";
import { sendExpoPushNotifications } from "../../../../../lib/expo-push";
import { and, eq, asc, inArray, ne } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

function apiError(status: number, code: string, message: string) {
  return NextResponse.json({ code, message }, { status });
}

function parseConversationId(rawId: string): number | null {
  const conversationId = Number(rawId);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return null;
  }
  return conversationId;
}

function getTimeMs(value: Date | string | null): number {
  if (!value) return 0;
  return new Date(value).getTime();
}

function toIsoString(value: Date | string | null): string | null {
  return value ? new Date(value).toISOString() : null;
}

// GET /api/conversations/[id]/messages — full message history + other participant
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const conversationId = parseConversationId(id);
  if (!conversationId) {
    return apiError(400, "INVALID_CONVERSATION_ID", "Invalid conversation ID");
  }
  const userId = auth.user.sub;

  const isMember = await isConversationMember(userId, conversationId);
  if (!isMember) {
    return apiError(403, "FORBIDDEN", "Forbidden");
  }

  const [rows, members] = await Promise.all([
    db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderAvatar: users.avatarUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt)),
    db
      .select({
        userId: conversationMembers.userId,
        name: users.name,
        avatarUrl: users.avatarUrl,
        lastReadAt: conversationMembers.lastReadAt,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(eq(conversationMembers.conversationId, conversationId)),
  ]);

  const currentMember = members.find((member) => member.userId === userId) ?? null;
  const lastMessageCreatedAt = rows.at(-1)?.createdAt ?? null;
  const shouldAdvanceReadCursor =
    lastMessageCreatedAt != null &&
    getTimeMs(lastMessageCreatedAt) > getTimeMs(currentMember?.lastReadAt ?? null);

  if (shouldAdvanceReadCursor) {
    await db
      .update(conversationMembers)
      .set({ lastReadAt: lastMessageCreatedAt })
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          eq(conversationMembers.userId, userId)
        )
      );

    await pusherServer.trigger(
      `private-conversation-${conversationId}`,
      "messages-read",
      {
        userId,
        lastReadAt: toIsoString(lastMessageCreatedAt),
      }
    );
  }

  const other = members.find((m) => m.userId !== userId) ?? null;

  return NextResponse.json({
    messages: rows,
    other: other ? { id: other.userId, name: other.name, avatarUrl: other.avatarUrl } : null,
    otherLastReadAt: toIsoString(other?.lastReadAt ?? null),
  });
}

// POST /api/conversations/[id]/messages — send a message + Pusher trigger
// Body: { content: string }
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const conversationId = parseConversationId(id);
  if (!conversationId) {
    return apiError(400, "INVALID_CONVERSATION_ID", "Invalid conversation ID");
  }

  const isMember = await isConversationMember(auth.user.sub, conversationId);
  if (!isMember) {
    return apiError(403, "FORBIDDEN", "Forbidden");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Invalid JSON payload");
  }

  const rawContent =
    body && typeof body === "object" && "content" in body
      ? (body as { content?: unknown }).content
      : "";
  const content = typeof rawContent === "string" ? rawContent.trim() : "";
  if (!content) {
    return apiError(400, "CONTENT_REQUIRED", "Content is required");
  }

  const [msg] = await db
    .insert(messages)
    .values({ conversationId, senderId: auth.user.sub, content })
    .returning();

  await db
    .update(conversationMembers)
    .set({ lastReadAt: msg.createdAt })
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, auth.user.sub)
      )
    );

  // Fetch sender name for Pusher payload
  const [sender] = await db
    .select({ name: users.name, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  // Trigger Pusher event on private channel
  await pusherServer.trigger(
    `private-conversation-${conversationId}`,
    "new-message",
    {
      id: msg.id,
      content: msg.content,
      createdAt: msg.createdAt,
      senderId: msg.senderId,
      senderName: sender?.name ?? "",
      senderAvatar: sender?.avatarUrl ?? null,
    }
  );

  // Best-effort mobile native push notifications for the other participants.
  try {
    const recipients = await db
      .select({ userId: conversationMembers.userId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.conversationId, conversationId),
          ne(conversationMembers.userId, auth.user.sub)
        )
      );

    const recipientIds = recipients.map((recipient) => recipient.userId);
    if (recipientIds.length > 0) {
      const tokens = await db
        .select({ token: userPushTokens.token })
        .from(userPushTokens)
        .where(
          and(
            inArray(userPushTokens.userId, recipientIds),
            eq(userPushTokens.isActive, true)
          )
        );

      if (tokens.length > 0) {
        const messagePreview =
          msg.content.length > 140 ? `${msg.content.slice(0, 137)}...` : msg.content;

        const { invalidTokens } = await sendExpoPushNotifications(
          tokens.map((entry) => ({
            token: entry.token,
            title: sender?.name ?? "New message on StudyHub",
            body: messagePreview,
            data: {
              type: "message",
              conversationId,
            },
          }))
        );

        if (invalidTokens.length > 0) {
          await db
            .update(userPushTokens)
            .set({ isActive: false, updatedAt: new Date() })
            .where(inArray(userPushTokens.token, invalidTokens));
        }
      }
    }
  } catch (error) {
    console.error("Failed to send mobile push notifications", error);
  }

  return NextResponse.json(msg, { status: 201 });
}
