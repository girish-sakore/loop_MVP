export type ApiError = {
  error?: string;
  code?: string;
  existingTitle?: string;
  errors?: { path: string; message: string }[];
  issues?: { path: (string | number)[]; message: string }[];
  totalErrors?: number;
};

export async function api<T = Record<string, unknown>>(url: string, method: string, body?: unknown) {
  const isForm = body instanceof FormData;
  const res = await fetch(url, {
    method,
    headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & ApiError;
  return { ok: res.ok, status: res.status, data };
}