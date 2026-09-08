import { usePermissions } from "@/hooks/usePermissions";

export default function RoleGuard({ roles, fallback = null, children }) {
  const { hasRole, loading } = usePermissions();
  if (loading) return null;
  if (hasRole(roles)) return <>{children}</>;
  return <>{fallback}</>;
}
