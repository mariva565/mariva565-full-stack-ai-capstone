import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "../../lib/app-preferences";

function normalizeUserIdParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return (value[0] ?? "").trim();
  }
  return (value ?? "").trim();
}

export default function ProfileDeepLinkRoute() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId?: string | string[] }>();
  const { colors } = useTheme();
  const normalizedUserId = normalizeUserIdParam(userId);

  useEffect(() => {
    const handoffValue = normalizedUserId || "invalid";
    router.replace(`/(tabs)/profile?handoffUserId=${encodeURIComponent(handoffValue)}`);
  }, [normalizedUserId, router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.canvas,
      }}
    >
      <ActivityIndicator size="small" color={colors.brandPrimary} />
    </View>
  );
}
