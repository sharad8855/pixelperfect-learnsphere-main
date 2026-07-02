import { useAuthStore, type RoleType, computeRoleType, getPermissionCodes } from "@/lib/auth-store";

export function useRole() {
  const roleName = useAuthStore((s) => s.roleName);
  const permissions = useAuthStore((s) => s.permissions);
  const role = computeRoleType(roleName);
  const codes = getPermissionCodes(permissions);

  return {
    role,
    roleName,
    isStudent: role === "student",
    isTeacher: role === "teacher",
    isAdmin: role === "admin",
    isStaff: role === "teacher" || role === "admin",
    permissions: codes,
    hasPermission: (code: string) => codes.includes(code),
    hasRole: (...roles: RoleType[]) => roles.includes(role),
  };
}
