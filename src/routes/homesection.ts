import express from "express";

import {
  createHomeSection,
  deleteHomeSection,
  getHomeSectionById,
  getHomeSections,
  updateHomeSection,
} from "../controller/admin/homesection";

const router = express.Router();

router.post("/", createHomeSection);

router.get("/", getHomeSections);

router.get("/:id", getHomeSectionById);

router.put("/:id", updateHomeSection);

router.delete("/:id", deleteHomeSection);

export default router;