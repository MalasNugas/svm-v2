## Goal
Add the 15 destinations from `List_wisata_di_ntt.pdf` to the Tourism page, using the same card style, image treatment, and description structure as the 5 existing destinations.

## Destinations to add (grouped as in the PDF)

**Kepulauan Komodo & Flores:** Pulau Rinca, Pulau Taka Makassar, Manta Point, Gua Rangko, Taman Laut 17 Pulau Riung

**Sumba & sekitarnya:** Pantai Walakiri, Pantai Nihiwatu, Air Terjun Lapopu, Bukit Lendongara, Kampung Adat Ratenggaro

**Timor, Alor & Kupang:** Pantai Oetune, Pantai Kolbano, Pantai Lasiana, Gua Kristal, Taman Laut Alor

## What each new entry gets
Same `Dest` shape already used on the page: name, sentiment score, sentiment label, description (expanded from the PDF one-liner into the analytical tone used by the current cards), location, best time to visit, 4 activities, 4 highlights. A few standout spots (e.g. Manta Point, Pantai Nihiwatu, Taman Laut Alor) get a badge like the existing "Live Data" / "Atmospheric" / "Cultural Heritage" chips.

## Images
Generate one photographic landscape image per new destination in the same style as the existing `dest-*.jpg` assets (natural light, wide scenic framing, 4:3), stored under `src/assets/` and imported the same way.

## Layout
Keep the existing search filter and 3-column grid. Add region section headings (Komodo & Flores / Sumba / Timor, Alor & Kupang) so 20 cards stay scannable; the existing 5 destinations fold into the Komodo & Flores and Flores groups. Search filters across all regions and hides empty sections.

## Technical notes
- Only `src/pages/Tourism.tsx` changes, plus new image assets.
- No database or backend changes; the destination list stays a static array like today.
- Scores/sentiment labels for new entries are illustrative thesis-style values consistent with the existing ones, not model output.
