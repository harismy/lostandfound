# Sistem 'Lost and Found' KEMA UKRI

Platform sederhana buatan mahasiswa Teknik Informatika UKRI untuk melaporkan barang hilang atau mengumumkan barang temuan di area kampus.

## Struktur

```
/            → Frontend (React + Vite)
/backend     → Backend (Express + MySQL), API di /api/v1
```

## Menjalankan di lokal

```bash
# Backend
cd backend
cp .env.example .env   # lalu isi nilainya
npm install
npm run dev            # http://localhost:3000

# Frontend (terminal lain, dari root)
npm install
npm run dev            # http://localhost:5173
```

## Deploy ke cPanel (Diantara)

Frontend di `https://postemu.id`, backend di `https://api.postemu.id`.

### 1. Database

1. **MySQL® Databases** → buat database dan user, lalu tambahkan user ke database dengan **ALL PRIVILEGES**. Nama database dan user otomatis diberi awalan nama akun cPanel, misalnya `akun_lostandfound`.
2. **phpMyAdmin** → pilih database tersebut, buka tab **Import**, lalu pilih `backend/database/schema.sql`. File ini membuat tabel `User`, `Satpam`, `Barang`, dan `KonfirmasiPengambilan` dalam keadaan kosong.
3. Akun satpam dibuat dengan register seperti biasa. Setelah itu, di phpMyAdmin ubah kolom `role` akun tersebut di tabel `User` menjadi `Satpam`.

### 2. Backend (`api.postemu.id`)

1. **Domains** → **Create A New Domain** → `api.postemu.id`. Pastikan SSL-nya sudah aktif di **SSL/TLS Status**.
2. Zip isi folder `backend/` (tanpa `node_modules`), upload lewat **File Manager**, lalu **Extract** ke folder `lostandfound-api` di home, di luar `public_html`. Jangan zip dengan PowerShell 5 `Compress-Archive` atau `tar`, karena permission file atau struktur foldernya bisa rusak di server.
3. Di folder `lostandfound-api`, buat file `.env` berdasarkan `.env.example`, lalu ubah permission-nya menjadi `0600`:
   - `MYSQL_HOST=localhost` dan `MYSQL_SSL=false`
   - `MYSQL_USER`, `MYSQL_PASSWORD`, dan `MYSQL_DATABASE` dari langkah 1
   - `CLIENT_URL_PROD=https://postemu.id` (tanpa `/` di akhir)
   - `ACCESS_TOKEN_SECRET` dan `REFRESH_TOKEN_SECRET`: isi dengan teks acak dari `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET` dari Cloudinary (**Settings → API Keys**)
4. **Application Manager** → **Register Application**:
   - Application Name: `lostandfound-api`
   - Deployment Domain: `api.postemu.id`
   - Base Application URL: `/`
   - Application Path: `lostandfound-api`
   - Deployment Environment: `Production`

   Lalu klik **Deploy**. Startup file-nya otomatis `app.js`.
5. Di daftar aplikasi, klik **Ensure dependencies** untuk menjalankan `npm install`. Di server Diantara langkah ini gagal, jadi zip folder `node_modules` dari laptop lalu extract ke `lostandfound-api`. Semua dependency di sini JavaScript murni, kecuali `bcrypt` yang sudah membawa binary Linux, jadi hasil install di Windows tetap jalan di server.
6. Buka `https://api.postemu.id`. Jika berhasil, muncul tulisan *Welcome to the Lost and Found API!!*

**Restart** setelah mengubah file: buat folder `lostandfound-api/tmp`, lalu buat atau ubah file `tmp/restart.txt`. **Log error** ada di `lostandfound-api/logs/`.

**Foto** di-upload langsung dari browser ke Cloudinary (`lostandfound/barang`, `lostandfound/konfirmasi`, `lostandfound/satpam`). API hanya menerima URL-nya, karena Passenger di hosting ini menggantung untuk request di atas 128 KB.

### 3. Frontend (`postemu.id`)

1. `VITE_API_URL` sudah diatur di `.env.production`.
2. Build: `npm install && npm run build`
3. Upload **isi** folder `dist/` ke `public_html`, termasuk file `.htaccess`. Aktifkan *Show Hidden Files* di File Manager supaya file itu terlihat.

`.htaccess` memaksa pengunjung ke `https://postemu.id` (https, tanpa `www`) supaya origin-nya selalu sama dengan `CLIENT_URL_PROD` dan tidak diblokir CORS. Folder subdomain `public_html/api.postemu.id` ikut membaca file ini, jadi baris paling atasnya menghentikan semua aturan untuk domain selain `postemu.id`. Jangan dihapus, atau semua request API akan error 500.

### Troubleshooting

| Gejala | Penyebab / solusi |
| --- | --- |
| Log berisi `ERR_REQUIRE_ESM` | Node.js di server lebih lama dari 20.19. Minta support memasang `ea-nodejs22`. |
| `http://api.postemu.id` jalan, tapi versi `https` tidak | Konfigurasi SSL Passenger belum dibuat. Minta support menyalin conf aplikasi dari `userdata/std` ke `userdata/ssl`, lalu rebuild httpd. |
| `Ensure dependencies` gagal | Upload `node_modules` dari laptop (lihat langkah 5). |
| Request dari frontend kena CORS | Pastikan `CLIENT_URL_PROD` persis `https://postemu.id`, lalu restart aplikasi. |
| Semua path API selain `/` error 500 dari Apache | `.htaccess` di `public_html` tidak memakai versi dari `public/.htaccess`. |
| Request ke API menggantung kalau body di atas 128 KB | Masalah buffer Passenger di server. Jangan kirim file lewat API, upload ke Cloudinary. |

### Catatan

- Cron kedaluwarsa barang (`node-cron`) hanya jalan selama aplikasi aktif. Passenger bisa mematikan aplikasi saat tidak ada pengunjung.
- Untuk development lokal, isi `CLOUDINARY_*` di `backend/.env` juga, karena upload foto selalu lewat Cloudinary.
