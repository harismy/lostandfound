-- Struktur database Lost and Found (MySQL 8 / MariaDB).
-- Disusun dari query di backend/model dan backend/controller.
-- Import lewat phpMyAdmin: pilih database, buka tab Import, pilih file ini.
-- Nama tabel huruf besar-kecilnya harus persis seperti di bawah (MySQL di Linux case-sensitive).

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `User` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `npm` VARCHAR(20) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `program_studi` VARCHAR(100) DEFAULT NULL,
  -- 'Mahasiswa' atau 'Satpam'
  `role` VARCHAR(20) NOT NULL DEFAULT 'Mahasiswa',
  `no_hp` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_user_npm` (`npm`),
  UNIQUE KEY `uk_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Satpam` (
  `satpam_id` INT NOT NULL AUTO_INCREMENT,
  `nama_satpam` VARCHAR(100) NOT NULL,
  -- JSON array URL foto KTA (Cloudinary)
  `KTA` TEXT DEFAULT NULL,
  PRIMARY KEY (`satpam_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Barang` (
  `id_barang` INT NOT NULL AUTO_INCREMENT,
  `judul_laporan` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT DEFAULT NULL,
  `lokasi` VARCHAR(255) DEFAULT NULL,
  `tanggal` DATETIME DEFAULT NULL,
  -- JSON array URL foto (Cloudinary)
  `foto` TEXT DEFAULT NULL,
  -- 'hilang', 'ditemukan', atau 'selesai'
  `tipe_laporan` VARCHAR(20) NOT NULL,
  -- 'masih dicari', 'sudah selesai', atau 'kadaluarsa'
  `status` VARCHAR(20) NOT NULL DEFAULT 'masih dicari',
  `tanggal_kadaluarsa` DATETIME DEFAULT NULL,
  `id_satpam` INT DEFAULT NULL,
  `id_user` INT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_barang`),
  KEY `idx_barang_user` (`id_user`),
  KEY `idx_barang_satpam` (`id_satpam`),
  CONSTRAINT `fk_barang_user` FOREIGN KEY (`id_user`) REFERENCES `User` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_barang_satpam` FOREIGN KEY (`id_satpam`) REFERENCES `Satpam` (`satpam_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `KonfirmasiPengambilan` (
  `id_konfirmasi` INT NOT NULL AUTO_INCREMENT,
  `id_barang` INT NOT NULL,
  `nama_pengambil` VARCHAR(100) NOT NULL,
  `npm_pengambil` VARCHAR(20) DEFAULT NULL,
  `prodi_pengambil` VARCHAR(100) DEFAULT NULL,
  `no_hp_pengambil` VARCHAR(20) DEFAULT NULL,
  -- JSON array URL foto bukti (Cloudinary)
  `foto_bukti` TEXT DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `waktu_pengambilan` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_konfirmasi`),
  -- Satu barang hanya bisa dikonfirmasi diambil sekali
  UNIQUE KEY `uk_konfirmasi_barang` (`id_barang`),
  CONSTRAINT `fk_konfirmasi_barang` FOREIGN KEY (`id_barang`) REFERENCES `Barang` (`id_barang`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
