import { AppShell } from "@/components/AppShell";
import { useState } from "react";
import komodo from "@/assets/dest-komodo.jpg";
import kelimutu from "@/assets/dest-kelimutu.jpg";
import padar from "@/assets/dest-padar.jpg";
import waerebo from "@/assets/dest-waerebo.jpg";
import pinkbeach from "@/assets/dest-pinkbeach.jpg";
import rinca from "@/assets/dest-rinca.jpg";
import takamakassar from "@/assets/dest-takamakassar.jpg";
import mantapoint from "@/assets/dest-mantapoint.jpg";
import guarangko from "@/assets/dest-guarangko.jpg";
import riung from "@/assets/dest-riung.jpg";
import walakiri from "@/assets/dest-walakiri.jpg";
import nihiwatu from "@/assets/dest-nihiwatu.jpg";
import lapopu from "@/assets/dest-lapopu.jpg";
import lendongara from "@/assets/dest-lendongara.jpg";
import ratenggaro from "@/assets/dest-ratenggaro.jpg";
import oetune from "@/assets/dest-oetune.jpg";
import kolbano from "@/assets/dest-kolbano.jpg";
import lasiana from "@/assets/dest-lasiana.jpg";
import guakristal from "@/assets/dest-guakristal.jpg";
import alor from "@/assets/dest-alor.jpg";

type Region = "Kepulauan Komodo & Flores" | "Sumba & Sekitarnya" | "Timor, Alor & Kupang";

