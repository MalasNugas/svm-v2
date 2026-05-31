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

// ---------- Train/Test split & model training ----------

import { train as trainNB, seededShuffle, type Label } from "./ml";

export interface SplitSummary {
  total: number;
  train: number;
  test: number;
  perClass: { label: Sentiment; train: number; test: number }[];
}

export interface TrainingStatus {
  total: number;
  train: number;
  test: number;
  predicted: number;
  perClass: { label: Sentiment; train: number; test: number; predicted: number }[];
}

export async function fetchTrainingStatus(): Promise<TrainingStatus> {
  const all: any[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("tweets")
      .select("actual_sentiment,split,predicted_sentiment")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  const labels: Sentiment[] = ["positive", "neutral", "negative"];
  const perClass = labels.map((l) => {
    const cls = all.filter((r) => r.actual_sentiment === l);
    return {
      label: l,
      train: cls.filter((r) => r.split === "train").length,
      test: cls.filter((r) => r.split === "test").length,
      predicted: cls.filter((r) => r.split === "test" && r.predicted_sentiment).length,
    };
  });
  return {
    total: all.length,
    train: all.filter((r) => r.split === "train").length,
    test: all.filter((r) => r.split === "test").length,
    predicted: all.filter((r) => r.split === "test" && r.predicted_sentiment).length,
    perClass,
  };
}

const SPLIT_SEED = 42;
const TEST_RATIO = 0.2;

async function fetchAllForTraining() {
  const all: { id: string; processed_text: string | null; text: string; actual_sentiment: Sentiment | null; split: string | null }[] = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("tweets")
      .select("id,processed_text,text,actual_sentiment,split")
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as any[];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export async function runStratifiedSplit(): Promise<SplitSummary> {
  const all = await fetchAllForTraining();
  const labels: Sentiment[] = ["positive", "neutral", "negative"];
  const trainIds: string[] = [];
  const testIds: string[] = [];
  const perClass: SplitSummary["perClass"] = [];

  for (const l of labels) {
    const cls = all.filter((r) => r.actual_sentiment === l);
    const shuffled = seededShuffle(cls, SPLIT_SEED + labels.indexOf(l));
    const testCount = Math.round(shuffled.length * TEST_RATIO);
    const test = shuffled.slice(0, testCount);
    const train = shuffled.slice(testCount);
    trainIds.push(...train.map((r) => r.id));
    testIds.push(...test.map((r) => r.id));
    perClass.push({ label: l, train: train.length, test: test.length });
  }

  const chunkSize = 400;
  const updateIn = async (ids: string[], patch: any) => {
    for (let i = 0; i < ids.length; i += chunkSize) {
      const slice = ids.slice(i, i + chunkSize);
      const { error } = await supabase.from("tweets").update(patch).in("id", slice);
      if (error) throw error;
    }
  };
  await updateIn(trainIds, { split: "train", sentiment: null, predicted_sentiment: null, confidence: null });
  await updateIn(testIds, { split: "test", sentiment: null, predicted_sentiment: null, confidence: null });


  return { total: all.length, train: trainIds.length, test: testIds.length, perClass };
}

export async function runTraining(): Promise<{ trained: number; predicted: number }> {
  const all = await fetchAllForTraining();
  const trainRows = all
    .filter((r) => r.split === "train" && r.actual_sentiment)
    .map((r) => ({ text: r.processed_text || r.text, label: r.actual_sentiment as Label }));
  const testRows = all.filter((r) => r.split === "test");
  if (!trainRows.length) throw new Error("Tidak ada data train. Jalankan split dulu.");
  if (!testRows.length) throw new Error("Tidak ada data test. Jalankan split dulu.");

  const model = trainNB(trainRows);

  // Group predictions by (label, rounded confidence) so we can batch updates with .in()
  const groups = new Map<string, { patch: any; ids: string[] }>();
  const now = new Date().toISOString();
  for (const r of testRows) {
    const p = model.predict(r.processed_text || r.text);
    const conf = Number(p.confidence.toFixed(3));
    const key = `${p.label}|${conf}`;
    const patch = { sentiment: p.label, predicted_sentiment: p.label, confidence: conf, labeled_at: now };
    const g = groups.get(key);
    if (g) g.ids.push(r.id);
    else groups.set(key, { patch, ids: [r.id] });
  }
  const chunkSize = 400;
  for (const g of groups.values()) {
    for (let i = 0; i < g.ids.length; i += chunkSize) {
      const ids = g.ids.slice(i, i + chunkSize);
      const { error } = await supabase.from("tweets").update(g.patch).in("id", ids);
      if (error) throw error;
    }
  }
  return { trained: trainRows.length, predicted: testRows.length };
}

export async function resetSplit() {
  const { error } = await supabase
    .from("tweets")
    .update({ split: null, sentiment: null, predicted_sentiment: null, confidence: null, labeled_at: null })
    .not("id", "is", null);
  if (error) throw error;
}
