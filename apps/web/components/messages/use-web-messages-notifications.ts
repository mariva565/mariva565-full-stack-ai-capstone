"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ConversationOtherUser = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

type ConversationLastMessage = {
  content: string;
  senderId: number;
  createdAt: string;
};

type ConversationListItem = {
  id: number;
  other: ConversationOtherUser | null;
  lastMessage: ConversationLastMessage | null;
  hasUnread?: boolean;
  unreadCount?: number;
};

type IncomingAlert = {
  title: string;
  body: string;
  conversationId: number;
  createdAtTs: number;
};

const MESSAGES_POLL_INTERVAL_MS = 15000;
const COMMENTS_POLL_INTERVAL_MS = 20000;

type CommentNotification = {
  commentId: number;
  postId: number;
  postTitle: string;
  authorName: string;
  createdAt: string;
};

function getActiveConversationId(pathname: string): number | null {
  const match = pathname.match(/^\/messages\/(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getConversationUnreadCount(conversation: ConversationListItem): number {
  const unreadCount = Number(conversation.unreadCount ?? 0);
  if (Number.isFinite(unreadCount) && unreadCount > 0) {
    return unreadCount;
  }
  return conversation.hasUnread ? 1 : 0;
}

function buildUnreadMap(
  conversations: ConversationListItem[]
): Record<string, number> {
  const unreadMap: Record<string, number> = {};
  for (const conversation of conversations) {
    unreadMap[String(conversation.id)] = getConversationUnreadCount(conversation);
  }
  return unreadMap;
}

function resolveIncomingAlert(
  conversations: ConversationListItem[],
  previousUnreadMap: Record<string, number>,
  currentUnreadMap: Record<string, number>,
  activeConversationId: number | null
): IncomingAlert | null {
  let latestAlert: IncomingAlert | null = null;

  for (const conversation of conversations) {
    if (activeConversationId === conversation.id) {
      continue;
    }

    const conversationIdKey = String(conversation.id);
    const previousUnread = previousUnreadMap[conversationIdKey] ?? 0;
    const currentUnread = currentUnreadMap[conversationIdKey] ?? 0;
    if (currentUnread <= previousUnread) {
      continue;
    }

    const senderName = conversation.other?.name ?? "StudyHub";
    const rawPreview = conversation.lastMessage?.content?.trim() ?? "";
    const preview =
      rawPreview.length > 120 ? `${rawPreview.slice(0, 117)}...` : rawPreview;
    const createdAtTs = Date.parse(conversation.lastMessage?.createdAt ?? "");
    const safeCreatedAtTs = Number.isNaN(createdAtTs) ? Date.now() : createdAtTs;
    const nextAlert: IncomingAlert = {
      title: `New message from ${senderName}`,
      body: preview || "Open Messages to reply.",
      conversationId: conversation.id,
      createdAtTs: safeCreatedAtTs,
    };

    if (!latestAlert || nextAlert.createdAtTs > latestAlert.createdAtTs) {
      latestAlert = nextAlert;
    }
  }

  return latestAlert;
}

export function useWebMessagesNotifications(
  currentUserId: number | undefined,
  pathname: string
) {
  // Start as false on both server and client to avoid hydration mismatch.
  // Updated in useEffect after hydration.
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Initialize to "denied" on both server and client — synced via useEffect.
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("denied");
  const previousUnreadRef = useRef<Record<string, number>>({});
  const initializedRef = useRef(false);
  const lastCommentCheckRef = useRef<string>(new Date().toISOString());

  // Sync notificationsSupported and notificationPermission after hydration.
  useEffect(() => {
    const supported = typeof window !== "undefined" && "Notification" in window;
    setNotificationsSupported(supported);
    if (supported) {
      setNotificationPermission(window.Notification.permission);
    }
  }, []);

  useEffect(() => {
    previousUnreadRef.current = {};
    initializedRef.current = false;
    setConversations([]);
    setToastMessage(null);
  }, [currentUserId]);

  useEffect(() => {
    if (!notificationsSupported) {
      return;
    }

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

  const showNativeMessageNotification = useCallback(
    (alert: IncomingAlert) => {
      if (!notificationsSupported || notificationPermission !== "granted") {
        return false;
      }
      if (document.visibilityState === "visible") {
        return false;
      }

      const notification = new window.Notification(alert.title, {
        body: alert.body,
        tag: `studyhub-message-${alert.conversationId}`,
      });
      notification.onclick = () => {
        window.focus();
        window.location.href = `/messages/${alert.conversationId}`;
        notification.close();
      };
      return true;
    },
    [notificationPermission, notificationsSupported]
  );

  const refreshConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch("/api/conversations", { cache: "no-store" });
      if (!response.ok) return;

      const data = (await response.json()) as ConversationListItem[];
      setConversations(data);

      const activeConversationId = getActiveConversationId(pathname);
      const currentUnreadMap = buildUnreadMap(data);

      if (initializedRef.current) {
        const incomingAlert = resolveIncomingAlert(
          data,
          previousUnreadRef.current,
          currentUnreadMap,
          activeConversationId
        );
        if (incomingAlert) {
          const displayedAsNative = showNativeMessageNotification(incomingAlert);
          if (!displayedAsNative) {
            setToastMessage(`${incomingAlert.title}: ${incomingAlert.body}`);
          }
        }
      }

      previousUnreadRef.current = currentUnreadMap;
      if (!initializedRef.current) {
        initializedRef.current = true;
      }
    } catch {
      // Ignore polling/network errors and keep silent background retries.
    }
  }, [currentUserId, pathname, showNativeMessageNotification]);

  useEffect(() => {
    if (!currentUserId) return;

    void refreshConversations();
    const intervalId = window.setInterval(() => {
      void refreshConversations();
    }, MESSAGES_POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentUserId, refreshConversations]);

  const refreshCommentNotifications = useCallback(async () => {
    if (!currentUserId) return;
    const since = lastCommentCheckRef.current;
    lastCommentCheckRef.current = new Date().toISOString();
    try {
      const response = await fetch(
        `/api/notifications/comments?since=${encodeURIComponent(since)}`,
        { cache: "no-store" }
      );
      if (!response.ok) return;
      const data = (await response.json()) as CommentNotification[];
      if (!data.length) return;

      const latest = data[0];
      const title = `New comment on "${latest.postTitle}"`;
      const body = `${latest.authorName} commented on your post`;

      const shownAsNative =
        notificationsSupported &&
        notificationPermission === "granted" &&
        document.visibilityState !== "visible" &&
        (() => {
          const n = new window.Notification(title, {
            body,
            tag: `studyhub-comment-${latest.postId}`,
          });
          n.onclick = () => {
            window.focus();
            window.location.href = `/community/${latest.postId}`;
            n.close();
          };
          return true;
        })();

      if (!shownAsNative) {
        setToastMessage(`${title}: ${body}`);
      }
    } catch {
      // Ignore polling errors silently.
    }
  }, [currentUserId, notificationsSupported, notificationPermission]);

  useEffect(() => {
    if (!currentUserId) return;
    const intervalId = window.setInterval(() => {
      void refreshCommentNotifications();
    }, COMMENTS_POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentUserId, refreshCommentNotifications]);

  const unreadCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + getConversationUnreadCount(conversation),
        0
      ),
    [conversations]
  );

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return {
    unreadCount,
    toastMessage,
    closeToast,
    notificationsSupported,
    notificationPermission,
    requestNotificationPermission,
  };
}
