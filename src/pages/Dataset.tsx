import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { fetchTweets, type TweetRow, type Sentiment } from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

async function exportPDF(filter: Sentiment | "all", q: string) {
  const { rows } = await fetchTweets({ page: 1, pageSize: 10000, sentiment: filter, q });
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Sentiment Analysis Results - Flores Tourism", 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}  |  Total: ${rows.length}  |  Filter: ${filter}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [["#", "Source", "Text", "Sentiment", "Confidence"]],
    body: rows.map((r, i) => [
      i + 1,
      r.source,
      r.text.length > 140 ? r.text.slice(0, 140) + "…" : r.text,
      r.sentiment ?? "unlabeled",
      r.confidence != null ? (r.confidence * 100).toFixed(1) + "%" : "-",
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 42, 76] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 20 }, 2: { cellWidth: 180 }, 3: { cellWidth: 25 }, 4: { cellWidth: 25 } },
  });
  doc.save(`sentiment-results-${Date.now()}.pdf`);
}

export default function Dataset() {
  const [rows, setRows] = useState<TweetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Sentiment | "all">("all");
  const [q, setQ] = useState("");
  const pageSize = 20;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    fetchTweets({ page, pageSize, sentiment: filter, q }).then(({ rows, total }) => {
      setRows(rows); setTotal(total);
    }).catch(console.error);
  }, [page, filter, q]);

  return (
    <AppShell searchPlaceholder="Search data points...">
      <section className="max-w-[1400px]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Research Dataset</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Exploring {total.toLocaleString()} sentiment data points scraped from social media regarding the Flores archipelago.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-surface-lowest rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-ambient">
          <div className="md:col-span-2 flex items-center gap-3 bg-surface-low rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-muted-foreground text-[20px]">search</span>
            <input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} placeholder="Filter by text snippet..." className="bg-transparent flex-1 outline-none text-sm placeholder:text-muted-foreground" />
          </div>
          <select value={filter} onChange={(e) => { setPage(1); setFilter(e.target.value as any); }}
            className="bg-surface-low rounded-xl px-4 py-3 text-sm text-primary font-semibold outline-none">
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <div className="bg-surface-low rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center justify-center font-semibold">
            Source: Twitter
          </div>
        </div>

        <div className="mt-6 bg-surface-lowest rounded-2xl shadow-ambient overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">
            <div className="col-span-2">Source</div>
            <div className="col-span-7">Text Snippet</div>
            <div className="col-span-3">Sentiment</div>
          </div>
          {rows.map((r, i) => {
            const tone = r.sentiment === "positive" ? "secondary" : r.sentiment === "negative" ? "destructive" : "outline";
            return (
              <div key={r.id} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center ${i % 2 === 0 ? "bg-surface-low/50" : ""}`}>
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </div>
                  <span className="font-semibold text-primary text-sm capitalize">{r.source}</span>
                </div>
                <div className="col-span-7 text-sm text-foreground/80 italic">"{r.text}"</div>
                <div className="col-span-3 flex items-center gap-3">
                  {r.sentiment ? (
                    <>
                      <div className="flex-1 h-1.5 bg-surface-high rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${tone === "secondary" ? "bg-secondary" : tone === "destructive" ? "bg-destructive" : "bg-outline"}`} style={{ width: `${(r.confidence ?? 0) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-bold capitalize ${tone === "secondary" ? "text-secondary" : tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>{r.sentiment}</span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground italic">unlabeled</span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="px-6 py-5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing <b className="text-primary">{(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}</b> of <b className="text-primary">{total.toLocaleString()}</b>
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-9 h-9 rounded-lg hover:bg-surface-low text-muted-foreground disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-3 text-primary font-bold">{page} / {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="w-9 h-9 rounded-lg hover:bg-surface-low text-muted-foreground disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
