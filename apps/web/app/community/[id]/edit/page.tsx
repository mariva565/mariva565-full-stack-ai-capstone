import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

import { posts } from "../../../../../../drizzle/schema";
import { db } from "../../../../lib/db";
import { getRequestUserOrRedirect } from "../../../../lib/server-auth";
import { EditPostForm } from "../../../../components/community/edit-post-form";

export const metadata: Metadata = {
  title: "Edit Post — StudyHub",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  const user = await getRequestUserOrRedirect();
  const { id } = await params;
  const postId = parseInt(id, 10);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const [post] = await db
    .select({ authorId: posts.authorId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    notFound();
  }

  if (post.authorId !== user.sub && user.role !== "admin") {
    redirect("/forbidden");
  }

  return <EditPostForm postId={postId} />;
}
