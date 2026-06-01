import { Router } from "express";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { db } from "../db.js";
import { requireAdmin, requireAuth, supabaseAdmin } from "../auth.js";

export const trainRouter = Router();

const PYTHON = process.env.PYTHON_BIN ?? "python3";
const TRAIN_SCRIPT = resolve(process.cwd(), "python/train.py");

function runPython(args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolvePromise) => {
    const child = spawn(PYTHON, args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("close", (code) => resolvePromise({ stdout, stderr, code: code ?? -1 }));
  });
}

/** POST /train — spawn python train.py, simpan metrik & sync prediksi balik ke Supabase. */
trainRouter.post("/", requireAuth, requireAdmin, async (_req, res) => {
  const total = (db.prepare("SELECT COUNT(*) AS n FROM tweets WHERE actual_sentiment IS NOT NULL").get() as any).n;
  if (!total) return res.status(400).json({ error: "Dataset kosong. Jalankan POST /dataset/sync dulu." });

  const { stdout, stderr, code } = await runPython([TRAIN_SCRIPT]);
  if (code !== 0) {
    console.error("[train.py stderr]", stderr);
    return res.status(500).json({ error: "training failed", detail: stderr.slice(-2000) });
  }

  let result: any;
  try {
    result = JSON.parse(stdout.trim().split("\n").pop()!);
  } catch (e: any) {
    return res.status(500).json({ error: "invalid python output", stdout: stdout.slice(-1000) });
  }

  db.prepare(
    `INSERT INTO training_runs (algo, accuracy, macro_f1, train_size, test_size, confusion_json, per_class_json)
     VALUES (?,?,?,?,?,?,?)`
  ).run(
    result.algo ?? "LinearSVC",
    result.accuracy,
    result.macro_f1,
    result.train_size,
    result.test_size,
    JSON.stringify(result.confusion),
    JSON.stringify(result.per_class),
  );

  // Sinkronkan balik split + predicted_sentiment ke Supabase agar Dashboard/Reports tetap akurat.
  try {
    const rows = db
      .prepare("SELECT id, split, predicted_sentiment, confidence FROM tweets WHERE split IS NOT NULL")
      .all() as any[];
    const groups = new Map<string, string[]>();
    for (const r of rows) {
      const key = `${r.split}|${r.predicted_sentiment ?? ""}|${r.confidence ?? ""}`;
      const g = groups.get(key);
      if (g) g.push(r.id);
      else groups.set(key, [r.id]);
    }
    const chunk = 400;
    for (const [key, ids] of groups) {
      const [split, pred, conf] = key.split("|");
      const patch: any = { split, predicted_sentiment: pred || null, sentiment: pred || null };
      if (conf) patch.confidence = Number(conf);
      for (let i = 0; i < ids.length; i += chunk) {
        const slice = ids.slice(i, i + chunk);
        await supabaseAdmin.from("tweets").update(patch).in("id", slice);
      }
    }
  } catch (e) {
    console.warn("[train] sync back to Supabase failed (lanjut):", (e as Error).message);
  }

  res.json(result);
});
