import { Platform, Vibration } from "react-native";

export type HapticIntent = "success" | "error" | "destructive" | "selection";

let hapticsEnabledPreference = true;

type ExpoHapticsModule = {
  notificationAsync: (type: unknown) => Promise<void>;
  impactAsync: (style: unknown) => Promise<void>;
  selectionAsync: () => Promise<void>;
  NotificationFeedbackType: {
    Success: unknown;
    Error: unknown;
    Warning: unknown;
  };
  ImpactFeedbackStyle: {
    Light: unknown;
    Medium: unknown;
    Heavy: unknown;
  };
};

function getExpoHaptics(): ExpoHapticsModule | null {
  try {
    return require("expo-haptics") as ExpoHapticsModule;
  } catch {
    return null;
  }
}

function vibrateFallback(intent: HapticIntent) {
  if (Platform.OS === "web") {
    return;
  }

  if (intent === "destructive") {
    Vibration.vibrate([0, 28, 36, 20]);
    return;
  }
  if (intent === "error") {
    Vibration.vibrate([0, 32, 48, 28]);
    return;
  }
  if (intent === "selection") {
    Vibration.vibrate(10);
    return;
  }

  Vibration.vibrate(16);
}

async function runExpoHaptic(module: ExpoHapticsModule, intent: HapticIntent) {
  if (intent === "destructive") {
    await module.notificationAsync(module.NotificationFeedbackType.Warning);
    return;
  }
  if (intent === "error") {
    await module.notificationAsync(module.NotificationFeedbackType.Error);
    return;
  }
  if (intent === "selection") {
    await module.selectionAsync();
    return;
  }

  await module.notificationAsync(module.NotificationFeedbackType.Success);
}

export function setHapticsEnabledPreference(enabled: boolean) {
  hapticsEnabledPreference = enabled;
}

export async function triggerHaptic(intent: HapticIntent) {
  if (Platform.OS === "web" || !hapticsEnabledPreference) {
    return;
  }

  const expoHaptics = getExpoHaptics();
  if (!expoHaptics) {
    vibrateFallback(intent);
    return;
  }

  try {
    await runExpoHaptic(expoHaptics, intent);
  } catch {
    vibrateFallback(intent);
  }
}
