import express from "express";

import {
  createProductAttribute,
  deleteProductAttribute,
  getProductAttributeById,
  getProductAttributes,
  updateProductAttribute,
} from "../controller/admin/productattribute";

const router = express.Router();

router.post("/", createProductAttribute);

router.get("/", getProductAttributes);

router.get("/:id", getProductAttributeById);

router.put("/:id", updateProductAttribute);

router.delete("/:id", deleteProductAttribute);

export default router;