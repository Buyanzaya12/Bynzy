import express from "express";
import { getCategories } from "../controller/admin/category";

const router = express.Router();

router.get("/", getCategories);

export default router;
