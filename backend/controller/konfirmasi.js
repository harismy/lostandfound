import {
  createKonfirmasiModel,
  getAllKonfirmasiBarangModel,
  getKonfirmasiBarangByIdModel,
} from "../model/konfirmasi.js";
import { getBarangByIdModel, updateBarangModel } from "../model/barang.js";
import { getSatpamByIdModel } from "../model/satpam.js";
import { parsePhotoUrls } from "../utils/cloudinary.js";

// --- Main Controller ---
export const getAllKonfirmasiBarang = async (req, res) => {
  const { search } = req.query;

  try {
    const semuaKonfirmasiBarang = await getAllKonfirmasiBarangModel(search);

    return res.status(200).json({
      status: "success",
      message: "Sukses mengambil semua data satpam",
      data: semuaKonfirmasiBarang,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getKonfirmasiBarangById = async (req, res) => {
  try {
    const confirmId = req.params.id;

    const confirm = await getKonfirmasiBarangByIdModel(confirmId);

    if (!confirm) {
      return res.status(404).json({
        status: "error",
        message: "barang yang terkonfirmasi tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: `Sukses mengambil data barang dengan id ${confirm.id_konfirmasi}`,
      data: confirm,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const createKonfirmasi = async (req, res) => {
  const { id_barang } = req.params;
  const user = req.user;
  const data = req.body;

  try {
    const barang = await getBarangByIdModel(id_barang);
    if (!barang) {
      return res
        .status(404)
        .json({ status: "error", message: "Barang tidak ditemukan" });
    }

    if (barang.status === "sudah selesai") {
      return res.status(400).json({
        status: "error",
        message: "Barang ini sudah diambil sebelumnya.",
      });
    }

    const satpam = await getSatpamByIdModel(user);

    if (!satpam) {
      return res.status(403).json({
        status: "Akses ditolak!!",
        message: "Hanya satpam yang berhak mengkonfirmasi!!",
      });
    }

    // Foto sudah di-upload frontend ke Cloudinary, yang dikirim ke sini hanya URL-nya
    const fotoUrls = parsePhotoUrls(data.foto, "konfirmasi");
    if (!fotoUrls) {
      return res
        .status(400)
        .json({ status: "error", message: "Foto tidak valid." });
    }
    if (fotoUrls.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Foto bukti pengambilan wajib diupload.",
      });
    }

    const dataKonfirmasi = {
      id_barang: id_barang,
      nama_pengambil: data.nama_pengambil,
      npm_pengambil: data.npm_pengambil,
      prodi_pengambil: data.prodi_pengambil,
      no_hp_pengambil: data.no_hp_pengambil,
      foto_bukti: JSON.stringify(fotoUrls),
      catatan: data.catatan,
    };

    await createKonfirmasiModel(dataKonfirmasi);

    return res.status(201).json({
      status: "success",
      message: "Sipp, terimakasih pak satpam sudah konfirmasi!!",
      data: dataKonfirmasi,
    });
  } catch (error) {
    console.error("Error konfirmasi:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateStatusBarang = async (req, res) => {
  const user = req.user;
  const { id_barang, status, tipe_laporan } = req.body;

  if (!id_barang) {
    return res
      .status(400)
      .json({ status: "error", message: "ID Barang wajib ada." });
  }
  if (!status) {
    return res
      .status(400)
      .json({ status: "error", message: "Status baru wajib ada." });
  }

  try {
    const barang = await getBarangByIdModel(id_barang);
    if (!barang) {
      return res
        .status(404)
        .json({ status: "error", message: "Barang tidak ditemukan" });
    }

    if (status === "sudah selesai" && barang.id_user !== user) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak berhak mengkonfirmasi barang ini.",
      });
    }

    const dataUpdate = {
      ...barang,
      status,
      tipe_laporan,
    };

    const affectedRows = await updateBarangModel(id_barang, dataUpdate);

    if (affectedRows === 0) {
      return res.status(400).json({
        status: "error",
        message: "Gagal mengupdate status, tidak ada perubahan data.",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Yeayyy, selamat barang kamu sudah kembali!!",
      data: {
        id_barang,
        ...dataUpdate,
      },
    });
  } catch (error) {
    console.error("Error update status:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
