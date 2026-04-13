import { NavbarClient } from "./navbar-client";
import { getProfileUserById } from "../lib/profile-data";
import { getRequestUserOrNull } from "../lib/server-auth";

export async function Navbar() {
  const authUser = await getRequestUserOrNull();
  const profileUser = authUser ? await getProfileUserById(authUser.sub) : null;

  const navbarUser = profileUser
    ? {
        id: profileUser.id,
        name: profileUser.name,
        role: profileUser.role,
        avatarUrl: profileUser.avatarUrl,
      }
    : null;

  return <NavbarClient initialUser={navbarUser} />;
}
