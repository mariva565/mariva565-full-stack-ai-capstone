import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, useColorScheme } from "react-native";

import { setHapticsEnabledPreference } from "./haptics";
import {
  getColorsForThemeMode,
  getStoredThemeModeSync,
  resolveThemeMode,
  setStoredThemeModeSync,
  type AppColors,
  type ThemeMode,
} from "./colors";

export type ResolvedTheme = "light" | "dark";

type StoredPreferences = {
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
};

type ThemeContextValue = {
  colors: AppColors;
  resolvedTheme: ResolvedTheme;
};

type AppPreferencesContextValue = {
  ready: boolean;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  hapticsEnabled: boolean;
  colors: AppColors;
  setThemeMode: (value: ThemeMode) => void;
  setHapticsEnabled: (value: boolean) => void;
};

const STORAGE_KEY = "studyhub_app_preferences_v1";
const DEFAULT_PREFERENCES: StoredPreferences = {
  themeMode: getStoredThemeModeSync(),
  hapticsEnabled: true,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue>({
  ready: false,
  ...DEFAULT_PREFERENCES,
  resolvedTheme: "light",
  colors: getColorsForThemeMode("light"),
  setThemeMode: () => {},
  setHapticsEnabled: () => {},
});

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function parsePreferences(raw: string | null): StoredPreferences {
  if (!raw) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      themeMode: isThemeMode(parsed.themeMode) ? parsed.themeMode : DEFAULT_PREFERENCES.themeMode,
      hapticsEnabled:
        typeof parsed.hapticsEnabled === "boolean"
          ? parsed.hapticsEnabled
          : DEFAULT_PREFERENCES.hapticsEnabled,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

async function readPreferences(): Promise<StoredPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return parsePreferences(raw);
}

async function persistPreferences(preferences: StoredPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function useStoredPreferences() {
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState<StoredPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await readPreferences();
      if (cancelled) {
        return;
      }
      setStoredThemeModeSync(stored.themeMode);
      setPreferences(stored);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setHapticsEnabledPreference(preferences.hapticsEnabled);
  }, [preferences.hapticsEnabled]);

  const updatePreferences = useCallback((patch: Partial<StoredPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void persistPreferences(next);
      return next;
    });
  }, []);

  return { ready, preferences, updatePreferences };
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme() === "dark" ? "dark" : "light";
  const { ready, preferences, updatePreferences } = useStoredPreferences();

  const setThemeMode = useCallback(
    (value: ThemeMode) => {
      setStoredThemeModeSync(value);
      updatePreferences({ themeMode: value });
    },
    [updatePreferences]
  );

  const setHapticsEnabled = useCallback(
    (value: boolean) => {
      updatePreferences({ hapticsEnabled: value });
    },
    [updatePreferences]
  );

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    return resolveThemeMode(preferences.themeMode, systemTheme);
  }, [preferences.themeMode, systemTheme]);

  const colors = useMemo<AppColors>(() => {
    return getColorsForThemeMode(preferences.themeMode, systemTheme);
  }, [preferences.themeMode, systemTheme]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      ready,
      themeMode: preferences.themeMode,
      resolvedTheme,
      hapticsEnabled: preferences.hapticsEnabled,
      colors,
      setThemeMode,
      setHapticsEnabled,
    }),
    [ready, preferences.themeMode, preferences.hapticsEnabled, resolvedTheme, colors, setThemeMode, setHapticsEnabled]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences(): AppPreferencesContextValue {
  return useContext(AppPreferencesContext);
}

/** Returns live theme colors and resolved theme name. Re-renders when theme changes. */
export function useTheme(): ThemeContextValue {
  const { colors, resolvedTheme } = useContext(AppPreferencesContext);
  return { colors, resolvedTheme };
}

/**
 * Creates styles using the current theme colors, re-memoized when the theme changes.
 * Factory must be a stable reference (module-level function) to get effective memoization.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: AppColors) => T
): T {
  const { colors } = useContext(AppPreferencesContext);
  const factoryRef = useRef(factory);
  factoryRef.current = factory;
  return useMemo(() => StyleSheet.create(factoryRef.current(colors)), [colors]);
}
