export type ConversationOtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export type ConversationLastMessage = {
  content: string;
  senderId: number;
  createdAt: string;
};

export type ConversationListItem = {
  id: number;
  other: ConversationOtherUser | null;
  lastMessage: ConversationLastMessage | null;
};

export type ConversationMessage = {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
};

export type ConversationThreadResponse = {
  messages: ConversationMessage[];
  other: ConversationOtherUser | null;
};
