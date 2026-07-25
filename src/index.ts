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
import audienceRoutes from "./routes/audience";
import favRoutes from "./routes/fav";
import homesectionRoutes from "./routes/homesection";
import productattributeRoutes from "./routes/productattribute";
import productattributetypeRoutes from "./routes/productattributetype";
import productavailabilityRoutes from "./routes/productavailability";
import productunitRoutes from "./routes/productunit";
import cartRoutes from "./routes/cart";

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
app.use("/audience", audienceRoutes);
app.use("/fav", favRoutes);
app.use("/homesection", homesectionRoutes);
app.use("/productattribute", productattributeRoutes);
app.use("/productavailability", productavailabilityRoutes);
app.use("/productattributetype", productattributetypeRoutes);
app.use("/productunit", productunitRoutes);
app.use("/cart", cartRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ START SERVER (ALWAYS LAST)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
