import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { isConversationMember } from "../../../lib/conversation-access";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";
import { ChatWindow } from "../../../components/messages/chat-window";

export const metadata: Metadata = {
  title: "Chat — StudyHub",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUserOrRedirect();
  const { id } = await params;
  const conversationId = Number(id);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    notFound();
  }

  const isMember = await isConversationMember(user.sub, conversationId);
  if (!isMember) {
    redirect("/forbidden");
  }

  return <ChatWindow conversationId={conversationId} currentUserId={user.sub} />;
}
