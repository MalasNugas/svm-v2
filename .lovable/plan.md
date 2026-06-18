## Tujuan

Pengunjung biasa bisa membuka semua halaman informasi tanpa login. Login hanya diperlukan untuk admin yang mengelola dataset, training, dan reports.

## Pembagian Akses

**Publik (tanpa login):**
- `/` Landing
- `/dashboard` — statistik sentimen
- `/analysis` — analisis sentimen interaktif
- `/tourism` — data pariwisata
- `/about`
- `/reports` — laporan hasil (read-only)

**Admin only (perlu login):**
- `/login`
- `/dataset` — kelola data tweet
- `/training` — training model SVM
- `/profile` — profil admin

## Perubahan Kode

1. **`src/App.tsx`** — Hilangkan `RequireAuth` dari rute publik. Sisakan `RequireAuth + RequireRole(admin)` hanya untuk `/dataset`, `/training`, dan `/profile`.

2. **`src/components/AppShell.tsx`** — Navigasi selalu tampil. Item "Dataset" / "Training" hanya muncul jika user login sebagai admin. Tombol "Login" muncul jika belum login; tombol akun + logout muncul jika sudah login.

3. **`src/pages/Index.tsx` / Landing** — Tombol utama mengarah ke `/dashboard` (publik), bukan `/login`.

4. **Halaman publik yang sebelumnya butuh user** — Hapus asumsi `user` selalu ada (mis. greeting "Welcome back"). Fallback ke teks generik untuk guest.

5. **RLS database `tweets`** — Saat ini policy `SELECT` hanya untuk `authenticated`. Tambahkan policy baca untuk `anon` agar dashboard publik bisa fetch data:
   ```
   CREATE POLICY "Tweets: public read" ON public.tweets
   FOR SELECT TO anon USING (true);
   GRANT SELECT ON public.tweets TO anon;
   ```
   Policy admin write/update/delete tetap.

6. **`/login`** — Tetap ada, tapi hilangkan opsi "Register Account" supaya pengunjung tidak bisa bikin akun researcher. Hanya form sign-in.

7. **`useAuth` / `useRole`** — Tidak diubah; tetap bekerja, hanya konsumennya yang menoleransi `user === null`.

## Catatan

- Akun admin `admin@flores.local` yang sudah dibuat tetap berfungsi.
- Tabel `profiles` & `user_roles` tetap auth-only (tidak diekspos ke anon).
- Tidak ada perubahan pada server Express / Python.
