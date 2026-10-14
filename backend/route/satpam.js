import express from "express";
import {
  createSatpam,
  deleteSatpam,
  getAllSatpam,
  getSatpamById,
} from "../controller/satpam.js";

const router = express.Router();

router.get("/satpam", getAllSatpam);
router.get("/satpam/:id", getSatpamById);
router.post("/satpam", createSatpam);
router.delete("/satpam/:id", deleteSatpam);

export default router;
