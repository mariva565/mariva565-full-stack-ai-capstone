import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../../../lib/server-auth";
import { EditPostForm } from "../../../../components/community/edit-post-form";

export const metadata: Metadata = {
  title: "Edit Post — StudyHub",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await getRequestUserOrRedirect();
  const { id } = await params;
  return <EditPostForm postId={parseInt(id, 10)} />;
}
