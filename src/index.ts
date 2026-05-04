import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import uploadRoute from "./routes/upload";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/category";
import productRoutes from "./routes/product";
import typeRoutes from "./routes/type";

const app = express();

// ✅ MIDDLEWARE
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

// ✅ ROUTES (ALL BEFORE listen)
app.use("/auth", authRoutes);
app.use("/upload", uploadRoute);
app.use("/admin", adminRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/type", typeRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ START SERVER (ALWAYS LAST)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
