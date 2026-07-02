import { ERP_BASE, LMS_BASE } from "./api-config";
import { useAuthStore } from "./auth-store";

type FetchOpts = RequestInit & { auth?: boolean; json?: unknown };

async function request<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  const { auth = true, json, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };
  if (json !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  // Only add the ngrok interstitial-bypass header for ngrok hosts.
  // Sending it to non-ngrok origins (e.g. the ERP nip.io host) causes their
  // CORS preflight to reject the actual request because it isn't in
  // Access-Control-Allow-Headers — the POST never fires.
  if (/ngrok(-free)?\.app/i.test(url)) {
    finalHeaders["ngrok-skip-browser-warning"] = "true";
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const msg =
      (payload && typeof payload === "object" && (payload as any).message) ||
      (typeof payload === "string" && payload) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return payload as T;
}

export const erp = {
  get: <T>(path: string, opts?: FetchOpts) =>
    request<T>(`${ERP_BASE}${path}`, { method: "GET", ...opts }),
  post: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(`${ERP_BASE}${path}`, { method: "POST", json: body, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(`${ERP_BASE}${path}`, { method: "PUT", json: body, ...opts }),
  del: <T>(path: string, opts?: FetchOpts) =>
    request<T>(`${ERP_BASE}${path}`, { method: "DELETE", ...opts }),
};

export const lms = {
  get: <T>(path: string, opts?: FetchOpts) =>
    request<T>(`${LMS_BASE}${path}`, { method: "GET", ...opts }),
  post: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(`${LMS_BASE}${path}`, { method: "POST", json: body, ...opts }),
  put: <T>(path: string, body?: unknown, opts?: FetchOpts) =>
    request<T>(`${LMS_BASE}${path}`, { method: "PUT", json: body, ...opts }),
  del: <T>(path: string, opts?: FetchOpts) =>
    request<T>(`${LMS_BASE}${path}`, { method: "DELETE", ...opts }),
};
