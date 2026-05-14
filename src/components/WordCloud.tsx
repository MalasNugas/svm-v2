import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STOPWORDS = new Set([
  "yang","di","dan","ke","dari","untuk","dengan","ini","itu","atau","saya","kami","kita","kamu","anda","mereka","dia",
  "ada","tidak","tak","juga","sudah","akan","bisa","saja","lagi","masih","oleh","pada","dalam","seperti","karena",
  "agar","supaya","jadi","kalo","kalau","aja","sih","nya","yg","aku","gak","gak","ga","biar","banget","kok","loh",
  "the","and","of","to","is","in","a","for","on","at","this","that","i","you","it","with","as","be","are","was","an",
  "rt","https","http","co","amp","t","s","tco","com","www","ya","tu","kek","kya","mau","kek","ya","udah","udah",
  "https","http","tco","com","apa","kalo","https","amp","kalau","tapi","jg","dr","tp","aku","gw","gue","lo","lu",
  "n","si","kan","kah","la","wae","ku","mu","pun","yah","deh","lah","dong","sih","loh","kok","nih","tuh"
]);

interface WordItem { text: string; count: number }

export function WordCloud() {
  const [words, setWords] = useState<WordItem[]>([]);

  useEffect(() => {
    supabase.from("tweets").select("text").limit(2000).then(({ data }) => {
      const freq: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        const t = (r.text || "").toLowerCase();
        const tokens = t.replace(/https?:\/\/\S+/g, " ")
          .replace(/[^a-zA-Z\u00C0-\u024F\s]/g, " ")
          .split(/\s+/);
        tokens.forEach((w: string) => {
          if (w.length < 4) return;
          if (STOPWORDS.has(w)) return;
          freq[w] = (freq[w] || 0) + 1;
        });
      });
      const list = Object.entries(freq)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 60);
      setWords(list);
    });
  }, []);

  const { max, min } = useMemo(() => ({
    max: Math.max(...words.map(w => w.count), 1),
    min: Math.min(...words.map(w => w.count), 1),
  }), [words]);

  const sizeFor = (c: number) => {
    const t = (c - min) / Math.max(max - min, 1);
    return 12 + t * 36; // 12px - 48px
  };
  const colorFor = (i: number) => {
    const palette = ["text-primary", "text-secondary", "text-destructive", "text-muted-foreground"];
    return palette[i % palette.length];
  };

  if (!words.length) {
    return <div className="text-sm text-muted-foreground py-12 text-center">Loading word cloud…</div>;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 min-h-[260px]">
      {words.map((w, i) => (
        <span
          key={w.text}
          className={`${colorFor(i)} font-bold leading-none transition-transform hover:scale-110 cursor-default`}
          style={{ fontSize: `${sizeFor(w.count)}px`, opacity: 0.5 + 0.5 * ((w.count - min) / Math.max(max - min, 1)) }}
          title={`${w.text} — ${w.count} mentions`}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
