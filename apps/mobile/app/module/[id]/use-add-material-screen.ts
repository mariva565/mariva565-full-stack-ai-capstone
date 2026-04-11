import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ApiError, apiFetch } from "../../../lib/api";
import { invalidateModuleQueries } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";
import {
  DEFAULT_MATERIAL_TYPE,
  isUrlMaterialType,
  type MaterialType,
} from "../../../lib/material-utils";
import type { MaterialFormValues } from "../../../components/material-form/material-form.types";

type MaterialCreatePayload = {
  title: string | null;
  content: string | null;
  materialType: MaterialType;
  fileUrl: string | null;
  tags: string | null;
};

function toMaterialPayload(values: MaterialFormValues): MaterialCreatePayload {
  return {
    title: values.title.trim() || null,
    content: values.content.trim() || null,
    materialType: values.materialType,
    fileUrl: values.fileUrl.trim() || null,
    tags: values.tags.trim() || null,
  };
}

function isMaterialFormDirty(values: MaterialFormValues): boolean {
  return (
    values.title.trim().length > 0 ||
    values.content.trim().length > 0 ||
    values.fileUrl.trim().length > 0 ||
    values.tags.trim().length > 0 ||
    values.materialType !== DEFAULT_MATERIAL_TYPE
  );
}

export function useAddMaterialScreen() {
  const { id: moduleId } = useLocalSearchParams<{ id: string }>();
  const routeModuleId = String(moduleId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<MaterialFormValues>({
    title: "",
    content: "",
    materialType: DEFAULT_MATERIAL_TYPE,
    fileUrl: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { allowNextLeave } = useConfirmDiscard({
    enabled: isMaterialFormDirty(values) && !loading,
  });
  const showUrlField = useMemo(
    () => isUrlMaterialType(values.materialType),
    [values.materialType]
  );
  async function handleCreate() {
    if (!values.title.trim() && !values.content.trim()) {
      setError("Title or content is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await apiFetch(`/api/modules/${routeModuleId}/materials`, {
        method: "POST",
        body: toMaterialPayload(values),
      });
      await invalidateModuleQueries(queryClient, routeModuleId);
      allowNextLeave();
      router.back();
    } catch (apiError) {
      const message =
        apiError instanceof ApiError ? apiError.message : "Failed to create material";
      setError(message);
    } finally {
      setLoading(false);
    }
  }
  return {
    values,
    loading,
    error,
    showUrlField,
    setTitle: (title: string) => setValues((current) => ({ ...current, title })),
    setContent: (content: string) => setValues((current) => ({ ...current, content })),
    setMaterialType: (materialType: MaterialType) =>
      setValues((current) => ({ ...current, materialType })),
    setFileUrl: (fileUrl: string) => setValues((current) => ({ ...current, fileUrl })),
    setTags: (tags: string) => setValues((current) => ({ ...current, tags })),
    handleCreate,
    handleCancel: () => router.back(),
  };
}
