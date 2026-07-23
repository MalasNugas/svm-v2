## Tujuan

Menambahkan 324 baris dari `data_annotasi.xlsx` (kolom `label` semuanya kosong) ke tabel `tweets`, dengan sentimen di-auto-label pakai model SVM yang dilatih dari 70 baris train yang sudah ada. Dataset 100 baris berlabel lama **tidak diubah** — 324 baris baru ini murni tambahan untuk keperluan prediksi/analitik.

## Langkah

1. **Latih model SVM sementara di sandbox** menggunakan 70 baris `split='train'` dari DB (TF-IDF 1–2 gram + `LinearSVC` calibrated, sama persis dengan pipeline `server/python/train.py` biar konsisten dengan hasil training di server).
2. **Prediksi 324 baris baru** → hasilkan `predicted_sentiment` + `confidence` (0–1).
3. **Insert ke tabel `tweets`** via insert tool, per baris:
   - `id` = `gen_random_uuid()`
   - `text` = tweet asli
   - `processed_text` = tweet asli (tidak ada kolom "Tempat wisata" di file ini)
   - `source` = `'instagram'`
   - `actual_sentiment` = `NULL` (belum divalidasi manusia)
   - `sentiment` = hasil prediksi (agar muncul di Dashboard/Reports)
   - `predicted_sentiment` = hasil prediksi
   - `confidence` = confidence model
   - `split` = `NULL` (tidak ikut train/test split, jadi tidak mengubah metrik akurasi)
   - `labeled_at` = `now()`

## Detail Teknis

- Model dilatih ulang dari data DB terkini biar prediksi mencerminkan state sekarang; artifact model tidak disimpan (auto-label satu kali).
- Karena `split=NULL`, ke-324 baris ini **tidak** masuk perhitungan akurasi/precision/recall di `/reports` maupun `/training` — hanya ikut menambah stats sentimen di Dashboard & Word Cloud.
- Distribusi kelas prediksi akan dilaporkan setelah eksekusi.

## Yang Tidak Berubah

- 100 baris lama (70 train / 30 test) tetap utuh, `TEST_RATIO` tetap 0.3, semua halaman UI, RLS, dan komponen lain.
