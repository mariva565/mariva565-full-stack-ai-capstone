import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { MaterialFormValues } from "../../../components/material-form/material-form.types";
import { ApiError, apiFetch } from "../../../lib/api";
import {
  invalidateMaterialQueries,
  invalidateModuleQueries,
  queryKeys,
} from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";
import {
  DEFAULT_MATERIAL_TYPE,
  isUrlMaterialType,
  normalizeMaterialType,
  type MaterialType,
} from "../../../lib/material-utils";

type MaterialResponse = {
  material: {
    id: number;
    moduleId?: number;
    title: string;
    content: string | null;
    materialType: string;
    fileUrl: string | null;
    tags: string | null;
  };
};

type MaterialUpdatePayload = {
  title: string | null;
  content: string | null;
  materialType: MaterialType;
  fileUrl: string | null;
  tags: string | null;
};

type LoadedMaterialData = {
  values: MaterialFormValues;
  moduleId: number | null;
};

const EMPTY_FORM: MaterialFormValues = {
  title: "",
  content: "",
  materialType: DEFAULT_MATERIAL_TYPE,
  fileUrl: "",
  tags: "",
};

function toMaterialFormValues(data: MaterialResponse): LoadedMaterialData {
  const normalizedMaterialType = normalizeMaterialType(data.material.materialType);
  return {
    values: {
      title: data.material.title,
      content: data.material.content ?? "",
      materialType: normalizedMaterialType,
      fileUrl: data.material.fileUrl ?? "",
      tags: data.material.tags ?? "",
    },
    moduleId: data.material.moduleId ?? null,
  };
}

function toUpdatePayload(values: MaterialFormValues): MaterialUpdatePayload {
  return {
    title: values.title.trim() || null,
    content: values.content.trim() || null,
    materialType: values.materialType,
    fileUrl: values.fileUrl.trim() || null,
    tags: values.tags.trim() || null,
  };
}

function isFormDirty(values: MaterialFormValues, initialValues: MaterialFormValues): boolean {
  return (
    values.title.trim() !== initialValues.title.trim() ||
    values.content.trim() !== initialValues.content.trim() ||
    values.materialType !== initialValues.materialType ||
    values.fileUrl.trim() !== initialValues.fileUrl.trim() ||
    values.tags.trim() !== initialValues.tags.trim()
  );
}

function useMaterialLoader(
  routeId: string,
  setValues: (values: MaterialFormValues) => void,
  setInitialValues: (values: MaterialFormValues) => void,
  setModuleId: (moduleId: number | null) => void,
  setError: (error: string) => void,
  setLoading: (loading: boolean) => void
) {
  useEffect(() => {
    async function loadMaterial() {
      try {
        const data = await apiFetch<MaterialResponse>(`/api/materials/${routeId}`);
        const loaded = toMaterialFormValues(data);
        setValues(loaded.values);
        setInitialValues(loaded.values);
        setModuleId(loaded.moduleId);
      } catch (apiError) {
        const message =
          apiError instanceof ApiError ? apiError.message : "Failed to load material";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadMaterial();
  }, [routeId, setError, setInitialValues, setLoading, setModuleId, setValues]);
}

type SaveMaterialOptions = {
  routeId: string;
  moduleId: number | null;
  values: MaterialFormValues;
  queryClient: ReturnType<typeof useQueryClient>;
  allowNextLeave: () => void;
  router: ReturnType<typeof useRouter>;
};

async function saveMaterialChanges(options: SaveMaterialOptions) {
  await apiFetch(`/api/materials/${options.routeId}`, {
    method: "PUT",
    body: toUpdatePayload(options.values),
  });
  await invalidateMaterialQueries(options.queryClient, options.routeId);
  if (options.moduleId) {
    await invalidateModuleQueries(options.queryClient, options.moduleId);
  } else {
    await options.queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
  }
  options.allowNextLeave();
  options.router.back();
}

type SaveHandlerOptions = {
  routeId: string;
  moduleId: number | null;
  values: MaterialFormValues;
  queryClient: ReturnType<typeof useQueryClient>;
  allowNextLeave: () => void;
  router: ReturnType<typeof useRouter>;
  setError: (error: string) => void;
  setSaving: (saving: boolean) => void;
};

function useMaterialSaveHandler(options: SaveHandlerOptions) {
  return useCallback(async () => {
    if (!options.values.title.trim() && !options.values.content.trim()) {
      options.setError("Title or content is required");
      return;
    }

    options.setSaving(true);
    options.setError("");
    try {
      await saveMaterialChanges({
        routeId: options.routeId,
        moduleId: options.moduleId,
        values: options.values,
        queryClient: options.queryClient,
        allowNextLeave: options.allowNextLeave,
        router: options.router,
      });
    } catch (apiError) {
      const message =
        apiError instanceof ApiError ? apiError.message : "Failed to save material";
      options.setError(message);
    } finally {
      options.setSaving(false);
    }
  }, [options]);
}

export function useEditMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<MaterialFormValues>(EMPTY_FORM);
  const [initialValues, setInitialValues] = useState<MaterialFormValues>(EMPTY_FORM);
  const [moduleId, setModuleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isDirty = !loading && isFormDirty(values, initialValues);
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !saving });
  const showUrlField = useMemo(
    () => isUrlMaterialType(values.materialType),
    [values.materialType]
  );
  useMaterialLoader(
    routeId,
    setValues,
    setInitialValues,
    setModuleId,
    setError,
    setLoading
  );
  const handleSave = useMaterialSaveHandler({
    routeId,
    moduleId,
    values,
    queryClient,
    allowNextLeave,
    router,
    setError,
    setSaving,
  });

  const setField = <K extends keyof MaterialFormValues>(field: K) =>
    (value: MaterialFormValues[K]) =>
      setValues((current) => ({ ...current, [field]: value }));

  return {
    values,
    loading,
    saving,
    error,
    showUrlField,
    setTitle: setField("title"),
    setContent: setField("content"),
    setMaterialType: setField("materialType"),
    setFileUrl: setField("fileUrl"),
    setTags: setField("tags"),
    handleSave,
    handleCancel: () => router.back(),
  };
}
