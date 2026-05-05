import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { ApiError, uploadFile } from "../../lib/api";
import { useThemedStyles } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";

type UploadSource = "camera" | "library";
type PostImageUploadProps = {
  imageUrls: string[];
  disabled?: boolean;
  onImagesChange: (imageUrls: string[]) => void;
  onUploadingChange: (uploading: boolean) => void;
  onError: (message: string) => void;
};

const MAX_POST_IMAGES = 3;
const PICKER_OPTIONS = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.7,
  allowsEditing: Platform.OS === "ios",
  maxWidth: 2048,
  maxHeight: 2048,
};
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getPermissionDeniedMessage(source: UploadSource): string {
  if (source === "camera") {
    return "Camera access is needed to take photos. Enable it in Settings.";
  }

  return "Gallery access is needed to choose photos. Enable it in Settings.";
}

async function requestPermission(source: UploadSource): Promise<boolean> {
  const permissionResult =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permissionResult.granted;
}

async function pickImage(source: UploadSource) {
  if (source === "camera") {
    return ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  }

  return ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
}

function createUploadFile(asset: ImagePicker.ImagePickerAsset) {
  const mimeType =
    asset.mimeType && IMAGE_EXTENSIONS[asset.mimeType]
      ? asset.mimeType
      : "image/jpeg";
  const extension = IMAGE_EXTENSIONS[mimeType] ?? "jpg";

  return {
    uri: asset.uri,
    name: `post-image-${Date.now()}.${extension}`,
    type: mimeType,
  };
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Upload failed. Please try again.";
  }

  return "Upload failed. Please try again.";
}

export function PostImageUpload({
  imageUrls,
  disabled = false,
  onImagesChange,
  onUploadingChange,
  onError,
}: PostImageUploadProps) {
  const [uploadingSource, setUploadingSource] = useState<UploadSource | null>(null);
  const styles = useThemedStyles(makePostImageUploadStyles);
  const maxReached = imageUrls.length >= MAX_POST_IMAGES;
  const isBusy = uploadingSource !== null;
  const isDisabled = disabled || isBusy || maxReached;

  async function handleUpload(source: UploadSource) {
    onError("");
    if (maxReached) {
      onError(`You can add up to ${MAX_POST_IMAGES} images per post.`);
      return;
    }

    const hasPermission = await requestPermission(source);
    if (!hasPermission) {
      const message = getPermissionDeniedMessage(source);
      onError(message);
      Alert.alert("Permission required", message);
      return;
    }

    const result = await pickImage(source);
    if (result.canceled || !result.assets?.[0]) return;

    setUploadingSource(source);
    onUploadingChange(true);
    try {
      const { url } = await uploadFile(
        "/api/upload/post-image",
        createUploadFile(result.assets[0])
      );
      onImagesChange([...imageUrls, url]);
    } catch (error) {
      const message = getUploadErrorMessage(error);
      onError(message);
      Alert.alert("Upload failed", message);
    } finally {
      setUploadingSource(null);
      onUploadingChange(false);
    }
  }

  function removeImage(url: string) {
    onError("");
    onImagesChange(imageUrls.filter((imageUrl) => imageUrl !== url));
  }

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={() => void handleUpload("camera")}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel="Take photo for community post"
        >
          {uploadingSource === "camera" ? <ActivityIndicator size="small" /> : null}
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={() => void handleUpload("library")}
          disabled={isDisabled}
          accessibilityRole="button"
          accessibilityLabel="Choose image for community post"
        >
          {uploadingSource === "library" ? <ActivityIndicator size="small" /> : null}
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        Images are compressed automatically. Max 2 MB. Up to 3 images.
      </Text>
      <Text style={styles.helperText}>JPG, PNG, WebP, GIF</Text>

      {imageUrls.length > 0 ? (
        <View style={styles.previewGrid}>
          {imageUrls.map((url, index) => (
            <View key={url} style={styles.previewItem}>
              <Image
                source={{ uri: url }}
                style={styles.previewImage}
                accessibilityLabel={`Post image ${index + 1}`}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(url)}
                accessibilityRole="button"
                accessibilityLabel={`Remove post image ${index + 1}`}
              >
                <Ionicons name="close" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function makePostImageUploadStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    button: {
      flex: 1,
      minWidth: 140,
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 12,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonText: {
      color: colors.textStrong,
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    previewGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 2,
    },
    previewItem: {
      width: 88,
      height: 88,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    removeButton: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(15, 23, 42, 0.82)",
    },
  });
}
