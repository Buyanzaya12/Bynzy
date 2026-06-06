import { Router } from "express";
import {
  addBrand,
  getBrands,
  deleteBrand,
  updateBrand,
} from "../controller/admin/brand";
import multer from "multer";

import { addCategory, getCategories } from "../controller/admin/category";

import { addColor, getColors } from "../controller/admin/color";

import { addType, getTypes } from "../controller/admin/type";

import { addProduct } from "../controller/admin/product";
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

router.get("/category", getCategories);

// COLOR
router.post("/color", addColor);
router.get("/color", getColors);

// TYPE
router.post("/type", addType);
router.get("/type", getTypes);

// PRODUCT
router.post("/product", addProduct);

export default router;
