import { getAccessToken } from "./tokens";
import type { ApiError } from "./errors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Django APPEND_SLASH requires trailing slashes on POST URLs. */
function withTrailingSlash(url: string): string {
  const qIndex = url.indexOf("?");
  const path = qIndex === -1 ? url : url.slice(0, qIndex);
  const query = qIndex === -1 ? "" : url.slice(qIndex);
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return `${normalized}${query}`;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isFormData = options.body instanceof FormData;
  const accessToken = getAccessToken();
  const requestUrl = withTrailingSlash(`${API_BASE}${url}`);

  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  if (!isFormData && options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method,
      headers,
      credentials: "include",
      body:
        options.body instanceof FormData
          ? options.body
          : options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
    });
  } catch {
    const err: ApiError = { status: 0, message: "خطای شبکه" };
    throw err;
  }

  if (!response.ok) {
    let errData: Record<string, unknown> = {};
    try {
      errData = (await response.json()) as Record<string, unknown>;
    } catch {
      // non-JSON error body
    }
    const err: ApiError = { status: response.status, data: errData };
    throw err;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  get: <T>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "POST", body }),

  patch: <T>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    apiRequest<T>(url, { ...options, method: "PATCH", body }),
};
