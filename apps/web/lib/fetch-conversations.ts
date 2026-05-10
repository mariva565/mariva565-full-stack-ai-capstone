import { db } from "./db";
import {
  conversations,
  conversationMembers,
  messages,
  users,
} from "../../../drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";

type OtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type LastMessage = {
  content: string;
  senderId: number;
  createdAt: string;
};

export type ConversationSummary = {
  id: number;
  other: OtherUser | null;
  lastMessage: LastMessage | null;
  hasUnread: boolean;
  unreadCount: number;
};

/**
 * Server-side fetch of conversations for the messages inbox.
 * Eliminates client-side fetch delay that blocks LCP.
 */
export async function fetchInitialConversations(userId: number): Promise<ConversationSummary[]> {
  const myMemberships = await db
    .select({
      conversationId: conversationMembers.conversationId,
      lastReadAt: conversationMembers.lastReadAt,
    })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, userId));

  if (myMemberships.length === 0) return [];

  const convIds = myMemberships.map((m) => m.conversationId);
  const lastReadAtByConversation = new Map<number, Date | string | null>(
    myMemberships.map((membership) => [
      membership.conversationId,
      membership.lastReadAt ?? null,
    ])
  );

  const [allMembers, allMessages] = await Promise.all([
    db
      .select({
        conversationId: conversationMembers.conversationId,
        userId: conversationMembers.userId,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(conversationMembers)
      .innerJoin(users, eq(conversationMembers.userId, users.id))
      .where(inArray(conversationMembers.conversationId, convIds)),
    db
      .select({
        conversationId: messages.conversationId,
        content: messages.content,
        senderId: messages.senderId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.conversationId, convIds))
      .orderBy(desc(messages.createdAt)),
  ]);

  const lastMessageMap = new Map<number, { content: string; senderId: number; createdAt: Date }>();
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
    if (msg.senderId === userId) continue;

    const readAtMs = getTimeMs(lastReadAtByConversation.get(msg.conversationId));
    const messageAtMs = getTimeMs(msg.createdAt);
    const isUnread = Number.isNaN(readAtMs) || Number.isNaN(messageAtMs) || messageAtMs > readAtMs;

    if (isUnread) {
      const prev = unreadCountMap.get(msg.conversationId) ?? 0;
      unreadCountMap.set(msg.conversationId, prev + 1);
    }
  }

  const result: ConversationSummary[] = convIds.map((convId) => {
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
        ? {
            content: lastMsg.content,
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt?.toISOString?.() ?? String(lastMsg.createdAt),
          }
        : null,
      hasUnread: unreadCount > 0,
      unreadCount,
    };
  });

  result.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return result;
}
