import express from "express";
import {
  getProducts,
  getProductByCode,
  addProduct,
  updateProduct,
  deleteProduct,
  permanentlyDeleteProduct,
} from "../controller/admin/product"; // adjust path if needed
import { searchProducts } from "../controller/user/search";

const router = express.Router();

// 🔓 PUBLIC
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:code", getProductByCode);

// 🔒 ADMIN (later you can add middleware)
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/permanent/:id", permanentlyDeleteProduct);

export default router;
