import { apiFetch } from "./api";
import type { FavoriteItem } from "./studyhub-types";

type FavoritesResponse = {
  favorites: FavoriteItem[];
};

export type FavoriteMaterialDetail = {
  material: {
    id: number;
    title: string;
    materialType: string;
    tags: string | null;
  };
  module: {
    id: number;
    title: string;
  };
  course: {
    id: number;
    title: string;
  };
};

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  const data = await apiFetch<FavoritesResponse>("/api/favorites", { cache: false });
  return data.favorites;
}

export async function addFavorite(materialId: number): Promise<void> {
  await apiFetch("/api/favorites", {
    method: "POST",
    body: { materialId },
    cache: false,
  });
}

export async function removeFavorite(materialId: number): Promise<void> {
  await apiFetch(`/api/favorites?materialId=${materialId}`, {
    method: "DELETE",
    cache: false,
  });
}

export function isFavoriteMaterial(
  favoriteItems: FavoriteItem[] | undefined,
  materialId: number
): boolean {
  return (favoriteItems ?? []).some((item) => item.materialId === materialId);
}

export function removeOptimisticFavorite(
  favoriteItems: FavoriteItem[] | undefined,
  materialId: number
): FavoriteItem[] {
  return (favoriteItems ?? []).filter((item) => item.materialId !== materialId);
}

export function appendOptimisticFavorite(
  favoriteItems: FavoriteItem[] | undefined,
  detail: FavoriteMaterialDetail
): FavoriteItem[] {
  const currentItems = favoriteItems ?? [];
  if (currentItems.some((item) => item.materialId === detail.material.id)) {
    return currentItems;
  }

  return [
    {
      id: -detail.material.id,
      materialId: detail.material.id,
      materialTitle: detail.material.title,
      materialType: detail.material.materialType,
      tags: detail.material.tags,
      moduleId: detail.module.id,
      moduleTitle: detail.module.title,
      courseId: detail.course.id,
      courseTitle: detail.course.title,
    },
    ...currentItems,
  ];
}
