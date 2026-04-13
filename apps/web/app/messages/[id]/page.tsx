import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";
import { ChatWindow } from "../../../components/messages/chat-window";

export const metadata: Metadata = {
  title: "Chat — StudyHub",
};

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUserOrRedirect();
  const { id } = await params;
  return <ChatWindow conversationId={Number(id)} currentUserId={user.sub} />;
}
