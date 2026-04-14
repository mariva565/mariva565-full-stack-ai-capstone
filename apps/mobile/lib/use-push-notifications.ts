import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import Constants from "expo-constants";
import { useAuth } from "./auth-context";
import { apiFetch } from "./api";
import { captureTelemetryException } from "./telemetry";
import { useToast } from "./toast-context";

// Must be evaluated before any expo-notifications import to prevent
// DevicePushTokenAutoRegistration.fx.js module-level side effects from
// running in Expo Go (SDK 53+ removed remote push support from Expo Go).
function isExpoGoRuntime(): boolean {
  const appOwnership = Constants.appOwnership;
  if (appOwnership === "expo") {
    return true;
  }
  const executionEnvironment = (
    Constants as unknown as { executionEnvironment?: unknown }
  ).executionEnvironment;
  return executionEnvironment === "storeClient";
}

const IS_EXPO_GO = isExpoGoRuntime();

// Lazy require — never import expo-notifications in Expo Go.
// A static `import * as Notifications` would execute module-level side
// effects (DevicePushTokenAutoRegistration) before any runtime guard runs.
type NotificationsModule = typeof import("expo-notifications");
const Notifications: NotificationsModule | null = IS_EXPO_GO
  ? null
  : (require("expo-notifications") as NotificationsModule);

if (Notifications) {
  // Suppress OS banner while the app is foregrounded; we show an in-app toast instead.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}

type PushNotificationData = {
  type?: unknown;
  conversationId?: unknown;
  postId?: unknown;
};

function parsePositiveInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

/** @deprecated alias kept for readability at call sites */
const parseConversationId = parsePositiveInt;

function getActiveConversationId(pathname: string): number | null {
  const match = pathname.match(/^\/messages\/(\d+)$/);
  if (!match) {
    return null;
  }
  return parseConversationId(match[1]);
}

function getExpoProjectId(): string | null {
  const fromEasConfig =
    (Constants.easConfig as { projectId?: string } | null)?.projectId ?? null;
  if (fromEasConfig) {
    return fromEasConfig;
  }
  const fromExpoConfig =
    (
      Constants.expoConfig?.extra as
        | { eas?: { projectId?: string } }
        | undefined
    )?.eas?.projectId ?? null;
  return fromExpoConfig;
}

export function usePushNotifications(): void {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const registeredRef = useRef<string | null>(null);
  const activeConversationId = getActiveConversationId(pathname);

  // Foreground notification listener — skipped entirely in Expo Go.
  useEffect(() => {
    if (IS_EXPO_GO || isLoading || !user || !Notifications) {
      return;
    }

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as PushNotificationData;
        const type = typeof data?.type === "string" ? data.type : "";

        if (type === "message") {
          const incomingConversationId = parseConversationId(data?.conversationId);
          if (incomingConversationId && activeConversationId === incomingConversationId) {
            return;
          }
          const title = notification.request.content.title ?? "New message";
          const body = notification.request.content.body ?? "";
          showToast(body ? `${title}: ${body}` : title, "info");
          return;
        }

        if (type === "comment") {
          const title = notification.request.content.title ?? "New comment";
          const body = notification.request.content.body ?? "";
          showToast(body ? `${title}: ${body}` : title, "info");
          return;
        }
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as PushNotificationData;
        const type = typeof data?.type === "string" ? data.type : "";

        if (type === "message") {
          const conversationId = parseConversationId(data?.conversationId);
          if (conversationId) {
            router.push(`/messages/${conversationId}` as never);
          }
          return;
        }

        if (type === "comment") {
          const postId = parsePositiveInt(data?.postId);
          if (postId) {
            router.push(`/community/${postId}` as never);
          }
          return;
        }
      }
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content
        .data as PushNotificationData;
      const type = typeof data?.type === "string" ? data.type : "";

      if (type === "message") {
        const conversationId = parseConversationId(data?.conversationId);
        if (conversationId) {
          router.push(`/messages/${conversationId}` as never);
        }
        return;
      }

      if (type === "comment") {
        const postId = parsePositiveInt(data?.postId);
        if (postId) {
          router.push(`/community/${postId}` as never);
        }
        return;
      }
    });

    return () => {
      foregroundSubscription.remove();
      subscription.remove();
    };
  }, [activeConversationId, isLoading, router, showToast, user]);

  // Push token registration — skipped entirely in Expo Go.
  useEffect(() => {
    if (IS_EXPO_GO || isLoading || !Notifications) {
      return;
    }

    if (!user) {
      registeredRef.current = null;
      return;
    }

    let cancelled = false;
    const registerPushToken = async () => {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("messages", {
            name: "Messages",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#6366f1",
            sound: "default",
          });
        }

        const permissions = await Notifications.getPermissionsAsync();
        let finalStatus = permissions.status;
        if (finalStatus !== "granted") {
          const requestResult = await Notifications.requestPermissionsAsync();
          finalStatus = requestResult.status;
        }

        if (finalStatus !== "granted") {
          return;
        }

        const projectId = getExpoProjectId();
        if (!projectId) {
          return;
        }

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        if (cancelled) return;

        const expoToken = tokenResult.data;
        if (!expoToken) return;

        const registrationSignature = `${user.id}:${expoToken}`;
        if (registeredRef.current === registrationSignature) return;

        await apiFetch("/api/mobile/push-token", {
          method: "POST",
          body: {
            token: expoToken,
            platform: Platform.OS,
            appOwnership: Constants.appOwnership ?? null,
          },
          cache: false,
        });

        if (cancelled) return;
        registeredRef.current = registrationSignature;
      } catch (error) {
        captureTelemetryException(error, {
          area: "mobile_push_registration",
        });
      }
    };

    void registerPushToken();
    return () => {
      cancelled = true;
    };
  }, [isLoading, user]);
}
