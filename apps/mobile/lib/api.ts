import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  clearCacheScope,
  getCacheKey,
  getCacheScope,
  isCacheFresh,
  readCache,
  writeCache,
  type CacheEntry,
} from "./api.cache";
import {
  API_BASE,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_GET_REQUEST_TIMEOUT_MS,
  DEFAULT_MUTATION_REQUEST_TIMEOUT_MS,
  TOKEN_KEY,
} from "./api.constants";
import {
  ApiError,
  createApiErrorFromResponse,
  createNetworkError,
  shouldCaptureApiError,
} from "./api.errors";
import { tryParseJson } from "./api.utils";
import { captureTelemetryException } from "./telemetry";

export { ApiError, getUserFriendlyError } from "./api.errors";

type FetchOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  cache?: boolean | { ttlMs?: number; forceRefresh?: boolean };
  timeoutMs?: number;
};

type CachePlan = {
  scope: string;
  shouldUseCache: boolean;
  forceRefresh: boolean;
  cacheTtl: number;
  cacheKey: string | null;
  cached: CacheEntry | null;
};

function resolveTimeoutMs(method: string, timeoutMs: number | undefined): number {
  if (typeof timeoutMs === "number") {
    return timeoutMs;
  }

  if (method === "GET") {
    return DEFAULT_GET_REQUEST_TIMEOUT_MS;
  }

  return DEFAULT_MUTATION_REQUEST_TIMEOUT_MS;
}

function resolveCacheBehavior(method: string, cache: FetchOptions["cache"]) {
  const shouldUseCache = method === "GET" && cache !== false;
  const forceRefresh = typeof cache === "object" ? cache.forceRefresh === true : false;
  const cacheTtl =
    typeof cache === "object" && typeof cache.ttlMs === "number"
      ? Math.max(cache.ttlMs, 0)
      : DEFAULT_CACHE_TTL_MS;

  return { shouldUseCache, forceRefresh, cacheTtl };
}

async function buildAuthHeaders(auth: boolean): Promise<{
  headers: Record<string, string>;
  token: string | null;
}> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!auth) {
    return { headers, token: null };
  }

  const token = await getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { headers, token };
}

async function buildCachePlan(
  path: string,
  method: string,
  cache: FetchOptions["cache"],
  token: string | null
): Promise<CachePlan> {
  const scope = getCacheScope(token);
  const behavior = resolveCacheBehavior(method, cache);

  if (!behavior.shouldUseCache) {
    return {
      ...behavior,
      scope,
      cacheKey: null,
      cached: null,
    };
  }

  const cacheKey = getCacheKey(scope, path);
  const cached = await readCache(cacheKey);

  return {
    ...behavior,
    scope,
    cacheKey,
    cached,
  };
}

function getFreshCachedData<T>(cachePlan: CachePlan): T | null {
  if (!cachePlan.shouldUseCache || cachePlan.forceRefresh || !isCacheFresh(cachePlan.cached)) {
    return null;
  }

  return cachePlan.cached.data as T;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  return text ? tryParseJson(text) : null;
}

function reportApiFailure(
  error: ApiError,
  method: string,
  path: string,
  status: number
): void {
  if (!shouldCaptureApiError(error)) {
    return;
  }

  captureTelemetryException(error, {
    area: "api_response",
    details: {
      code: error.code,
      method,
      path,
      status,
    },
  });
}

async function reconcileCacheAfterSuccess(
  cachePlan: CachePlan,
  method: string,
  auth: boolean,
  payload: unknown
): Promise<void> {
  if (cachePlan.shouldUseCache && cachePlan.cacheKey) {
    await writeCache(cachePlan.scope, cachePlan.cacheKey, payload, cachePlan.cacheTtl);
    return;
  }

  if (method !== "GET" && auth) {
    await clearCacheScope(cachePlan.scope);
  }
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

export async function apiFetch<T>(
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true, cache, timeoutMs } = opts;
  const normalizedMethod = method.toUpperCase();
  const resolvedTimeoutMs = resolveTimeoutMs(normalizedMethod, timeoutMs);
  const { headers, token } = await buildAuthHeaders(auth);
  const cachePlan = await buildCachePlan(path, normalizedMethod, cache, token);
  const cachedData = getFreshCachedData<T>(cachePlan);

  if (cachedData !== null) {
    return cachedData;
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_BASE}${path}`,
      {
        method: normalizedMethod,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      },
      resolvedTimeoutMs
    );
  } catch (error) {
    if (cachePlan.cached) {
      return cachePlan.cached.data as T;
    }
    throw createNetworkError(error, normalizedMethod);
  }

  const payload = await readResponsePayload(response);
  if (!response.ok) {
    if (cachePlan.cached && response.status >= 500) {
      return cachePlan.cached.data as T;
    }

    const apiError = createApiErrorFromResponse(response.status, payload);
    reportApiFailure(apiError, normalizedMethod, path, response.status);
    throw apiError;
  }

  await reconcileCacheAfterSuccess(cachePlan, normalizedMethod, auth, payload);
  return payload as T;
}

export async function clearApiCache(): Promise<void> {
  const token = await getToken();
  const scope = getCacheScope(token);
  await clearCacheScope(scope);
}

// Fire-and-forget DB warmup. Hits /api/ping (no auth) to pre-warm the
// Neon serverless connection so subsequent mutations do not hit a cold start.
export function warmupBackend(): void {
  void apiFetch<{ ok: boolean }>("/api/ping", {
    auth: false,
    // Give the warmup probe extra time as it may survive a full cold start.
    timeoutMs: 1000 * 60,
  }).catch(() => {
    // Best-effort; ignore errors so this never blocks the auth flow.
  });
}
