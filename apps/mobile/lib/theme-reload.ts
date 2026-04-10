import { DevSettings } from "react-native";

type ExpoUpdatesLike = {
  reloadAsync: () => Promise<void>;
};

function getExpoUpdates(): ExpoUpdatesLike | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-updates") as ExpoUpdatesLike;
  } catch {
    return null;
  }
}

export async function reloadAppForThemeChange(): Promise<boolean> {
  const updates = getExpoUpdates();
  if (updates) {
    try {
      await updates.reloadAsync();
      return true;
    } catch {
      // Fall through to dev reload.
    }
  }

  try {
    DevSettings.reload();
    return true;
  } catch {
    return false;
  }
}
