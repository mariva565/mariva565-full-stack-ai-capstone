import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { BrandedSpinner } from "../../../components/branded-spinner";
import { ApiError, apiFetch } from "../../../lib/api";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import { invalidateMaterialQueries, invalidateModuleQueries, queryKeys } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";
import {
  DEFAULT_MATERIAL_TYPE,
  isUrlMaterialType,
  MATERIAL_TYPE_OPTIONS,
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

export default function EditMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>(DEFAULT_MATERIAL_TYPE);
  const [fileUrl, setFileUrl] = useState("");
  const [tags, setTags] = useState("");
  const [initialForm, setInitialForm] = useState({
    title: "",
    content: "",
    materialType: DEFAULT_MATERIAL_TYPE as MaterialType,
    fileUrl: "",
    tags: "",
  });
  const [moduleId, setModuleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isDirty =
    !loading &&
    (title.trim() !== initialForm.title.trim() ||
      content.trim() !== initialForm.content.trim() ||
      materialType !== initialForm.materialType ||
      fileUrl.trim() !== initialForm.fileUrl.trim() ||
      tags.trim() !== initialForm.tags.trim());
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !saving });

  useEffect(() => {
    async function loadMaterial() {
      try {
        const data = await apiFetch<MaterialResponse>(`/api/materials/${routeId}`);
        setTitle(data.material.title);
        setContent(data.material.content ?? "");
        const normalizedMaterialType = normalizeMaterialType(data.material.materialType);
        const nextFileUrl = data.material.fileUrl ?? "";
        const nextTags = data.material.tags ?? "";
        setMaterialType(normalizedMaterialType);
        setFileUrl(nextFileUrl);
        setTags(nextTags);
        setInitialForm({
          title: data.material.title,
          content: data.material.content ?? "",
          materialType: normalizedMaterialType,
          fileUrl: nextFileUrl,
          tags: nextTags,
        });
        setModuleId(data.material.moduleId ?? null);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Failed to load material";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadMaterial();
  }, [routeId]);

  async function handleSave() {
    if (!title.trim() && !content.trim()) {
      setError("Title or content is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/materials/${routeId}`, {
        method: "PUT",
        body: {
          title: title.trim() || null,
          content: content.trim() || null,
          materialType,
          fileUrl: fileUrl.trim() || null,
          tags: tags.trim() || null,
        },
      });
      await invalidateMaterialQueries(queryClient, routeId);
      if (moduleId) {
        await invalidateModuleQueries(queryClient, moduleId);
      } else {
        await queryClient.invalidateQueries({ queryKey: queryKeys.modules.all });
      }
      allowNextLeave();
      router.back();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to save material";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Material" }} />
        <BrandedSpinner message="Loading material..." />
      </>
    );
  }

  const showUrlField = isUrlMaterialType(materialType);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Edit Material" }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>E</Text>
          </View>
          <Text style={styles.heading}>Edit material</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.typeRow}>
          {MATERIAL_TYPE_OPTIONS.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                materialType === type.key && {
                  backgroundColor: type.bg,
                  borderColor: type.color,
                },
              ]}
              onPress={() => setMaterialType(type.key)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Select material type ${type.label}`}
            >
              <Text
                style={[
                  styles.typeChipIcon,
                  { color: materialType === type.key ? type.color : COLORS.textMuted },
                ]}
              >
                {type.icon}
              </Text>
              <Text
                style={[
                  styles.typeChipLabel,
                  materialType === type.key && { color: type.color, fontWeight: "700" },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={[styles.input, focusedField === "title" && styles.inputFocused]}
              placeholder="Material title"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea, focusedField === "content" && styles.inputFocused]}
              placeholder="Write your notes here..."
              placeholderTextColor={COLORS.textMuted}
              value={content}
              onChangeText={setContent}
              onFocus={() => setFocusedField("content")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {showUrlField ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL</Text>
              <TextInput
                style={[styles.input, focusedField === "url" && styles.inputFocused]}
                placeholder="https://..."
                placeholderTextColor={COLORS.textMuted}
                value={fileUrl}
                onChangeText={setFileUrl}
                onFocus={() => setFocusedField("url")}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags</Text>
            <TextInput
              style={[styles.input, focusedField === "tags" && styles.inputFocused]}
              placeholder="e.g. javascript, basics, intro"
              placeholderTextColor={COLORS.textMuted}
              value={tags}
              onChangeText={setTags}
              onFocus={() => setFocusedField("tags")}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.disabledBtn]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Save material changes"
          >
            <LinearGradient colors={GRADIENTS.primaryAction} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel material editing"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },
  scrollContent: { padding: 16 },
  iconContainer: { alignItems: "center", marginVertical: 16 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  iconText: { fontSize: 24, fontWeight: "800", color: COLORS.brandPrimary },
  heading: { fontSize: 20, fontWeight: "800", color: COLORS.brandDeep },
  errorBox: {
    backgroundColor: COLORS.dangerSoftAlt,
    borderWidth: 1,
    borderColor: COLORS.dangerBorderSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: "center" },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  typeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderMuted,
    backgroundColor: COLORS.surface,
  },
  typeChipIcon: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  typeChipLabel: { fontSize: 11, fontWeight: "500", color: COLORS.textSecondary },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    shadowColor: COLORS.brandDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textTertiary,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1.5,
    borderColor: COLORS.borderMuted,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  inputFocused: { borderColor: COLORS.brandPrimary, backgroundColor: COLORS.surfaceHighlight },
  actions: { marginTop: 20, gap: 12 },
  saveBtn: { borderRadius: 12, overflow: "hidden" },
  disabledBtn: { opacity: 0.6 },
  saveBtnGradient: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: COLORS.textOnBrand, fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderWidth: 2,
    borderColor: COLORS.borderMuted,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.textSecondary },
});
