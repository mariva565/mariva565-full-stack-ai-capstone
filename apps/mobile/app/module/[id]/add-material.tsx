import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { apiFetch, ApiError } from "../../../lib/api";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import { invalidateModuleQueries } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";
import {
  DEFAULT_MATERIAL_TYPE,
  isUrlMaterialType,
  MATERIAL_TYPE_OPTIONS,
  type MaterialType,
} from "../../../lib/material-utils";

export default function AddMaterialScreen() {
  const { id: moduleId } = useLocalSearchParams<{ id: string }>();
  const routeModuleId = String(moduleId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>(DEFAULT_MATERIAL_TYPE);
  const [fileUrl, setFileUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isDirty =
    title.trim().length > 0 ||
    content.trim().length > 0 ||
    fileUrl.trim().length > 0 ||
    tags.trim().length > 0 ||
    materialType !== DEFAULT_MATERIAL_TYPE;
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !loading });

  async function handleCreate() {
    if (!title.trim() && !content.trim()) {
      setError("Title or content is required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await apiFetch(`/api/modules/${routeModuleId}/materials`, {
        method: "POST",
        body: {
          title: title.trim() || null,
          content: content.trim() || null,
          materialType,
          fileUrl: fileUrl.trim() || null,
          tags: tags.trim() || null,
        },
      });
      await invalidateModuleQueries(queryClient, routeModuleId);
      allowNextLeave();
      router.back();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to create material";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const showUrlField = isUrlMaterialType(materialType);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "New Material" }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>+</Text>
          </View>
          <Text style={styles.heading}>Add material</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Type selector */}
        <View style={styles.typeRow}>
          {MATERIAL_TYPE_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.typeChip,
                materialType === t.key && { backgroundColor: t.bg, borderColor: t.color },
              ]}
              onPress={() => setMaterialType(t.key)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Select material type ${t.label}`}
            >
              <Text
                style={[
                  styles.typeChipIcon,
                  { color: materialType === t.key ? t.color : COLORS.textMuted },
                ]}
              >
                {t.icon}
              </Text>
              <Text
                style={[
                  styles.typeChipLabel,
                  materialType === t.key && { color: t.color, fontWeight: "700" },
                ]}
              >
                {t.label}
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
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === "content" && styles.inputFocused,
              ]}
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

          {showUrlField && (
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
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tags (comma-separated)</Text>
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
            style={[styles.createBtn, loading && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add material"
          >
            <LinearGradient
              colors={GRADIENTS.primaryAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtnGradient}
            >
              <Text style={styles.createBtnText}>
                {loading ? "Adding..." : "Add Material"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel adding material"
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
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  iconText: { fontSize: 24, fontWeight: "700", color: COLORS.brandPrimary },
  heading: { fontSize: 20, fontWeight: "800", color: COLORS.brandDeep },
  errorBox: {
    backgroundColor: COLORS.dangerSoftAlt, borderWidth: 1, borderColor: COLORS.dangerBorderSoft,
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: "center" },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.borderMuted,
    backgroundColor: COLORS.surface,
  },
  typeChipIcon: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  typeChipLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 20,
    shadowColor: COLORS.brandDeep, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13, fontWeight: "600", color: COLORS.textTertiary,
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    backgroundColor: COLORS.surfaceSoft, borderWidth: 1.5, borderColor: COLORS.borderMuted,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: COLORS.textPrimary,
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  inputFocused: { borderColor: COLORS.brandPrimary, backgroundColor: COLORS.surfaceHighlight },
  actions: { marginTop: 20, gap: 12 },
  createBtn: { borderRadius: 12, overflow: "hidden" },
  createBtnDisabled: { opacity: 0.6 },
  createBtnGradient: { paddingVertical: 16, alignItems: "center" },
  createBtnText: { color: COLORS.textOnBrand, fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderWidth: 2, borderColor: COLORS.borderMuted, borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: COLORS.textSecondary },
});

