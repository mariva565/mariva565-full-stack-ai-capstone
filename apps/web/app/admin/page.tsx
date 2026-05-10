import { redirect } from "next/navigation";

import { AdminShell } from "../../components/admin/admin-shell";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

import { fetchAdminStats, fetchModerationQueueOverview, fetchStorageUsage, fetchActivityStats } from "../../lib/admin-queries";

export default async function AdminPage() {
  const user = await getRequestUserOrRedirect();
  if (user.role !== "admin") {
    redirect("/forbidden");
  }

  const [initialStats, initialQueue, initialStorage, initialActivity] = await Promise.all([
    fetchAdminStats(),
    fetchModerationQueueOverview(),
    fetchStorageUsage(),
    fetchActivityStats(),
  ]);

  return (
    <AdminShell 
      initialStats={initialStats} 
      initialQueue={initialQueue} 
      initialStorage={initialStorage}
      initialActivity={initialActivity}
    />
  );
}
