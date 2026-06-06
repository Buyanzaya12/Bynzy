import express from "express";

import {
  createProductUnit,
  deleteProductUnit,
  getProductUnitById,
  getProductUnits,
  updateProductUnit,
} from "../controller/admin/productunit";

const router = express.Router();

router.post("/", createProductUnit);

router.get("/", getProductUnits);

router.get("/:id", getProductUnitById);

router.put("/:id", updateProductUnit);

router.delete("/:id", deleteProductUnit);

export default router;
