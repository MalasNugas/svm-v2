// API layer. Currently backed by Lovable Cloud (Supabase) for testing the methodology.
// To migrate to Express later, replace the implementations below to call your Express endpoints.
import { supabase } from "@/integrations/supabase/client";

export type Sentiment = "positive" | "neutral" | "negative";

export interface TweetRow {
  id: string;
  text: string;
  source: string;
  sentiment: Sentiment | null;
  actual_sentiment: Sentiment | null;
  predicted_sentiment: Sentiment | null;
  split: "train" | "test" | null;
  processed_text: string | null;
  confidence: number | null;
  created_at: string;
  labeled_at: string | null;
}


export const auth = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, displayName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: displayName ? { display_name: displayName } : undefined,
      },
    }),
  signOut: () => supabase.auth.signOut(),
};

export async function fetchDashboardStats() {
  const { count: total } = await supabase.from("tweets").select("*", { count: "exact", head: true });
  const { data } = await supabase.from("tweets").select("sentiment");
  const counts = { positive: 0, neutral: 0, negative: 0, unlabeled: 0 };
  (data ?? []).forEach((r: any) => {
    if (r.sentiment) counts[r.sentiment as Sentiment]++;
    else counts.unlabeled++;
  });
  return { total: total ?? 0, ...counts };
}

export interface ModelMetrics {
  accuracy: number;
  macroF1: number;
  samples: number;
  perClass: { label: Sentiment; precision: number; recall: number; f1: number; support: number }[];
  matrix: number[][]; // rows = actual, cols = predicted; order: positive, neutral, negative
  labels: Sentiment[];
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const { data } = await supabase
    .from("tweets")
    .select("sentiment,actual_sentiment,split")
    .eq("split", "test")
    .not("sentiment", "is", null)
    .not("actual_sentiment", "is", null);
  const rows = (data ?? []) as { sentiment: Sentiment; actual_sentiment: Sentiment }[];

  const labels: Sentiment[] = ["positive", "neutral", "negative"];
  const idx = (s: Sentiment) => labels.indexOf(s);
  const matrix: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  for (const r of rows) {
    const a = idx(r.actual_sentiment);
    const p = idx(r.sentiment);
    if (a >= 0 && p >= 0) matrix[a][p]++;
  }

  const samples = rows.length;
  let correct = 0;
  const perClass = labels.map((label, i) => {
    const tp = matrix[i][i];
    const fp = labels.reduce((acc, _, j) => acc + (j !== i ? matrix[j][i] : 0), 0);
    const fn = labels.reduce((acc, _, j) => acc + (j !== i ? matrix[i][j] : 0), 0);
    const support = labels.reduce((acc, _, j) => acc + matrix[i][j], 0);
    const precision = tp + fp ? tp / (tp + fp) : 0;
    const recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    correct += tp;
    return { label, precision, recall, f1, support };
  });
  const accuracy = samples ? correct / samples : 0;
  const macroF1 = perClass.reduce((a, c) => a + c.f1, 0) / (perClass.length || 1);
  return { accuracy, macroF1, samples, perClass, matrix, labels };
}


const KEYWORDS: Record<string, string> = {
  "Labuan Bajo": "labuan bajo",
  "Komodo Island": "komodo",
  "Kelimutu Lakes": "kelimutu",
  "Wae Rebo Village": "wae rebo",
  "Padar Island": "padar",
  "Ruteng": "ruteng",
};

export async function fetchTopDestinations() {
  const { data } = await supabase.from("tweets").select("text,sentiment");
  const rows = data ?? [];
  return Object.entries(KEYWORDS).map(([name, kw]) => {
    const matches = rows.filter((r: any) => r.text?.toLowerCase().includes(kw));
    const pos = matches.filter((r: any) => r.sentiment === "positive").length;
    const total = matches.length || 1;
    return { name, score: Math.round((pos / total) * 100), mentions: matches.length };
  }).sort((a, b) => b.mentions - a.mentions);
}

export async function fetchTweets(opts: { page?: number; pageSize?: number; sentiment?: Sentiment | "all"; q?: string; split?: "train" | "test" | "all" } = {}) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  let q = supabase.from("tweets").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (opts.sentiment && opts.sentiment !== "all") q = q.eq("sentiment", opts.sentiment);
  if (opts.split && opts.split !== "all") q = q.eq("split", opts.split);
  if (opts.q) q = q.ilike("text", `%${opts.q}%`);
  const { data, count } = await q.range(from, from + pageSize - 1);
  return { rows: (data ?? []) as TweetRow[], total: count ?? 0, page, pageSize };
}


export async function analyzeSentiment(text: string) {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { mode: "single", text },
  });
  if (error) throw error;
  return data as { sentiment: Sentiment; confidence: number };
}

export async function autoLabelBatch(limit = 25) {
  const { data, error } = await supabase.functions.invoke("analyze-sentiment", {
    body: { mode: "batch", limit },
  });
  if (error) throw error;
  return data as { processed: number; requested: number };
}
