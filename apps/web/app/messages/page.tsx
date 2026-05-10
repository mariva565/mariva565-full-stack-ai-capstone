import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { MessagesInbox } from "../../components/messages/messages-inbox";
import { fetchInitialConversations } from "../../lib/fetch-conversations";

export const metadata: Metadata = {
  title: "Messages — StudyHub",
};

export default async function MessagesPage() {
  const user = await getRequestUserOrRedirect();
  const initialConversations = await fetchInitialConversations(user.sub);
  return (
    <MessagesInbox
      currentUserId={user.sub}
      initialConversations={initialConversations}
    />
  );
}
