import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { ModerationQueue } from "../../components/moderation/moderation-queue";

export const metadata: Metadata = {
  title: "Moderation Queue - StudyHub",
};

export default async function ModerationPage() {
  const user = await getRequestUserOrRedirect();
  if (user.role !== "mentor" && user.role !== "admin") {
    redirect("/forbidden");
  }

  const role = user.role === "admin" ? "admin" : "mentor";
  return <ModerationQueue role={role} />;
}

