import Constants from "expo-constants";
import { Platform } from "react-native";

export const TOKEN_KEY = "studyhub_token";
export const API_CACHE_PREFIX = "studyhub_api_cache_v1";
export const DEFAULT_CACHE_TTL_MS = 1000 * 60 * 10;
export const DEFAULT_GET_REQUEST_TIMEOUT_MS = 1000 * 6;
// 45s covers Neon serverless cold-start (free tier can take 20-30s+ to wake).
export const DEFAULT_MUTATION_REQUEST_TIMEOUT_MS = 1000 * 45;
export const CACHE_INDEX_LIMIT = 200;

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

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiBase();
