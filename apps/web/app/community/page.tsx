import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../lib/server-auth";
import { CommunityFeed } from "../../components/community/community-feed";
import { fetchInitialPosts } from "../../lib/fetch-posts";

export const metadata: Metadata = {
  title: "Community — StudyHub",
};

export default async function CommunityPage() {
  const user = await getRequestUserOrRedirect();
  const initialData = await fetchInitialPosts(user.sub);
  return (
    <CommunityFeed
      currentUser={{ id: user.sub, role: user.role }}
      initialPosts={initialData.posts}
      initialHasMore={initialData.hasMore}
    />
  );
}
