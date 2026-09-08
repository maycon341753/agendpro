import { usePermissions } from "@/hooks/usePermissions";

export default function Can({ permission, fallback = null, children }) {
  const { can, loading } = usePermissions();
  if (loading) return null;
  if (can(permission)) return <>{children}</>;
  return <>{fallback}</>;
}
