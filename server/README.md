# Sentiment SVM Server (Express + SQLite + Python scikit-learn)

Backend khusus untuk pipeline training/prediksi SVM. Frontend Lovable memanggil endpoint di sini lalu menampilkan hasilnya.

## Arsitektur singkat

```
Frontend (Lovable React)
        │   fetch (JWT Supabase)
        ▼
Express  ──spawn──►  python (scikit-learn LinearSVC + TF-IDF)
   │
   └── SQLite (data/app.db)  ← cache dataset + history training
```

Auth tetap pakai Supabase: setiap request harus membawa `Authorization: Bearer <supabase_jwt>` — server memverifikasinya via `supabase.auth.getUser`. Endpoint mutasi mewajibkan role `admin` (dibaca dari tabel `user_roles`).

## Setup lokal (langkah demi langkah)

Prasyarat: Node 20+, Python 3.10+, pip.

**1. Ambil service role key dari Lovable Cloud**

- Buka project di Lovable → klik tombol **Backend** (kanan atas editor).
- Pilih **Project Settings → API Keys**.
- Copy nilai `service_role` (panjang, diawali `eyJ...`). **Jangan share / commit.**

**2. Setup folder server**

```bash
cd server
cp .env.example .env
# Buka .env di editor, paste service_role key di baris SUPABASE_SERVICE_ROLE_KEY=
npm install
pip3 install -r python/requirements.txt
```

**3. Verifikasi koneksi ke Supabase**

```bash
npm run check
```

Output yang benar: `✅ Koneksi OK. Jumlah baris di tabel 'tweets': 984`.
Kalau muncul error, cek lagi nilai `SUPABASE_SERVICE_ROLE_KEY` di `server/.env`.

**4. Jalankan server**

```bash
npm run dev    # http://localhost:3001
```

**5. Hubungkan frontend**

Di **root project Lovable** (bukan di `server/`), buat file `.env.local`:

```
VITE_API_URL=http://localhost:3001
```

Lalu jalankan frontend lokal: `bun dev`. Tombol **Train SVM (Python)** di halaman `/training` sekarang akan memanggil server Express.

## Pemakaian (dari frontend)

1. Login sebagai admin → buka `/training`.
2. Klik **Sync Dataset → Express** (memanggil `POST /dataset/sync` → 984 baris dari Supabase masuk ke SQLite lokal).
3. Klik **Train SVM (Python)** (`POST /train`) → stratified split 80/20, fit LinearSVC + TF-IDF, simpan `data/models/svm.joblib`, tulis kolom `split` & `predicted_sentiment` & `confidence` ke SQLite **dan** sync balik ke Supabase. Output: akurasi, macro-F1, confusion matrix.
4. Halaman Analysis bisa pakai `POST /predict` (single text) jika `VITE_API_URL` diatur — kalau tidak, fallback ke Gemini.

## Endpoint

| Method | Path | Akses |
|---|---|---|
| GET  | `/health` | publik |
| POST | `/dataset/sync` | admin |
| GET  | `/dataset/stats` | authenticated |
| POST | `/train` | admin |
| POST | `/predict` | authenticated |
| GET  | `/metrics` | authenticated |
| GET  | `/metrics/test-results` | authenticated |
| GET  | `/metrics/runs` | authenticated |

## Konfigurasi frontend

Tambahkan ke `.env` project Lovable (file di root, bukan di `server/`):

```
VITE_API_URL=http://localhost:3001
```

Tanpa variabel ini, frontend tetap jalan pakai Naive Bayes JS lama (fallback).

## Deploy ke Railway

1. Push folder `server/` ke repo Git.
2. Railway → New Project → Deploy from Repo → pilih subfolder `server`.
3. Build pakai `Dockerfile` (otomatis terdeteksi).
4. Tambahkan **Volume** mount ke `/app/data` agar SQLite + model persisten.
5. Set env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS=https://<frontend-anda>`.
6. Update `VITE_API_URL` di frontend Lovable ke URL Railway, lalu re-publish.

## Troubleshooting

- `python3: command not found` → set `PYTHON_BIN=python` di `.env`.
- `model belum dilatih` saat `/predict` → jalankan `/dataset/sync` lalu `/train` dulu.
- `admin role required` → user belum punya entry `role='admin'` di tabel `user_roles`.
- CORS error → tambahkan origin frontend ke `ALLOWED_ORIGINS`.
