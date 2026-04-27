import { AppShell } from "@/components/AppShell";
import featuredImg from "@/assets/featured-narrative.jpg";

const stats = [
  { label: "Total Data", value: "128,402", delta: "+12%", icon: "database", accent: "primary" as const },
  { label: "Positive Sentiment %", value: "64.2%", icon: "sentiment_very_satisfied", accent: "secondary" as const },
  { label: "Negative Sentiment %", value: "12.8%", icon: "sentiment_very_dissatisfied", accent: "destructive" as const },
  { label: "Neutral Sentiment %", value: "23.0%", icon: "sentiment_neutral", accent: "outline" as const },
];

const destinations = [
  { name: "Labuan Bajo", score: 94 },
  { name: "Kelimutu Lakes", score: 88 },
  { name: "Komodo Island", score: 82 },
  { name: "Wae Rebo Village", score: 79 },
];

function accentBar(a: "primary" | "secondary" | "destructive" | "outline") {
  switch (a) {
    case "secondary": return "border-l-secondary";
    case "destructive": return "border-l-destructive";
    case "outline": return "border-l-outline";
    default: return "border-l-transparent";
  }
}
function accentChip(a: "primary" | "secondary" | "destructive" | "outline") {
  switch (a) {
    case "secondary": return "bg-secondary-container/60 text-secondary";
    case "destructive": return "bg-destructive/10 text-destructive";
    case "outline": return "bg-surface-high text-muted-foreground";
    default: return "bg-primary-fixed text-primary";
  }
}

export default function Dashboard() {
  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Sentiment Overview</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Analyzing tourism emotional trends across the Flores archipelago.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((s) => (
            <div key={s.label} className={`bg-surface-lowest rounded-2xl p-6 shadow-ambient border-l-4 ${accentBar(s.accent)}`}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentChip(s.accent)}`}>
                  <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                </div>
                {s.delta && (
                  <div className="flex items-center gap-1 text-secondary text-sm font-semibold">
                    <span className="material-symbols-outlined text-[18px]">trending_up</span>
                    {s.delta}
                  </div>
                )}
              </div>
              <p className="mt-6 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-headline text-4xl font-extrabold text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Trends + Top destinations */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary">Sentiment Trends</h3>
                <p className="text-sm text-muted-foreground mt-1">Emotional variance over the last 12 months</p>
              </div>
              <div className="bg-surface-low rounded-full p-1 flex text-xs font-bold">
                <button className="px-4 py-1.5 rounded-full bg-primary-fixed text-primary">Yearly</button>
                <button className="px-4 py-1.5 rounded-full text-muted-foreground">Monthly</button>
              </div>
            </div>

            {/* Smooth curves */}
            <div className="mt-8">
              <svg viewBox="0 0 600 220" className="w-full h-56">
                <defs>
                  <linearGradient id="posGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(173 100% 21%)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(173 100% 21%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 150 C 80 140, 140 130, 200 120 S 340 30, 420 60 S 540 90, 600 80" fill="none" stroke="hsl(173 100% 21%)" strokeWidth="3" />
                <path d="M0 150 C 80 140, 140 130, 200 120 S 340 30, 420 60 S 540 90, 600 80 L600 220 L0 220 Z" fill="url(#posGrad)" />
                <path d="M0 170 C 100 165, 200 175, 320 170 S 500 165, 600 168" fill="none" stroke="hsl(var(--outline))" strokeWidth="2.5" />
                <path d="M0 200 C 120 198, 240 200, 360 199 S 500 198, 600 200" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[11px] tracking-widest uppercase text-muted-foreground mt-2">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
              <div className="flex gap-6 mt-6 text-sm">
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-secondary" />Positive</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-outline" />Neutral</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive" />Negative</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-low rounded-2xl p-8">
            <h3 className="font-headline text-xl font-bold text-primary">Top Destinations</h3>
            <div className="mt-6 space-y-5">
              {destinations.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{d.name}</span>
                    <span className="text-xs font-bold bg-secondary-container/50 text-secondary px-2 py-0.5 rounded-md">{d.score}/100</span>
                  </div>
                  <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-3 rounded-xl bg-surface-lowest text-[11px] font-bold tracking-[0.2em] uppercase text-primary">
              View Full List
            </button>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="relative rounded-2xl overflow-hidden min-h-[300px] shadow-ambient">
            <img src={featuredImg} alt="Featured narrative" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-8 text-primary-foreground">
              <span className="text-[11px] tracking-[0.25em] uppercase text-secondary-container font-bold">Featured Narrative</span>
              <p className="font-headline text-2xl font-bold mt-3 leading-snug">
                "The emotional resonance of Kelimutu remains a primary driver for repeat cultural tourism."
              </p>
            </div>
          </div>

          <div className="bg-surface-lowest rounded-2xl p-8 shadow-ambient">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">lightbulb</span>
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-primary">Strategic Insight</h3>
                <p className="text-xs text-muted-foreground">Generated by Cognitive Curator AI</p>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Data suggests a 15% increase in negative sentiment regarding transportation infrastructure in West Manggarai. Improving road accessibility between Labuan Bajo and Ruteng could pivot neutral sentiments into positive cultural advocacy.
            </p>
            <div className="mt-8 flex gap-3">
              <button className="px-5 py-3 gradient-primary text-primary-foreground rounded-xl font-bold text-sm shadow-ambient">Download Thesis PDF</button>
              <button className="px-5 py-3 rounded-xl font-bold text-sm text-primary border border-border/30">Share Findings</button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
