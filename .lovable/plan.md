## Tujuan

Mengganti pendekatan "import 197 hasil SVM jadi" menjadi alur **train/test split asli** di website: import 984 baris dari `Analisis-Sentimen-Pariwisata-NTT.xlsx`, lalu sistem membagi otomatis menjadi train (~787) dan test (~197), melatih model, memprediksi data test, dan menampilkan hasilnya.

## Struktur file 984 baris

Kolom yang terdeteksi:
- `full_text` — tweet asli
- `cleaning`, `case_folding`, `hasil_normalisasi`, `tokenize`, `stopword removal`, `steming_data` — tahap preprocessing
- `Sentiment Label` — kosong semua (akan diisi prediksi model)
- `Validasi Label` — ground truth: **Positif 482, Netral 412, Negatif 90** (total 984)

Fitur yang akan dipakai untuk pelatihan: `steming_data` (sudah bersih + stemmed).

## Yang akan dilakukan

### 1. Migration: ubah skema `tweets`

Tambah kolom:
- `processed_text text` — hasil `steming_data` (input fitur model)
- `split text` — `'train'` | `'test'` | `null`
- `predicted_sentiment text` — hasil prediksi model (untuk baris test)
- (kolom `actual_sentiment` & `sentiment` yang sudah ada tetap dipakai)

Mapping akhir untuk tiap baris:
- `text` ← `full_text`
- `processed_text` ← `steming_data`
- `actual_sentiment` ← `Validasi Label` (Positif/Netral/Negatif → positive/neutral/negative)
- `sentiment` ← null awalnya; diisi `predicted_sentiment` hanya untuk baris test setelah training
- `split` ← diisi oleh proses split (langkah 3)

### 2. Reset data dan import 984 baris

`DELETE FROM tweets`, lalu insert 984 baris dari `Analisis-Sentimen-Pariwisata-NTT.xlsx` dengan `split = null`, `sentiment = null`, `actual_sentiment` terisi dari Validasi Label.

### 3. Halaman baru: **Model Training** (`/training`, admin only)

Berisi 3 tombol:

**(a) Stratified Split 80/20**
- Ambil semua baris, kelompokkan per `actual_sentiment`
- Acak per kelas dengan seed tetap, ambil 80% pertama → `train`, 20% sisa → `test`
- Hasil perkiraan: train ~787, test ~197 (Positif 96, Netral 82, Negatif 18 di test — sebanding dengan file referensi Anda)
- Update kolom `split` di DB

**(b) Train & Predict**
- Jalan di edge function (`train-model`) supaya cepat dan tidak bebani browser
- Algoritma: **TF-IDF + Multinomial Naive Bayes** (implementasi murni TypeScript, tanpa dependency tambahan). Catatan: implementasi SVM multikelas dari nol di Deno cukup berat; NB memberi baseline yang reasonable dan bisa diganti ke logistic regression nanti. Jika Anda ingin SVM persis, itu memerlukan backend Express terpisah (di luar scope sekali jalan ini).
- Latih di 787 baris train, prediksi 197 baris test, tulis hasil ke `tweets.sentiment` + `tweets.predicted_sentiment` + `tweets.confidence`

**(c) Reset split**
- Set `split`, `sentiment`, `predicted_sentiment`, `confidence` kembali ke null

UI menampilkan ringkasan: jumlah train/test per kelas, status terakhir, dan tombol untuk lihat hasil di Reports.

### 4. Update `fetchModelMetrics` di `src/lib/api.ts`

- Hitung confusion matrix dari baris dengan `split = 'test'` saja (197 baris)
- Baris matrix = `actual_sentiment`, kolom = `sentiment` (prediksi)
- Accuracy, precision, recall, F1, support — sama seperti sekarang tapi dibatasi pada test set

### 5. Halaman Dataset

- Tambah filter dropdown: All / Train / Test (filter `split`)
- Tambah kolom kecil "Split" di tabel
- Selain itu tidak berubah

### 6. Halaman Dashboard

- Total tetap 984, ditambah ringkasan "Train: 787 · Test: 197 · Predicted: 197"
- Distribusi sentimen pakai `actual_sentiment` (kalau ada) supaya tetap konsisten

## File yang diubah

- Migration baru: tambah kolom `processed_text`, `split`, `predicted_sentiment` di `tweets`; reset isi tabel
- `supabase/functions/train-model/index.ts` (baru): TF-IDF + Multinomial NB train & predict
- `src/pages/Training.tsx` (baru) + route di `src/App.tsx`
- `src/components/AppShell.tsx`: tambah link sidebar "Model Training" (admin)
- `src/lib/api.ts`: filter `fetchModelMetrics` ke `split = 'test'`; tambah `runSplit()`, `runTraining()`, `resetSplit()`
- `src/pages/Dataset.tsx`: tambah filter split + kolom split
- `src/pages/Dashboard.tsx`: tampilkan ringkasan split

## Catatan & batasan

- **Bukan SVM persis** seperti file `hasil_prediksi_Data_Testing.xlsx`. File itu hasil model SVM Anda di luar website. Plan ini melatih model **Naive Bayes** sendiri, jadi angka akurasi tidak akan persis sama dengan file Excel itu — tapi alur train/test split-nya nyata dan dataset-nya identik.
- Kalau Anda mau hasil **persis sama dengan file SVM**, opsinya: jalankan SVM di backend Express (yang sudah saya generate) dan kirim prediksinya ke Lovable Cloud — itu request terpisah.
- Seed split tetap (deterministik) supaya hasil reproducible.

## Di luar scope

- Implementasi SVM asli di edge function
- Hyperparameter tuning / cross-validation
- Mengubah halaman Analysis (tetap pakai Gemini)
