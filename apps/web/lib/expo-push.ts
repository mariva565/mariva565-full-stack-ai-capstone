type ExpoPushData = {
  type: "message";
  conversationId: number;
};

type ExpoPushTarget = {
  token: string;
  title: string;
  body: string;
  data: ExpoPushData;
};

type ExpoPushResponse = {
  data?: Array<{
    status?: "ok" | "error";
    details?: {
      error?: string;
    };
  }>;
};

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_TOKEN_REGEX = /^(Expo|Exponent)PushToken\[[^\]]+\]$/;

export function isExpoPushToken(token: string): boolean {
  return EXPO_TOKEN_REGEX.test(token.trim());
}

export async function sendExpoPushNotifications(
  targets: ExpoPushTarget[]
): Promise<{ invalidTokens: string[] }> {
  if (targets.length === 0) {
    return { invalidTokens: [] };
  }

  const messages = targets
    .filter((target) => isExpoPushToken(target.token))
    .map((target) => ({
      to: target.token,
      title: target.title,
      body: target.body,
      data: target.data,
      sound: "default",
      channelId: "messages",
      priority: "high" as const,
    }));

  if (messages.length === 0) {
    return { invalidTokens: [] };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const accessToken = process.env.EXPO_PUSH_ACCESS_TOKEN;
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(messages),
      cache: "no-store",
    });

    if (!response.ok) {
      const bodyText = await response.text();
      console.error("Expo push request failed", response.status, bodyText);
      return { invalidTokens: [] };
    }

    const payload = (await response.json()) as ExpoPushResponse;
    if (!Array.isArray(payload.data)) {
      return { invalidTokens: [] };
    }

    const invalidTokens: string[] = [];
    payload.data.forEach((ticket, index) => {
      if (
        ticket?.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered"
      ) {
        const token = messages[index]?.to;
        if (token) {
          invalidTokens.push(token);
        }
      }
    });

    return { invalidTokens };
  } catch (error) {
    console.error("Expo push request crashed", error);
    return { invalidTokens: [] };
  }
}
