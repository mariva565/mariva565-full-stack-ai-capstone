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
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { apiFetch, ApiError } from "../../../lib/api";

const MATERIAL_TYPES = [
  { key: "note", label: "Note", icon: "N", color: "#7c5ce7", bg: "#f0ecff" },
  { key: "link", label: "Link", icon: "L", color: "#0ea5e9", bg: "#e0f2fe" },
  { key: "file", label: "File", icon: "F", color: "#f59e0b", bg: "#fef3c7" },
  { key: "video", label: "Video", icon: "V", color: "#ef4444", bg: "#fef2f2" },
];

export default function AddMaterialScreen() {
  const { id: moduleId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [materialType, setMaterialType] = useState("note");
  const [fileUrl, setFileUrl] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim() && !content.trim()) {
      setError("Title or content is required");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await apiFetch(`/api/modules/${moduleId}/materials`, {
        method: "POST",
        body: {
          title: title.trim() || null,
          content: content.trim() || null,
          materialType,
          fileUrl: fileUrl.trim() || null,
          tags: tags.trim() || null,
        },
      });
      router.back();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to create material";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const showUrlField = materialType === "link" || materialType === "file" || materialType === "video";

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
          {MATERIAL_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[
                styles.typeChip,
                materialType === t.key && { backgroundColor: t.bg, borderColor: t.color },
              ]}
              onPress={() => setMaterialType(t.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeChipIcon,
                  { color: materialType === t.key ? t.color : "#94a3b8" },
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
              placeholderTextColor="#94a3b8"
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
              placeholderTextColor="#94a3b8"
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
                placeholderTextColor="#94a3b8"
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
              placeholderTextColor="#94a3b8"
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
          >
            <LinearGradient
              colors={["#4d33c4", "#7c5ce7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createBtnGradient}
            >
              <Text style={styles.createBtnText}>
                {loading ? "Adding..." : "Add Material"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
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
  iconContainer: { alignItems: "center", marginVertical: 16 },
  iconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#f0ecff",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  iconText: { fontSize: 24, fontWeight: "700", color: "#4d33c4" },
  heading: { fontSize: 20, fontWeight: "800", color: "#2e1d7a" },
  errorBox: {
    backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca",
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 14, textAlign: "center" },
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
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  typeChipIcon: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  typeChipLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
  },
  card: {
    backgroundColor: "#ffffff", borderRadius: 14, padding: 20,
    shadowColor: "#2e1d7a", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13, fontWeight: "600", color: "#475569",
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0",
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: "#0f172a",
  },
  textArea: { minHeight: 120, paddingTop: 14 },
  inputFocused: { borderColor: "#4d33c4", backgroundColor: "#faf9ff" },
  actions: { marginTop: 20, gap: 12 },
  createBtn: { borderRadius: 12, overflow: "hidden" },
  createBtnDisabled: { opacity: 0.6 },
  createBtnGradient: { paddingVertical: 16, alignItems: "center" },
  createBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  cancelBtn: {
    borderWidth: 2, borderColor: "#e2e8f0", borderRadius: 12,
    paddingVertical: 14, alignItems: "center",
  },
  cancelBtnText: { fontSize: 16, fontWeight: "600", color: "#64748b" },
});
