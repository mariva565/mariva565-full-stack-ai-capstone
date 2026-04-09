import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { ToastProvider } from "../lib/toast-context";
import { BRAND_FONT_FAMILY, BRAND_FONT_SOURCE } from "../lib/brand-font";
import { COLORS } from "../lib/colors";
import { ActivityIndicator, View } from "react-native";
import {
  queryClient,
  queryPersister,
  REACT_QUERY_MAX_AGE_MS,
} from "../lib/query-client";
import { configureReactQueryLifecycle } from "../lib/react-query-lifecycle";

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
  const [brandFontLoaded] = useFonts({
    [BRAND_FONT_FAMILY]: BRAND_FONT_SOURCE,
  });

  useEffect(() => {
    configureReactQueryLifecycle();
  }, []);

  if (!brandFontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.brandDeep }}>
        <ActivityIndicator size="large" color={COLORS.textOnBrand} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: queryPersister, maxAge: REACT_QUERY_MAX_AGE_MS }}
        onSuccess={() => {
          void queryClient.resumePausedMutations();
        }}
      >
        <AuthProvider>
          <ToastProvider>
            <AuthGate />
          </ToastProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
