## Tujuan

Menyamakan hasil yang ditampilkan website dengan file `hasil_prediksi_Data_Testing.xlsx` (197 baris, hasil prediksi SVM Anda).

## Isi file Excel

- Kolom: `Teks`, `Label Asli`, `Prediksi SVM`, `Confidence Score`
- Distribusi Prediksi SVM: **Positif 96, Netral 90, Negatif 11** (total 197)
- Distribusi Label Asli: Positif 97, Netral 82, Negatif 18

## Yang akan dilakukan

### 1. Reset tabel `tweets`
Hapus semua baris di tabel `tweets` (DELETE), lalu insert 197 baris dari Excel.

Mapping kolom Excel → kolom DB:
- `Teks` → `text`
- `Prediksi SVM` (Positif/Netral/Negatif) → `sentiment` (positive/neutral/negative)
- `Confidence Score` → `confidence`
- `source` → `"svm-testing"` (penanda dataset SVM Anda)
- `labeled_at` → `now()`
- `created_at` → `now()`

`Label Asli` tidak disimpan karena tabel `tweets` belum punya kolom ground-truth. Untuk fase ini cukup; nanti bisa ditambahkan jika Anda mau menghitung accuracy nyata vs label asli.

### 2. (Opsional, direkomendasikan) Tambah kolom `actual_label`
Tambah kolom `actual_label app_role`-like (text enum) ke tabel `tweets` agar `Label Asli` ikut tersimpan. Ini membuat halaman Dashboard bisa memakai confusion matrix **nyata** (Label Asli vs Prediksi SVM), bukan pseudo-prediction.

→ Apakah perlu? **Ya, saya sertakan** karena tanpa ini Reports/Dashboard masih pakai pseudo confusion matrix dan tidak benar-benar "sama dengan Excel".

Migration:
```sql
ALTER TABLE public.tweets ADD COLUMN actual_sentiment text;
```

### 3. Update `fetchModelMetrics` di `src/lib/api.ts`
Ganti logika pseudo-prediction (yang memakai confidence < 0.7) dengan perhitungan nyata:
- Baris = `actual_sentiment` (Label Asli)
- Kolom = `sentiment` (Prediksi SVM)
- Accuracy, precision, recall, F1, support dihitung dari matrix nyata

Hasilnya: angka di **Reports** dan **Dashboard** (confusion matrix, akurasi, F1) akan persis sesuai file Excel Anda.

### 4. Halaman lain tidak berubah
- Dataset: tetap menampilkan tabel `tweets` (sekarang isinya 197 baris SVM)
- Analysis (single text): tetap pakai Gemini sebagai sandbox — di luar scope request ini
- Top Destinations: otomatis mengikuti dataset baru

## File yang diubah

- Migration baru: tambah kolom `actual_sentiment` di `tweets`
- Data: DELETE FROM tweets, lalu INSERT 197 baris
- `src/lib/api.ts`: rewrite `fetchModelMetrics` agar matrix dihitung dari `actual_sentiment` vs `sentiment`

## Di luar scope

- Mengganti Gemini di halaman Analysis dengan SVM (perlu backend Express Anda)
- Menambah fitur upload Excel langsung dari UI (sekali jalan saja kali ini, dari sisi agent)
- Mengubah RLS atau auth