interface Dest {
  name: string;
  score: number;
  desc: string;
  sentiment: string;
  img: string;
  badge?: string;
  badgeTone?: "live" | "atmos" | "culture";
  variant?: "card" | "wide";
  region: Region;
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
    region: "Kepulauan Komodo & Flores",
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
    region: "Kepulauan Komodo & Flores",
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
    region: "Kepulauan Komodo & Flores",
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
    region: "Kepulauan Komodo & Flores",
    desc: "Deeply embedded in the Manggarai mountains, Wae Rebo offers a unique \"Cultural Immersion\" sentiment. Our data shows high emotional scores for authenticity and community warmth despite the physical challenge of access.",
    badge: "Cultural Heritage",
    badgeTone: "culture",
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
    region: "Kepulauan Komodo & Flores",
    desc: "One of the world's few pink sand beaches. Linguistic analysis shows high frequency of \"Surprise\" and \"Joy\" descriptors in visitor feedback.",
    location: "Komodo Island, East Nusa Tenggara",
    bestTime: "April – November",
    activities: ["Snorkeling", "Beach relaxation", "Underwater photography", "Kayaking"],
    highlights: ["Rare pink-hued sand", "Pristine coral gardens", "Turtle sightings", "Crystal-clear turquoise water"],
  },

  // A. Kepulauan Komodo & Flores
  {
    name: "Pulau Rinca",
    score: 90.6,
    img: rinca,
    sentiment: "Adventurous",
    region: "Kepulauan Komodo & Flores",
    desc: "The quieter alternative for observing Komodo dragons in the wild. Sentiment clusters emphasize \"Thrill\" and \"Authenticity\", with visitors praising smaller crowds and closer ranger-guided encounters.",
    badge: "Live Data",
    badgeTone: "live",
    location: "Loh Buaya, Komodo National Park",
    bestTime: "April – November",
    activities: ["Komodo dragon trekking", "Savanna hiking", "Wildlife photography", "Boat tour"],
    highlights: ["Loh Buaya ranger post", "Buffalo & wild deer", "Golden savanna hills", "Mangrove bay panorama"],
  },
  {
    name: "Pulau Taka Makassar",
    score: 92.1,
    img: takamakassar,
    sentiment: "Highly Positive",
    region: "Kepulauan Komodo & Flores",
    desc: "A crescent sandbar rising in the middle of the open sea. Visitor language is dominated by \"Surreal\" and \"Pristine\", with strong positive polarity toward water clarity.",
    location: "Near Manta Point, Komodo National Park",
    bestTime: "April – November",
    activities: ["Sandbar walking", "Snorkeling", "Drone photography", "Island hopping"],
    highlights: ["Emerging white sandbar", "Gradient turquoise water", "Shallow coral gardens", "360° open sea view"],
  },
  {
    name: "Manta Point",
    score: 95.1,
    img: mantapoint,
    sentiment: "Exceptional",
    region: "Kepulauan Komodo & Flores",
    desc: "The premier snorkeling channel for encountering manta rays. Emotion mining reveals the highest \"Excitement\" intensity of any marine site in the corpus.",
    badge: "Live Data",
    badgeTone: "live",
    location: "Karang Makassar, Komodo National Park",
    bestTime: "December – February (peak manta season)",
    activities: ["Snorkeling with mantas", "Scuba diving", "Underwater photography", "Drift swimming"],
    highlights: ["Manta ray cleaning station", "Strong nutrient currents", "Sea turtle sightings", "Reef fish diversity"],
  },
  {
    name: "Gua Rangko",
    score: 88.7,
    img: guarangko,
    sentiment: "Ethereal",
    region: "Kepulauan Komodo & Flores",
    desc: "A hidden saltwater cave with a translucent bathing pool. Sentiment terms cluster around \"Magical\" and \"Hidden Gem\", with mild negative polarity on access difficulty.",
    badge: "Atmospheric",
    badgeTone: "atmos",
    location: "Rangko Village, Labuan Bajo, West Manggarai",
    bestTime: "May – October (midday light)",
    activities: ["Cave swimming", "Boat trip", "Light-beam photography", "Village visit"],
    highlights: ["Crystalline saltwater pool", "Sunbeam through cave ceiling", "Stalactite formations", "Traditional boat access"],
  },
  {
    name: "Taman Laut 17 Pulau Riung",
    score: 87.9,
    img: riung,
    sentiment: "Vibrant",
    region: "Kepulauan Komodo & Flores",
    desc: "A cluster of small islands guarding rich underwater life. Feedback shows steady positive sentiment on marine biodiversity and value for money.",
    location: "Riung, Ngada Regency, Flores",
    bestTime: "April – October",
    activities: ["Island hopping", "Snorkeling", "Bat-watching at dusk", "Beach camping"],
    highlights: ["17 protected islets", "Healthy coral reef", "Flying fox colony", "Calm turquoise bays"],
  },

  // B. Sumba & Sekitarnya
  {
    name: "Pantai Walakiri",
    score: 93.4,
    img: walakiri,
    sentiment: "Highly Positive",
    region: "Sumba & Sekitarnya",
    desc: "Known for its \"dancing\" mangrove silhouettes at sunset. Linguistic analysis records a dense concentration of \"Romantic\" and \"Peaceful\" descriptors.",
    badge: "Atmospheric",
    badgeTone: "atmos",
    location: "Watumbaka, East Sumba",
    bestTime: "June – September",
    activities: ["Sunset photography", "Shallow-water walking", "Beach picnic", "Stargazing"],
    highlights: ["Dancing mangrove trees", "Mirror-like tidal flats", "Golden hour reflections", "Calm swimmable shallows"],
  },
  {
    name: "Pantai Nihiwatu",
    score: 96.3,
    img: nihiwatu,
    sentiment: "Exceptional",
    region: "Sumba & Sekitarnya",
    desc: "A world-class private beach repeatedly framed as \"exclusive\" and \"untouched\". Sentiment scoring is the highest among Sumba coastal sites, with cost cited as the only negative term.",
    badge: "Live Data",
    badgeTone: "live",
    location: "Hobawawi, West Sumba",
    bestTime: "May – October",
    activities: ["Surfing", "Horseback riding on sand", "Spa retreat", "Sunset watching"],
    highlights: ["Legendary \"God's Left\" wave", "Private resort coastline", "Green cliff backdrop", "Uncrowded white sand"],
  },
  {
    name: "Air Terjun Lapopu",
    score: 89.1,
    img: lapopu,
    sentiment: "Refreshing",
    region: "Sumba & Sekitarnya",
    desc: "A tiered waterfall inside Manupeu Tanah Daru National Park. Visitor sentiment highlights \"Freshness\" and \"Serenity\" with consistently positive polarity.",
    location: "Manupeu Tanah Daru National Park, West Sumba",
    bestTime: "November – April (peak flow)",
    activities: ["Swimming", "Forest trekking", "Bird watching", "Long-exposure photography"],
    highlights: ["Multi-tier limestone cascade", "Clear emerald plunge pool", "Protected rainforest", "Endemic Sumba birdlife"],
  },
  {
    name: "Bukit Lendongara",
    score: 90.8,
    img: lendongara,
    sentiment: "Ethereal",
    region: "Sumba & Sekitarnya",
    desc: "Wide rolling grasslands often described as \"Sumba's green desert\". Sentiment vectors align strongly with \"Freedom\" and \"Openness\".",
    location: "Waikabubak, West Sumba",
    bestTime: "February – May (greenest season)",
    activities: ["Hill trekking", "Sunrise viewing", "Landscape photography", "Picnicking"],
    highlights: ["Endless green savanna", "Layered hill ridges", "Wild horse sightings", "Unobstructed sunset panorama"],
  },
  {
    name: "Kampung Adat Ratenggaro",
    score: 91.9,
    img: ratenggaro,
    sentiment: "Cultural Heritage",
    region: "Sumba & Sekitarnya",
    desc: "A seaside traditional village of towering thatched roofs and megalithic graves. Emotional scoring is dominated by \"Respect\" and \"Cultural Pride\".",
    badge: "Cultural Heritage",
    badgeTone: "culture",
    location: "Umbu Ngedo, Southwest Sumba",
    bestTime: "March – October",
    activities: ["Cultural tour", "Megalith viewing", "Weaving demonstration", "Beachside photography"],
    highlights: ["Highest traditional roofs in Sumba", "Ancient stone graves", "Marapu belief tradition", "Direct beachfront setting"],
  },

  // C. Timor, Alor & Kupang
  {
    name: "Pantai Oetune",
    score: 88.2,
    img: oetune,
    sentiment: "Vibrant",
    region: "Timor, Alor & Kupang",
    desc: "A coastal desert of white dunes meeting the sea. Reviews cluster on \"Unique\" and \"Photogenic\", with heat frequently mentioned as a mild negative.",
    location: "Tuafanu, South Central Timor",
    bestTime: "May – September",
    activities: ["Sandboarding", "Dune walking", "Beach photography", "Camping"],
    highlights: ["White sand dunes", "Wind-shaped pandan trees", "Long open shoreline", "Desert-meets-ocean scenery"],
  },
  {
    name: "Pantai Kolbano",
    score: 86.5,
    img: kolbano,
    sentiment: "Vibrant",
    region: "Timor, Alor & Kupang",
    desc: "A shoreline paved with smooth multicolored stones. Sentiment mining shows recurring \"Unusual\" and \"Calming\" descriptors alongside strong color imagery.",
    location: "Kolbano, South Central Timor",
    bestTime: "April – October",
    activities: ["Stone collecting walk", "Swimming", "Rock photography", "Sunrise viewing"],
    highlights: ["Colorful polished pebbles", "Iconic Batu Nona rock", "Clear turquoise waves", "Wide open bay"],
  },
  {
    name: "Pantai Lasiana",
    score: 83.7,
    img: lasiana,
    sentiment: "Positive",
    region: "Timor, Alor & Kupang",
    desc: "The most accessible family beach near Kupang. Sentiment is broadly positive on atmosphere and local food, with cleanliness the leading critical topic.",
    location: "Lasiana, Kupang City",
    bestTime: "Year-round",
    activities: ["Family beach day", "Local culinary tasting", "Sunset walking", "Weekend gathering"],
    highlights: ["Lontar palm groves", "White sand shoreline", "Traditional food stalls", "Easy city access"],
  },
  {
    name: "Gua Kristal",
    score: 90.2,
    img: guakristal,
    sentiment: "Ethereal",
    region: "Timor, Alor & Kupang",
    desc: "A limestone cave holding an exceptionally clear freshwater pool. \"Crystal\" and \"Surreal\" dominate the term frequency, with narrow access noted as a constraint.",
    badge: "Atmospheric",
    badgeTone: "atmos",
    location: "Bolok, Kupang Regency",
    bestTime: "Year-round (midday light)",
    activities: ["Cave swimming", "Freediving", "Cave photography", "Guided exploration"],
    highlights: ["Transparent freshwater pool", "Stalactite ceiling", "Natural skylight beam", "Cool underground climate"],
  },
  {
    name: "Taman Laut Alor",
    score: 95.8,
    img: alor,
    sentiment: "Exceptional",
    region: "Timor, Alor & Kupang",
    desc: "Rated among the world's finest dive destinations. Analysis returns the strongest \"World-class\" and \"Biodiversity\" signal in the entire NTT corpus.",
    badge: "Live Data",
    badgeTone: "live",
    location: "Alor Archipelago, East Nusa Tenggara",
    bestTime: "April – November",
    activities: ["Scuba diving", "Muck diving", "Snorkeling", "Marine photography"],
    highlights: ["Over 40 world-class dive sites", "Dense pristine coral reef", "Rare macro marine species", "Dolphin & whale passages"],
  },
];

