import type { Metadata } from "next";

import { DashboardClientPage } from "../../components/dashboard/dashboard-client-page";
import { getDashboardData } from "../../lib/dashboard-data";
import { getRequestUserOrRedirect } from "../../lib/server-auth";

export const metadata: Metadata = {
  title: "Courses — StudyHub",
};

export default async function DashboardPage() {
  const user = await getRequestUserOrRedirect();
  const dashboardData = await getDashboardData(user.sub);

  return (
    <DashboardClientPage
      initialCourses={dashboardData.courses}
      initialFavorites={dashboardData.favorites}
      initialShared={dashboardData.shared}
      initialModuleCount={dashboardData.moduleCount}
      initialMaterialCount={dashboardData.materialCount}
    />
  );
}
