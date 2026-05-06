import { AppShell } from "@/components/AppShell";
import featuredImg from "@/assets/featured-narrative.jpg";
import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchTopDestinations } from "@/lib/api";

interface Stats { total: number; positive: number; neutral: number; negative: number; unlabeled: number }
interface Dest { name: string; score: number; mentions: number }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dests, setDests] = useState<Dest[]>([]);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
    fetchTopDestinations().then(setDests).catch(console.error);
  }, []);

  const labeled = stats ? stats.positive + stats.neutral + stats.negative : 0;
  const pct = (n: number) => labeled ? `${((n / labeled) * 100).toFixed(1)}%` : "—";

  const cards = [
    { label: "Total Tweets", value: stats?.total.toLocaleString() ?? "—", icon: "database", accent: "primary" as const, delta: stats ? `${stats.unlabeled} unlabeled` : "" },
    { label: "Positive Sentiment", value: pct(stats?.positive ?? 0), icon: "sentiment_very_satisfied", accent: "secondary" as const },
    { label: "Negative Sentiment", value: pct(stats?.negative ?? 0), icon: "sentiment_very_dissatisfied", accent: "destructive" as const },
    { label: "Neutral Sentiment", value: pct(stats?.neutral ?? 0), icon: "sentiment_neutral", accent: "outline" as const },
  ];

  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Sentiment Overview</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Analyzing tourism emotional trends across the Flores archipelago.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((s) => (
            <div key={s.label} className={`bg-surface-lowest rounded-2xl p-6 shadow-ambient border-l-4 ${accentBar(s.accent)}`}>
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accentChip(s.accent)}`}>
                  <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                </div>
                {s.delta && <div className="text-xs text-muted-foreground font-semibold">{s.delta}</div>}
              </div>
              <p className="mt-6 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-headline text-4xl font-extrabold text-primary">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
            <h3 className="font-headline text-2xl font-bold text-primary">Sentiment Distribution</h3>
            <p className="text-sm text-muted-foreground mt-1">Live breakdown of labeled tweets in dataset</p>
            <div className="mt-8 space-y-4">
              {([
                ["Positive", stats?.positive ?? 0, "bg-secondary"],
                ["Neutral", stats?.neutral ?? 0, "bg-outline"],
                ["Negative", stats?.negative ?? 0, "bg-destructive"],
              ] as const).map(([label, count, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-primary">{label}</span>
                    <span className="text-muted-foreground">{count} ({pct(count)})</span>
                  </div>
                  <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                    <div className={`h-full ${color}`} style={{ width: labeled ? `${(count / labeled) * 100}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-low rounded-2xl p-8">
            <h3 className="font-headline text-xl font-bold text-primary">Top Destinations</h3>
            <p className="text-xs text-muted-foreground mt-1">By positive sentiment ratio</p>
            <div className="mt-6 space-y-5">
              {dests.slice(0, 5).map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{d.name}</span>
                    <span className="text-xs font-bold bg-secondary-container/50 text-secondary px-2 py-0.5 rounded-md">{d.mentions} mentions</span>
                  </div>
                  <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                <p className="text-xs text-muted-foreground">Auto-generated from current dataset</p>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {stats && stats.unlabeled > 0
                ? `${stats.unlabeled} of ${stats.total} tweets are still unlabeled. Run the auto-labeler from the Analysis page to enrich the dataset.`
                : "All tweets have been classified. Explore the Dataset tab for granular insights."}
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function accentBar(a: "primary" | "secondary" | "destructive" | "outline") {
  return { secondary: "border-l-secondary", destructive: "border-l-destructive", outline: "border-l-outline", primary: "border-l-transparent" }[a];
}
function accentChip(a: "primary" | "secondary" | "destructive" | "outline") {
  return { secondary: "bg-secondary-container/60 text-secondary", destructive: "bg-destructive/10 text-destructive", outline: "bg-surface-high text-muted-foreground", primary: "bg-primary-fixed text-primary" }[a];
}
