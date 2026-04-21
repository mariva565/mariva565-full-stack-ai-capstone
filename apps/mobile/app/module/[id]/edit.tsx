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
import { useTheme, useThemedStyles } from "../../../lib/app-preferences";
import type { AppColors } from "../../../lib/colors";
import { invalidateCourseQueries, invalidateModuleQueries } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";

type ModuleResponse = {
  module: {
    id: number;
    courseId?: number;
    title: string;
    description?: string | null;
  };
};

export default function EditModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialForm, setInitialForm] = useState({ title: "", description: "" });
  const [courseId, setCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = useThemedStyles(makeEditModuleStyles);
  const primaryActionGradient = [colors.brandPrimary, colors.brandAccent] as const;
  const isDirty =
    !loading &&
    (title.trim() !== initialForm.title.trim() ||
      description.trim() !== initialForm.description.trim());
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !saving });

  useEffect(() => {
    async function loadModule() {
      try {
        const data = await apiFetch<ModuleResponse>(`/api/modules/${routeId}`);
        setTitle(data.module.title);
        setDescription(data.module.description ?? "");
        setInitialForm({
          title: data.module.title,
          description: data.module.description ?? "",
        });
        setCourseId(data.module.courseId ?? null);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Failed to load module";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadModule();
  }, [routeId]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Module title is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/modules/${routeId}`, {
        method: "PUT",
        body: {
          title: title.trim(),
          description: description.trim() || null,
        },
      });
      await invalidateModuleQueries(queryClient, routeId);
      if (courseId) {
        await invalidateCourseQueries(queryClient, courseId);
      }
      allowNextLeave();
      router.back();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to save module";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Module" }} />
        <BrandedSpinner message="Loading module..." />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Edit Module" }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>M</Text>
          </View>
          <Text style={styles.heading}>Edit module</Text>
          <Text style={styles.subheading}>Refine the module details</Text>
        </View>

        {error ? (
          <View style={styles.errorBox} accessible accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={[styles.input, focusedField === "title" && styles.inputFocused]}
              placeholder="Module title"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              accessibilityLabel="Module title"
              accessibilityHint="Required field for the module name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, focusedField === "desc" && styles.inputFocused]}
              placeholder="What does this module cover?"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Module description"
              accessibilityHint="Optional description for this module"
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
            accessibilityLabel="Save module changes"
            accessibilityHint="Updates this module and returns to the previous screen"
          >
            <LinearGradient colors={primaryActionGradient} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel module editing"
            accessibilityHint="Discard unsaved changes and go back"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeEditModuleStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.canvas },
    scrollContent: { padding: 16 },
    iconContainer: { alignItems: "center", marginVertical: 20 },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.violetSoft,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    iconText: { fontSize: 24, fontWeight: "800", color: colors.brandPrimary },
    heading: { fontSize: 20, fontWeight: "800", color: colors.titlePrimary },
    subheading: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    errorBox: {
      backgroundColor: colors.dangerSoftAlt,
      borderWidth: 1,
      borderColor: colors.dangerBorderSoft,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    errorText: { color: colors.danger, fontSize: 14, textAlign: "center" },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 20,
      shadowColor: colors.brandDeep,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    inputGroup: { marginBottom: 16 },
    inputLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      marginBottom: 6,
      marginLeft: 2,
    },
    input: {
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
    },
    textArea: { minHeight: 100, paddingTop: 14 },
    inputFocused: { borderColor: colors.brandPrimary, backgroundColor: colors.surfaceHighlight },
    actions: { marginTop: 20, gap: 12 },
    saveBtn: { borderRadius: 12, overflow: "hidden" },
    disabledBtn: { opacity: 0.6 },
    saveBtnGradient: { paddingVertical: 16, alignItems: "center" },
    saveBtnText: { color: colors.textOnBrand, fontSize: 16, fontWeight: "700" },
    cancelBtn: {
      borderWidth: 2,
      borderColor: colors.borderMuted,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 16, fontWeight: "600", color: colors.textSecondary },
  });
}
