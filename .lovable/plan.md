
# Sambungkan Server Express ke Supabase (Lovable Cloud)

Tujuannya: server Express (`server/`) bisa **tarik 984 baris dari tabel `tweets`** di Supabase Lovable Cloud ke SQLite lokal, lalu jalankan training SVM Python. Auth user (login admin) juga diverifikasi via Supabase JWT.

Tidak ada perubahan database, tidak ada perubahan frontend logic — hanya konfigurasi & dokumentasi.

## Yang sudah ada

- `server/src/auth.ts` → sudah pakai `supabase.auth.getUser(token)` + cek `user_roles` untuk role `admin`. ✅
- `server/src/routes/dataset.ts` → sudah panggil Supabase REST untuk sync ke SQLite. ✅
- `server/.env.example` → sudah berisi `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`.

Jadi **kode-nya sudah siap**. Yang kurang hanya: nilai `SERVICE_ROLE_KEY` di `server/.env`, dan instruksi yang lebih jelas.

## Yang akan saya kerjakan

1. **Update `server/.env.example`** — isi otomatis `SUPABASE_URL` Lovable Cloud (`https://dajmilnsjeyhfhmjmkxj.supabase.co`) dan `SUPABASE_JWKS_URL`. `SERVICE_ROLE_KEY` tetap placeholder (Anda copy-paste sendiri — alasannya di bawah).

2. **Tambah skrip helper `server/scripts/check-connection.ts`** — script kecil yang ping Supabase pakai env yang ada, dan tampilkan: jumlah baris di `tweets`, berhasil/gagal verifikasi service key. Run via `npm run check`.

3. **Update `server/README.md`** dengan panduan step-by-step **khusus project ini**:
   - Cara ambil `SERVICE_ROLE_KEY` dari Lovable Cloud Backend → Project Settings → API
   - Buat file `server/.env` (copy dari `.env.example`)
   - `npm install` + `pip install -r python/requirements.txt`
   - `npm run check` untuk verifikasi koneksi
   - `npm run dev` untuk jalankan server di `localhost:3001`
   - Set `VITE_API_URL=http://localhost:3001` di project root `.env.local` agar frontend (saat run lokal `bun dev`) pakai Express

4. **Update `package.json` server** — tambah script `"check": "tsx scripts/check-connection.ts"`.

5. **Update file `src/lib/expressApi.ts`** kalau perlu (cek apakah `VITE_API_URL` sudah di-handle dengan benar dan fallback aman saat kosong).

## Catatan penting

**Kenapa SERVICE_ROLE_KEY tidak bisa saya isi otomatis?**
Service role key adalah **secret penuh-akses bypass RLS**. Lovable agent tidak boleh menulisnya ke file repo (akan ter-commit). Anda harus:
1. Buka **Backend** (tombol di kanan atas editor Lovable)
2. Project Settings → API Keys → copy `service_role` key
3. Paste ke `server/.env` di komputer Anda (file ini sudah di-`.gitignore`)

**Kenapa frontend tetap perlu run lokal?**
Karena server Express jalan di `localhost:3001`, preview Lovable yang di-host tidak bisa akses `localhost` komputer Anda. Pilihan:
- **Demo lokal** (paling mudah untuk skripsi): jalankan `bun dev` + `cd server && npm run dev` di komputer Anda
- **Deploy server ke Railway** nanti, lalu ubah `VITE_API_URL` ke URL Railway

## File yang akan diubah

- `server/.env.example` (isi default Lovable Cloud)
- `server/package.json` (script `check`)
- `server/scripts/check-connection.ts` (baru)
- `server/README.md` (panduan step-by-step bahasa Indonesia)
- mungkin `src/lib/expressApi.ts` (kalau ada bug fallback)

## Tidak akan diubah

- Skema database Supabase
- Tabel `tweets`, `profiles`, `user_roles`
- Auth flow di frontend
- File `src/integrations/supabase/client.ts`

Setujui plan ini supaya saya implementasi.
