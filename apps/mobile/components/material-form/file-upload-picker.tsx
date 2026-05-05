import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import { ApiError, uploadFile } from "../../lib/api";
import { useThemedStyles } from "../../lib/app-preferences";
import type { AppColors } from "../../lib/colors";
import { ImageUploadButton } from "./image-upload-button";

type FileUploadPickerProps = {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
};

type UploadableFile = {
  uri: string;
  name: string;
  type: string;
};

const CHECK_MARK = "\u2713";
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function UploadStatus({ hasFile, fileName }: { hasFile: boolean; fileName: string | null }) {
  const styles = useThemedStyles(makeFileUploadPickerStyles);

  return (
    <View style={[styles.statusBox, hasFile && styles.statusBoxSuccess]}>
      <Text style={hasFile ? styles.statusTextSuccess : styles.statusText}>
        {hasFile ? `File attached ${CHECK_MARK}` : "No file attached"}
      </Text>
      {fileName ? (
        <Text style={styles.fileNameText} numberOfLines={1}>
          {fileName}
        </Text>
      ) : null}
    </View>
  );
}

function DocumentUploadButton({
  uploading,
  onPress,
}: {
  uploading: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeFileUploadPickerStyles);

  if (uploading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Uploading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.documentButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Upload PDF or Word document"
    >
      <Text style={styles.documentButtonText}>Choose PDF / Word</Text>
    </TouchableOpacity>
  );
}

function UploadGuidance({ uploadError }: { uploadError: string }) {
  const styles = useThemedStyles(makeFileUploadPickerStyles);

  return (
    <>
      <Text style={styles.helperText}>Images are compressed automatically. Max 3 MB.</Text>
      <Text style={styles.helperText}>
        Max 3 MB {"\u00b7"} JPG, PNG, WebP, GIF, PDF, Word
      </Text>
      {uploadError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {uploadError}
        </Text>
      ) : null}
    </>
  );
}

function getFileNameFromUrl(currentUrl: string): string | null {
  const trimmedUrl = currentUrl.trim();
  if (!trimmedUrl) return null;

  const rawName = trimmedUrl.split(/[?#]/, 1)[0].split("/").pop();
  return rawName ? decodeURIComponent(rawName) : null;
}

function getUploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message || "Upload failed. Please try again.";
  }

  return "Upload failed. Please try again.";
}

export function FileUploadPicker({ currentUrl, onUploadSuccess }: FileUploadPickerProps) {
  const [documentUploading, setDocumentUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const styles = useThemedStyles(makeFileUploadPickerStyles);
  const hasFile = currentUrl.trim().length > 0;
  const fileName = hasFile ? uploadedFileName ?? getFileNameFromUrl(currentUrl) : null;

  function handleUploadSuccess(url: string, fileName: string) {
    setUploadError("");
    setUploadedFileName(fileName);
    onUploadSuccess(url);
  }

  async function handlePickDocument() {
    setUploadError("");
    const result = await DocumentPicker.getDocumentAsync({
      type: DOCUMENT_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    await doDocumentUpload({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? "application/octet-stream",
    });
  }

  async function doDocumentUpload(file: UploadableFile) {
    setDocumentUploading(true);
    try {
      const { url } = await uploadFile("/api/upload", file);
      handleUploadSuccess(url, file.name);
    } catch (error) {
      const message = getUploadErrorMessage(error);
      setUploadError(message);
      Alert.alert("Upload failed", message);
    } finally {
      setDocumentUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <UploadStatus hasFile={hasFile} fileName={fileName} />
      <ImageUploadButton
        disabled={documentUploading}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={setUploadError}
      />
      <DocumentUploadButton
        uploading={documentUploading}
        onPress={() => void handlePickDocument()}
      />
      <UploadGuidance uploadError={uploadError} />
    </View>
  );
}

function makeFileUploadPickerStyles(colors: AppColors) {
  return StyleSheet.create({
    container: {
      gap: 10,
      marginBottom: 16,
    },
    statusBox: {
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    statusBoxSuccess: {
      borderColor: colors.successBorder,
      backgroundColor: colors.successSoft,
    },
    statusText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "700",
    },
    statusTextSuccess: {
      color: colors.textStrong,
      fontSize: 13,
      fontWeight: "800",
    },
    fileNameText: {
      marginTop: 4,
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    documentButton: {
      minHeight: 44,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    documentButtonText: {
      color: colors.textStrong,
      fontSize: 13,
      fontWeight: "700",
    },
    loadingRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
    },
  });
}
