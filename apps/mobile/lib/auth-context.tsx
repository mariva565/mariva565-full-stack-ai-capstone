import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiFetch, setToken, removeToken, getToken, clearApiCache, warmupBackend } from "./api";
import { queryClient } from "./query-client";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        // Pre-warm Neon while the user is on the auth screen so the first
        // login/register mutation is less likely to hit a cold start.
        warmupBackend();
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch<{ user: User }>("/api/auth/me");
        setUser(data.user);
        // Pre-warm Neon DB so mutations don't hit a cold start after session restore.
        warmupBackend();
      } catch {
        await clearApiCache();
        await removeToken();
        queryClient.clear();
      } finally {
        setIsLoading(false);
      }
    })();
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
    setUser(data.user);
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
    warmupBackend();
  }, []);

  const logout = useCallback(async () => {
    await clearApiCache();
    await removeToken();
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
