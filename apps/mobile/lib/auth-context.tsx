import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ApiError,
  apiFetch,
  setToken,
  removeToken,
  getToken,
  clearApiCache,
  warmupBackend,
} from "./api";
import { queryKeys } from "./query-keys";
import { queryClient } from "./query-client";
import { captureTelemetryException, setTelemetryUser } from "./telemetry";

type User = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string, type: "id_token" | "access_token") => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>(null as unknown as AuthState);
const USER_SNAPSHOT_KEY = "studyhub_user_snapshot_v1";
const AUTH_ME_TIMEOUT_MS = 1000 * 20;

function isUserSnapshot(value: unknown): value is User {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    (candidate.role === "user" || candidate.role === "admin")
  );
}

async function getUserSnapshot(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_SNAPSHOT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isUserSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function setUserSnapshot(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(user));
}

async function clearUserSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(USER_SNAPSHOT_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [token, cachedUser] = await Promise.all([getToken(), getUserSnapshot()]);

      // Keep snapshot in memory as a fallback, but wait for server auth/me
      // before unlocking the protected UI to avoid stale role flicker.
      if (token && cachedUser && !cancelled) {
        setUser(cachedUser);
        setTelemetryUser(cachedUser);
      }

      if (!token) {
        // Pre-warm Neon while the user is on the auth screen so the first
        // login/register mutation is less likely to hit a cold start.
        warmupBackend();
        setTelemetryUser(null);
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }
      try {
        const data = await apiFetch<{ user: User }>("/api/auth/me", {
          timeoutMs: AUTH_ME_TIMEOUT_MS,
          cache: false,
        });
        if (cancelled) {
          return;
        }
        setUser(data.user);
        queryClient.setQueryData(queryKeys.auth.me(), data.user);
        setTelemetryUser(data.user);
        await setUserSnapshot(data.user);
        // Pre-warm Neon DB so mutations don't hit a cold start after session restore.
        warmupBackend();
      } catch (error) {
        if (error instanceof ApiError && (error.kind === "auth" || error.kind === "forbidden")) {
          await clearApiCache();
          await removeToken();
          await clearUserSnapshot();
          queryClient.clear();
          setTelemetryUser(null);
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        // Keep existing session/snapshot on transient network/server issues.
        if (!(error instanceof ApiError) || error.kind === "server" || error.kind === "unknown") {
          captureTelemetryException(error, {
            area: "auth_bootstrap",
          });
        }
        warmupBackend();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await clearApiCache();
    queryClient.clear();
    const data = await apiFetch<{ token: string; user: User }>(
      "/api/auth/login",
      { method: "POST", body: { email, password }, auth: false }
    );
    await setToken(data.token);
    setUser(data.user);
    queryClient.setQueryData(queryKeys.auth.me(), data.user);
    setTelemetryUser(data.user);
    await setUserSnapshot(data.user);
    // Pre-warm Neon DB immediately after login so subsequent mutations are fast.
    warmupBackend();
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    await clearApiCache();
    queryClient.clear();
    const data = await apiFetch<{ token: string; user: User }>(
      "/api/auth/register",
      { method: "POST", body: { email, name, password }, auth: false }
    );
    await setToken(data.token);
    const hydratedUser: User = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      name: data.user.name ?? name.trim(),
    };
    setUser(hydratedUser);
    queryClient.setQueryData(queryKeys.auth.me(), hydratedUser);
    setTelemetryUser(hydratedUser);
    await setUserSnapshot(hydratedUser);
    // Keep post-auth mutations fast for freshly registered users too.
    warmupBackend();
  }, []);

  const loginWithGoogle = useCallback(async (token: string, type: "id_token" | "access_token") => {
    await clearApiCache();
    queryClient.clear();
    const data = await apiFetch<{ token: string; user: User }>(
      "/api/auth/google",
      { method: "POST", body: { token, type }, auth: false }
    );
    await setToken(data.token);
    setUser(data.user);
    queryClient.setQueryData(queryKeys.auth.me(), data.user);
    setTelemetryUser(data.user);
    await setUserSnapshot(data.user);
    warmupBackend();
  }, []);

  const logout = useCallback(async () => {
    await clearApiCache();
    await removeToken();
    await clearUserSnapshot();
    setTelemetryUser(null);
    setUser(null);
    queryClient.clear();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
