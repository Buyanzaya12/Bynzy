import express from "express";
import { register, login, getProfile, updateProfile } from "../controller/auth";
import { AuthRequest } from "../middleware/auth.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;