const regionOrder: Region[] = [
  "Kepulauan Komodo & Flores",
  "Sumba & Sekitarnya",
  "Timor, Alor & Kupang",
];

export default function Tourism() {
  const [q, setQ] = useState("");
  const filtered = destinations.filter((d) =>
    (d.name + " " + d.desc + " " + d.sentiment + " " + d.location + " " + d.region)
      .toLowerCase()
      .includes(q.toLowerCase())
  );
  return (
    <AppShell searchPlaceholder="Search destinations..." searchValue={q} onSearchChange={setQ}>
      <section className="max-w-[1400px]">
        <div className="flex items-center gap-3 text-secondary text-[11px] tracking-[0.25em] uppercase font-bold">
          <span className="w-8 h-px bg-secondary" /> Thesis Case Study
        </div>
        <h1 className="mt-4 font-headline text-5xl font-extrabold text-primary tracking-tight leading-tight">
          Sentiment Landscape of<br />NTT Tourism
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl">
          Quantitative analysis of emotional resonance across major natural landmarks. This visual index correlates geographic data with real-time visitor sentiment metrics.
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground/70">
          {destinations.length} destinations indexed · build {BUILD_MARKER}
        </p>


        {filtered.length === 0 && (
          <p className="mt-10 text-muted-foreground">No destinations match "{q}".</p>
        )}

        {regionOrder.map((region) => {
          const items = filtered.filter((d) => d.region === region);
          if (items.length === 0) return null;
          return (
            <div key={region} className="mt-12">
              <div className="flex items-center gap-4">
                <h2 className="font-headline text-2xl font-bold text-primary">{region}</h2>
                <span className="text-xs font-bold text-secondary bg-secondary-container/50 px-2 py-1 rounded-md">
                  {items.length}
                </span>
                <span className="flex-1 h-px bg-border" />
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((d) => (
                  <DestCard key={d.name} d={d} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}

function DestCard({ d }: { d: Dest }) {
  return (
    <div className="bg-surface-lowest rounded-2xl overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={d.img} alt={d.name} loading="lazy" width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span>
          {d.location}
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
        <div className="mt-6 pt-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Sentiment</p>
          <p className="text-sm font-bold text-secondary">{d.sentiment}</p>
        </div>
      </div>
    </div>
  );
}
