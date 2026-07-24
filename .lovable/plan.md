## Tujuan
Hapus semua data di tabel `tweets`, lalu isi ulang dengan gabungan dua file baru dan bagi 70/30 stratified.

## Sumber data
1. **Analisis-Sentimen-Pariwisata-NTT-2.xlsx** — 984 baris Twitter. Label = `Validasi Label` bila terisi, fallback ke `Sentiment Label`. Baris tanpa kedua label dibuang. `processed_text` = kolom `steming_data` (fallback `stopword removal` → `full_text`). `source = 'twitter'`.
2. **Dataset_Instagram_Pariwisata_NTT-2.xlsx** — 100 baris valid (skip padding awal). `processed_text` = `[Tempat wisata] Full_text`. `source = 'instagram'`.

Mapping label: `Positif→positive`, `Netral→neutral`, `Negatif→negative`.

## Langkah
1. Baca & bersihkan kedua file di sandbox (pandas), gabungkan jadi satu list baris berlabel.
2. Stratified split 70/30 per kelas dengan `random.seed(42)` — konsisten dengan `TEST_RATIO=0.3` di `src/lib/api.ts` (sudah 0.3, tidak diubah).
3. Jalankan `DELETE FROM tweets` via insert tool untuk mengosongkan tabel.
4. Insert baris baru via insert tool berbatch (~400/statement) dengan kolom: `text, source, processed_text, actual_sentiment, split`. Baris train: `predicted_sentiment=NULL, confidence=NULL`. Baris test: kosong dulu — user tinggal klik **Train SVM** di `/training` untuk mengisi prediksi.
5. Verifikasi jumlah akhir per split & per kelas via `psql SELECT`.

## Catatan
- Tidak ada perubahan skema, kode UI, atau file lain — murni operasi data.
- Metrik di `/reports` akan kosong sampai admin menekan Train SVM (karena `predicted_sentiment` belum ada di test set).
