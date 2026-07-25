import { Router } from "express";
import {
  addBrand,
  getBrands,
  deleteBrand,
  updateBrand,
} from "../controller/admin/brand";
import multer from "multer";

import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "../controller/admin/category";

import { addColor, getColors } from "../controller/admin/color";

import { addType, getTypes, deleteType, updateType } from "../controller/admin/type";

import {
  addProduct,
  deleteProduct,
  getProducts,
} from "../controller/admin/product";
import { adminMiddleware } from "../middleware/auth.middleware";
import { register, login } from "../controller/auth";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});
// 🔐 ALL ADMIN ROUTES PROTECTED
router.use(adminMiddleware);

// BRAND
router.post("/brand", addBrand);
router.get("/brand", getBrands);
router.delete("/brand/:id", deleteBrand);
router.put("/brand/:id", updateBrand);

// CATEGORY
router.post("/category", addCategory);
router.put("/category/:id", updateCategory);
router.get("/category", getCategories);
router.delete("/category/:id", deleteCategory);

// COLOR
router.post("/color", addColor);
router.get("/color", getColors);

// TYPE
router.post("/type", addType);
router.get("/type", getTypes);
router.delete("/type/:id", deleteType);
router.put("/type/:id", updateType);

// PRODUCT
router.post("/product", addProduct);
router.get("/product", getProducts);
router.delete("/product/:id", deleteProduct);

export default router;
