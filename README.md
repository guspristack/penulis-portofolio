# Nara Adinata · Portofolio Penulis

Proyek portofolio full-stack untuk persona fiktif dari seri Ruang Karya karya GuspriStack.

[Lihat demo desain di GuspriStack Showcase](https://showcase.guspriaman.com/portofolio/editorial/)

## Fitur

- Portofolio editorial dengan daftar esai dan halaman baca.
- Editor esai dengan draf, revisi, dan publikasi.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Bahasa | TypeScript, HTML, dan CSS |
| Frontend | React, Vite, dan CSS Modules |
| Backend | Node.js 24 dan Express |
| Database | PostgreSQL dan Prisma ORM |

## Coba secara lokal

Siapkan Node.js 24 dan database PostgreSQL lokal. Salin [.env.example](.env.example) ke `.env` dan isi koneksi database, rahasia sesi acak, serta kredensial admin lokal. Gunakan kata sandi admin dengan minimal 16 karakter.

```sh
npm ci
npm run db:migrate
npm run db:seed
npm run admin:provision
npm run dev
```

Buka [portofolio lokal](http://127.0.0.1:5175/) atau [panel admin](http://127.0.0.1:5175/admin). Simpan konfigurasi asli di `.env` dan data privat seperti ekspor database atau unggahan pribadi di luar repositori atau di folder `.local/`.

## Kredit

- Pemilik dan pengembang proyek — [guspriaman](https://guspriaman.com/).
- Studio pengembang — [GuspriStack](https://github.com/guspristack).
- Materi contoh dari prototipe Ruang Karya — Desain editorial, potret generatif, foto sampul, dan esai contoh.

## Lisensi

Kode dan materi contoh orisinal milik guspriaman tersedia di bawah [PolyForm Noncommercial License 1.0.0](LICENSE). Anda boleh menggunakan, memodifikasi, dan membagikan materi tersebut untuk tujuan nonkomersial sesuai lisensi, dengan menyertakan [pemberitahuan hak cipta](NOTICE).

Penjualan proyek atau versi modifikasinya, distribusi berbayar, dan penggunaan komersial memerlukan izin tertulis dari guspriaman. Dependensi dan aset pihak ketiga mengikuti lisensinya masing-masing.
