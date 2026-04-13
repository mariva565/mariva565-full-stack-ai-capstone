import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiFetch, getUserFriendlyError } from "../../lib/api";
import { useTheme } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";

const POST_TYPES = [
  { value: "discussion", label: "Discussion" },
  { value: "question", label: "Question" },
  { value: "resource", label: "Resource" },
  { value: "article", label: "Article" },
] as const;

type PostType = (typeof POST_TYPES)[number]["value"];

type CreatePostResponse = {
  post: { id: number };
};

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.canvas,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingTop: 56,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.canvas,
    },
    content: {
      padding: 16,
      paddingBottom: 120,
      gap: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.8,
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    typeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    typeChipActive: {
      borderColor: colors.brandPrimary,
      backgroundColor: colors.violetSoft,
    },
    typeChipText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    typeChipTextActive: {
      color: colors.brandPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderMuted,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
    },
    textarea: {
      minHeight: 180,
      textAlignVertical: "top",
      lineHeight: 22,
    },
    helperText: {
      marginTop: 6,
      fontSize: 12,
      color: colors.textMuted,
    },
    errorBox: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: "#fca5a5",
      backgroundColor: "#fef2f2",
    },
    errorText: {
      color: "#b91c1c",
      fontSize: 13,
      fontWeight: "600",
    },
    footer: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderTopColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    submitButton: {
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.brandPrimary,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.55,
    },
    submitText: {
      color: "#ffffff",
      fontSize: 15,
      fontWeight: "800",
    },
  });
}

export function CreatePostScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [postType, setPostType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const publishMutation = useMutation({
    mutationFn: async () =>
      apiFetch<CreatePostResponse>("/api/posts", {
        method: "POST",
        body: {
          title: title.trim(),
          content: content.trim(),
          postType,
        },
      }),
    onSuccess: ({ post }) => {
      void queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
      router.replace(`/community/${post.id}` as never);
    },
    onError: (mutationError) => {
      setError(
        getUserFriendlyError(
          mutationError,
          "Could not publish the post. Please try again."
        )
      );
    },
  });

  const canSubmit =
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !publishMutation.isPending;

  function submit() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setError("");
    publishMutation.mutate();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 12, 56) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 120 + Math.max(insets.bottom, 12) },
        ]}
      >
        <View>
          <Text style={styles.label}>Post Type</Text>
          <View style={styles.typeRow}>
            {POST_TYPES.map((type) => {
              const active = type.value === postType;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                  onPress={() => setPostType(type.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Post type ${type.label}`}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      active && styles.typeChipTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Write a clear title..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            maxLength={255}
          />
          <Text style={styles.helperText}>{title.length}/255</Text>
        </View>

        <View>
          <Text style={styles.label}>Content</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Describe your question, idea, or resource..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.textarea]}
            multiline
            maxLength={4000}
          />
          <Text style={styles.helperText}>{content.length}/4000</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit}
          style={[
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Submit post"
        >
          {publishMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.submitText}>Submitting...</Text>
            </>
          ) : (
            <Text style={styles.submitText}>Submit Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
