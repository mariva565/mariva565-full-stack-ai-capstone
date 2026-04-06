import { and, desc, eq } from "drizzle-orm";

import { aiToolOutputs } from "../../../drizzle/schema";
import type { SavedAiToolOutput, ToolResult } from "./ai-tool-outputs";
import { isToolData, isToolName } from "./ai-tool-outputs";
import { db } from "./db";

function toIsoString(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

type AiToolOutputRow = {
  id: number;
  userId: number;
  materialId: number;
  tool: string;
  data: unknown;
  createdAt: Date | string;
};

export function mapAiToolOutputRow(row: AiToolOutputRow): SavedAiToolOutput | null {
  if (!isToolName(row.tool) || !isToolData(row.tool, row.data)) {
    return null;
  }

  const result: ToolResult = {
    tool: row.tool,
    data: row.data,
  } as ToolResult;

  return {
    id: row.id,
    userId: row.userId,
    materialId: row.materialId,
    createdAt: toIsoString(row.createdAt),
    ...result,
  };
}

export async function listAiToolOutputsForMaterial(
  userId: number,
  materialId: number,
): Promise<SavedAiToolOutput[]> {
  const rows = await db
    .select({
      id: aiToolOutputs.id,
      userId: aiToolOutputs.userId,
      materialId: aiToolOutputs.materialId,
      tool: aiToolOutputs.tool,
      data: aiToolOutputs.data,
      createdAt: aiToolOutputs.createdAt,
    })
    .from(aiToolOutputs)
    .where(
      and(
        eq(aiToolOutputs.userId, userId),
        eq(aiToolOutputs.materialId, materialId),
      ),
    )
    .orderBy(desc(aiToolOutputs.createdAt));

  return rows
    .map(mapAiToolOutputRow)
    .filter((row): row is SavedAiToolOutput => row !== null);
}
