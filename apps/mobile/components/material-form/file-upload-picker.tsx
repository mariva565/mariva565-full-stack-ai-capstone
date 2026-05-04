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
import * as DocumentPicker from "expo-document-picker";
import { uploadFile } from "../../lib/api";

type FileUploadPickerProps = {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
};

export function FileUploadPicker({ currentUrl, onUploadSuccess }: FileUploadPickerProps) {
  const [uploading, setUploading] = useState(false);

  async function handlePickImage(source: "camera" | "library") {
    const permissionResult =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Please allow access in Settings.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.85 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const extension = asset.uri.split(".").pop() ?? "jpg";
    const mimeType = asset.mimeType ?? `image/${extension}`;

    await doUpload({ uri: asset.uri, name: `material-${Date.now()}.${extension}`, type: mimeType });
  }

  async function handlePickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    await doUpload({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? "application/octet-stream" });
  }

  async function doUpload(file: { uri: string; name: string; type: string }) {
    setUploading(true);
    try {
      const { url } = await uploadFile("/api/upload", file);
      onUploadSuccess(url);
    } catch {
      Alert.alert("Upload failed", "Could not upload file. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {currentUrl ? (
        <Text style={styles.uploadedText} numberOfLines={1}>
          ✅ File uploaded
        </Text>
      ) : null}
      {uploading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Uploading…</Text>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => void handlePickImage("library")}
            accessibilityRole="button"
            accessibilityLabel="Upload image from gallery"
          >
            <Text style={styles.btnText}>📷 Image</Text>
          </TouchableOpacity>
          {Platform.OS !== "web" ? (
            <TouchableOpacity
              style={styles.btn}
              onPress={() => void handlePickImage("camera")}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
            >
              <Text style={styles.btnText}>Camera</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.btn}
            onPress={() => void handlePickDocument()}
            accessibilityRole="button"
            accessibilityLabel="Upload PDF or Word document"
          >
            <Text style={styles.btnText}>📄 PDF / Word</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  uploadedText: { fontSize: 13, color: "#22c55e", marginBottom: 6 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 13, color: "#94a3b8" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  btnText: { fontSize: 13, color: "#e2e8f0" },
});
