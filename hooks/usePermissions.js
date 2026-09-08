import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission, ROLES } from "@/lib/permissions";

export function usePermissions() {
  const { user, profile, company, loading } = useAuth();

  const activeRole = useMemo(() => {
    if (company?.role) return company.role;
    if (profile?.role) return profile.role;
    if (user?.app_metadata?.role) return user.app_metadata.role;
    return null;
  }, [company, profile, user]);

  function can(permission) {
    if (!activeRole) return false;
    return hasPermission(activeRole, permission);
  }

  function hasRole(...roles) {
    if (!activeRole) return false;
    return roles.flat().includes(activeRole);
  }

  function isSuperAdmin() {
    return activeRole === ROLES.SUPER_ADMIN;
  }

  return {
    activeRole,
    can,
    hasRole,
    isSuperAdmin,
    loading,
    isAuthenticated: !!user,
  };
}

export default usePermissions;
