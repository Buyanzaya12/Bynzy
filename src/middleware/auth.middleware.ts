import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("=== ADMIN MIDDLEWARE ===");
    console.log(req.method);
    console.log(req.originalUrl);
    console.log(req.headers.authorization);
    console.log("==========");
    console.log(req.method, req.originalUrl);
    console.log("Authorization:", req.headers.authorization);
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };

    console.log("DECODED:", decoded);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);

    return res.status(401).json({
      error: "Unauthorized",
      details: err instanceof Error ? err.message : err,
    });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("ADMIN HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      role: string;
    };

    console.log("ADMIN DECODED:", decoded);

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({
        error: "Admin only access",
        role: decoded.role,
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("ADMIN ERROR:", err);

    return res.status(401).json({
      error: "Unauthorized",
      details: err instanceof Error ? err.message : err,
    });
  }
};
