import { getBrands } from "../controller/admin/brand";
import express, { Request, Response } from "express";
import { adminMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// ADMIN ONLY
router.use(adminMiddleware);
router.get("/", getBrands);

export default router;
