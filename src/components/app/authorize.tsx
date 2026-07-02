import { type ReactNode } from "react";
import { useAuthStore, type RoleType } from "@/lib/auth-store";

type AuthorizeProps = {
  permission?: string;
  role?: RoleType | RoleType[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function Authorize({ permission, role, fallback = null, children }: AuthorizeProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasRole = useAuthStore((s) => s.hasRole);

  let allowed = true;

  if (permission) {
    allowed = hasPermission(permission);
  }

  if (role && allowed) {
    const roles = Array.isArray(role) ? role : [role];
    allowed = hasRole(...roles);
  }

  if (!allowed) return fallback;

  return <>{children}</>;
}
