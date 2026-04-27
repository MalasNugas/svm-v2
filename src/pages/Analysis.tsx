import { AppShell } from "@/components/AppShell";

export default function Analysis() {
  return (
    <AppShell searchPlaceholder="Search datasets...">
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Sentiment Analysis Module</h1>
        <p className="mt-3 text-muted-foreground max-w-3xl">
          Leverage Support Vector Machines (SVM) to classify tourism-related social media discourse into categorical emotional insights.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingestion */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-headline text-2xl font-bold text-primary">Data Ingestion</h3>
                <div className="flex gap-2 text-xs font-bold">
                  <button className="px-4 py-1.5 rounded-full bg-secondary-container/60 text-secondary">Manual Entry</button>
                  <button className="px-4 py-1.5 rounded-full text-muted-foreground">CSV/JSON</button>
                </div>
              </div>

              <textarea
                placeholder="Paste your raw social media data here (comments, tweets, reviews)..."
                className="mt-6 w-full h-56 p-5 bg-surface-low rounded-xl border-0 outline-none focus:ring-2 focus:ring-secondary/40 placeholder:text-muted-foreground text-sm resize-none"
              />
              <div className="text-right text-xs text-muted-foreground mt-1">0 / 10,000 characters</div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center text-sm text-muted-foreground hover:bg-surface-low cursor-pointer">
                  <span className="material-symbols-outlined text-[28px] text-secondary">upload_file</span>
                  <p className="mt-2">Drop files here or click to upload</p>
                </div>
                <button className="gradient-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-ambient hover:saturate-150">
                  Process with SVM
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold text-primary">Recent Analyses</h3>
                <button className="text-xs font-bold text-secondary tracking-wider uppercase">View All History</button>
              </div>
              <div className="mt-5 divide-y divide-border/30">
                {[
                  { name: "Labuan_Bajo_Comments_May24.csv", meta: "Processed 2 hours ago • 1,240 rows • 94% Accuracy" },
                  { name: "Manual_Entry_Query_082.txt", meta: "Processed Yesterday • 12 rows • 88% Accuracy" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.meta}</p>
                    </div>
                    <span className="material-symbols-outlined text-muted-foreground">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
              <h3 className="font-headline text-xl font-bold text-primary">Classification Summary</h3>
              <div className="mt-6 relative aspect-square max-w-[220px] mx-auto">
                <svg viewBox="0 0 100 100" className="absolute inset-0">
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="hsl(var(--surface-high))" strokeWidth="6" />
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="hsl(173 100% 21%)" strokeWidth="6" strokeDasharray="120 384" strokeDashoffset="-50" />
                  <rect x="2" y="2" width="96" height="96" fill="none" stroke="hsl(var(--destructive))" strokeWidth="6" strokeDasharray="50 384" strokeDashoffset="-330" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-headline text-4xl font-extrabold text-primary">82%</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Confidence</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Row icon="sentiment_very_satisfied" label="Positive" value="642" pct="51.8% of total" tone="secondary" />
                <Row icon="sentiment_neutral" label="Neutral" value="418" pct="33.7% of total" tone="outline" />
                <Row icon="sentiment_very_dissatisfied" label="Negative" value="180" pct="14.5% of total" tone="destructive" />
              </div>
            </div>

            <div className="rounded-2xl p-8 text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(170 100% 6%), hsl(173 100% 18%))" }}>
              <div className="flex items-center gap-2 text-secondary-container text-[11px] tracking-[0.2em] uppercase font-bold">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                Thesis Insight
              </div>
              <h4 className="font-headline text-2xl font-bold mt-4 leading-snug">Dominant Sentiment: Landscape Appreciation</h4>
              <p className="text-sm mt-4 text-primary-foreground/85 leading-relaxed">
                SVM analysis indicates a recurring high positive weighting for keywords related to 'Pristine Nature' and 'Sunset Views' across 65% of the positive sample set.
              </p>
              <button className="mt-6 w-full py-3 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm font-bold">
                Download Detailed Thesis Report
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ icon, label, value, pct, tone }: { icon: string; label: string; value: string; pct: string; tone: "secondary" | "outline" | "destructive" }) {
  const map = {
    secondary: "bg-secondary-container/40 text-secondary",
    outline: "bg-surface-high text-muted-foreground",
    destructive: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${map[tone]}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-semibold flex-1">{label}</span>
      <div className="text-right">
        <p className="font-headline font-extrabold">{value}</p>
        <p className="text-[10px] opacity-80">{pct}</p>
      </div>
    </div>
  );
}
