import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "researcher";

export function getRoleHome(role: AppRole | null | undefined) {
  return role === "admin" ? "/dataset" : "/dashboard";
}

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    supabase.from("user_roles").select("role").eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error("Failed to load user role", error);
          setRole("researcher");
          setLoading(false);
          return;
        }

        const roles = (data ?? []).map(r => r.role as AppRole);
        setRole(roles.includes("admin") ? "admin" : (roles[0] ?? "researcher"));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id, authLoading]);

  return { role, isAdmin: role === "admin", loading: loading || authLoading };
}
