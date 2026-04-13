import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { MessagesInbox } from "../../components/messages/messages-inbox";

export const metadata: Metadata = {
  title: "Messages — StudyHub",
};

export default async function MessagesPage() {
  await getRequestUserOrRedirect();
  return <MessagesInbox />;
}
