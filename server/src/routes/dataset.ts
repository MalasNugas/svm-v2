import { Router } from "express";
import { db } from "../db.js";
import { requireAdmin, requireAuth, supabaseAdmin, type AuthedRequest } from "../auth.js";

export const datasetRouter = Router();

/** POST /dataset/sync — tarik semua tweets dari Supabase, upsert ke SQLite. */
datasetRouter.post("/sync", requireAuth, requireAdmin, async (_req: AuthedRequest, res) => {
  const all: any[] = [];
  const pageSize = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from("tweets")
      .select("id,text,processed_text,actual_sentiment,split,predicted_sentiment,confidence")
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) return res.status(500).json({ error: error.message });
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < pageSize) break;
    from += pageSize;
  }

  const upsert = db.prepare(`
    INSERT INTO tweets (id, text, processed_text, actual_sentiment, split, predicted_sentiment, confidence)
    VALUES (@id, @text, @processed_text, @actual_sentiment, @split, @predicted_sentiment, @confidence)
    ON CONFLICT(id) DO UPDATE SET
      text=excluded.text,
      processed_text=excluded.processed_text,
      actual_sentiment=excluded.actual_sentiment
  `);
  const tx = db.transaction((rows: any[]) => {
    for (const r of rows) upsert.run(r);
  });
  tx(all);

  const count = (db.prepare("SELECT COUNT(*) AS n FROM tweets").get() as any).n;
  res.json({ synced: all.length, total_in_sqlite: count });
});

datasetRouter.get("/stats", requireAuth, (_req, res) => {
  const total = (db.prepare("SELECT COUNT(*) AS n FROM tweets").get() as any).n;
  const byLabel = db
    .prepare("SELECT actual_sentiment AS label, COUNT(*) AS n FROM tweets GROUP BY actual_sentiment")
    .all();
  const splits = db
    .prepare("SELECT split, COUNT(*) AS n FROM tweets GROUP BY split")
    .all();
  res.json({ total, byLabel, splits });
});
