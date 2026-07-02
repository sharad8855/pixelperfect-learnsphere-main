import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLE_PERMISSIONS } from "./can";

export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  designation?: string;
}

export interface AuthClient {
  id: string;
  name: string;
  subdomain?: string;
}

export interface Permission {
  module?: { name: string };
  permission?: { code: string; name: string };
  actions?: string[];
}

export type RoleType = "student" | "teacher" | "admin";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  client: AuthClient | null;
  clients: AuthClient[];
  roleId: string | null;
  roleName: string | null;
  permissions: Permission[];
  setSession: (p: { token: string; user: AuthUser }) => void;
  setClients: (c: AuthClient[]) => void;
  setClient: (c: AuthClient) => void;
  setRoleAndPermissions: (roleId: string, roleName: string | null, perms: Permission[]) => void;
  logout: () => void;
  getRole: () => RoleType;
  hasPermission: (code: string) => boolean;
  hasRole: (...roles: RoleType[]) => boolean;
}

export function computeRoleType(roleName: string | null): RoleType {
  if (!roleName) return "student";
  const parsed = roleName.toLowerCase();
  if (parsed === "admin" || parsed === "superadmin" || parsed === "super admin") return "admin";
  if (parsed === "tutor" || parsed === "teacher" || parsed === "instructor") return "teacher";
  return "student";
}

export function getPermissionCodes(permissions: Permission[]): string[] {
  return permissions.map((p) => p.permission?.code).filter((c): c is string => !!c);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      client: null,
      clients: [],
      roleId: null,
      roleName: null,
      permissions: [],
      setSession: ({ token, user }) => set({ token, user }),
      setClients: (clients) => set({ clients }),
      setClient: (client) => set({ client }),
      setRoleAndPermissions: (roleId, roleName, permissions) =>
        set({ roleId, roleName, permissions }),
      logout: () =>
        set({
          token: null,
          user: null,
          client: null,
          clients: [],
          roleId: null,
          roleName: null,
          permissions: [],
        }),
      getRole: () => computeRoleType(get().roleName),
      hasPermission: (code: string) => {
        const currentRole = computeRoleType(get().roleName);
        const staticPerms = ROLE_PERMISSIONS[currentRole] || [];
        if (staticPerms.includes(code as any)) {
          return true;
        }
        const codes = getPermissionCodes(get().permissions);
        return codes.includes(code);
      },
      hasRole: (...roles: RoleType[]) => {
        const current = computeRoleType(get().roleName);
        return roles.includes(current);
      },
    }),
    { name: "baapedu-auth" },
  ),
);
