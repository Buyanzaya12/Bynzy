import express from "express";
import { getTypes } from "../controller/admin/type"; // adjust path if needed

const router = express.Router();

// PUBLIC (no middleware needed)
router.get("/", getTypes);

export default router;