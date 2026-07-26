## Situasi

Commit sudah masuk ke GitHub dan Vercel menampilkan deployment berstatus **Ready**, tapi halaman `/tourism` di URL Vercel masih menampilkan 5 destinasi lama. Karena build sukses, penyebabnya hampir pasti bukan error kode — melainkan salah satu dari: deployment yang Ready adalah **Preview** (bukan Production), commit yang di-build bukan commit Tourism, atau cache browser/CDN.

Isi kode sendiri statis di `src/pages/Tourism.tsx` (array 20 destinasi, tidak ambil dari database), jadi begitu bundel yang benar terbit, isinya pasti ikut berubah.

## Langkah pengecekan (urut, berhenti di yang cocok)

1. **Buka deployment yang Ready di Vercel** dan lihat label di sampingnya:
   - Bertulis **Production** → lanjut ke langkah 2.
   - Bertulis **Preview** → commit masuk ke branch non-production. Perbaiki di Settings → Git → Production Branch (samakan dengan branch yang dipakai Lovable, biasanya `main`), lalu Redeploy.
2. **Klik "Source" / hash commit pada deployment** dan bandingkan dengan hash commit Tourism di GitHub. Kalau berbeda, Vercel membangun commit lama → tekan **Redeploy** pada commit terbaru, dan **matikan "Use existing Build Cache"**.
3. **Buka URL deployment spesifik** (`xxx-abc123.vercel.app`, bukan domain utama). Kalau di URL ini 20 destinasi muncul tapi di domain utama tidak, berarti deployment belum dipromosikan ke Production → gunakan **Promote to Production**.
4. **Uji cache browser**: buka domain produksi dengan hard refresh (Ctrl/Cmd + Shift + R) atau mode incognito. `index.html` kadang tertahan di cache lokal.
5. **Cek Root Directory** di Settings → General. Harus kosong (root repo), bukan subfolder seperti `server`. Salah root membuat build sukses tapi menerbitkan aplikasi yang keliru.
6. **Cek isi build di Vercel → Deployment → Source**: pastikan `src/pages/Tourism.tsx` di sana sudah berisi Pulau Rinca, Manta Point, dsb., dan folder `src/assets` punya `dest-rinca.jpg`, `dest-mantapoint.jpg`.

## Yang saya lakukan di sisi kode

- Verifikasi ulang bahwa `src/pages/Tourism.tsx` dan seluruh 20 file `dest-*.jpg` ada dan ter-commit di project Lovable.
- Menambahkan penanda versi ringan (komentar build marker) supaya commit berikutnya mudah dibedakan dan bisa dipakai memastikan Vercel benar-benar membangun kode terbaru.

## Catatan

- Variabel `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` tetap perlu diisi di Vercel → Settings → Environment Variables (file `.env` tidak ikut ter-commit). Ini tidak memengaruhi halaman Tourism, tapi memengaruhi Dashboard/Reports.
- Alternatif tercepat kalau Vercel tetap bermasalah: publish langsung dari Lovable untuk mendapat URL live tanpa perantara GitHub.
