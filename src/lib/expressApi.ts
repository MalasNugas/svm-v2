// Wrapper untuk memanggil backend Express (SVM Python).
// Aktif hanya bila VITE_API_URL di-set; bila tidak, helper di-disable supaya UI fallback ke pipeline lama.
import { supabase } from "@/integrations/supabase/client";

export const EXPRESS_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
export const expressEnabled = Boolean(EXPRESS_BASE);

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  if (!expressEnabled) throw new Error("VITE_API_URL belum di-set — backend Express tidak aktif.");
  const res = await fetch(`${EXPRESS_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export const expressApi = {
  enabled: expressEnabled,
  health: () => call<{ ok: boolean }>("GET", "/health"),
  syncDataset: () => call<{ synced: number; total_in_sqlite: number }>("POST", "/dataset/sync"),
  train: () =>
    call<{
      accuracy: number;
      macro_f1: number;
      train_size: number;
      test_size: number;
      labels: string[];
      confusion: number[][];
      per_class: { label: string; precision: number; recall: number; f1: number; support: number }[];
      algo: string;
    }>("POST", "/train"),
  metrics: () =>
    call<
      | { trained: false }
      | {
          trained: true;
          created_at: string;
          algo: string;
          accuracy: number;
          macro_f1: number;
          train_size: number;
          test_size: number;
          confusion: number[][];
          per_class: { label: string; precision: number; recall: number; f1: number; support: number }[];
        }
    >("GET", "/metrics"),
  predict: (text: string) => call<{ sentiment: "positive" | "neutral" | "negative"; confidence: number }>("POST", "/predict", { text }),
};
