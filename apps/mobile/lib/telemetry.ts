import * as Sentry from "@sentry/react-native";

type TelemetryUser = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

type TelemetryContext = {
  area: string;
  details?: Record<string, unknown>;
};

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.EXPO_PUBLIC_APP_ENV ?? (__DEV__ ? "development" : "production");
const DEFAULT_TRACES_SAMPLE_RATE = __DEV__ ? 0 : 0.1;

let isTelemetryInitialized = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isSensitiveHeaderKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return normalized === "authorization" || normalized === "cookie" || normalized === "set-cookie";
}

function sanitizeBreadcrumbData(value: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, item] of Object.entries(value)) {
    if (isSensitiveHeaderKey(key)) {
      sanitized[key] = "[Filtered]";
      continue;
    }

    sanitized[key] = isRecord(item) ? sanitizeBreadcrumbData(item) : item;
  }

  return sanitized;
}

function parseSampleRate(rawValue: string | undefined, fallback: number): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.min(1, parsed));
}

function telemetryEnabled(): boolean {
  return typeof SENTRY_DSN === "string" && SENTRY_DSN.trim().length > 0;
}

export function initializeTelemetry(): void {
  if (isTelemetryInitialized) {
    return;
  }

  isTelemetryInitialized = true;

  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: telemetryEnabled(),
    environment: SENTRY_ENVIRONMENT,
    attachStacktrace: true,
    sendDefaultPii: false,
    tracesSampleRate: parseSampleRate(
      process.env.EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
      DEFAULT_TRACES_SAMPLE_RATE
    ),
    beforeBreadcrumb(breadcrumb) {
      if (!isRecord(breadcrumb.data)) {
        return breadcrumb;
      }

      return {
        ...breadcrumb,
        data: sanitizeBreadcrumbData(breadcrumb.data),
      };
    },
  });
}

export function setTelemetryUser(user: TelemetryUser | null): void {
  if (!isTelemetryInitialized) {
    return;
  }

  if (!user) {
    Sentry.setUser(null);
    Sentry.setTag("user_role", "anonymous");
    return;
  }

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.name,
  });
  Sentry.setTag("user_role", user.role);
}

export function captureTelemetryException(error: unknown, context?: TelemetryContext): void {
  if (!telemetryEnabled()) {
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      scope.setTag("mobile_area", context.area);
      if (context.details) {
        scope.setContext("details", context.details);
      }

      if (error instanceof Error) {
        Sentry.captureException(error);
        return;
      }

      Sentry.captureMessage("Non-error exception captured.");
    });
    return;
  }

  if (error instanceof Error) {
    Sentry.captureException(error);
    return;
  }

  Sentry.captureMessage("Non-error exception captured.");
}

export function captureTelemetryMessage(message: string, context?: TelemetryContext): void {
  if (!telemetryEnabled()) {
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      scope.setTag("mobile_area", context.area);
      if (context.details) {
        scope.setContext("details", context.details);
      }
      Sentry.captureMessage(message);
    });
    return;
  }

  Sentry.captureMessage(message);
}
