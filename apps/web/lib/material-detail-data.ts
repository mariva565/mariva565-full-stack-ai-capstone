import { eq } from "drizzle-orm";

import { courses, materials, modules } from "../../../drizzle/schema";
import type {
  MaterialCourseSummary,
  MaterialDetail,
  MaterialModuleSummary,
  MaterialPageData,
} from "../components/materials/types";
import { listAiToolOutputsForMaterial } from "./ai-tool-output-data";
import { db } from "./db";
import { isMaterialPinned } from "./favorites-data";

function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

type MaterialDetailResult = {
  material: MaterialDetail;
  module: MaterialModuleSummary;
  course: MaterialCourseSummary;
};

export async function getMaterialDetail(materialId: number): Promise<MaterialDetailResult | null> {
  const [result] = await db
    .select({
      material: {
        id: materials.id,
        title: materials.title,
        content: materials.content,
        materialType: materials.materialType,
        fileUrl: materials.fileUrl,
        tags: materials.tags,
        createdAt: materials.createdAt,
        moduleId: materials.moduleId,
      },
      module: {
        id: modules.id,
        title: modules.title,
        courseId: modules.courseId,
        orderIndex: modules.orderIndex,
      },
      course: {
        id: courses.id,
        title: courses.title,
        description: courses.description,
      },
    })
    .from(materials)
    .innerJoin(modules, eq(materials.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(materials.id, materialId))
    .limit(1);

  if (!result) {
    return null;
  }

  return {
    material: {
      ...result.material,
      createdAt: toIsoString(result.material.createdAt),
    },
    module: result.module,
    course: result.course,
  };
}

export async function getMaterialPageData(
  userId: number,
  materialId: number
): Promise<MaterialPageData | null> {
  const detail = await getMaterialDetail(materialId);
  if (!detail) {
    return null;
  }

  const pinned = await isMaterialPinned(userId, materialId);
  const aiOutputs = await listAiToolOutputsForMaterial(userId, materialId);

  return {
    ...detail,
    isPinned: pinned,
    aiOutputs,
  };
}
