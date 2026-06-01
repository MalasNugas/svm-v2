
# Migrasi ML Training ke Express.js + Python SVM

Cakupan terbatas: **hanya pipeline training/prediksi** yang dipindah. Auth, dataset CRUD, dan dashboard tetap di Lovable Cloud (Supabase) supaya skripsi tidak ikut bergeser. Sisi Lovable hanya berubah: tombol Train & Predict memanggil API Express, lalu menyimpan hasil prediksi balik ke tabel `tweets`.

## Arsitektur

```text
[ React (Lovable) ]  --auth & data CRUD-->  [ Supabase / Lovable Cloud ]
        |
        |  POST /train, /predict  (JSON)
        v
[ Express server (Node) ]  --spawn-->  [ Python: scikit-learn SVM ]
        |
        +--cache model & dataset di SQLite (server/data/app.db)
```

- **Express + SQLite**: menyimpan dataset training/test, model terlatih (joblib path), riwayat training, metrik.
- **Python SVM**: `TfidfVectorizer` + `LinearSVC` (atau `SVC(kernel='linear')`) — sama persis pola yang menghasilkan `hasil_prediksi_Data_Testing.xlsx`.
- **Sumber data**: Express menarik 984 baris dari Supabase sekali (atau menerima dump dari frontend), simpan ke SQLite lokal supaya training offline.

## Saran hosting (jawaban "belum tahu")

Untuk skripsi, urutan rekomendasi:

1. **Lokal (`localhost:3001`)** saat demo sidang — paling stabil, Python+sklearn jalan natif, tidak ada cold-start. Frontend Lovable bisa memanggilnya via `VITE_API_URL=http://localhost:3001` di dev.
2. **Railway** — gratis $5/bulan, support Node + Python via Nixpacks, persisten SQLite via volume. Cocok kalau ingin demo online.
3. **Render** free tier — bisa, tapi cold start ~30s dan SQLite hilang saat re-deploy (kecuali pakai disk berbayar).
4. **Fly.io** — gratis, persisten volume untuk SQLite, butuh sedikit setup Dockerfile.

Default plan ini: **siapkan untuk lokal dulu, plus `Dockerfile` siap-pakai Railway**.

## Struktur folder baru

```text
server/
  package.json
  src/
    index.ts          # Express app, CORS, routes
    db.ts             # better-sqlite3 init + schema
    auth.ts           # middleware verifikasi JWT Supabase (pakai SUPABASE_JWKS)
    routes/
      dataset.ts      # POST /dataset/sync  (tarik dari Supabase, simpan ke SQLite)
      train.ts        # POST /train         (split + spawn python train.py)
      predict.ts      # POST /predict       (single text → label)
      metrics.ts      # GET  /metrics       (akurasi, F1, confusion matrix)
  python/
    train.py          # stratified split + TF-IDF + LinearSVC + dump joblib + tulis hasil ke SQLite
    predict.py        # load joblib + predict 1 teks (stdin/argv → stdout JSON)
    requirements.txt  # scikit-learn, pandas, joblib, sastrawi (opsional stemming)
  data/
    app.db            # SQLite (auto-created)
    models/svm.joblib # model tersimpan
  Dockerfile          # node:20 + python3 + pip install
  README.md           # cara run lokal & deploy Railway
```

## Skema SQLite (di Express)

```sql
CREATE TABLE tweets (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  processed_text TEXT,
  actual_sentiment TEXT,   -- positive/neutral/negative
  split TEXT,              -- train/test/null
  predicted_sentiment TEXT,
  confidence REAL
);
CREATE TABLE training_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  algo TEXT,
  accuracy REAL,
  macro_f1 REAL,
  confusion_json TEXT
);
```

## Endpoint Express

