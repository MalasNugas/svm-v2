import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import komodo from "@/assets/dest-komodo.jpg";
import kelimutu from "@/assets/dest-kelimutu.jpg";
import padar from "@/assets/dest-padar.jpg";
import waerebo from "@/assets/dest-waerebo.jpg";
import pinkbeach from "@/assets/dest-pinkbeach.jpg";

interface Dest {
  name: string;
  score: number;
  desc: string;
  sentiment: string;
  img: string;
  badge?: string;
  badgeTone?: "live" | "atmos" | "culture";
  variant?: "card" | "wide";
}

const destinations: Dest[] = [
  { name: "Komodo Island", score: 94.2, img: komodo, sentiment: "Highly Positive", desc: "Home to the legendary Komodo dragon. Analysis shows peak positive sentiment regarding wildlife conservation and raw natural aesthetics.", badge: "Live Data", badgeTone: "live" },
  { name: "Kelimutu Lakes", score: 89.8, img: kelimutu, sentiment: "Ethereal", desc: "Famous for its three-colored changing lakes. Visitors frequently express \"Awe\" and \"Spirituality\" in linguistic sentiment clusters.", badge: "Atmospheric", badgeTone: "atmos" },
  { name: "Padar Island", score: 97.5, img: padar, sentiment: "Exceptional", desc: "The panoramic heart of Komodo National Park. Sentiment analysis indicates this as the highest-rated photographic destination in the region." },
  { name: "Wae Rebo Village", score: 91.4, img: waerebo, sentiment: "Cultural Heritage", desc: "Deeply embedded in the Manggarai mountains, Wae Rebo offers a unique \"Cultural Immersion\" sentiment. Our data shows high emotional scores for authenticity and community warmth despite the physical challenge of access.", badge: "Cultural Heritage", badgeTone: "culture", variant: "wide" },
  { name: "Pink Beach", score: 85.3, img: pinkbeach, sentiment: "Vibrant", desc: "One of the world's few pink sand beaches. Linguistic analysis shows high frequency of \"Surprise\" and \"Joy\" descriptors in visitor feedback." },
];

export default function Tourism() {
  const [q, setQ] = useState("");
  const filtered = destinations.filter((d) =>
    (d.name + " " + d.desc + " " + d.sentiment).toLowerCase().includes(q.toLowerCase())
  );
  return (
    <AppShell searchPlaceholder="Search destinations..." searchValue={q} onSearchChange={setQ}>
      <section className="max-w-[1400px]">
        <div className="flex items-center gap-3 text-secondary text-[11px] tracking-[0.25em] uppercase font-bold">
          <span className="w-8 h-px bg-secondary" /> Thesis Case Study
        </div>
        <h1 className="mt-4 font-headline text-5xl font-extrabold text-primary tracking-tight leading-tight">
          Sentiment Landscape of<br />Flores Tourism
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Quantitative analysis of emotional resonance across major natural landmarks. This visual index correlates geographic data with real-time visitor sentiment metrics.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((d) => (
            <DestCard key={d.name} d={d} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full">No destinations match "{q}".</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function DestCard({ d }: { d: Dest }) {
  return (
    <div className="bg-surface-lowest rounded-2xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={d.img} alt={d.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {d.badge && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur ${
            d.badgeTone === "live" ? "bg-secondary/80 text-secondary-foreground" :
            d.badgeTone === "atmos" ? "bg-primary/80 text-primary-foreground" :
            "bg-secondary-container/90 text-secondary"
          }`}>{d.badge}</span>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-headline text-2xl font-bold text-primary">{d.name}</h3>
          <span className="bg-secondary-container/50 text-secondary text-xs font-bold px-2 py-1 rounded-md">{d.score}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
        <div className="mt-6 pt-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Sentiment</p>
            <p className="text-sm font-bold text-secondary">{d.sentiment}</p>
          </div>
          <button className="text-sm font-bold text-primary flex items-center gap-1">View Details <span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
}
