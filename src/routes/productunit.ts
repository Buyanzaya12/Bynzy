import express from "express";

import {
  createProductAvailability,
  deleteProductAvailability,
  getProductAvailabilityById,
  getProductAvailabilities,
  updateProductAvailability,
} from "../controller/admin/productavailability";

const router = express.Router();

router.post("/", createProductAvailability);

router.get("/", getProductAvailabilities);

router.get("/:id", getProductAvailabilityById);

router.put("/:id", updateProductAvailability);

router.delete("/:id", deleteProductAvailability);

export default router;