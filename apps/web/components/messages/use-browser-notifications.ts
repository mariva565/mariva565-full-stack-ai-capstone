"use client";

import { useCallback, useEffect, useState } from "react";

export type NativeNotificationAlert = {
  title: string;
  body: string;
  tag: string;
  href: string;
};

/**
 * Manages browser Notification API permission state and exposes a helper
 * to fire a native notification when the tab is not visible.
 * Returns false if the notification was not shown (caller should show a toast).
 */
export function useBrowserNotifications() {
  // Start as false / "denied" on both server and client to avoid hydration mismatch.
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("denied");

  useEffect(() => {
    const supported = typeof window !== "undefined" && "Notification" in window;
    setNotificationsSupported(supported);
    if (supported) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!notificationsSupported) return;

    const syncPermission = () => {
      setNotificationPermission(window.Notification.permission);
    };
    syncPermission();
    window.addEventListener("focus", syncPermission);
    return () => {
      window.removeEventListener("focus", syncPermission);
    };
  }, [notificationsSupported]);

  const requestNotificationPermission = useCallback(async () => {
    if (!notificationsSupported) {
      setNotificationPermission("denied");
      return "denied" as const;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  }, [notificationsSupported]);

  const showNativeNotification = useCallback(
    ({ title, body, tag, href }: NativeNotificationAlert): boolean => {
      if (!notificationsSupported || notificationPermission !== "granted") {
        return false;
      }
      if (document.visibilityState === "visible") {
        return false;
      }

      const notification = new window.Notification(title, { body, tag });
      notification.onclick = () => {
        window.focus();
        window.location.href = href;
        notification.close();
      };
      return true;
    },
    [notificationPermission, notificationsSupported]
  );

  return {
    notificationsSupported,
    notificationPermission,
    requestNotificationPermission,
    showNativeNotification,
  };
}
