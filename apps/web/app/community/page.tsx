import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { CommunityFeed } from "../../components/community/community-feed";

export const metadata: Metadata = {
  title: "Community — StudyHub",
};

export default async function CommunityPage() {
  const user = await getRequestUserOrRedirect();
  return <CommunityFeed currentUser={{ id: user.sub, role: user.role }} />;
}
