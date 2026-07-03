import { erp } from "./api-client";
import type { AuthClient, AuthUser, Permission } from "./auth-store";

export interface LoginResponse {
  success?: boolean;
  token?: string;
  access_token?: string;
  user?: AuthUser & { user_id?: string };
  [k: string]: unknown;
}

export interface GetFormResponse {
  message?: string;
  form?: {
    id: string;
    client_id: string;
    title: string;
    description: string;
    is_published: boolean;
    show_progress_bar: boolean;
    shuffle_questions: boolean;
    deadline: string | null;
    max_submissions: number | null;
    shareable_url: string | null;
    type: string;
    created_at: string;
    sections: any[];
    questions: Array<{
      question_id: string;
      form_id: string;
      client_id: string;
      section_id: string | null;
      question_type_id: string;
      question_text: string;
      description: string | null;
      question_order: number;
      is_required: boolean;
      is_deleted: boolean;
      points: number;
      media_url: string | null;
      media_type: string | null;
      scale_min: number | null;
      scale_max: number | null;
      scale_min_label: string | null;
      scale_max_label: string | null;
      validation_type: string | null;
      validation_value: string | null;
      validation_message: string | null;
      grid_rows: any | null;
      grid_columns: any | null;
      created_at: string;
      updated_at: string;
      question_type: {
        id: string;
        type_name: string;
        description: string;
        is_deleted: boolean;
      };
      options: any[];
      answer_key: any | null;
    }>;
    settings?: {
      setting_id: string;
      form_id: string;
      confirmation_email: boolean;
      confirmation_message: string;
      edit_after_submit: boolean;
      show_summary: boolean;
      quiz_mode: boolean;
      release_score_immediately: boolean;
      show_correct_answers: boolean;
      respondent_can_view_answers: boolean;
      require_sign_in: boolean;
      default_question_point: number;
      notify_on_new_response: boolean;
      allow_multiple_submissions: boolean;
      allow_copy_content: boolean;
      enable_timer: boolean;
      timer_duration: number | null;
      auto_submit_on_timeout: boolean;
      disable_tab_switch: boolean;
      effective_date: string | null;
      expiration_date: string | null;
      color_code: string | null;
      font: string | null;
      response_message: string | null;
      response_url: string | null;
      action: string | null;
      action_value: string | null;
      background_color: string | null;
      webhook_url: string | null;
      webhook_event: string | null;
    };
    total_points: number;
  };
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
      form_id?: string | null;
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
        form_id?: string | null;
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
        form_id?: string | null;
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
      form_id?: string | null;
    }
  ) =>
    erp.post<{
      success: boolean;
      message?: string;
      division?: any;
    }>(`/api/divisions/client/${clientId}/`, payload),

  getDivisions: (clientId: string, page = 1, limit = 100) =>
    erp.get<{
      success?: boolean;
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
        form_id?: string | null;
        user?: {
          id: string;
          first_name: string;
          last_name: string;
        } | null;
        classes?: {
          id: string;
          class_name: string;
        } | null;
      }>;
    }>(`/api/divisions/client/${clientId}/division?page=${page}&limit=${limit}`),

  createSubject: (
    clientId: string,
    payload: {
      name: string;
      class_id: string;
      course?: string | null;
      book?: string | null;
      division?: string | null;
      teacher?: string | null;
      client_id: string;
      enabled: boolean;
      is_compulsory: boolean;
      description: string;
      type: string;
      form_id?: string | null;
    }
  ) =>
    erp.post<{
      success: boolean;
      message?: string;
      subject?: any;
    }>(`/api/subjects/client/${clientId}`, payload),

  getSubjects: (clientId: string, page = 1, limit = 100) =>
    erp.get<{
      success?: boolean;
      message?: string;
      subjects?: Array<{
        id: string;
        name: string;
        class_id: string;
        division?: string | null;
        teacher?: string | null;
        enabled: boolean;
        is_compulsory: boolean;
        description?: string | null;
        form_id?: string | null;
        classes?: {
          title: string;
          class_name: string;
        } | null;
        divisions?: {
          division: string;
        } | null;
        user?: {
          first_name: string;
          last_name: string;
        } | null;
      }>;
      totalSubjects?: number;
      totalPages?: number;
      currentPage?: number;
    }>(`/api/subjects/client/${clientId}?page=${page}&limit=${limit}`),

  createForm: (
    clientId: string,
    payload: {
      title: string;
      description: string;
      client_id: string;
      questions: Array<{
        question_type_id: string;
        question_id: string;
        question_text: string;
        is_required: boolean;
        question_order: number;
      }>;
    }
  ) =>
    erp.post<{
      success?: boolean;
      message?: string;
      form?: {
        message: string;
        form_id: string;
      };
    }>(`/api/form/client/${clientId}/`, payload),

  getForm: (clientId: string, formId: string) =>
    erp.get<GetFormResponse>(`/api/form/client/${clientId}/form/${formId}`),

  getExams: (clientId: string) =>
    erp.get<{
      success?: boolean;
      message?: string;
      data?: any[];
    }>(`/api/exams/client/${clientId}`),

  createExam: (clientId: string, payload: any) =>
    erp.post<{
      success?: boolean;
      message?: string;
      data?: {
        exam_id: string;
        exam_detail_id: string;
        total_students: number;
      };
    }>(`/api/exams/client/${clientId}`, payload),

  updateExam: (clientId: string, examId: string, payload: any) =>
    erp.put<{
      success?: boolean;
      message?: string;
    }>(`/api/exams/client/${clientId}/exam/${examId}`, payload),

  deleteExam: (clientId: string, examId: string) =>
    erp.delete<{
      success?: boolean;
      message?: string;
    }>(`/api/exams/client/${clientId}/exam/${examId}`),
};
