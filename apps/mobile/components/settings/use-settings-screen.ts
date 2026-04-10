import { useCallback, useMemo } from "react";
import { Linking } from "react-native";
import Constants from "expo-constants";
import * as Application from "expo-application";
import { useRouter } from "expo-router";

import { useAuth } from "../../lib/auth-context";
import { useAppPreferences } from "../../lib/app-preferences";
import { type ThemeMode } from "../../lib/colors";
import { useToast } from "../../lib/toast-context";
import type { AboutLink, SettingsViewModel, ThemeOption } from "./settings.types";

const THEME_OPTIONS: ThemeOption[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const ABOUT_LINKS: AboutLink[] = [
  {
    id: "softuni",
    label: "SoftUni",
    description: "Capstone course page",
    url: "https://softuni.bg",
  },
  {
    id: "studyhub-v1",
    label: "StudyHub v1 Repo",
    description: "Legacy visual reference",
    url: "https://github.com/mariva565/Test-Capstone-Project-StudyHub",
  },
];

function getAppVersionLabel() {
  const version = Constants.expoConfig?.version ?? "dev";
  const build = Application.nativeBuildVersion ?? Application.nativeApplicationVersion;
  return build ? `v${version} (build ${build})` : `v${version}`;
}

async function tryOpenUrl(url: string): Promise<boolean> {
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    return false;
  }
  await Linking.openURL(url);
  return true;
}

function useAboutLinkAction(showToast: ReturnType<typeof useToast>["showToast"]) {
  return useCallback(
    (url: string) => {
      void tryOpenUrl(url).then((opened) => {
        if (!opened) {
          showToast("Could not open link", "error");
        }
      });
    },
    [showToast]
  );
}

function useAccountActions(
  router: ReturnType<typeof useRouter>,
  logout: () => Promise<void>,
  showToast: ReturnType<typeof useToast>["showToast"]
) {
  const openProfileEditor = useCallback(() => {
    router.replace("/(tabs)/profile?edit=1");
  }, [router]);

  const handleLogout = useCallback(() => {
    void logout().catch(() => {
      showToast("Could not log out. Please try again.", "error");
    });
  }, [logout, showToast]);

  return { openProfileEditor, handleLogout };
}

function usePreferenceActions(
  preferences: ReturnType<typeof useAppPreferences>,
  showToast: ReturnType<typeof useToast>["showToast"]
) {
  const setThemeMode = useCallback(
    (value: ThemeMode) => {
      if (value === preferences.themeMode) {
        return;
      }
      // Live theme update — no reload needed; React context propagates the change immediately.
      preferences.setThemeMode(value);
    },
    [preferences]
  );

  const setHapticsEnabled = useCallback(
    (value: boolean) => {
      preferences.setHapticsEnabled(value);
      showToast(value ? "Haptics enabled" : "Haptics disabled", "info", { haptic: "none" });
    },
    [preferences, showToast]
  );

  return { setThemeMode, setHapticsEnabled };
}

export function useSettingsScreen(): SettingsViewModel {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const preferences = useAppPreferences();
  const openAboutLink = useAboutLinkAction(showToast);
  const { openProfileEditor, handleLogout } = useAccountActions(router, logout, showToast);
  const { setThemeMode, setHapticsEnabled } = usePreferenceActions(preferences, showToast);

  return useMemo(
    () => ({
      ready: preferences.ready,
      themeMode: preferences.themeMode,
      hapticsEnabled: preferences.hapticsEnabled,
      appVersionLabel: getAppVersionLabel(),
      themeOptions: THEME_OPTIONS,
      aboutLinks: ABOUT_LINKS,
      setThemeMode,
      setHapticsEnabled,
      openAboutLink,
      openProfileEditor,
      logout: handleLogout,
    }),
    [
      preferences.ready,
      preferences.themeMode,
      preferences.hapticsEnabled,
      setThemeMode,
      setHapticsEnabled,
      openAboutLink,
      openProfileEditor,
      handleLogout,
    ]
  );
}
