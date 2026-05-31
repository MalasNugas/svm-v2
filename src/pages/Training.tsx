import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { fetchTrainingStatus, runStratifiedSplit, runTraining, resetSplit, fetchModelMetrics, type TrainingStatus, type ModelMetrics } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Training() {
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [busy, setBusy] = useState<"split" | "train" | "reset" | null>(null);

  const refresh = async () => {
    try {
      const [s, m] = await Promise.all([fetchTrainingStatus(), fetchModelMetrics()]);
      setStatus(s);
      setMetrics(m);
    } catch (e: any) {
      toast({ title: "Gagal memuat status", description: e?.message ?? "", variant: "destructive" });
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
      toast({ title: "Training selesai", description: `Trained on ${r.trained}, predicted ${r.predicted}` });
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

  const classLabel = (l: string) => l === "positive" ? "Positive" : l === "negative" ? "Negative" : "Neutral";

  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Model Training</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Bagi dataset menjadi train (80%) dan test (20%) secara stratified, lalu latih classifier (TF-IDF + Multinomial Naive Bayes) dan prediksi data test.
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

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleSplit} disabled={busy !== null}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">call_split</span>
            {busy === "split" ? "Splitting..." : "1. Stratified Split 80/20"}
          </button>
          <button onClick={handleTrain} disabled={busy !== null || !status?.train || !status?.test}
            className="bg-secondary text-secondary-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">model_training</span>
            {busy === "train" ? "Training..." : "2. Train & Predict"}
          </button>
          <button onClick={handleReset} disabled={busy !== null}
            className="bg-destructive text-destructive-foreground rounded-xl px-5 py-3 text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            {busy === "reset" ? "Resetting..." : "Reset Split"}
          </button>
        </div>

        {/* Metrics on test set */}
        {metrics && metrics.samples > 0 && (
          <div className="mt-8 bg-surface-lowest rounded-2xl p-6 shadow-ambient">
            <h3 className="font-headline text-2xl font-bold text-primary mb-2">Hasil Evaluasi (Test Set)</h3>
            <p className="text-xs text-muted-foreground mb-4">Dihitung dari {metrics.samples} baris test (actual_sentiment vs prediksi).</p>
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
