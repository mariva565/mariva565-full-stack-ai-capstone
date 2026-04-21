import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useEffect, type ReactNode } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Sentry from "@sentry/react-native";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { AppPreferencesProvider, useTheme } from "../lib/app-preferences";
import { ConfirmDialogProvider } from "../lib/confirm-dialog-context";
import { ToastProvider } from "../lib/toast-context";
import { BRAND_FONT_FAMILY, BRAND_FONT_SOURCE } from "../lib/brand-font";
import { COLORS } from "../lib/colors";
import { ActivityIndicator, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  queryClient,
  queryPersister,
  REACT_QUERY_MAX_AGE_MS,
} from "../lib/query-client";
import { configureReactQueryLifecycle } from "../lib/react-query-lifecycle";
import { initializeTelemetry } from "../lib/telemetry";
import { usePushNotifications } from "../lib/use-push-notifications";

initializeTelemetry();

const WEB_SHELL_BREAKPOINT = 820;
const WEB_SHELL_MAX_WIDTH = 520;

function AppShell({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const useFramedShell = Platform.OS === "web" && width >= WEB_SHELL_BREAKPOINT;

  return (
    <View
      style={[
        styles.shellOuter,
        {
          backgroundColor: useFramedShell ? colors.violetSoft : colors.canvas,
          paddingHorizontal: useFramedShell ? 18 : 0,
          paddingVertical: useFramedShell ? 18 : 0,
        },
      ]}
    >
      <View
        style={[
          styles.shellInner,
          { backgroundColor: colors.canvas },
          useFramedShell && {
            maxWidth: WEB_SHELL_MAX_WIDTH,
            borderRadius: 28,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.18,
            shadowRadius: 28,
            elevation: 12,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();
  usePushNotifications();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  // Live theme: re-renders when mode changes so header and status bar update immediately.
  const { colors, resolvedTheme } = useTheme();

  const navigationTheme =
    resolvedTheme === "dark"
      ? {
          ...NavigationDarkTheme,
          colors: {
            ...NavigationDarkTheme.colors,
            primary: colors.brandPrimary,
            background: colors.canvas,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.borderSubtle,
            notification: colors.dangerAccent,
          },
        }
      : {
          ...NavigationDefaultTheme,
          colors: {
            ...NavigationDefaultTheme.colors,
            primary: colors.brandPrimary,
            background: colors.canvas,
            card: colors.surface,
            text: colors.textPrimary,
            border: colors.borderSubtle,
            notification: colors.dangerAccent,
          },
        };

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
      <AppShell>
        <View style={[styles.centered, { backgroundColor: colors.brandDeep }]}>
          <ActivityIndicator size="large" color={colors.textOnBrand} />
        </View>
      </AppShell>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <AppShell>
        <StatusBar style="light" backgroundColor={colors.brandDeep} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.brandDeep },
            headerTintColor: colors.textOnBrand,
            headerTitleStyle: { fontWeight: "700", color: colors.textOnBrand },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
          <Stack.Screen name="profile/[userId]" options={{ headerShown: false }} />
          <Stack.Screen name="community/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="community/new" options={{ headerShown: false }} />
          <Stack.Screen name="messages/index" options={{ headerShown: false }} />
          <Stack.Screen name="messages/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ title: "Settings" }} />
          <Stack.Screen name="chat" options={{ presentation: "modal", title: "StudyHub Mentor" }} />
        </Stack>
      </AppShell>
    </ThemeProvider>
  );
}

function RootLayout() {
  const [brandFontLoaded] = useFonts({
    [BRAND_FONT_FAMILY]: BRAND_FONT_SOURCE,
    Rubik: require("../assets/fonts/Rubik_800ExtraBold.ttf"),
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
        <AppPreferencesProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmDialogProvider>
                <AuthGate />
              </ConfirmDialogProvider>
            </ToastProvider>
          </AuthProvider>
        </AppPreferencesProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  shellOuter: {
    flex: 1,
    width: "100%",
  },
  shellInner: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});
