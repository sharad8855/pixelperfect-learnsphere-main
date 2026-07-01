// API base URLs — override via VITE_* env vars in Lovable settings.
export const ERP_BASE =
  (import.meta as any).env?.VITE_ERP_BASE_URL ||
  "https://platform-development-dev.157.20.214.214.nip.io";

export const LMS_BASE =
  (import.meta as any).env?.VITE_LMS_BASE_URL ||
  "https://fe15-103-112-11-19.ngrok-free.app/lms/v1/api";

export const LMS_AI_BASE =
  (import.meta as any).env?.VITE_LMS_AI_BASE_URL || "";
