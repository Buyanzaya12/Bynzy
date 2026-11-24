import { getBrands } from "../controller/admin/brand";
import express, { Request, Response } from "express";

const router = express.Router();

// ADMIN ONLY
router.get("/", getBrands);

export default router;
