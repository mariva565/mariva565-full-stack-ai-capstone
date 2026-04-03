import { redirect } from "next/navigation";

import { MaterialPageClient } from "../../../components/materials/material-page-client";
import { getMaterialPageData } from "../../../lib/material-detail-data";
import { getRequestUserOrRedirect } from "../../../lib/server-auth";

type MaterialPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string }>;
};

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
