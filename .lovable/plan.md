
## Tujuan
Menyamakan tampilan website (Dashboard, Reports, Training, Dataset) dengan isi file `hasil_prediksi_Data_Testing.xlsx`:
- Total dataset: **984** baris (dari `Analisis-Sentimen-Pariwisata-NTT.xlsx`)
- Split: **80% train (787) / 20% test (197)**
- 197 baris test = persis 197 baris di file prediksi, lengkap dengan `Prediksi SVM` & `Confidence Score`
- Akurasi yang muncul di Reports otomatis jadi **~71.07%** karena dihitung dari kolom test

## Apa yang diubah
Hanya **data di tabel `tweets`** (Lovable Cloud). Tidak ada perubahan UI / logic frontend — semua halaman membaca dari kolom yang sama (`split`, `actual_sentiment`, `sentiment`, `predicted_sentiment`, `confidence`), jadi begitu data benar, angka di web otomatis cocok.

## Langkah teknis

1. **Pra-proses kedua xlsx di sandbox** (script Python sekali pakai, tidak masuk repo):
   - Baca 984 baris: `full_text` → kolom `text`, `steming_data` → `processed_text`, `Validasi Label` → `actual_sentiment` (Positif/Netral/Negatif → positive/neutral/negative).
   - Match 197 baris file prediksi via `Teks == steming_data`. Tandai `split='test'`, isi `predicted_sentiment` + `sentiment` dari `Prediksi SVM`, `confidence` dari `Confidence Score`, `labeled_at = now()`.
   - 787 baris sisanya: `split='train'`, `sentiment=NULL`, `predicted_sentiment=NULL`, `confidence=NULL`.
   - Generate SQL `TRUNCATE` + multi-row `INSERT` (dibagi beberapa batch ~500/insert).

2. **Jalankan via Supabase migration** (1 migration besar):
   - `TRUNCATE public.tweets;`
   - Batch `INSERT INTO public.tweets (id, text, processed_text, actual_sentiment, split, sentiment, predicted_sentiment, confidence, source, created_at, labeled_at) VALUES …`
   - Tidak ubah skema, tidak ubah RLS.

3. **Verifikasi**
   - Query: `SELECT split, COUNT(*) FROM tweets GROUP BY split;` → harus 787 train, 197 test.
   - Query akurasi: `SELECT AVG((sentiment = actual_sentiment)::int) FROM tweets WHERE split='test';` → ~0.7107.
   - Buka preview `/reports` dan `/dashboard` untuk konfirmasi visual.

## Catatan
- Jika ada baris di file prediksi yang `Teks`-nya tidak ketemu di file utama (kemungkinan kecil — sama-sama dari `steming_data`), saya akan laporkan jumlahnya. Default: tetap masukkan sebagai baris baru bila perlu agar 197 test utuh.
- Backend Express lokal (`server/`) tidak dipakai untuk seeding ini — semua langsung ke Lovable Cloud lewat migration, jadi user tidak perlu jalankan apa-apa di local.
- Setelah seed, **jangan tekan tombol "Train SVM" / "Run Split"** di halaman Training karena itu akan menimpa angka ini dengan training baru. Saya bisa juga sembunyikan tombol tsb kalau Anda mau (opsional, beritahu saja).

Apakah saya lanjut implementasi?
