import express from "express";
import {
  createAudience,
  deleteAudience,
  getAudienceById,
  getAudiences,
  updateAudience,
} from "../controller//admin/audience";

const router = express.Router();

router.post("/", createAudience);
router.get("/", getAudiences);
router.get("/:id", getAudienceById);
router.put("/:id", updateAudience);
router.delete("/:id", deleteAudience);

export default router;
