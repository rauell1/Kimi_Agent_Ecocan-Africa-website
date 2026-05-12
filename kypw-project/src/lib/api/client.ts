const API_BASE = "/api";

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res;
}

export const api = {
  get: <T = unknown>(path: string) => apiFetch(path).then((r) => r.json()) as Promise<T>,
  post: <T = unknown>(path: string, data?: unknown) =>
    apiFetch(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }).then((r) => r.json()) as Promise<T>,
  put: <T = unknown>(path: string, data?: unknown) =>
    apiFetch(path, { method: "PUT", body: data ? JSON.stringify(data) : undefined }).then((r) => r.json()) as Promise<T>,
  delete: <T = unknown>(path: string, data?: unknown) =>
    apiFetch(path, { method: "DELETE", body: data ? JSON.stringify(data) : undefined }).then((r) => r.json()) as Promise<T>,
};
