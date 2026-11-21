# Nara Adinata · Portofolio Penulis

Portofolio full-stack dengan desain editorial satu halaman dan studio untuk menulis, menyunting, dan menerbitkan esai. Nara Adinata adalah persona fiktif dari galeri Ruang Karya.

## Pengelolaan esai

- Pemilik masuk ke `/admin` untuk membuat draf, menyunting naskah Markdown, dan melihat pratinjau.
- **Simpan draf** menyimpan versi kerja. Jika esai sudah terbit, pengunjung masih melihat versi terbit sebelumnya.
- **Terbitkan esai** atau **Terbitkan revisi** memperbarui versi publik, yang bisa dibuka lewat alamat tetap `/?artikel=slug`.
- **Tarik publikasi** menghapus tulisan dari akses publik dan menyimpan drafnya di studio.
- Pengunjung bisa menyaring kategori dan membagikan tautan tulisan tanpa akun.

Frontend memakai React, Vite, TypeScript, CSS Modules, dan React Markdown. Backend memakai Express, Prisma, dan PostgreSQL. Sesi admin dan kedua versi esai disimpan di PostgreSQL.

## Menjalankan secara lokal

1. Siapkan Node.js 24 dan database PostgreSQL yang dapat dimigrasikan aplikasi.
2. Salin `.env.example` menjadi `.env`. Isi `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, dan `ADMIN_PASSWORD`. Gunakan kata sandi unik minimal 16 karakter. Buat rahasia sesi acak dengan perintah berikut.

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Jalankan instalasi dan persiapan database.

   ```sh
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run admin:provision
   npm run dev
   ```

Untuk mode pengembangan, buka [portofolio](http://127.0.0.1:5175/) atau [studio admin](http://127.0.0.1:5175/admin). Perintah `db:seed` menyediakan tiga esai contoh dan melewati slug yang sudah ada. `admin:provision` membuat atau mengganti akun admin serta mengakhiri sesi sebelumnya. Setelah provisioning, kredensial admin dapat dikeluarkan dari konfigurasi runtime.

## Menjalankan hasil build

Untuk hasil build lokal, atur `APP_ORIGIN=http://127.0.0.1:4175`, lalu jalankan `npm run build` dan `npm start`. Express melayani frontend dan API pada origin yang sama. Untuk hosting, gunakan `APP_ORIGIN` sesuai origin HTTPS publik dan sesuaikan `HOST`, `PORT`, serta `TRUST_PROXY_HOPS` dengan konfigurasi layanan.

## Kredit

- Pengembangan oleh [guspriaman](https://github.com/guspriaman) untuk [guspriStack](https://github.com/guspristack).
- Desain editorial, potret generatif, foto sampul, dan tulisan contoh berasal dari prototipe Ruang Karya. Kredit penulisan per esai menggunakan persona fiktif Nara Adinata.
