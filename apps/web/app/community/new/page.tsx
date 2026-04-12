import type { Metadata } from "next";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";
import { CreatePostForm } from "../../../components/community/create-post-form";

export const metadata: Metadata = {
  title: "New Post — StudyHub",
};

export default async function NewPostPage() {
  await getRequestUserOrRedirect();
  return <CreatePostForm />;
}
