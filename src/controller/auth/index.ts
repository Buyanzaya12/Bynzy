import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../../lib/mail";
import crypto from "crypto";

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
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, language } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await prisma.user_auth.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Email is not registered",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "15m",
      },
    );

const lang = (language || "EN").toLowerCase();

const resetLink =
`${process.env.FRONTEND_URL}/${lang}/auth/reset-password?token=${token}`;    await transporter.sendMail({
      from: `"Bynzy" <${process.env.EMAIL_USER}>`,
      to: email,

      subject: "Reset your password",

      html: `
      <div style="font-family:Arial;padding:30px">
        <h2>Password Reset</h2>

        <p>Hello ${user.username},</p>

        <p>You requested to reset your password.</p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:12px 22px;
            background:black;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top:20px;">
          This link expires in 15 minutes.
        </p>
      </div>
      `,
    });

    return res.json({
      message: "Password reset email sent",
    });
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        error: "Missing data",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user_auth.update({
      where: {
        id: decoded.id,
      },
      data: {
        password: hashed,
      },
    });

    return res.json({
      message: "Password updated",
    });
  } catch (err) {
    return res.status(400).json({
      error: "Reset link expired or invalid",
    });
  }
};
