import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ConversationListItem } from "./messages.types";

const MESSAGES_READ_STATE_KEY = "studyhub_messages_read_state_v1";

export type MessagesReadState = Record<string, string>;

function sanitizeReadState(raw: unknown): MessagesReadState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const result: MessagesReadState = {};
  for (const [conversationId, readAt] of Object.entries(
    raw as Record<string, unknown>
  )) {
    if (typeof readAt === "string" && readAt.length > 0) {
      result[conversationId] = readAt;
    }
  }
  return result;
}

export async function loadMessagesReadState(): Promise<MessagesReadState> {
  const raw = await AsyncStorage.getItem(MESSAGES_READ_STATE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return sanitizeReadState(JSON.parse(raw));
  } catch {
    return {};
  }
}

export async function markConversationRead(
  conversationId: number,
  readAtIso: string = new Date().toISOString()
): Promise<MessagesReadState> {
  const current = await loadMessagesReadState();
  const next: MessagesReadState = {
    ...current,
    [String(conversationId)]: readAtIso,
  };
  await AsyncStorage.setItem(MESSAGES_READ_STATE_KEY, JSON.stringify(next));
  return next;
}

export function getUnreadConversationCount(
  conversations: ConversationListItem[],
  currentUserId: number | undefined,
  readState: MessagesReadState
): number {
  if (!currentUserId) {
    return 0;
  }

  let unreadCount = 0;
  for (const conversation of conversations) {
    const lastMessage = conversation.lastMessage;
    if (!lastMessage) {
      continue;
    }

    if (lastMessage.senderId === currentUserId) {
      continue;
    }

    const readAtIso = readState[String(conversation.id)];
    if (!readAtIso) {
      unreadCount += 1;
      continue;
    }

    const lastMessageAt = Date.parse(lastMessage.createdAt);
    const readAt = Date.parse(readAtIso);
    if (Number.isNaN(readAt) || Number.isNaN(lastMessageAt) || lastMessageAt > readAt) {
      unreadCount += 1;
    }
  }

  return unreadCount;
}

