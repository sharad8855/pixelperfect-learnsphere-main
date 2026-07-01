import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    { name: "baapedu-auth" },
  ),
);
