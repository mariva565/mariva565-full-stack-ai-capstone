import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, getUserFriendlyError } from "../../../lib/api";
import { queryKeys } from "../../../lib/query-keys";
import { useToast } from "../../../lib/toast-context";
import type { SavedAiToolOutput, ToolName, ToolResult, Material } from "../../../lib/studyhub-types";

type MaterialDetailResponse = { material: Material };

export function useAiTools(materialId: number) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [activeResult, setActiveResult] = useState<ToolResult | null>(null);

  const materialQuery = useQuery({
    queryKey: queryKeys.materials.detail(materialId),
    queryFn: () => apiFetch<MaterialDetailResponse>(`/api/materials/${materialId}`),
  });

  const savedOutputsQuery = useQuery({
    queryKey: queryKeys.materials.aiOutputs(materialId),
    queryFn: () => apiFetch<{ outputs: SavedAiToolOutput[] }>(`/api/materials/${materialId}/ai-outputs`),
  });

  const generateMutation = useMutation({
    mutationFn: async (tool: ToolName) => {
      const content = materialQuery.data?.material?.content;
      if (!content) throw new Error("No content to analyze");
      
      const response = await apiFetch<ToolResult>("/api/ai/tools", {
        method: "POST",
        body: { tool, content },
        timeoutMs: 25000, // Generation can take a while
      });
      return response;
    },
    onMutate: () => {
      setActiveResult(null);
    },
    onSuccess: (data) => {
      setActiveResult(data as ToolResult);
      showToast("Generated successfully. Tap 'Save' to keep it.", "success");
    },
    onError: (error) => {
      showToast(getUserFriendlyError(error, "Could not generate AI result"), "error");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!activeResult) throw new Error("No active result to save");
      const response = await apiFetch<{ output: SavedAiToolOutput }>(`/api/materials/${materialId}/ai-outputs`, {
        method: "POST",
        body: activeResult,
      });
      return response.output;
    },
    onSuccess: async (output) => {
      showToast("Result saved successfully!", "success");
      setActiveResult(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.materials.aiOutputs(materialId) });
    },
    onError: (error) => {
      showToast(getUserFriendlyError(error, "Could not save AI result"), "error");
    },
  });

  return {
    material: materialQuery.data?.material,
    savedOutputs: savedOutputsQuery.data?.outputs ?? [],
    loadingInitial: savedOutputsQuery.isPending || materialQuery.isPending,
    activeResult,
    setActiveResult,
    generateTool: (tool: ToolName) => generateMutation.mutateAsync(tool),
    isGenerating: generateMutation.isPending,
    saveActiveResult: () => saveMutation.mutateAsync(),
    isSaving: saveMutation.isPending,
  };
}
