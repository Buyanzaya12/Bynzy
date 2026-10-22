import { getColors } from "../controller/admin/color";
import express, { Request, Response } from "express";
import { adminMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// ADMIN ONLY
router.use(adminMiddleware);
router.get("/", getColors);

export default router;
