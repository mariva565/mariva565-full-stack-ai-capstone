import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { aiToolOutputs, materials } from "../../../../../../../drizzle/schema";
import { requireAuth } from "../../../../../lib/api-utils";
import { logActivity } from "../../../../../lib/activity";
import { mapAiToolOutputRow, listAiToolOutputsForMaterial } from "../../../../../lib/ai-tool-output-data";
import type { ToolName } from "../../../../../lib/ai-tool-outputs";
import { isToolData, isToolName } from "../../../../../lib/ai-tool-outputs";
import { db } from "../../../../../lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId) || materialId < 1) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid material id" },
      { status: 400 },
    );
  }

  const outputs = await listAiToolOutputsForMaterial(auth.user.sub, materialId);
  return NextResponse.json({ outputs });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const auth = await requireAuth(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId) || materialId < 1) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid material id" },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const tool = typeof body?.tool === "string" ? body.tool : "";
  const data = body?.data;

  if (!isToolName(tool) || !isToolData(tool, data)) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Invalid AI output payload" },
      { status: 400 },
    );
  }

  const [material] = await db
    .select({ id: materials.id })
    .from(materials)
    .where(eq(materials.id, materialId))
    .limit(1);

  if (!material) {
    return NextResponse.json(
      { code: "NOT_FOUND", message: "Material not found" },
      { status: 404 },
    );
  }

  const [created] = await db
    .insert(aiToolOutputs)
    .values({
      userId: auth.user.sub,
      materialId,
      tool: tool as ToolName,
      data,
    })
    .returning({
      id: aiToolOutputs.id,
      userId: aiToolOutputs.userId,
      materialId: aiToolOutputs.materialId,
      tool: aiToolOutputs.tool,
      data: aiToolOutputs.data,
      createdAt: aiToolOutputs.createdAt,
    });

  if (!created) {
    return NextResponse.json(
      { code: "AI_SAVE_FAILED", message: "Could not save AI output" },
      { status: 500 },
    );
  }

  const output = mapAiToolOutputRow(created);
  if (!output) {
    return NextResponse.json(
      { code: "AI_SAVE_FAILED", message: "Saved AI output could not be read back" },
      { status: 500 },
    );
  }

  await logActivity(auth.user.sub, "save_ai_output", output.id, {
    materialId,
    tool: output.tool,
  });

  return NextResponse.json({ output }, { status: 201 });
}
