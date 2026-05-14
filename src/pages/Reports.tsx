import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchDashboardStats, fetchTopDestinations } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Stats { total: number; positive: number; neutral: number; negative: number; unlabeled: number }
interface Dest { name: string; score: number; mentions: number }

export default function Reports() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [dests, setDests] = useState<Dest[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
    fetchTopDestinations().then(setDests);
  }, []);

  const labeled = stats ? stats.positive + stats.neutral + stats.negative : 0;
  const pct = (n: number) => labeled ? ((n / labeled) * 100).toFixed(1) + "%" : "—";

  const fetchAllTweets = async () => {
    const { data } = await supabase.from("tweets").select("text,sentiment,source,confidence,created_at,labeled_at").order("created_at", { ascending: false });
    return data ?? [];
  };

  const downloadXLSX = async () => {
    setBusy(true);
    try {
      const tweets = await fetchAllTweets();
      const wb = XLSX.utils.book_new();

      const summary = [
        ["Sentiment Analysis Report"],
        ["Generated", new Date().toLocaleString()],
        [],
        ["Metric", "Value"],
        ["Total Tweets", stats?.total ?? 0],
        ["Positive", `${stats?.positive ?? 0} (${pct(stats?.positive ?? 0)})`],
        ["Neutral", `${stats?.neutral ?? 0} (${pct(stats?.neutral ?? 0)})`],
        ["Negative", `${stats?.negative ?? 0} (${pct(stats?.negative ?? 0)})`],
        ["Unlabeled", stats?.unlabeled ?? 0],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");

      const destRows = [["Destination", "Mentions", "Positive Score (%)"], ...dests.map(d => [d.name, d.mentions, d.score])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(destRows), "Top Destinations");

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tweets), "Tweets");

      XLSX.writeFile(wb, `sentiment-report-${Date.now()}.xlsx`);
      toast.success("XLSX report downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to export");
    } finally { setBusy(false); }
  };

  const downloadPDF = async () => {
    setBusy(true);
    try {
      const tweets = await fetchAllTweets();
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Sentiment Analysis Report", 14, 18);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

      autoTable(doc, {
        startY: 32,
        head: [["Metric", "Value"]],
        body: [
          ["Total Tweets", String(stats?.total ?? 0)],
          ["Positive", `${stats?.positive ?? 0} (${pct(stats?.positive ?? 0)})`],
          ["Neutral", `${stats?.neutral ?? 0} (${pct(stats?.neutral ?? 0)})`],
          ["Negative", `${stats?.negative ?? 0} (${pct(stats?.negative ?? 0)})`],
          ["Unlabeled", String(stats?.unlabeled ?? 0)],
        ],
      });

      autoTable(doc, {
        head: [["Destination", "Mentions", "Positive %"]],
        body: dests.map(d => [d.name, String(d.mentions), `${d.score}%`]),
      });

      autoTable(doc, {
        head: [["Text", "Sentiment", "Confidence"]],
        body: tweets.slice(0, 500).map((t: any) => [
          (t.text || "").slice(0, 120),
          t.sentiment ?? "—",
          t.confidence != null ? Number(t.confidence).toFixed(2) : "—",
        ]),
        styles: { fontSize: 7, cellPadding: 1.5 },
        columnStyles: { 0: { cellWidth: 130 } },
      });

      doc.save(`sentiment-report-${Date.now()}.pdf`);
      toast.success("PDF report downloaded");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to export");
    } finally { setBusy(false); }
  };

  return (
    <AppShell>
      <section className="max-w-[1400px]">
        <h1 className="font-headline text-5xl font-extrabold text-primary tracking-tight">Reports</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          Ringkasan analisis sentimen pariwisata Flores. Unduh dalam format XLSX atau PDF untuk dokumentasi penelitian.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={downloadXLSX} disabled={busy} className="gap-2">
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            Download XLSX
          </Button>
          <Button onClick={downloadPDF} disabled={busy} variant="secondary" className="gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Download PDF
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            ["Total Tweets", stats?.total ?? "—"],
            ["Positive", `${stats?.positive ?? 0} (${pct(stats?.positive ?? 0)})`],
            ["Neutral", `${stats?.neutral ?? 0} (${pct(stats?.neutral ?? 0)})`],
            ["Negative", `${stats?.negative ?? 0} (${pct(stats?.negative ?? 0)})`],
          ].map(([l, v]) => (
            <div key={l as string} className="bg-surface-lowest rounded-2xl p-6 shadow-ambient">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground">{l}</p>
              <p className="mt-2 font-headline text-3xl font-extrabold text-primary">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-surface-lowest rounded-2xl p-8 shadow-ambient">
          <h3 className="font-headline text-2xl font-bold text-primary">Top Destinations</h3>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2">Destination</th>
                <th className="py-2">Mentions</th>
                <th className="py-2">Positive Score</th>
              </tr>
            </thead>
            <tbody>
              {dests.map(d => (
                <tr key={d.name} className="border-b last:border-0">
                  <td className="py-2 font-semibold text-primary">{d.name}</td>
                  <td className="py-2">{d.mentions}</td>
                  <td className="py-2">{d.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
