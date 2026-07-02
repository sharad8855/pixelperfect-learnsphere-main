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
  }) => erp.post<LoginResponse>("/api/auth/login", payload, { auth: false }),

  requestOtp: (payload: { phone: string; country_code: string }) =>
    erp.post<{ success: boolean }>("/api/auth/request-otp", payload, {
      auth: false,
    }),

  verifyOtp: (payload: { phone: string; country_code: string; otp: string }) =>
    erp.post<LoginResponse>("/api/auth/verify-otp", payload, {
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
    }>(`/api/clients?${qs.toString()}`);
  },

  getUser: (clientId: string, userId: string) =>
    erp.get<{ success: boolean; user: AuthUser & { user_mappings?: Array<{ role_id: string; role: { id: string; name: string } }> } }>(
      `/api/users/client/${clientId}/user/${userId}`,
    ),

  getPermissions: (clientId: string, roleId: string) =>
    erp.get<{ success: boolean; permissions: Permission[] }>(
      `/api/permissions/client/${clientId}/role/${roleId}`,
    ),

  createCourse: (
    clientId: string,
    payload: {
      course_name: string;
      description: string;
      duration: string;
      client_id: string;
      enabled: boolean;
    }
  ) =>
    erp.post<{
      success: boolean;
      message?: string;
      course?: {
        id: string;
        enabled: boolean;
        created_at: string;
        updated_at: string;
        course_name: string;
        description: string;
        department?: string | null;
        duration: string;
        client_id: string;
        course_image?: string | null;
        created_by: string;
        updated_by: string;
      };
    }>(`/api/courses/client/${clientId}`, payload),

  updateCourse: (
    clientId: string,
    courseId: string,
    payload: {
      course_name: string;
      description: string;
      duration: string;
      client_id: string;
      enabled: boolean;
    }
  ) =>
    erp.put<{
      success: boolean;
      message?: string;
      course?: {
        id: string;
        enabled: boolean;
        created_at: string;
        updated_at: string;
        course_name: string;
        description: string;
        department?: string | null;
        duration: string;
        client_id: string;
        course_image?: string | null;
        created_by: string;
        updated_by: string;
      };
    }>(`/api/courses/client/${clientId}/course/${courseId}`, payload),

  getCourses: (clientId: string) =>
    erp.get<{
      success: boolean;
      courses?: Array<{
        id: string;
        enabled: boolean;
        created_at: string;
        updated_at: string;
        course_name: string;
        description: string;
        department?: string | null;
        duration: string;
        client_id: string;
        course_image?: string | null;
        created_by: string;
        updated_by: string;
      }>;
      data?: {
        courses?: Array<{
          id: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
          course_name: string;
          description: string;
          department?: string | null;
          duration: string;
          client_id: string;
          course_image?: string | null;
          created_by: string;
          updated_by: string;
        }>;
      };
    }>(`/api/courses/client/${clientId}`),

  deleteCourse: (clientId: string, courseId: string) =>
    erp.del<{ success: boolean; message?: string }>(`/api/courses/client/${clientId}/course/${courseId}`),

  getCourse: (clientId: string, courseId: string) =>
    erp.get<{
      success: boolean;
      message?: string;
      course?: {
        id: string;
        enabled: boolean;
        created_at: string;
        updated_at: string;
        course_name: string;
        description: string;
        department?: string | null;
        duration: string;
        client_id: string;
        course_image?: string | null;
        created_by: string;
        updated_by: string;
      };
    }>(`/api/courses/client/${clientId}/course/${courseId}`),

  createClassroom: (
    clientId: string,
    payload: {
      title: string;
      class_name: string;
      detailed_info: string;
      class_teacher?: string | null;
      max_students?: string | number | null;
      is_enabled: boolean;
      client_id: string;
      substitute_teacher: string[];
    }
  ) =>
    erp.post<{
      success: boolean;
      message?: string;
      classroom?: {
        id: string;
        title: string;
        class_name: string;
        detailed_info?: string | null;
        class_teacher?: string | null;
        max_students?: number | null;
        is_enabled: boolean;
        client_id: string;
        substitute_teacher: string[];
      };
    }>(`/api/classes/client/${clientId}`, payload),

  getClassrooms: (clientId: string, page = 1, limit = 50) =>
    erp.get<{
      success: boolean;
      message?: string;
      classrooms?: Array<{
        id: string;
        title: string;
        class_name: string;
        detailed_info?: string | null;
        class_teacher?: string | null;
        max_students?: number | null;
        is_enabled: boolean;
        client_id: string;
        substitute_teacher: string[];
        users?: {
          id: string;
          first_name: string;
          last_name: string;
        } | null;
      }>;
    }>(`/api/classes/client/${clientId}?page=${page}&limit=${limit}`),

  createDivision: (
    clientId: string,
    payload: {
      class: string;
      division: string;
      detailed_info: string;
      course?: string | null;
      class_teacher?: string | null;
      max_student?: number | string | null;
      enabled: boolean;
      client_id: string;
    }
  ) =>
    erp.post<{
      success: boolean;
      message?: string;
      division?: any;
    }>(`/api/divisions/client/${clientId}/`, payload),

  getDivisions: (clientId: string) =>
    erp.get<{
      success: boolean;
      message?: string;
      divisions?: Array<{
        id: string;
        class: string;
        division: string;
        detailed_info?: string | null;
        course?: string | null;
        class_teacher?: string | null;
        max_student?: number | null;
        enabled: boolean;
        client_id: string;
        users?: {
          id: string;
          first_name: string;
          last_name: string;
        } | null;
        classes?: {
          id: string;
          title: string;
          class_name: string;
        } | null;
      }>;
    }>(`/api/divisions/client/${clientId}/`),
};
