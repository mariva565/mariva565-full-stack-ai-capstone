import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  API_CACHE_PREFIX,
  CACHE_INDEX_LIMIT,
} from "./api.constants";
import { tryParseJson } from "./api.utils";

export type CacheEntry = {
  data: unknown;
  expiresAt: number;
  createdAt: number;
};

export function isCacheFresh(cache: CacheEntry | null): cache is CacheEntry {
  return Boolean(cache && cache.expiresAt > Date.now());
}

export function getCacheScope(token: string | null): string {
  if (!token) {
    return "public";
  }
  // Simple scope based on token suffix.
  return `token-${token.slice(-8)}`;
}

export function getCacheKey(scope: string, path: string): string {
  // Simple path-based key.
  const safePath = path.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return `${API_CACHE_PREFIX}:${scope}:${safePath}`;
}

function getScopeIndexKey(scope: string): string {
  return `${API_CACHE_PREFIX}:index:${scope}`;
}

function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export async function readCache(key: string): Promise<CacheEntry | null> {
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

export async function writeCache(
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
  const currentIndex = parseStringList(rawIndex ? tryParseJson(rawIndex) : []);
  const nextIndex = [key, ...currentIndex.filter((item) => item !== key)].slice(
    0,
    CACHE_INDEX_LIMIT
  );
  await AsyncStorage.setItem(indexKey, JSON.stringify(nextIndex));
}

export async function clearCacheScope(scope: string): Promise<void> {
  const indexKey = getScopeIndexKey(scope);
  const rawIndex = await AsyncStorage.getItem(indexKey);
  const cacheKeys = parseStringList(rawIndex ? tryParseJson(rawIndex) : []);

  if (cacheKeys.length > 0) {
    await AsyncStorage.multiRemove(cacheKeys);
  }

  await AsyncStorage.removeItem(indexKey);
}
