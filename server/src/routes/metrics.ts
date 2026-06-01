import { Router } from "express";
import { db } from "../db.js";
import { requireAuth } from "../auth.js";

export const metricsRouter = Router();

metricsRouter.get("/", requireAuth, (_req, res) => {
  const run = db
    .prepare("SELECT * FROM training_runs ORDER BY id DESC LIMIT 1")
    .get() as any;
  if (!run) return res.json({ trained: false });
  res.json({
    trained: true,
    created_at: run.created_at,
    algo: run.algo,
    accuracy: run.accuracy,
    macro_f1: run.macro_f1,
    train_size: run.train_size,
    test_size: run.test_size,
    confusion: JSON.parse(run.confusion_json),
    per_class: JSON.parse(run.per_class_json),
  });
});

metricsRouter.get("/test-results", requireAuth, (_req, res) => {
  const rows = db
    .prepare(
      "SELECT id, text, actual_sentiment, predicted_sentiment, confidence FROM tweets WHERE split = 'test' ORDER BY id"
    )
    .all();
  res.json({ rows });
});

metricsRouter.get("/runs", requireAuth, (_req, res) => {
  const runs = db
    .prepare("SELECT id, created_at, algo, accuracy, macro_f1, train_size, test_size FROM training_runs ORDER BY id DESC LIMIT 50")
    .all();
  res.json({ runs });
});
