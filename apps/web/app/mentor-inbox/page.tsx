import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { MentorInbox } from "../../components/mentor/mentor-inbox";

export const metadata: Metadata = {
  title: "Mentor Inbox — StudyHub",
};

export default async function MentorInboxPage() {
  const user = await getRequestUserOrRedirect();
  if (user.role !== "mentor" && user.role !== "admin") {
    redirect("/forbidden");
  }
  return <MentorInbox />;
}
