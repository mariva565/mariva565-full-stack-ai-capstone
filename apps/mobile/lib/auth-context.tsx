import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { apiFetch, setToken, removeToken, getToken, clearApiCache } from "./api";
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
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch<{ user: User }>("/api/auth/me");
        setUser(data.user);
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
