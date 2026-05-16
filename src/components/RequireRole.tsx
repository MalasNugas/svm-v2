import { Navigate } from "react-router-dom";
import { useRole, type AppRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";

export function RequireRole({ allow, children }: { allow: AppRole[]; children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading } = useRole();
  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
