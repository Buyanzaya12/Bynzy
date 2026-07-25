import express from "express";
import {
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controller/admin/category";

const router = express.Router();

router.get("/", getCategories);
router.delete("/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;
