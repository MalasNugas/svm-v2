## Tujuan
Tambahkan tombol **"Hapus Semua Dataset"** di halaman `/dataset` untuk admin, agar bisa mengosongkan seluruh tabel `tweets` dalam satu klik (dengan konfirmasi).

## Perubahan

**`src/pages/Dataset.tsx`** (hanya file ini):
1. Tambah tombol merah **"Hapus Semua"** di header, sebelah tombol Import/Download PDF — hanya tampil kalau `isAdmin`.
2. Tambah state `deleteAllOpen` + `AlertDialog` konfirmasi terpisah yang menampilkan jumlah total baris (`total`) dan warning bahwa tindakan tidak bisa dibatalkan. Butuh user mengetik `HAPUS` di input sebagai safety check sebelum tombol konfirmasi aktif.
3. Handler `handleDeleteAll`: jalankan `supabase.from("tweets").delete().not("id", "is", null)` (Supabase butuh filter, ini match semua baris), lalu toast sukses, reset ke page 1, dan reload data.

## Catatan
- RLS policy `Tweets: admins delete` yang sudah ada sudah mengizinkan admin menghapus semua baris — tidak perlu migrasi DB.
- Tidak mengubah dataset, split logic, atau halaman lain.
- Setelah dihapus, halaman Dashboard/Reports otomatis kosong sampai admin import data baru.
