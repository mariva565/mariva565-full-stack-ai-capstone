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
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BrandedSpinner } from "../../../components/branded-spinner";
import { ApiError, apiFetch } from "../../../lib/api";

type ModuleResponse = {
  module: {
    id: number;
    title: string;
    description?: string | null;
  };
};

export default function EditModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    async function loadModule() {
      try {
        const data = await apiFetch<ModuleResponse>(`/api/modules/${id}`);
        setTitle(data.module.title);
        setDescription(data.module.description ?? "");
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Failed to load module";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadModule();
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      setError("Module title is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiFetch(`/api/modules/${id}`, {
        method: "PUT",
        body: {
          title: title.trim(),
          description: description.trim() || null,
        },
      });
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
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              style={[styles.input, focusedField === "title" && styles.inputFocused]}
              placeholder="Module title"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, focusedField === "desc" && styles.inputFocused]}
              placeholder="What does this module cover?"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
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
          >
            <LinearGradient colors={["#4d33c4", "#7c5ce7"]} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel module editing"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f6ff" },
  scrollContent: { padding: 16 },
  iconContainer: { alignItems: "center", marginVertical: 20 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0ecff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconText: { fontSize: 24, fontWeight: "800", color: "#4d33c4" },
  heading: { fontSize: 20, fontWeight: "800", color: "#2e1d7a" },
  subheading: { fontSize: 14, color: "#64748b", marginTop: 4 },
  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#2e1d7a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0f172a",
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  inputFocused: { borderColor: "#4d33c4", backgroundColor: "#faf9ff" },
  actions: { marginTop: 20, gap: 12 },
  saveBtn: { borderRadius: 12, overflow: "hidden" },
  disabledBtn: { opacity: 0.6 },
  saveBtnGradient: { paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: "#64748b" },
});
