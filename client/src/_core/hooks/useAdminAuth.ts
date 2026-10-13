import { useEffect, useState } from "react";

type AdminUser = { id: number; name: string; email: string; role: "admin" };
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = () => fetch("/api/trpc/admin-session", { credentials: "include" }).then(response => response.ok ? response.json() : null).then(data => setUser(data?.user || null)).catch(() => setUser(null)).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);
  const logout = async () => { await fetch("/api/trpc/admin-logout", { method: "POST", credentials: "include" }); setUser(null); window.location.replace("/admin/login"); };
  return { user, loading, refresh, logout };
}
