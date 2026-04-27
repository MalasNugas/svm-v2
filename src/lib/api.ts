// Lightweight API client for the Express backend.
// Configure VITE_API_URL in .env (e.g. http://localhost:3001/api).
const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

type Options = RequestInit & { json?: unknown };

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { json, headers, ...rest } = opts;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints may return empty
  const ct = res.headers.get("content-type") ?? "";
  return (ct.includes("application/json") ? await res.json() : (await res.text() as unknown)) as T;
}

// Endpoint stubs — implement these on your Express side.
export const endpoints = {
  login: (body: { email: string; password: string }) => api("/auth/login", { method: "POST", json: body }),
  register: (body: { email: string; password: string; name?: string }) => api("/auth/register", { method: "POST", json: body }),
  dashboardStats: () => api("/dashboard/stats"),
  sentimentTrends: (range: "yearly" | "monthly" = "yearly") => api(`/dashboard/trends?range=${range}`),
  topDestinations: () => api("/dashboard/top-destinations"),
  analyze: (body: { text?: string; file?: string }) => api("/analysis/svm", { method: "POST", json: body }),
  recentAnalyses: () => api("/analysis/recent"),
  dataset: (params: { page?: number; sentiment?: string; source?: string; q?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString();
    return api(`/dataset?${qs}`);
  },
  destinations: () => api("/destinations"),
};
