export const PERM = {
  COURSE_CREATE: "course-create",
  COURSE_EDIT: "course-edit",
  COURSE_DELETE: "course-delete",
  COURSE_VIEW: "course-view",
  COURSE_ASSIGN: "course-assign",

  TEST_CREATE: "test-create",
  TEST_EDIT: "test-edit",
  TEST_DELETE: "test-delete",
  TEST_VIEW: "test-view",
  TEST_ASSIGN: "test-assign",
  TEST_GRADE: "test-grade",

  ACTION_ITEM_CREATE: "action-item-create",
  ACTION_ITEM_EDIT: "action-item-edit",
  ACTION_ITEM_DELETE: "action-item-delete",
  ACTION_ITEM_VIEW: "action-item-view",
  ACTION_ITEM_ASSIGN: "action-item-assign",
  ACTION_ITEM_REVIEW: "action-item-review",

  USER_MANAGE: "user-manage",
  USER_VIEW: "user-view",

  DASHBOARD_VIEW: "dashboard-view",
  DASHBOARD_VIEW_TEACHER: "dashboard-view-teacher",
  DASHBOARD_VIEW_ADMIN: "dashboard-view-admin",

  RESUME_MANAGE: "resume-manage",
  RESUME_VIEW: "resume-view",
  SETTINGS_MANAGE: "settings-manage",
  PROFILE_MANAGE: "profile-manage",
} as const;

export type PermissionCode = (typeof PERM)[keyof typeof PERM];

export const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  admin: Object.values(PERM),
  teacher: [
    PERM.COURSE_CREATE,
    PERM.COURSE_EDIT,
    PERM.COURSE_VIEW,
    PERM.COURSE_ASSIGN,
    PERM.TEST_CREATE,
    PERM.TEST_EDIT,
    PERM.TEST_VIEW,
    PERM.TEST_ASSIGN,
    PERM.TEST_GRADE,
    PERM.ACTION_ITEM_CREATE,
    PERM.ACTION_ITEM_EDIT,
    PERM.ACTION_ITEM_VIEW,
    PERM.ACTION_ITEM_ASSIGN,
    PERM.ACTION_ITEM_REVIEW,
    PERM.USER_VIEW,
    PERM.DASHBOARD_VIEW,
    PERM.DASHBOARD_VIEW_TEACHER,
    PERM.RESUME_MANAGE,
    PERM.SETTINGS_MANAGE,
    PERM.PROFILE_MANAGE,
  ],
  student: [
    PERM.COURSE_VIEW,
    PERM.TEST_VIEW,
    PERM.ACTION_ITEM_VIEW,
    PERM.DASHBOARD_VIEW,
    PERM.RESUME_VIEW,
    PERM.RESUME_MANAGE,
    PERM.SETTINGS_MANAGE,
    PERM.PROFILE_MANAGE,
  ],
};
