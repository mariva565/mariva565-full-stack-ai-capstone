import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  conversations,
  conversationMembers,
  messages,
  users,
} from "../../../../../drizzle/schema";
import { requireAuth } from "../../../lib/api-utils";
import { and, eq, inArray, desc } from "drizzle-orm";

// GET /api/conversations — list my conversations with last message + other participant
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const userId = auth.user.sub;

  // Find all conversation IDs I'm part of
  const myMemberships = await db
    .select({
      conversationId: conversationMembers.conversationId,
      lastReadAt: conversationMembers.lastReadAt,
    })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId));

  if (myMemberships.length === 0) {
    return NextResponse.json([]);
  }

  const convIds = myMemberships.map((m) => m.conversationId);
  const lastReadAtByConversation = new Map<number, Date | string | null>(
    myMemberships.map((membership) => [
      membership.conversationId,
      membership.lastReadAt ?? null,
    ])
  );

  // For each conversation, get all members (to find the other person)
  const allMembers = await db
    .select({
      conversationId: conversationMembers.conversationId,
      userId: conversationMembers.userId,
      userName: users.name,
      userAvatar: users.avatarUrl,
    })
    .from(conversationMembers)
    .innerJoin(users, eq(conversationMembers.userId, users.id))
    .where(inArray(conversationMembers.conversationId, convIds));

  // Get messages for these conversations, newest first
  const allMessages = await db
    .select({
      conversationId: messages.conversationId,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(inArray(messages.conversationId, convIds))
    .orderBy(desc(messages.createdAt));

  // Keep only the last message per conversation and compute unread counts.
  const lastMessageMap = new Map<
    number,
    { content: string; senderId: number; createdAt: Date }
  >();
  const unreadCountMap = new Map<number, number>();

  function getTimeMs(value: Date | string | null | undefined): number {
    if (!value) return Number.NaN;
    if (value instanceof Date) return value.getTime();
    return Date.parse(value);
  }

  for (const msg of allMessages) {
    if (!lastMessageMap.has(msg.conversationId)) {
      lastMessageMap.set(msg.conversationId, msg);
    }

    if (msg.senderId === userId) {
      continue;
    }

    const readAtMs = getTimeMs(lastReadAtByConversation.get(msg.conversationId));
    const messageAtMs = getTimeMs(msg.createdAt);
    const isUnread =
      Number.isNaN(readAtMs) ||
      Number.isNaN(messageAtMs) ||
      messageAtMs > readAtMs;

    if (isUnread) {
      const prev = unreadCountMap.get(msg.conversationId) ?? 0;
      unreadCountMap.set(msg.conversationId, prev + 1);
    }
  }

  const result = convIds.map((convId) => {
    const members = allMembers.filter((m) => m.conversationId === convId);
    const other = members.find((m) => m.userId !== userId);
    const lastMsg = lastMessageMap.get(convId);
    const unreadCount = unreadCountMap.get(convId) ?? 0;
    return {
      id: convId,
      other: other
        ? { id: other.userId, name: other.userName, avatarUrl: other.userAvatar }
        : null,
      lastMessage: lastMsg
        ? { content: lastMsg.content, senderId: lastMsg.senderId, createdAt: lastMsg.createdAt }
        : null,
      hasUnread: unreadCount > 0,
      unreadCount,
    };
  });

  // Sort by last message time (newest first)
  result.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt?.getTime?.() ?? 0;
    const bTime = b.lastMessage?.createdAt?.getTime?.() ?? 0;
    return bTime - aTime;
  });

  return NextResponse.json(result);
}

// POST /api/conversations — start a conversation with another user
// Body: { userId: number }
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const myId = auth.user.sub;
  const body = await request.json();
  const otherUserId = Number(body.userId);

  if (!otherUserId || otherUserId === myId) {
    return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
  }

  // Check the other user exists
  const [otherUser] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, otherUserId))
    .limit(1);

  if (!otherUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Check if a conversation already exists between these two users
  const myConvs = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, myId));

  if (myConvs.length > 0) {
    const myConvIds = myConvs.map((m) => m.conversationId);
    const existing = await db
      .select({ conversationId: conversationMembers.conversationId })
      .from(conversationMembers)
      .where(
        and(
          eq(conversationMembers.userId, otherUserId),
          inArray(conversationMembers.conversationId, myConvIds)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ id: existing[0].conversationId });
    }
  }

  // Create new conversation
  const [conv] = await db
    .insert(conversations)
    .values({})
    .returning({ id: conversations.id });

  await db.insert(conversationMembers).values([
    { conversationId: conv.id, userId: myId },
    { conversationId: conv.id, userId: otherUserId },
  ]);

  return NextResponse.json({ id: conv.id }, { status: 201 });
}
