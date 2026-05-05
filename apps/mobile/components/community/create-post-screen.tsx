import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { makeCreatePostStyles } from "./create-post-screen.styles";
import { PostImageUpload } from "./post-image-upload";

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPostHtml(content: string, imageUrls: string[]): string {
  const trimmedContent = content.trim();
  const textHtml = trimmedContent
    ? `<p>${escapeHtml(trimmedContent).replace(/\r?\n/g, "<br>")}</p>`
    : "";
  const imageHtml = imageUrls
    .map((url, index) => `<p><img src="${url}" alt="Post image ${index + 1}"></p>`)
    .join("");

  return `${textHtml}${imageHtml}`;
}

export function CreatePostScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeCreatePostStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [postType, setPostType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");

  const publishMutation = useMutation({
    mutationFn: async () =>
      apiFetch<CreatePostResponse>("/api/posts", {
        method: "POST",
        body: {
          title: title.trim(),
          content: buildPostHtml(content, imageUrls),
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
    (content.trim().length > 0 || imageUrls.length > 0) &&
    !publishMutation.isPending &&
    !imageUploading;

  function submit() {
    if (!title.trim() || (!content.trim() && imageUrls.length === 0)) {
      setError("Title and content or at least one image are required.");
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

        <View>
          <Text style={styles.label}>Images</Text>
          <PostImageUpload
            imageUrls={imageUrls}
            disabled={publishMutation.isPending}
            onImagesChange={setImageUrls}
            onUploadingChange={setImageUploading}
            onError={setError}
          />
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
