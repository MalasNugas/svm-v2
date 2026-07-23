## Tujuan

Ganti seluruh isi tabel `tweets` dengan dataset baru dari `Dataset_Instagram_Pariwisata_NTT.xlsx`, lalu buat split train/test 70:30 secara stratified.

## Dataset Baru

File berisi 100 baris berlabel valid (kolom yang dipakai):
- `Full_text` → `text`
- `Validasi Label` → `actual_sentiment` (Positif → positive, Netral → neutral, Negatif → negative)
- `Tempat wisata` → disimpan ke `processed_text` sebagai konteks lokasi (opsional, biar tidak hilang)
- `source` = `instagram`

Distribusi label: Positif 82, Netral 7, Negatif 11.

## Split 70/30 Stratified (deterministik, seed=42)

| Kelas    | Total | Train (70%) | Test (30%) |
|----------|-------|-------------|------------|
| Positive | 82    | 57          | 25         |
| Neutral  | 7     | 5           | 2          |
| Negative | 11    | 8           | 3          |
| **Total**| 100   | 70          | 30         |

## Langkah Eksekusi

1. **Migration** — ubah `TEST_RATIO` di `src/lib/api.ts` dari `0.2` → `0.3` supaya tombol "Stratified Split" di halaman Model Training menghasilkan 70/30 juga di masa depan.
2. **Data change** (via insert tool):
   - `DELETE FROM tweets;` (kosongkan seluruh isi tabel).
   - `INSERT` 100 baris baru dengan `actual_sentiment` terisi, `sentiment`/`predicted_sentiment`/`confidence`/`split` di-`NULL`.
3. **Jalankan split langsung di DB** dengan `UPDATE` deterministik supaya angkanya persis 70/30 tanpa perlu admin buka `/training`:
   - Pakai `ORDER BY md5(id::text)` + `LIMIT` per kelas untuk hasil stabil.
   - Set `split='train'` untuk 57 positive + 5 neutral + 8 negative pertama, sisanya `split='test'`.
4. Metrik prediksi (`sentiment`, `predicted_sentiment`, `confidence`) dibiarkan NULL. Admin bisa klik **"Train SVM"** di `/training` untuk menghasilkan prediksi baru berdasarkan split ini.

## Yang Tidak Berubah

- Skema tabel, RLS, halaman UI, dan komponen Dashboard/Reports/Training — semua sudah membaca ulang dari kolom `split`/`actual_sentiment`/`sentiment`, jadi otomatis update.
- File Excel lama (`hasil_prediksi_Data_Testing.xlsx`) tidak lagi jadi sumber — dataset sepenuhnya diganti.

## Detail Teknis

- Bahasa label di file: "Positif/Netral/Negatif" → dimap ke enum `sentiment` di DB (`positive/neutral/negative`).
- ID baris pakai `gen_random_uuid()`.
- `processed_text` diisi format `"[Tempat wisata] Full_text"` supaya konteks lokasi ikut ke fitur TF-IDF saat training SVM.
