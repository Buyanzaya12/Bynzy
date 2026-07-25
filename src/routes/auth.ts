import express from "express";
import { register, login, getProfile, updateProfile } from "../controller/auth";
import { AuthRequest } from "../middleware/auth.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { resetPassword } from "../controller/auth";
import { forgotPassword } from "../controller/auth";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile", authMiddleware, updateProfile);

export default router;
