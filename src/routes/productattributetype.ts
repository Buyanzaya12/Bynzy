import express from "express";

import {
  createProductAttributeType,
  getProductAttributeTypes,
  getProductAttributeTypeById,
  updateProductAttributeType,
  deleteProductAttributeType,
} from "../controller/admin/productattributetype";

const router = express.Router();

router.post("/", createProductAttributeType);

router.get("/", getProductAttributeTypes);

router.get("/:id", getProductAttributeTypeById);

router.put("/:id", updateProductAttributeType);

router.delete("/:id", deleteProductAttributeType);

export default router;
