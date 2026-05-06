// API layer. Currently backed by Lovable Cloud (Supabase) for testing the methodology.
// To migrate to Express later, replace the implementations below to call your Express endpoints.
import { supabase } from "@/integrations/supabase/client";

export type Sentiment = "positive" | "neutral" | "negative";

export interface TweetRow {
  id: string;
  text: string;
  source: string;
  sentiment: Sentiment | null;
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

export async function fetchTweets(opts: { page?: number; pageSize?: number; sentiment?: Sentiment | "all"; q?: string } = {}) {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  let q = supabase.from("tweets").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (opts.sentiment && opts.sentiment !== "all") q = q.eq("sentiment", opts.sentiment);
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
