## Tujuan

Pengunjung tetap bisa membuka website tanpa login. Menu **Dataset**, **Analysis**, dan **Model Training** disembunyikan dan diproteksi — hanya admin yang sudah login yang bisa mengakses.

## Akses Setelah Perubahan

**Publik (tanpa login):**
- `/` Landing
- `/dashboard`
- `/tourism`
- `/about`
- `/reports` (read-only)

**Admin only (perlu login):**
- `/analysis` ← sebelumnya publik, sekarang admin
- `/dataset`
- `/training`
- `/profile`
- `/login`

## Perubahan Kode

1. **`src/App.tsx`** — Bungkus route `/analysis` dengan `RequireAuth + RequireRole(["admin"])`, sama seperti `/dataset` dan `/training`.

2. **`src/components/AppShell.tsx`**
   - Tandai item nav `Analysis` sebagai `adminOnly: true` agar hilang dari sidebar untuk guest/non-admin.
   - Tombol "New Analysis" di sidebar (yang mengarah ke `/analysis`) hanya ditampilkan jika `isAdmin`.
   - Dropdown notifikasi: item "Run new analysis" hanya muncul untuk admin.
   - Top-nav link `Datasets` / `Reports` tetap, tapi tidak menampilkan link admin-only untuk guest.

3. **`src/pages/Dashboard.tsx` / `src/pages/Index.tsx`** — Jika ada tombol/CTA yang mengarah ke `/analysis` atau `/dataset`, tampilkan hanya untuk admin; untuk guest arahkan ke `/dashboard` atau `/tourism`. (Akan diperiksa & disesuaikan saat implementasi.)

4. **Tidak ada perubahan database / RLS.** Policy `tweets` publik-read yang sudah dibuat tetap dipakai untuk dashboard & reports.

## Catatan

- Akun admin `admin@flores.local` tetap berfungsi dan tetap melihat semua menu setelah login.
- Guest yang mencoba mengetik `/analysis`, `/dataset`, atau `/training` di URL akan diarahkan ke `/login`.
