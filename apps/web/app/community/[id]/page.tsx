import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";
import { PostDetails } from "../../../components/community/post-details";

export const metadata: Metadata = {
  title: "Post — StudyHub",
};

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const user = await getRequestUserOrRedirect();
  const { id } = await params;
  return <PostDetails postId={parseInt(id, 10)} currentUser={{ id: user.sub, role: user.role }} />;
}
