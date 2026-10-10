import { useCallback, useEffect, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

type AuthUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  profileImage?: string | null;
  birthDate?: string | null;
  role?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: string | null;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const result = await response.json().catch(() => ({ user: null }));
      setUser(result.user ?? null);
      setError(response.ok ? null : new Error(result.error || "تعذر التحقق من الجلسة"));
      return result.user ?? null;
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error("تعذر الاتصال بخدمة الحساب");
      setError(nextError);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!redirectOnUnauthenticated || loading || user || typeof window === "undefined" || !redirectPath) return;
    if (window.location.pathname !== redirectPath) window.location.href = redirectPath;
  }, [redirectOnUnauthenticated, loading, redirectPath, user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    refresh,
    logout,
  };
}
