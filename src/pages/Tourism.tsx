import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  location: string;
  bestTime: string;
  activities: string[];
  highlights: string[];
}

const destinations: Dest[] = [
  {
    name: "Komodo Island",
    score: 94.2,
    img: komodo,
    sentiment: "Highly Positive",
    desc: "Home to the legendary Komodo dragon. Analysis shows peak positive sentiment regarding wildlife conservation and raw natural aesthetics.",
    badge: "Live Data",
    badgeTone: "live",
    location: "Komodo National Park, East Nusa Tenggara",
    bestTime: "April – November",
    activities: ["Wildlife spotting", "Guided trekking", "Snorkeling", "Photography"],
    highlights: ["Komodo dragons", "Pink Beach proximity", "Loh Liang ranger station", "Sunset viewpoint"],
  },
  {
    name: "Kelimutu Lakes",
    score: 89.8,
    img: kelimutu,
    sentiment: "Ethereal",
    desc: "Famous for its three-colored changing lakes. Visitors frequently express \"Awe\" and \"Spirituality\" in linguistic sentiment clusters.",
    badge: "Atmospheric",
    badgeTone: "atmos",
    location: "Mount Kelimutu, Ende, Flores",
    bestTime: "May – September",
    activities: ["Sunrise trekking", "Cultural pilgrimage", "Photography", "Village visit"],
    highlights: ["Three-colored crater lakes", "Sunrise panorama", "Local myths & folklore", "Moni village tradition"],
  },
  {
    name: "Padar Island",
    score: 97.5,
    img: padar,
    sentiment: "Exceptional",
    desc: "The panoramic heart of Komodo National Park. Sentiment analysis indicates this as the highest-rated photographic destination in the region.",
    location: "Komodo National Park, East Nusa Tenggara",
    bestTime: "April – December",
    activities: ["Hiking to viewpoint", "Beach hopping", "Drone photography", "Sunrise trek"],
    highlights: ["Iconic three-bay viewpoint", "Black, white & pink beaches", "Dramatic savanna hills", "Dolphin spotting"],
  },
  {
    name: "Wae Rebo Village",
    score: 91.4,
    img: waerebo,
    sentiment: "Cultural Heritage",
    desc: "Deeply embedded in the Manggarai mountains, Wae Rebo offers a unique \"Cultural Immersion\" sentiment. Our data shows high emotional scores for authenticity and community warmth despite the physical challenge of access.",
    badge: "Cultural Heritage",
    badgeTone: "culture",
    variant: "wide",
    location: "Satar Lenda, Manggarai, Flores",
    bestTime: "March – October",
    activities: ["Overnight homestay", "Traditional coffee tasting", "Trekking", "Weaving workshop"],
    highlights: ["UNESCO-recognized Mbaru Niang houses", "Ancient communal living", "Organic Robusta coffee", "Authentic Manggarai hospitality"],
  },
  {
    name: "Pink Beach",
    score: 85.3,
    img: pinkbeach,
    sentiment: "Vibrant",
    desc: "One of the world's few pink sand beaches. Linguistic analysis shows high frequency of \"Surprise\" and \"Joy\" descriptors in visitor feedback.",
    location: "Komodo Island, East Nusa Tenggara",
    bestTime: "April – November",
    activities: ["Snorkeling", "Beach relaxation", "Underwater photography", "Kayaking"],
    highlights: ["Rare pink-hued sand", "Pristine coral gardens", "Turtle sightings", "Crystal-clear turquoise water"],
  },
];

export default function Tourism() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Dest | null>(null);
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
            <DestCard key={d.name} d={d} onViewDetails={() => setSelected(d)} />
          ))}
          {filtered.length === 0 && (
            <p className="text-muted-foreground col-span-full">No destinations match "{q}".</p>
          )}
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {selected && (
            <>
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={selected.img}
                  alt={selected.name}
                  className="w-full h-full object-cover"
                />
                {selected.badge && (
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur ${
                    selected.badgeTone === "live" ? "bg-secondary/80 text-secondary-foreground" :
                    selected.badgeTone === "atmos" ? "bg-primary/80 text-primary-foreground" :
                    "bg-secondary-container/90 text-secondary"
                  }`}>
                    {selected.badge}
                  </span>
                )}
              </div>
              <div className="p-6 space-y-5">
                <DialogHeader className="text-left space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <DialogTitle className="font-headline text-2xl font-bold text-primary">
                      {selected.name}
                    </DialogTitle>
                    <span className="bg-secondary-container/50 text-secondary text-xs font-bold px-2 py-1 rounded-md shrink-0">
                      {selected.score}
                    </span>
                  </div>
                  <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                    {selected.desc}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-low rounded-xl p-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-semibold text-primary">{selected.location}</p>
                  </div>
                  <div className="bg-surface-low rounded-xl p-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Best Time to Visit</p>
                    <p className="text-sm font-semibold text-primary">{selected.bestTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Popular Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.activities.map((a) => (
                      <span key={a} className="px-3 py-1.5 rounded-lg bg-secondary-container/40 text-secondary text-xs font-semibold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Key Highlights</p>
                  <ul className="space-y-2">
                    {selected.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-primary">
                        <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Sentiment</p>
                    <p className="text-sm font-bold text-secondary">{selected.sentiment}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DestCard({ d, onViewDetails }: { d: Dest; onViewDetails: () => void }) {
  return (
    <div onClick={onViewDetails} className="bg-surface-lowest rounded-2xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow group cursor-pointer">
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
        <div className="mt-6 pt-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Sentiment</p>
          <p className="text-sm font-bold text-secondary">{d.sentiment}</p>
        </div>
      </div>
    </div>
  );
}
