import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DB_PATH = resolve(process.cwd(), "data/app.db");
mkdirSync(dirname(DB_PATH), { recursive: true });
mkdirSync(resolve(process.cwd(), "data/models"), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS tweets (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  processed_text TEXT,
  actual_sentiment TEXT,
  split TEXT,
  predicted_sentiment TEXT,
  confidence REAL
);

CREATE TABLE IF NOT EXISTS training_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  algo TEXT,
  accuracy REAL,
  macro_f1 REAL,
  train_size INTEGER,
  test_size INTEGER,
  confusion_json TEXT,
  per_class_json TEXT
);
`);

export const DATA_DIR = resolve(process.cwd(), "data");
export const MODEL_PATH = resolve(DATA_DIR, "models/svm.joblib");
