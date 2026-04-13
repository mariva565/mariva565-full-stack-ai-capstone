import { notFound, redirect } from "next/navigation";
import { PublicProfileView } from "../../../components/profile/public-profile-view";
import { getProfileUserById } from "../../../lib/profile-data";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";

type Params = {
  params: Promise<{ id: string }>;
};

function parseUserId(rawId: string): number | null {
  const parsed = Number(rawId);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export default async function PublicProfilePage({ params }: Params) {
  const authUser = await getRequestUserOrRedirect();
  const { id } = await params;
  const targetUserId = parseUserId(id);

  if (!targetUserId) {
    notFound();
  }

  if (targetUserId === authUser.sub) {
    redirect("/profile");
  }

  const profileUser = await getProfileUserById(targetUserId);
  if (!profileUser) {
    notFound();
  }

  return <PublicProfileView viewerId={authUser.sub} profileUser={profileUser} />;
}

