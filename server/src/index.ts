import "dotenv/config";
import express from "express";
import cors from "cors";
import { datasetRouter } from "./routes/dataset.js";
import { trainRouter } from "./routes/train.js";
import { predictRouter } from "./routes/predict.js";
import { metricsRouter } from "./routes/metrics.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

const allowed = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.includes("*") ? true : allowed,
    credentials: false,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => res.json({ ok: true, service: "sentiment-svm-server" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/dataset", datasetRouter);
app.use("/train", trainRouter);
app.use("/predict", predictRouter);
app.use("/metrics", metricsRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: err?.message ?? "internal error" });
});

app.listen(PORT, () => {
  console.log(`▸ sentiment-svm-server siap di http://localhost:${PORT}`);
  console.log(`  allowed origins: ${allowed.join(", ") || "*"}`);
});
