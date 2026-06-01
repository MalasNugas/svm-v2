import { Router } from "express";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { MODEL_PATH } from "../db.js";

export const predictRouter = Router();

const PYTHON = process.env.PYTHON_BIN ?? "python3";
const PREDICT_SCRIPT = resolve(process.cwd(), "python/predict.py");

const BodySchema = z.object({ text: z.string().min(1).max(5000) });

predictRouter.post("/", requireAuth, async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  if (!existsSync(MODEL_PATH)) return res.status(400).json({ error: "model belum dilatih. POST /train dulu." });

  const child = spawn(PYTHON, [PREDICT_SCRIPT, parsed.data.text]);
  let out = "";
  let err = "";
  child.stdout.on("data", (d) => (out += d.toString()));
  child.stderr.on("data", (d) => (err += d.toString()));
  child.on("close", (code) => {
    if (code !== 0) return res.status(500).json({ error: "predict failed", detail: err.slice(-1000) });
    try {
      res.json(JSON.parse(out.trim()));
    } catch {
      res.status(500).json({ error: "invalid python output", stdout: out });
    }
  });
});
