import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MaterialPageClient } from "../../../../components/materials/material-page-client";
import { getMaterialDetail, getMaterialPageData } from "../../../../lib/material-detail-data";
import { getRequestUserOrRedirect } from "../../../../lib/server-auth";

type MaterialPageProps = {
  params: Promise<{ id: string; slug?: string[] }>;
  searchParams?: Promise<{ edit?: string }>;
};

export async function generateMetadata({ params }: MaterialPageProps): Promise<Metadata> {
  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId) || materialId < 1) {
    return { title: "Material — StudyHub" };
  }

  const detail = await getMaterialDetail(materialId);
  if (!detail) {
    return { title: "Material — StudyHub" };
  }

  return {
    title: `${detail.material.title} › ${detail.module.title} › ${detail.course.title} — StudyHub`,
  };
}

export default async function MaterialPage({
  params,
  searchParams,
}: MaterialPageProps) {
  const user = await getRequestUserOrRedirect();

  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const materialId = Number(id);
  if (!Number.isInteger(materialId) || materialId < 1) {
    redirect("/dashboard");
  }

  const materialPageData = await getMaterialPageData(user.sub, materialId);
  if (!materialPageData) {
    redirect("/dashboard");
  }

  return (
    <MaterialPageClient
      key={materialPageData.material.id}
      initialData={materialPageData}
      initialEditing={resolvedSearchParams?.edit === "1"}
    />
  );
}
