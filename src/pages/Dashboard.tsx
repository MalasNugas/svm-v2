import { AppShell } from "@/components/AppShell";
import featuredImg from "@/assets/featured-narrative.jpg";
import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchTopDestinations, fetchModelMetrics, ModelMetrics } from "@/lib/api";
import { WordCloud } from "@/components/WordCloud";
import { useT } from "@/lib/i18n";

interface Stats { total: number; positive: number; neutral: number; negative: number; unlabeled: number }
interface Dest { name: string; score: number; mentions: number }

export default function Dashboard() {
  const { t } = useT();
  const [stats, setStats] = useState<Stats | null>(null);
  const [dests, setDests] = useState<Dest[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(console.error);
    fetchTopDestinations().then(setDests).catch(console.error);
    fetchModelMetrics().then(setMetrics).catch(console.error);
  }, []);

  const labeled = stats ? stats.positive + stats.neutral + stats.negative : 0;
  const pct = (n: number) => labeled ? `${((n / labeled) * 100).toFixed(1)}%` : "—";

  const cards = [
    { label: t("Total Tweets"), value: stats?.total.toLocaleString() ?? "—", icon: "database", accent: "primary" as const, delta: stats ? `${stats.unlabeled} ${t("unlabeled")}` : "" },
    { label: t("Positive Sentiment"), value: pct(stats?.positive ?? 0), icon: "sentiment_very_satisfied", accent: "secondary" as const },
    { label: t("Negative Sentiment"), value: pct(stats?.negative ?? 0), icon: "sentiment_very_dissatisfied", accent: "destructive" as const },
    { label: t("Neutral Sentiment"), value: pct(stats?.neutral ?? 0), icon: "sentiment_neutral", accent: "outline" as const },
  ];

  const classLabel = (l: string) => l === "positive" ? t("Positive") : l === "negative" ? t("Negative") : t("Neutral");
  const matrixMax = metrics ? Math.max(1, ...metrics.matrix.flat()) : 1;

  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">{t("Sentiment Overview")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          {t("Analyzing tourism emotional trends across the Flores archipelago.")}
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

        {/* Model Performance */}
        <div className="mt-8 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">model_training</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold text-primary">{t("Model Performance")}</h3>
              <p className="text-xs text-muted-foreground">{t("Accuracy, classification report, and confusion matrix from the latest labeled data")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MetricTile label={t("Accuracy")} value={metrics ? `${(metrics.accuracy * 100).toFixed(2)}%` : "—"} />
            <MetricTile label={t("Macro F1")} value={metrics ? metrics.macroF1.toFixed(3) : "—"} />
            <MetricTile label={t("Samples")} value={metrics ? metrics.samples.toLocaleString() : "—"} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Classification Report */}
            <div>
              <h4 className="font-headline text-lg font-bold text-primary mb-3">{t("Classification Report")}</h4>
              <div className="overflow-hidden rounded-xl border border-outline/30">
                <table className="w-full text-sm">
                  <thead className="bg-surface-low text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2">{t("Class")}</th>
                      <th className="text-right px-4 py-2">{t("Precision")}</th>
                      <th className="text-right px-4 py-2">{t("Recall")}</th>
                      <th className="text-right px-4 py-2">{t("F1-Score")}</th>
                      <th className="text-right px-4 py-2">{t("Support")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.perClass.map((c) => (
                      <tr key={c.label} className="border-t border-outline/20">
                        <td className="px-4 py-2 font-semibold text-primary">{classLabel(c.label)}</td>
                        <td className="px-4 py-2 text-right">{c.precision.toFixed(3)}</td>
                        <td className="px-4 py-2 text-right">{c.recall.toFixed(3)}</td>
                        <td className="px-4 py-2 text-right">{c.f1.toFixed(3)}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{c.support}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Confusion Matrix */}
            <div>
              <h4 className="font-headline text-lg font-bold text-primary mb-3">{t("Confusion Matrix")}</h4>
              <div className="rounded-xl border border-outline/30 p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground text-center mb-2">{t("Predicted")}</div>
                <div className="flex">
                  <div className="flex items-center justify-center text-[11px] uppercase tracking-wider text-muted-foreground -rotate-90 w-6">{t("Actual")}</div>
                  <div className="flex-1">
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <div />
                      {metrics?.labels.map((l) => (
                        <div key={`h-${l}`} className="text-center font-semibold text-primary py-1">{classLabel(l)}</div>
                      ))}
                      {metrics?.matrix.map((row, i) => (
                        <>
                          <div key={`r-${i}`} className="font-semibold text-primary py-2 pr-2 text-right">{classLabel(metrics.labels[i])}</div>
                          {row.map((v, j) => {
                            const intensity = v / matrixMax;
                            const isDiag = i === j;
                            return (
                              <div
                                key={`c-${i}-${j}`}
                                className={`aspect-square rounded-md flex items-center justify-center font-bold ${isDiag ? "text-secondary" : "text-primary"}`}
                                style={{
                                  backgroundColor: isDiag
                                    ? `hsl(var(--secondary) / ${0.15 + intensity * 0.5})`
                                    : `hsl(var(--destructive) / ${0.08 + intensity * 0.35})`,
                                }}
                              >
                                {v}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
            <h3 className="font-headline text-2xl font-bold text-primary">{t("Sentiment Distribution")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("Live breakdown of labeled tweets in dataset")}</p>
            <div className="mt-8 space-y-4">
              {([
                [t("Positive"), stats?.positive ?? 0, "bg-secondary"],
                [t("Neutral"), stats?.neutral ?? 0, "bg-outline"],
                [t("Negative"), stats?.negative ?? 0, "bg-destructive"],
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
            <h3 className="font-headline text-xl font-bold text-primary">{t("Top Destinations")}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t("By positive sentiment ratio")}</p>
            <div className="mt-6 space-y-5">
              {dests.slice(0, 5).map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary">{d.name}</span>
                    <span className="text-xs font-bold bg-secondary-container/50 text-secondary px-2 py-0.5 rounded-md">{d.mentions} {t("mentions")}</span>
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
              <span className="text-[11px] tracking-[0.25em] uppercase text-secondary-container font-bold">{t("Featured Narrative")}</span>
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
                <h3 className="font-headline text-xl font-bold text-primary">{t("Strategic Insight")}</h3>
                <p className="text-xs text-muted-foreground">{t("Auto-generated from current dataset")}</p>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {stats && stats.unlabeled > 0
                ? `${stats.unlabeled} / ${stats.total} — ${t("unlabeled")}.`
                : ""}
            </p>
          </div>
        </div>
        <div className="mt-8 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">cloud</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold text-primary">{t("Word Cloud")}</h3>
              <p className="text-xs text-muted-foreground">{t("Most frequent terms across the tweet dataset")}</p>
            </div>
          </div>
          <WordCloud />
        </div>

      </section>
    </AppShell>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-low rounded-xl p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-headline text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

function accentBar(a: "primary" | "secondary" | "destructive" | "outline") {
  return { secondary: "border-l-secondary", destructive: "border-l-destructive", outline: "border-l-outline", primary: "border-l-transparent" }[a];
}
function accentChip(a: "primary" | "secondary" | "destructive" | "outline") {
  return { secondary: "bg-secondary-container/60 text-secondary", destructive: "bg-destructive/10 text-destructive", outline: "bg-surface-high text-muted-foreground", primary: "bg-primary-fixed text-primary" }[a];
}
