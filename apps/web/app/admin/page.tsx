import { redirect } from "next/navigation";

import { AdminShell } from "../../components/admin/admin-shell";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

export default async function AdminPage() {
  const user = await getRequestUserOrRedirect();
  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  return <AdminShell />;
}
