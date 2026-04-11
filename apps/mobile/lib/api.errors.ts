export type ApiErrorKind =
  | "validation"
  | "auth"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server"
  | "network"
  | "unknown";

type ApiErrorPayload = { code: string; message: string };

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return typeof payload.code === "string" && typeof payload.message === "string";
}

export class ApiError extends Error {
  code: string;
  status: number;
  kind: ApiErrorKind;

  constructor(code: string, message: string, status: number, kind: ApiErrorKind) {
    super(message);
    this.code = code;
    this.status = status;
    this.kind = kind;
  }
}

function getErrorKind(status: number, code: string): ApiErrorKind {
  const normalizedCode = code.toUpperCase();

  if (normalizedCode === "NETWORK_ERROR") {
    return "network";
  }

  if (status === 400 || status === 422) {
    return "validation";
  }

  if (
    status === 401 ||
    normalizedCode.includes("UNAUTHORIZED") ||
    normalizedCode.includes("AUTH")
  ) {
    return "auth";
  }

  if (status === 403 || normalizedCode.includes("FORBIDDEN")) {
    return "forbidden";
  }

  if (status === 404 || normalizedCode.includes("NOT_FOUND")) {
    return "not_found";
  }

  if (status === 409 || normalizedCode.includes("CONFLICT")) {
    return "conflict";
  }

  if (status === 429 || normalizedCode.includes("RATE")) {
    return "rate_limited";
  }

  if (status >= 500) {
    return "server";
  }

  return "unknown";
}

function getFallbackMessage(status: number, code: string): string {
  const normalizedCode = code.toUpperCase();

  if (normalizedCode === "INVALID_CREDENTIALS") {
    return "Invalid email or password.";
  }

  if (status === 400 || status === 422) {
    return "Please check the highlighted fields and try again.";
  }

  if (status === 401) {
    return "You need to sign in again.";
  }

  if (status === 403) {
    return "You do not have permission for this action.";
  }

  if (status === 404) {
    return "The requested item was not found.";
  }

  if (status === 409) {
    return "This item already exists or conflicts with another record.";
  }

  if (status === 429) {
    return "Too many requests. Please wait and try again.";
  }

  if (status >= 500) {
    return "Server error. Please try again in a moment.";
  }

  return "Request failed.";
}

export function createApiErrorFromResponse(status: number, payload: unknown): ApiError {
  const code = isApiErrorPayload(payload) ? payload.code : "UNKNOWN";
  const message = isApiErrorPayload(payload)
    ? payload.message
    : getFallbackMessage(status, code);

  return new ApiError(code, message, status, getErrorKind(status, code));
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function createNetworkError(error: unknown, method: string): ApiError {
  const isMutation = method !== "GET";
  const message = isAbortError(error)
    ? isMutation
      ? "Request timed out. Action may still be completed. Refresh before retrying."
      : "Request timed out. Please try again."
    : "Network connection problem. Check internet and try again.";

  return new ApiError("NETWORK_ERROR", message, 0, "network");
}

export function shouldCaptureApiError(error: ApiError): boolean {
  return error.kind === "server" || error.kind === "unknown";
}

export function getUserFriendlyError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}
