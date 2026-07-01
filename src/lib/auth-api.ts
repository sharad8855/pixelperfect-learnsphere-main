import { erp } from "./api-client";
import type { AuthClient, AuthUser, Permission } from "./auth-store";

export interface LoginResponse {
  success?: boolean;
  token?: string;
  access_token?: string;
  user?: AuthUser & { user_id?: string };
  [k: string]: unknown;
}

export const authApi = {
  loginPassword: (payload: {
    phone?: string;
    country_code?: string;
    email?: string;
    password: string;
  }) => erp.post<LoginResponse>("/auth/api/auth/login", payload, { auth: false }),

  requestOtp: (payload: { phone: string; country_code: string }) =>
    erp.post<{ success: boolean }>("/auth/api/auth/request-otp", payload, {
      auth: false,
    }),

  verifyOtp: (payload: { phone: string; country_code: string; otp: string }) =>
    erp.post<LoginResponse>("/auth/api/auth/verify-otp", payload, {
      auth: false,
    }),

  getClients: (params: { page?: number; limit?: number; search?: string } = {}) => {
    const { page = 1, limit = 20, search } = params;
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(limit));
    if (search) qs.set("k", search);
    return erp.get<{
      success: boolean;
      clients: AuthClient[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    }>(`/auth/api/clients?${qs.toString()}`);
  },

  getUser: (clientId: string, userId: string) =>
    erp.get<{ success: boolean; user: AuthUser & { user_mappings?: Array<{ role_id: string; role: { id: string; name: string } }> } }>(
      `/auth/api/users/client/${clientId}/user/${userId}`,
    ),

  getPermissions: (clientId: string, roleId: string) =>
    erp.get<{ success: boolean; permissions: Permission[] }>(
      `/auth/api/permissions/client/${clientId}/role/${roleId}`,
    ),
};
