import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

import { setHapticsEnabledPreference } from "./haptics";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

type StoredPreferences = {
  themeMode: ThemeMode;
  hapticsEnabled: boolean;
};

type AppPreferencesContextValue = {
  ready: boolean;
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  hapticsEnabled: boolean;
  setThemeMode: (value: ThemeMode) => void;
  setHapticsEnabled: (value: boolean) => void;
};

const STORAGE_KEY = "studyhub_app_preferences_v1";
const DEFAULT_PREFERENCES: StoredPreferences = {
  themeMode: "system",
  hapticsEnabled: true,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue>({
  ready: false,
  ...DEFAULT_PREFERENCES,
  resolvedTheme: "light",
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
  const systemTheme = useColorScheme();
  const { ready, preferences, updatePreferences } = useStoredPreferences();

  const setThemeMode = useCallback(
    (value: ThemeMode) => {
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
    if (preferences.themeMode === "system") {
      return systemTheme === "dark" ? "dark" : "light";
    }
    return preferences.themeMode;
  }, [preferences.themeMode, systemTheme]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      ready,
      themeMode: preferences.themeMode,
      resolvedTheme,
      hapticsEnabled: preferences.hapticsEnabled,
      setThemeMode,
      setHapticsEnabled,
    }),
    [ready, preferences.themeMode, preferences.hapticsEnabled, resolvedTheme, setThemeMode, setHapticsEnabled]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences(): AppPreferencesContextValue {
  return useContext(AppPreferencesContext);
}
