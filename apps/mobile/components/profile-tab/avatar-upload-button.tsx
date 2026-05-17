import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "../../lib/api";

type AvatarUploadButtonProps = {
  avatarUrl: string | null | undefined;
  initials: string;
  onUploadSuccess: (newAvatarUrl: string) => void;
  styles: {
    avatarCircle: object;
    avatarText: object;
  };
};

const AVATAR_PICKER_OPTIONS = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: Platform.OS === "ios",
  aspect: [1, 1] as [number, number],
  quality: 0.8,
};

export function AvatarUploadButton({
  avatarUrl,
  initials,
  onUploadSuccess,
  styles,
}: AvatarUploadButtonProps) {
  const [uploading, setUploading] = useState(false);

  function handlePress() {
    Alert.alert("Update Profile Photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => void pickImage("camera"),
      },
      {
        text: "Choose from Library",
        onPress: () => void pickImage("library"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function pickImage(source: "camera" | "library") {
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
        ? await ImagePicker.launchCameraAsync(AVATAR_PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(AVATAR_PICKER_OPTIONS);

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const extension = asset.uri.split(".").pop() ?? "jpg";
    const mimeType = asset.mimeType ?? `image/${extension}`;

    setUploading(true);
    try {
      const { url } = await uploadFile("/api/auth/avatar", {
        uri: asset.uri,
        name: `avatar-${Date.now()}.${extension}`,
        type: mimeType,
      });
      onUploadSuccess(url);
    } catch {
      Alert.alert("Upload failed", "Could not upload photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Change profile photo"
      disabled={uploading}
    >
      <View style={styles.avatarCircle}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 999 }}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
        {uploading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator color="white" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
