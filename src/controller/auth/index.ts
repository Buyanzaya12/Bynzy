import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { error } from "node:console";
import { AuthRequest } from "../../middleware/auth.middleware";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

/**
 * =========================
 * REGISTER
 * =========================
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user_auth.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User created",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    if (error.code === "P2002") {
      return res.status(400).json({ error: "User already exists" });
    }

    return res.status(500).json({
      error: error.message || "Register failed",
    });
  }
};

/**
 * =========================
 * LOGIN
 * =========================
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user_auth.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        username: user.username, // ✅ IMPORTANT FIX
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: error.message || "Login failed",
    });
  }
};
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user_auth.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return res.json({ data: user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * =========================
 * UPDATE PROFILE
 * =========================
 */
export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { username, email, avatar } = req.body;

    const updated = await prisma.user_auth.update({
      where: { id: userId },
      data: {
        username,
        email,
        avatar, // 👈 just save URL
      },
    });

    res.json({
      message: "Profile updated",
      data: updated,
    });
  } catch (error: any) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};
