import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { usePathname, useRouter } from "expo-router";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useAuth } from "./auth-context";
import { apiFetch } from "./api";
import { captureTelemetryException } from "./telemetry";
import { useToast } from "./toast-context";

Notifications.setNotificationHandler({
  // Foreground notifications are surfaced via in-app toast instead of
  // an OS banner to avoid duplicated alerts while the app is already open.
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

type MessageNotificationData = {
  type?: unknown;
  conversationId?: unknown;
};

function parseConversationId(value: unknown): number | null {
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

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as MessageNotificationData;
        const type = typeof data?.type === "string" ? data.type : "";
        if (type !== "message") {
          return;
        }
        const incomingConversationId = parseConversationId(data?.conversationId);
        if (
          incomingConversationId &&
          activeConversationId === incomingConversationId
        ) {
          return;
        }

        const title = notification.request.content.title ?? "New message";
        const body = notification.request.content.body ?? "";
        const toastMessage = body ? `${title}: ${body}` : title;
        showToast(toastMessage, "info");
      });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content
          .data as MessageNotificationData;
        const type = typeof data?.type === "string" ? data.type : "";
        const conversationId = parseConversationId(data?.conversationId);

        if (type === "message" && conversationId) {
          router.push(`/messages/${conversationId}` as never);
        }
      }
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) {
        return;
      }
      const data = response.notification.request.content.data as MessageNotificationData;
      const type = typeof data?.type === "string" ? data.type : "";
      const conversationId = parseConversationId(data?.conversationId);
      if (type === "message" && conversationId) {
        router.push(`/messages/${conversationId}` as never);
      }
    });

    return () => {
      foregroundSubscription.remove();
      subscription.remove();
    };
  }, [activeConversationId, isLoading, router, showToast, user]);

  useEffect(() => {
    if (isLoading) {
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

        if (cancelled) {
          return;
        }

        const expoToken = tokenResult.data;
        if (!expoToken) {
          return;
        }

        const registrationSignature = `${user.id}:${expoToken}`;
        if (registeredRef.current === registrationSignature) {
          return;
        }

        await apiFetch("/api/mobile/push-token", {
          method: "POST",
          body: {
            token: expoToken,
            platform: Platform.OS,
            appOwnership: Constants.appOwnership ?? null,
          },
          cache: false,
        });

        if (cancelled) {
          return;
        }

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
