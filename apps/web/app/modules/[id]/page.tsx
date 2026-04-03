import { redirect } from "next/navigation";

import { ModuleWorkspaceClientPage } from "../../../components/modules/module-workspace-client-page";
import { getModuleWorkspaceData } from "../../../lib/module-workspace-data";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";

type ModuleWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModuleWorkspacePage({ params }: ModuleWorkspacePageProps) {
  const user = await getRequestUserOrRedirect();

  const { id } = await params;
  const moduleId = Number(id);
  if (!Number.isInteger(moduleId) || moduleId < 1) {
    redirect("/dashboard");
  }

  const workspaceData = await getModuleWorkspaceData(user.sub, moduleId);
  if (!workspaceData) {
    redirect("/dashboard");
  }

  return <ModuleWorkspaceClientPage key={workspaceData.module.id} initialData={workspaceData} />;
}
