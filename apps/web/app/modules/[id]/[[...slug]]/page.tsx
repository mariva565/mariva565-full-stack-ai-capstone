import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModuleWorkspaceClientPage } from "../../../../components/modules/module-workspace-client-page";
import { getModuleContext, getModuleWorkspaceData } from "../../../../lib/module-workspace-data";
import { getRequestUserOrRedirect } from "../../../../lib/server-auth";

type ModuleWorkspacePageProps = {
  params: Promise<{ id: string; slug?: string[] }>;
};

export async function generateMetadata({ params }: ModuleWorkspacePageProps): Promise<Metadata> {
  const { id } = await params;
  const moduleId = Number(id);
  if (!Number.isInteger(moduleId) || moduleId < 1) {
    return { title: "Module — StudyHub" };
  }

  const context = await getModuleContext(moduleId);
  if (!context) {
    return { title: "Module — StudyHub" };
  }

  return {
    title: `${context.module.title} › ${context.course.title} — StudyHub`,
  };
}

export default async function ModuleWorkspacePage({ params }: ModuleWorkspacePageProps) {
  const user = await getRequestUserOrRedirect();

  const { id } = await params;
  const moduleId = Number(id);
  if (!Number.isInteger(moduleId) || moduleId < 1) {
    notFound();
  }

  const workspaceData = await getModuleWorkspaceData(user, moduleId);
  if (!workspaceData) {
    notFound();
  }

  return <ModuleWorkspaceClientPage key={workspaceData.module.id} initialData={workspaceData} />;
}
