import { AppShell } from "@/components/AppShell";

const rows = [
  { source: "TripAdvisor", icon: "travel", text: "The sunrise at Kelimutu was absolutely...", score: 0.92, date: "Oct 24, 2024", tone: "pos" as const },
  { source: "X (Twitter)", icon: "chat", text: "Infrastructure in Labuan Bajo is getting better b...", score: 0.54, date: "Oct 23, 2024", tone: "neu" as const },
  { source: "Google Reviews", icon: "star", text: "Disappointed by the waste management at som...", score: 0.21, date: "Oct 22, 2024", tone: "neg" as const },
  { source: "Instagram", icon: "photo_camera", text: "Wae Rebo village is like stepping back in time....", score: 0.98, date: "Oct 20, 2024", tone: "pos" as const },
  { source: "TripAdvisor", icon: "travel", text: "Padar Island hike was tough but the view from t...", score: 0.85, date: "Oct 19, 2024", tone: "pos" as const },
];

const toneColor = { pos: "bg-secondary text-secondary", neu: "bg-outline text-outline", neg: "bg-destructive text-destructive" };

export default function Dataset() {
  return (
    <AppShell searchPlaceholder="Search data points...">
      <section className="max-w-[1400px]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Research Dataset</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Exploring 12,482 sentiment data points gathered from global tourism platforms regarding the Flores archipelago. High-fidelity emotional mapping for thesis validation.
            </p>
          </div>
          <button className="bg-surface-lowest rounded-xl px-5 py-3 font-bold text-primary flex items-center gap-2 shadow-ambient">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-8 bg-surface-lowest rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-ambient">
          <div className="md:col-span-1 flex items-center gap-3 bg-surface-low rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">filter_list</span>
            <input placeholder="Filter by text snippet..." className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground" />
          </div>
          {["Date Range", "All Sentiment", "All Sources"].map((l) => (
            <button key={l} className="flex items-center justify-between bg-surface-low rounded-xl px-4 py-3 text-sm text-primary font-semibold">
              {l}
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">expand_more</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 bg-surface-lowest rounded-2xl shadow-ambient overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
            <div className="col-span-3">Source</div>
            <div className="col-span-5">Text Snippet</div>
            <div className="col-span-2">Detected Sentiment</div>
            <div className="col-span-2">Date</div>
          </div>
          {rows.map((r, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center ${i % 2 === 0 ? "bg-surface-low/50" : ""}`}>
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                </div>
                <span className="font-semibold text-primary text-sm">{r.source}</span>
              </div>
              <div className="col-span-5 text-sm text-foreground/80 italic">"{r.text}"</div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface-high rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.tone === "pos" ? "bg-secondary" : r.tone === "neg" ? "bg-destructive" : "bg-outline"}`} style={{ width: `${r.score * 100}%` }} />
                </div>
                <span className={`text-xs font-bold ${r.tone === "pos" ? "text-secondary" : r.tone === "neg" ? "text-destructive" : "text-muted-foreground"}`}>{r.score.toFixed(2)}</span>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{r.date}</span>
                <button className="text-muted-foreground"><span className="material-symbols-outlined text-[18px]">more_vert</span></button>
              </div>
            </div>
          ))}

          <div className="px-6 py-5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Showing <b className="text-primary">1 - 5</b> of <b className="text-primary">12,482</b> results</span>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 rounded-lg hover:bg-surface-low text-muted-foreground"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {[1, 2, 3].map((p) => (
                <button key={p} className={`w-9 h-9 rounded-lg font-bold text-sm ${p === 1 ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-low"}`}>{p}</button>
              ))}
              <span className="px-2 text-muted-foreground">...</span>
              <button className="w-12 h-9 rounded-lg text-muted-foreground hover:bg-surface-low text-sm">2496</button>
              <button className="w-9 h-9 rounded-lg hover:bg-surface-low text-muted-foreground"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
