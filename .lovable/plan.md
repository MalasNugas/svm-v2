## Tujuan

Tampilkan kembali menu **Analysis** untuk semua pengunjung (tanpa perlu login). Menu **Dataset** dan **Model Training** tetap admin-only.

## Akses Setelah Perubahan

**Publik (tanpa login):**
- `/`, `/dashboard`, `/analysis`, `/tourism`, `/about`, `/reports`

**Admin only:**
- `/dataset`, `/training`, `/profile`, `/login`

## Perubahan Kode

1. **`src/App.tsx`** — Kembalikan route `/analysis` menjadi publik:
   ```tsx
   <Route path="/analysis" element={<Analysis />} />
   ```

2. **`src/components/AppShell.tsx`**
   - Ubah item nav `Analysis` menjadi `adminOnly: false` agar muncul untuk guest.
   - Tombol "New Analysis" di sidebar dan item "Run new analysis" di dropdown notifikasi kembali ditampilkan untuk semua user (hapus pembungkus `isAdmin && ...`).

3. Tidak ada perubahan database / RLS.
