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
import { invalidateCourseQueries } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";

export default function AddModuleScreen() {
  const { id: courseId } = useLocalSearchParams<{ id: string }>();
  const routeCourseId = String(courseId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isDirty = title.trim().length > 0 || description.trim().length > 0;
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !loading });

  async function handleCreate() {
    if (!title.trim()) {
      setError("Module title is required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await apiFetch(`/api/courses/${routeCourseId}/modules`, {
        method: "POST",
        body: {
          title: title.trim(),
          description: description.trim() || null,
        },
      });
      await invalidateCourseQueries(queryClient, routeCourseId);
      allowNextLeave();
      router.back();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to create module";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "New Module" }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>M+</Text>
          </View>
          <Text style={styles.heading}>Add a module</Text>
          <Text style={styles.subheading}>Organize your course content</Text>
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
              placeholder="e.g. Introduction"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              autoFocus
              accessibilityLabel="Module title"
              accessibilityHint="Required field for the module name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedField === "desc" && styles.inputFocused,
              ]}
              placeholder="What does this module cover?"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Module description"
              accessibilityHint="Optional description for this module"
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
            accessibilityLabel="Add module"
            accessibilityHint="Creates the module in this course"
          >
            <LinearGradient
              colors={GRADIENTS.primaryAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtnGradient}
            >
              <Text style={styles.createBtnText}>
                {loading ? "Creating..." : "Add Module"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel adding module"
            accessibilityHint="Discard changes and go back"
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
  iconContainer: { alignItems: "center", marginVertical: 20 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  iconText: { fontSize: 20, fontWeight: "800", color: COLORS.brandPrimary },
  heading: { fontSize: 20, fontWeight: "800", color: COLORS.brandDeep },
  subheading: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  errorBox: {
    backgroundColor: COLORS.dangerSoftAlt, borderWidth: 1, borderColor: COLORS.dangerBorderSoft,
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: "center" },
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
  textArea: { minHeight: 80, paddingTop: 14 },
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
