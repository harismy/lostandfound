import express from "express";
import auth from "../middleware/auth.js";
import { createUploadSignature, PHOTO_FOLDERS } from "../utils/cloudinary.js";

const router = express.Router();

// Tanda tangan untuk upload foto langsung dari browser ke Cloudinary
router.get("/upload/signature", [auth], (req, res) => {
  const { folder } = req.query;

  if (!PHOTO_FOLDERS.includes(folder)) {
    return res
      .status(400)
      .json({ status: "error", message: "Folder upload tidak valid." });
  }

  return res
    .status(200)
    .json({ status: "success", data: createUploadSignature(folder) });
});

export default router;
