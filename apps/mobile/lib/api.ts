import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

const TOKEN_KEY = "studyhub_token";
const API_CACHE_PREFIX = "studyhub_api_cache_v1";
const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 10;
const DEFAULT_GET_REQUEST_TIMEOUT_MS = 1000 * 6;
const DEFAULT_MUTATION_REQUEST_TIMEOUT_MS = 1000 * 25;
const CACHE_INDEX_LIMIT = 200;

function getDevHostFromExpo(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    return null;
  }
  const host = hostUri.split(":")[0];
  return host || null;
}

function getDefaultApiBase(): string {
  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const devHost = getDevHostFromExpo();
  if (devHost) {
    return `http://${devHost}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiBase();

// --- Token management ---

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// --- API helpers ---

type FetchOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  cache?: boolean | { ttlMs?: number; forceRefresh?: boolean };
  timeoutMs?: number;
};

export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    cache,
    timeoutMs,
  } = opts;
  const normalizedMethod = method.toUpperCase();
  const resolvedTimeoutMs =
    timeoutMs ??
    (normalizedMethod === "GET"
      ? DEFAULT_GET_REQUEST_TIMEOUT_MS
      : DEFAULT_MUTATION_REQUEST_TIMEOUT_MS);
  const shouldUseCache = normalizedMethod === "GET" && cache !== false;
  const forceRefresh = typeof cache === "object" ? cache.forceRefresh === true : false;
  const cacheTtl = typeof cache === "object" && typeof cache.ttlMs === "number"
    ? Math.max(cache.ttlMs, 0)
    : DEFAULT_CACHE_TTL_MS;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let token: string | null = null;
  if (auth) {
    token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const cacheScope = await getCacheScope(token);
  const cacheKey = shouldUseCache ? await getCacheKey(cacheScope, path) : null;
  const cached = cacheKey ? await readCache(cacheKey) : null;
  const hasFreshCache = isCacheFresh(cached);

  if (shouldUseCache && !forceRefresh && hasFreshCache) {
    return cached.data as T;
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        method: normalizedMethod,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      },
      resolvedTimeoutMs
    );
  } catch (error) {
    if (cached) {
      return cached.data as T;
    }
    throw createNetworkError(error, normalizedMethod);
  }

  const text = await res.text();
  const data = text ? tryParseJson(text) : null;

  if (!res.ok) {
    if (cached && res.status >= 500) {
      return cached.data as T;
    }
    throw createApiErrorFromResponse(res.status, data);
  }

  if (shouldUseCache && cacheKey) {
    await writeCache(cacheScope, cacheKey, data, cacheTtl);
  } else if (normalizedMethod !== "GET" && auth) {
    await clearCacheScope(cacheScope);
  }

  return data as T;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isApiErrorPayload(
  value: unknown
): value is { code: string; message: string } {
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

type ApiErrorKind =
  | "validation"
  | "auth"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "server"
  | "network"
  | "unknown";

type CacheEntry = {
  data: unknown;
  expiresAt: number;
  createdAt: number;
};

function getErrorKind(status: number, code: string): ApiErrorKind {
  const normalizedCode = code.toUpperCase();

  if (normalizedCode === "NETWORK_ERROR") {
    return "network";
  }

  if (status === 400 || status === 422) {
    return "validation";
  }

  if (status === 401 || normalizedCode.includes("UNAUTHORIZED") || normalizedCode.includes("AUTH")) {
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

function createApiErrorFromResponse(status: number, payload: unknown): ApiError {
  const code = isApiErrorPayload(payload) ? payload.code : "UNKNOWN";
  const message = isApiErrorPayload(payload)
    ? payload.message
    : getFallbackMessage(status, code);

  return new ApiError(code, message, status, getErrorKind(status, code));
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  if (timeoutMs <= 0) {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function createNetworkError(error: unknown, method: string): ApiError {
  const isMutation = method !== "GET";
  const message = isAbortError(error)
    ? isMutation
      ? "Request timed out. Action may still be completed. Refresh before retrying."
      : "Request timed out. Please try again."
    : "Network connection problem. Check internet and try again.";

  return new ApiError(
    "NETWORK_ERROR",
    message,
    0,
    "network"
  );
}

export function getUserFriendlyError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  return fallback;
}

function isCacheFresh(cache: CacheEntry | null): cache is CacheEntry {
  return Boolean(cache && cache.expiresAt > Date.now());
}

async function getCacheScope(token: string | null): Promise<string> {
  if (!token) {
    return "public";
  }
  // Simple scope based on token suffix
  return `token-${token.slice(-8)}`;
}

async function getCacheKey(scope: string, path: string): Promise<string> {
  // Simple path-based key
  const safePath = path.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${API_CACHE_PREFIX}:${scope}:${safePath}`;
}

function getScopeIndexKey(scope: string): string {
  return `${API_CACHE_PREFIX}:index:${scope}`;
}

async function readCache(key: string): Promise<CacheEntry | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }

  const parsed = tryParseJson(raw);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const entry = parsed as Partial<CacheEntry>;
  if (
    typeof entry.expiresAt !== "number" ||
    typeof entry.createdAt !== "number" ||
    !("data" in entry)
  ) {
    return null;
  }

  return {
    data: entry.data,
    expiresAt: entry.expiresAt,
    createdAt: entry.createdAt,
  };
}

async function writeCache(
  scope: string,
  key: string,
  data: unknown,
  ttlMs: number
): Promise<void> {
  const now = Date.now();
  const payload: CacheEntry = {
    data,
    createdAt: now,
    expiresAt: now + ttlMs,
  };
  await AsyncStorage.setItem(key, JSON.stringify(payload));

  const indexKey = getScopeIndexKey(scope);
  const rawIndex = await AsyncStorage.getItem(indexKey);
  const parsed = rawIndex ? tryParseJson(rawIndex) : [];
  const currentIndex = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  const nextIndex = [key, ...currentIndex.filter((item) => item !== key)].slice(0, CACHE_INDEX_LIMIT);
  await AsyncStorage.setItem(indexKey, JSON.stringify(nextIndex));
}

async function clearCacheScope(scope: string): Promise<void> {
  const indexKey = getScopeIndexKey(scope);
  const rawIndex = await AsyncStorage.getItem(indexKey);
  const parsed = rawIndex ? tryParseJson(rawIndex) : [];
  const cacheKeys = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];

  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys);
  }

  await AsyncStorage.removeItem(indexKey);
}

export async function clearApiCache(): Promise<void> {
  const token = await getToken();
  const scope = await getCacheScope(token);
  await clearCacheScope(scope);
}
