import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { ToastProvider } from "../lib/toast-context";
import { COLORS } from "../lib/colors";
import { ActivityIndicator, View } from "react-native";

function AuthGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading) return;
    if (!navigationState?.key) return;

    const firstSegment = segments[0];
    const onAuthScreen = firstSegment === "login" || firstSegment === "register";

    if (!user && !onAuthScreen) {
      router.replace("/login");
    } else if (user && onAuthScreen) {
      router.replace("/");
    }
  }, [user, isLoading, segments, navigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.brandDeep }}>
        <ActivityIndicator size="large" color={COLORS.textOnBrand} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.brandDeep} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.brandDeep },
          headerTintColor: COLORS.textOnBrand,
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: "Register" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthGate />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
