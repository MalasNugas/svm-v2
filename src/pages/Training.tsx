import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { fetchTrainingStatus, runStratifiedSplit, runTraining, resetSplit, fetchModelMetrics, type TrainingStatus, type ModelMetrics } from "@/lib/api";
import { expressApi } from "@/lib/expressApi";
import { toast } from "@/hooks/use-toast";

type ExpressMetrics = {
  accuracy: number;
  macro_f1: number;
  train_size: number;
  test_size: number;
  confusion: number[][];
  per_class: { label: string; precision: number; recall: number; f1: number; support: number }[];
  algo?: string;
  created_at?: string;
};

export default function Training() {
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [expMetrics, setExpMetrics] = useState<ExpressMetrics | null>(null);
  const [busy, setBusy] = useState<"split" | "train" | "reset" | "sync" | "svm" | null>(null);
  const useExpress = expressApi.enabled;

  const refresh = async () => {
    try {
      const [s, m] = await Promise.all([fetchTrainingStatus(), fetchModelMetrics()]);
      setStatus(s);
      setMetrics(m);
    } catch (e: any) {
      toast({ title: "Gagal memuat status", description: e?.message ?? "", variant: "destructive" });
    }
    if (useExpress) {
      try {
        const em = await expressApi.metrics();
        if ("trained" in em && em.trained) setExpMetrics(em);
      } catch (e) {
        // Express offline → diam saja, fallback ke metrik Supabase
      }
    }
  };
  useEffect(() => { refresh(); }, []);

  const handleSplit = async () => {
    setBusy("split");
    try {
      const r = await runStratifiedSplit();
      toast({ title: "Split selesai", description: `Train: ${r.train} · Test: ${r.test}` });
      await refresh();
    } catch (e: any) {
      toast({ title: "Split gagal", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleTrain = async () => {
    setBusy("train");
    try {
      const r = await runTraining();
      toast({ title: "Training selesai (Naive Bayes JS)", description: `Trained on ${r.trained}, predicted ${r.predicted}` });
      await refresh();
    } catch (e: any) {
      toast({ title: "Training gagal", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleReset = async () => {
    if (!confirm("Reset split? Semua kolom split, prediksi, confidence akan dikosongkan.")) return;
    setBusy("reset");
    try {
      await resetSplit();
      toast({ title: "Split direset" });
      await refresh();
    } catch (e: any) {
      toast({ title: "Reset gagal", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleSync = async () => {
    setBusy("sync");
    try {
      const r = await expressApi.syncDataset();
      toast({ title: "Sync ke Express selesai", description: `${r.synced} baris (SQLite: ${r.total_in_sqlite})` });
    } catch (e: any) {
      toast({ title: "Sync gagal", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const handleTrainSVM = async () => {
    setBusy("svm");
    try {
      const r = await expressApi.train();
      setExpMetrics(r);
      toast({ title: "SVM training selesai", description: `Akurasi ${(r.accuracy * 100).toFixed(2)}% · Macro F1 ${r.macro_f1.toFixed(3)}` });
      await refresh();
    } catch (e: any) {
      toast({ title: "SVM training gagal", description: e?.message ?? "", variant: "destructive" });
    } finally { setBusy(null); }
  };

  const classLabel = (l: string) => l === "positive" ? "Positive" : l === "negative" ? "Negative" : "Neutral";

  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Model Training</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Bagi dataset menjadi train (80%) dan test (20%) secara stratified, lalu latih classifier dan prediksi data test.
          {useExpress
            ? " Backend Express aktif — gunakan SVM Python untuk hasil yang sama dengan file hasil_prediksi."
            : " Set VITE_API_URL untuk mengaktifkan backend Express + SVM Python."}
        </p>

        {/* Status */}
        <div className="mt-8 bg-surface-lowest rounded-2xl p-6 shadow-ambient grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tile label="Total" value={status?.total ?? "—"} />
          <Tile label="Train" value={status?.train ?? "—"} />
          <Tile label="Test" value={status?.test ?? "—"} />
          <Tile label="Predicted" value={status?.predicted ?? "—"} />
        </div>

        {/* Per-class table */}
        <div className="mt-6 bg-surface-lowest rounded-2xl p-6 shadow-ambient">
          <h3 className="font-headline text-lg font-bold text-primary mb-3">Distribusi per Kelas</h3>
          <table className="w-full text-sm">
            <thead className="bg-surface-low text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Class</th>
                <th className="text-right px-4 py-2">Train</th>
                <th className="text-right px-4 py-2">Test</th>
                <th className="text-right px-4 py-2">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {status?.perClass.map((c) => (
                <tr key={c.label} className="border-t border-outline/20">
                  <td className="px-4 py-2 font-semibold text-primary">{classLabel(c.label)}</td>
                  <td className="px-4 py-2 text-right">{c.train}</td>
                  <td className="px-4 py-2 text-right">{c.test}</td>
                  <td className="px-4 py-2 text-right">{c.predicted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Express / SVM panel */}
        <div className="mt-6 bg-surface-lowest rounded-2xl p-6 shadow-ambient">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div>
              <h3 className="font-headline text-lg font-bold text-primary">Backend Express + SVM (Python)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {useExpress ? <span className="text-secondary font-bold">aktif · {import.meta.env.VITE_API_URL}</span> : <span className="text-muted-foreground">tidak di-set (VITE_API_URL kosong)</span>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSync} disabled={!useExpress || busy !== null}
              className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
              {busy === "sync" ? "Syncing..." : "Sync Dataset → Express"}
            </button>
            <button onClick={handleTrainSVM} disabled={!useExpress || busy !== null}
              className="bg-secondary text-secondary-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              {busy === "svm" ? "Training SVM..." : "Train SVM (Python)"}
            </button>
          </div>
        </div>

        {/* Actions (Naive Bayes lama / fallback) */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSplit} disabled={busy !== null}
              className="bg-surface-high text-primary rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">call_split</span>
              {busy === "split" ? "Splitting..." : "1. Stratified Split 70/30"}
            </button>
            <button onClick={handleTrain} disabled={busy !== null || !status?.train || !status?.test}
              className="bg-surface-high text-primary rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">model_training</span>
              {busy === "train" ? "Training..." : "2. Train & Predict"}
            </button>
            <button onClick={handleReset} disabled={busy !== null}
              className="bg-destructive text-destructive-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              {busy === "reset" ? "Resetting..." : "Reset Split"}
            </button>
          </div>
        </div>

        {/* SVM metrics */}
        {expMetrics && (
          <div className="mt-8 bg-surface-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-headline text-2xl font-bold text-primary mb-2">Hasil SVM (Express + Python)</h3>
            <p className="text-xs text-muted-foreground mb-4">{expMetrics.algo ?? "LinearSVC"} · train {expMetrics.train_size} · test {expMetrics.test_size}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Tile label="Accuracy" value={`${(expMetrics.accuracy * 100).toFixed(2)}%`} />
              <Tile label="Macro F1" value={expMetrics.macro_f1.toFixed(3)} />
              <Tile label="Test Samples" value={expMetrics.test_size} />
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-low text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Class</th>
                    <th className="text-right px-4 py-2">Precision</th>
                    <th className="text-right px-4 py-2">Recall</th>
                    <th className="text-right px-4 py-2">F1</th>
                    <th className="text-right px-4 py-2">Support</th>
                  </tr>
                </thead>
                <tbody>
                  {expMetrics.per_class.map((c) => (
                    <tr key={c.label} className="border-t border-outline/20">
                      <td className="px-4 py-2 font-semibold text-primary">{classLabel(c.label)}</td>
                      <td className="px-4 py-2 text-right">{(c.precision * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">{(c.recall * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2 text-right">{c.f1.toFixed(3)}</td>
                      <td className="px-4 py-2 text-right">{c.support}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h4 className="font-headline text-sm font-bold text-primary mb-2">Confusion Matrix (actual ↓ / predicted →)</h4>
              <table className="text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="px-3 py-2"></th>
                    {["Positive", "Neutral", "Negative"].map((l) => <th key={l} className="px-3 py-2 text-xs uppercase text-muted-foreground">{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {expMetrics.confusion.map((row, i) => (
                    <tr key={i}>
                      <th className="px-3 py-2 text-xs uppercase text-muted-foreground text-left">{["Positive", "Neutral", "Negative"][i]}</th>
                      {row.map((v, j) => (
                        <td key={j} className={`px-3 py-2 text-center rounded ${i === j ? "bg-secondary/30 font-bold" : "bg-surface-low"}`}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Metrics on test set (Supabase) */}
        {metrics && metrics.samples > 0 && (
          <div className="mt-8 bg-surface-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-headline text-xl font-bold text-primary mb-2">Evaluasi Test Set (data Supabase)</h3>
            <p className="text-xs text-muted-foreground mb-4">{metrics.samples} baris test · sumber: kolom `predicted_sentiment` di tabel tweets.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Tile label="Accuracy" value={`${(metrics.accuracy * 100).toFixed(2)}%`} />
              <Tile label="Macro F1" value={metrics.macroF1.toFixed(3)} />
              <Tile label="Samples" value={metrics.samples} />
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-low rounded-xl p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-headline text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
