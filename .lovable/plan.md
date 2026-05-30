## Tujuan
Menambahkan kemampuan menghapus beberapa data sekaligus (bulk delete) pada halaman Dataset, khusus untuk pengguna dengan role **admin** (sesuai RLS yang sudah ada).

## Perubahan UI (`src/pages/Dataset.tsx`)

1. **Kolom checkbox** di tabel:
   - Tambah checkbox pada header (select all di halaman aktif).
   - Tambah checkbox pada setiap baris data.
   - State baru: `selectedIds: Set<string>`.

2. **Action bar** muncul saat ada minimal 1 baris terpilih:
   - Menampilkan jumlah terpilih, misal "3 data dipilih".
   - Tombol **Hapus Terpilih** (merah, ikon `delete`).
   - Tombol **Batal** untuk membersihkan seleksi.
   - Hanya muncul untuk admin (pakai `useRole`).

3. **Konfirmasi hapus** pakai `AlertDialog` (sudah ada di `components/ui/alert-dialog.tsx`):
   - Judul: "Hapus data terpilih?"
   - Deskripsi: "Anda akan menghapus N data. Tindakan ini tidak bisa dibatalkan."
   - Aksi: Batal / Hapus.

## Logika Hapus

- Gunakan `supabase.from("tweets").delete().in("id", [...selectedIds])`.
- RLS `Tweets: admins delete` sudah mengizinkan admin → tidak perlu migrasi DB.
- Setelah sukses: toast sukses, reset `selectedIds`, reload data (`loadData()`), reset ke halaman 1 jika halaman saat ini jadi kosong.
- Tangani error dengan toast destructive.

## Detail Teknis

- Import: `Checkbox` dari `@/components/ui/checkbox`, komponen `AlertDialog*`, `useRole`.
- Tampilkan kolom checkbox hanya untuk admin; researcher tetap melihat tampilan lama.
- Grid baris diubah dari `grid-cols-12` menjadi `grid-cols-[40px_repeat(12,minmax(0,1fr))]` (atau tambah kolom kecil di depan) saat admin, agar layout tidak rusak.
- Tidak ada perubahan backend / migrasi / file lain.

## Out of Scope
- Hapus semua data lintas halaman (hanya yang ter-select).
- Perubahan permission/role.
