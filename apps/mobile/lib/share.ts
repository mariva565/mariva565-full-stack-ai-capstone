import { apiFetch } from "./api";
import type { SharedMaterial } from "../../web/components/dashboard/types";
import { queryKeys } from "./query-keys";
import type { QueryClient } from "@tanstack/react-query";

export type SharedWithRecipient = {
  id: number;
  email: string;
  name: string | null;
  sharedAt: string;
};

export type SharedByMeItem = {
  materialId: number;
  materialTitle: string;
  materialType: string;
  sharedAt: string;
  sharedWith: { email: string; name: string | null };
  context: string;
};

export async function fetchSharedMaterials(): Promise<SharedMaterial[]> {
  const result = await apiFetch<{ shared: SharedMaterial[] }>("/api/materials/shared", { cache: false });
  return result.shared;
}

export async function shareMaterial(materialId: number, email: string): Promise<void> {
  await apiFetch(`/api/materials/${materialId}/share`, {
    method: "POST",
    body: { recipientEmail: email },
  });
}

export async function unshareMaterial(materialId: number, recipientId: number): Promise<void> {
  await apiFetch(`/api/materials/${materialId}/share/${recipientId}`, {
    method: "DELETE",
  });
}

export async function fetchSharedWithRecipients(materialId: number): Promise<SharedWithRecipient[]> {
  const result = await apiFetch<{ shares: SharedWithRecipient[] }>(`/api/materials/${materialId}/share`);
  return result.shares;
}

export async function fetchSharedByMe(): Promise<SharedByMeItem[]> {
  const result = await apiFetch<{ sharedByMe: SharedByMeItem[] }>("/api/materials/shared-by-me", { cache: false });
  return result.sharedByMe;
}

export async function invalidateSharedMaterialsList(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.sharedMaterials.lists() });
}

export async function invalidateSharedWithRecipients(queryClient: QueryClient, materialId: number): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.sharedMaterials.sharedWith(materialId) });
}

export async function invalidateSharedByMe(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: queryKeys.sharedMaterials.sharedByMe() });
}
