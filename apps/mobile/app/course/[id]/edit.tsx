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
import { ApiError, apiFetch } from "../../../lib/api";
import { BrandedSpinner } from "../../../components/branded-spinner";
import { COLORS, GRADIENTS } from "../../../lib/colors";
import { invalidateCourseQueries } from "../../../lib/query-keys";
import { useConfirmDiscard } from "../../../lib/use-confirm-discard";

type Course = {
  id: number;
  title: string;
  description: string | null;
};

export default function EditCourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = String(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [initialForm, setInitialForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isDirty =
    !loading &&
    (title.trim() !== initialForm.title.trim() ||
      description.trim() !== initialForm.description.trim());
  const { allowNextLeave } = useConfirmDiscard({ enabled: isDirty && !saving });

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await apiFetch<{ course: Course }>(`/api/courses/${routeId}`);
        setTitle(data.course.title);
        setDescription(data.course.description ?? "");
        setInitialForm({
          title: data.course.title,
          description: data.course.description ?? "",
        });
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Failed to load course";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [routeId]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Course title is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/courses/${routeId}`, {
        method: "PUT",
        body: {
          title: title.trim(),
          description: description.trim() || null,
        },
      });
      await invalidateCourseQueries(queryClient, routeId);
      allowNextLeave();
      router.back();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Failed to save course";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: "Edit Course" }} />
        <BrandedSpinner message="Loading course..." />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen options={{ title: "Edit Course" }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>E</Text>
          </View>
          <Text style={styles.heading}>Edit course</Text>
          <Text style={styles.subheading}>Update the title or description</Text>
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
              placeholder="Course title"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              accessibilityLabel="Course title"
              accessibilityHint="Required field for the course name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, focusedField === "desc" && styles.inputFocused]}
              placeholder="What's this course about?"
              placeholderTextColor={COLORS.textMuted}
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Course description"
              accessibilityHint="Optional description for this course"
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
            accessibilityLabel="Save course changes"
            accessibilityHint="Updates this course and returns to the previous screen"
          >
            <LinearGradient colors={GRADIENTS.primaryAction} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel course editing"
            accessibilityHint="Discard unsaved changes and go back"
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.violetSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: { fontSize: 24, fontWeight: "800", color: COLORS.brandPrimary },
  heading: { fontSize: 20, fontWeight: "800", color: COLORS.brandDeep },
  subheading: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  errorBox: {
    backgroundColor: COLORS.dangerSoftAlt,
    borderWidth: 1,
    borderColor: COLORS.dangerBorderSoft,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.danger, fontSize: 14, textAlign: "center" },
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
  textArea: { minHeight: 100, paddingTop: 14 },
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
