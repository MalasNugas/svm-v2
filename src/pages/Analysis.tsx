import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import { toast } from "sonner";
import { analyzeSentiment, autoLabelBatch, type Sentiment } from "@/lib/api";

export default function Analysis() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ sentiment: Sentiment; confidence: number } | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);

  const onAnalyze = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await analyzeSentiment(text);
      setResult(r);
    } catch (e: any) {
      toast.error(e?.message ?? "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const onBatch = async () => {
    setBatchBusy(true);
    try {
      const r = await autoLabelBatch(25);
      toast.success(`Labeled ${r.processed} of ${r.requested} tweets`);
    } catch (e: any) {
      toast.error(e?.message ?? "Batch labeling failed (admin role required)");
    } finally {
      setBatchBusy(false);
    }
  };

  const tone = result?.sentiment === "positive" ? "secondary"
    : result?.sentiment === "negative" ? "destructive" : "outline";

  return (
    <AppShell searchPlaceholder="Search datasets...">
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Sentiment Analysis Module</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Klasifikasi tweet pariwisata menjadi positive / neutral / negative menggunakan model AI Gemini sebagai sandbox sebelum migrasi ke pipeline SVM Anda di Express.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-headline text-2xl font-bold text-primary">Single Text Analysis</h3>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste a tweet or comment in Indonesian..."
                className="mt-6 w-full h-56 p-5 bg-surface-low rounded-xl border-0 outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-muted-foreground text-sm resize-none"
              />
              <div className="text-right text-xs text-muted-foreground mt-1">{text.length} characters</div>

              <button onClick={onAnalyze} disabled={busy || !text.trim()}
                className="mt-6 w-full gradient-primary text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-ambient hover:saturate-150 disabled:opacity-50">
                {busy ? "Analyzing..." : "Analyze with AI"}
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </button>
            </div>

            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-headline text-xl font-bold text-primary">Auto-Label Dataset</h3>
                  <p className="text-xs text-muted-foreground mt-1">Process 25 unlabeled tweets per batch (admin only)</p>
                </div>
                <button onClick={onBatch} disabled={batchBusy}
                  className="px-5 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:saturate-150 disabled:opacity-50">
                  {batchBusy ? "Processing..." : "Run batch (25)"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <h3 className="font-headline text-xl font-bold text-primary">Classification Result</h3>
              {result ? (
                <div className="mt-6 text-center">
                  <p className="font-headline text-5xl font-extrabold text-primary capitalize">{result.sentiment}</p>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-2">Sentiment</p>
                  <div className="mt-8">
                    <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                      <div className={`h-full ${tone === "secondary" ? "bg-secondary" : tone === "destructive" ? "bg-destructive" : "bg-outline"}`}
                        style={{ width: `${result.confidence * 100}%` }} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Confidence: <b className="text-primary">{(result.confidence * 100).toFixed(1)}%</b></p>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">Submit text to see classification.</p>
              )}
            </div>

            <div className="rounded-2xl p-8 text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(170 100% 6%), hsl(173 100% 18%))" }}>
              <div className="flex items-center gap-2 text-secondary-container text-[11px] tracking-[0.2em] uppercase font-bold">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Sandbox Notice
              </div>
              <p className="text-sm mt-4 text-primary-foreground/85 leading-relaxed">
                Hasil klasifikasi saat ini menggunakan AI Gemini sebagai placeholder. Setelah backend Express + SVM Anda siap, ganti implementasi <code className="bg-black/30 px-1 rounded">analyzeSentiment</code> di <code className="bg-black/30 px-1 rounded">src/lib/api.ts</code>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
