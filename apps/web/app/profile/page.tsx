import { redirect } from "next/navigation";

import { ProfilePageClient } from "../../components/profile/profile-page-client";
import { getProfileUserById } from "../../lib/profile-data";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

export default async function ProfilePage() {
  const authUser = await getRequestUserOrRedirect();
  const profileUser = await getProfileUserById(authUser.sub);

  if (!profileUser) {
    redirect("/login");
  }

  return <ProfilePageClient initialUser={profileUser} />;
}
