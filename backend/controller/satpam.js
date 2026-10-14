import {
  createSatpamModel,
  getAllSatpamModel,
  getSatpamByIdModel,
  deleteSatpamModel,
  getSatpamByName,
} from "../model/satpam.js";
import { deletePhotos, parsePhotoUrls } from "../utils/cloudinary.js";

export const getAllSatpam = async (req, res) => {
  const { search } = req.query;

  try {
    const semuaSatpam = await getAllSatpamModel(search);

    return res.status(200).json({
      status: "Sukses mengambil semua data satpam",
      data: semuaSatpam,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getSatpamById = async (req, res) => {
  try {
    const satpamId = req.params.id;

    const satpam = await getSatpamByIdModel(satpamId);

    if (!satpam) {
      return res.status(404).json({
        status: "error",
        message: "Satpam tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: `Sukses mengambil data ${satpam.nama_satpam}`,
      data: satpam,
    });
  } catch (error) {
    return res.status(500).json({
      status: error.status,
      message: error.message,
    });
  }
};

export const createSatpam = async (req, res) => {
  try {
    const data = req.body;

    // Foto KTA sudah di-upload ke Cloudinary, yang dikirim ke sini hanya URL-nya
    const fotoUrls = parsePhotoUrls(data.foto, "satpam");
    if (!fotoUrls) {
      return res
        .status(400)
        .json({ status: "error", message: "Foto tidak valid." });
    }

    const fotoString = JSON.stringify(fotoUrls);

    const dataLaporan = {
      nama_satpam: data.nama_satpam,
      KTA: fotoString,
    };

    const newSatpamId = await createSatpamModel(dataLaporan);

    return res.status(201).json({
      status: "success",
      message: "Identitas satpam berhasil dibuat",
      data: {
        id: newSatpamId,
        ...dataLaporan,
        KTA: fotoUrls,
      },
    });
  } catch (error) {
    console.error("Error saat membuat laporan:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

export const deleteSatpam = async (req, res) => {
  try {
    const satpamId = req.params.id;
    const satpam = await getSatpamByIdModel(satpamId);

    if (!satpam) {
      return res.status(404).json({
        status: "error",
        message: "Satpam tidak ditemukan",
      });
    }

    await deletePhotos(satpam.KTA);

    const deletedRows = await deleteSatpamModel(satpamId);
    if (deletedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Satpam tidak ditemukan untuk dihapus",
      });
    }
    return res.status(200).json({
      status: "success",
      message: `Satpam dengan ID ${satpamId} berhasil dihapus`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
