import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { ApiError, uploadFile } from "../../lib/api";
import { useThemedStyles } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";

type UploadSource = "camera" | "library";

type ImageUploadButtonProps = {
  disabled?: boolean;
  onUploadSuccess: (url: string, fileName: string) => void;
  onUploadError: (message: string) => void;
};

const IMAGE_PICKER_OPTIONS = {
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

async function requestPickerPermission(source: UploadSource): Promise<boolean> {
  const permissionResult =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  return permissionResult.granted;
}

async function launchImagePicker(source: UploadSource) {
  if (source === "camera") {
    return ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS);
  }

  return ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);
}

function getImageMimeType(asset: ImagePicker.ImagePickerAsset): string {
  const mimeType = asset.mimeType?.toLowerCase();
  if (mimeType && IMAGE_EXTENSIONS[mimeType]) {
    return mimeType;
  }

  return "image/jpeg";
}

function createImageUploadFile(asset: ImagePicker.ImagePickerAsset) {
  const mimeType = getImageMimeType(asset);
  const extension = IMAGE_EXTENSIONS[mimeType] ?? "jpg";

  return {
    uri: asset.uri,
    name: `photo-${Date.now()}.${extension}`,
    type: mimeType,
  };
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Upload failed. Please try again.";
  }

  return "Upload failed. Please try again.";
}

export function ImageUploadButton({
  disabled = false,
  onUploadSuccess,
  onUploadError,
}: ImageUploadButtonProps) {
  const [uploadingSource, setUploadingSource] = useState<UploadSource | null>(null);
  const styles = useThemedStyles(makeImageUploadButtonStyles);
  const isUploading = uploadingSource !== null;
  const isDisabled = disabled || isUploading;

  async function handlePickImage(source: UploadSource) {
    onUploadError("");
    const hasPermission = await requestPickerPermission(source);

    if (!hasPermission) {
      const message = getPermissionDeniedMessage(source);
      onUploadError(message);
      Alert.alert("Permission required", message);
      return;
    }

    const result = await launchImagePicker(source);
    if (result.canceled || !result.assets?.[0]) return;

    const file = createImageUploadFile(result.assets[0]);
    setUploadingSource(source);

    try {
      const { url } = await uploadFile("/api/upload", file);
      onUploadSuccess(url, file.name);
    } catch (error) {
      const message = getUploadErrorMessage(error);
      onUploadError(message);
      Alert.alert("Upload failed", message);
    } finally {
      setUploadingSource(null);
    }
  }

  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={() => void handlePickImage("camera")}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel="Take photo for material upload"
      >
        {uploadingSource === "camera" ? <ActivityIndicator size="small" /> : null}
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={() => void handlePickImage("library")}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel="Choose material image from gallery"
      >
        {uploadingSource === "library" ? <ActivityIndicator size="small" /> : null}
        <Text style={styles.buttonText}>Choose from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeImageUploadButtonStyles(colors: AppColors) {
  return StyleSheet.create({
    buttonRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    button: {
      flex: 1,
      minWidth: 140,
      minHeight: 46,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textStrong,
      textAlign: "center",
    },
  });
}
