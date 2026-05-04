import express from "express";
import {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controller/admin/product"; // adjust path if needed

const router = express.Router();

// 🔓 PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById);

// 🔒 ADMIN (later you can add middleware)
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
