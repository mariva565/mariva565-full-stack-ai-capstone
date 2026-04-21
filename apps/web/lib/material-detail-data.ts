import { eq, and } from "drizzle-orm";

import { courses, materials, modules, sharedMaterials } from "../../../drizzle/schema";
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
  material: MaterialDetail & { createdBy: number };
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
        createdBy: materials.createdBy,
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

  const isOwner = detail.material.createdBy === userId;

  if (!isOwner) {
    // Check if shared with user
    const [share] = await db
      .select()
      .from(sharedMaterials)
      .where(
        and(
          eq(sharedMaterials.materialId, materialId),
          eq(sharedMaterials.sharedWithUserId, userId)
        )
      )
      .limit(1);

    if (!share) {
      return null; // Deny access
    }
  }

  const pinned = await isMaterialPinned(userId, materialId);
  // Only load AI outputs if owner
  const aiOutputs = isOwner ? await listAiToolOutputsForMaterial(userId, materialId) : [];

  return {
    ...detail,
    isOwner,
    isPinned: pinned,
    aiOutputs,
  };
}