| Method | Path | Fungsi |
|---|---|---|
| POST | `/dataset/sync` | Tarik 984 baris dari Supabase REST (service-role key di env server) → upsert ke SQLite |
| POST | `/train` | Stratified split 80/20 (seed 42) → spawn `python train.py` → simpan model + metrik |
| GET  | `/metrics` | Akurasi, macro-F1, confusion matrix dari training_runs terbaru |
| POST | `/predict` | `{text}` → `{sentiment, confidence}` via `python predict.py` |
| GET  | `/test-results` | 197 baris test + actual vs predicted (untuk halaman Reports) |

Semua endpoint memerlukan header `Authorization: Bearer <supabase_jwt>`; middleware verifikasi via JWKS. Hanya role `admin` boleh akses `/train` & `/dataset/sync`.

## Perubahan di project Lovable (frontend)

- Tambah `VITE_API_URL` di `.env` (default `http://localhost:3001`).
- File baru `src/lib/expressApi.ts` — wrapper `fetch` dengan auto-attach JWT dari `supabase.auth.getSession()`.
- `src/pages/Training.tsx`:
  - Tombol **Sync Dataset → Express** (panggil `/dataset/sync`).
  - Tombol **Train SVM (Python)** (panggil `/train`) — ganti pemanggilan `runTraining` lama.
  - Panel hasil baca dari `/metrics`.
- `src/lib/api.ts`: `fetchModelMetrics` bisa toggle sumber (Supabase test rows ATAU Express `/metrics`). Default Express jika `VITE_API_URL` ada.
- `src/pages/Analysis.tsx`: `analyzeSentiment` opsional dialihkan ke `/predict` Express agar hasil konsisten dengan model SVM (bukan Gemini).

Tidak ada perubahan di tabel Supabase. File `src/lib/ml.ts` (Naive Bayes JS) dibiarkan sebagai fallback offline.

## Detail teknis Python

`train.py` membaca SQLite, melakukan:
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
# stratify=y, test_size=0.2, random_state=42
```
Output: `models/svm.joblib` + JSON metrik ke stdout → Express simpan ke `training_runs`.

`predict.py`: load joblib, baca teks dari `argv[1]`, output JSON `{label, confidence}` (confidence = `decision_function` di-softmax atau jarak ke hyperplane di-normalisasi).

## Langkah eksekusi (urutan saat build mode)

1. Buat folder `server/` dengan `package.json` (express, better-sqlite3, jose untuk JWKS, @supabase/supabase-js, cors, dotenv, zod) + `tsx` untuk dev.
2. Tulis `db.ts`, `auth.ts`, semua route, dan `python/train.py` + `predict.py` + `requirements.txt`.
3. Tulis `Dockerfile` (node:20-slim + python3 + pip).
4. Tulis `server/README.md` dengan instruksi:
   - `cd server && npm install && pip install -r python/requirements.txt`
   - Set env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWKS_URL`, `PORT=3001`
   - `npm run dev`
5. Tambah `VITE_API_URL` ke `.env` frontend (placeholder `http://localhost:3001`).
6. Buat `src/lib/expressApi.ts`.
7. Update `src/pages/Training.tsx` + `src/lib/api.ts` agar memanggil Express bila `VITE_API_URL` di-set.
8. Update `src/pages/Reports.tsx` agar tarik confusion matrix dari `/metrics`.

## Catatan penting untuk Anda

- Lovable **tidak menjalankan** folder `server/`; itu murni source code. Anda harus `cd server && npm run dev` di komputer/VPS sendiri.
- Karena `localhost:3001` tidak bisa diakses dari preview Lovable hosted, **pengujian end-to-end paling mulus dilakukan setelah deploy** ke Railway, atau dengan menjalankan frontend juga secara lokal (`bun dev` di project Lovable).
- Auth tetap Supabase, jadi Anda tidak perlu bikin login baru.
- Setelah ini berjalan, tabel `tweets` di Supabase tetap jadi "source of truth"; SQLite hanya cache training.

Setujui plan ini, dan saya akan generate seluruh kode `server/` + patch frontend.
