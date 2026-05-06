# Setup Lovable Cloud + Import Dataset Tweet Flores

## Tujuan
Menjalankan website end-to-end pakai Lovable Cloud sebagai backend sementara, supaya bisa testing alur (login, dataset, analisis, dashboard) sebelum nanti di-port ke Express.js milik Anda.

## Catatan Penting tentang Data
File `data_annotasi.xlsx` berisi **324 tweet** tapi semua kolom `label` kosong (data scraping mentah, belum ada sentimen positif/negatif/netral). Jadi kita perlu cara untuk menambahkan label.

---

## Langkah Implementasi

### 1. Aktifkan Lovable Cloud
Akan otomatis menyediakan: PostgreSQL database, Auth (email/password), dan Edge Functions — tanpa setup eksternal.

### 2. Buat Skema Database
Tiga tabel utama:
- **`tweets`** — `id`, `text`, `source` (default: 'twitter'), `sentiment` (positive/neutral/negative/null), `confidence`, `created_at`
- **`profiles`** — info user (nama, role) auto-created saat signup
- **`user_roles`** — tabel role terpisah (admin/researcher) sesuai best practice keamanan

RLS policies: semua user login bisa baca dataset; hanya admin yang bisa insert/update.

### 3. Import Data Tweet
Parse 324 baris dari xlsx → insert ke tabel `tweets` dengan `sentiment = null` (belum dilabel).

### 4. Auto-Labeling pakai Lovable AI (Gratis hingga 6 Okt 2025)
Buat edge function `analyze-sentiment` yang pakai Gemini untuk klasifikasi sentimen tweet bahasa Indonesia (positive/neutral/negative). Bisa dipakai untuk:
- Halaman **Analysis** — user paste teks → dapat hasil sentimen real-time
- Tombol "Auto-label dataset" — proses semua tweet kosong sekaligus

### 5. Hubungkan UI ke Cloud
Refactor `src/lib/api.ts` jadi pakai Supabase client (gantikan stub Express). Update halaman:
- **Login** — auth email/password real
- **Dataset** — tampilkan 324 tweet dari DB, dengan filter sentimen + pagination
- **Dashboard** — stats real (total tweet, distribusi sentimen, top destinasi via keyword)
- **Analysis** — input teks → call edge function → tampilkan hasil

### 6. Migrasi ke Express Nanti
Karena `src/lib/api.ts` sudah jadi single point of API, nanti Anda tinggal ganti implementasi-nya untuk hit Express endpoint Anda. Skema tabel yang dipakai di Cloud bisa dipakai sebagai blueprint untuk skema Postgres/MySQL Express Anda.

---

## Detail Teknis

**Edge function `analyze-sentiment`:**
- Pakai `LOVABLE_API_KEY` (auto-tersedia) → call `ai.gateway.lovable.dev` dengan model `google/gemini-2.5-flash`
- Prompt structured output: return JSON `{ sentiment: 'positive'|'neutral'|'negative', confidence: 0-1 }`
- Mode batch (untuk auto-label dataset) dan single (untuk halaman Analysis)

**Komponen baru:**
- `src/integrations/supabase/client.ts` (auto-generated saat enable Cloud)
- `supabase/functions/analyze-sentiment/index.ts`
- Hook `useAuth()` untuk session management

**Yang tidak berubah:**
- Semua design tokens, AppShell, halaman Tourism, About, Index — visual tetap identik
- Setelah deploy ke Express, cukup ganti `BASE_URL` + auth strategy di `src/lib/api.ts`

---

## Yang Perlu Konfirmasi Anda
1. Setuju **auto-label 324 tweet pakai AI Gemini** (gratis sampai 6 Okt 2025)? Atau mau Anda label manual via UI?
2. Auth pakai **email/password saja**, atau tambah Google sign-in?
